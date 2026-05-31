import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

const Header = ({ searchTerm, onSearchChange, onLogout, photoURL, videosData = [], coursesData = [] }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const menuRef = useRef();
  const searchRef = useRef();
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Close dropdown and user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = searchTerm.trim().length < 1 ? [] : (() => {
    const q = searchTerm.toLowerCase();
    const videoMatches = videosData
      .filter((v) =>
        v.title?.toLowerCase().includes(q) ||
        v.teacher?.toLowerCase().includes(q) ||
        v.tags?.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 4)
      .map((v) => ({ type: "video", id: v.id, title: v.title, sub: v.teacher, thumb: v.thumbnail }));

    const courseMatches = coursesData
      .filter((c) =>
        c.title?.toLowerCase().includes(q) ||
        c.teacher?.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 4)
      .map((c) => ({ type: "course", id: c.id, title: c.title, sub: c.teacher, thumb: c.thumbnail }));

    return [...videoMatches, ...courseMatches];
  })();

  const handleSuggestionClick = (item) => {
    setShowSuggestions(false);
    onSearchChange({ target: { value: "" } });
    if (item.type === "video") navigate(`/video/${item.id}`);
    else navigate(`/course/${item.id}`);
  };

  return (
    <div id="header">
      <img
        src="/Logo.svg"
        alt="logo"
        className="logo"
        onClick={() => navigate("/")}
      />

      <ul className={`navbar${navOpen ? " navbar--open" : ""}`}>
        {/* Search bar inside dropdown on mobile */}
        <li className="navbar-search-item">
          <div className="search-wrapper mobile-search" ref={searchRef}>
            <input
              className="input-search mobile-input-search"
              type="text"
              placeholder="Search for a video"
              value={searchTerm}
              onChange={(e) => { onSearchChange(e); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-dropdown">
                {suggestions.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="search-suggestion"
                    onMouseDown={() => { handleSuggestionClick(item); setNavOpen(false); }}
                  >
                    <img
                      src={item.thumb || (item.type === "video" ? "/vCard.jpg" : "/default-cover.png")}
                      alt=""
                      className="suggestion-thumb"
                      onError={(e) => (e.target.src = item.type === "video" ? "/vCard.jpg" : "/default-cover.png")}
                    />
                    <div className="suggestion-text">
                      <span className="suggestion-title">{item.title}</span>
                      <span className="suggestion-sub">{item.type === "video" ? "🎬" : "📚"} {item.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </li>
        <li><Link to="/" onClick={() => setNavOpen(false)}>Home</Link></li>
        <li><Link to="/Courses" onClick={() => setNavOpen(false)}>Courses</Link></li>
        <li><Link to="/Lessons" onClick={() => setNavOpen(false)}>Lessons</Link></li>
        <li><Link to="/teachers" onClick={() => setNavOpen(false)}>Teachers</Link></li>
        <li><Link to="/dashboard" onClick={() => setNavOpen(false)}>Dashboard</Link></li>
      </ul>

      <div className="nav-actions">
        {/* Search — hidden on mobile, shown in dropdown instead */}
        <div className="search-wrapper desktop-search" ref={searchRef}>
          <input
            className="input-search"
            type="text"
            placeholder="Search for a video"
            value={searchTerm}
            onChange={(e) => { onSearchChange(e); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-dropdown">
              {suggestions.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="search-suggestion"
                  onMouseDown={() => handleSuggestionClick(item)}
                >
                  <img
                    src={item.thumb || (item.type === "video" ? "/vCard.jpg" : "/default-cover.png")}
                    alt=""
                    className="suggestion-thumb"
                    onError={(e) => (e.target.src = item.type === "video" ? "/vCard.jpg" : "/default-cover.png")}
                  />
                  <div className="suggestion-text">
                    <span className="suggestion-title">{item.title}</span>
                    <span className="suggestion-sub">{item.type === "video" ? "🎬" : "📚"} {item.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="burger-btn"
          onClick={() => setNavOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span className={`burger-icon${navOpen ? " open" : ""}`} />
        </button>

        <div className="user-menu" ref={menuRef}>
          <button className="user" onClick={toggleMenu}>
            <img
              src={photoURL || "/default-avatar.jpg"}
              alt="user avatar"
              className="user-avatar"
              onError={(e) => (e.target.src = "/default-avatar.jpg")}
            />
          </button>

          {menuOpen && (
            <div className="dropdown-menu">
              <button
                className="dropdown-item"
                onClick={() => { navigate("/student/myprofile"); setMenuOpen(false); }}
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
