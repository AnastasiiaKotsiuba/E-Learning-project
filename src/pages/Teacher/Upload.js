import React, { useState } from "react";

const Upload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleUpload = () => {
    console.log("Video uploaded:", { title, description });
  };

  return (
    <div>
      <h1>Upload Video</h1>
      <input
        type="text"
        placeholder="Video Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default Upload;
