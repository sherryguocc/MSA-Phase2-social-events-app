import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useNavigate } from "react-router-dom";

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
  const [user, setUser] = useState(reduxUser);

  const [myEvents, setMyEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editBio, setEditBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Debug: print user info from redux
  console.log('ProfilePage user:', user);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("/api/user/me", {
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

    if (user && (user as any).id) {
      const userId = (user as any).id;
      fetch(`/api/event/by-user/${userId}`, {
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
  }, [token, user?.username, navigate]);

  if (!token) return null;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-4">My Profile</h2>
      <div className="mb-6 p-4 bg-base-200 rounded">
        <div><span className="font-semibold">Username:</span> {user?.username}</div>
        {editMode ? (
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
                  const res = await fetch(`/api/user/${(user as any).id}`, {
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
            <button className="btn btn-outline btn-sm mt-2" onClick={() => setEditMode(true)}>Edit</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
