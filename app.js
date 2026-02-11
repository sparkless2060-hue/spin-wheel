// ===============================
// 🔥 FIREBASE IMPORTS
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ===============================
// 🔥 FIREBASE CONFIG
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyAF6BkClRrlmLhWdN7nz5BOD_Z3b-WH3SQ",
  authDomain: "god-b80cc.firebaseapp.com",
  projectId: "god-b80cc",
  storageBucket: "god-b80cc.firebasestorage.app",
  messagingSenderId: "368804947173",
  appId: "1:368804947173:web:97394d2883e6fd446ce00c"
};

// ===============================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

await signInAnonymously(auth);

// ===============================
// 🎁 REWARDS
// ===============================
const rewards = [
  { label: "20%", color: "#ff5252" },
  { label: "40%", color: "#42a5f5" },
  { label: "50%", color: "#66bb6a" },
  { label: "70%", color: "#ab47bc" }
];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const center = 160;
const radius = 160;
const slices = rewards.length;
const sliceAngle = (2 * Math.PI) / slices;

let rotation = 0;
let spinning = false;

// ===============================
// 🎡 DRAW WHEEL
// ===============================
function drawWheel() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < slices; i++) {

    const startAngle = rotation + i * sliceAngle;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = rewards[i].color;
    ctx.fill();

    // Text
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px Arial";
    ctx.fillText(rewards[i].label, radius - 20, 10);
    ctx.restore();
  }
}

drawWheel();

// ===============================
// 🎡 SPIN BUTTON
// ===============================
document.getElementById("spinBtn").addEventListener("click", spin);

async function spin() {

  if (spinning) return;
  spinning = true;

  const nameInput = document.getElementById("playerName");
  const resultBox = document.getElementById("result");
  const spinBtn = document.getElementById("spinBtn");

  const name = nameInput.value.trim();

  if (!name) {
    alert("Enter your name");
    spinning = false;
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("Auth not ready");
    spinning = false;
    return;
  }

  // 🔒 Local check
  if (localStorage.getItem("alreadySpun")) {
    alert("⚠️ You already spun!");
    resultBox.innerText =
      "⚠️ You already spun and got: " +
      localStorage.getItem("spinResult");
    spinning = false;
    return;
  }

  const ref = doc(db, "spins", user.uid);
  const snap = await getDoc(ref);

  // 🔒 Firebase check
  if (snap.exists()) {
    const previous = snap.data().result;

    alert("⚠️ You already spun!");

    resultBox.innerText =
      "⚠️ You already spun and got: " + previous;

    localStorage.setItem("alreadySpun", "true");
    localStorage.setItem("spinResult", previous);

    spinning = false;
    return;
  }

  spinBtn.disabled = true;

  // 🎉 Pick random slice
  const randomIndex = Math.floor(Math.random() * slices);

  const spinRounds = 6;
  const targetAngle =
    (spinRounds * 2 * Math.PI) +
    (Math.PI * 2 - randomIndex * sliceAngle);

  const start = performance.now();
  const duration = 4000;

  function animate(time) {

    const progress = Math.min((time - start) / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);

    rotation = targetAngle * easeOut;

    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {

      const win = rewards[randomIndex].label;

      resultBox.innerText =
        "🎉 Congratulations! You got " + win;

      setDoc(ref, {
        name: name,
        result: win,
        createdAt: serverTimestamp()
      });

      localStorage.setItem("alreadySpun", "true");
      localStorage.setItem("spinResult", win);

      spinning = false;
    }
  }

  requestAnimationFrame(animate);
}
