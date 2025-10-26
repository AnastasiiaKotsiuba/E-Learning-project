import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Chat = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="content">
        <h1 className="headerText">Chat</h1>
      </div>
    </div>
  );
};

export default Chat;
