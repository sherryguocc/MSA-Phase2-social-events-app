import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import HorizontalEventList from "../components/HorizontalEventList";
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
        // Batch fetch joinedCount
        const ids = data.map((e: any) => e.id);
        let joinedCounts: Record<number, number> = {};
        if (ids.length > 0) {
          joinedCounts = await apiPost("/api/event/joined-counts", ids);
        }
        setMyEvents(data.map((e: any) => ({ ...e, joinedCount: joinedCounts[e.id] ?? 0 })));
      })
      .catch(() => {});
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
  if (!user) return <div className="text-center p-4">Loading user info...</div>;

  return (
    <div className="max-w-7xl mx-auto mt-4 sm:mt-10 px-2 sm:px-4">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2 text-center sm:text-left">My Events Dashboard</h2>
        <p className="text-sm sm:text-base text-gray-600 text-center sm:text-left">Manage and view all your events in one place</p>
      </div>
      
      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <button 
          className="px-3 sm:px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm sm:text-base"
          onClick={() => scrollToSection('created')}
        >
          📝 Created ({myEvents.length})
        </button>
        <button 
          className="px-3 sm:px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm sm:text-base"
          onClick={() => scrollToSection('joined')}
        >
          ✅ Joined ({joinedEvents.length})
        </button>
        <button 
          className="px-3 sm:px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors font-medium text-sm sm:text-base"
          onClick={() => scrollToSection('interested')}
        >
          ⭐ Interested ({interestedEvents.length})
        </button>
        <button 
          className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base"
          onClick={() => scrollToSection('waitlist')}
        >
          ⏳ Waitlist ({waitlistEvents.length})
        </button>
      </div>

      {/* Events Sections */}
      <div className="space-y-8 sm:space-y-12">
        <section id="created" className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <HorizontalEventList 
            events={myEvents} 
            showEditButton={true} 
            title="📝 Created Events"
          />
        </section>

        <section id="joined" className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <HorizontalEventList 
            events={joinedEvents} 
            showEditButton={false} 
            title="✅ Joined Events"
          />
        </section>

        <section id="interested" className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <HorizontalEventList 
            events={interestedEvents} 
            showEditButton={false} 
            title="⭐ Interested Events"
          />
        </section>

        <section id="waitlist" className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <HorizontalEventList 
            events={waitlistEvents} 
            showEditButton={false} 
            title="⏳ Waitlist Events"
          />
        </section>
      </div>
    </div>
  );
};

export default MyEventPage;
