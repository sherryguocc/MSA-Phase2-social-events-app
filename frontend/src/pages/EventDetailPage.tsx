import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../utils/apiClient";
import CommentSection from "../components/CommentSection";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useParams, useNavigate } from "react-router-dom";
import UserLink from "../components/UserLink";
import EventEditButton from "../components/EventEditButton";
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
  createdByUsername: string;
  createdByName?: string;
  createdByAvatarUrl?: string;
  createdById: number;
}

interface UserInfo {
  id: number;
  username: string;
  name?: string;
  avatarUrl?: string;
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const token = useSelector((state: RootState) => state.user.token);
  const reduxUser = useSelector((state: RootState) => state.user.userInfo);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState<UserInfo[]>([]);
  const [waitlist, setWaitlist] = useState<UserInfo[]>([]);
  const [interested, setInterested] = useState<UserInfo[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiGet(`/api/event/dto`)
      .then((data: EventItem[]) => {
        const found = data.find(e => e.id === Number(id));
        if (!found) throw new Error("Event not found");
        setEvent(found);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    apiGet(`/api/events/${id}/participants`).then(setParticipants);
    apiGet(`/api/events/${id}/waitlist`).then(setWaitlist);
    apiGet(`/api/events/${id}/interested`).then(setInterested);
  }, [id, actionLoading]);

  const handleJoin = async () => {
    if (!token) { navigate("/login"); return; }
    setActionLoading(true); setActionError("");
    try {
      await apiPost(`/api/events/${id}/join`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err: any) { setActionError(err.message || "Join failed"); }
    setActionLoading(false);
  };
  const handleCancel = async () => {
    if (!token) { navigate("/login"); return; }
    setActionLoading(true); setActionError("");
    try {
      await apiPost(`/api/events/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err: any) { setActionError(err.message || "Cancel failed"); }
    setActionLoading(false);
  };
  const handleInterest = async () => {
    if (!token) { navigate("/login"); return; }
    setActionLoading(true); setActionError("");
    try {
      await apiPost(`/api/events/${id}/interest`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err: any) { setActionError(err.message || "Interest failed"); }
    setActionLoading(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error || !event) return <div className="text-red-500">{error || "Event not found"}</div>;

  // Check if the event is over
  const isEventOver = new Date(event.eventTime).getTime() < Date.now();

  return (
    <>
      <div className="max-w-4xl mx-auto mt-4 sm:mt-8 p-4 sm:p-6 lg:p-8 bg-white rounded-xl sm:rounded-2xl shadow-lg">
        {/* Header Section */}
        <div className="relative mb-6 sm:mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 leading-tight flex-1 mr-2 sm:mr-4">
              {event.title}
            </h1>
            <EventEditButton eventId={event.id} createdById={event.createdById} />
          </div>
          
          {/* Event Status Badge */}
          {isEventOver && (
            <div className="absolute -top-2 right-0 sm:top-0 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold z-10">
              <span className="hidden sm:inline">Event Ended</span>
              <span className="sm:hidden">Ended</span>
            </div>
          )}
        </div>

        {/* Hero Image */}
        <div className="relative mb-6 sm:mb-8">
          <img
            src={event.imageUrl && event.imageUrl.trim() !== '' ? event.imageUrl : '/default-event.jpg'}
            alt={event.title}
            className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-lg sm:rounded-xl shadow-md"
            onError={e => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = '/default-event.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg sm:rounded-xl"></div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Description */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Description
              </h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line break-words overflow-wrap-anywhere">{event.description}</p>
            </div>

            {/* Quick Info Cards */}
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-200">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm sm:text-base font-semibold text-blue-800">Location</span>
                </div>
                <p className="text-sm sm:text-base text-blue-700 font-medium break-words">{event.location}</p>
              </div>

              <div className="bg-green-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-green-200">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm sm:text-base font-semibold text-green-800">Date & Time</span>
                </div>
                <p className="text-sm sm:text-base text-green-700 font-medium">{new Date(event.eventTime).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Event Info & Actions */}
          <div className="space-y-4 sm:space-y-6">
            {/* Organizer Card */}
            <div className="bg-purple-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-purple-200">
              <h3 className="text-base sm:text-lg font-semibold text-purple-800 mb-3 flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Organizer
              </h3>
              <div className="flex items-center">
                {event.createdById ? (
                  <UserLink id={event.createdById} username={event.createdByUsername || "Unknown"} name={event.createdByName} avatarUrl={event.createdByAvatarUrl} className="text-purple-700 hover:text-purple-900 font-medium text-sm sm:text-base" />
                ) : (
                  <span className="text-purple-700 font-medium text-sm sm:text-base">{event.createdByUsername || "Unknown"}</span>
                )}
              </div>
            </div>

            {/* Capacity Card */}
            <div className="bg-orange-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-orange-200">
              <h3 className="text-base sm:text-lg font-semibold text-orange-800 mb-3 flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Capacity
              </h3>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-orange-800">{participants.length}</div>
                <div className="text-orange-600 text-xs sm:text-sm">of {event.maxAttendees} max</div>
                <div className="text-orange-500 text-xs">Min: {event.minAttendees}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="bg-white border-2 border-gray-200 p-4 sm:p-6 rounded-lg sm:rounded-xl mb-6 sm:mb-8 shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Join This Event</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className={`w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg font-bold transition-all duration-200 text-sm sm:text-base ${
                reduxUser && participants.some(u => u.id === reduxUser.id)
                  ? "bg-green-600 text-white border-2 border-green-700 cursor-default shadow-md"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border-2 border-blue-700"
              }`}
              style={{
                backgroundColor: reduxUser && participants.some(u => u.id === reduxUser.id) 
                  ? '#059669' 
                  : '#2563eb',
                color: 'white'
              }}
              onClick={handleJoin}
              disabled={isEventOver || actionLoading || (!!reduxUser && participants.some(u => u.id === reduxUser.id))}
            >
              {actionLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Joining...</span>
                  <span className="sm:hidden">Joining</span>
                </div>
              ) : reduxUser && participants.some(u => u.id === reduxUser.id) ? (
                <>
                  <span className="hidden sm:inline">✓ Already Joined</span>
                  <span className="sm:hidden">✓ Joined</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">{`Join Event (${participants.length})`}</span>
                  <span className="sm:hidden">{`Join (${participants.length})`}</span>
                </>
              )}
            </button>
            
            <button 
              className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all duration-200 border-2 text-sm sm:text-base"
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                borderColor: '#b91c1c'
              }}
              onClick={handleCancel} 
              disabled={isEventOver || actionLoading}
            >
              {actionLoading ? (
                <>
                  <span className="hidden sm:inline">Processing...</span>
                  <span className="sm:hidden">Processing</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Cancel Participation</span>
                  <span className="sm:hidden">Cancel</span>
                </>
              )}
            </button>
            
            <button 
              className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all duration-200 border-2 text-sm sm:text-base"
              style={{
                backgroundColor: '#a16207',
                color: 'white',
                borderColor: '#92400e'
              }}
              onClick={handleInterest} 
              disabled={isEventOver || actionLoading}
            >
              {actionLoading ? (
                <>
                  <span className="hidden sm:inline">Processing...</span>
                  <span className="sm:hidden">Processing</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">{`Interested (${interested.length})`}</span>
                  <span className="sm:hidden">{`Interest (${interested.length})`}</span>
                </>
              )}
            </button>
          </div>
          
          {isEventOver && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                This event has ended. Participation and interest are closed.
              </div>
            </div>
          )}
          
          {actionError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {actionError}
              </div>
            </div>
          )}
        </div>
        {/* Participants Section */}
        <div className="space-y-4 sm:space-y-6">
          {/* Joined Users */}
          <div className="bg-green-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-green-200">
            <h3 className="text-lg sm:text-xl font-semibold text-green-800 mb-4 flex items-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Confirmed Participants ({participants.length})</span>
              <span className="sm:hidden">Participants ({participants.length})</span>
            </h3>
            {participants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {participants.map(u => (
                  <div key={u.id} className="flex items-center p-2 sm:p-3 bg-white rounded-lg shadow-sm border border-green-100">
                    <UserLink 
                      id={u.id} 
                      username={u.username} 
                      name={u.name} 
                      avatarUrl={u.avatarUrl} 
                      className="text-green-700 hover:text-green-900 font-medium text-sm sm:text-base" 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-green-600 italic text-sm sm:text-base">No confirmed participants yet. Be the first to join!</p>
            )}
          </div>

          {/* Interested Users */}
          <div className="bg-yellow-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-yellow-200">
            <h3 className="text-lg sm:text-xl font-semibold text-yellow-800 mb-4 flex items-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="hidden sm:inline">Interested Users ({interested.length})</span>
              <span className="sm:hidden">Interested ({interested.length})</span>
            </h3>
            {interested.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {interested.map(u => (
                  <div key={u.id} className="flex items-center p-2 sm:p-3 bg-white rounded-lg shadow-sm border border-yellow-100">
                    <UserLink 
                      id={u.id} 
                      username={u.username} 
                      name={u.name} 
                      avatarUrl={u.avatarUrl} 
                      className="text-yellow-700 hover:text-yellow-900 font-medium text-sm sm:text-base" 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-yellow-600 italic text-sm sm:text-base">No one has shown interest yet.</p>
            )}
          </div>

          {/* Waitlist */}
          {waitlist.length > 0 && (
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Waitlist ({waitlist.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {waitlist.map(u => (
                  <div key={u.id} className="flex items-center p-2 sm:p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <UserLink 
                      id={u.id} 
                      username={u.username} 
                      name={u.name} 
                      avatarUrl={u.avatarUrl} 
                      className="text-gray-700 hover:text-gray-900 font-medium text-sm sm:text-base" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Comments Section */}
        <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-md border border-gray-100">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="hidden sm:inline">Comments & Discussion</span>
            <span className="sm:hidden">Comments</span>
          </h3>
          <CommentSection eventId={event.id} />
        </div>
      </div>
      <ScrollToTopButton />
    </>
  );
};

export default EventDetailPage;
