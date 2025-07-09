import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateEventPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [minAttendees, setMinAttendees] = useState(1);
  const [maxAttendees, setMaxAttendees] = useState(10);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to create an event.");
      return;
    }
    try {
      const res = await fetch("/api/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, location, eventTime, minAttendees, maxAttendees, imageUrl })
      });
      if (res.ok) {
        alert("Event created successfully!");
        navigate("/");
      } else {
        const data = await res.json();
        setError(data.message || "Create event failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create Event</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="w-full mb-2 p-2 border rounded"
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="text"
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
        />
        <textarea
          className="w-full mb-2 p-2 border rounded"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="text"
          placeholder="Location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          required
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="datetime-local"
          value={eventTime}
          onChange={e => setEventTime(e.target.value)}
          required
        />
        <div className="flex gap-2 mb-2">
          <input
            className="w-1/2 p-2 border rounded"
            type="number"
            min={1}
            placeholder="Min Attendees"
            value={minAttendees}
            onChange={e => setMinAttendees(Number(e.target.value))}
            required
          />
          <input
            className="w-1/2 p-2 border rounded"
            type="number"
            min={1}
            placeholder="Max Attendees"
            value={maxAttendees}
            onChange={e => setMaxAttendees(Number(e.target.value))}
            required
          />
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button className="btn btn-primary w-full" type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default CreateEventPage;
