import React, { useState, useEffect } from "react";
import TeacherCard from "../../components/TeacherCard";
import { auth, db } from "../../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import "./Teacher.css";

const Teacher = ({ allTeachers = [], searchTerm = "" }) => {
  const uid = auth.currentUser?.uid;
  const [name, setName] = useState(() => {
    if (!uid) return "User";
    const saved = localStorage.getItem(`username_${uid}`);
    return saved || "User";
  });

  useEffect(() => {
    const fetchUserName = async () => {
      if (!uid) return;
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const username = userDoc.data()?.username || "User";
        setName(username);
        localStorage.setItem(`username_${uid}`, username);
      }
    };
    fetchUserName();
  }, [uid]);

  const [savedTeacherIds, setSavedTeacherIds] = useState(() => {
    if (!uid) return [];
    const saved = localStorage.getItem(`savedTeachers_${uid}`);
    return saved ? JSON.parse(saved).map(String) : [];
  });

  useEffect(() => {
    if (!uid) return;
    localStorage.setItem(
      `savedTeachers_${uid}`,
      JSON.stringify(savedTeacherIds)
    );
  }, [savedTeacherIds, uid]);

  const handleSave = (id) => {
    const strId = String(id);
    setSavedTeacherIds((prev) =>
      prev.includes(strId) ? prev.filter((t) => t !== strId) : [...prev, strId]
    );
  };

  const filteredTeachers = (
    Array.isArray(allTeachers) ? allTeachers : []
  ).filter((teacher) => {
    const term = searchTerm.toLowerCase();
    const inName = String(teacher?.name || "")
      .toLowerCase()
      .includes(term);
    const inDesc = String(teacher?.description || "")
      .toLowerCase()
      .includes(term);
    const inTags =
      Array.isArray(teacher?.tags) &&
      teacher.tags.some((tag) => String(tag).toLowerCase().includes(term));
    return inName || inDesc || inTags;
  });

  return (
    <div>
      <div className="content">
        <h1 className="headerText">
          Hi, {name} <br />
          Here are recommendations
        </h1>
        <div className="cardContainer">
          {filteredTeachers.length === 0 ? (
            <p>No teachers found</p>
          ) : (
            filteredTeachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                id={teacher.id}
                name={teacher?.name || "Unknown"}
                description={teacher?.description || ""}
                filters={Array.isArray(teacher?.tags) ? teacher.tags : []}
                onSave={handleSave}
                isSaved={savedTeacherIds.includes(String(teacher.id))}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Teacher;
