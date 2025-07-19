# 🌐 SocialLink - A Social Event Networking App# MSA Phase 2 | Software Stream  
> By: Sherry Guo 
> GitHub Repo: https://github.com/sherryguocc/MSA-Phase2-social-events-app

---

## 🎯 Project Overview

**SocialLink** is a full-stack social networking web application that allows users to organize and participate in events. Users can create posts with activity details, express interest or attendance, and engage via threaded comments.

This project aligns with the **2025 MSA Phase 2 Theme: Networking**, by fostering community-driven connections through shared events and real-time participation.

---

## 🚀 Live Demo

🎥 [Watch Demo (5 min max)](https://TBD.com)

- [ ] ✅ Project introduction
- [ ] ✅ Highlight of interes
- [ ] ✅ Demo of UI and core features
- [ ] ✅ Checklist of Advanced Features

---

## 🚀 Deployment

- 🔗 **Frontend**: [https://sociallink-frontend.onrender.com/](https://sociallink-frontend.onrender.com/)
- 🔗 **Backend API**: [https://sociallink-backend-ujwt.onrender.com](https://sociallink-backend-ujwt.onrender.com) Deployed on Render (connected automatically)

> ⚠️ **Note for Evaluators**: This project is deployed on Render's free tier. If the website hasn't been accessed for a while, the initial startup may take 3-10 seconds to load. Please be patient during the first visit as the server needs to wake up from sleep mode.

### Deployment Notes
- Frontend is deployed on Render.
- Backend is containerized with Docker and deployed on Render.
- The frontend includes a `_redirects` file to handle SPA routing properly.
- The backend connects to Azure SQL in production, with database schema managed via Entity Framework migrations.
- CORS is configured to allow cross-origin requests from the frontend.

---

## 🧰 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React + Redux Toolkit + Tailwind CSS + DaisyUI |
| Backend    | ASP.NET Core (.NET 8) + EF Core + Docker   |
| Database   | SQLite (Development), Azure SQL (Production) |
| Auth       | JWT Authentication                |
| Deployment | Render (Frontend & Backend)

---

## 🧠 Advanced Features Implemented

✅ 1. **Redux Toolkit** for managing user authentication state across the app (e.g., login session).
✅ 2. **Unit Testing**: Core backend functionalities are covered with unit and integration tests using the xUnit framework, including key models and controller logic.
✅ 3. **Dockerized Backend** The backend is containerized using a multi-stage Dockerfile to streamline build and deployment; the frontend is deployed as static files.

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
- ⭐ **Interest Bookmarking**: Users can click “Interested” to save events they’re considering, which appear in their My Events page under the “Interested” tab alongside created and joined events
- 🔍 **Profile-Based Social Discovery**: Users can click on any avatar—whether in event listings, comment sections, or participant lists—to view rich profiles and explore events others have created or joined, encouraging social connection

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

> The frontend runs at http://localhost:5173 and connects to the backend API at http://localhost:5256 by default.

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
---


## 💡 Special Design Considerations and Future Development Ideas
**🔧 Current Design Choices**
- Username-Based Registration:
Users register with a unique username only, without requiring an email address. This allows users to manage different types of events with separate accounts if they wish—something that would be restricted if email uniqueness were enforced.

- No Private Messaging for Now:
All questions and answers are kept public to ensure others can benefit from shared knowledge. A private messaging feature may be considered in future iterations based on user demand.

- No Image Upload for Cost Control:
Currently, user and event avatars are set via URL links. To control hosting costs, no cloud image storage is implemented.

- No Event Deletion by Users:
To maintain a sense of community activity, users cannot delete events once created. This avoids scenarios where full events are removed, making the site appear inactive. However, users can edit event details if there are typos or changes. If deletion is absolutely necessary, users can contact the admin.

- Comment Deletion Only:
Comments are short and cannot be edited after posting. To correct mistakes, users can delete and re-submit the comment instead.

**🔮 Planned Features**
- Forgot Password Feature:
Users will be able to reset their password via email. To use this feature, they must first update their email in their profile and verify it via a code. One email can be linked to multiple usernames, but when recovering a password, both email and username must be entered. If the username is forgotten, entering the email will return a list of associated usernames.

- Private Messaging:
Will be considered if there is significant user demand.

- Repeat Events:
Users will be able to create up to 5 identical events with different times, useful for:

Recurring activities (e.g. badminton every Tuesday)

Gathering availability: if an event needs a minimum number of attendees, organizers can offer two time slots and hold the one that fills up first.

- Comment Images and Event Photo Gallery:
Future updates may allow users to attach images to comments or upload multiple photos for each event (carousel style).

- Advanced Event Categorization:
Events will be grouped into broad and sub-categories (e.g., Sports → Outdoor, Ball Games, Water Sports). This will improve discoverability, especially when there are a large number of events.

- Enhanced Filtering:
The homepage filter tools will become more advanced, allowing users to easily search for events based on categories and interests.

