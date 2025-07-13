import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import EventList from "../components/EventList";
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

const MyEventPage: React.FC = () => {
  const token = useSelector((state: RootState) => state.user.token);
  const reduxUser = useSelector((state: RootState) => state.user.userInfo);
  const [user, setUser] = useState(reduxUser);
  useEffect(() => {
    if (!token) return;
    if (!user) {
      apiGet("/api/user/me", { headers: { Authorization: `Bearer ${token}` } })
        .then(data => {
          setUser(data);
        })
        .catch(() => {});
    }
  }, [token, user]);
  const [myEvents, setMyEvents] = useState<EventItem[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<EventItem[]>([]);
  const [interestedEvents, setInterestedEvents] = useState<EventItem[]>([]);
  const [waitlistEvents, setWaitlistEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!user) {
      return;
    }
    if (!user.id) {
      // setError("User info error, please re-login.");
      return;
    }
    // Fetch events created by me
    apiGet(`/api/event/by-user/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async data => {
        // 批量获取 joinedCount
        const ids = data.map((e: any) => e.id);
        let joinedCounts: Record<number, number> = {};
        if (ids.length > 0) {
          joinedCounts = await apiPost("/api/event/joined-counts", ids);
        }
        setMyEvents(data.map((e: any) => ({ ...e, joinedCount: joinedCounts[e.id] ?? 0 })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, user, navigate]);

  // Fetch joined, interested, and waitlist events
  useEffect(() => {
    if (!token || !user?.id) return;
    // Fetch joined events
    apiGet(`/api/users/${user.id}/joined`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (data: any[]) => {
        const ids = data.map(e => e.id);
        let joinedCounts: Record<number, number> = {};
        if (ids.length > 0) {
          joinedCounts = await apiPost("/api/event/joined-counts", ids);
        }
        setJoinedEvents(data.map(e => ({ ...e, joinedCount: joinedCounts[e.id] ?? 0 })));
      })
      .catch(() => {});
    // Fetch interested events
    apiGet(`/api/users/${user.id}/interested`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (data: any[]) => {
        const ids = data.map(e => e.id);
        let joinedCounts: Record<number, number> = {};
        if (ids.length > 0) {
          joinedCounts = await apiPost("/api/event/joined-counts", ids);
        }
        setInterestedEvents(data.map(e => ({ ...e, joinedCount: joinedCounts[e.id] ?? 0 })));
      })
      .catch(() => {});
    // Fetch waitlist events
    apiGet(`/api/users/${user.id}/waitlist`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (data: any[]) => {
        const ids = data.map(e => e.id);
        let joinedCounts: Record<number, number> = {};
        if (ids.length > 0) {
          joinedCounts = await apiPost("/api/event/joined-counts", ids);
        }
        setWaitlistEvents(data.map(e => ({ ...e, joinedCount: joinedCounts[e.id] ?? 0 })));
      })
      .catch(() => {});
  }, [token, user]);

  // scroll to section helper
  if (!user) return <div>Loading user info...</div>;
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (!token) return null;
  if (!user) return <div>Loading user info...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-4">My Events</h2>
      <div className="flex gap-2 mb-6 sticky top-0 bg-base-200 z-10 p-2 rounded shadow">
        <button className="btn btn-sm btn-outline" onClick={() => scrollToSection('created')}>Created</button>
        <button className="btn btn-sm btn-outline" onClick={() => scrollToSection('joined')}>Joined</button>
        <button className="btn btn-sm btn-outline" onClick={() => scrollToSection('interested')}>Interested</button>
        <button className="btn btn-sm btn-outline" onClick={() => scrollToSection('waitlist')}>Waitlist</button>
      </div>
      <section id="created">
        <h3 className="text-xl font-bold mb-2">Created Events</h3>
        <EventList events={myEvents} showEditButton={true} />
        {(!loading && myEvents.length === 0) && <div className="col-span-2 text-gray-500">No events created yet.</div>}
      </section>
      <section id="joined" className="mt-10">
        <h3 className="text-xl font-bold mb-2">Joined Events</h3>
        <EventList events={joinedEvents} showEditButton={false} />
        {(!loading && joinedEvents.length === 0) && <div className="col-span-2 text-gray-500">No joined events.</div>}
      </section>
      <section id="interested" className="mt-10">
        <h3 className="text-xl font-bold mb-2">Interested Events</h3>
        <EventList events={interestedEvents} showEditButton={false} />
        {(!loading && interestedEvents.length === 0) && <div className="col-span-2 text-gray-500">No interested events.</div>}
      </section>
      <section id="waitlist" className="mt-10">
        <h3 className="text-xl font-bold mb-2">Events I have been in the waitlist</h3>
        <EventList events={waitlistEvents} showEditButton={false} />
        {(!loading && waitlistEvents.length === 0) && <div className="col-span-2 text-gray-500">Not in any event waitlist.</div>}
      </section>
    </div>
  );
};

export default MyEventPage;
