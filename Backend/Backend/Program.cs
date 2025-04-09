using CineNiche.API.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using System.Text.Json;
using Microsoft.Extensions.Options;
using CineNiche.API.Models;

var builder = WebApplication.CreateBuilder(args);

// Add configuration
builder.Configuration.AddJsonFile("appsettings.json");

// Add services to the container
builder.Services.AddDbContext<MoviesDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("MoviesDb")));

// Configure JSON serialization
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        // Use camelCase for property names to match JavaScript conventions
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        // Include all properties in serialization
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        // Enable property name case-insensitive matching for deserialization
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",  // React's default port with Create React App
                "http://localhost:5173",  // Vite's default port
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.Configure<StytchConfig>(builder.Configuration.GetSection("Stytch"));

builder.Services.AddSingleton(provider =>
{
    var config = provider.GetRequiredService<IOptions<StytchConfig>>().Value;
    // Use the fully qualified name with our namespace
    return new CineNiche.API.Models.Stytch.Client(new CineNiche.API.Models.Stytch.Client.Options
    {
        ProjectID = config.ProjectID,
        Secret = config.Secret
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use CORS before other middleware
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();