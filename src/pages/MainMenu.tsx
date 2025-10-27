import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NeonButton from "../components/NeonButton";
import AccessAnimation from "../components/AccessAnimation";
import AboutModal from "../components/AboutModal";
import SettingsModal from "../components/SettingsModal";

type ModalType = "about" | "settings" | null;

export default function MainMenu() {
  const nav = useNavigate();

  const [showAccessAnim, setShowAccessAnim] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [openModal, setOpenModal] = useState(false);

  // start sequence: play animation, then show modal of the requested type
  function startAccessSequence(type: ModalType) {
    setModalType(type);
    setShowAccessAnim(true);
    // AccessAnimation will call onComplete which will open the modal and hide animation.
  }

  return (
    <div className="screen main-screen">
      {/* Background video: put your video at /public/assets/bg.mp4 */}
      <video className="bg-video" autoPlay muted loop playsInline>
        <source src="./assets/bg.mp4" type="video/mp4" />
        {/* fallback */}
      </video>

      <div className="overlay-grid" />

      <div className="center-column">
        <header className="title-block">
          <div className="logo-shield">⟐</div>
          <h1 className="main-title">HACK THE CAMPUS</h1>
          <p className="subtitle">Interactive CTF training · Cybersecurity challenges</p>
        </header>

        <div className="buttons-stack">
          <NeonButton
            color="green"
            onClick={() => nav("/roadmap")}
            icon="▶"
            label="GAME ROADMAP"
          />
          <NeonButton
            color="cyan"
            onClick={() => startAccessSequence("about")}
            icon="ℹ"
            label="ABOUT"
          />
          <NeonButton
            color="gold"
            onClick={() => startAccessSequence("settings")}
            icon="⚙"
            label="SETTINGS"
          />
        </div>
      </div>

      {/* Access animation overlay */}
      {showAccessAnim && (
        <AccessAnimation
          onComplete={() => {
            setShowAccessAnim(false);
            setOpenModal(true);
          }}
        />
      )}

      {/* About modal */}
      {openModal && modalType === "about" && (
        <AboutModal
          onClose={() => {
            setOpenModal(false);
            setModalType(null);
          }}
        />
      )}

      {/* Settings modal */}
      {openModal && modalType === "settings" && (
        <SettingsModal
          onClose={() => {
            setOpenModal(false);
            setModalType(null);
          }}
        />
      )}
    </div>
  );
}