import React from "react";
import { useNavigate } from "react-router-dom";

interface UserLinkProps {
  id: number;
  username: string;
  className?: string;
}

const UserLink: React.FC<UserLinkProps> = ({ id, username, className }) => {
  const navigate = useNavigate();
  return (
    <span
      className={
        className ||
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white font-semibold shadow cursor-pointer transition hover:scale-105 hover:from-blue-500 hover:to-purple-500 border border-blue-300"
      }
      title={`View ${username}'s profile`}
      onClick={() => navigate(`/profile/${id}`)}
      style={{ userSelect: "text" }}
    >
      <svg width="16" height="16" fill="currentColor" className="inline-block opacity-80" viewBox="0 0 20 20"><path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z"/></svg>
      {username}
    </span>
  );
};

export default UserLink;
