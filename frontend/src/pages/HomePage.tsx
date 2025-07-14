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

  // Sorting and search state
  const [sortType, setSortType] = useState<'time' | 'name' | 'maxAttendees' | 'location' | 'organizer'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter state
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  // Handle sort button clicks with toggle functionality
  const handleSortClick = (newSortType: 'time' | 'name' | 'maxAttendees' | 'location' | 'organizer') => {
    if (sortType === newSortType) {
      // Same sort type, toggle order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Different sort type, set new type and default order
      setSortType(newSortType);
      setSortOrder('asc');
    }
  };

  // Handle filter toggle
  const toggleFilter = (filterType: string) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(filterType)) {
      newFilters.delete(filterType);
    } else {
      newFilters.add(filterType);
    }
    setActiveFilters(newFilters);
  };

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

  // Filter events based on search term and active filters
  const filteredEvents = events.filter(event => {
    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = (
        event.title.toLowerCase().includes(search) ||
        event.description.toLowerCase().includes(search) ||
        event.location.toLowerCase().includes(search) ||
        event.createdByUsername.toLowerCase().includes(search)
      );
      if (!matchesSearch) return false;
    }

    // Active filters
    if (activeFilters.size > 0) {
      const joinedCount = event.joinedCount || 0;
      
      // Check if event matches any of the active filters
      let matchesFilter = false;
      
      if (activeFilters.has('available')) {
        // Events with available spots
        if (joinedCount < event.maxAttendees) {
          matchesFilter = true;
        }
      }
      
      if (activeFilters.has('minimum-reached')) {
        // Events that have reached minimum attendees
        if (joinedCount >= event.minAttendees) {
          matchesFilter = true;
        }
      }
      
      if (activeFilters.has('almost-full')) {
        // Events that are almost full (80% or more of max capacity)
        const fillPercentage = joinedCount / event.maxAttendees;
        if (fillPercentage >= 0.8) {
          matchesFilter = true;
        }
      }
      
      if (!matchesFilter) return false;
    }

    return true;
  });

  // Sort filtered events based on sortType and sortOrder
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    let comparison = 0;
    
    if (sortType === 'time') {
      comparison = new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime();
    } else if (sortType === 'name') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortType === 'maxAttendees') {
      comparison = a.maxAttendees - b.maxAttendees;
    } else if (sortType === 'location') {
      comparison = a.location.localeCompare(b.location);
    } else if (sortType === 'organizer') {
      comparison = a.createdByUsername.localeCompare(b.createdByUsername);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });


  return (
    <div className="w-full max-w-7xl mx-auto mt-4 sm:mt-10 relative px-2 sm:px-4">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center sm:text-left">All Events</h2>
      
      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search events by title, description, location, or creator..."
            className="input input-bordered w-full pl-10 pr-4 py-2 text-sm sm:text-base bg-gradient-to-r from-base-100 to-base-200 border-2 border-base-300 focus:border-primary focus:outline-none transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60 hover:text-base-content transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-base-content/70">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found for "{searchTerm}"
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-2">
          <span className="font-semibold text-sm sm:text-base">Filters:</span>
          <div className="flex gap-1 sm:gap-2 flex-wrap">
            <button 
              className={`btn btn-xs sm:btn-sm text-xs sm:text-sm ${activeFilters.has('available') ? 'btn-success' : 'btn-outline'}`}
              onClick={() => toggleFilter('available')}
            >
              🟢 Available Spots
            </button>
            <button 
              className={`btn btn-xs sm:btn-sm text-xs sm:text-sm ${activeFilters.has('minimum-reached') ? 'btn-info' : 'btn-outline'}`}
              onClick={() => toggleFilter('minimum-reached')}
            >
              ✅ Min. Reached
            </button>
            <button 
              className={`btn btn-xs sm:btn-sm text-xs sm:text-sm ${activeFilters.has('almost-full') ? 'btn-warning' : 'btn-outline'}`}
              onClick={() => toggleFilter('almost-full')}
            >
              🔥 Almost Full
            </button>
          </div>
        </div>
        {activeFilters.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-base-content/70">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} match your filters
            </span>
            <button 
              onClick={() => setActiveFilters(new Set())}
              className="btn btn-ghost btn-xs text-xs text-base-content/60 hover:text-base-content"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Sort Controls */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <span className="font-semibold text-sm sm:text-base">Sort by:</span>
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <button 
            className={`btn btn-xs sm:btn-sm text-xs sm:text-sm ${sortType === 'time' ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => handleSortClick('time')}
          >
            Time {sortType === 'time' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            className={`btn btn-xs sm:btn-sm text-xs sm:text-sm ${sortType === 'name' ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => handleSortClick('name')}
          >
            Name {sortType === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            className={`btn btn-xs sm:btn-sm text-xs sm:text-sm ${sortType === 'maxAttendees' ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => handleSortClick('maxAttendees')}
          >
            Max Attendees {sortType === 'maxAttendees' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            className={`btn btn-xs sm:btn-sm text-xs sm:text-sm ${sortType === 'location' ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => handleSortClick('location')}
          >
            Location {sortType === 'location' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button 
            className={`btn btn-xs sm:btn-sm text-xs sm:text-sm ${sortType === 'organizer' ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => handleSortClick('organizer')}
          >
            Organizer {sortType === 'organizer' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>
      {loading && <div className="text-center text-sm sm:text-base">Loading...</div>}
      {error && <div className="text-red-500 text-center text-sm sm:text-base">{error}</div>}
      {!loading && !error && sortedEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">
            {searchTerm ? 'No events found' : 'No events available'}
          </h3>
          <p className="text-base-content/70">
            {searchTerm ? (
              <>
                Try adjusting your search terms or{' '}
                <button 
                  onClick={() => setSearchTerm('')}
                  className="link link-primary"
                >
                  clear search
                </button>
                {' '}to see all events.
              </>
            ) : (
              'No events have been created yet. Be the first to create one!'
            )}
          </p>
        </div>
      )}
      {!loading && !error && sortedEvents.length > 0 && (
        <EventList events={sortedEvents} showEditButton={true} />
      )}
    </div>
  );
};

export default HomePage;
