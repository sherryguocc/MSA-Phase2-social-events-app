import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useNavigate } from "react-router-dom";

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
}

const MyEventPage: React.FC = () => {
  const token = useSelector((state: RootState) => state.user.token);
  const reduxUser = useSelector((state: RootState) => state.user.userInfo);
  const [user, setUser] = useState(reduxUser);
  useEffect(() => {
    if (!token) return;
    if (!user) {
      fetch("/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch user info");
          return res.json();
        })
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
    fetch(`/api/event/by-user/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then(data => setMyEvents(data))
      // .catch(err => setError(err.message))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, user, navigate]);

  // Fetch joined, interested, and waitlist events
  useEffect(() => {
    if (!token || !user?.id) return;
    // Fetch all events
    fetch(`/api/event/dto`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then((allEvents: any[]) => {
        setMyEvents(allEvents.filter(e => e.createdById === user.id));
      });
    // Fetch joined events
    fetch(`/api/users/${user.id}/joined`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setJoinedEvents)
      .catch(() => {});
    // Fetch interested events
    fetch(`/api/users/${user.id}/interested`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setInterestedEvents)
      .catch(() => {});
    // Fetch waitlist events
    fetch(`/api/users/${user.id}/waitlist`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setWaitlistEvents)
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
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {myEvents.map(event => (
            <div
              key={event.id}
              className="card bg-base-100 p-6 shadow-xl break-words cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => navigate(`/event/${event.id}`)}
            >
              <figure>
                <img
                  src={event.imageUrl && event.imageUrl.trim() !== '' ? event.imageUrl : '/default-event.jpg'}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-t"
                  onError={e => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = '/default-event.jpg'; }}
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title text-xl font-bold text-primary break-words whitespace-pre-line mb-2">{event.title}</h3>
                <p
                  className="break-words whitespace-pre-line text-base mb-3 text-gray-800 line-clamp-3"
                  style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                >
                  {event.description}
                </p>
                <div className="flex flex-col gap-1 text-sm text-gray-600 mb-2">
                  <span><span className="font-semibold">Location:</span> {event.location}</span>
                  <span><span className="font-semibold">Time:</span> {new Date(event.eventTime).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                  <span><span className="font-semibold">Attendees:</span> {event.minAttendees} - {event.maxAttendees}</span>
                </div>
                <button
                  className="btn btn-outline btn-primary btn-sm mt-2"
                  onClick={e => {
                    e.stopPropagation();
                    navigate(`/edit-event/${event.id}`);
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
          {(!loading && myEvents.length === 0) && <div className="col-span-2 text-gray-500">No events created yet.</div>}
        </div>
      </section>
      <section id="joined" className="mt-10">
        <h3 className="text-xl font-bold mb-2">Joined Events</h3>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {joinedEvents.map(event => (
            <div
              key={event.id}
              className="card bg-base-100 p-6 shadow-xl break-words cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => navigate(`/event/${event.id}`)}
            >
              <figure>
                <img
                  src={event.imageUrl && event.imageUrl.trim() !== '' ? event.imageUrl : '/default-event.jpg'}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-t"
                  onError={e => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = '/default-event.jpg'; }}
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title text-xl font-bold text-primary break-words whitespace-pre-line mb-2">{event.title}</h3>
                <p
                  className="break-words whitespace-pre-line text-base mb-3 text-gray-800 line-clamp-3"
                  style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                >
                  {event.description}
                </p>
                <div className="flex flex-col gap-1 text-sm text-gray-600 mb-2">
                  <span><span className="font-semibold">Location:</span> {event.location}</span>
                  <span><span className="font-semibold">Time:</span> {new Date(event.eventTime).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                  <span><span className="font-semibold">Attendees:</span> {event.minAttendees} - {event.maxAttendees}</span>
                </div>
              </div>
            </div>
          ))}
          {(!loading && joinedEvents.length === 0) && <div className="col-span-2 text-gray-500">No joined events.</div>}
        </div>
      </section>
      <section id="interested" className="mt-10">
        <h3 className="text-xl font-bold mb-2">Interested Events</h3>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {interestedEvents.map(event => (
            <div
              key={event.id}
              className="card bg-base-100 p-6 shadow-xl break-words cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => navigate(`/event/${event.id}`)}
            >
              <figure>
                <img
                  src={event.imageUrl && event.imageUrl.trim() !== '' ? event.imageUrl : '/default-event.jpg'}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-t"
                  onError={e => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = '/default-event.jpg'; }}
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title text-xl font-bold text-primary break-words whitespace-pre-line mb-2">{event.title}</h3>
                <p
                  className="break-words whitespace-pre-line text-base mb-3 text-gray-800 line-clamp-3"
                  style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                >
                  {event.description}
                </p>
                <div className="flex flex-col gap-1 text-sm text-gray-600 mb-2">
                  <span><span className="font-semibold">Location:</span> {event.location}</span>
                  <span><span className="font-semibold">Time:</span> {new Date(event.eventTime).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                  <span><span className="font-semibold">Attendees:</span> {event.minAttendees} - {event.maxAttendees}</span>
                </div>
              </div>
            </div>
          ))}
          {(!loading && interestedEvents.length === 0) && <div className="col-span-2 text-gray-500">No interested events.</div>}
        </div>
      </section>
      <section id="waitlist" className="mt-10">
        <h3 className="text-xl font-bold mb-2">Waitlist Events</h3>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {waitlistEvents.map(event => (
            <div
              key={event.id}
              className="card bg-base-100 p-6 shadow-xl break-words cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => navigate(`/event/${event.id}`)}
            >
              <figure>
                <img
                  src={event.imageUrl && event.imageUrl.trim() !== '' ? event.imageUrl : '/default-event.jpg'}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-t"
                  onError={e => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = '/default-event.jpg'; }}
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title text-xl font-bold text-primary break-words whitespace-pre-line mb-2">{event.title}</h3>
                <p
                  className="break-words whitespace-pre-line text-base mb-3 text-gray-800 line-clamp-3"
                  style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                >
                  {event.description}
                </p>
                <div className="flex flex-col gap-1 text-sm text-gray-600 mb-2">
                  <span><span className="font-semibold">Location:</span> {event.location}</span>
                  <span><span className="font-semibold">Time:</span> {new Date(event.eventTime).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                  <span><span className="font-semibold">Attendees:</span> {event.minAttendees} - {event.maxAttendees}</span>
                </div>
              </div>
            </div>
          ))}
          {(!loading && waitlistEvents.length === 0) && <div className="col-span-2 text-gray-500">No waitlist events.</div>}
        </div>
      </section>
    </div>
  );
};

export default MyEventPage;
