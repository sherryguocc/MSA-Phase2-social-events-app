import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { apiGet, apiPut } from "../utils/apiClient";
import EventForm from '../components/EventForm';

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
  createdByAvatarUrl?: string;
}

interface EventFormData {
  title: string;
  description: string;
  location: string;
  eventTime: string;
  minAttendees: string;
  maxAttendees: string;
  imageUrl: string;
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

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!user) {
      return;
    }
    
    apiGet(`/api/event/dto`, { headers: { Authorization: `Bearer ${token}` } })
      .then((data: EventItem[]) => {
        const found = data.find(e => e.id === Number(id));
        if (!found) throw new Error("Event not found");
        if (found.createdByUsername !== user.username) throw new Error("You are not the creator of this event.");
        setEvent(found);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, token, user, navigate]);

  const handleSubmit = async (formData: EventFormData) => {
    setSaving(true);
    
    try {
      const eventData = {
        id: Number(id),
        title: formData.title,
        description: formData.description,
        location: formData.location,
        eventTime: formData.eventTime,
        minAttendees: parseInt(formData.minAttendees, 10),
        maxAttendees: parseInt(formData.maxAttendees, 10),
        imageUrl: formData.imageUrl || undefined,
      };

      await apiPut(`/api/event/${id}`, eventData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate(`/event/${id}`);
    } catch (error: any) {
      throw new Error(error.message || "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/event/${id}`);
  };

  if (!token) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-md w-full mx-auto p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-red-200">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/my-events")}
              className="px-4 py-2 font-medium !bg-gray-100 !text-gray-800 rounded-lg hover:!bg-gray-200 transition-colors duration-200 !border-0"
            >
              Go to My Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const initialData = {
    title: event.title,
    description: event.description,
    location: event.location,
    eventTime: event.eventTime.slice(0, 16), // for datetime-local
    minAttendees: event.minAttendees.toString(),
    maxAttendees: event.maxAttendees.toString(),
    imageUrl: event.imageUrl || "",
  };

  return (
    <EventForm
      initialData={initialData}
      onSubmit={handleSubmit}
      isLoading={saving}
      submitButtonText="Update Event"
      title="✏️ Edit Event"
      onCancel={handleCancel}
    />
  );
};

export default EditEventPage;
