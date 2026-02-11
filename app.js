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
// 🔥 INIT FIREBASE
// ===============================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Anonymous Login
await signInAnonymously(auth);

// ===============================
// 🎁 WEIGHTED REWARDS
// ===============================
const rewards = [
  { label: "20%", weight: 10, color: "#ff5252" },
  { label: "40%", weight: 30, color: "#42a5f5" },
  { label: "50%", weight: 40, color: "#66bb6a" },
  { label: "70%", weight: 20, color: "#ab47bc" }
];

function getRandomReward() {
  const total = rewards.reduce((sum, r) => sum + r.weight, 0);
  let rand = Math.random() * total;

  for (const r of rewards) {
    if (rand < r.weight) return r;
    rand -= r.weight;
  }
}

// ===============================
// 🎡 WHEEL DRAW
// ===============================
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const slices = rewards.length;
const sliceAngle = (2 * Math.PI) / slices;

let rotation = 0;
let spinning = false;

function drawWheel() {
  for (let i = 0; i < slices; i++) {
    const angle = rotation + i * sliceAngle;

    ctx.beginPath();
    ctx.moveTo(160, 160);
    ctx.arc(160, 160, 160, angle, angle + sliceAngle);
    ctx.fillStyle = rewards[i].color;
    ctx.fill();

    ctx.save();
    ctx.translate(160,160);
    ctx.rotate(angle + sliceAngle/2);
    ctx.textAlign="right";
    ctx.fillStyle="#fff";
    ctx.font="bold 20px Arial";
    ctx.fillText(rewards[i].label,140,10);
    ctx.restore();
  }
}

drawWheel();

// ===============================
// 🎡 SPIN LOGIC
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
    alert("Authentication not ready");
    spinning = false;
    return;
  }

  // 🔒 LOCAL CHECK
  if (localStorage.getItem("alreadySpun")) {

    alert("⚠️ You already spun and cannot spin again!");

    resultBox.innerText =
      "⚠️ You already spun and got: " +
      localStorage.getItem("spinResult");

    spinning = false;
    return;
  }

  const ref = doc(db, "spins", user.uid);
  const snap = await getDoc(ref);

  // 🔒 FIREBASE CHECK
  if (snap.exists()) {

    const previous = snap.data().result;

    alert("⚠️ You already spun and cannot spin again!");

    resultBox.innerText =
      "⚠️ You already spun and got: " + previous;

    localStorage.setItem("alreadySpun", "true");
    localStorage.setItem("spinResult", previous);

    spinning = false;
    return;
  }

  spinBtn.disabled = true;

  // 🎉 PICK WINNER
  const selectedReward = getRandomReward();

  const targetIndex = rewards.findIndex(r => r.label === selectedReward.label);

  const spinAngle = (5 * 2 * Math.PI) + 
    ((slices - targetIndex) * sliceAngle);

  const start = performance.now();
  const duration = 4000;

  function animate(time) {
    const progress = Math.min((time - start) / duration, 1);
    rotation = spinAngle * progress;

    ctx.clearRect(0, 0, 320, 320);
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {

      resultBox.innerText =
        "🎉 Congratulations! You got " + selectedReward.label;

      setDoc(ref, {
        name: name,
        result: selectedReward.label,
        createdAt: serverTimestamp()
      });

      localStorage.setItem("alreadySpun", "true");
      localStorage.setItem("spinResult", selectedReward.label);

      spinning = false;
    }
  }

  requestAnimationFrame(animate);
}
