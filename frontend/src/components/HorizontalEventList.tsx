import React from "react";
import { useNavigate } from "react-router-dom";
import EventEditButton from "./EventEditButton";

export interface HorizontalEventCardProps {
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
    joinedCount?: number;
  };
  showEditButton?: boolean;
}

interface HorizontalEventListProps {
  events: HorizontalEventCardProps['event'][];
  showEditButton?: boolean;
  title?: string;
}

const HorizontalEventCard: React.FC<HorizontalEventCardProps> = ({ event, showEditButton = true }) => {
  const navigate = useNavigate();
  
  // Check if the event is over
  const isEventOver = new Date(event.eventTime).getTime() < Date.now();
  
  return (
    <div
      className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden border border-gray-100"
      onClick={() => navigate(`/event/${event.id}`)}
    >
      {/* Compact Image */}
      <div className="relative h-32 sm:h-40">
        <img
          src={event.imageUrl && event.imageUrl.trim() !== '' ? event.imageUrl : '/default-event.jpg'}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={e => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = '/default-event.jpg'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        
        {/* Event Status Badge */}
        {isEventOver && (
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-red-500 text-white px-1 sm:px-2 py-1 rounded-full text-xs font-semibold shadow-md">
            Ended
          </div>
        )}
        
        {/* Participation Status Badge */}
        {typeof event.joinedCount === 'number' && (
          <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 bg-white/90 backdrop-blur-sm px-1 sm:px-2 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-md">
            {event.joinedCount}/{event.maxAttendees}
          </div>
        )}
      </div>
      
      {/* Compact Content */}
      <div className="p-3 sm:p-4">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 leading-tight line-clamp-2">
          {event.title}
        </h3>
        
        {/* Compact Info Grid */}
        <div className="space-y-2 mb-3">
          {/* Location */}
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-700 truncate">{event.location}</span>
          </div>
          
          {/* Date and Time */}
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-700">
              {new Date(event.eventTime).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </span>
          </div>
          
          {/* Capacity */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-gray-700">{event.minAttendees}-{event.maxAttendees}</span>
            </div>
          </div>
          
          {/* Organizer */}
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-purple-600 text-xs mr-1">by</span>
            <span className="text-gray-700 truncate">{event.createdByUsername || 'Unknown'}</span>
          </div>
        </div>
        
        {/* Edit Button */}
        {showEditButton && (
          <div className="flex justify-end">
            <EventEditButton
              eventId={event.id}
              createdById={event.createdById}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors border border-gray-300 hover:border-gray-400"
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const HorizontalEventList: React.FC<HorizontalEventListProps> = ({ 
  events, 
  showEditButton = true, 
  title = "Events" 
}) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">{title} ({events.length})</h2>
        {events.length > 0 && (
          <p className="text-gray-600 text-xs sm:text-sm">Scroll horizontally to see more events</p>
        )}
      </div>
      
      {/* Events Container */}
      {events.length > 0 ? (
        <div className="overflow-x-auto pb-4 horizontal-scroll">
          <div className="flex gap-4 sm:gap-6 w-max">
            {events.map(event => (
              <HorizontalEventCard
                key={event.id}
                event={event}
                showEditButton={showEditButton}
              />
            ))}
          </div>
          
          {/* Scroll Indicator */}
          <div className="flex justify-center mt-3 sm:mt-4">
            <div className="flex items-center text-gray-500 text-xs sm:text-sm bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span className="hidden sm:inline">Scroll horizontally to see more</span>
              <span className="sm:hidden">Scroll to see more</span>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl border border-gray-200">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No events found</h3>
          <p className="text-sm sm:text-base text-gray-500">There are no events to display at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default HorizontalEventList;
