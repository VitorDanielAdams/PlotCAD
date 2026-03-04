using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PlotCAD.Application.Services.Interfaces;

namespace PlotCAD.Infrastructure.Service
{
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
                return ciphertext;
            }
        }

        public void Dispose() => _aesGcm?.Dispose();
    }
}
