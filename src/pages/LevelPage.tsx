import { useNavigate, useParams } from "react-router-dom";
import TerminalChallenge from "../components/TerminalChallenge";

/**
 * LevelPage routes to per-level challenges.
 * Levels 1..5: Library, Server Lab, Cafeteria, Web Inspect, Admin Office
 */

export default function LevelPage() {
  const nav = useNavigate();
  const { id } = useParams(); // 1..5
  const idx = Number(id) - 1;

  if (!id || isNaN(idx) || idx < 0 || idx >= 5) {
    return (
      <div style={{ padding: 32 }}>
        <button className="back" onClick={() => nav("/roadmap")}>⟵ BACK</button>
        <h2>Invalid level</h2>
      </div>
    );
  }

  if (idx === 0) {
    // Level 1 — Library
    const story = `Title: Study Notes

The campus library’s digital archive has been scrambled. Overnight, someone from ShadowRoot encrypted a set of research notes and left an obfuscated message that points to their next target. The librarian found a battered USB and uploaded one of the encrypted files to the terminal. Recover the hidden message from secret_note.txt. Submit the flag in the format flag{...}. You have limited time — start the terminal when ready.
`;
    const secretText = `kqfl{Mjqqt_Hfruzx} Dtz mfaj bjqq ijhwduyji nsktwrfynts. Stb ymj kwfrjbtwp bnqq gj xfkj.`;
    const expectedFlag = "flag{Hello_Campus}";
    const durationSeconds = 10 * 60;

    // Title passed to the terminal header now includes the more descriptive label
    const headerTitle = "Library";

    return (
      <TerminalChallenge
        levelIndex={0}
        title={headerTitle}
        story={story}
        secretText={secretText}
        expectedFlag={expectedFlag}
        durationSeconds={durationSeconds}
        fileName="secret_note.txt"
      />
    );
  }

  if (idx === 1) {
    // Level 2 — Server Lab (Log Forensics)
    const story = `Title: Traffic with a Tell-Tale Pattern

The Server Lab team recovered a slice of network traffic logs after unusual activity was spotted on the campus portal. At first glance most requests look normal — page loads, assets, and routine checks — but buried among them are requests that don’t follow normal patterns. The admin suspects these requests are being used to move something off the network.

Download the logfile, inspect the requests. Start the timer when you begin.
If you click HINT a time penalty will be applied.
`;
    // Use the exact log text provided earlier
    const logText = `10.1.1.10 - - [2025-10-25T09:03:12Z] "GET /index.html HTTP/1.1" 200 452 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
10.1.1.11 - - [2025-10-25T09:04:03Z] "GET /assets/logo.png HTTP/1.1" 200 10234 "https://campus.edu" "curl/7.68.0"
172.16.0.2 - - [2025-10-25T09:10:21Z] "POST /submit HTTP/1.1" 200 12 "https://portal.campus.edu" "Mozilla/5.0" "payload=eyJ1c2VyIjoiamRvZSIsImRhdGEiOiJabXhsYkc3dHNKMmJXbG5mQm05d1owPT0ifQ=="
10.1.1.12 - - [2025-10-25T09:11:09Z] "GET /courses/intro HTTP/1.1" 200 2048 "-" "Mozilla/5.0"
192.168.5.5 - - [2025-10-25T09:12:30Z] "POST /login HTTP/1.1" 401 98 "https://lms.campus.edu" "Mozilla/5.0" "username=student&password=wrong"
172.16.0.2 - - [2025-10-25T09:13:05Z] "POST /upload HTTP/1.1" 200 8 "https://portal.campus.edu" "python-requests/2.25.1" "data=ZmxhZ3tzdG9sZW5fbm90ZXN9"
10.1.1.13 - - [2025-10-25T09:14:50Z] "GET /status HTTP/1.1" 200 64 "-" "health-check/1.0"
`;
    const expectedFlag = "flag{stolen_notes}";
    const hintText = "How are the attackers trying to move data off the network — look for repeated POST requests carrying encoded payloads (base64-like).";
    const hintPenaltySeconds = 120; // 2 minutes penalty

    return (
      <TerminalChallenge
        levelIndex={1}
        title="Server Lab"
        story={story}
        secretText={logText}
        expectedFlag={expectedFlag}
        durationSeconds={8 * 60}
        hintText={hintText}
        hintPenaltySeconds={hintPenaltySeconds}
        fileName="server_access_log.txt"
      />
    );
  }

  if (idx === 2) {
    // Level 3 — Cafeteria (image-based flag)
    const story = `Title: Coffee & Croissant

A framed photo of a steaming cup of coffee and a flaky croissant hangs on the cafeteria wall — a comforting sight students pass every morning. Recently the archives team flagged that the file used for the wall display looks subtly different from the original. You’re asked to take a closer look: download cafeteria_poster.png. Submit the flag before the timer runs out to help the cafeteria team restore trust in their materials.
`;
    // For image-based level we provide the public file URL in public/assets
    const imagePublicUrl = "./assets/cafeteria_poster.png";
    const expectedFlag = "flag{caf3t3r1a_s3cr3ts_4r3_tasty}";
    const durationSeconds = 7 * 60; // 7 minutes for this level

    return (
      <TerminalChallenge
        levelIndex={2}
        title="Cafeteria"
        story={story}
        expectedFlag={expectedFlag}
        durationSeconds={durationSeconds}
        fileUrl={imagePublicUrl}
        fileName="cafeteria_poster.png"
      />
    );
  }

  if (idx === 3) {
    // Level 4 — Web Inspect (uses the static portal you created in public/assets/web_explore/)
    const story = `Title: Whispers on the Campus Site

The campus website has been humming with small, unexplained updates — a page that used to be mundane now reads like a quiet riddle. The web team asked you to take a closer look.
`;
    // Use the static portal HTML as the downloadable / inspectable resource (but TerminalChallenge will show a portal link after START)
    const portalUrl = "./assets/web_explore/portal.html";
    const expectedFlag = "flag{web_exploitation_practice}";
    const durationSeconds = 8 * 60; // 8 minutes for this level
    const hintText = "have you heared about inspection?";
    const hintPenaltySeconds = 90; // 1m30s penalty for using the hint

    return (
      <TerminalChallenge
        levelIndex={3}
        title="Web Inspect"
        story={story}
        expectedFlag={expectedFlag}
        durationSeconds={durationSeconds}
        hintText={hintText}
        hintPenaltySeconds={hintPenaltySeconds}
        fileUrl={portalUrl}
        fileName="portal.html"
      />
    );
  }

  if (idx === 4) {
    // Level 5 — Admin Office (Forgotten Backups)
    const story = `Title: Forgotten Backups

You slip into the admin office after hours — keys jingling, fluorescent hum in the hall. The IT team asked you to hunt through an old archive: during a long-ago maintenance someone copied a few config files into a public folder and then forgot to remove them. If you can recover the forgotten admin token from those dusty backups and use it in the Admin Console, you can prove the leak and force a shutdown of the intruder’s systems.
`;
    const hintText = "Search the backup for anything that looks like an admin secret.";
    const hintPenaltySeconds = 90;
    const expectedFlag = "flag{admin_backup_leak}";
    const durationSeconds = 9 * 60;

    // Provide multiple files: the two downloadable backups and the admin console (portal-like link)
    const files = [
      { url: "./assets/admin/backup_config.txt", name: "backup_config.txt", isPortal: false, isImage: false },
      { url: "./assets/admin/admin_logs.txt", name: "admin_logs.txt", isPortal: false, isImage: false },
      { url: "./assets/admin/console.html", name: "Admin Console", isPortal: true, isImage: false },
    ];

    return (
      <TerminalChallenge
        levelIndex={4}
        title="Admin Office"
        story={story}
        expectedFlag={expectedFlag}
        durationSeconds={durationSeconds}
        hintText={hintText}
        hintPenaltySeconds={hintPenaltySeconds}
        files={files}
      />
    );
  }

  // Other levels: placeholder terminal
  const placeholderStory = `Level ${idx + 1} — Placeholder
This level is coming soon. Use the roadmap to navigate between levels.`;
  const placeholderSecret = `placeholder.txt - no file for this level yet.`;
  return (
    <TerminalChallenge
      levelIndex={idx}
      title={`Level ${idx + 1}`}
      story={placeholderStory}
      secretText={placeholderSecret}
      expectedFlag={`flag{placeholder_level_${idx + 1}}`}
      durationSeconds={5 * 60}
    />
  );
}