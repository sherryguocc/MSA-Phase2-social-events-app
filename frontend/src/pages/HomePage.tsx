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
            <Link to="/create-event" className="btn btn-success btn-sm">Create Event</Link>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/register" className="btn btn-outline btn-sm">Register</Link>
            <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
          </>
        )}
      </div>
      <h2 className="text-3xl font-bold mb-6">All Events</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {events.map(event => (
          <div key={event.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">{event.title}</h3>
              <p>{event.description}</p>
              <div className="text-sm text-gray-500 mb-2">
                Location: {event.location}<br />
                Time: {new Date(event.eventTime).toLocaleString()}<br />
                Attendees: {event.minAttendees} - {event.maxAttendees}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
