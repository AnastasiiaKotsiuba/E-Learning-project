import React, { useState } from "react";
import "./AuthPage.css";
import { auth, db } from "../../utils/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");

  const validateRegistration = () => {
    if (username.length < 2) {
      alert("Please enter a name (minimum 2 characters).");
      return false;
    }
    if (password.length < 4) {
      alert("Password must be at least 4 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const uid = userCredential.user.uid;

        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          onLogin({ username: userData.username, role: userData.role });
        } else {
          alert("User data not found in database.");
        }
      } else {
        if (!validateRegistration()) return;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const uid = userCredential.user.uid;

        await setDoc(doc(db, "users", uid), {
          uid,
          username,
          email,
          role,
        });

        alert("Registration successful!");
        onLogin({ username, role });
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
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

      <form className="auth-form" onSubmit={handleFinalSubmit}>
        {!isLogin ? (
          <input
            type="text"
            placeholder="Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="auth-input"
            required
          />
        ) : null}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
          required
          minLength="8"
        />

        {!isLogin && (
          <>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input"
              required
              minLength="8"
            />

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
          </>
        )}

        <button type="submit" className="auth-submit-btn">
          {isLogin ? "Log in" : "Sign up"}
        </button>
      </form>
    </div>
  );
};

export default AuthPage;
