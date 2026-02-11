import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {
  apiKey: "AIzaSyAF6BkClRrlmLhWdN7nz5BOD_Z3b-WH3SQ",
  authDomain: "god-b80cc.firebaseapp.com",
  projectId: "god-b80cc",
  storageBucket: "god-b80cc.firebasestorage.app",
  messagingSenderId: "368804947173",
  appId: "1:368804947173:web:97394d2883e6fd446ce00c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

await signInAnonymously(auth);

/* ================= CANVAS SETUP ================= */

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const playerNameInput = document.getElementById("playerName");
const modal = document.getElementById("popupModal");
const modalText = document.getElementById("modalText");
const spinSound = document.getElementById("spinSound");

let rotation = 0;
let isSpinning = false;

/* 8 SEGMENTS (each twice) */
const segments = [
  "20%", "40%", "50%", "70%",
  "20%", "40%", "50%", "70%"
];

const colors = [
  "#ff4d4d", "#4da6ff", "#66cc66", "#b366ff",
  "#ff4d4d", "#4da6ff", "#66cc66", "#b366ff"
];

const totalSegments = segments.length;
const segmentAngle = (2 * Math.PI) / totalSegments;

/* DRAW WHEEL */
function drawWheel() {
  for (let i = 0; i < totalSegments; i++) {
    const angle = i * segmentAngle;

    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.arc(150, 150, 150, angle, angle + segmentAngle);
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.closePath();

    ctx.save();
    ctx.translate(150, 150);
    ctx.rotate(angle + segmentAngle / 2);
    ctx.fillStyle = "white";
    ctx.font = "bold 18px Cinzel";
    ctx.textAlign = "right";
    ctx.fillText(segments[i], 130, 10);
    ctx.restore();
  }
}

drawWheel();

/* ================= SPIN ================= */

spinBtn.addEventListener("click", async () => {

  const playerName = playerNameInput.value.trim();

  if (!playerName) {
    showModal("⚠️ Please enter your name first!");
    return;
  }

  if (isSpinning) return;

  const user = auth.currentUser;
  if (!user) {
    showModal("Authentication not ready. Try again.");
    return;
  }

  const ref = doc(db, "spins", user.uid);
  const snap = await getDoc(ref);

  // if (snap.exists()) {
  //  showModal("⚠️ You already spun and got: " + snap.data().result);
  //  return;
  // }

  isSpinning = true;
  spinSound.play();

  const winningIndex = Math.floor(Math.random() * totalSegments);
  const winningText = segments[winningIndex];

  const extraSpins = 6;
  const targetAngle =
    (2 * Math.PI * extraSpins) +
    (2 * Math.PI - (winningIndex * segmentAngle) - segmentAngle / 2);

  const start = performance.now();
  const duration = 4000;

  function animate(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);

    rotation = targetAngle * easeOut;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(150, 150);
    ctx.rotate(rotation);
    ctx.translate(-150, -150);
    drawWheel();
    ctx.restore();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;

      showModal(`🎉 ${playerName}, you won ${winningText} bonus!`);
      launchConfetti();

      setDoc(ref, {
        name: playerName,
        result: winningText,
        createdAt: serverTimestamp()
      });
    }
  }

  requestAnimationFrame(animate);
});

/* ================= MODAL ================= */

function showModal(message) {
  modalText.innerText = message;
  modal.style.display = "flex";
}

window.closeModal = function () {
  modal.style.display = "none";
}

/* ================= CONFETTI ================= */

function launchConfetti() {
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 }
  });
}
