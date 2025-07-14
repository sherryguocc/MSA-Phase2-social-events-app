import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setToken, loginSuccess } from '../store/userSlice';
import { apiPost } from '../utils/apiClient';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const data = await apiPost("/api/auth/login", { username, password });
      dispatch(setToken(data.token));
      dispatch(loginSuccess(data.user));
      navigate("/");
    } catch (err: any) {
      // Enhanced error handling
      let errorMessage = "Login failed. Please try again.";
      
      if (err.response) {
        // Check if the backend provided a specific error message
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.status === 401) {
          // HTTP 401 Unauthorized - usually means invalid credentials
          errorMessage = "Invalid username or password. Please check your credentials.";
        } else if (err.response.status === 404) {
          // HTTP 404 Not Found - user doesn't exist
          errorMessage = "Username not found. Please check your username or register first.";
        } else if (err.response.status === 400) {
          // HTTP 400 Bad Request
          errorMessage = "Invalid login data. Please check your input.";
        }
      } else if (err.message) {
        // Network or other errors
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="w-full mb-2 p-2 border rounded"
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {isLoading && (
          <div className="text-blue-500 text-sm mb-2 flex items-center">
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Logging in, please wait...
          </div>
        )}
        <button 
          className={`btn w-full ${isLoading ? 'btn-disabled' : 'btn-primary'}`} 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Logging In...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
