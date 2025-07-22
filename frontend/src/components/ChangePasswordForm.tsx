import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { apiPut } from "../utils/apiClient";

const ChangePasswordSection: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.userInfo);
  const token = useSelector((state: RootState) => state.user.token);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePasswordUpdate = async () => {
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const strongEnough =
      newPassword.length >= 8 &&
      [/[a-zA-Z]/, /\d/, /[!@#$%^&*(),.?":{}|<>]/].filter((r) => r.test(newPassword)).length >= 2;

    if (!strongEnough) {
      setError("Password must be at least 8 characters and contain letters + numbers or special characters.");
      return;
    }

    try {
      setSaving(true);
      await apiPut(
        `/api/user/${user?.id}/password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-pink-200 shadow-md">
      <h3 className="text-lg font-semibold text-pink-700 mb-4">🔒 Change Password</h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-600">Current Password</label>
          <input
            className="input input-bordered w-full text-sm bg-white/90 border-gray-300"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={saving}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">New Password</label>
          <input
            className="input input-bordered w-full text-sm bg-white/90 border-gray-300 
             placeholder:text-sm placeholder:text-gray-400 
             min-h-[3.2rem] placeholder:whitespace-pre-line"
            placeholder="Password must be at least 8 characters and contain letters + numbers or special characters."
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={saving}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Confirm New Password</label>
          <input
            className="input input-bordered w-full text-sm bg-white/90 border-gray-300"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={saving}
          />
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}
        {success && <div className="text-sm text-green-600">{success}</div>}

        <button
          onClick={handlePasswordUpdate}
          className="mt-2 px-4 py-2 text-sm font-medium !bg-pink-100 !text-pink-700 rounded-lg hover:!bg-pink-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={saving}
        >
          {saving ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordSection;
