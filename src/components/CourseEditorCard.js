// src/components/CourseEditorCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./CourseEditorCard.css";

const CourseEditorCard = ({
  id,
  title,
  teacher,
  teacherPhotoURL,
  thumbnail,
  filters = [],
  status = "draft",
}) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/teacher/course/${id}/builder`);
  };

  return (
    <div className="course-editor-card">
      <div className="draft-badge">{status.toUpperCase()}</div>

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

        <div className="edit-btn-container">
          <button className="edit-btn" onClick={handleEdit}>
            Finished Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseEditorCard;
