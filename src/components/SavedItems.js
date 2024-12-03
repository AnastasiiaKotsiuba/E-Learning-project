import React from "react";

// Компонент для кнопки збереження
const SavedItems = ({ isSaved, onClick }) => {
  return (
    <button onClick={onClick} className="save-btn">
      <img
        src={isSaved ? "/SavedFilled.svg" : "/Saved.svg"} // Використовуємо різні іконки для збереженого/незбереженого стану
        alt="savedFunc"
        className="savedFunc"
      />
    </button>
  );
};

export default SavedItems;
