import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import TeacherCard from "../../components/TeacherCard";
import "./Teacher.css";
// Компонент тепер приймає дані про викладачів та поточний запит пошуку з App.jsx
const Teacher = ({ allTeachers, searchTerm }) => { 
    const name = "Anastasiia";
  // ✅ Стан для збережених ВИКЛАДАЧІВ (залишаємо локально, бо це стан лише для цієї сторінки)
  const [savedTeacherIds, setSavedTeacherIds] = useState(() => {
    // Використовуємо окремий ключ для викладачів
    const saved = localStorage.getItem("savedTeachers");
    return saved ? JSON.parse(saved) : [];
  });

  // ✅ Збереження ID викладачів у localStorage
  useEffect(() => {
    localStorage.setItem("savedTeachers", JSON.stringify(savedTeacherIds));
  }, [savedTeacherIds]);

  // ✅ Обробник кліку на "закладку" для ВИКЛАДАЧІВ (зберігаємо/видаляємо)
  const handleSave = (id) => {
    setSavedTeacherIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // ✅ Фільтрування викладачів на основі глобального searchTerm
  const filteredTeachers = allTeachers.filter((teacher) => {
    const term = searchTerm.toLowerCase();
    
    const matchesName = teacher.name
      .toLowerCase()
      .includes(term);
    
    // Перевіряємо, чи збігається пошуковий запит з фільтрами (мовами)
    const matchesFilter = teacher.filters.some((filter) =>
      filter.toLowerCase().includes(term)
    );
    
    // Перевіряємо, чи збігається пошуковий запит з описом
    const matchesDescription = teacher.description
      .toLowerCase()
      .includes(term);
      
    return matchesName || matchesFilter || matchesDescription;
  });

  return (
    <div>
      {/* Header, SearchBar більше не рендеряться тут, вони перенесені у App.jsx */}
      <div className="content">
        {/* Заголовок */}
        <h1 className="headerText">
          Hi, {name} <br />
          Here are recommendations{" "}
        </h1>

        {/* Список карток вчителів */}
        <div className="cardContainer">
          {filteredTeachers.length === 0 ? (
            <p>No one is found</p>
          ) : (
            filteredTeachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                id={teacher.id} // Передаємо ID
                name={teacher.name}
                description={teacher.description}
                filters={teacher.filters}
                onSave={handleSave} // Передаємо функцію збереження
                // Перевіряємо, чи є ID викладача у збереженому стані
                isSaved={savedTeacherIds.includes(teacher.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Teacher;
