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
    <div className="w-full max-w-7xl mx-auto mt-4 sm:mt-10 relative px-2 sm:px-4 min-h-screen">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center sm:text-left">All Events</h2>
      
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="relative bg-gradient-to-r from-base-100 via-base-50 to-base-100 rounded-2xl border-2 border-base-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/50">
            <input
              type="text"
              placeholder="🔍 Search events by title, description, location, or creator..."
              className="input w-full pl-12 pr-12 py-4 text-sm sm:text-base bg-transparent border-none focus:outline-none placeholder:text-base-content/50 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg
                className={`w-5 h-5 transition-all duration-300 ${searchTerm ? 'text-primary scale-110' : 'text-base-content/40'}`}
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
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full bg-base-200/80 hover:bg-error/20 text-base-content/60 hover:text-error transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                title="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {searchTerm && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <div className="text-base-content/60">
              for "<span className="font-semibold text-base-content">{searchTerm}</span>"
            </div>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="mb-6 w-full">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center mb-3 w-full">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
              <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Filters
              </span>
            </div>
          </div>
          
          {/* Time Filter Dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative flex items-center">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <select 
                  className="select w-full pl-10 pr-10 py-2.5 text-sm sm:text-base font-medium
                           bg-gradient-to-r from-base-100 via-base-50 to-base-100 
                           border-2 border-accent/30 rounded-xl shadow-md
                           focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20
                           transition-all duration-300 hover:border-accent/50 hover:shadow-lg
                           appearance-none cursor-pointer min-w-[160px]"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  <option value="">🌟 All Time</option>
                  <option value="this-week">📅 This Week</option>
                  <option value="next-week">⏭️ Next Week</option>
                  <option value="this-month">📆 This Month</option>
                  <option value="next-month">🗓️ Next Month</option>
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-accent transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status Filters */}
          <div className="flex gap-2 flex-wrap">
            <button 
              className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 min-w-[120px] justify-center ${
                activeFilters.has('upcoming-only') 
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-content border-2 border-primary/50 shadow-lg shadow-primary/20 hover:shadow-xl transform hover:scale-105' 
                  : 'bg-gradient-to-r from-base-100 to-base-200 text-primary border-2 border-primary/30 hover:from-primary/10 hover:to-primary/20 hover:border-primary/50 hover:shadow-md hover:scale-105'
              }`}
              onClick={() => toggleFilter('upcoming-only')}
            >
              <span className="text-lg">⏰</span>
              <span>Upcoming</span>
              <div className="w-2 h-2 flex-shrink-0">
                {activeFilters.has('upcoming-only') && (
                  <div className="w-2 h-2 bg-primary-content rounded-full animate-pulse"></div>
                )}
              </div>
            </button>
            <button 
              className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 min-w-[120px] justify-center ${
                activeFilters.has('available') 
                  ? 'bg-gradient-to-r from-secondary to-secondary/80 text-secondary-content border-2 border-secondary/50 shadow-lg shadow-secondary/20 hover:shadow-xl transform hover:scale-105' 
                  : 'bg-gradient-to-r from-base-100 to-base-200 text-secondary border-2 border-secondary/30 hover:from-secondary/10 hover:to-secondary/20 hover:border-secondary/50 hover:shadow-md hover:scale-105'
              }`}
              onClick={() => toggleFilter('available')}
            >
              <span className="text-lg">🟢</span>
              <span>Available</span>
              <div className="w-2 h-2 flex-shrink-0">
                {activeFilters.has('available') && (
                  <div className="w-2 h-2 bg-secondary-content rounded-full animate-pulse"></div>
                )}
              </div>
            </button>
            <button 
              className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 min-w-[120px] justify-center ${
                activeFilters.has('minimum-reached') 
                  ? 'bg-gradient-to-r from-accent to-accent/80 text-accent-content border-2 border-accent/50 shadow-lg shadow-accent/20 hover:shadow-xl transform hover:scale-105' 
                  : 'bg-gradient-to-r from-base-100 to-base-200 text-accent border-2 border-accent/30 hover:from-accent/10 hover:to-accent/20 hover:border-accent/50 hover:shadow-md hover:scale-105'
              }`}
              onClick={() => toggleFilter('minimum-reached')}
            >
              <span className="text-lg">✅</span>
              <span>Confirmed</span>
              <div className="w-2 h-2 flex-shrink-0">
                {activeFilters.has('minimum-reached') && (
                  <div className="w-2 h-2 bg-accent-content rounded-full animate-pulse"></div>
                )}
              </div>
            </button>
            <button 
              className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 min-w-[130px] justify-center ${
                activeFilters.has('almost-full') 
                  ? 'bg-gradient-to-r from-info to-info/80 text-info-content border-2 border-info/50 shadow-lg shadow-info/20 hover:shadow-xl transform hover:scale-105' 
                  : 'bg-gradient-to-r from-base-100 to-base-200 text-info border-2 border-info/30 hover:from-info/10 hover:to-info/20 hover:border-info/50 hover:shadow-md hover:scale-105'
              }`}
              onClick={() => toggleFilter('almost-full')}
            >
              <span className="text-lg">🔥</span>
              <span>Almost Full</span>
              <div className="w-2 h-2 flex-shrink-0">
                {activeFilters.has('almost-full') && (
                  <div className="w-2 h-2 bg-info-content rounded-full animate-pulse"></div>
                )}
              </div>
            </button>
          </div>
        </div>
        
        {/* Filter Results with Enhanced Styling */}
        <div className="min-h-[3rem] w-full overflow-hidden">
          {(activeFilters.size > 0 || timeFilter) && (
            <div className="flex items-start gap-2 flex-wrap w-full min-h-[3rem]">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 rounded-xl flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-xs font-semibold text-primary whitespace-nowrap">
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} match
                </span>
              </div>
              
              {timeFilter && (
                <div className="flex items-center gap-1 px-2 py-1.5 bg-accent/10 text-accent border border-accent/20 rounded-lg text-xs font-medium flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="whitespace-nowrap">
                    {timeFilter === 'this-week' && 'This Week'}
                    {timeFilter === 'next-week' && 'Next Week'}
                    {timeFilter === 'this-month' && 'This Month'}
                    {timeFilter === 'next-month' && 'Next Month'}
                  </span>
                </div>
              )}
              
              {activeFilters.size > 0 && (
                <div className="flex items-center gap-1 flex-wrap min-w-0 flex-1">
                  {timeFilter && activeFilters.size > 0 && (
                    <span className="text-base-content/40 font-medium text-xs">+</span>
                  )}
                  {Array.from(activeFilters).map((filter, index) => {
                    const filterConfig = {
                      'upcoming-only': { name: 'Upcoming', icon: '⏰' },
                      'available': { name: 'Available', icon: '🟢' },
                      'minimum-reached': { name: 'Confirmed', icon: '✅' },
                      'almost-full': { name: 'Almost Full', icon: '🔥' }
                    };
                    const config = filterConfig[filter as keyof typeof filterConfig];
                    return (
                      <div key={filter} className="flex items-center gap-1 flex-shrink-0">
                        {index > 0 && <span className="text-base-content/40 font-medium text-xs">+</span>}
                        <div className="flex items-center gap-1 px-2 py-1.5 bg-base-200 text-base-content border border-base-300 rounded-lg text-xs font-medium whitespace-nowrap">
                          <span className="text-xs">{config.icon}</span>
                          <span>{config.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <button 
                onClick={() => {
                  setActiveFilters(new Set());
                  setTimeFilter('');
                }}
                className="group flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-base-200 to-base-300 
                          text-base-content/70 border border-base-300 rounded-xl hover:from-error/10 hover:to-error/20 
                          hover:text-error hover:border-error/30 transition-all duration-200 hover:scale-105 text-xs font-medium flex-shrink-0 ml-auto"
              >
                <svg className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="whitespace-nowrap">Clear all</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sort Controls */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-secondary to-accent rounded-full"></div>
            <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Sort by
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button 
            className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              sortType === 'time' 
                ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-content border-2 border-primary/50 shadow-lg shadow-primary/20 hover:shadow-xl transform hover:scale-105' 
                : 'bg-gradient-to-r from-base-100 to-base-200 text-primary border-2 border-primary/30 hover:from-primary/10 hover:to-primary/20 hover:border-primary/50 hover:shadow-md hover:scale-105'
            }`} 
            onClick={() => handleSortClick('time')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Time</span>
            {sortType === 'time' && (
              <div className={`flex items-center justify-center w-5 h-5 rounded-full ${sortType === 'time' ? 'bg-primary-content/20' : 'bg-primary/20'} transition-transform duration-200`}>
                <svg className={`w-3 h-3 transition-transform duration-200 ${sortOrder === 'desc' ? 'rotate-180' : ''} ${sortType === 'time' ? 'text-primary-content' : 'text-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
            )}
          </button>
          
          <button 
            className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              sortType === 'name' 
                ? 'bg-gradient-to-r from-secondary to-secondary/80 text-secondary-content border-2 border-secondary/50 shadow-lg shadow-secondary/20 hover:shadow-xl transform hover:scale-105' 
                : 'bg-gradient-to-r from-base-100 to-base-200 text-secondary border-2 border-secondary/30 hover:from-secondary/10 hover:to-secondary/20 hover:border-secondary/50 hover:shadow-md hover:scale-105'
            }`} 
            onClick={() => handleSortClick('name')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span>Name</span>
            {sortType === 'name' && (
              <div className={`flex items-center justify-center w-5 h-5 rounded-full ${sortType === 'name' ? 'bg-secondary-content/20' : 'bg-secondary/20'} transition-transform duration-200`}>
                <svg className={`w-3 h-3 transition-transform duration-200 ${sortOrder === 'desc' ? 'rotate-180' : ''} ${sortType === 'name' ? 'text-secondary-content' : 'text-secondary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
            )}
          </button>
          
          <button 
            className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              sortType === 'maxAttendees' 
                ? 'bg-gradient-to-r from-accent to-accent/80 text-accent-content border-2 border-accent/50 shadow-lg shadow-accent/20 hover:shadow-xl transform hover:scale-105' 
                : 'bg-gradient-to-r from-base-100 to-base-200 text-accent border-2 border-accent/30 hover:from-accent/10 hover:to-accent/20 hover:border-accent/50 hover:shadow-md hover:scale-105'
            }`} 
            onClick={() => handleSortClick('maxAttendees')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden sm:inline">Max Attendees</span>
            <span className="sm:hidden">Max</span>
            {sortType === 'maxAttendees' && (
              <div className={`flex items-center justify-center w-5 h-5 rounded-full ${sortType === 'maxAttendees' ? 'bg-accent-content/20' : 'bg-accent/20'} transition-transform duration-200`}>
                <svg className={`w-3 h-3 transition-transform duration-200 ${sortOrder === 'desc' ? 'rotate-180' : ''} ${sortType === 'maxAttendees' ? 'text-accent-content' : 'text-accent'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
            )}
          </button>
          
          <button 
            className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              sortType === 'location' 
                ? 'bg-gradient-to-r from-info to-info/80 text-info-content border-2 border-info/50 shadow-lg shadow-info/20 hover:shadow-xl transform hover:scale-105' 
                : 'bg-gradient-to-r from-base-100 to-base-200 text-info border-2 border-info/30 hover:from-info/10 hover:to-info/20 hover:border-info/50 hover:shadow-md hover:scale-105'
            }`} 
            onClick={() => handleSortClick('location')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Location</span>
            {sortType === 'location' && (
              <div className={`flex items-center justify-center w-5 h-5 rounded-full ${sortType === 'location' ? 'bg-info-content/20' : 'bg-info/20'} transition-transform duration-200`}>
                <svg className={`w-3 h-3 transition-transform duration-200 ${sortOrder === 'desc' ? 'rotate-180' : ''} ${sortType === 'location' ? 'text-info-content' : 'text-info'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
            )}
          </button>
          
          <button 
            className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              sortType === 'organizer' 
                ? 'bg-gradient-to-r from-success to-success/80 text-success-content border-2 border-success/50 shadow-lg shadow-success/20 hover:shadow-xl transform hover:scale-105' 
                : 'bg-gradient-to-r from-base-100 to-base-200 text-success border-2 border-success/30 hover:from-success/10 hover:to-success/20 hover:border-success/50 hover:shadow-md hover:scale-105'
            }`} 
            onClick={() => handleSortClick('organizer')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Organizer</span>
            {sortType === 'organizer' && (
              <div className={`flex items-center justify-center w-5 h-5 rounded-full ${sortType === 'organizer' ? 'bg-success-content/20' : 'bg-success/20'} transition-transform duration-200`}>
                <svg className={`w-3 h-3 transition-transform duration-200 ${sortOrder === 'desc' ? 'rotate-180' : ''} ${sortType === 'organizer' ? 'text-success-content' : 'text-success'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>
      {loading && <div className="text-center text-sm sm:text-base min-h-[400px] flex items-center justify-center">Loading...</div>}
      {error && <div className="text-red-500 text-center text-sm sm:text-base min-h-[400px] flex items-center justify-center">{error}</div>}
      {!loading && !error && sortedEvents.length === 0 && (
        <div className="text-center py-12 min-h-[400px] flex flex-col items-center justify-center">
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
                  className="px-2 py-1 text-sm font-medium !bg-gray-100 !text-gray-800 rounded hover:!bg-gray-200 transition-colors duration-200 !border-0"
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
        <div className="min-h-[400px]">
          <EventList events={sortedEvents} showEditButton={true} />
        </div>
      )}
    </div>
  );
};

export default HomePage;
