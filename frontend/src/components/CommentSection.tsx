import React, { useEffect, useState } from "react";
import UserLink from "./UserLink";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { apiGet, apiPost, apiDelete } from "../utils/apiClient";

interface UserInfo {
  id: number;
  username: string;
  name?: string;
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
      const data = await apiGet(`/api/comment/event/${eventId}`);
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
      await apiPost(
        "/api/comment",
        { content: newComment, eventId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
      await apiPost(
        "/api/comment",
        { content: replyContent, eventId, parentCommentId: parentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
      await apiDelete(`/api/comment/${commentId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchComments();
    } catch (err: any) {
      setError(err.message || "Failed to delete comment");
    }
  };

  const renderComments = (list: CommentItem[], level = 0) => (
    <div className={level === 0 ? "space-y-6" : "space-y-4 ml-8 border-l-2 border-indigo-200 pl-6"}>
      {list.map((c) => (
        <div key={c.id} className={`${level === 0 ? 'bg-white border border-gray-200 shadow-md' : 'bg-indigo-50 border border-indigo-200'} p-6 rounded-xl`}>
          {/* Comment Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <UserLink 
                id={c.user.id} 
                username={c.user.username} 
                name={c.user.name} 
                avatarUrl={c.user.avatarUrl}
                className="font-semibold text-gray-800 hover:text-indigo-600 transition-colors"
              />
              <div className="flex items-center text-gray-500 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(c.createdAt).toLocaleString()}
              </div>
            </div>
            {reduxUser && c.user.id === reduxUser.id && (
              <button 
                className="px-3 py-1 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-all duration-200 text-sm font-medium"
                onClick={() => handleDelete(c.id)}
              >
                <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
          </div>
          
          {/* Comment Content */}
          <div className="mb-4 text-gray-700 leading-relaxed whitespace-pre-line break-words">
            {c.content}
          </div>
          
          {/* Reply Actions */}
          {level === 0 && (replyTo === c.id ? (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  disabled={posting}
                  placeholder="Write your reply..."
                  maxLength={500}
                />
                <button 
                  className="px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-white"
                  style={{ backgroundColor: posting || !replyContent.trim() ? '#9ca3af' : '#4f46e5' }}
                  disabled={posting || !replyContent.trim()} 
                  onClick={() => handleReply(c.id)}
                >
                  {posting ? "Sending..." : "Send"}
                </button>
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 transition-colors font-medium"
                  disabled={posting} 
                  onClick={() => { setReplyTo(null); setReplyContent(""); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            token && (
              <button 
                className="inline-flex items-center px-3 py-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all duration-200 text-sm font-medium"
                onClick={() => setReplyTo(c.id)}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Reply
              </button>
            )
          ))}
          
          {/* Nested Replies */}
          {c.replies && c.replies.length > 0 && (
            <div className="mt-6">
              {renderComments(c.replies, level + 1)}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="mt-12">
      {/* Comments Header */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center">
          <svg className="w-6 h-6 mr-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Comments ({comments.length})
        </h3>
        {comments.length > 0 && (
          <p className="text-slate-600 mt-2">Join the conversation and share your thoughts about this event.</p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center text-slate-600">
            <svg className="animate-spin w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading comments...
          </div>
        </div>
      ) : (
        <>
          {/* No Comments State */}
          {comments.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">No comments yet</h4>
              <p className="text-gray-500">Be the first to share your thoughts about this event!</p>
            </div>
          )}
          
          {/* Comments List */}
          {comments.length > 0 && renderComments(comments)}
        </>
      )}

      {/* Add Comment Section */}
      {token ? (
        <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add a Comment
          </h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this event..."
              disabled={posting}
              maxLength={500}
            />
            <button 
              className="px-6 py-3 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg text-white"
              style={{ 
                backgroundColor: posting || !newComment.trim() ? '#9ca3af' : '#2563eb',
                cursor: posting || !newComment.trim() ? 'not-allowed' : 'pointer'
              }}
              disabled={posting || !newComment.trim()} 
              onClick={handlePost}
            >
              {posting ? (
                <div className="flex items-center">
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </div>
              ) : (
                "Post Comment"
              )}
            </button>
          </div>
          <div className="mt-2 text-blue-600 text-sm">
            {newComment.length}/500 characters
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
          <svg className="w-8 h-8 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-gray-600 font-medium">Please log in to join the conversation</p>
          <p className="text-gray-500 text-sm mt-1">Share your thoughts and connect with other participants</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
