import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../utils/firebase";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
import RecommendedVideos from "../../components/RecommendedVideos";
import "./AboutCourse.css";

const AboutCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [teacherVideos, setTeacherVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docRef = doc(db, "courses", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCourse({ id: docSnap.id, ...data });

          if (data.teacherId) {
            const teacherRef = doc(db, "teachers", data.teacherId);
            const teacherSnap = await getDoc(teacherRef);
            if (teacherSnap.exists()) {
              setTeacher({ id: teacherSnap.id, ...teacherSnap.data() });
            }
          }
        }
      } catch (error) {
        console.error("Error loading course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (!course?.teacherId) return;

    const unsubscribe = onSnapshot(collection(db, "videos"), (snapshot) => {
      const vids = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((v) => v.teacherId === course.teacherId);
      setTeacherVideos(vids);
    });

    return () => unsubscribe();
  }, [course?.teacherId]);

  if (loading || !course)
    return <div className="loading">Loading course...</div>;

  const lessonCount = course.sections?.length || 0;

  // --- Навігація на CourseView ---
  const handleStartCourse = () => {
    navigate(`/course/${id}/view`);
  };

  return (
    <div className="content">
      <div className="content-course">
        <div className="course-info-section">
          <div className="course-main-box">
            <img
              src={course.thumbnail || "/default-cover.jpg"}
              alt={course.title}
              className="course-info-thumb"
              onError={(e) => (e.target.src = "/default-cover.png")}
            />

            <div className="course-main-text">
              <h2 className="course-info-title">{course.title}</h2>

              <div className="course-teacher">
                <img
                  src={teacher?.photoURL || "/default-avatar.jpg"}
                  alt={teacher?.name || course.teacher}
                  className="teacher-avatar"
                  onError={(e) => (e.target.src = "/default-avatar.jpg")}
                />
                <span>{teacher?.name || course.teacher}</span>
              </div>

              <p className="course-lessons">
                Lessons: {lessonCount > 0 ? lessonCount : "—"}
              </p>

              <div className="course-buy">
                <button className="buy-btn" onClick={handleStartCourse}>
                  Start Course
                </button>
              </div>
            </div>
          </div>

          <div className="course-description">
            <h3>About this course</h3>
            <p>{course.description || "No description provided."}</p>
          </div>
        </div>

        <div className="recommended-section">
          <h3>Videos from this teacher</h3>
          {teacherVideos.length > 0 ? (
            <RecommendedVideos videos={teacherVideos} filterByTags={false} />
          ) : (
            <p>No recommended videos found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutCourse;
