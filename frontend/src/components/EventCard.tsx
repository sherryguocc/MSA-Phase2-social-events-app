import React from "react";
import EventEditButton from "./EventEditButton";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaRegClock, FaUsers, FaUserCircle } from "react-icons/fa";

export interface EventCardProps {
  event: {
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
    joinedCount?: number; // Number of users who have joined
  };
  showEditButton?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, showEditButton = true }) => {
  const navigate = useNavigate();
  return (
    <div
      className="card bg-base-100 p-6 shadow-xl break-words cursor-pointer hover:shadow-2xl transition-shadow"
      onClick={() => navigate(`/event/${event.id}`)}
    >
      <figure>
        <img
          src={event.imageUrl && event.imageUrl.trim() !== '' ? event.imageUrl : '/default-event.jpg'}
          alt={event.title}
          className="w-full h-48 object-cover rounded-t"
          onError={e => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = '/default-event.jpg'; }}
        />
      </figure>
      <div className="card-body">
        <h3 className="card-title text-2xl font-extrabold text-primary mb-3 tracking-tight leading-snug">
          {event.title}
        </h3>
        <div className="mb-3">
          <p className="break-words whitespace-pre-line text-base text-gray-800 line-clamp-3 bg-gray-50 rounded px-2 py-1 shadow-inner" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {event.description}
          </p>
        </div>
        <div className="flex flex-col gap-1 text-sm text-gray-700 mb-2">
          <span className="flex items-center">
            <FaMapMarkerAlt className="text-primary mr-1" />
            <span className="font-semibold text-gray-500">Location:</span>
            <span className="ml-1 text-gray-800">{event.location}</span>
          </span>
          <span className="flex items-center">
            <FaRegClock className="text-primary mr-1" />
            <span className="font-semibold text-gray-500">Time:</span>
            <span className="ml-1 text-gray-800">{new Date(event.eventTime).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
          </span>
          <span className="flex items-center">
            <FaUsers className="text-primary mr-1" />
            <span className="font-semibold text-gray-500">Attendees:</span>
            <span className="ml-1 text-gray-800">{event.minAttendees} - {event.maxAttendees}</span>
          </span>
          {typeof event.joinedCount === 'number' && (
            <span className="flex items-center ml-6 text-xs text-gray-500">
              <span className="mr-1">Joined:</span>
              <span className="font-semibold text-primary">{event.joinedCount ?? 0}</span>
              <span className="mx-1">/</span>
              <span>{event.maxAttendees}</span>
            </span>
          )}
          <span className="flex items-center mt-1">
            <FaUserCircle className="text-primary mr-1" />
            <span className="font-semibold text-gray-500 mr-1">Organizer:</span>
            <span className="text-gray-800">{event.createdByUsername || 'Unknown'}</span>
          </span>
        </div>
        {showEditButton && (
          <EventEditButton
            eventId={event.id}
            createdById={event.createdById}
            className="btn btn-outline btn-xs mt-2"
            onClick={e => e.stopPropagation()}
          />
        )}
      </div>
    </div>
  );
};

export default EventCard;
