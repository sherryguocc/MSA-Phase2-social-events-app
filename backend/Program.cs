
using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;


var builder = WebApplication.CreateBuilder(args);
Console.WriteLine("EF is using: " + builder.Configuration.GetConnectionString("DefaultConnection"));
Console.WriteLine("Using DB: " + builder.Configuration.GetConnectionString("DefaultConnection"));

// Configure database based on environment
builder.Services.AddDbContext<AppDbContext>(options => 
{
    if (builder.Environment.IsEnvironment("Testing"))
    {
        // Do not configure here; test project will override with InMemory
        Console.WriteLine("Skipping DB configuration for Testing environment.");
        return;
    }

    if (builder.Environment.IsDevelopment())
    {
        // Use SQLite for development environment
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
        Console.WriteLine("Using SQLite for Development");
    }
    else
    {
        // Use SQL Server for production environment
        options.UseSqlServer(
            builder.Configuration.GetConnectionString("DefaultConnection"),
            sqlOptions =>
            {
                sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(10),
                    errorNumbersToAdd: null
                );
            });
        Console.WriteLine("Using SQL Server for Production");

        // Suppress warning
        options.ConfigureWarnings(warnings =>
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    }
});


// Configure JWT authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? ""))
        };
    });

builder.Services.AddControllers();

// Enable CORS for the frontend application
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                "https://sociallink-frontend.onrender.com",      // Production frontend (confirmed URL)
                "http://localhost:5173",                         // Local Vite dev server
                "http://localhost:3000"                          // Alternative local port
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();  // Add this for better compatibility
    });
});

// Add logging for CORS debugging
Console.WriteLine("CORS configured for origins:");
Console.WriteLine("- https://sociallink-frontend.onrender.com");
Console.WriteLine("- http://localhost:5173");
Console.WriteLine("- http://localhost:3000");

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter JWT with Bearer prefix. Example: Bearer {your token}",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});
var connStr = builder.Configuration.GetConnectionString("DefaultConnection") ?? "(no connection string)";
    Console.WriteLine("Connection String (start): " + connStr.Substring(0, Math.Min(connStr.Length, 30)));


var app = builder.Build();

// Apply database migrations after the app is built
// This ensures that the database is created and migrations are applied before the app starts serving requests.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        db.Database.Migrate();
        Console.WriteLine("Database migration completed successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database migration failed: {ex.Message}");
        
        // In production, try to create the database if migration fails
        if (!app.Environment.IsDevelopment())
        {
            Console.WriteLine("Attempting to ensure database is created...");
            try
            {
                db.Database.EnsureCreated();
                Console.WriteLine("Database creation completed successfully.");
            }
            catch (Exception createEx)
            {
                Console.WriteLine($"Database creation also failed: {createEx.Message}");
                // Log the error but don't crash the application
            }
        }
        else
        {
            throw; // Re-throw in development for debugging
        }
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        TestSeeder.SeedTestData(dbContext);
    }
}


app.UseHttpsRedirection();

// CORS should be placed early in the pipeline, before authentication
app.UseCors();

// Serve static files (frontend)
app.UseDefaultFiles();
app.UseStaticFiles();

// Routing & fallback for SPA
app.UseRouting();

// Authentication and Authorization middleware
// Ensure these are called after UseRouting and before UseEndpoints
app.UseAuthentication();
app.UseAuthorization();


// Endpoint routing
app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();

// Make the implicit Program class public so that it can be referenced by tests
public partial class Program { }

