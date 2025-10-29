import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../../utils/firebase";
import { doc, getDoc, collection, addDoc, updateDoc } from "firebase/firestore";
import "./CreateContent.css";

const CreateContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState("video");
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const currentUser = auth.currentUser;

  const [formData, setFormData] = useState({
    title: "",
    teacher: "",
    tags: [],
    youtubeUrl: "",
    thumbnail: "",
    description: "",
    price: "",
  });

  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, mode === "video" ? "videos" : "courses", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data());
          setIsEditMode(true);
        }
      } catch (err) {
        console.error("Error fetching document:", err);
      }
    };
    fetchData();
  }, [id, mode]);

  useEffect(() => {
    const fetchTeacherName = async () => {
      if (!currentUser || isEditMode) return;
      try {
        const docRef = doc(db, "teachers", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData((prev) => ({
            ...prev,
            teacher: data.name || currentUser.email,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            teacher: currentUser.email,
          }));
        }
      } catch (err) {
        console.error("Error fetching teacher:", err);
      }
    };
    fetchTeacherName();
  }, [currentUser, isEditMode]);

  const extractThumbnail = (url) => {
    const videoIdMatch = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://img.youtube.com/vi/${videoIdMatch[1]}/hqdefault.jpg`;
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "youtubeUrl" && mode === "video") {
      const thumb = extractThumbnail(value);
      setFormData((prev) => ({ ...prev, [name]: value, thumbnail: thumb }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, thumbnail: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSave = async () => {
    if (!formData.title || (mode === "video" && !formData.youtubeUrl)) {
      alert("❗ Please fill in all required fields");
      return;
    }
    setLoading(true);

    try {
      const collectionName = mode === "video" ? "videos" : "courses";

      if (isEditMode) {
        await updateDoc(doc(db, collectionName, id), { ...formData });
        alert("✅ Updated successfully!");
      } else {
        const dataToSave = {
          ...formData,
          teacherId: currentUser.uid,
          createdAt: new Date(),
        };

        if (mode === "course") {
          dataToSave.status = "draft";
        }

        await addDoc(collection(db, collectionName), dataToSave);
        alert(
          `✅ ${mode === "video" ? "Video" : "Course"} added successfully!`
        );
      }

      navigate("/teacher/home");
    } catch (err) {
      console.error("Error saving:", err);
      alert("❌ Error saving data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-profile">
      <div className="toggle-buttons">
        <button
          className={mode === "course" ? "active" : ""}
          onClick={() => setMode("course")}
        >
          Create Course
        </button>
        <button
          className={mode === "video" ? "active" : ""}
          onClick={() => setMode("video")}
        >
          Add Video
        </button>
      </div>

      <div className="profile-card">
        <div className="profile-left">
          {formData.thumbnail ? (
            <div className="thumbnail-placeholder">
              <img
                src={formData.thumbnail}
                alt="Preview"
                className="thumbnail-photo"
              />

              {mode === "course" && (
                <div className="upload-url">
                  <input
                    type="text"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="thumbnail-placeholder">
              <div className="thumbnail-cover">No Preview</div>

              {mode === "course" && (
                <div className="upload-url">
                  <input
                    type="text"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="profile-right">
          <div className="profile-field">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={`Enter ${mode} title`}
            />
          </div>

          <div className="profile-field">
            <label>Teacher:</label>
            <input
              type="text"
              name="teacher"
              value={formData.teacher}
              disabled
            />
          </div>

          {mode === "video" && (
            <div className="profile-field">
              <label>YouTube URL:</label>
              <input
                type="text"
                name="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={handleChange}
                placeholder="Paste YouTube video link"
              />
            </div>
          )}

          {mode === "course" && (
            <>
              <div className="profile-field">
                <label>Description:</label>
                <textarea
                  name="description"
                  className="desc-input"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter course description"
                ></textarea>
              </div>

              <div className="profile-field">
                <label>Price (USD):</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter course price"
                />
              </div>
            </>
          )}

          <div className="profile-field">
            <label>Tags:</label>
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
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag-chip">
                    {tag}
                    <button
                      className="remove-tag"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="button-group">
            <button
              onClick={handleSave}
              className="save-btn"
              disabled={loading}
            >
              {loading ? "Saving..." : "💾 Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContent;
