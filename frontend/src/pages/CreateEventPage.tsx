import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { apiPost } from '../utils/apiClient';

const CreateEventPage: React.FC = () => {
  const token = useSelector((state: RootState) => state.user.token);
  const navigate = useNavigate();

  // If not logged in, redirect to login page
  if (!token) {
    navigate("/login");
    return null;
  }

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [minAttendees, setMinAttendees] = useState(1);
  const [maxAttendees, setMaxAttendees] = useState(10);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await apiPost("/api/event", {
        title,
        description,
        location,
        eventTime,
        minAttendees,
        maxAttendees,
        imageUrl,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Event created!");
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to create event");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow relative">
      <div className="absolute right-0 top-0 flex gap-2">
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>Home</button>
        <button className="btn btn-outline btn-sm" onClick={() => {
          localStorage.removeItem('token');
          window.location.reload();
        }}>Logout</button>
      </div>
      <h2 className="text-2xl font-bold mb-4">Create Event</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="w-full mb-2 p-2 border rounded"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full mb-2 p-2 border rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="datetime-local"
          value={eventTime}
          onChange={(e) => setEventTime(e.target.value)}
          required
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="number"
          placeholder="Min Attendees"
          value={minAttendees}
          onChange={(e) => setMinAttendees(Number(e.target.value))}
          min={1}
          required
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="number"
          placeholder="Max Attendees"
          value={maxAttendees}
          onChange={(e) => setMaxAttendees(Number(e.target.value))}
          min={minAttendees}
          required
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="text"
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button className="btn btn-primary w-full" type="submit">
          Create Event
        </button>
      </form>
    </div>
  );
};

export default CreateEventPage;
