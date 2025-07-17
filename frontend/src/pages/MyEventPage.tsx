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
    <div className="max-w-7xl mx-auto mt-4 sm:mt-10 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2 text-center">My Events Dashboard</h2>
        <p className="text-sm sm:text-base text-gray-600 text-center">Manage and view all your events in one place</p>
      </div>
      
      {/* Navigation Pills - Mobile Vertical Stack */}
      <div className="mb-6 sm:mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
          <button 
            className="px-3 sm:px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors font-medium text-xs sm:text-base text-center"
            onClick={() => scrollToSection('created')}
          >
            <span className="block sm:inline">📝 Created</span>
            <span className="block sm:inline sm:ml-1">({myEvents.length})</span>
          </button>
          <button 
            className="px-3 sm:px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors font-medium text-xs sm:text-base text-center"
            onClick={() => scrollToSection('joined')}
          >
            <span className="block sm:inline">✅ Joined</span>
            <span className="block sm:inline sm:ml-1">({joinedEvents.length})</span>
          </button>
          <button 
            className="px-3 sm:px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors font-medium text-xs sm:text-base text-center"
            onClick={() => scrollToSection('interested')}
          >
            <span className="block sm:inline">⭐ Interested</span>
            <span className="block sm:inline sm:ml-1">({interestedEvents.length})</span>
          </button>
          <button 
            className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium text-xs sm:text-base text-center col-span-2 sm:col-span-1"
            onClick={() => scrollToSection('waitlist')}
          >
            <span className="block sm:inline">⏳ Waitlist</span>
            <span className="block sm:inline sm:ml-1">({waitlistEvents.length})</span>
          </button>
        </div>
      </div>

      {/* Events Sections */}
      <div className="space-y-8 sm:space-y-12">
        <section id="created" className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          {/* Event Deletion Policy Notice */}
          <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-3 sm:p-4 rounded-lg shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm text-amber-800">
                  <strong className="font-semibold">📝 Event Deletion Policy:</strong> To prevent misuse of website resources and encourage thoughtful event creation, users cannot delete events. If you really need to delete an event, please contact the administrator at{' '}
                  <a 
                    href="mailto:sherryguocc@gmail.com" 
                    className="font-medium text-amber-900 underline hover:text-amber-700 transition-colors"
                  >
                    sherryguocc@gmail.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
          
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
