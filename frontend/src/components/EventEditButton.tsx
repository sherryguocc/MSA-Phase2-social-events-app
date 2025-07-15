import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

interface EventEditButtonProps {
  eventId: number;
  createdById: number;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const EventEditButton: React.FC<EventEditButtonProps> = ({ eventId, createdById, className, onClick }) => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.userInfo);

  if (!user || user.id !== createdById) return null;

  return (
    <button
      className={className || "px-3 py-1 text-sm font-medium !bg-yellow-500 !text-white rounded-lg hover:!bg-yellow-600 transition-colors duration-200 ml-2 !border-0"}
      onClick={e => {
        if (onClick) onClick(e);
        if (!e.defaultPrevented) navigate(`/edit-event/${eventId}`);
      }}
    >
      Edit
    </button>
  );
};

export default EventEditButton;
