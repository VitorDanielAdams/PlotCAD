namespace PlotCAD.Application.Services.Interfaces
{
    public interface IFieldEncryptionService
    {
        string? Encrypt(string? plaintext);
        string? Decrypt(string? ciphertext);
    }
}
