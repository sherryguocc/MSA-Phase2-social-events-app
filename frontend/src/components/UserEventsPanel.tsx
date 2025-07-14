import React, { useEffect, useState } from "react";
import HorizontalEventList from "./HorizontalEventList";
import { apiGet, apiPost } from "../utils/apiClient";

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
  joinedCount?: number;
}

interface UserEventsPanelProps {
  userId: string | number;
  username?: string;
  name?: string;
  token: string;
  currentUserId?: string | number;
}

const UserEventsPanel: React.FC<UserEventsPanelProps> = ({ userId, username, name, token, currentUserId }) => {
  const [waitlistEvents, setWaitlistEvents] = useState<EventItem[]>([]);
  const [myEvents, setMyEvents] = useState<EventItem[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<EventItem[]>([]);
  const [interestedEvents, setInterestedEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !userId) return;
    setLoading(true);
    setError("");
    // Created events
    apiGet(`/api/event/by-user/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async data => {
        const ids = data.map((e: any) => e.id);
        let joinedCounts: Record<number, number> = {};
        if (ids.length > 0) {
          joinedCounts = await apiPost("/api/event/joined-counts", ids);
        }
        setMyEvents(data.map((e: any) => ({ ...e, joinedCount: joinedCounts[e.id] ?? 0 })));
      })
      .catch(err => setError(err.message));

    // Joined events
    apiGet(`/api/users/${userId}/joined`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async data => {
        const ids = data.map((e: any) => e.id);
        let joinedCounts: Record<number, number> = {};
        if (ids.length > 0) {
          joinedCounts = await apiPost("/api/event/joined-counts", ids);
        }
        setJoinedEvents(data.map((e: any) => ({ ...e, joinedCount: joinedCounts[e.id] ?? 0 })));
      })
      .catch(() => {});

    // Interested events
    apiGet(`/api/users/${userId}/interested`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async data => {
        const ids = data.map((e: any) => e.id);
        let joinedCounts: Record<number, number> = {};
        if (ids.length > 0) {
          joinedCounts = await apiPost("/api/event/joined-counts", ids);
        }
        setInterestedEvents(data.map((e: any) => ({ ...e, joinedCount: joinedCounts[e.id] ?? 0 })));
      })
      .catch(() => {});

    // Waitlist events only current user
    if (String(userId) === String(currentUserId)) {
      apiGet(`/api/users/${userId}/waitlist`, { headers: { Authorization: `Bearer ${token}` } })
        .then(async data => {
          const ids = data.map((e: any) => e.id);
          let joinedCounts: Record<number, number> = {};
          if (ids.length > 0) {
            joinedCounts = await apiPost("/api/event/joined-counts", ids);
          }
          setWaitlistEvents(data.map((e: any) => ({ ...e, joinedCount: joinedCounts[e.id] ?? 0 })));
        })
        .catch(() => {});
    } else {
      setWaitlistEvents([]);
    }

    setLoading(false);
  }, [token, userId, currentUserId]);

  const isOwn = String(userId) === String(currentUserId);
  const displayName = name && name.trim() !== '' ? name : username || "this user";
  return (
    <div className="space-y-8 sm:space-y-12">
      <section className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <HorizontalEventList 
          events={myEvents} 
          showEditButton={false} 
          title={`📝 ${isOwn ? "My Events" : `Events created by ${displayName}`}`}
        />
        {loading && (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        )}
        {error && (
          <div className="text-center text-red-500 py-8">{error}</div>
        )}
      </section>

      <section className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <HorizontalEventList 
          events={joinedEvents} 
          showEditButton={false} 
          title={`✅ ${isOwn ? "Events I Joined" : `Events joined by ${displayName}`}`}
        />
        {loading && (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        )}
      </section>

      <section className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <HorizontalEventList 
          events={interestedEvents} 
          showEditButton={false} 
          title={`⭐ ${isOwn ? "Events I'm Interested In" : `Events interested by ${displayName}`}`}
        />
        {loading && (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        )}
      </section>

      {isOwn && (
        <section className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <HorizontalEventList 
            events={waitlistEvents} 
            showEditButton={false} 
            title="⏳ Events I'm on the Waitlist"
          />
          {loading && (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          )}
        </section>
      )}
    </div>
  );
};

export default UserEventsPanel;
