import { useEffect } from "react";

type Props = {
  onComplete?: () => void;
};

/**
 * Small overlay animation: "ACCESS GRANTED" (green) + unlocking lock animation.
 * Calls onComplete after the animation ends.
 */
export default function AccessAnimation({ onComplete }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete && onComplete();
    }, 2000); // matches CSS animation durations
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="access-overlay" aria-hidden>
      <div className="access-card">
        <div className="lock-wrap">
          <div className="lock-body" />
          <div className="lock-shackle" />
        </div>
        <div className="access-text">ACCESS GRANTED</div>
      </div>
    </div>
  );
}