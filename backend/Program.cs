using backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ✅ 配置 EF Core 使用 SQLite 数据库
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// ✅ 启用 Controller 风格 API
builder.Services.AddControllers();

// ✅ 添加 Swagger（用于可视化调试接口）
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ✅ 开发环境下启用 Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ✅ 强制 HTTPS（本地开发也适用）
app.UseHttpsRedirection();

// ✅ 添加身份认证中间件（后期添加 JWT 可启用）
app.UseAuthorization();

// ✅ 映射控制器路由（支持 /api/event 等）
app.MapControllers();

// ✅ 启动应用
app.Run();
