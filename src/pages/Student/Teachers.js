import React, { useState } from "react";
import Header from "../../components/Header"; // Компонент заголовка
import TeacherCard from "../../components/TeacherCard"; // Компонент картки вчителя
import SearchBar from "../../components/SearchBar"; // Пошуковий рядок
import "./Teacher.css"; // Стилі для сторінки

const Teacher = () => {
  const [searchTerm, setSearchTerm] = useState(""); // Стан для тексту пошуку
  const [teachers, setTeachers] = useState([
    {
      id: 1,
      name: "Adrian Spring",
      description:
        "I'm Adrian Spring, your teacher for this year. I'm excited to embark on this journey of learning and discovery with all of you.",
      filters: ["English", "Polish", "Spanish"],
    },
    {
      id: 2,
      name: "Emily Davis",
      description:
        "I'm Emily Davis, an experienced teacher passionate about sharing knowledge. Let’s explore the wonders of learning together!",
      filters: ["English", "French"],
    },
    {
      id: 3,
      name: "Michael Brown",
      description:
        "Michael here! I specialize in making complex topics simple and enjoyable for all learners.",
      filters: ["English", "German"],
    },
  ]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Фільтрація вчителів на основі пошуку в `name` та `filters`
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesName = teacher.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = teacher.filters.some((filter) =>
      filter.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesName || matchesFilter; // Вчитель залишається, якщо відповідає пошуку за іменем або мовами
  });

  return (
    <div>
      <Header />
      <div className="content">
        {/* Пошуковий рядок */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />

        {/* Заголовок */}
        <h1 className="headerText">Teacher list</h1>

        {/* Список карток вчителів */}
        <div className="cardContainer">
          {filteredTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              name={teacher.name}
              description={teacher.description}
              filters={teacher.filters}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Teacher;
