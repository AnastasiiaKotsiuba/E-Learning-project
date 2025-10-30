import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../../utils/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  useEffect(() => {
    if (showDeleteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showDeleteModal]);

  const handleAddTag = () => {
    if (newTag.trim() && !course.tags.includes(newTag.trim())) {
      setCourse((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag) => {
    setCourse((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      { title: "", videoUrl: "", description: "" },
    ]);
  };

  const handleSectionChange = (index, field, value) => {
    setSections((prev) =>
      prev.map((sec, i) => (i === index ? { ...sec, [field]: value } : sec))
    );
  };

  const handleSave = async () => {
    if (!course.title.trim()) {
      alert("Course title is required!");
      return;
    }

    setLoading(true);

    try {
      const hasSections = sections.some(
        (s) => s.title.trim() || s.videoUrl.trim() || s.description.trim()
      );

      const filteredSections = sections.filter(
        (s) => s.title.trim() || s.videoUrl.trim() || s.description.trim()
      );

      await updateDoc(doc(db, "courses", id), {
        ...course,
        sections: filteredSections,
        status: hasSections ? "ready" : "draft",
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

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    setLoading(true);

    try {
      await deleteDoc(doc(db, "courses", id));
      alert("Course deleted successfully!");
      navigate("/teacher/home");
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to delete course.");
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <div className="content">
      <div className="builder-header">
        <h1>Edit Course</h1>
        <div className="header-buttons">
          <button
            className="delete-course-btn"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete Course
          </button>
          <button
            className="save-course-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Course"}
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Course?</h3>
            <p>This action cannot be undone. Are you sure?</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
