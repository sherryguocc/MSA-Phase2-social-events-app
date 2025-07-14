import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setToken, loginSuccess } from '../store/userSlice';
import { apiPost } from "../utils/apiClient";

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Password strength detection function
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (hasLetters) strength++;
    if (hasNumbers) strength++;
    if (hasSpecialChars) strength++;

    if (strength === 1) return "weak";
    if (strength === 2) return "medium";
    if (strength === 3) return "strong";
    return "weak";
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword;
  const isFormValid = username.trim() && password && confirmPassword && passwordsMatch && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    try {
      // Register the user
      await apiPost("/api/auth/register", { username, password });
      
      // Automatically login after successful registration
      const loginData = await apiPost("/api/auth/login", { username, password });
      
      // Store token and user info in Redux
      dispatch(setToken(loginData.token));
      dispatch(loginSuccess(loginData.user));
      
      alert("Registration successful! Welcome!");
      navigate("/");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="w-full mb-2 p-2 border rounded"
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <div className="mb-2">
          <input
            className="w-full p-2 border rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div className="text-sm text-gray-600 mt-1">
            Recommended: letters + numbers + special characters (choose at least two)
          </div>
          {password && (
            <div className="mt-2">
              <div className="text-sm">
                Password strength: 
                <span className={`ml-1 font-medium ${
                  passwordStrength === 'weak' ? 'text-red-500' :
                  passwordStrength === 'medium' ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  {passwordStrength === 'weak' ? 'Weak' :
                   passwordStrength === 'medium' ? 'Medium' : 'Strong'}
                </span>
              </div>
            </div>
          )}
        </div>
        <input
          className="w-full mb-2 p-2 border rounded"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        {confirmPassword && !passwordsMatch && (
          <div className="text-red-500 text-sm mb-2">Passwords do not match</div>
        )}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {isLoading && (
          <div className="text-blue-500 text-sm mb-2 flex items-center">
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account, please wait...
          </div>
        )}
        <button 
          className={`btn w-full ${isFormValid ? 'btn-primary' : 'btn-disabled'}`} 
          type="submit"
          disabled={!isFormValid}
        >
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
