import React from "react";
import AudioManager from "../utils/AudioManager";

type Props = {
  onClose?: () => void;
};

export default function AboutModal({ onClose }: Props) {
  function handleClose() {
    try { AudioManager.play("click"); } catch {}
    if (onClose) onClose();
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="neon-modal about-modal">
        <div className="modal-header about-header">
          <div className="modal-title">ABOUT</div>
          <button className="modal-close" onClick={handleClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-content about-content">
          <div className="inner-panel">
            <section className="box mission-box">
              <h3>THE GAME:</h3>
              <p>
              Hack the Campus is an interactive Capture-The-Flag (CTF) experience developed during a fast-paced 2-day hackathon. The game is designed to introduce cyber enthusiasts to real-world cybersecurity concepts through immersive storytelling and hands-on challenges.

Players step into the shoes of a digital investigator exploring a university network — uncovering vulnerabilities, breaking into restricted systems, and learning the same techniques professionals use to secure them.

This mini-CTF blends fun, education, and real hacking skills into one gamified adventure.
              </p>
            </section>

            <section className="box objectives-box">
              <h3>OBJECTIVES:</h3>
              <ul>
                <li>✅ Recognize and exploit common web vulnerabilities</li>
                <li>✅ Practice cryptography basics used in secure communications</li>
                <li>✅ Perform steganography to extract hidden information</li>
                <li>✅ Identify suspicious content in browser tools (DOM, Network, Storage…)</li>
                <li>✅ Strengthen awareness of real cybersecurity threats</li>
              </ul>
            </section>

            <section className="box dev-team-box">
              <h3>DEVELOPER:</h3>
              <div className="team-row">
                <div className="team-card team-a">
                  <div className="name">Tsega Ephrem</div>
                  <div className="role">A passionate software engineer and cybersecurity enthusiast who enjoys transforming technical knowledge into engaging and interactive learning tools. With experience in web development, UI/UX, and emerging security practices</div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="modal-actions" style={{ justifyContent: "center" }}>
          <button className="neon-btn btn-cyan" onClick={handleClose}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}