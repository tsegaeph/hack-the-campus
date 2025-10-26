import React from "react";

type Props = {
  imageSrc: string;
  onClose?: () => void;
};

export default function AccessModal({ imageSrc, onClose }: Props) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="neon-modal">
        <div className="modal-header">
          <div className="modal-title">CLASSIFIED INTEL</div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-content">
          <img src={imageSrc} alt="dialog screenshot" className="modal-image" />
        </div>

        <div className="modal-actions">
          <button className="neon-btn btn-green" onClick={onClose}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}