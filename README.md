# 🌐 SocialLink - A Social Event Networking App# MSA Phase 2 | Software Stream  
> By: Sherry Guo 
> GitHub Repo: https://github.com/sherryguocc/MSA-Phase2-social-events-app

---

## 🎯 Project Overview

**SocialLink** is a full-stack social networking web application that allows users to organize and participate in events. Users can create posts with activity details, express interest or attendance, and engage via threaded comments.

This project aligns with the **2025 MSA Phase 2 Theme: Networking**, by fostering community-driven connections through shared events and real-time participation.

---

## 🚀 Live Demo

- 🔗 **Frontend**: [https://sociallink-frontend.onrender.com/](https://sociallink-frontend.onrender.com/)
- 🔗 **Backend API**: Deployed on Render (connected automatically)

> ⚠️ **Note for Evaluators**: This project is deployed on Render's free tier. If the website hasn't been accessed for a while, the initial startup may take 3-10 seconds to load. Please be patient during the first visit as the server needs to wake up from sleep mode.

---

## 🚀 Deployment

### Live Demo
- **Frontend**: https://sociallink-frontend.onrender.com/
- **Backend API**: https://sociallink-backend-ujwt.onrender.com/

### Deployment Notes
- Both frontend and backend are deployed on Render
- The frontend includes a `_redirects` file to handle SPA routing properly
- Database is SQLite with Entity Framework migrations
- CORS is configured for cross-origin requests

---

## 🧰 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React + Redux Toolkit + Tailwind CSS + DaisyUI |
| Backend    | ASP.NET Core (.NET 8) + EF Core    |
| Database   | SQLite (Development), Azure SQL (Production) |
| Auth       | JWT Authentication                |
| Deployment | Render (Frontend & Backend) - Live at https://sociallink-frontend.onrender.com/ |

---

## 🧠 Advanced Features Implemented

✅ 1. **Redux Toolkit** for global state management (user sessions, event list, participation)  
✅ 2. **Theme Switching**: Dark/Light mode with Tailwind and `localStorage`  
✅ 3. **Dockerized Backend** using multi-stage build Dockerfile  

> Only these three features will be marked per MSA instructions.

---

## 📦 Features Summary


- 👥 **User Management**: Registration & login with JWT authentication
- 📝 **Event Creation**: Create detailed event posts (title, description, location, time, min/max attendees)
- 📋 **Event Discovery**: View all events with sorting options and detailed event pages
- 🔁 **Smart Participation**: Mark as "Interested" or "Joined" with intelligent waitlist management
- 🎯 **Automatic Waitlist**: Users joining full events automatically enter waitlist queue
- ⬆️ **Dynamic Promotion**: When joined users cancel, waitlist users automatically promoted in order
- 💬 **Interactive Comments**: Threaded discussion system for event engagement
- 🏷️ **Event Status Badges**: Visual indicators (Almost Full, Waitlist Only, Event Ended)
- 👤 **Rich User Profiles**: Comprehensive profiles with avatars, bio, and social information
- 📱 **Responsive Design**: Mobile-first UI with modern gradients and animations
- 🎨 **Theme Toggle**: Dark/Light mode switching with persistent preferences
- 🔄 **Real-time Updates**: Live participation counts and status changesilt for

---

## 🎬 Demo Video

🎥 [Watch Demo (5 min max)](https://TBD.com)

- [ ] ✅ Project introduction
- [ ] ✅ Highlight of interes
- [ ] ✅ Demo of UI and core features
- [ ] ✅ Checklist of Advanced Features

---

## 🔧 How to Run Locally

### 1. Backend

```cd backend
dotnet restore
dotnet ef database update  # Creates local.db
dotnet run
```


---

### 2. Frontend

```
cd frontend
npm install
npm start
```

> The frontend runs at http://localhost:3000 and connects to the backend API at http://localhost:5000 by default.

---

## 🔧 Project Structure

```plaintext
project-root/
├── backend/
│   ├── Controllers/
│   ├── Models/
│   ├── Data
│   ├── DTOs
│   ├── AppDbContext.cs
│   ├── Program.cs
│   └── Dockerfile
│
├── frontend/
│   ├── public/  # user Avatars and Site Logo
│   ├── src/
│   │  ├── components/
│   │  ├── utils/         # Redux slices
│   │  ├── pages/
│   │  ├── App.tsx
│   │  ├── index.css
│   │  ├── main.tsx
│   │  ├── index.html
│   ├── tailwind.config.js
│   └── package.json
```
---

## 🌐 How It Aligns With the Theme: Networking

- This app promotes student and community networking by enabling users to:

- Find like-minded people via shared events

- Interact through participation and comments

- Strengthen social ties through event-driven collaboration