import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../utils/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import "./StudentHome.css";

const StudentHome = ({ recommendedVideos = [], userName = "Student" }) => {
  const userId = auth.currentUser?.uid;
  const navigate = useNavigate();

  const [inProgressCourses, setInProgressCourses] = useState([]);
  const [completedCourses, setCompletedCourses]   = useState([]);
  const [recentVideos, setRecentVideos]            = useState([]);
  const [loading, setLoading]                      = useState(true);

  /* ── 1. Courses from Firestore ── */
  useEffect(() => {
    if (!userId) return;

    const fetchProgress = async () => {
      try {
        const progressSnap = await getDocs(
          query(collection(db, "userProgress"), where("userId", "==", userId))
        );
        const records = progressSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        if (records.length === 0) { setLoading(false); return; }

        const coursesSnap = await getDocs(collection(db, "courses"));
        const courseMap   = {};
        coursesSnap.forEach((d) => { courseMap[d.id] = { id: d.id, ...d.data() }; });

        const withCourse = records
          .filter((r) => courseMap[r.courseId])
          .map((r) => ({ ...courseMap[r.courseId], progress: r.progress, activeLessonTitle: r.activeLessonTitle, updatedAt: r.updatedAt }))
          .sort((a, b) => {
            const t = (v) => (v?.seconds ? v.seconds * 1000 : v instanceof Date ? v.getTime() : 0);
            return t(b.updatedAt) - t(a.updatedAt);
          });

        setInProgressCourses(withCourse.filter((c) => c.progress > 0 && c.progress < 100));
        setCompletedCourses(withCourse.filter((c) => c.progress >= 100));
      } catch (err) {
        console.error("Error fetching progress:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userId]);

  /* ── 2. Recently watched videos from localStorage ── */
  useEffect(() => {
    if (!recommendedVideos.length) return;

    // videoProgress_${userId}_${videoId} keys are written by VideoPlayer
    const prefix = `videoProgress_${userId}_`;
    const entries = Object.entries(localStorage)
      .filter(([key]) => key.startsWith(prefix))
      .map(([key, val]) => ({ id: key.replace(prefix, ""), time: parseFloat(val) }))
      .filter((e) => e.time > 5)
      .sort((a, b) => b.time - a.time)
      .slice(0, 6);

    const videos = entries
      .map((e) => recommendedVideos.find((v) => v.id === e.id))
      .filter(Boolean);

    setRecentVideos(videos);
  }, [recommendedVideos]);

  /* ── helpers ── */
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) return <div className="sh-loading">Loading your progress...</div>;

  return (
    <div className="sh-page">
      {/* Header */}
      <div className="sh-hero">
        <h1 className="sh-greeting">{greeting()}, {userName} 👋</h1>
        <p className="sh-sub">Here's what you've been working on.</p>
      </div>

      {/* ── In Progress ── */}
      <section className="sh-section">
        <h2 className="sh-section-title">▶ Continue Learning</h2>
        {inProgressCourses.length === 0 ? (
          <p className="sh-empty">No courses in progress yet. <span className="sh-link" onClick={() => navigate("/Courses")}>Browse courses →</span></p>
        ) : (
          <div className="sh-course-grid">
            {inProgressCourses.map((course) => (
              <div
                key={course.id}
                className="sh-course-card"
                onClick={() => navigate(`/course/${course.id}/view`)}
              >
                <img
                  src={course.thumbnail || "/default-cover.png"}
                  alt={course.title}
                  className="sh-course-thumb"
                  onError={(e) => (e.target.src = "/default-cover.png")}
                />
                <div className="sh-course-info">
                  <p className="sh-course-title">{course.title}</p>
                  <p className="sh-course-lesson">Next: {course.activeLessonTitle || "—"}</p>
                  <div className="sh-bar-bg">
                    <div
                      className="sh-bar-fill sh-bar-progress"
                      style={{ width: `${Math.round(course.progress)}%` }}
                    />
                  </div>
                  <p className="sh-pct">{Math.round(course.progress)}% complete</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Completed ── */}
      {completedCourses.length > 0 && (
        <section className="sh-section">
          <h2 className="sh-section-title">✅ Completed Courses</h2>
          <div className="sh-course-grid">
            {completedCourses.map((course) => (
              <div
                key={course.id}
                className="sh-course-card sh-course-card--done"
                onClick={() => navigate(`/course/${course.id}/view`)}
              >
                <img
                  src={course.thumbnail || "/default-cover.png"}
                  alt={course.title}
                  className="sh-course-thumb"
                  onError={(e) => (e.target.src = "/default-cover.png")}
                />
                <div className="sh-course-info">
                  <p className="sh-course-title">{course.title}</p>
                  <div className="sh-bar-bg">
                    <div className="sh-bar-fill sh-bar-done" style={{ width: "100%" }} />
                  </div>
                  <p className="sh-pct sh-pct--done">🎓 Completed</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Recently Watched Videos ── */}
      {recentVideos.length > 0 && (
        <section className="sh-section">
          <h2 className="sh-section-title">🕐 Recently Watched</h2>
          <div className="sh-video-grid">
            {recentVideos.map((video) => (
              <div
                key={video.id}
                className="sh-video-card"
                onClick={() => navigate(`/video/${video.id}`)}
              >
                <img
                  src={video.thumbnail || "/vCard.jpg"}
                  alt={video.title}
                  className="sh-video-thumb"
                  onError={(e) => (e.target.src = "/vCard.jpg")}
                />
                <div className="sh-video-info">
                  <p className="sh-video-title">{video.title}</p>
                  <p className="sh-video-teacher">{video.teacher}</p>
                  <div className="sh-video-tags">
                    {(video.tags || []).slice(0, 2).map((tag, i) => (
                      <span key={i} className="sh-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default StudentHome;
