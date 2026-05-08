using Microsoft.EntityFrameworkCore;
using SF.Models;
using SF.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddSingleton<BlockchainService>();
builder.Services.AddHttpClient<IpfsPinningService>();
builder.Services.AddScoped<NftMetadataService>();
builder.Services.AddScoped<NftMintingService>();
builder.Services.AddScoped<NftSchemaInitializer>();
builder.Services.AddDbContext<SilverFlagPcContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Data Source=DESKTOP-AQRG5NJ;Initial Catalog=SilverFlagPC;Integrated Security=True;Connect Timeout=30;Encrypt=True;Trust Server Certificate=True;Application Intent=ReadWrite;Multi Subnet Failover=False;Command Timeout=30"));
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.IdleTimeout = TimeSpan.FromHours(8);
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var schemaInitializer = scope.ServiceProvider.GetRequiredService<NftSchemaInitializer>();
    await schemaInitializer.EnsureSchemaAsync();
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseSession();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();
