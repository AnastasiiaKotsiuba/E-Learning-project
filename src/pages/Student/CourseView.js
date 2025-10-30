import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../utils/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import confetti from "canvas-confetti";
import "./CourseView.css";
import { auth } from "../../utils/firebase";

const CourseView = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);

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
  }, [id]);

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
          updatedAt: new Date(),
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

  if (!course)
    return <div className="loading">Loading course information...</div>;

  const totalLessons = course.sections?.length || 0;
  const currentIndex = course.sections?.findIndex(
    (l) => l.title === activeLesson?.title
  );
  const isLastLesson = currentIndex === totalLessons - 1;

  return (
    <div className="content">
      <div className="course-view">
        <div className="course-top">
          <div className="video-section">
            <div className="video-player">
              {activeLesson?.videoUrl ? (
                <iframe
                  width="100%"
                  height="400px"
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
                <div className="congrats-text">🎉 Congratulations! 🎉</div>
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
    </div>
  );
};

export default CourseView;
