console.log("Rendering Header component");
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <div id="header">
      <img src="/logo.svg" alt="logo" className="logo" />
      <ul className="navbar">
        <li>
          <Link to="/">Main</Link>
        </li>
        <li>
          <Link to="/teachers">Teachers</Link>
        </li>
        <li>
          <Link to="/courses">Courses</Link>
        </li>
        <li>
          <Link to="/dashboards">Dashboards</Link>
        </li>
      </ul>
      <button className="user">
        <img src="/user.svg" alt="user" />
      </button>
    </div>
  );
};

export default Header;
