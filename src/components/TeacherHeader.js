import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

const TeacherHeader = ({ onLogout, photoURL }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState("/default-avatar.jpg");
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (photoURL && photoURL !== "") {
      setAvatar(photoURL);
    } else {
      setAvatar("/default-avatar.jpg");
    }
  }, [photoURL]);

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
      <img
        src="/logo.svg"
        alt="logo"
        className="logo"
        onClick={() => navigate("/teacher/home")}
      />

      <ul className="navbar">
        <li>
          <Link to="/teacher/home">Home</Link>
        </li>
        <li>
          <Link to="/teacher/chat">Chat</Link>
        </li>
      </ul>

      <div className="nav-actions">
        <div className="user-menu" ref={menuRef}>
          <button className="user" onClick={toggleMenu}>
            <img
              src={avatar}
              alt="teacher avatar"
              className="user-avatar"
              onError={(e) => (e.target.src = "/default-avatar.jpg")}
            />
          </button>

          {menuOpen && (
            <div className="dropdown-menu">
              <button
                className="dropdown-item"
                onClick={() => {
                  navigate("/teacher/myprofile");
                  setMenuOpen(false);
                }}
              >
                <img src="/user.svg" alt="profile" className="menu-icon" />
                My Profile
              </button>

              <button className="dropdown-item" onClick={onLogout}>
                <img src="/log-out.svg" alt="log-out" className="menu-icon" />
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
