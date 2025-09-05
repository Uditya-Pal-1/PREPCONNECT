import React, { useState, useEffect } from "react";
import { MobileApp } from "./MobileApp";
import { DesktopApp } from "./DesktopApp";

interface User {
  id: string;
  email: string;
  name: string;
  userType: "student" | "mentor";
}

interface ResponsiveAppProps {
  user: User;
  onLogout: () => void;
}

export function ResponsiveApp({ user, onLogout }: ResponsiveAppProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  return (
    <>
      {isMobile ? (
        <MobileApp user={user} onLogout={onLogout} />
      ) : (
        <DesktopApp user={user} onLogout={onLogout} />
      )}
    </>
  );
}