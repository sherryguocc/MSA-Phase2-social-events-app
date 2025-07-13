import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { useNavigate, useParams } from "react-router-dom";
import EventList from "../components/EventList";
import { loginSuccess } from "../store/userSlice";

interface EventItem {
  id: number;
  title: string;
  description: string;
  location: string;
  eventTime: string;
  minAttendees: number;
  maxAttendees: number;
  imageUrl?: string;
  createdByUsername: string;
  createdByAvatarUrl?: string;
  createdById: number;
  joinedCount?: number;
}

const ProfilePage: React.FC = () => {
  const token = useSelector((state: RootState) => state.user.token);
  const reduxUser = useSelector((state: RootState) => state.user.userInfo);
  const { userId } = useParams<{ userId?: string }>();
  const [user, setUser] = useState<any>(null);
  const [myEvents, setMyEvents] = useState<EventItem[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<EventItem[]>([]);
  const [interestedEvents, setInterestedEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editBio, setEditBio] = useState("");
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
    setLoading(true);
    setError("");
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
      })
      .catch(err => setError(err.message));

    // Fetch events created by this user
    const fetchEventsUserId = userId ? userId : reduxUser?.id;
    if (fetchEventsUserId) {
      fetch(`/api/event/by-user/${fetchEventsUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch events");
          return res.json();
        })
        .then(async data => {
          // 批量获取 joinedCount
          const ids = data.map((e: any) => e.id);
          let joinedCounts: Record<number, number> = {};
          if (ids.length > 0) {
            const res = await fetch("/api/event/joined-counts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(ids)
            });
            if (res.ok) {
              joinedCounts = await res.json();
            }
          }
          setMyEvents(data.map((e: any) => ({ ...e, joinedCount: joinedCounts[e.id] ?? 0 })));
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
      // Fetch joined events
      fetch(`/api/users/${fetchEventsUserId}/joined`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch joined events");
          return res.json();
        })
        .then(async data => {
          const ids = data.map((e: any) => e.id);
          let joinedCounts: Record<number, number> = {};
          if (ids.length > 0) {
            const res = await fetch("/api/event/joined-counts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(ids)
            });
            if (res.ok) {
              joinedCounts = await res.json();
            }
          }
          setJoinedEvents(data.map((e: any) => ({ ...e, joinedCount: joinedCounts[e.id] ?? 0 })));
        })
        .catch(() => {});
      // Fetch interested events
      fetch(`/api/users/${fetchEventsUserId}/interested`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch interested events");
          return res.json();
        })
        .then(async data => {
          const ids = data.map((e: any) => e.id);
          let joinedCounts: Record<number, number> = {};
          if (ids.length > 0) {
            const res = await fetch("/api/event/joined-counts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(ids)
            });
            if (res.ok) {
              joinedCounts = await res.json();
            }
          }
          setInterestedEvents(data.map((e: any) => ({ ...e, joinedCount: joinedCounts[e.id] ?? 0 })));
        })
        .catch(() => {});
    } else {
      setMyEvents([]);
      setJoinedEvents([]);
      setInterestedEvents([]);
      setLoading(false);
    }
  }, [token, userId, reduxUser?.id, navigate]);

  if (!token) return null;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-3xl w-full mx-auto mt-10">
        <h2 className="text-3xl font-bold mb-4">{isOwnProfile ? "My Profile" : `${user?.username || "User"}'s Profile`}</h2>
        <div className="mb-6 p-4 bg-base-200 rounded">
          <div className="flex items-center gap-4 mb-2">
            <img
              src={user?.avatarUrl && user.avatarUrl.trim() !== '' ? user.avatarUrl : "/default-avatar.png"}
              alt="avatar"
              className="w-20 h-20 rounded-full border-2 border-blue-300 object-cover bg-white"
            />
            <div><span className="font-semibold">Username:</span> {user?.username}</div>
          </div>
          {isOwnProfile && editMode ? (
            <>
              <div>
                <span className="font-semibold">Email:</span>
                <input
                  className="input input-bordered ml-2"
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div>
                <span className="font-semibold">Bio:</span>
                <input
                  className="input input-bordered ml-2"
                  type="text"
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="mt-2">
                <span className="font-semibold">Avatar:</span>
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
              </div>
              <div className="mt-2 flex gap-2">
                <button className="btn btn-primary btn-sm" disabled={saving} onClick={async () => {
                  setSaving(true);
                  setError("");
                  try {
                    const res = await fetch(`/api/user/${user.id}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ email: editEmail, bio: editBio, avatarUrl: editAvatar }),
                    });
                    if (!res.ok) throw new Error("Failed to update user info");
                    const updated = await res.json();
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
                  setEditMode(false);
                }}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div><span className="font-semibold">Email:</span> {user?.email || "-"}</div>
              <div><span className="font-semibold">Bio:</span> {user?.bio || "-"}</div>
              {isOwnProfile && (
                <button className="btn btn-outline btn-sm mt-2" onClick={() => setEditMode(true)}>Edit</button>
              )}
            </>
          )}
        </div>
        {/* Created Events Section - only show for other users */}
        {!isOwnProfile && (
          <>
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4">Events created by {user?.username || "this user"}</h3>
              {loading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : error ? (
                <div className="text-center text-red-500">{error}</div>
              ) : myEvents.length === 0 ? (
                <div className="text-center text-gray-400">No events</div>
              ) : (
                <EventList events={myEvents} showEditButton={false} />
              )}
            </div>
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4">Events joined by {user?.username || "this user"}</h3>
              {loading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : joinedEvents.length === 0 ? (
                <div className="text-center text-gray-400">No joined events</div>
              ) : (
                <EventList events={joinedEvents} showEditButton={false} />
              )}
            </div>
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4">Events interested by {user?.username || "this user"}</h3>
              {loading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : interestedEvents.length === 0 ? (
                <div className="text-center text-gray-400">No interested events</div>
              ) : (
                <EventList events={interestedEvents} showEditButton={false} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;