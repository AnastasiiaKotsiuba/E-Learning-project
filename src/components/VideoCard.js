import React from "react";
import { useNavigate } from "react-router-dom";
import "./VideoCard.css";

const VideoCard = ({
  id,
  title,
  teacher,
  filters,
  thumbnail,
  role,
  photoURL,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (role === "teacher") navigate(`/teacher/addvideo/${id}`);
    else navigate(`/watch/${id}`);
  };

  return (
    <div className="video-card" onClick={handleCardClick}>
      <img
        src={thumbnail || "/vCard.jpg"}
        alt={title}
        className="vCard"
        onError={(e) => (e.target.src = "/vCard.jpg")}
      />

      <div className="teacherCard">
        <img
          src={photoURL || "/default-avatar.png"}
          alt="teacher avatar"
          className="teacherImg"
        />
        <h2>{teacher}</h2>
      </div>

      <div className="filtersCard">
        {(filters || []).map((tag, i) => (
          <h3 key={i} className="filters">
            {tag}
          </h3>
        ))}
      </div>

      <p className="titleCard">{title}</p>

      {role === "teacher" ? (
        <button
          className="watch-btn"
          onClick={(e) => {
            e.stopPropagation(); // Щоб не спрацьовував click на div
            navigate(`/teacher/addvideo/${id}`);
          }}
        >
          Edit video
        </button>
      ) : (
        <button className="watch-btn">Watch now</button>
      )}
    </div>
  );
};

export default VideoCard;
