using System.Net.Http.Headers;
using System.Text.Json;

namespace SF.Services;

public class IpfsPinningService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public IpfsPinningService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_configuration["Nft:Ipfs:PinataJwt"]);

    public async Task<string?> UploadFileAsync(string filePath, string fileName, CancellationToken cancellationToken = default)
    {
        var jwt = _configuration["Nft:Ipfs:PinataJwt"];
        if (string.IsNullOrWhiteSpace(jwt))
        {
            return null;
        }

        using var form = new MultipartFormDataContent();
        await using var stream = File.OpenRead(filePath);
        using var streamContent = new StreamContent(stream);
        streamContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
        form.Add(streamContent, "file", fileName);

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.pinata.cloud/pinning/pinFileToIPFS")
        {
            Content = form
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", jwt);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        await using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var json = await JsonDocument.ParseAsync(responseStream, cancellationToken: cancellationToken);
        var cid = json.RootElement.GetProperty("IpfsHash").GetString();
        return string.IsNullOrWhiteSpace(cid) ? null : $"ipfs://{cid}";
    }
}
