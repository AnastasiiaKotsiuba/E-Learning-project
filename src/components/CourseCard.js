import React from "react";
import "./CourseCard.css";
import { useNavigate } from "react-router-dom";

const CourseCard = ({
  id,
  title,
  teacher,
  teacherPhotoURL,
  thumbnail,
  filters = [],
  onSave,
  isSaved,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/course/${id}`);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation(); 
    if (onSave) onSave(id);
  };

  return (
    <div
      className="course-card"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className="course-left">
        <img
          src={thumbnail || "/default-cover.jpg"}
          alt={title}
          className="course-thumb"
          onError={(e) => (e.target.src = "/default-cover.png")}
        />
      </div>

      <div className="course-right">
        <div className="course-header">
          <h2 className="course-title">{title}</h2>
          <img
            src={isSaved ? "/SavedFilled.svg" : "/Saved.svg"}
            alt="save"
            className="savedFunc"
            onClick={handleSaveClick}
          />
        </div>

        <div className="teacher-row">
          <img
            src={teacherPhotoURL || "/default-avatar.jpg"}
            alt={teacher}
            className="teacher-img"
          />
          <span className="teacher-name">{teacher}</span>
        </div>

        <div className="tags-row">
          {filters.length > 0 ? (
            filters.map((tag, i) => (
              <span key={i} className="tag-course">
                {tag}
              </span>
            ))
          ) : (
            <span className="tag-course">No tags</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
