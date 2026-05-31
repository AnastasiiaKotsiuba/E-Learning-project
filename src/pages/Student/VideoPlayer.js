import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import RecommendedVideos from "../../components/RecommendedVideos";
import { db } from "../../utils/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import "./VideoPlayer.css";

const VideoPlayer = ({ videos, user }) => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const playerRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const saveIntervalRef = useRef(null);
  const storageKey = `videoProgress_${user?.uid || "guest"}_${id}`;

  useEffect(() => {
    if (videos && videos.length > 0) {
      const current = videos.find((v) => v.id === id);
      setVideo(current || null);
    }
  }, [id, videos]);

  useEffect(() => {
    if (!id) {
      setLoadingComments(false);
      return;
    }

    const q = query(
      collection(db, "comments"),
      where("videoId", "==", id),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Loaded comments:", loaded);
        setComments(loaded);
        setLoadingComments(false);
      },
      (error) => {
        console.error("Firestore error in comments listener:", error);
        setLoadingComments(false);
      }
    );

    return () => {
      console.log("Unsubscribing from comments");
      unsubscribe();
    };
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    if (!user || !user.uid) {
      alert("Please log in to comment.");
      return;
    }

    try {
      await addDoc(collection(db, "comments"), {
        videoId: id,
        text: comment.trim(),
        authorId: user.uid,
        authorName: user.name || "Anonymous",
        authorPhoto: user.photoURL || "/default-avatar.jpg",
        createdAt: serverTimestamp(),
      });
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteDoc(doc(db, "comments", commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const startEditing = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;
    try {
      await updateDoc(doc(db, "comments", commentId), {
        text: editText.trim(),
        editedAt: serverTimestamp(),
      });
      setEditingId(null);
      setEditText("");
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  useEffect(() => {
    if (!video) return;

    const savedTime = parseFloat(localStorage.getItem(storageKey) || "0");

    const onYTReady = () => {
      if (!window.YT) return;

      ytPlayerRef.current = new window.YT.Player(playerRef.current, {
        events: {
          onReady: (e) => {
            if (savedTime > 10) e.target.seekTo(savedTime, true);
            saveIntervalRef.current = setInterval(() => {
              try {
                const t = e.target.getCurrentTime();
                if (t > 0) localStorage.setItem(storageKey, t);
              } catch (_) {}
            }, 5000);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      onYTReady();
    } else {
      window.onYouTubeIframeAPIReady = onYTReady;
      if (!document.getElementById("yt-api-script")) {
        const script = document.createElement("script");
        script.id = "yt-api-script";
        script.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(script);
      }
    }

    return () => {
      clearInterval(saveIntervalRef.current);
      if (ytPlayerRef.current?.destroy) ytPlayerRef.current.destroy();
    };
  }, [video, storageKey]);

  if (!video) return <div className="loading">Loading video...</div>;

  const youtubeID = video.youtubeUrl?.includes("v=")
    ? video.youtubeUrl.split("v=")[1].split("&")[0]
    : video.youtubeUrl?.split("/").pop();

  return (
    <div className="content">
      {" "}
      <div className="content-player">
        <div className="video-content">
          <div className="video-player">
            {parseFloat(localStorage.getItem(storageKey) || "0") > 10 && (
              <p className="resume-hint">▶ Resuming from where you left off</p>
            )}
            <iframe
              ref={playerRef}
              id={`yt-player-${id}`}
              src={`https://www.youtube.com/embed/${youtubeID}?enablejsapi=1`}
              title={video.title}
              frameBorder="0"
              allowFullScreen
            ></iframe>

            <h2 className="video-title">{video.title}</h2>
            <p className="video-teacher">By {video.teacher}</p>

            <div className="video-tags">
              {video.tags?.map((tag, i) => (
                <span key={i} className="tag">
                  {tag}
                </span>
              ))}
            </div>

          </div>

          <div className="recommended-section">
            <h3>Recommended Videos</h3>
            {video.tags?.length > 0 ? (
              <RecommendedVideos
                currentVideoId={id}
                videos={videos}
                currentTags={video.tags}
              />
            ) : (
              <p>No tags found for this video.</p>
            )}
          </div>
        </div>

        <div className="comments-section">
          <h3>Comments ({comments.length})</h3>

          {user ? (
            <form onSubmit={handleAddComment} className="comment-form">
              <img
                src={user.photoURL || "/default-avatar.jpg"}
                alt="avatar"
                className="comment-avatar"
              />
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                maxLength="500"
              />
              <button type="submit" disabled={!comment.trim()}>
                Post
              </button>
            </form>
          ) : (
            <p className="login-warning">Log in to leave a comment</p>
          )}

          {loadingComments ? (
            <p>Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="comment">
                <div className="comment-header">
                  <img
                    src={c.authorPhoto || "/default-avatar.jpg"}
                    alt={c.authorName}
                    className="comment-avatar"
                  />
                  <div className="comment-meta">
                    <p className="comment-author">{c.authorName}</p>
                    <span className="comment-date">
                      {c.createdAt?.toDate?.().toLocaleString() || "Just now"}
                      {c.editedAt && " (edited)"}
                    </span>
                  </div>

                  {user?.uid === c.authorId && (
                    <div className="comment-actions">
                      <button
                        onClick={() => startEditing(c.id, c.text)}
                        className="edit-btn-com"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="delete-btn-com"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {editingId === c.id ? (
                  <div className="comment-edit">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      maxLength="500"
                      className="edit-input"
                    />
                    <div className="edit-buttons">
                      <button
                        onClick={() => handleEditComment(c.id)}
                        className="save-btn-com"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="cancel-btn-com"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="comment-text">{c.text}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
