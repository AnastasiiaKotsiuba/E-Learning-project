import { Link } from "react-router-dom";
import "./Header.css";
import SearchBar from "./SearchBar";

const Header = ({ searchTerm, onSearchChange }) => {
  return (
    <div id="header">
      <img src="/logo.svg" alt="logo" className="logo" />
      <ul className="navbar">
        <li>
          <Link to="/courses">Courses</Link>
        </li>
        <li>
          <Link to="/teachers">Teachers</Link>
        </li>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
      </ul>
      <div className="nav-actions">
        <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />

        <button className="user">
          <img src="/user.svg" alt="user" className="user-img" />
        </button>
      </div>
    </div>
  );
};

export default Header;
