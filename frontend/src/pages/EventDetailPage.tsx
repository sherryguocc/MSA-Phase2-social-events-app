import React, { useEffect, useState } from "react";
import CommentSection from "../components/CommentSection";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { useParams, useNavigate } from "react-router-dom";
import UserLink from "../components/UserLink";
import EventEditButton from "../components/EventEditButton";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

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
}

interface UserInfo {
  id: number;
  username: string;
  avatarUrl?: string;
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const token = useSelector((state: RootState) => state.user.token);
  const reduxUser = useSelector((state: RootState) => state.user.userInfo);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [participants, setParticipants] = useState<UserInfo[]>([]);
  const [waitlist, setWaitlist] = useState<UserInfo[]>([]);
  const [interested, setInterested] = useState<UserInfo[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/event/dto`)
      .then(res => res.json())
      .then((data: EventItem[]) => {
        const found = data.find(e => e.id === Number(id));
        if (!found) throw new Error("Event not found");
        setEvent(found);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/events/${id}/participants`).then(res => res.json()).then(setParticipants);
    fetch(`/api/events/${id}/waitlist`).then(res => res.json()).then(setWaitlist);
    fetch(`/api/events/${id}/interested`).then(res => res.json()).then(setInterested);
  }, [id, actionLoading]);

  const handleJoin = async () => {
    if (!token) { navigate("/login"); return; }
    setActionLoading(true); setActionError("");
    try {
      const res = await fetch(`/api/events/${id}/join`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error((await res.json()).message || "Join failed");
    } catch (err: any) { setActionError(err.message || "Join failed"); }
    setActionLoading(false);
  };
  const handleCancel = async () => {
    if (!token) { navigate("/login"); return; }
    setActionLoading(true); setActionError("");
    try {
      const res = await fetch(`/api/events/${id}/cancel`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error((await res.json()).message || "Cancel failed");
    } catch (err: any) { setActionError(err.message || "Cancel failed"); }
    setActionLoading(false);
  };
  const handleInterest = async () => {
    if (!token) { navigate("/login"); return; }
    setActionLoading(true); setActionError("");
    try {
      const res = await fetch(`/api/events/${id}/interest`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error((await res.json()).message || "Interest failed");
    } catch (err: any) { setActionError(err.message || "Interest failed"); }
    setActionLoading(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error || !event) return <div className="text-red-500">{error || "Event not found"}</div>;

  // Check if the event is over
  const isEventOver = new Date(event.eventTime).getTime() < Date.now();

  return (
    <>
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-base-200 rounded shadow">
      <h2 className="text-3xl font-bold mb-4 flex items-center">
        {event.title}
        <EventEditButton eventId={event.id} createdById={event.createdById} />
      </h2>
      <img
        src={event.imageUrl && event.imageUrl.trim() !== '' ? event.imageUrl : '/default-event.jpg'}
        alt={event.title}
        className="w-full h-64 object-cover rounded mb-4"
        onError={e => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = '/default-event.jpg'; }}
      />
      <div className="mb-2 text-gray-700">
        <span className="font-semibold">Description:</span>
        <span className="break-words whitespace-pre-line"> {event.description}</span>
      </div>
      <div className="mb-2 text-gray-700"><span className="font-semibold">Location:</span> {event.location}</div>
      <div className="mb-2 text-gray-700"><span className="font-semibold">Time:</span> {new Date(event.eventTime).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
      <div className="mb-2 text-gray-700"><span className="font-semibold">Attendees:</span> {event.minAttendees} - {event.maxAttendees}</div>
      <div className="mb-2 text-gray-700">
        <span className="font-semibold">Organizer:</span>{" "}
        {event.createdById ? (
          <UserLink id={event.createdById} username={event.createdByUsername || "Unknown"} avatarUrl={event.createdByAvatarUrl} />
        ) : (
          event.createdByUsername || "Unknown"
        )}
      </div>
      <div className="flex gap-2 my-4">
        <button
          className="btn btn-primary btn-sm"
          onClick={handleJoin}
          disabled={isEventOver || actionLoading || (!!reduxUser && participants.some(u => u.id === reduxUser.id))}
        >
          {reduxUser && participants.some(u => u.id === reduxUser.id) ? "Already Joined" : `Join (${participants.length})`}
        </button>
        <button className="btn btn-outline btn-sm" onClick={handleCancel} disabled={isEventOver || actionLoading}>
          Cancel
        </button>
        <button className="btn btn-secondary btn-sm" onClick={handleInterest} disabled={isEventOver || actionLoading}>
          Interested ({interested.length})
        </button>
      </div>
      {isEventOver && (
        <div className="text-sm text-gray-500 mb-2">This event has ended. Participation and interest are closed.</div>
      )}
      {actionError && <div className="text-red-500 mb-2">{actionError}</div>}
      <div className="mt-6">
        <div className="mb-2 font-semibold">Joined Users ({participants.length}):</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {participants.map(u => (
            <UserLink key={u.id} id={u.id} username={u.username} avatarUrl={u.avatarUrl} className="badge badge-primary cursor-pointer hover:underline" />
          ))}
        </div>
        <div className="mb-2 font-semibold">Interested Users ({interested.length}):</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {interested.map(u => (
            <UserLink key={u.id} id={u.id} username={u.username} avatarUrl={u.avatarUrl} className="badge badge-secondary cursor-pointer hover:underline" />
          ))}
        </div>
        <div className="mb-2 font-semibold">Waitlist ({waitlist.length}):</div>
        <div className="flex flex-wrap gap-2">
          {waitlist.map(u => (
            <UserLink key={u.id} id={u.id} username={u.username} avatarUrl={u.avatarUrl} className="badge badge-outline cursor-pointer hover:underline" />
          ))}
        </div>
      </div>
      {/* comments section */}
        <CommentSection eventId={event.id} />
      </div>
      <ScrollToTopButton />
    </>
  );
};

export default EventDetailPage;
