import React from "react";
import { useNavigate } from "react-router-dom";

interface UserLinkProps {
  id: number;
  username: string;
  name?: string;
  avatarUrl?: string;
  className?: string;
}

const UserLink: React.FC<UserLinkProps> = ({ id, username, name, avatarUrl, className }) => {
  const navigate = useNavigate();
  let displayName = username;
  if (typeof name === 'string' && name.replace(/\s/g, '') !== '') {
    displayName = name;
  }
  // 调试：输出传入的 name、username、最终显示名
  // eslint-disable-next-line no-console
  console.log({ name, username, displayName });
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
      <span
        style={{
          display: "inline-block",
          width: 40, // enlarge avatar size
          height: 40,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
          padding: 2,
          boxShadow: "0 2px 8px rgba(160,120,220,0.12)",
          // border: "2.5px solid #fff", // remove outer white border
          marginRight: 8, // increase spacing
        }}
      >
        <img
          src={avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : "/default-avatar.png"}
          alt="avatar"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
            display: "block",
            // border: "2.5px solid #7f53ac", // remove inner purple border
            boxSizing: "border-box",
            background: "#fff"
          }}
        />
      </span>
      {displayName}
    </span>
  );
};

export default UserLink;
