import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../utils/firebase";
import { doc, getDoc, collection, onSnapshot, query, where } from "firebase/firestore";
import RecommendedVideos from "../../components/RecommendedVideos";
import StarRating from "../../components/StarRating";
import "./AboutCourse.css";

const AboutCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [teacherVideos, setTeacherVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);

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

  // Load reviews (no orderBy to avoid needing a composite index)
  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, "reviews"), where("courseId", "==", id));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setReviews(all);
    });
    return () => unsub();
  }, [id]);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

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
                  className="course-teacher-avatar"
                  onError={(e) => (e.target.src = "/default-avatar.jpg")}
                />
                <span>{teacher?.name || course.teacher}</span>
              </div>

              <p className="course-lessons">
                Lessons: {lessonCount > 0 ? lessonCount : "—"}
              </p>

              {avgRating && (
                <div className="course-avg-rating">
                  <StarRating value={Math.round(avgRating)} readOnly size={18} />
                  <span className="avg-rating-text">{avgRating} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
                </div>
              )}

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

          {/* Reviews are shown in CourseView after completion */}
          {reviews.length > 0 && (
            <div className="reviews-section">
              <h3>Reviews <span className="avg-badge">⭐ {avgRating}</span></h3>
              <div className="reviews-list">
                {reviews.map((r) => (
                  <div key={r.id} className="review-card">
                    <div className="review-header">
                      <img
                        src={r.userPhoto || "/default-avatar.jpg"}
                        alt={r.userName}
                        className="review-avatar"
                        onError={(e) => (e.target.src = "/default-avatar.jpg")}
                      />
                      <div>
                        <p className="review-author">{r.userName}</p>
                        <StarRating value={r.rating} readOnly size={14} />
                      </div>
                    </div>
                    {r.text && <p className="review-text">{r.text}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
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
