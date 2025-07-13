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
    fetch(fetchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch user info");
        return res.json();
      })
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <div className="max-w-3xl w-full mx-auto mt-10 shadow-xl rounded-2xl bg-white/80 backdrop-blur-md border border-blue-100 p-6">
        <h2 className="text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-400 drop-shadow-lg text-center">
          {isOwnProfile ? "My Profile" 
          : `${(user?.name && user.name.trim() !== "") ? user.name : user?.username || "User"}'s Profile`}</h2>
        <div className="mb-6 p-6 bg-base-200 rounded-xl shadow-md flex flex-col items-center">
          <div className="flex flex-col items-center gap-4 mb-4 w-full">
            <div className="relative flex justify-center">
              <img
                src={user?.avatarUrl && user.avatarUrl.trim() !== '' ? user.avatarUrl : "/default-avatar.png"}
                alt="avatar"
                className="w-24 h-24 rounded-full border-4 border-purple-300 object-cover bg-white shadow-lg transition-transform duration-300 hover:scale-105"
              />
              <span className="absolute bottom-1 right-1 bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs px-2 py-0.5 rounded-full shadow">{isOwnProfile ? "You" : "User"}</span>
            </div>
            <div className="flex flex-col items-center space-y-1 w-full">
              <div><span className="font-semibold text-purple-700">Username:</span> {user?.username}</div>
              <div>
                <span className="font-semibold text-purple-700">Name:</span> {isOwnProfile && editMode ? (
                  <input
                    className="input input-bordered ml-2"
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    disabled={saving}
                    style={{ minWidth: 120 }}
                  />
                ) : (
                  user?.name && user.name.trim() !== '' ? user.name : <span className="text-gray-400">Not provided</span>
                )}
              </div>
              <div>
                <span className="font-semibold text-purple-700">Hobby:</span> {isOwnProfile && editMode ? (
                  <input
                    className="input input-bordered ml-2"
                    type="text"
                    value={editHobby}
                    onChange={e => setEditHobby(e.target.value)}
                    disabled={saving}
                    style={{ minWidth: 120 }}
                  />
                ) : (
                  user?.hobby && user.hobby.trim() !== '' ? user.hobby : <span className="text-gray-400">Not provided</span>
                )}
              </div>
              <div>
                <span className="font-semibold text-purple-700">Contact Info:</span> {isOwnProfile && editMode ? (
                  <input
                    className="input input-bordered ml-2"
                    type="text"
                    value={editContactInfo}
                    onChange={e => setEditContactInfo(e.target.value)}
                    disabled={saving}
                    style={{ minWidth: 120 }}
                  />
                ) : (
                  user?.contactInfo && user.contactInfo.trim() !== '' ? user.contactInfo : <span className="text-gray-400">Not provided</span>
                )}
              </div>
              <div>
                <span className="font-semibold text-purple-700">Email:</span> {isOwnProfile && editMode ? (
                  <input
                    className="input input-bordered ml-2"
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    disabled={saving}
                    style={{ minWidth: 120 }}
                  />
                ) : (
                  user?.email && user.email.trim() !== '' ? user.email : <span className="text-gray-400">Not provided</span>
                )}
              </div>
              <div>
                <span className="font-semibold text-purple-700">Bio:</span> {isOwnProfile && editMode ? (
                  <textarea
                    className="input input-bordered ml-2 min-h-[60px] w-full"
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    disabled={saving}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    style={{ minWidth: 120 }}
                  />
                ) : (
                  user?.bio && user.bio.trim() !== '' ? user.bio : <span className="text-gray-400">Not provided</span>
                )}
              </div>
            </div>
            {/* Avatar selector only in edit mode, not as a row */}
            {isOwnProfile && editMode && (
              <div className="mt-2">
                <span className="font-semibold">Avatar:</span>
                <span className="inline-block">
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {presetAvatars.map(url => (
                      <img
                        key={url}
                        src={url}
                        alt="avatar"
                        className={`w-12 h-12 rounded-full border-2 cursor-pointer object-cover ${editAvatar === url ? "border-blue-500 ring-2 ring-blue-400" : "border-gray-300"}`}
                        onClick={() => setEditAvatar(url)}
                      />
                    ))}
                    <input
                      className="input input-bordered input-sm ml-2"
                      type="url"
                      placeholder="Paste avatar image URL"
                      value={editAvatar && !presetAvatars.includes(editAvatar) ? editAvatar : ""}
                      onChange={e => setEditAvatar(e.target.value)}
                      disabled={saving}
                      style={{ width: 180 }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">You can select a preset avatar or paste an image URL.</div>
                </span>
              </div>
            )}
            {isOwnProfile && editMode ? (
              <div className="mt-2 flex gap-2">
                <button className="btn btn-primary btn-sm" disabled={saving} onClick={async () => {
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
                <button className="btn btn-outline btn-sm" disabled={saving} onClick={() => {
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
              isOwnProfile && <button className="btn btn-outline btn-sm mt-2" onClick={() => setEditMode(true)}>Edit</button>
            )}
          </div>
        </div>
        {/* UserEventsPanel: only display when it is not current user */}
        {!isOwnProfile && user && (
          <UserEventsPanel
            userId={user.id}
            username={user.username}
            name={user.name}
            token={token}
            currentUserId={reduxUser?.id}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
