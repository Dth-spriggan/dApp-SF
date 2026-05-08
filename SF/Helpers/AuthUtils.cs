using System.Security.Cryptography;
using System.Text;

namespace SF.Helpers;

public static class AuthUtils
{
    public static string HashPassword(string password)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes);
    }

    public static string BuildAvatar(string? fullName, string email)
    {
        if (!string.IsNullOrWhiteSpace(fullName))
        {
            var initials = string.Concat(
                fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                    .Take(2)
                    .Select(part => char.ToUpperInvariant(part[0])));
            if (!string.IsNullOrWhiteSpace(initials))
            {
                return initials;
            }
        }

        return string.IsNullOrWhiteSpace(email)
            ? "SF"
            : email[..1].ToUpperInvariant();
    }
}
