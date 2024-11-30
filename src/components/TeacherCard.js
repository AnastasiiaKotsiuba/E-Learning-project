import React from "react";
import "./TeacherCard.css";

const TeacherCard = ({ title, teacher }) => {
  return (
    <div class="teacher-card">
  <div class="teacher-header">
   <img src="/teacher.jpg" alt="teacherImg" className="teacherImg" />
    <div class="teacher-info">
       <h2>{teacher}</h2>
       <p className="titleCard">{title}</p>
    </div>
    <img src="/Saved.svg" alt="savedFunc" className="savedFunc" />
  </div>

  <p class="teacher-description">
    I’m Adrian Spring, your teacher for this year. I’m excited to embark on this
    journey of learning and discovery with all of you. Together, we’ll explore
    new ideas, share experiences, and grow as a community. I believe in creating
    a supportive and engaging environment where everyone feels valued and
    inspired. Let’s make this year memorable!
  </p>

  <div class="filtersCard">
    <h3>English</h3>
    <h3>Polish</h3>
    <h3>Spanish</h3>
  </div>

  <button class="show-more-btn">Show more</button>
</div>

  );
};

export default TeacherCard;