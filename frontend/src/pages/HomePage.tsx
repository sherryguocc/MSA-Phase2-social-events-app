import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import EventList from '../components/EventList';

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

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = useSelector((state: RootState) => state.user.token);
  const reduxUser = useSelector((state: RootState) => state.user.userInfo);
  const [user, setUser] = useState(reduxUser);
  useEffect(() => {
    if (!user && token) {
      fetch("/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch user info");
          return res.json();
        })
        .then(data => setUser(data))
        .catch(() => {});
    }
  }, [token, reduxUser, user]);

  // Sorting state
  const [sortType, setSortType] = useState<'time' | 'name' | 'maxAttendees'>('time');

  useEffect(() => {
    fetch("/api/event/dto")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then(async data => {
        // 批量获取 joinedCount
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
        // 合并 joinedCount 到 events
        setEvents(data.map((e: any) => ({ ...e, joinedCount: joinedCounts[e.id] ?? 0 })));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Sort events based on sortType
  const sortedEvents = [...events].sort((a, b) => {
    if (sortType === 'time') {
      return new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime();
    } else if (sortType === 'name') {
      return a.title.localeCompare(b.title);
    } else if (sortType === 'maxAttendees') {
      return b.maxAttendees - a.maxAttendees;
    }
    return 0;
  });


  return (
    <div className="w-full max-w-7xl mx-auto mt-10 relative px-4">
      <h2 className="text-3xl font-bold mb-6">All Events</h2>
      <div className="mb-4 flex gap-2 items-center">
        <span className="font-semibold">Sort by:</span>
        <button className={`btn btn-xs ${sortType === 'time' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSortType('time')}>Time</button>
        <button className={`btn btn-xs ${sortType === 'name' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSortType('name')}>Name</button>
        <button className={`btn btn-xs ${sortType === 'maxAttendees' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSortType('maxAttendees')}>Max Attendees</button>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <EventList events={sortedEvents} showEditButton={true} />
    </div>
  );
};

export default HomePage;
