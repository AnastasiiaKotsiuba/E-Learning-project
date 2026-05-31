import React from "react";
import { Link } from "react-router-dom";

const Footer = ({ role }) => {
  return (
    <footer style={{
      backgroundColor: "#a5d1ff",
      padding: "10px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "8px",
      marginTop: "auto",
    }}>
      <span style={{ fontSize: "12px", color: "#1a4a80", fontWeight: 500 }}>
        © {new Date().getFullYear()} E-Learning Platform. All rights reserved.
      </span>

      <nav style={{ display: "flex", gap: "20px" }}>
        {role === "student" && (
          <>
            <Link to="/"         style={linkStyle}>Home</Link>
            <Link to="/Courses"  style={linkStyle}>Courses</Link>
            <Link to="/Lessons"  style={linkStyle}>Lessons</Link>
            <Link to="/teachers" style={linkStyle}>Teachers</Link>
            <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
          </>
        )}
        {role === "teacher" && (
          <>
            <Link to="/teacher/home"      style={linkStyle}>Home</Link>
            <Link to="/teacher/myprofile" style={linkStyle}>My Profile</Link>
          </>
        )}
      </nav>
    </footer>
  );
};

const linkStyle = {
  fontSize: "12px",
  color: "#1a4a80",
  textDecoration: "none",
  fontWeight: 500,
};

export default Footer;
