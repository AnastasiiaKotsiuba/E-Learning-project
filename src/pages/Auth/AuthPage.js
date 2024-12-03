import React, { useState } from "react";
import "./AuthPage.css";

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  const handleLogin = () => {
    onLogin({ username, role });
  };

  const handleRegister = () => {
    onLogin({ username, role });
  };

  const handleWave = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const wave = document.createElement("span");
    wave.className = "wave";
    wave.style.left = `${x - 30}px`; // Зміщення хвилі по горизонталі
    wave.style.top = `${y - 30}px`; // Зміщення хвилі по вертикалі
    button.appendChild(wave);

    setTimeout(() => {
      wave.remove(); // Видалити хвилю після анімації
    }, 800);
  };

  return (
    <div className="auth-page">
      <div className="auth-buttons">
        <button
          onClick={() => setIsLogin(true)}
          className={isLogin ? "active" : "inactive"}
        >
          Log in
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={!isLogin ? "active" : "inactive"}
        >
          Sign up
        </button>
      </div>

      <div className="auth-form">
        <input
          type="text"
          placeholder="Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />
        {!isLogin && (
          <div className="role-selector">
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="student"
                checked={role === "student"}
                onChange={(e) => setRole(e.target.value)}
              />
              <span>Student</span>
            </label>
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="teacher"
                checked={role === "teacher"}
                onChange={(e) => setRole(e.target.value)}
              />
              <span>Teacher</span>
            </label>
          </div>
        )}
        <button
          onMouseMove={handleWave} // Тепер обробник на `onMouseMove`
          onClick={isLogin ? handleLogin : handleRegister}
        >
          {isLogin ? "Log in" : "Sign up"}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
