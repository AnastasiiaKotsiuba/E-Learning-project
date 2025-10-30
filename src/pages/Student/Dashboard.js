import React, { useState, useEffect } from "react";
import VideoCard from "../../components/VideoCard";
import TeacherCard from "../../components/TeacherCard";
import CourseCard from "../../components/CourseCard";
import { auth, db } from "../../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Dashboard.css";

const Dashboard = ({
  allTeachers = [], // optional fallback if you pass teachers via props
  recommendedVideos = [], // array of video objects (from props)
  searchTerm = "", // search string
}) => {
  const userId = auth.currentUser?.uid;
  const [savedVideoIds, setSavedVideoIds] = useState([]);
  const [savedTeacherIds, setSavedTeacherIds] = useState([]);
  const [savedCourseIds, setSavedCourseIds] = useState([]);

  const [teachersMap, setTeachersMap] = useState({});
  const [allCourses, setAllCourses] = useState([]); // courses loaded from Firestore

  // load saved ids from localStorage
  useEffect(() => {
    if (!userId) return;
    const savedV = localStorage.getItem(`savedLessons_${userId}`);
    setSavedVideoIds(savedV ? JSON.parse(savedV).map(String) : []);
    const savedT = localStorage.getItem(`savedTeachers_${userId}`);
    setSavedTeacherIds(savedT ? JSON.parse(savedT).map(String) : []);
    const savedC = localStorage.getItem(`savedCourses_${userId}`);
    setSavedCourseIds(savedC ? JSON.parse(savedC).map(String) : []);
  }, [userId]);

  // fetch teachers from Firestore to build map (photoURL etc.)
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "teachers"));
        const map = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          map[doc.id] = {
            name: data.name || "Unknown",
            email: data.email || "No email",
            description: data.description || "",
            tags: Array.isArray(data.tags) ? data.tags : [],
            photoURL: data.photoURL || "/default-avatar.jpg",
          };
        });
        setTeachersMap(map);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      }
    };
    fetchTeachers();
  }, []);

  // fetch courses from Firestore
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const snapshot = await getDocs(collection(db, "courses"));
        const courses = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          courses.push({
            id: doc.id,
            title: data.title || "Untitled",
            teacher: data.teacher || "",
            teacherId: data.teacherId || "",
            thumbnail: data.thumbnail || "/default-cover.png",
            tags: Array.isArray(data.tags) ? data.tags : [],
            description: data.description || "",
            price: data.price ?? "",
            status: data.status || "",
            // include any other fields you need
          });
        });
        setAllCourses(courses);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, []);

  // toggle save handlers (update state + localStorage)
  const handleSaveVideo = (id) => {
    if (!userId) return;
    const strId = String(id);
    const updated = savedVideoIds.includes(strId)
      ? savedVideoIds.filter((v) => v !== strId)
      : [...savedVideoIds, strId];
    setSavedVideoIds(updated);
    localStorage.setItem(`savedLessons_${userId}`, JSON.stringify(updated));
  };

  const handleSaveTeacher = (id) => {
    if (!userId) return;
    const strId = String(id);
    const updated = savedTeacherIds.includes(strId)
      ? savedTeacherIds.filter((t) => t !== strId)
      : [...savedTeacherIds, strId];
    setSavedTeacherIds(updated);
    localStorage.setItem(`savedTeachers_${userId}`, JSON.stringify(updated));
  };

  const handleSaveCourse = (id) => {
    if (!userId) return;
    const strId = String(id);
    const updated = savedCourseIds.includes(strId)
      ? savedCourseIds.filter((c) => c !== strId)
      : [...savedCourseIds, strId];
    setSavedCourseIds(updated);
    localStorage.setItem(`savedCourses_${userId}`, JSON.stringify(updated));
  };

  // helper to test search match
  const matchesQuery = (text = "") => {
    if (!searchTerm) return true;
    return String(text).toLowerCase().includes(searchTerm.toLowerCase());
  };

  // Filter courses: only saved ones, then apply search across title/teacher/tags/description
  const filteredCourses = (Array.isArray(allCourses) ? allCourses : [])
    .filter((course) => savedCourseIds.includes(String(course?.id)))
    .filter((course) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        String(course?.title || "")
          .toLowerCase()
          .includes(q) ||
        String(course?.teacher || "")
          .toLowerCase()
          .includes(q) ||
        String(course?.description || "")
          .toLowerCase()
          .includes(q) ||
        (Array.isArray(course?.tags) &&
          course.tags.some((tag) => String(tag).toLowerCase().includes(q)))
      );
    });

  // Filter videos: only saved ones, then apply search
  const filteredVideos = (
    Array.isArray(recommendedVideos) ? recommendedVideos : []
  )
    .filter((video) => savedVideoIds.includes(String(video?.id)))
    .filter((video) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        String(video?.title || "")
          .toLowerCase()
          .includes(q) ||
        String(video?.teacher || "")
          .toLowerCase()
          .includes(q) ||
        (Array.isArray(video?.tags) &&
          video.tags.some((tag) => String(tag).toLowerCase().includes(q)))
      );
    });

  // Filter teachers: you might pass allTeachers or rely on teachersMap;
  // here we prefer allTeachers prop if provided; otherwise build from teachersMap keys.
  const teachersSource =
    Array.isArray(allTeachers) && allTeachers.length > 0
      ? allTeachers
      : Object.keys(teachersMap).map((id) => ({ id, ...teachersMap[id] }));

  const filteredTeachers = (Array.isArray(teachersSource) ? teachersSource : [])
    .filter((teacher) => savedTeacherIds.includes(String(teacher?.id)))
    .filter((teacher) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        String(teacher?.name || "")
          .toLowerCase()
          .includes(q) ||
        String(teacher?.description || "")
          .toLowerCase()
          .includes(q) ||
        (Array.isArray(teacher?.tags) &&
          teacher.tags.some((tag) => String(tag).toLowerCase().includes(q)))
      );
    });

  return (
    <div className="dashboard">
      <div className="content">
        {/* ===== Courses (saved) - should appear before Lessons ===== */}
        <h2 className="headerText">🎓 Saved Courses</h2>
        <div className="cardContainer">
          {filteredCourses.length === 0 ? (
            <p>No saved courses found</p>
          ) : (
            filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title || "Untitled"}
                teacher={
                  course.teacher ||
                  teachersMap[course.teacherId]?.name ||
                  "Unknown"
                }
                teacherPhotoURL={
                  teachersMap[course.teacherId]?.photoURL ||
                  "/default-avatar.jpg"
                }
                thumbnail={course.thumbnail || "/default-cover.png"}
                filters={Array.isArray(course.tags) ? course.tags : []}
                onSave={handleSaveCourse}
                isSaved={savedCourseIds.includes(String(course.id))}
              />
            ))
          )}
        </div>

        {/* ===== Lessons (saved videos) ===== */}
        <h2 className="headerText">📘 Saved Lessons</h2>
        <div className="cardContainer">
          {filteredVideos.length === 0 ? (
            <p>No saved lessons found</p>
          ) : (
            filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                title={video?.title || "Untitled"}
                teacher={
                  video?.teacher ||
                  teachersMap[video?.teacherId]?.name ||
                  "Unknown"
                }
                teacherPhotoURL={
                  teachersMap[video?.teacherId]?.photoURL ||
                  "/default-avatar.jpg"
                }
                thumbnail={video?.thumbnail || "/vCard.jpg"}
                filters={Array.isArray(video?.tags) ? video.tags : []}
                onSave={handleSaveVideo}
                isSaved={savedVideoIds.includes(String(video.id))}
              />
            ))
          )}
        </div>

        {/* ===== Teachers (saved) ===== */}
        <h2 className="headerText">👩‍🏫 Saved Teachers</h2>
        <div className="cardContainer">
          {filteredTeachers.length === 0 ? (
            <p>No saved teachers found</p>
          ) : (
            filteredTeachers.map((teacher) => {
              const data = teachersMap[teacher.id] || {};
              return (
                <TeacherCard
                  key={teacher.id}
                  id={teacher.id}
                  name={data.name}
                  description={data.description}
                  email={data.email}
                  tags={data.tags}
                  photoURL={data.photoURL}
                  onSave={handleSaveTeacher}
                  isSaved={savedTeacherIds.includes(String(teacher.id))}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
