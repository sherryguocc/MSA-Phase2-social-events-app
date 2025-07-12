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
      className={className || "btn btn-warning btn-sm ml-2"}
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
