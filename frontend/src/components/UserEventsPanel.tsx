import React, { useEffect, useState } from "react";
import EventList from "./EventList";

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
    fetch(`/api/event/by-user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then(async data => {
        const ids = data.map((e: any) => e.id);
        let joinedCounts: Record<number, number> = {};
        if (ids.length > 0) {
          const res = await fetch("/api/event/joined-counts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ids)
          });
          if (res.ok) {
            joinedCounts = await res.json();
          }
        }
        setMyEvents(data.map((e: any) => ({ ...e, joinedCount: joinedCounts[e.id] ?? 0 })));
      })
      .catch(err => setError(err.message));

    // Joined events
    fetch(`/api/users/${userId}/joined`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch joined events");
        return res.json();
      })
      .then(async data => {
        const ids = data.map((e: any) => e.id);
        let joinedCounts: Record<number, number> = {};
        if (ids.length > 0) {
          const res = await fetch("/api/event/joined-counts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ids)
          });
          if (res.ok) {
            joinedCounts = await res.json();
          }
        }
        setJoinedEvents(data.map((e: any) => ({ ...e, joinedCount: joinedCounts[e.id] ?? 0 })));
      })
      .catch(() => {});

    // Interested events
    fetch(`/api/users/${userId}/interested`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch interested events");
        return res.json();
      })
      .then(async data => {
        const ids = data.map((e: any) => e.id);
        let joinedCounts: Record<number, number> = {};
        if (ids.length > 0) {
          const res = await fetch("/api/event/joined-counts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ids)
          });
          if (res.ok) {
            joinedCounts = await res.json();
          }
        }
        setInterestedEvents(data.map((e: any) => ({ ...e, joinedCount: joinedCounts[e.id] ?? 0 })));
      })
      .catch(() => {});

    // Waitlist events only current user
    if (String(userId) === String(currentUserId)) {
      fetch(`/api/users/${userId}/waitlist`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch waitlist events");
          return res.json();
        })
        .then(async data => {
          const ids = data.map((e: any) => e.id);
          let joinedCounts: Record<number, number> = {};
          if (ids.length > 0) {
            const res = await fetch("/api/event/joined-counts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(ids)
            });
            if (res.ok) {
              joinedCounts = await res.json();
            }
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
    <>
      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-4">{isOwn ? "My Events" : `Events created by ${displayName}`}</h3>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : myEvents.length === 0 ? (
          <div className="text-center text-gray-400">No events</div>
        ) : (
          <EventList events={myEvents} showEditButton={false} />
        )}
      </div>
      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-4">{isOwn ? "Events I Joined" : `Events joined by ${displayName}`}</h3>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : joinedEvents.length === 0 ? (
          <div className="text-center text-gray-400">No joined events</div>
        ) : (
          <EventList events={joinedEvents} showEditButton={false} />
        )}
      </div>
      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-4">{isOwn ? "Events I'm Interested In" : `Events interested by ${displayName}`}</h3>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : interestedEvents.length === 0 ? (
          <div className="text-center text-gray-400">No interested events</div>
        ) : (
          <EventList events={interestedEvents} showEditButton={false} />
        )}
      </div>
      {isOwn && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-4">Events I'm on the Waitlist</h3>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : waitlistEvents.length === 0 ? (
            <div className="text-center text-gray-400">No waitlist events</div>
          ) : (
            <EventList events={waitlistEvents} showEditButton={false} />
          )}
        </div>
      )}
    </>
  );
};

export default UserEventsPanel;
