import React, { useEffect, useState } from "react";
import UserLink from "./UserLink";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

interface UserInfo {
  id: number;
  username: string;
  avatarUrl?: string;
}

export interface CommentItem {
  id: number;
  content: string;
  createdAt: string;
  user: UserInfo;
  replies: CommentItem[];
  parentCommentId?: number | null;
}

interface CommentSectionProps {
  eventId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ eventId }) => {
  const token = useSelector((state: RootState) => state.user.token);
  const reduxUser = useSelector((state: RootState) => state.user.userInfo);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const fetchComments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/comment/event/${eventId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [eventId]);

  const handlePost = async () => {
    if (!token || !newComment.trim()) return;
    setPosting(true);
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment, eventId }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      setNewComment("");
      fetchComments();
    } catch (err: any) {
      setError(err.message || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (parentId: number) => {
    if (!token || !replyContent.trim()) return;
    setPosting(true);
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyContent, eventId, parentCommentId: parentId }),
      });
      if (!res.ok) throw new Error("Failed to post reply");
      setReplyContent("");
      setReplyTo(null);
      fetchComments();
    } catch (err: any) {
      setError(err.message || "Failed to post reply");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!token) return;
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await fetch(`/api/comment/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete comment");
      fetchComments();
    } catch (err: any) {
      setError(err.message || "Failed to delete comment");
    }
  };

  const renderComments = (list: CommentItem[], level = 0) => (
    <div className={level === 0 ? "space-y-4" : "space-y-2 ml-6 border-l pl-4 border-base-300"}>
      {list.map((c) => (
        <div key={c.id} className="bg-base-100 p-3 rounded shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <UserLink id={c.user.id} username={c.user.username} avatarUrl={c.user.avatarUrl} />
            <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
            {reduxUser && c.user.id === reduxUser.id && (
              <button className="btn btn-xs btn-outline btn-error ml-2" onClick={() => handleDelete(c.id)}>Delete</button>
            )}
          </div>
          <div className="mb-1 whitespace-pre-line">{c.content}</div>
          {level === 0 && (replyTo === c.id ? (
            <div className="flex gap-2 mt-1">
              <input
                className="input input-bordered input-sm flex-1"
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                disabled={posting}
                placeholder="Reply..."
              />
              <button className="btn btn-primary btn-sm" disabled={posting || !replyContent.trim()} onClick={() => handleReply(c.id)}>Send</button>
              <button className="btn btn-outline btn-sm" disabled={posting} onClick={() => { setReplyTo(null); setReplyContent(""); }}>Cancel</button>
            </div>
          ) : (
            token && <button className="btn btn-link btn-xs text-blue-500" onClick={() => setReplyTo(c.id)}>Reply</button>
          ))}
          {c.replies && c.replies.length > 0 && renderComments(c.replies, level + 1)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-2">Comments</h3>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div className="text-gray-400">Loading comments...</div>
      ) : (
        <>
          {comments.length === 0 && <div className="text-gray-400">No comments yet.</div>}
          {renderComments(comments)}
        </>
      )}
      {token ? (
        <div className="mt-4 flex gap-2">
          <input
            className="input input-bordered flex-1"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            disabled={posting}
            maxLength={500}
          />
          <button className="btn btn-primary" disabled={posting || !newComment.trim()} onClick={handlePost}>Post</button>
        </div>
      ) : (
        <div className="mt-4 text-gray-500">Login to post a comment.</div>
      )}
    </div>
  );
};

export default CommentSection;
