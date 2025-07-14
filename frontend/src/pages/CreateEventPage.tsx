import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { apiPost } from '../utils/apiClient';
import EventForm from '../components/EventForm';

interface EventFormData {
  title: string;
  description: string;
  location: string;
  eventTime: string;
  minAttendees: string;
  maxAttendees: string;
  imageUrl: string;
}

const CreateEventPage: React.FC = () => {
  const token = useSelector((state: RootState) => state.user.token);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // If not logged in, redirect to login page
  if (!token) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (formData: EventFormData) => {
    setIsLoading(true);
    
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        eventTime: formData.eventTime,
        minAttendees: parseInt(formData.minAttendees, 10),
        maxAttendees: parseInt(formData.maxAttendees, 10),
        imageUrl: formData.imageUrl || undefined,
      };

      await apiPost("/api/event", eventData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/my-events");
    } catch (error: any) {
      throw new Error(error.message || "Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/my-events");
  };

  return (
    <EventForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitButtonText="Create Event"
      title="🎉 Create New Event"
      onCancel={handleCancel}
    />
  );
};

export default CreateEventPage;
