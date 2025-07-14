import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { useNavigate, useParams } from "react-router-dom";
import UserEventsPanel from "../components/UserEventsPanel";
import { loginSuccess } from "../store/userSlice";
import { apiGet, apiPut } from "../utils/apiClient";


const ProfilePage: React.FC = () => {
  const token = useSelector((state: RootState) => state.user.token);
  const reduxUser = useSelector((state: RootState) => state.user.userInfo);
  const { userId } = useParams<{ userId?: string }>();
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editName, setEditName] = useState("");
  const [editHobby, setEditHobby] = useState("");
  const [editContactInfo, setEditContactInfo] = useState("");
  const [saving, setSaving] = useState(false);
  const [editAvatar, setEditAvatar] = useState("");
  const presetAvatars = [
    "/avatar1.png",
    "/avatar2.png",
    "/avatar3.png",
    "/avatar4.png",
    "/avatar5.png"
  ];
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Determine if viewing own profile
  const isOwnProfile = !userId || (reduxUser && userId && String(reduxUser.id) === userId);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    // Fetch user info
    const fetchUrl = userId ? `/api/user/${userId}` : "/api/user/me";
    apiGet(fetchUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then(data => {
        setUser(data);
        setEditEmail(data.email || "");
        setEditBio(data.bio || "");
        setEditAvatar(data.avatarUrl || "");
        setEditName(data.name || "");
        setEditHobby(data.hobby || "");
        setEditContactInfo(data.contactInfo || "");
      })
      .catch(() => {});

  }, [token, userId, reduxUser?.id, navigate]);


  if (!token) return null;

  const [error, setError] = useState<string>("");

  // Optionally, you can display the error somewhere in your JSX, e.g.:
  // {error && <div className="text-red-500">{error}</div>}

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-2 sm:px-4">
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <div className="max-w-7xl w-full mx-auto mt-4 sm:mt-10 space-y-6">
        {/* Profile Card - More responsive width */}
        <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto shadow-xl rounded-2xl bg-white/80 backdrop-blur-md border border-blue-100 p-4 sm:p-6 lg:p-8">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-400 drop-shadow-lg text-center">
            {isOwnProfile ? "My Profile" 
            : `${(user?.name && user.name.trim() !== "") ? user.name : user?.username || "User"}'s Profile`}</h2>
          <div className="mb-4 sm:mb-6 p-4 sm:p-6 lg:p-8 bg-base-200 rounded-xl shadow-md flex flex-col items-center">
            <div className={`flex flex-col items-center gap-3 sm:gap-4 mb-4 w-full ${
              isOwnProfile 
                ? 'max-w-lg lg:max-w-4xl xl:max-w-5xl' 
                : 'max-w-md lg:max-w-3xl xl:max-w-4xl'
            }`}>
              <div className="relative flex justify-center">
                <img
                  src={user?.avatarUrl && user.avatarUrl.trim() !== '' ? user.avatarUrl : "/default-avatar.png"}
                  alt="avatar"
                  className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-purple-300 object-cover bg-white shadow-lg transition-transform duration-300 hover:scale-105"
                />
                <span className="absolute bottom-1 right-1 bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs px-2 py-0.5 rounded-full shadow">{isOwnProfile ? "You" : "User"}</span>
              </div>
              <div className="flex flex-col items-center space-y-3 sm:space-y-4 w-full">
                {/* Only show Username for own profile */}
                {isOwnProfile && (
                  <div className="text-sm sm:text-base text-left w-full bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-200">
                    <span className="font-semibold text-purple-700 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Username:
                    </span> 
                    <span className="text-gray-700 font-medium">{user?.username}</span>
                  </div>
                )}
                
                <div className="text-sm sm:text-base text-left w-full bg-gradient-to-r from-green-50 to-teal-50 p-3 rounded-lg border border-green-200">
                  <span className="font-semibold text-green-700 flex items-center mb-1">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Name:
                  </span> 
                  {isOwnProfile && editMode ? (
                    <div>
                      <input
                        className="input input-bordered w-full text-sm bg-white/90 focus:bg-white border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 rounded-lg shadow-sm"
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        disabled={saving}
                        placeholder="Enter your full name"
                      />
                      <div className="text-xs text-green-600 mt-1 opacity-75">
                        💡 The name display on event panel and comments section.
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-700 font-medium">
                      {user?.name && user.name.trim() !== '' ? user.name : <span className="text-gray-400 italic">Not provided</span>}
                    </span>
                  )}
                </div>
                
                <div className="text-sm sm:text-base text-left w-full bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg border border-orange-200">
                  <span className="font-semibold text-orange-700 flex items-center mb-1">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Hobby:
                  </span> 
                  {isOwnProfile && editMode ? (
                    <input
                      className="input input-bordered w-full text-sm bg-white/90 focus:bg-white border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 rounded-lg shadow-sm"
                      type="text"
                      value={editHobby}
                      onChange={e => setEditHobby(e.target.value)}
                      disabled={saving}
                      placeholder="What do you enjoy doing?"
                    />
                  ) : (
                    <span className="text-gray-700 font-medium">
                      {user?.hobby && user.hobby.trim() !== '' ? user.hobby : <span className="text-gray-400 italic">Not provided</span>}
                    </span>
                  )}
                </div>
                
                <div className="text-sm sm:text-base text-left w-full bg-gradient-to-r from-pink-50 to-rose-50 p-3 rounded-lg border border-pink-200">
                  <span className="font-semibold text-pink-700 flex items-center mb-1">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Contact Info:
                  </span> 
                  {isOwnProfile && editMode ? (
                    <input
                      className="input input-bordered w-full text-sm bg-white/90 focus:bg-white border-pink-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-200 rounded-lg shadow-sm"
                      type="text"
                      value={editContactInfo}
                      onChange={e => setEditContactInfo(e.target.value)}
                      disabled={saving}
                      placeholder="Phone, social media, etc."
                    />
                  ) : (
                    <span className="text-gray-700 font-medium">
                      {user?.contactInfo && user.contactInfo.trim() !== '' ? user.contactInfo : <span className="text-gray-400 italic">Not provided</span>}
                    </span>
                  )}
                </div>
                
                <div className="text-sm sm:text-base text-left w-full bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg border border-indigo-200">
                  <span className="font-semibold text-indigo-700 flex items-center mb-1">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email:
                  </span> 
                  {isOwnProfile && editMode ? (
                    <input
                      className="input input-bordered w-full text-sm bg-white/90 focus:bg-white border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 rounded-lg shadow-sm"
                      type="email"
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      disabled={saving}
                      placeholder="your.email@example.com"
                    />
                  ) : (
                    <span className="text-gray-700 font-medium">
                      {user?.email && user.email.trim() !== '' ? user.email : <span className="text-gray-400 italic">Not provided</span>}
                    </span>
                  )}
                </div>
                
                <div className="text-sm sm:text-base text-left w-full bg-gradient-to-r from-violet-50 to-purple-50 p-3 rounded-lg border border-violet-200">
                  <span className="font-semibold text-violet-700 flex items-center mb-1">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Bio:
                  </span> 
                  {isOwnProfile && editMode ? (
                    <textarea
                      className="textarea textarea-bordered w-full text-sm bg-white/90 focus:bg-white border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-200 rounded-lg shadow-sm min-h-[80px] resize-none"
                      value={editBio}
                      onChange={e => setEditBio(e.target.value)}
                      disabled={saving}
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <span className="text-gray-700 font-medium">
                      {user?.bio && user.bio.trim() !== '' ? user.bio : <span className="text-gray-400 italic">Not provided</span>}
                    </span>
                  )}
                </div>
              </div>
              {/* Avatar selector only in edit mode, not as a row */}
              {isOwnProfile && editMode && (
                <div className="mt-4 w-full bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                  <div className="text-center mb-3">
                    <span className="font-semibold text-sm sm:text-base text-blue-700">🖼️ Choose Your Avatar</span>
                  </div>
                  
                  {/* Preset avatars section */}
                  <div className="mb-4">
                    <div className="text-xs sm:text-sm font-medium text-gray-600 mb-2 text-left">📋 Select from preset avatars:</div>
                    <div className="flex gap-2 flex-wrap justify-start">
                      {presetAvatars.map(url => (
                        <img
                          key={url}
                          src={url}
                          alt="avatar"
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3 cursor-pointer object-cover transition-all duration-200 hover:scale-110 ${editAvatar === url ? "border-blue-500 ring-2 ring-blue-400 shadow-lg" : "border-gray-300 hover:border-blue-400"}`}
                          onClick={() => setEditAvatar(url)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Custom URL input section */}
                  <div className="border-t border-blue-200 pt-3">
                    <div className="text-xs sm:text-sm font-medium text-gray-600 mb-2 text-left">🌐 Or use your own image URL:</div>
                    <input
                      className="input input-bordered w-full text-xs sm:text-sm bg-white/80 backdrop-blur-sm focus:bg-white transition-all duration-200"
                      type="url"
                      placeholder="https://example.com/your-avatar.jpg"
                      value={editAvatar && !presetAvatars.includes(editAvatar) ? editAvatar : ""}
                      onChange={e => setEditAvatar(e.target.value)}
                      disabled={saving}
                    />
                    <div className="text-xs text-gray-500 mt-2 text-left bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                      💡 <strong>Tip:</strong> You can paste any image URL from the internet! 
                      <br />📸 We don't provide cloud storage to keep costs low, so please use external image hosting services. Thanks for your understanding! 😊
                    </div>
                  </div>
                  
                  {/* Preview section */}
                  {editAvatar && editAvatar.trim() !== '' && (
                    <div className="mt-3 text-center">
                      <div className="text-xs sm:text-sm font-medium text-gray-600 mb-2">👀 Preview:</div>
                      <img
                        src={editAvatar}
                        alt="Preview"
                        className="w-16 h-16 rounded-full border-2 border-blue-300 object-cover mx-auto shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        onLoad={(e) => {
                          (e.target as HTMLImageElement).style.display = 'block';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
              {isOwnProfile && editMode ? (
                <div className="mt-3 sm:mt-2 flex gap-2 justify-center">
                  <button className="btn btn-primary btn-xs sm:btn-sm text-xs sm:text-sm" disabled={saving} onClick={async () => {
                    setSaving(true);
                    setError("");
                    try {
                      const updated = await apiPut(`/api/user/${user.id}`,
                        {
                          email: editEmail,
                          bio: editBio,
                          avatarUrl: editAvatar,
                          name: editName,
                          hobby: editHobby,
                          contactInfo: editContactInfo
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      setUser(updated);
                      dispatch(loginSuccess(updated)); // Sync redux userInfo after updating profile
                      setEditMode(false);
                    } catch (err: any) {
                      setError(err.message || "Update failed");
                    } finally {
                      setSaving(false);
                    }
                  }}>Save</button>
                  <button className="btn btn-outline btn-xs sm:btn-sm text-xs sm:text-sm" disabled={saving} onClick={() => {
                    setEditEmail(user?.email || "");
                    setEditBio(user?.bio || "");
                    setEditAvatar(user?.avatarUrl || "");
                    setEditName(user?.name || "");
                    setEditHobby(user?.hobby || "");
                    setEditContactInfo(user?.contactInfo || "");
                    setEditMode(false);
                  }}>Cancel</button>
                </div>
              ) : (
                isOwnProfile && <button className="btn btn-outline btn-xs sm:btn-sm text-xs sm:text-sm mt-2" onClick={() => setEditMode(true)}>Edit</button>
              )}
            </div>
          </div>
        </div>
        
        {/* Events Section - Full width */}
        {!isOwnProfile && user && (
          <div className="max-w-7xl mx-auto">
            <UserEventsPanel
              userId={user.id}
              username={user.username}
              name={user.name}
              token={token}
              currentUserId={reduxUser?.id}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
