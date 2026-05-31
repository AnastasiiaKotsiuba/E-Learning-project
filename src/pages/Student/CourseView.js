import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../utils/firebase";
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import confetti from "canvas-confetti";
import "./CourseView.css";
import { auth } from "../../utils/firebase";
import Certificate from "../../components/Certificate";
import StarRating from "../../components/StarRating";

const CourseView = ({ user }) => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const studentName = user?.name || auth.currentUser?.displayName || "Student";

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myReviewText, setMyReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasMyReview, setHasMyReview] = useState(false);

const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      try {
        const courseRef = doc(db, "courses", id);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          const data = courseSnap.data();
          setCourse({ id: courseSnap.id, ...data });

          if (data.teacherId) {
            const teacherRef = doc(db, "teachers", data.teacherId);
            const teacherSnap = await getDoc(teacherRef);
            if (teacherSnap.exists()) {
              setTeacher({ id: teacherSnap.id, ...teacherSnap.data() });
            }
          }

          const progressRef = doc(db, "userProgress", `${userId}_${id}`);
          const progressSnap = await getDoc(progressRef);

          if (progressSnap.exists()) {
            const progressData = progressSnap.data();
            setProgress(progressData.progress || 0);
            const savedLesson =
              data.sections?.find(
                (l) => l.title === progressData.activeLessonTitle
              ) || data.sections?.[0];
            setActiveLesson(savedLesson);
          } else {
            setActiveLesson(data.sections?.[0] || null);
          }
        }
      } catch (err) {
        console.error("Error loading course or progress:", err);
      }
    };

    fetchCourseAndProgress();
  }, [id, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveProgress = async (newProgress, newLessonTitle) => {
    try {
      const progressRef = doc(db, "userProgress", `${userId}_${id}`);
      await setDoc(
        progressRef,
        {
          userId,
          courseId: id,
          progress: newProgress,
          activeLessonTitle: newLessonTitle,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  const handleCompleteLesson = async () => {
    if (!course?.sections) return;

    const totalLessons = course.sections.length;
    const currentIndex = course.sections.findIndex(
      (l) => l.title === activeLesson.title
    );

    const newProgress = ((currentIndex + 1) / totalLessons) * 100;
    setProgress(newProgress);

    await saveProgress(newProgress, activeLesson.title);

    if (currentIndex + 1 === totalLessons) {
      setShowCongrats(true);
      launchConfetti();
      await saveProgress(100, activeLesson.title);
      setTimeout(() => setShowCertificate(true), 2500);
    } else {
      const nextLesson = course.sections[currentIndex + 1];
      setActiveLesson(nextLesson);
      await saveProgress(newProgress, nextLesson.title);
    }
  };

  const launchConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 25,
      spread: 360,
      ticks: 60,
      zIndex: 1000,
    };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleSelectLesson = async (lesson) => {
    setActiveLesson(lesson);
    setShowCongrats(false);
    await saveProgress(progress, lesson.title);
  };

  // Load reviews for this course (no orderBy → no composite index needed)
  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, "reviews"), where("courseId", "==", id));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setReviews(all);
      const mine = all.find((r) => r.userId === auth.currentUser?.uid);
      if (mine) {
        setMyRating(mine.rating);
        setMyReviewText(mine.text || "");
        setHasMyReview(true);
      } else {
        setHasMyReview(false);
      }
    });
    return () => unsub();
  }, [id]);

  const handleSubmitReview = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || myRating === 0) return;
    setSubmitting(true);
    try {
      await setDoc(doc(db, "reviews", `${uid}_${id}`), {
        courseId: id,
        userId: uid,
        userName: user?.name || "Student",
        userPhoto: user?.photoURL || "/default-avatar.jpg",
        rating: myRating,
        text: myReviewText.trim(),
        createdAt: new Date(),
      }, { merge: true });
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setSubmitting(false);
      setHasMyReview(true);
    }
  };

  if (!course)
    return <div className="loading">Loading course information...</div>;

  const totalLessons = course.sections?.length || 0;
  const currentIndex = course.sections?.findIndex(
    (l) => l.title === activeLesson?.title
  );
  const isLastLesson = currentIndex === totalLessons - 1;

  return (
    <div className="content">
      {showCertificate && (
        <Certificate
          studentName={studentName}
          courseTitle={course?.title || ""}
          onClose={() => setShowCertificate(false)}
        />
      )}
      <div className="course-view">
        <div className="course-top">
          <div className="video-section">
            <div className="course-video-player">
              {activeLesson?.videoUrl ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={activeLesson.videoUrl.replace("watch?v=", "embed/")}
                  title={activeLesson.title}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="video-placeholder">
                  Select a lesson to start
                </div>
              )}
            </div>

            <div className="lesson-info-box">
              <h3>{activeLesson?.title || "Lesson Details"}</h3>
              <p>
                {activeLesson?.description || "Select a lesson to see details."}
              </p>

              {!showCongrats ? (
                <button
                  className="complete-lesson-btn"
                  onClick={handleCompleteLesson}
                >
                  {isLastLesson ? "Complete Course" : "Complete Lesson"}
                </button>
              ) : (
                <div>
                  <div className="congrats-text">🎉 Congratulations! 🎉</div>
                  <button
                    className="complete-lesson-btn"
                    style={{ marginTop: 16 }}
                    onClick={() => setShowCertificate(true)}
                  >
                    🏆 Get Certificate
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="course-sidebar">
            <div className="courses-info">
              <img
                src={course.thumbnail || "/default-cover.jpg"}
                alt={course.title}
                className="course-cover"
              />
              <div className="course-header-text">
                <h2>{course.title}</h2>
                <p>{teacher?.name || "Unknown Teacher"}</p>
              </div>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="progress-text">
              Progress: {Math.round(progress)}% (
              {Math.round((progress / 100) * totalLessons)} / {totalLessons})
            </p>

            <div className="lessons-list">
              {course.sections && course.sections.length > 0 ? (
                course.sections.map((lesson, i) => (
                  <div
                    key={i}
                    className={`lesson-item ${
                      activeLesson?.title === lesson.title ? "active" : ""
                    }`}
                    onClick={() => handleSelectLesson(lesson)}
                  >
                    <span>
                      {i + 1}. {lesson.title}
                    </span>
                  </div>
                ))
              ) : (
                <p>No lessons found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Review section: only visible after course completion ── */}
      {progress >= 100 && (
        <div className="course-review-section">
          {!hasMyReview ? (
            <>
              <h3>Rate this course</h3>
              <div className="review-form">
                <p className="review-form-label">Your rating:</p>
                <StarRating value={myRating} onChange={setMyRating} size={28} />
                <textarea
                  className="review-textarea"
                  placeholder="Share your thoughts about this course (optional)..."
                  value={myReviewText}
                  onChange={(e) => setMyReviewText(e.target.value)}
                  rows={3}
                />
                <button
                  className="review-submit-btn"
                  onClick={handleSubmitReview}
                  disabled={submitting || myRating === 0}
                >
                  {submitting ? "Saving..." : "Submit Review"}
                </button>
              </div>
            </>
          ) : (
            <p className="review-already-submitted">✅ You have already rated this course. Thank you!</p>
          )}

          {reviews.length > 0 && (
            <div className="reviews-list" style={{ marginTop: 24 }}>
              <h4 style={{ marginBottom: 12, color: "#535353" }}>All Reviews</h4>
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
          )}
        </div>
      )}
    </div>
  );
};

export default CourseView;
