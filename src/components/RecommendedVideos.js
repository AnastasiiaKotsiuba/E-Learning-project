import React from "react";
import { Link } from "react-router-dom";
import "./RecommendedVideos.css";

const RecommendedVideos = ({ currentVideoId, videos, currentTags = [] }) => {
  if (!videos || videos.length === 0) return <p>No videos available.</p>;

  const recommended = videos.filter(
    (v) =>
      v.id !== currentVideoId &&
      v.tags?.some((tag) => currentTags.includes(tag))
  );

  if (recommended.length === 0)
    return <p className="no-recommendations">No recommended videos found.</p>;

  return (
    <div className="recommended-list">
      {recommended.map((video) => (
        <Link
          to={`/video/${video.id}`}
          key={video.id}
          className="recommended-card"
        >
          <img
            src={video.thumbnail || "/vCard.jpg"}
            alt={video.title}
            className="recommended-thumb"
          />
          <div className="recommended-info">
            <p className="rec-title">{video.title}</p>
            <p className="rec-teacher">{video.teacher}</p>
            <div className="rec-tags">
              {(video.tags || []).slice(0, 3).map((tag, i) => (
                <span key={i} className="rec-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RecommendedVideos;
