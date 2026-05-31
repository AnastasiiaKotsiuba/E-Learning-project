import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../utils/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import VideoCard from "../../components/VideoCard";
import CourseCard from "../../components/CourseCard";
import "./TeacherProfile.css";

const TeacherProfile = ({ user }) => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [videos, setVideos] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [savedVideoIds, setSavedVideoIds] = useState(() => {
    const uid = user?.uid;
    if (!uid) return [];
    const saved = localStorage.getItem(`savedLessons_${uid}`);
    return saved ? JSON.parse(saved).map(String) : [];
  });

  const [savedCourseIds, setSavedCourseIds] = useState(() => {
    const uid = user?.uid;
    if (!uid) return [];
    const saved = localStorage.getItem(`savedCourses_${uid}`);
    return saved ? JSON.parse(saved).map(String) : [];
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch teacher
        const teacherSnap = await getDoc(doc(db, "teachers", id));
        if (teacherSnap.exists()) {
          setTeacher({ id: teacherSnap.id, ...teacherSnap.data() });
        }

        // Fetch videos by this teacher
        const videosSnap = await getDocs(
          query(collection(db, "videos"), where("teacherId", "==", id))
        );
        setVideos(videosSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // Fetch courses by this teacher
        const coursesSnap = await getDocs(
          query(collection(db, "courses"), where("teacherId", "==", id))
        );
        setCourses(coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching teacher profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  const handleSaveVideo = (videoId) => {
    if (!user?.uid) return;
    const strId = String(videoId);
    const updated = savedVideoIds.includes(strId)
      ? savedVideoIds.filter((v) => v !== strId)
      : [...savedVideoIds, strId];
    setSavedVideoIds(updated);
    localStorage.setItem(`savedLessons_${user.uid}`, JSON.stringify(updated));
  };

  const handleSaveCourse = (courseId) => {
    if (!user?.uid) return;
    const strId = String(courseId);
    const updated = savedCourseIds.includes(strId)
      ? savedCourseIds.filter((c) => c !== strId)
      : [...savedCourseIds, strId];
    setSavedCourseIds(updated);
    localStorage.setItem(`savedCourses_${user.uid}`, JSON.stringify(updated));
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!teacher) return <div className="loading">Teacher not found.</div>;

  return (
    <div className="content">
      <div className="teacher-profile-page">

        {/* Teacher info card */}
        <div className="tp-card">
          <div className="tp-card-left">
            <img
              src={teacher.photoURL || "/default-avatar.jpg"}
              alt={teacher.name}
              className="tp-avatar"
              onError={(e) => (e.target.src = "/default-avatar.jpg")}
            />
          </div>

          <div className="tp-card-right">
            <h1 className="tp-name">{teacher.name || "Unknown"}</h1>
            <p className="tp-email">{teacher.email || ""}</p>

            <div className="tp-tags">
              {(teacher.tags || []).map((tag, i) => (
                <span key={i} className={`tp-tag tp-tag-${(i % 3) + 1}`}>
                  {tag}
                </span>
              ))}
            </div>

            <p className="tp-description">
              {teacher.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Teacher's courses */}
        <section className="tp-section">
          <h2 className="headerText">Courses by {teacher.name}</h2>
          {courses.length === 0 ? (
            <p className="tp-empty">No courses yet.</p>
          ) : (
            <div className="tp-grid">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  teacher={teacher.name}
                  teacherPhotoURL={teacher.photoURL}
                  thumbnail={course.thumbnail}
                  filters={Array.isArray(course.tags) ? course.tags : []}
                  onSave={handleSaveCourse}
                  isSaved={savedCourseIds.includes(String(course.id))}
                />
              ))}
            </div>
          )}
        </section>

        {/* Teacher's videos */}
        <section className="tp-section">
          <h2 className="headerText">Videos by {teacher.name}</h2>
          {videos.length === 0 ? (
            <p className="tp-empty">No videos yet.</p>
          ) : (
            <div className="tp-grid">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  id={video.id}
                  title={video.title}
                  teacher={teacher.name}
                  teacherPhotoURL={teacher.photoURL}
                  thumbnail={video.thumbnail}
                  filters={Array.isArray(video.tags) ? video.tags : []}
                  onSave={handleSaveVideo}
                  isSaved={savedVideoIds.includes(String(video.id))}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default TeacherProfile;
