using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PlotCAD.Application.Services.Interfaces;

namespace PlotCAD.Infrastructure.Service
{
    /// <summary>
    /// Hybrid (RSA-OAEP + AES-256-GCM) field-level encryption service.
    ///
    /// KEY SETUP (run once, outside the application):
    ///
    ///   # 1. Generate RSA-2048 key pair (Linux/macOS/WSL/Git Bash)
    ///   openssl genrsa -out private.pem 2048
    ///   openssl rsa -in private.pem -pubout -out public.pem
    ///
    ///   # 2. Generate a random 32-byte AES data key (DEK) and encrypt it with the RSA public key
    ///   openssl rand -out dek.bin 32
    ///   openssl pkeyutl -encrypt -inkey public.pem -pubin \
    ///     -pkeyopt rsa_padding_mode:oaep -pkeyopt rsa_oaep_md:sha256 -pkeyopt rsa_mgf1_md:sha256 \
    ///     -in dek.bin | base64 -w0
    ///   rm dek.bin
    ///   # Copy the base64 output → appsettings.json → FieldEncryption:EncryptedDataKey
    ///
    ///   # 3. Store secrets
    ///   - FieldEncryption:EncryptedDataKey   → appsettings.json  (safe to commit; it's RSA-encrypted)
    ///   - FieldEncryption:RsaPrivateKeyPem   → user-secrets  OR  env var FIELDENCRYPTION__RSAPRIVATEKEYPEM
    ///                                          (full PEM content of private.pem — NEVER commit)
    ///
    /// Encrypted format stored in DB: "base64(nonce).base64(tag).base64(ciphertext)"
    /// Values that don't match this format are returned as-is (backward-compatible with plain text).
    /// When keys are not configured the service runs in passthrough mode (no-op) and logs a warning.
    /// </summary>
    public sealed class FieldEncryptionService : IFieldEncryptionService, IDisposable
    {
        private readonly AesGcm? _aesGcm;
        private readonly bool _isEnabled;

        public FieldEncryptionService(IConfiguration configuration, ILogger<FieldEncryptionService> logger)
        {
            var section = configuration.GetSection("FieldEncryption");
            var encryptedDataKeyB64 = section["EncryptedDataKey"];
            var rsaPrivateKeyPem = section["RsaPrivateKeyPem"];

            if (string.IsNullOrWhiteSpace(encryptedDataKeyB64) || encryptedDataKeyB64.StartsWith("REPLACE_")
                || string.IsNullOrWhiteSpace(rsaPrivateKeyPem))
            {
                logger.LogWarning(
                    "FieldEncryptionService is running in PASSTHROUGH mode — " +
                    "encryption keys are not configured. " +
                    "Set FieldEncryption:EncryptedDataKey and FieldEncryption:RsaPrivateKeyPem to enable encryption.");
                _isEnabled = false;
                return;
            }

            using var rsa = RSA.Create();
            rsa.ImportFromPem(rsaPrivateKeyPem);

            var encryptedDataKey = Convert.FromBase64String(encryptedDataKeyB64);
            var dataKey = rsa.Decrypt(encryptedDataKey, RSAEncryptionPadding.OaepSHA256);

            _aesGcm = new AesGcm(dataKey, tagSizeInBytes: 16);
            _isEnabled = true;

            logger.LogInformation("FieldEncryptionService initialized with AES-256-GCM.");
        }

        public string? Encrypt(string? plaintext)
        {
            if (!_isEnabled || string.IsNullOrEmpty(plaintext))
                return plaintext;

            var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
            var nonce = new byte[AesGcm.NonceByteSizes.MaxSize]; // 12 bytes, NIST recommended
            RandomNumberGenerator.Fill(nonce);

            var ciphertext = new byte[plaintextBytes.Length];
            var tag = new byte[16];
            _aesGcm!.Encrypt(nonce, plaintextBytes, ciphertext, tag);

            return $"{Convert.ToBase64String(nonce)}.{Convert.ToBase64String(tag)}.{Convert.ToBase64String(ciphertext)}";
        }

        public string? Decrypt(string? ciphertext)
        {
            if (!_isEnabled || string.IsNullOrEmpty(ciphertext))
                return ciphertext;

            // Values that don't match the "nonce.tag.ciphertext" format are returned as-is (plain text legacy data)
            var parts = ciphertext.Split('.');
            if (parts.Length != 3)
                return ciphertext;

            try
            {
                var nonce = Convert.FromBase64String(parts[0]);
                var tag = Convert.FromBase64String(parts[1]);
                var encryptedBytes = Convert.FromBase64String(parts[2]);
                var plaintextBytes = new byte[encryptedBytes.Length];

                _aesGcm!.Decrypt(nonce, encryptedBytes, tag, plaintextBytes);
                return Encoding.UTF8.GetString(plaintextBytes);
            }
            catch (CryptographicException)
            {
                // Tampered or unencrypted value that happened to match the format — return as-is
                return ciphertext;
            }
        }

        public void Dispose() => _aesGcm?.Dispose();
    }
}
