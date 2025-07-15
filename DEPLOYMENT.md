# Deployment Guide

## Frontend (Render)

1. Connect your GitHub repository to Render
2. Create a new Static Site
3. Configure build settings:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
4. Deploy

The `_redirects` file in `frontend/public/` ensures SPA routing works correctly.

## Backend (Render)

1. Create a new Web Service
2. Configure build settings:
   - **Build Command**: `cd backend && dotnet restore && dotnet build`
   - **Start Command**: `cd backend && dotnet run --urls=http://0.0.0.0:$PORT`
3. Set environment variables as needed
4. Deploy

## Environment Variables

### Frontend (Optional)
- `VITE_API_URL`: Backend API URL (defaults to localhost for dev)

### Backend (Required for production)
- Database connection strings if using external DB
- CORS origins for frontend URL
