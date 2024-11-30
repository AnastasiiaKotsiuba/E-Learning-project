import React from "react";
import "./TeacherCard.css";

const TeacherCard = ({ name, description, filters }) => {
  return (
    <div className="teacher-card">
      <div className="teacher-header">
        <img src="/teacher.jpg" alt="teacherImg" className="teacherImg" />
        <div className="teacher-info">
          <h2>{name}</h2>
          <p className="titleCard">{filters.join(" ")}</p>
        </div>
        <img src="/Saved.svg" alt="savedFunc" className="savedFunc" />
      </div>

      <p className="teacher-description">{description}</p>

      <div className="filtersCard">
        {filters &&
          filters.map((filter, index) => (
            <h3 key={index} className="filters">
              {filter}
            </h3>
          ))}
      </div>

      <button className="show-more-btn">Show more</button>
    </div>
  );
};

export default TeacherCard;
