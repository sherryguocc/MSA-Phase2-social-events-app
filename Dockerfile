# ---------- Step 1: Build React frontend ----------
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build  

# ---------- Step 2: Build .NET backend ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build

WORKDIR /app
COPY backend/*.csproj ./backend/
RUN dotnet restore ./backend/backend.csproj

COPY backend/ ./backend/
RUN dotnet publish ./backend/backend.csproj -c Release -o /app/publish

# ---------- Step 3: Final runtime image ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

COPY --from=backend-build /app/publish ./


COPY --from=frontend-build /app/frontend/dist ./wwwroot


EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80

ENTRYPOINT ["dotnet", "backend.dll"]
