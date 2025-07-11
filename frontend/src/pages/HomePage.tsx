import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { clearToken } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';

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
  createdById: number;
}

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.user.token);
  const reduxUser = useSelector((state: RootState) => state.user.userInfo);
  const [user, setUser] = useState(reduxUser);
  useEffect(() => {
    if (!user && token) {
      fetch("/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch user info");
          return res.json();
        })
        .then(data => setUser(data))
        .catch(() => {});
    }
  }, [token, reduxUser, user]);
  const isLoggedIn = Boolean(token);
  const navigate = useNavigate();


  // Sorting state
  const [sortType, setSortType] = useState<'time' | 'name' | 'maxAttendees'>('time');

  useEffect(() => {
    fetch("/api/event/dto")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then(data => setEvents(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Sort events based on sortType
  const sortedEvents = [...events].sort((a, b) => {
    if (sortType === 'time') {
      return new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime();
    } else if (sortType === 'name') {
      return a.title.localeCompare(b.title);
    } else if (sortType === 'maxAttendees') {
      return b.maxAttendees - a.maxAttendees;
    }
    return 0;
  });

  const handleLogout = () => {
    dispatch(clearToken());
    window.location.reload();
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-10 relative px-4">
      {/* Show Register/Login if not logged in */}
      {!isLoggedIn && (
        <div className="flex justify-end gap-2 mb-4">
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/register')}>Register</button>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>Login</button>
        </div>
      )}
      <h2 className="text-3xl font-bold mb-6">All Events</h2>
      <div className="mb-4 flex gap-2 items-center">
        <span className="font-semibold">Sort by:</span>
        <button className={`btn btn-xs ${sortType === 'time' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSortType('time')}>Time</button>
        <button className={`btn btn-xs ${sortType === 'name' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSortType('name')}>Name</button>
        <button className={`btn btn-xs ${sortType === 'maxAttendees' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSortType('maxAttendees')}>Max Attendees</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {sortedEvents.map(event => (
          <div key={event.id} className="card bg-base-100 p-6 shadow-xl break-words">
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
                <span>
                  <span className="font-semibold">Organizer:</span>{" "}
                  {event.createdByUsername || "Unknown"}
                </span>
              </div>
              {/* Edit button for event creator */}
              {user && event.createdById === user.id && (
                <button
                  className="btn btn-outline btn-xs mt-2"
                  onClick={() => navigate(`/edit-event/${event.id}`)}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
