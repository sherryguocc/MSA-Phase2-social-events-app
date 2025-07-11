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

const MyEventPage: React.FC = () => {
  const token = useSelector((state: RootState) => state.user.token);
  const reduxUser = useSelector((state: RootState) => state.user.userInfo);
  const [user, setUser] = useState(reduxUser);
  useEffect(() => {
    if (!token) return;
    if (!user) {
      fetch("/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch user info");
          return res.json();
        })
        .then(data => {
          setUser(data);
        })
        .catch(() => {});
    }
  }, [token, user]);
  const [myEvents, setMyEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!user) {
      return;
    }
    if (!user.id) {
      setError("User info error, please re-login.");
      return;
    }
    fetch(`/api/event/by-user/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then(data => setMyEvents(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, user, navigate]);

  if (!token) return null;
  if (!user) return <div>Loading user info...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-4">My Events</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {myEvents.map(event => (
          <div key={event.id} className="card bg-base-100 p-6 shadow-xl break-words">
            <figure>
              <img
                src={event.imageUrl && event.imageUrl.trim() !== '' ? event.imageUrl : '/default-event.jpg'}
                alt={event.title}
                className="w-full h-48 object-cover rounded-t"
                onError={e => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = '/default-event.jpg'; }}
              />
            </figure>
            <div className="card-body">
              <h3 className="card-title text-xl font-bold text-primary break-words whitespace-pre-line mb-2">{event.title}</h3>
              <p className="break-words whitespace-pre-line text-base mb-3 text-gray-800">{event.description}</p>
              <div className="flex flex-col gap-1 text-sm text-gray-600 mb-2">
                <span><span className="font-semibold">Location:</span> {event.location}</span>
                <span><span className="font-semibold">Time:</span> {new Date(event.eventTime).toLocaleString()}</span>
                <span><span className="font-semibold">Attendees:</span> {event.minAttendees} - {event.maxAttendees}</span>
              </div>
            </div>
          </div>
        ))}
        {(!loading && myEvents.length === 0) && <div className="col-span-2 text-gray-500">No events created yet.</div>}
      </div>
    </div>
  );
};

export default MyEventPage;
