# 🌐 SocialLink - A Social Event Networking App

> Built for MSA Phase 2 | Software Stream  
> By: Sherry Guo 
> GitHub Repo: https://github.com/sherryguocc/MSA-Phase2-social-events-app

---

## 🎯 Project Overview

**SocialLink** is a full-stack social networking web application that allows users to organize and participate in events. Users can create posts with activity details, express interest or attendance, and engage via threaded comments.

This project aligns with the **2025 MSA Phase 2 Theme: Networking**, by fostering community-driven connections through shared events and real-time participation.

---

## 🚀 Live Demo

- 🔗 **Frontend**: [https://TBD](https://TBD.com)
- 🔗 **Backend API**: [https://TBD.com](https://TBD.com)

---

## 🧰 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React + Redux Toolkit + Tailwind CSS |
| Backend    | ASP.NET Core (.NET 8) + EF Core    |
| Database   | SQLite (Development), Azure SQL (Production) |
| Auth       | JWT Authentication                |
| Deployment | Render (Frontend & Backend)       |

---

## 🧠 Advanced Features Implemented

✅ 1. **Redux Toolkit** for global state management (user sessions, event list, participation)  
✅ 2. **Theme Switching**: Dark/Light mode with Tailwind and `localStorage`  
✅ 3. **Dockerized Backend** using multi-stage build Dockerfile  

> Only these three features will be marked per MSA instructions.

---

## 📦 Features Summary

- 👥 User registration & login with JWT
- 📝 Create event posts (title, description, location, time, min/max attendees)
- 📋 View all events and details
- 🔁 Mark as “Interested” or “Going”
- 💬 Comment on events
- 📄 Responsive UI with theme toggle

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
│   ├── Data/
│   ├── AppDbContext.cs
│   ├── Program.cs
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── features/         # Redux slices
│   ├── tailwind.config.js
│   └── package.json
```
---

## 🌐 How It Aligns With the Theme: Networking

- This app promotes student and community networking by enabling users to:

- Find like-minded people via shared events

- Interact through participation and comments

- Strengthen social ties through event-driven collaboration