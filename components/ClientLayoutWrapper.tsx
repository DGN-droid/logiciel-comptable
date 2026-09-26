"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("fipa_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  const handleToggle = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("fipa_sidebar_collapsed", JSON.stringify(nextState));
  };

  return (
    <>
      <Sidebar isCollapsed={isCollapsed} onToggle={handleToggle} />
      <main
        className={`flex-1 transition-all duration-300 min-h-screen bg-gray-50 flex flex-col ${
          isCollapsed ? "ml-[72px]" : "ml-[260px]"
        }`}
      >
        {children}
      </main>
    </>
  );
}
