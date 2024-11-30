import React, { useState } from "react"; // Імпорт useState
import VideoCard from "../../components/VideoCard";
import Header from "../../components/Header";
import "./Home.css";
import SearchBar from "../../components/SearchBar";

const Home = () => {
  const name = "Anastasiia";
  const [searchTerm, setSearchTerm] = useState(""); // Стан для тексту пошуку
  const [recommendedVideos, setRecommendedVideos] = useState([
    {
      id: 1,
      title: "How to learn JavaScript for 5 days for totally beginners",
      teacher: "Alison Perry",
    },
    { id: 2, title: "Learn React", teacher: "John Doe" },
    { id: 3, title: "Advanced JavaScript", teacher: "Jane Smith" },
    { id: 4, title: "CSS Animations", teacher: "Emily Davis" },
    { id: 5, title: "Responsive Design", teacher: "Michael Brown" },
    { id: 6, title: "Node.js Basics", teacher: "Sarah Johnson" },
    { id: 7, title: "Python for Beginners", teacher: "Laura Wilson" },
    {
      id: 8,
      title: "CSS Animations for Advance level: How to create cards",
      teacher: "Emily Davis",
    },
  ]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Фільтрація відео на основі введеного пошукового запиту
  const filteredVideos = recommendedVideos.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Вибір, що рендерити: всі відео чи тільки відфільтровані
  const videosToDisplay = searchTerm ? filteredVideos : recommendedVideos;

  return (
    <div>
      <Header />
      <div className="content">
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        <h1 className="headerText">
          Hi, {name} <br />
          Here are recommendations
        </h1>
        <div className="cardContainer">
          {videosToDisplay.map((video) => (
            <VideoCard
              key={video.id}
              title={video.title}
              teacher={video.teacher}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
