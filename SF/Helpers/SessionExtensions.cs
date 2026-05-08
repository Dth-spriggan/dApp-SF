using System.Text.Json;

namespace SF.Helpers;

public static class SessionExtensions
{
    public static void SetJson<T>(this ISession session, string key, T value)
    {
        session.SetString(key, JsonSerializer.Serialize(value));
    }

    public static T? GetJson<T>(this ISession session, string key)
    {
        var raw = session.GetString(key);
        return string.IsNullOrWhiteSpace(raw)
            ? default
            : JsonSerializer.Deserialize<T>(raw);
    }
}
