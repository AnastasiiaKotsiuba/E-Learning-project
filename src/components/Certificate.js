import React, { useRef } from "react";
import html2canvas from "html2canvas";
import "./Certificate.css";

const Certificate = ({ studentName, courseTitle, onClose }) => {
  const certRef = useRef();

  const handleDownload = async () => {
    const canvas = await html2canvas(certRef.current, {
      scale: 2,
      backgroundColor: "#fff",
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = `certificate-${courseTitle.replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="cert-overlay" onClick={onClose}>
      <div className="cert-modal" onClick={(e) => e.stopPropagation()}>

        {/* The actual certificate (captured by html2canvas) */}
        <div className="cert-paper" ref={certRef}>
          <div className="cert-border">
            <div className="cert-top-decoration">
              <span className="cert-star">★</span>
              <span className="cert-star">★</span>
              <span className="cert-star">★</span>
            </div>

            <p className="cert-label">Certificate of Completion</p>
            <p className="cert-presented">This is to certify that</p>
            <h2 className="cert-name">{studentName}</h2>
            <p className="cert-presented">has successfully completed the course</p>
            <h3 className="cert-course">"{courseTitle}"</h3>
            <p className="cert-date">{today}</p>

            <div className="cert-divider" />

            <div className="cert-footer">
              <div className="cert-signature">
                <div className="cert-sig-line" />
                <p>E-Learning Platform</p>
              </div>
            </div>

            <div className="cert-bottom-decoration">
              <span className="cert-star">★</span>
              <span className="cert-star">★</span>
              <span className="cert-star">★</span>
            </div>
          </div>
        </div>

        <div className="cert-actions">
          <button className="cert-download-btn" onClick={handleDownload}>
            ⬇ Download Certificate
          </button>
          <button className="cert-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
