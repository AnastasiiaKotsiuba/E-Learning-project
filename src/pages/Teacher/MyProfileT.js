import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../utils/firebase";
import "./MyProfileT.css";

const MyProfileT = () => {
  const [teacherData, setTeacherData] = useState({
    name: "",
    description: "",
    tags: [],
    photoURL: "",
    email: "",
  });
  const [newTag, setNewTag] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!currentUser) return;
      try {
        const docRef = doc(db, "teachers", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTeacherData({
            ...data,
            email: data.email || currentUser.email,
          });
        } else {
          setTeacherData({
            name: "",
            description: "",
            tags: [],
            photoURL: "",
            email: currentUser.email,
          });
        }
      } catch (err) {
        console.error("Error fetching teacher data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeacherData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !teacherData.tags.includes(newTag.trim())) {
      setTeacherData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTeacherData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      await setDoc(doc(db, "teachers", currentUser.uid), teacherData, {
        merge: true,
      });
      setIsEditing(false);
      alert("Profile updated successfully ✅");
    } catch (err) {
      console.error("Error saving data:", err);
      alert("Error saving data ❌");
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="teacher-profile">
      <h1 className="h1Text">My Profile</h1>

      <div className="profile-card">
        <div className="profile-left">
          <img
            src={teacherData.photoURL || "/default-avatar.png"}
            alt="Teacher"
            className="teacher-photo"
          />
          {isEditing && (
            <input
              type="text"
              name="photoURL"
              value={teacherData.photoURL}
              onChange={handleChange}
              placeholder="Photo URL"
            />
          )}
        </div>

        <div className="profile-right">
          <div className="profile-field">
            <label>Name:</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={teacherData.name}
                onChange={handleChange}
              />
            ) : (
              <p>{teacherData.name || "Not specified"}</p>
            )}
          </div>

          <div className="profile-field">
            <label>About me:</label>
            {isEditing ? (
              <textarea
                name="description"
                value={teacherData.description}
                onChange={handleChange}
                rows="4"
              />
            ) : (
              <p>{teacherData.description || "Not specified"}</p>
            )}
          </div>

          <div className="profile-field">
            <label>Tags:</label>
            {isEditing ? (
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
                  {teacherData.tags.map((tag, index) => (
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
            ) : (
              <div className="tags-list">
                {teacherData.tags.length > 0 ? (
                  teacherData.tags.map((tag, index) => (
                    <span key={index} className="tag-chip">
                      {tag}
                    </span>
                  ))
                ) : (
                  <p>No tags added</p>
                )}
              </div>
            )}
          </div>

          <div className="profile-field">
            <label>Email:</label>
            <p>{teacherData.email}</p>
          </div>

          <div className="button-group">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="save-btn">
                  💾 Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="cancel-btn"
                >
                  ✖ Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="edit-btn">
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfileT;
