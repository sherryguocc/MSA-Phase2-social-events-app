import React, { useEffect, useState } from "react";

const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return visible ? (
    <button
      onClick={handleClick}
      className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-full shadow-lg p-3 flex items-center justify-center hover:scale-110 transition border border-blue-300"
      title="Back to top"
      style={{ boxShadow: "0 4px 16px rgba(80,80,180,0.15)" }}
    >
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg>
    </button>
  ) : null;
};

export default ScrollToTopButton;
