import React, { useEffect } from 'react';
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
  const navigate = useNavigate();
  const isLoggedIn = Boolean(token);
  const handleLogout = () => {
    dispatch(clearToken());
    navigate("/");
  };
  console.log('reduxUser:', reduxUser);
  return (
    <>
      {/* Navigation Bar: always show logo and title, right侧内容根据登录状态切换 */}
      <nav className="w-full flex flex-col gap-0 p-4 bg-base-100 shadow">
        <div className="flex items-center w-full">
          {/* Left: Home with logo and title */}
          <div className="flex-1 flex items-center">
            <a href="/" className="flex items-center gap-3 select-none">
              <img src="/logo.png" alt="logo" className="h-10 w-10 object-contain drop-shadow-md" />
              <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-400 bg-clip-text text-transparent tracking-tight shadow-sm">
                Welcome to <span className="inline-block font-black tracking-wider">SocialLink!</span>
              </span>
            </a>
          </div>
          {/* Right： login & Register button*/}
          {!isLoggedIn && (
            <div className="flex items-center gap-2">
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>Login</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Register</button>
            </div>
          )}
        </div>
        {/* Right: User info and buttons*/}
        {isLoggedIn && (
          <div className="flex flex-row-reverse items-start w-full mt-1">
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                {reduxUser && (
                  <div className="flex items-center gap-2 relative">
                    <span className="text-base font-semibold text-primary">Hi, {reduxUser.username}!</span>
                    <div className="relative group">
                      <img
                        src={reduxUser?.avatarUrl && reduxUser.avatarUrl.trim() !== '' ? reduxUser.avatarUrl : '/default-avatar.png'}
                        alt="avatar"
                        className="w-8 h-8 rounded-full ml-2 border border-gray-300 cursor-pointer transition-transform duration-150 group-hover:scale-105"
                        onClick={() => navigate('/profile')}
                      />
                      {/* Profile hover card: only one line */}
                      <div className="absolute right-0 top-10 z-20 hidden group-hover:flex items-center bg-white shadow-lg rounded px-3 py-1 border border-gray-200 animate-fade-in text-sm text-primary font-semibold">
                        Profile
                      </div>
                    </div>
                  </div>
                )}
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/my-events')}>My Events</button>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/create-event')}>Create Event</button>
              </div>
            </div>
          </div>
        )}
      </nav>
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
