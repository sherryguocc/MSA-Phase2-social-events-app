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
  const [timeFilter, setTimeFilter] = useState<string>('');

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

  // Time filter helper functions
  const getTimeFilterDateRange = (filter: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'this-week': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return { start: startOfWeek, end: endOfWeek };
      }
      case 'next-week': {
        const startOfNextWeek = new Date(today);
        startOfNextWeek.setDate(today.getDate() + (7 - today.getDay()));
        const endOfNextWeek = new Date(startOfNextWeek);
        endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
        endOfNextWeek.setHours(23, 59, 59, 999);
        return { start: startOfNextWeek, end: endOfNextWeek };
      }
      case 'this-month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        return { start: startOfMonth, end: endOfMonth };
      }
      case 'next-month': {
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        endOfNextMonth.setHours(23, 59, 59, 999);
        return { start: startOfNextMonth, end: endOfNextMonth };
      }
      default:
        return null;
    }
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

    // Time filter
    if (timeFilter) {
      const timeRange = getTimeFilterDateRange(timeFilter);
      if (timeRange) {
        const eventDate = new Date(event.eventTime);
        if (eventDate < timeRange.start || eventDate > timeRange.end) {
          return false;
        }
      }
    }

    // Active filters - ALL selected filters must be satisfied (AND logic)
    if (activeFilters.size > 0) {
      const joinedCount = event.joinedCount || 0;
      const now = new Date();
      const eventDate = new Date(event.eventTime);
      
      // Check each active filter - all must be satisfied
      for (const filter of activeFilters) {
        if (filter === 'upcoming-only') {
          // Events that are in the future
          if (eventDate < now) {
            return false;
          }
        }
        
        if (filter === 'available') {
          // Events with available spots
          if (joinedCount >= event.maxAttendees) {
            return false;
          }
        }
        
        if (filter === 'minimum-reached') {
          // Events that have reached minimum attendees
          if (joinedCount < event.minAttendees) {
            return false;
          }
        }
        
        if (filter === 'almost-full') {
          // Events that are almost full (80% or more of max capacity)
          const fillPercentage = joinedCount / event.maxAttendees;
          if (fillPercentage < 0.8) {
            return false;
          }
        }
      }
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
          
          {/* Time Filter Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select 
                className="select select-bordered select-xs sm:select-sm text-xs sm:text-sm max-w-xs 
                         bg-gradient-to-r from-base-100 to-base-200 border-2 border-base-300 
                         focus:border-primary focus:outline-none transition-all duration-300
                         hover:border-primary/50 hover:shadow-md
                         appearance-none cursor-pointer
                         pr-8 pl-3"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="">All Time</option>
                <option value="this-week">This Week</option>
                <option value="next-week">Next Week</option>
                <option value="this-month">This Month</option>
                <option value="next-month">Next Month</option>
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-3 h-3 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {timeFilter && (
              <button
                onClick={() => setTimeFilter('')}
                className="btn btn-ghost btn-xs text-xs text-base-content/60 hover:text-base-content 
                          hover:bg-base-200 rounded-full w-6 h-6 p-0 flex items-center justify-center
                          transition-all duration-200 hover:scale-110"
                title="Clear time filter"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Status Filters */}
          <div className="flex gap-1 sm:gap-2 flex-wrap">
            <button 
              className={`btn btn-xs sm:btn-sm text-xs sm:text-sm transition-all duration-200 ${
                activeFilters.has('upcoming-only') 
                  ? '!bg-purple-500 !text-white !border-purple-400 shadow-lg shadow-purple-200 hover:!bg-purple-600' 
                  : 'btn-outline btn-accent hover:btn-accent'
              }`}
              onClick={() => toggleFilter('upcoming-only')}
            >
              Upcoming {activeFilters.has('upcoming-only') && <span className="ml-1 font-bold">✓</span>}
            </button>
            <button 
              className={`btn btn-xs sm:btn-sm text-xs sm:text-sm transition-all duration-200 ${
                activeFilters.has('available') 
                  ? '!bg-green-500 !text-white !border-green-400 shadow-lg shadow-green-200 hover:!bg-green-600' 
                  : 'btn-outline btn-success hover:btn-success'
              }`}
              onClick={() => toggleFilter('available')}
            >
              🟢 Available {activeFilters.has('available') && <span className="ml-1 font-bold">✓</span>}
            </button>
            <button 
              className={`btn btn-xs sm:btn-sm text-xs sm:text-sm transition-all duration-200 ${
                activeFilters.has('minimum-reached') 
                  ? '!bg-blue-500 !text-white !border-blue-400 shadow-lg shadow-blue-200 hover:!bg-blue-600' 
                  : 'btn-outline btn-info hover:btn-info'
              }`}
              onClick={() => toggleFilter('minimum-reached')}
            >
              ✅ Confirmed {activeFilters.has('minimum-reached') && <span className="ml-1 font-bold">✓</span>}
            </button>
            <button 
              className={`btn btn-xs sm:btn-sm text-xs sm:text-sm transition-all duration-200 ${
                activeFilters.has('almost-full') 
                  ? '!bg-orange-500 !text-white !border-orange-400 shadow-lg shadow-orange-200 hover:!bg-orange-600' 
                  : 'btn-outline btn-warning hover:btn-warning'
              }`}
              onClick={() => toggleFilter('almost-full')}
            >
              🔥 Almost Full {activeFilters.has('almost-full') && <span className="ml-1 font-bold">✓</span>}
            </button>
          </div>
        </div>
        {/* Fixed space for filter results - always present to prevent layout shift */}
        <div className="h-6 flex items-center gap-2">
          {(activeFilters.size > 0 || timeFilter) && (
            <>
              <span className="text-xs text-base-content/70">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} match 
                {timeFilter && (
                  <span className="font-semibold ml-1">
                    {timeFilter === 'this-week' && 'This Week'}
                    {timeFilter === 'next-week' && 'Next Week'}
                    {timeFilter === 'this-month' && 'This Month'}
                    {timeFilter === 'next-month' && 'Next Month'}
                  </span>
                )}
                {timeFilter && activeFilters.size > 0 && ' + '}
                {activeFilters.size > 0 && (
                  <span className="font-semibold">
                    {Array.from(activeFilters).map(filter => {
                      const filterNames = {
                        'upcoming-only': 'Upcoming',
                        'available': 'Available',
                        'minimum-reached': 'Confirmed', 
                        'almost-full': 'Almost Full'
                      };
                      return filterNames[filter as keyof typeof filterNames];
                    }).join(' + ')}
                  </span>
                )}
                {activeFilters.size > 1 && ' filters'}
                {activeFilters.size === 1 && ' filter'}
              </span>
              <button 
                onClick={() => {
                  setActiveFilters(new Set());
                  setTimeFilter('');
                }}
                className="btn btn-ghost btn-xs text-xs text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
              >
                Clear all
              </button>
            </>
          )}
        </div>
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
