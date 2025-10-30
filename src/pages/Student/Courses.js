import React, { useState, useEffect } from "react";
import CourseCard from "../../components/CourseCard";
import { auth, db } from "../../utils/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import "./Courses.css";

const Courses = ({ searchTerm = "" }) => {
  const uid = auth.currentUser?.uid;

  const [name, setName] = useState(() => {
    if (!uid) return "User";
    const saved = localStorage.getItem(`username_${uid}`);
    return saved || "User";
  });

  const [courses, setCourses] = useState([]);
  const [videos, setVideos] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [teachersMap, setTeachersMap] = useState({});

  const [savedIds, setSavedIds] = useState(() => {
    const user = auth.currentUser?.uid;
    if (!user) return [];
    const saved = localStorage.getItem(`savedCourses_${user}`);
    return saved ? JSON.parse(saved).map(String) : [];
  });

  useEffect(() => {
    if (uid) {
      localStorage.setItem(`savedCourses_${uid}`, JSON.stringify(savedIds));
    }
  }, [savedIds, uid]);

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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "courses"), (snapshot) => {
      const loadedCourses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(loadedCourses);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "videos"), (snapshot) => {
      const loadedVideos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVideos(loadedVideos);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      const snapshot = await getDocs(collection(db, "teachers"));
      const map = {};
      const teacherList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        map[data.name] = data.photoURL || "/default-avatar.jpg";
        teacherList.push(data.name);
      });
      setTeachers(teacherList);
      setTeachersMap(map);
    };
    fetchTeachers();
  }, []);

  useEffect(() => {
    const uniqueTags = new Set();
    videos.forEach((video) => {
      if (Array.isArray(video.tags)) {
        video.tags.forEach((tag) => uniqueTags.add(tag));
      }
    });
    setTags([...uniqueTags]);
  }, [videos]);

  const handleSave = (id) => {
    const strId = String(id);
    setSavedIds((prev) =>
      prev.includes(strId) ? prev.filter((v) => v !== strId) : [...prev, strId]
    );
  };

  const filteredCourses = courses.filter((course) => {
    if (!course) return false;

    const matchesSearch =
      (course.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.teacher || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      (Array.isArray(course.tags) &&
        selectedTags.every((tag) => course.tags.includes(tag)));

    const matchesTeachers =
      selectedTeachers.length === 0 ||
      selectedTeachers.includes(course.teacher);

    return matchesSearch && matchesTags && matchesTeachers;
  });

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleTeacher = (teacher) => {
    setSelectedTeachers((prev) =>
      prev.includes(teacher)
        ? prev.filter((t) => t !== teacher)
        : [...prev, teacher]
    );
  };

  return (
    <div className="content">
      <div className="content-courses">
        <aside className="filters-sidebar">
          <div>
            <h3>Topics</h3>
            <div className="filters-list">
              {tags.length === 0 ? (
                <p className="no-filters">No topics available.</p>
              ) : (
                tags.map((tag) => (
                  <label key={tag} className="filter-item">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                    />
                    {tag}
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <h3>Instructors</h3>
            <div className="filters-list">
              {teachers.length === 0 ? (
                <p className="no-filters">No instructors.</p>
              ) : (
                teachers.map((teacher) => (
                  <label key={teacher} className="filter-item">
                    <input
                      type="checkbox"
                      checked={selectedTeachers.includes(teacher)}
                      onChange={() => toggleTeacher(teacher)}
                    />
                    {teacher}
                  </label>
                ))
              )}
            </div>
          </div>
        </aside>

        <div className="courses-content">
          <h1 className="headerText">
            Hi, {name}
            <br />
            Explore new courses
          </h1>

          <div className="courses-grid">
            {filteredCourses.length === 0 ? (
              <p>No courses found.</p>
            ) : (
              filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  teacher={course.teacher}
                  teacherPhotoURL={
                    teachersMap[course.teacher] || "/default-avatar.jpg"
                  }
                  thumbnail={course.thumbnail}
                  filters={Array.isArray(course.tags) ? course.tags : []}
                  onSave={handleSave}
                  isSaved={savedIds.includes(String(course.id))}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
