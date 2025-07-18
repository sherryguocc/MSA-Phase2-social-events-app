import React from "react";
import EventCard from "./EventCard";

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
  createdByAvatarUrl?: string;
  createdById: number;
}

interface EventListProps {
  events: EventItem[];
  showEditButton?: boolean;
}

const EventList: React.FC<EventListProps> = ({ events, showEditButton = true }) => {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
      {events.map(event => (
        <EventCard key={event.id} event={event} showEditButton={showEditButton} />
      ))}
    </div>
  );
};

export default EventList;
