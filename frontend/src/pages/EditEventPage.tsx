import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

interface EventItem {
  id: number;
  title: string;
  description: string;
  location: string;
  eventTime: string;
  minAttendees: number;
  maxAttendees: number;
  imageUrl?: string;
  createdById: number;
  createdByUsername: string;
}

const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const token = useSelector((state: RootState) => state.user.token);
  const user = useSelector((state: RootState) => state.user.userInfo);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [minAttendees, setMinAttendees] = useState(1);
  const [maxAttendees, setMaxAttendees] = useState(10);
  const [imageUrl, setImageUrl] = useState("");

useEffect(() => {
  if (!token) {
    navigate("/login");
    return;
  }
  if (!user) {
    // 等待 userInfo 加载，不跳转
    return;
  }
  fetch(`/api/event/dto`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch event");
      return res.json();
    })
    .then((data: EventItem[]) => {
      const found = data.find(e => e.id === Number(id));
      if (!found) throw new Error("Event not found");
      if (found.createdByUsername !== user.username) throw new Error("You are not the creator of this event.");
      setEvent(found);
      setTitle(found.title);
      setDescription(found.description);
      setLocation(found.location);
      setEventTime(found.eventTime.slice(0, 16)); // for datetime-local
      setMinAttendees(found.minAttendees);
      setMaxAttendees(found.maxAttendees);
      setImageUrl(found.imageUrl || "");
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
}, [id, token, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/event/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: Number(id),
          title,
          description,
          location,
          eventTime,
          minAttendees,
          maxAttendees,
          imageUrl,
          createdById: user?.id,
          createdByUsername: user?.username,
        }),
      });
      if (!res.ok) throw new Error("Failed to update event");
      alert("Event updated!");
      navigate("/my-events");
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };


if (!token) return null;
if (!user) return <div>Loading...</div>;
if (loading) return <div>Loading...</div>;
if (error) return <div className="text-red-500">{error}</div>;
if (!event) return <div>Event not found or you are not the creator.</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-base-200 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Event</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="w-full mb-2 p-2 border rounded"
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
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
        <input
          className="w-full mb-2 p-2 border rounded"
          type="number"
          placeholder="Min Attendees"
          value={minAttendees}
          onChange={e => setMinAttendees(Number(e.target.value))}
          min={1}
          required
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="number"
          placeholder="Max Attendees"
          value={maxAttendees}
          onChange={e => setMaxAttendees(Number(e.target.value))}
          min={minAttendees}
          required
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          type="text"
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
        />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button className="btn btn-primary w-full" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditEventPage;
