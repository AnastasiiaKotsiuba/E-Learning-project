import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserRoleContext } from "../../context/UserRoleContext";

const Login = () => {
  const { loginAsStudent, loginAsTeacher } = useContext(UserRoleContext);
  const navigate = useNavigate();

  const handleStudentLogin = () => {
    loginAsStudent();
    navigate("/student/home");
  };

  const handleTeacherLogin = () => {
    loginAsTeacher();
    navigate("/teacher/home");
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleStudentLogin}>Login as Student</button>
      <button onClick={handleTeacherLogin}>Login as Teacher</button>
    </div>
  );
};

export default Login;
