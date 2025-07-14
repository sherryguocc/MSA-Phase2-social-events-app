import React from "react";
import EventEditButton from "./EventEditButton";
import { useNavigate } from "react-router-dom";

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
    createdByName?: string; // Real name of the creator
    createdByAvatarUrl?: string;
    createdById: number;
    joinedCount?: number; // Number of users who have joined
  };
  showEditButton?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, showEditButton = true }) => {
  const navigate = useNavigate();
  
  // Check if the event is over
  const isEventOver = new Date(event.eventTime).getTime() < Date.now();
  
  return (
    <div
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden border border-gray-100"
      onClick={() => navigate(`/event/${event.id}`)}
    >
      {/* Hero Image with Overlay */}
      <div className="relative">
        <img
          src={event.imageUrl && event.imageUrl.trim() !== '' ? event.imageUrl : '/default-event.jpg'}
          alt={event.title}
          className="w-full h-40 sm:h-56 object-cover"
          onError={e => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = '/default-event.jpg'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        
        {/* Event Status Badges */}
        {isEventOver ? (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-md">
            Event Ended
          </div>
        ) : (
          <>
            {/* Almost Full Badge */}
            {typeof event.joinedCount === 'number' && 
             event.joinedCount < event.maxAttendees && 
             (event.maxAttendees - event.joinedCount) <= 2 && (
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-yellow-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-md">
                Almost Full
              </div>
            )}
            
            {/* Waitlist Only Badge */}
            {typeof event.joinedCount === 'number' && 
             event.joinedCount >= event.maxAttendees && (
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-md">
                Waitlist Only
              </div>
            )}
            
            {/* Confirmed Badge */}
            {typeof event.joinedCount === 'number' && 
             event.joinedCount >= event.minAttendees && 
             event.joinedCount < event.maxAttendees &&
             (event.maxAttendees - event.joinedCount) > 2 && (
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-md">
                Confirmed
              </div>
            )}
          </>
        )}
        
        {/* Participation Status Badge */}
        {typeof event.joinedCount === 'number' && (
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-gray-800 shadow-md">
            {event.joinedCount}/{event.maxAttendees} joined
          </div>
        )}
      </div>
      
      {/* Card Content */}
      <div className="p-3 sm:p-6">
        {/* Title */}
        <h3 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 leading-tight line-clamp-2">
          {event.title}
        </h3>
        
        {/* Description */}
        <div className="mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-3 break-words whitespace-pre-line">
            {event.description}
          </p>
        </div>
        
        {/* Event Details Grid */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          {/* Location */}
          <div className="flex items-center p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center min-w-0 flex-1">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-blue-800 font-medium truncate text-sm sm:text-base">{event.location}</span>
            </div>
          </div>
          
          {/* Date and Time */}
          <div className="flex items-center p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center min-w-0 flex-1">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-green-800 font-medium text-xs sm:text-sm">
                {new Date(event.eventTime).toLocaleString(undefined, { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </span>
            </div>
          </div>
          
          {/* Capacity */}
          <div className="flex items-center p-2 sm:p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-orange-800 font-medium text-sm sm:text-base">{event.minAttendees} - {event.maxAttendees} people</span>
              </div>
              {typeof event.joinedCount === 'number' && (
                <div className="text-orange-700 text-xs sm:text-sm font-semibold">
                  {event.joinedCount} joined
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Organizer */}
        <div className="flex items-center p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center min-w-0 flex-1">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-purple-800 font-medium truncate text-sm sm:text-base">
              <span className="text-purple-600 text-xs mr-1">by</span>
              {event.createdByName || event.createdByUsername || 'Unknown'}
            </span>
          </div>
        </div>
        
        {/* Edit Button */}
        {showEditButton && (
          <div className="mt-3 sm:mt-4 flex justify-end">
            <EventEditButton
              eventId={event.id}
              createdById={event.createdById}
              className="px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300 hover:border-gray-400"
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
