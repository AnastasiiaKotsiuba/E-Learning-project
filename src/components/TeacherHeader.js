import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const TeacherHeader = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div id="header">
      <img src="/logo.svg" alt="logo" className="logo" />

      <ul className="navbar">
        <li>
          <Link to="/teacher/home">My Profile</Link>
        </li>
        <li>
          <Link to="/teacher/chat">Chat</Link>
        </li>
      </ul>

      <div className="nav-actions">
        <div className="user-menu" ref={menuRef}>
          <button className="user" onClick={toggleMenu}>
            <img src="/user.svg" alt="user" className="user-img" />
          </button>

          {menuOpen && (
            <div className="dropdown-menu">
              <button className="logout-btn" onClick={onLogout}>
                <img src="/log-out.svg" alt="log-out" className="log-out" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherHeader;
