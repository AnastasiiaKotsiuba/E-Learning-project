import React from "react";
import { useNavigate } from "react-router-dom";
import "./VideoCard.css";

const VideoCard = ({
  id,
  title,
  teacher,
  teacherPhotoURL,
  thumbnail,
  filters,
  onSave,
  isSaved,
  userRole,
}) => {
  const navigate = useNavigate();

  const handleSaveClick = (e) => {
    if (onSave) {
      e.stopPropagation();
      onSave(id);
    }
  };

  const handleButtonClick = () => {
    if (userRole === "teacher") {
      navigate(`/teacher/addvideo/${id}`);
    } else {
      navigate(`/video/${id}`); 
    }
  };

  return (
    <div className="video-card">
      <img
        src={thumbnail || "/vCard.jpg"}
        alt={title}
        className="vCard"
        onError={(e) => (e.target.src = "/vCard.jpg")}
      />

      <div className="teacherCard">
        <img
          src={teacherPhotoURL || "/default-avatar.png"}
          alt="teacher avatar"
          className="teacherImg"
          onError={(e) => (e.target.src = "/default-avatar.png")}
        />
        <h2>{teacher}</h2>
        {onSave && (
          <img
            src={isSaved ? "/SavedFilled.svg" : "/Saved.svg"}
            alt="saved icon"
            className="savedFunc"
            onClick={handleSaveClick}
          />
        )}
      </div>

      <div className="filtersCard">
        {(Array.isArray(filters) ? filters : []).map((filter, index) => (
          <h3 key={index} className="filters">
            {filter}
          </h3>
        ))}
      </div>

      <p className="titleCard">{title}</p>
      <button className="watch-btn" onClick={handleButtonClick}>
        {userRole === "teacher" ? "Edit Video" : "Watch now"}
      </button>
    </div>
  );
};

export default VideoCard;
