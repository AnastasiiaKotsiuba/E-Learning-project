import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../../utils/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import "./CourseBuilder.css";

const CourseBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;

  const [course, setCourse] = useState({
    title: "",
    description: "",
    tags: [],
  });

  const [sections, setSections] = useState([
    { title: "", videoUrl: "", description: "" },
  ]);

  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);

  // === Завантажуємо курс ===
  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, "courses", id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCourse({
            title: data.title || "",
            description: data.description || "",
            tags: data.tags || [],
          });
          setSections(
            data.sections || [{ title: "", videoUrl: "", description: "" }]
          );
        }
      } catch (err) {
        console.error("Error loading course:", err);
      }
    };
    fetchCourse();
  }, [id]);

  // === Додаємо тег ===
  const handleAddTag = () => {
    if (newTag.trim() && !course.tags.includes(newTag.trim())) {
      setCourse((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  // === Видаляємо тег ===
  const handleRemoveTag = (tag) => {
    setCourse((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // === Додаємо розділ ===
  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      { title: "", videoUrl: "", description: "" },
    ]);
  };

  // === Оновлюємо розділ ===
  const handleSectionChange = (index, field, value) => {
    setSections((prev) =>
      prev.map((sec, i) => (i === index ? { ...sec, [field]: value } : sec))
    );
  };

  // === Зберігаємо курс ===
  const handleSave = async () => {
    if (!course.title.trim()) {
      alert("Course title is required!");
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, "courses", id), {
        ...course,
        sections: sections.filter(
          (s) => s.title.trim() || s.videoUrl.trim() || s.description.trim()
        ),
        updatedAt: serverTimestamp(),
      });
      alert("Course saved successfully!");
      navigate("/teacher/home");
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to save course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-builder">
      <div className="builder-header">
        <h1>Edit Course</h1>
        <button className="save-btn" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Course"}
        </button>
      </div>

      {/* === ОСНОВНА ІНФОРМАЦІЯ === */}
      <div className="course-info">
        <div className="form-group">
          <label>Course Title</label>
          <input
            type="text"
            value={course.title}
            onChange={(e) => setCourse({ ...course, title: e.target.value })}
            placeholder="Enter course title"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={course.description}
            onChange={(e) =>
              setCourse({ ...course, description: e.target.value })
            }
            placeholder="Enter course description"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Tags</label>
          <div className="tags-input">
            <div className="add-tag">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add new tag..."
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
              <button onClick={handleAddTag}>Add</button>
            </div>

            {/* ВИПРАВЛЕНО: course.tags, а не formData.tags */}
            <div className="tags-list">
              {course.tags.map((tag, index) => (
                <span key={index} className="tag-chip">
                  {tag}
                  <button
                    className="remove-tag"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === РОЗДІЛИ === */}
      <div className="sections-container">
        <h2>Course Sections</h2>
        {sections.map((section, index) => (
          <div key={index} className="section-card">
            <div className="form-group">
              <label>Section Title</label>
              <input
                type="text"
                value={section.title}
                onChange={(e) =>
                  handleSectionChange(index, "title", e.target.value)
                }
                placeholder="e.g., Introduction to HTML"
              />
            </div>

            <div className="form-group">
              <label>Video URL (YouTube)</label>
              <input
                type="text"
                value={section.videoUrl}
                onChange={(e) =>
                  handleSectionChange(index, "videoUrl", e.target.value)
                }
                placeholder="https://youtube.com/..."
              />
            </div>

            <div className="form-group">
              <label>Lesson Description</label>
              <textarea
                value={section.description}
                onChange={(e) =>
                  handleSectionChange(index, "description", e.target.value)
                }
                placeholder="Brief description of the lesson"
                rows={3}
              />
            </div>
          </div>
        ))}

        <button className="add-section-btn" onClick={handleAddSection}>
          + Add Section
        </button>
      </div>
    </div>
  );
};

export default CourseBuilder;
