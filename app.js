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
// 🎡 SPIN FUNCTION (GLOBAL)
// ===============================
window.spin = async function () {
  const nameInput = document.getElementById("playerName");
  const resultBox = document.getElementById("result");

  if (!nameInput || !resultBox) {
    alert("Missing HTML elements");
    return;
  }

  const name = nameInput.value.trim();
  if (!name) {
    alert("Enter player name");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("Auth not ready, try again");
    return;
  }

  const ref = doc(db, "spins", user.uid);
  const snap = await getDoc(ref);

  // ❌ ALREADY SPUN
  if (snap.exists()) {
    resultBox.innerText =
      "❌ You already spun and got: " + snap.data().result;
    return;
  }

  // 🎉 NEW SPIN
  const win = getRandomReward();

  await setDoc(ref, {
    name: name,
    result: win,
    createdAt: serverTimestamp()
  });

  resultBox.innerText =
    "🎉 Congratulations! You got " + win;
};
