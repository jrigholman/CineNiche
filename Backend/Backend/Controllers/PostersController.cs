using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

[ApiController]
[Route("api/[controller]")]
public class PostersController : ControllerBase
{
    private readonly BlobContainerClient _containerClient;
    private readonly string _baseUrl;

    public PostersController(IConfiguration config)
    {
        string connectionString = config["AzureBlobStorage:ConnectionString"];
        string containerName = config["AzureBlobStorage:ContainerName"];
        _baseUrl = config["AzureBlobStorage:BaseUrl"];

        _containerClient = new BlobContainerClient(connectionString, containerName);
    }

    [HttpGet]
    public async Task<IActionResult> GetPosters()
    {
        var posterUrls = new List<string>();

        await foreach (var blobItem in _containerClient.GetBlobsAsync())
        {
            posterUrls.Add($"{_baseUrl}{blobItem.Name}");
        }

        return Ok(posterUrls);
    }
}
