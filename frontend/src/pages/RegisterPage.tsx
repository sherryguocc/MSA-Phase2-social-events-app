import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../utils/apiClient";

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 密码强度检测函数
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
  const isFormValid = username.trim() && password && confirmPassword && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      await apiPost("/api/auth/register", { username, password });
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError("Network error");
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
            建议字母+数字+特殊符号二选一
          </div>
          {password && (
            <div className="mt-2">
              <div className="text-sm">
                密码强度: 
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
        <button 
          className={`btn w-full ${isFormValid ? 'btn-primary' : 'btn-disabled'}`} 
          type="submit"
          disabled={!isFormValid}
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
