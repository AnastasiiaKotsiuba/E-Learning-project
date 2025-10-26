import React from "react";
import "./TeacherCard.css";

const TeacherCard = ({
  name,
  description,
  email,
  tags = [],
  photoURL,
  id,
  onSave,
  isSaved,
}) => {
  const handleSaveClick = () => {
    if (onSave) onSave(id);
  };

  return (
    <div className="teacher-card">
      <div className="teacher-header">
        <div className="avatar-wrapper">
          <img
            src={photoURL || "/default-avatar.png"}
            alt="teacherImg"
            className="teacher-avatar"
          />
        </div>
        <div className="teacher-info">
          <h2>{name}</h2>
          <p className="titleCard">{email || "No email"}</p>{" "}
        </div>
        {onSave && (
          <img
            src={isSaved ? "/SavedFilled.svg" : "/Saved.svg"}
            alt="savedFunc"
            className="savedFunc"
            onClick={handleSaveClick}
          />
        )}
      </div>

      <div className="filtersTCard">
        {tags.length > 0 ? (
          tags.map((tag, index) => (
            <h3 key={index} className="filters">
              {tag}
            </h3>
          ))
        ) : (
          <p>No tags</p>
        )}
      </div>

      <p className="teacher-description">{description}</p>
      <button className="show-more-btn">Show more</button>
    </div>
  );
};

export default TeacherCard;
