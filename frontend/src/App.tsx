import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';


import HomePage from './pages/HomePage';
import CreateEventPage from './pages/CreateEventPage';

import ProfilePage from './pages/ProfilePage';
import MyEventPage from './pages/MyEventPage';
import { useSelector } from 'react-redux';
import type { RootState } from './store';





function App() {
  const token = useSelector((state: RootState) => state.user.token);
  const isLoggedIn = Boolean(token);
  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <BrowserRouter>
        {/* Navigation Bar */}
        {isLoggedIn && (
          <nav className="w-full flex justify-end gap-2 p-4 bg-base-100 shadow">
            <a href="/" className="btn btn-ghost btn-sm">Home</a>
            <a href="/profile" className="btn btn-ghost btn-sm">Profile</a>
            <a href="/my-events" className="btn btn-ghost btn-sm">My Events</a>
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
            {/* Profile page route */}
            <Route path="/profile" element={<ProfilePage />} />
            {/* My Events page route */}
            <Route path="/my-events" element={<MyEventPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
