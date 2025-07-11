import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useNavigate, useParams } from "react-router-dom";

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
}


const ProfilePage: React.FC = () => {
  const token = useSelector((state: RootState) => state.user.token);
  const reduxUser = useSelector((state: RootState) => state.user.userInfo);
  const { userId } = useParams<{ userId?: string }>();
  const [user, setUser] = useState<any>(null);
  const [myEvents, setMyEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

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
        .then(data => {
          setMyEvents(data);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setMyEvents([]);
      setLoading(false);
    }
  }, [token, userId, reduxUser?.id, navigate]);

  if (!token) return null;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-4">{isOwnProfile ? "My Profile" : `${user?.username || "User"}'s Profile`}</h2>
      <div className="mb-6 p-4 bg-base-200 rounded">
        <div><span className="font-semibold">Username:</span> {user?.username}</div>
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
                    body: JSON.stringify({ email: editEmail, bio: editBio }),
                  });
                  if (!res.ok) throw new Error("Failed to update user info");
                  const updated = await res.json();
                  setUser(updated);
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
        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-4">Events created by {user?.username || "this user"}</h3>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : myEvents.length === 0 ? (
            <div className="text-center text-gray-400">No events</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myEvents.map(event => (
                <div
                  key={event.id}
                  className="card bg-base-100 shadow hover:shadow-lg cursor-pointer transition-all h-full"
                  onClick={() => navigate(`/event/${event.id}`)}
                >
                  <figure className="h-40 overflow-hidden bg-base-200">
                    <img
                      src={event.imageUrl ? event.imageUrl : "/default-event.jpg"}
                      alt={event.title}
                      className="object-cover w-full h-full"
                    />
                  </figure>
                  <div className="card-body p-4">
                    <h4 className="card-title text-lg font-bold mb-1 line-clamp-1">{event.title}</h4>
                    <div className="text-sm text-gray-500 mb-1 line-clamp-3">{event.description}</div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-400 mt-2">
                      <span>Location: {event.location}</span>
                      <span>Time: {event.eventTime?.slice(0,16).replace('T',' ')}</span>
                      <span>Attendees: {event.minAttendees}-{event.maxAttendees}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">Host: <span className="underline hover:text-blue-600" onClick={e => {e.stopPropagation(); navigate(`/profile/${event.createdByUsername}`);}}>{event.createdByUsername}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
