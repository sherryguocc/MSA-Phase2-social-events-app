import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CreateEventPage from './pages/CreateEventPage';
import ProfilePage from './pages/ProfilePage';
import MyEventPage from './pages/MyEventPage';
import EditEventPage from './pages/EditEventPage';
import EventDetailPage from './pages/EventDetailPage';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from './store';
import { clearToken, loginSuccess } from './store/userSlice';

function AppContent() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.user.token);
  const reduxUser = useSelector((state: RootState) => state.user.userInfo);
  const [user, setUser] = useState(reduxUser);
  const navigate = useNavigate();
  useEffect(() => {
    setUser(reduxUser);
  }, [reduxUser]);

  useEffect(() => {
    if (!reduxUser && token) {
      fetch("/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch user info");
          return res.json();
        })
        .then(data => {
          setUser(data);
          dispatch(loginSuccess(data));
        })
        .catch(() => {});
    }
  }, [token, reduxUser, dispatch]);
  const isLoggedIn = Boolean(token);
  const handleLogout = () => {
    dispatch(clearToken());
    navigate("/");
  };
  return (
    <>
      {/* Navigation Bar */}
      {isLoggedIn && (
        <nav className="w-full flex items-start p-4 bg-base-100 shadow">
          {/* Left: Home */}
          <div className="flex-1 flex items-center">
            <a href="/" className="btn btn-ghost btn-sm">Home</a>
          </div>
          {/* Right: User info and buttons */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              {user && (
                <span className="text-base font-semibold text-primary">Hi, {user.username}!</span>
              )}
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/profile')}>My Profile</button>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/my-events')}>My Events</button>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/create-event')}>Create Event</button>
            </div>
          </div>
        </nav>
      )}
      <div className="flex justify-center flex-1">
        <Routes>
          {/* Home page route */}
          <Route path="/" element={<HomePage />} />
          {/* Register page route */}
          <Route path="/register" element={<RegisterPage />} />
          {/* Login page route */}
          <Route path="/login" element={<LoginPage />} />
          {/* Create event page route */}
          <Route path="/create-event" element={<CreateEventPage />} />
          {/* Profile page route (self) */}
          <Route path="/profile" element={<ProfilePage />} />
          {/* Profile page route (other user) */}
          <Route path="/profile/:userId" element={<ProfilePage />} />
          {/* My Events page route */}
          <Route path="/my-events" element={<MyEventPage />} />
          {/* Edit Event page route */}
          <Route path="/edit-event/:id" element={<EditEventPage />} />
          {/* Event Detail page route */}
          <Route path="/event/:id" element={<EventDetailPage />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </div>
  );
}

export default App;
