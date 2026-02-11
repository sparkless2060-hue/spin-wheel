// ===============================
// 🔥 FIREBASE IMPORTS (v9)
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

// ===============================
// 🔐 ANONYMOUS LOGIN
// ===============================
await signInAnonymously(auth);

// ===============================
// 🎁 REWARDS (WEIGHTED)
// ===============================
const rewards = [
  { label: "20%", weight: 10 },
  { label: "40%", weight: 30 },
  { label: "50%", weight: 40 },
  { label: "70%", weight: 20 }
];

function getRandomReward() {
  const total = rewards.reduce((sum, r) => sum + r.weight, 0);
  let rand = Math.random() * total;

  for (const r of rewards) {
    if (rand < r.weight) return r.label;
    rand -= r.weight;
  }
}

// ===============================
// 🎡 SPIN SYSTEM
// ===============================
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

  const ref = doc(db, "spins", user.uid);
  const snap = await getDoc(ref);

  // 🔒 DEVICE CHECK
  if (localStorage.getItem("alreadySpun")) {
    alert("⚠️ You already spun and cannot spin again.");
    resultBox.innerText =
      "⚠️ You already spun and got: " +
      localStorage.getItem("spinResult");
    spinning = false;
    return;
  }

  // 🔒 FIREBASE CHECK
  if (snap.exists()) {
    const previous = snap.data().result;

    alert("⚠️ You already spun and cannot spin again.");

    resultBox.innerText =
      "⚠️ You already spun and got: " + previous;

    localStorage.setItem("alreadySpun", "true");
    localStorage.setItem("spinResult", previous);

    spinning = false;
    return;
  }

  // Disable button only when spin is valid
  spinBtn.disabled = true;

  // 🎉 SPIN ANIMATION
  const spinAngle = Math.random() * 2000 + 2000;
  const start = performance.now();
  const duration = 4000;

  function animate(time) {
    const progress = Math.min((time - start) / duration, 1);
    rotation = spinAngle * (1 - Math.pow(1 - progress, 3));
    ctx.clearRect(0, 0, 320, 320);
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {

      const index =
        Math.floor(
          ((2 * Math.PI - (rotation % (2 * Math.PI))) / sliceAngle)
        ) % slices;

      const win = rewards[index];

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

