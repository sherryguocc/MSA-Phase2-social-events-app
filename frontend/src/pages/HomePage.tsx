import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface EventItem {
  id: number;
  title: string;
  description: string;
  location: string;
  eventTime: string;
  minAttendees: number;
  maxAttendees: number;
  imageUrl?: string;
}

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/event")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then(data => setEvents(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 relative">
      <div className="absolute right-0 top-0 flex gap-2">
        {isLoggedIn ? (
          <>
            <button className="btn btn-outline btn-sm" onClick={() => window.location.href = '/create-event'}>Create Event</button>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <button className="btn btn-outline btn-sm" onClick={() => window.location.href = '/register'}>Register</button>
            <button className="btn btn-primary btn-sm" onClick={() => window.location.href = '/login'}>Login</button>
          </>
        )}
      </div>
      <h2 className="text-3xl font-bold mb-6">All Events</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {events.map(event => (
          <div key={event.id} className="card bg-base-100 shadow-xl break-words">
            <figure>
              <img
                src={event.imageUrl && event.imageUrl.trim() !== '' ? event.imageUrl : '/default-event.jpg'}
                alt={event.title}
                className="w-full h-48 object-cover rounded-t"
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/default-event.jpg'; }}
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
      </div>
    </div>
  );
};

export default HomePage;
