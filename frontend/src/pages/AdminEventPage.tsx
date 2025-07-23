import { useEffect, useState } from "react";
import { apiGet, apiDelete } from "../utils/apiClient";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useNavigate } from "react-router-dom";

interface EventItem {
  id: number;
  title: string;
  createdAt: string;
  createdBy: {
    id: number;
    username: string;
  };
}

export default function AdminEventPage() {
  const token = useSelector((state: RootState) => state.user.token);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isAdmin = userInfo?.id === 1; 

  useEffect(() => {
  if (!token || !isAdmin) {
    console.warn("⛔ Unauthorized access: redirecting");
    navigate("/");
    return;
  }

  const fetchEvents = async () => {
    try {
      console.log("🚀 Fetching events as admin...");
      const data = await apiGet("/api/event/dto");
      console.log("✅ Fetched events:", data);
      setEvents(data);
    } catch (err) {
      console.error("❌ Failed to fetch in AdminEventPage:", err);
      setError("Failed to fetch events.");
    } finally {
      setLoading(false);
    }
  };

  fetchEvents();
}, [token, isAdmin, navigate]);

  useEffect(() => {
    if (!token || !isAdmin) {
      console.warn("⛔ Unauthorized access: redirecting");
      navigate("/");
    }
  }, [token, isAdmin, navigate]);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) return;

    try {
      await apiDelete(`/event/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
      alert("Event deleted.");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to delete event.";
      alert(errorMsg);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Event Manager</h2>
      {loading && <p>Loading events...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {events.length === 0 && !loading && <p>No events found.</p>}

      <ul className="space-y-4">
        {events.map(event => (
          <li key={event.id} className="p-4 border rounded shadow flex justify-between items-center">
            <div>
              <p className="font-semibold">{event.title}</p>
              <p className="text-sm text-gray-500">
                Created by: {event.createdBy
                ? `Created by: ${event.createdBy.username} (ID: ${event.createdBy.id})`
                : "Created by: Unknown"}
              </p>
            </div>
            <button
              onClick={() => handleDelete(event.id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
