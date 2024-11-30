import React from "react";
import { useNavigate } from "react-router-dom";

const TeacherHome = () => {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate("/teacher/upload");
  };

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      <button onClick={handleUploadClick}>Upload New Video</button>
    </div>
  );
};

export default TeacherHome;
