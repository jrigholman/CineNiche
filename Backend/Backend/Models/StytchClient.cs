using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace CineNiche.API.Models
{
    // Custom Stytch client implementation since official package isn't available
    public class Stytch
    {
        private readonly HttpClient _httpClient;
        private readonly string _projectId;
        private readonly string _secret;

        public class Client
        {
            private readonly HttpClient _httpClient;
            private readonly string _baseUrl = "https://api.stytch.com/v1/";
            
            public Client(Options options)
            {
                // Create HttpClient
                _httpClient = new HttpClient();
                
                // Set up basic auth with projectId:secret
                var authString = $"{options.ProjectID}:{options.Secret}";
                var encodedAuth = Convert.ToBase64String(Encoding.UTF8.GetBytes(authString));
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", encodedAuth);
            }
            
            public async Task<object> AuthenticateAsync(string token)
            {
                var response = await _httpClient.PostAsync($"{_baseUrl}sessions/authenticate", 
                    new StringContent(JsonSerializer.Serialize(new { session_token = token }), 
                    Encoding.UTF8, "application/json"));
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return JsonSerializer.Deserialize<object>(content);
                }
                
                throw new Exception($"Stytch authentication failed: {response.StatusCode}");
            }
            
            public class Options
            {
                public string ProjectID { get; set; }
                public string Secret { get; set; }
            }
        }
    }
} 