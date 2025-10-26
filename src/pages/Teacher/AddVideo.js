import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../../utils/firebase";
import { doc, getDoc, collection, addDoc, updateDoc } from "firebase/firestore";
import "./AddVideo.css";

const AddVideo = () => {
  const { id } = useParams(); // ⚡ id відео для редагування
  const navigate = useNavigate();

  const [videoData, setVideoData] = useState({
    title: "",
    teacher: "",
    tags: [],
    youtubeUrl: "",
    thumbnail: "",
  });
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const currentUser = auth.currentUser;

  // Підвантаження відео для редагування
  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "videos", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVideoData(docSnap.data());
          setIsEditMode(true);
        }
      } catch (err) {
        console.error("Error fetching video:", err);
      }
    };
    fetchVideo();
  }, [id]);

  // Підвантаження імені вчителя
  useEffect(() => {
    const fetchTeacherName = async () => {
      if (!currentUser || isEditMode) return;

      try {
        const docRef = doc(db, "teachers", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setVideoData((prev) => ({
            ...prev,
            teacher: data.name || currentUser.email,
          }));
        } else {
          setVideoData((prev) => ({
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

    if (name === "youtubeUrl") {
      const thumb = extractThumbnail(value);
      setVideoData((prev) => ({ ...prev, thumbnail: thumb }));
    }

    setVideoData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !videoData.tags.includes(newTag.trim())) {
      setVideoData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setVideoData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSave = async () => {
    if (!videoData.title || !videoData.youtubeUrl) {
      alert("Please fill in all required fields ❗");
      return;
    }
    setLoading(true);

    try {
      if (isEditMode) {
        await updateDoc(doc(db, "videos", id), { ...videoData });
        alert("✅ Video updated successfully!");
      } else {
        await addDoc(collection(db, "videos"), {
          ...videoData,
          teacherId: currentUser.uid,
          createdAt: new Date(),
        });
        alert("✅ Video added successfully!");
      }
      navigate("/teacher/home");
    } catch (err) {
      console.error("Error saving video:", err);
      alert("❌ Error saving video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-profile">
      <h1 className="h1Text">{isEditMode ? "Edit Video" : "Add New Video"}</h1>

      <div className="profile-card">
        <div className="profile-left">
          {videoData.thumbnail ? (
            <img
              src={videoData.thumbnail}
              alt="YouTube thumbnail"
              className="teacher-photo"
            />
          ) : (
            <div className="thumbnail-placeholder">YouTube Preview</div>
          )}
        </div>

        <div className="profile-right">
          <div className="profile-field">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={videoData.title}
              onChange={handleChange}
              placeholder="Enter video title"
            />
          </div>

          <div className="profile-field">
            <label>Teacher:</label>
            <input
              type="text"
              name="teacher"
              value={videoData.teacher}
              disabled
            />
          </div>

          <div className="profile-field">
            <label>YouTube URL:</label>
            <input
              type="text"
              name="youtubeUrl"
              value={videoData.youtubeUrl}
              onChange={handleChange}
              placeholder="Paste YouTube video link"
            />
          </div>

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
                {videoData.tags.map((tag, index) => (
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
              {loading ? "Saving..." : "💾 Save Video"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVideo;
