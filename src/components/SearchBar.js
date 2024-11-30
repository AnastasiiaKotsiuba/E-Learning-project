import React from "react";
import "./SearchBar.css";

const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="searchBar">
      <input
        type="text"
        placeholder="Search for a video"
        value={searchTerm}
        onChange={onSearchChange}
      />
    </div>
  );
};

export default SearchBar;
