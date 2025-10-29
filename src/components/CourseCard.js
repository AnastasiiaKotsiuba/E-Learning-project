import React from "react";
import "./CourseCard.css";

const CourseCard = ({
  title,
  teacherPhotoURL,
  name,
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
    <div className="course-card">
      <div className="course-header">
        <div className="avatar-wrapper">
          <img
            src={photoURL || "/default-avatar.jpg"}
            alt="courseImg"
            className="course-avatar"
          />
        </div>
        <div className="course-info">
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

      <p className="course-description">{description}</p>
      <button className="show-more-btn">Show more</button>
    </div>
  );
};

export default CourseCard;