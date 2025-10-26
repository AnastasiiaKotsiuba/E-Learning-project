import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const TeacherHome = () => {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate("/teacher/upload");
  };

  return (
    <div>
      <div className="content">
        <h1 className="headerText">Teacher Dashboard</h1>
        <button onClick={handleUploadClick}>Upload New Video</button>
      </div>
    </div>
  );
};

export default TeacherHome;
