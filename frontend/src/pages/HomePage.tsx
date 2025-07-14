import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import EventList from '../components/EventList';
import { apiGet, apiPost } from '../utils/apiClient';

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
      apiGet("/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(data => setUser(data))
        .catch(err => {
          console.error("Failed to fetch user info", err);
        });
    }
  }, [token, reduxUser, user]);

  // Sorting state
  const [sortType, setSortType] = useState<'time' | 'name' | 'maxAttendees'>('time');

  useEffect(() => {
    apiGet("/api/event/dto")
      .then(async data => {
        const ids = data.map((e: any) => e.id);
        let joinedCounts: Record<number, number> = {};
        if (ids.length > 0) {
          joinedCounts = await apiPost("/api/event/joined-counts", ids);
        }
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
    <div className="w-full max-w-7xl mx-auto mt-4 sm:mt-10 relative px-2 sm:px-4">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center sm:text-left">All Events</h2>
      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <span className="font-semibold text-sm sm:text-base">Sort by:</span>
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <button className={`btn btn-xs sm:btn-sm text-xs sm:text-sm ${sortType === 'time' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSortType('time')}>Time</button>
          <button className={`btn btn-xs sm:btn-sm text-xs sm:text-sm ${sortType === 'name' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSortType('name')}>Name</button>
          <button className={`btn btn-xs sm:btn-sm text-xs sm:text-sm ${sortType === 'maxAttendees' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSortType('maxAttendees')}>Max Attendees</button>
        </div>
      </div>
      {loading && <div className="text-center text-sm sm:text-base">Loading...</div>}
      {error && <div className="text-red-500 text-center text-sm sm:text-base">{error}</div>}
      <EventList events={sortedEvents} showEditButton={true} />
    </div>
  );
};

export default HomePage;
