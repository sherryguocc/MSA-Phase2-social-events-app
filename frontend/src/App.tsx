import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';


function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <BrowserRouter>
        <Routes>
          {/* Home page route */}
          <Route path="/" element={<HomePage />} />
          {/* Register page route */}
          <Route path="/register" element={<RegisterPage />} />
          {/* Login page route */}
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
