import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../utils/firebase";
import "./MyProfileS.css";

const MyProfileS = ({ user, setUser }) => {
  const [studentData, setStudentData] = useState({
    name: "",
    photoURL: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!currentUser) return;
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStudentData({
            name: data.name || "",
            photoURL: data.photoURL || "",
            email: data.email || currentUser.email,
          });
        } else {
          setStudentData({
            name: "",
            photoURL: "",
            email: currentUser.email,
          });
        }
      } catch (err) {
        console.error("Error fetching student data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      await setDoc(
        doc(db, "users", currentUser.uid),
        { name: studentData.name, photoURL: studentData.photoURL },
        { merge: true }
      );

      // Live-оновлення Header
      setUser((prev) => ({
        ...prev,
        name: studentData.name,
        photoURL: studentData.photoURL,
      }));

      alert("Profile updated successfully ✅");
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving data:", err);
      alert("Error saving data ❌");
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="student-profile">
      <h1 className="h1Text">My Profile</h1>
      <div className="profile-card">
        <div className="profile-left">
          <img
            src={studentData.photoURL || "/default-avatar.png"}
            alt="Student"
            className="student-photo"
          />
          {isEditing && (
            <input
              type="text"
              name="photoURL"
              value={studentData.photoURL}
              onChange={handleChange}
              placeholder="Photo URL"
            />
          )}
        </div>
        <div className="profile-right">
          <div className="profile-s">
            <label>Name:</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={studentData.name}
                onChange={handleChange}
              />
            ) : (
              <p>{studentData.name || "Not specified"}</p>
            )}
          </div>
          <div className="profile-s">
            <label>Email:</label>
            <p>{studentData.email}</p>
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

export default MyProfileS;
