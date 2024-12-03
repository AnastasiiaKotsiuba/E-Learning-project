import React, { useState } from "react";
import Header from "../../components/Header";

const Dashboard = () => {
  return (
    <div>
      <Header />
      <div className="content">
        <h1 className="headerText">Your savings</h1>
      </div>
    </div>
  );
};

export default Dashboard;
