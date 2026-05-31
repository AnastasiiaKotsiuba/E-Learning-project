import React, { useState, useEffect } from "react";
import VideoCard from "../../components/VideoCard";
import TeacherCard from "../../components/TeacherCard";
import CourseCard from "../../components/CourseCard";
import { auth, db } from "../../utils/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = ({
  allTeachers = [], 
  recommendedVideos = [], 
  searchTerm = "",
}) => {
  const userId = auth.currentUser?.uid;
  const navigate = useNavigate();
  const [savedVideoIds, setSavedVideoIds] = useState([]);
  const [inProgressCourses, setInProgressCourses] = useState([]);
  const [savedTeacherIds, setSavedTeacherIds] = useState([]);
  const [savedCourseIds, setSavedCourseIds] = useState([]);

  const [teachersMap, setTeachersMap] = useState({});
  const [allCourses, setAllCourses] = useState([]); 

  useEffect(() => {
    if (!userId) return;
    const savedV = localStorage.getItem(`savedLessons_${userId}`);
    setSavedVideoIds(savedV ? JSON.parse(savedV).map(String) : []);
    const savedT = localStorage.getItem(`savedTeachers_${userId}`);
    setSavedTeacherIds(savedT ? JSON.parse(savedT).map(String) : []);
    const savedC = localStorage.getItem(`savedCourses_${userId}`);
    setSavedCourseIds(savedC ? JSON.parse(savedC).map(String) : []);
  }, [userId]);

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

  useEffect(() => {
    const fetchInProgress = async () => {
      if (!userId) return;
      try {
        const progressSnap = await getDocs(
          query(collection(db, "userProgress"), where("userId", "==", userId))
        );
        const progressRecords = progressSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((p) => p.progress > 0 && p.progress < 100);

        if (progressRecords.length === 0) return;

        const courseIds = progressRecords.map((p) => p.courseId);
        const coursesSnap = await getDocs(collection(db, "courses"));
        const courseMap = {};
        coursesSnap.forEach((d) => { courseMap[d.id] = { id: d.id, ...d.data() }; });

        const merged = progressRecords
          .filter((p) => courseMap[p.courseId])
          .map((p) => ({
            ...courseMap[p.courseId],
            progress: p.progress,
            activeLessonTitle: p.activeLessonTitle,
          }))
          .sort((a, b) => {
            const getTime = (v) =>
              v?.seconds ? v.seconds * 1000
              : v instanceof Date ? v.getTime()
              : 0;
            return getTime(b.updatedAt) - getTime(a.updatedAt);
          });

        setInProgressCourses(merged);
      } catch (err) {
        console.error("Error fetching in-progress courses:", err);
      }
    };
    fetchInProgress();
  }, [userId]);

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
          });
        });
        setAllCourses(courses);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, []);

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

        {inProgressCourses.length > 0 && (
          <>
            <h2 className="headerText">▶ Continue Watching</h2>
            <div className="continue-watching-list">
              {inProgressCourses.map((course) => (
                <div
                  key={course.id}
                  className="continue-card"
                  onClick={() => navigate(`/course/${course.id}/view`)}
                >
                  <img
                    src={course.thumbnail || "/default-cover.png"}
                    alt={course.title}
                    className="continue-thumb"
                    onError={(e) => (e.target.src = "/default-cover.png")}
                  />
                  <div className="continue-info">
                    <p className="continue-title">{course.title}</p>
                    <p className="continue-lesson">Next: {course.activeLessonTitle || "—"}</p>
                    <div className="continue-bar-bg">
                      <div
                        className="continue-bar-fill"
                        style={{ width: `${Math.round(course.progress)}%` }}
                      />
                    </div>
                    <p className="continue-pct">{Math.round(course.progress)}% complete</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            