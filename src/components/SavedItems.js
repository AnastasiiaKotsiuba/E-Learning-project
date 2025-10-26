import React from "react";

const SavedItems = ({ isSaved, onClick }) => {
  return (
    <button onClick={onClick} className="save-btn">
      <img
        src={isSaved ? "/SavedFilled.svg" : "/Saved.svg"} 
        alt="savedFunc"
        className="savedFunc"
      />
    </button>
  );
};

export default SavedItems;
