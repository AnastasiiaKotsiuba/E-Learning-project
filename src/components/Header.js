import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import SearchBar from "./SearchBar";

const Header = ({ searchTerm, onSearchChange, onLogout }) => {
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
          <Link to="/courses">Courses</Link>
        </li>
        <li>
          <Link to="/teachers">Teachers</Link>
        </li>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
      </ul>

      <div className="nav-actions">
        <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />

        <div className="user-menu" ref={menuRef}>
          <button className="user" onClick={toggleMenu}>
            <img src="/user.svg" alt="user" className="user-img" />
          </button>

          {menuOpen && (
            <div
              className="dropdown-menu"
              onClick={onLogout}
              role="button"
              tabIndex="0"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onLogout();
              }}
            >
              <img src="/log-out.svg" alt="log-out" className="log-out" />
              <span className="logout-btn">Log out</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
