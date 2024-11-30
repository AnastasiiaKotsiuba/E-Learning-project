import React, { createContext, useState } from "react";

// Створення контексту
export const UserRoleContext = createContext();

// Провайдер контексту
export const UserRoleProvider = ({ children }) => {
  const [role, setRole] = useState(null); // Поточна роль користувача

  // Функції для входу
  const loginAsStudent = () => setRole("student");
  const loginAsTeacher = () => setRole("teacher");

  return (
    <UserRoleContext.Provider value={{ role, loginAsStudent, loginAsTeacher }}>
      {children}
    </UserRoleContext.Provider>
  );
};
