import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CreateEventPage from './pages/CreateEventPage';
import ProfilePage from './pages/ProfilePage';
import MyEventPage from './pages/MyEventPage';
import EditEventPage from './pages/EditEventPage';
import EventDetailPage from './pages/EventDetailPage';
import ScrollToTopButton from './components/ScrollToTopButton';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from './store';
import { clearToken } from './store/userSlice';

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
  return (
    <>
      {/* Navigation Bar: always show logo and title, right content switches based on login status */}
      <nav className="w-full flex flex-col gap-0 p-2 sm:p-4 bg-base-100 shadow">
        <div className="flex items-center w-full">
          {/* Left: Home with logo and title */}
          <div className="flex-1 flex items-center min-w-0">
            <a href="/" className="flex items-center gap-2 sm:gap-3 select-none">
              <img src="/logo.png" alt="logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain drop-shadow-md flex-shrink-0" />
              <span className="text-lg sm:text-2xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-400 bg-clip-text text-transparent tracking-tight shadow-sm truncate">
                Welcome to <span className="hidden sm:inline-block font-black tracking-wider">SocialLink!</span>
                <span className="inline-block sm:hidden font-black">SL!</span>
              </span>
            </a>
          </div>
          {/* Right： Theme toggle, login & Register button*/}
          {!isLoggedIn && (
            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                className="px-3 py-2 text-xs sm:text-sm font-medium !bg-gray-100 !text-gray-800 rounded-lg hover:!bg-gray-200 transition-colors duration-200 !border-0" 
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button 
                className="px-3 py-2 text-xs sm:text-sm font-medium !bg-gray-100 !text-gray-800 rounded-lg hover:!bg-gray-200 transition-colors duration-200 !border-0" 
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </div>
          )}
        </div>
        {/* Right: User info and buttons*/}
        {isLoggedIn && (
          <div className="flex flex-col sm:flex-row-reverse items-center sm:items-start w-full mt-2 sm:mt-1 gap-2 sm:gap-0">
            <div className="flex flex-col items-center sm:items-end gap-2 sm:gap-1 w-full sm:w-auto">
              <div className="flex items-center gap-2 justify-center sm:justify-end w-full sm:w-auto">
                {reduxUser && (
                  <div className="flex items-center gap-2 relative">
                    <span className="text-sm sm:text-base font-semibold text-primary truncate">Hi, {reduxUser.username}!</span>
                    <div className="relative group">
                      <img
                        src={reduxUser?.avatarUrl && reduxUser.avatarUrl.trim() !== '' ? reduxUser.avatarUrl : '/default-avatar.png'}
                        alt="avatar"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 cursor-pointer transition-transform duration-150 group-hover:scale-105 flex-shrink-0"
                        onClick={() => navigate('/profile')}
                      />
                      {/* Profile hover card: only one line */}
                      <div className="absolute right-0 top-8 sm:top-10 z-20 hidden group-hover:flex items-center bg-white shadow-lg rounded px-3 py-1 border border-gray-200 animate-fade-in text-sm text-primary font-semibold">
                        Profile
                      </div>
                    </div>
                  </div>
                )}
                <button 
                  className="px-3 py-2 text-xs sm:text-sm font-medium !bg-white !border-2 !border-red-400 !text-red-600 rounded-lg hover:!bg-red-50 hover:!border-red-500 transition-colors duration-200" 
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
              <div className="flex gap-1 sm:gap-2 flex-wrap justify-center sm:justify-end">
                <button 
                  className="px-3 py-2 text-xs sm:text-sm font-medium !bg-gray-100 !text-gray-800 rounded-lg hover:!bg-gray-200 transition-colors duration-200 !border-0" 
                  onClick={() => navigate('/my-events')}
                >
                  My Events
                </button>
                <button 
                  className="px-3 py-2 text-xs sm:text-sm font-medium !bg-gray-100 !text-gray-800 rounded-lg hover:!bg-gray-200 transition-colors duration-200 !border-0" 
                  onClick={() => navigate('/create-event')}
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
      <div className="flex-1 w-full">
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
      <ScrollToTopButton />
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
