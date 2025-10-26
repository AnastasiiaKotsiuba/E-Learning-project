import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import SearchBar from "./SearchBar";

const Header = ({ searchTerm, onSearchChange, onLogout, photoURL }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

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
      {/* ЛОГО */}
      <img
        src="/logo.svg"
        alt="logo"
        className="logo"
        onClick={() => navigate("/courses")}
      />

      {/* НАВІГАЦІЯ */}
      <ul className="navbar">
        <li>
          <Link to="/courses">Courses</Link>
        </li>
        <li>
          <Link to="/teachers">Teachers</Link>
        </li>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
      </ul>

      {/* ПРАВА ЧАСТИНА */}
      <div className="nav-actions">
        <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />

        <div className="user-menu" ref={menuRef}>
          <button className="user" onClick={toggleMenu}>
            <img
              src={photoURL || "/default-avatar.png"}
              alt="user avatar"
              className="user-avatar"
              onError={(e) => (e.target.src = "/default-avatar.png")}
            />
          </button>

          {/* Дропдаун меню */}
          {menuOpen && (
            <div className="dropdown-menu">
              <button
                className="dropdown-item"
                onClick={() => {
                  navigate("/student/myprofile");
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

export default Header;
