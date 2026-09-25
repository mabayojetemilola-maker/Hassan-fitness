import React, { useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase.js";

const bodyAreas = [
  { id: "full-body", name: "Full Body", icon: "🏋️", desc: "Complete body workout" },
  { id: "abs", name: "Abs & Core", icon: "🔥", desc: "Build a stronger core" },
  { id: "chest", name: "Chest", icon: "🟥", desc: "Chest strength & muscle" },
  { id: "arms", name: "Arms", icon: "💪", desc: "Biceps & triceps" },
  { id: "legs", name: "Legs", icon: "🦵", desc: "Powerful lower body" },
  { id: "back", name: "Back", icon: "🔙", desc: "Build your back" },
  { id: "shoulders", name: "Shoulders", icon: "🏋️‍♂️", desc: "Strong shoulders" },
  { id: "glutes", name: "Glutes", icon: "🍑", desc: "Glutes & hips" },
];

const workouts = {
  "full-body": {
    title: "Full Body",
    subtitle: "Beginner • Home • No Equipment",
    exercises: [
      ["Jumping Jacks", "30 sec", "3 rounds"],
      ["Bodyweight Squats", "15 reps", "3 rounds"],
      ["Push-ups", "10 reps", "3 rounds"],
      ["Mountain Climbers", "30 sec", "3 rounds"],
      ["Reverse Lunges", "10 each leg", "3 rounds"],
      ["Plank", "30 sec", "3 rounds"],
      ["Burpees", "8 reps", "3 rounds"],
    ],
  },
  abs: {
    title: "Abs & Core",
    subtitle: "Core • Beginner • Home",
    exercises: [
      ["Crunches", "15 reps", "3 rounds"],
      ["Leg Raises", "10 reps", "3 rounds"],
      ["Bicycle Crunches", "20 reps", "3 rounds"],
      ["Mountain Climbers", "30 sec", "3 rounds"],
      ["Russian Twists", "20 reps", "3 rounds"],
      ["Plank", "30 sec", "3 rounds"],
    ],
  },
  chest: {
    title: "Chest",
    subtitle: "Chest • Beginner • No Equipment",
    exercises: [
      ["Push-ups", "10 reps", "3 rounds"],
      ["Wide Push-ups", "10 reps", "3 rounds"],
      ["Incline Push-ups", "12 reps", "3 rounds"],
      ["Diamond Push-ups", "8 reps", "3 rounds"],
      ["Slow Push-ups", "8 reps", "3 rounds"],
    ],
  },
  arms: {
    title: "Arms",
    subtitle: "Biceps & Triceps • Home",
    exercises: [
      ["Diamond Push-ups", "8 reps", "3 rounds"],
      ["Tricep Dips", "12 reps", "3 rounds"],
      ["Backpack Bicep Curls", "12 reps", "3 rounds"],
      ["Hammer Curls", "12 reps", "3 rounds"],
      ["Close-Grip Push-ups", "10 reps", "3 rounds"],
    ],
  },
  legs: {
    title: "Legs",
    subtitle: "Lower Body • Beginner",
    exercises: [
      ["Bodyweight Squats", "15 reps", "3 rounds"],
      ["Reverse Lunges", "10 each leg", "3 rounds"],
      ["Bulgarian Split Squats", "8 each leg", "3 rounds"],
      ["Calf Raises", "20 reps", "3 rounds"],
      ["Jump Squats", "10 reps", "3 rounds"],
      ["Wall Sit", "30 sec", "3 rounds"],
    ],
  },
  back: {
    title: "Back",
    subtitle: "Back • Home • Beginner",
    exercises: [
      ["Superman", "12 reps", "3 rounds"],
      ["Reverse Snow Angels", "12 reps", "3 rounds"],
      ["Backpack Rows", "12 reps", "3 rounds"],
      ["Bird Dog", "10 each side", "3 rounds"],
      ["Prone Y Raises", "10 reps", "3 rounds"],
    ],
  },
  shoulders: {
    title: "Shoulders",
    subtitle: "Shoulders • Home",
    exercises: [
      ["Pike Push-ups", "8 reps", "3 rounds"],
      ["Shoulder Taps", "20 reps", "3 rounds"],
      ["Lateral Raises", "12 reps", "3 rounds"],
      ["Front Raises", "12 reps", "3 rounds"],
      ["Overhead Press", "12 reps", "3 rounds"],
    ],
  },
  glutes: {
    title: "Glutes",
    subtitle: "Glutes & Hips • Home",
    exercises: [
      ["Glute Bridges", "15 reps", "3 rounds"],
      ["Hip Thrusts", "12 reps", "3 rounds"],
      ["Donkey Kicks", "12 each leg", "3 rounds"],
      ["Fire Hydrants", "12 each side", "3 rounds"],
      ["Bulgarian Split Squats", "8 each leg", "3 rounds"],
    ],
  },
};

const plan = [
  ["Day 1", "Full Body", "full-body"],
  ["Day 2", "Abs & Core", "abs"],
  ["Day 3", "Chest", "chest"],
  ["Day 4", "Rest", null],
  ["Day 5", "Legs", "legs"],
  ["Day 6", "Arms", "arms"],
  ["Day 7", "Rest", null],
  ["Day 8", "Back", "back"],
  ["Day 9", "Glutes", "glutes"],
  ["Day 10", "Full Body", "full-body"],
  ["Day 11", "Rest", null],
  ["Day 12", "Abs & Core", "abs"],
  ["Day 13", "Chest", "chest"],
  ["Day 14", "Rest", null],
  ["Day 15", "Legs", "legs"],
  ["Day 16", "Arms", "arms"],
  ["Day 17", "Back", "back"],
  ["Day 18", "Rest", null],
  ["Day 19", "Glutes", "glutes"],
  ["Day 20", "Full Body", "full-body"],
  ["Day 21", "Rest", null],
  ["Day 22", "Abs & Core", "abs"],
  ["Day 23", "Chest", "chest"],
  ["Day 24", "Legs", "legs"],
  ["Day 25", "Rest", null],
  ["Day 26", "Arms", "arms"],
  ["Day 27", "Full Body", "full-body"],
  ["Day 28", "Final Full Body Challenge", "full-body"],
];

const QUICK_AI_PROMPTS = [
  "Give me a 20-minute home workout with no equipment.",
  "What should I eat before and after a workout?",
  "How can I build muscle at home?",
  "How can I lose belly fat safely?",
];

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,24}$/;

function getTimerSeconds(target) {
  const match = String(target || "").match(/(\d+)\s*(?:sec|seconds)/i);
  return match ? Number(match[1]) : 30;
}

function formatTime(totalSeconds) {
  const safe = Math.max(0, Number(totalSeconds) || 0);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

/** Offline-friendly AI answers when /api/fitness-ai is not deployed */
function localFitnessAnswer(message) {
  const q = message.toLowerCase();
  if (q.includes("20-minute") || q.includes("20 minute") || q.includes("home workout")) {
    return "Here's a solid 20-minute no-equipment circuit (do 3 rounds):\n\n1. Jumping Jacks — 40 sec\n2. Squats — 15 reps\n3. Push-ups — 10 reps\n4. Mountain Climbers — 30 sec\n5. Reverse Lunges — 10 each leg\n6. Plank — 30 sec\n\nRest 45–60 sec between rounds. Focus on form, not speed.";
  }
  if (q.includes("eat") || q.includes("food") || q.includes("nutrition") || q.includes("before") || q.includes("after")) {
    return "Before training (30–90 min): a light carb + some protein (banana + yogurt, or oats). Stay hydrated.\n\nAfter training (within 1–2 hours): protein + carbs to recover (eggs/chicken/fish + rice, or a shake + fruit).\n\nSkip heavy, greasy meals right before you train.";
  }
  if (q.includes("muscle") || q.includes("build")) {
    return "To build muscle at home:\n• Progressive overload — more reps, slower tempo, or harder variations over time\n• Hit each muscle group 2–3× per week\n• Eat enough protein (roughly 1.6–2.2 g per kg bodyweight)\n• Sleep 7–9 hours\n• Use the Full Body, Arms, Chest, and Legs plans in this app and track every session.";
  }
  if (q.includes("belly") || q.includes("fat") || q.includes("lose")) {
    return "Safe fat loss:\n• Slight calorie deficit (not crash diets)\n• Strength train 3–5 days/week (preserves muscle)\n• Walk daily\n• Prioritize protein and sleep\n• Spot reduction doesn't work — overall fat loss + core work improves how your midsection looks.\n\nStay consistent for 8–12 weeks before judging results.";
  }
  if (q.includes("stretch") || q.includes("recover") || q.includes("sore")) {
    return "Recovery tips:\n• Light mobility / stretch after hard sessions\n• Sleep is your #1 recovery tool\n• Drink water and get protein\n• Rest days are part of the plan — use Days 4, 7, 11, etc. in the 28-day plan\n• If pain (not normal soreness) appears, stop and rest that area.";
  }
  return "I'm your Hassan Fitness AI Coach. Ask about workouts, form, nutrition, fat loss, muscle building, recovery, or how to use the 28-day plan. Try one of the quick prompts above, or type your own question.";
}

function BodyGrid({ onOpen }) {
  return (
    <div className="body-grid">
      {bodyAreas.map((area, i) => (
        <button
          key={area.id}
          type="button"
          className={`body-card btn-3d ${i === 0 ? "featured" : ""}`}
          onClick={() => onOpen(area.id)}
        >
          <div className="body-art">{area.icon}</div>
          <div className="body-card-text">
            <strong>{area.name}</strong>
            <span>{area.desc}</span>
          </div>
          <span className="arrow">→</span>
        </button>
      ))}
    </div>
  );
}

function PlanPreview({ onStart }) {
  const weeks = [0, 1, 2, 3].map((w) => plan.slice(w * 7, w * 7 + 7));

  return (
    <section className="plan-preview">
      <div className="section-heading">
        <div>
          <p className="eyebrow">28-DAY PLAN</p>
          <h2>Follow the schedule</h2>
        </div>
      </div>
      {weeks.map((days, wi) => (
        <div className="week-card" key={wi}>
          <div className="week-title">
            <strong>Week {wi + 1}</strong>
            <span>DAYS {wi * 7 + 1}–{wi * 7 + 7}</span>
          </div>
          <div className="week-days">
            {days.map(([label, name, id]) => (
              <button
                key={label}
                type="button"
                className="btn-3d-sm"
                disabled={!id}
                onClick={() => id && onStart(id)}
              >
                <b>{label.replace("Day ", "D")}</b>
                <span>{name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [page, setPage] = useState("home");
  const [selectedArea, setSelectedArea] = useState(null);
  const [session, setSession] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [completedWorkouts, setCompletedWorkouts] = useState([]);

  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(30);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);
  const [customTimer, setCustomTimer] = useState(30);

  const [aiMessages, setAiMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your Hassan Fitness AI Coach. Ask me about workouts, exercises, nutrition, recovery, fat loss, muscle building, stretching, or fitness planning.",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const totalExercises = useMemo(
    () =>
      Object.values(workouts).reduce(
        (n, w) => n + w.exercises.length,
        0
      ),
    []
  );

  const streak = useMemo(() => {
    if (!completedWorkouts.length) return 0;
    const days = new Set(
      completedWorkouts.map((w) => new Date(w.date).toDateString())
    );
    return Math.min(days.size, 28);
  }, [completedWorkouts]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          if (snap.exists()) {
            const data = snap.data();
            setProfile(data);
            if (Array.isArray(data.completedWorkouts)) {
              setCompletedWorkouts(data.completedWorkouts);
            }
          } else {
            setProfile(null);
          }
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  function resetTimer(seconds = 30) {
    const safe = Math.max(5, Math.round(seconds));
    setCustomTimer(safe);
    setTimerSeconds(safe);
    setTimerTotalSeconds(safe);
    setTimerRunning(false);
    setTimerFinished(false);
  }

  useEffect(() => {
    if (!timerRunning) return;

    const interval = window.setInterval(() => {
      setTimerSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setTimerRunning(false);
          setTimerFinished(true);
          try {
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate([250, 120, 250]);
            }
          } catch {
            /* ignore */
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (!session) return;
    const exercise = workouts[session.id]?.exercises[session.index];
    if (!exercise) return;
    const seconds = getTimerSeconds(exercise[1]);
    resetTimer(seconds);
    setTimerRunning(true);
  }, [session]);

  async function handleAuth(e) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      if (authMode === "login") {
        const result = await signInWithEmailAndPassword(auth, email.trim(), password);
        setUser(result.user);
        setPage("home");
      } else {
        const cleanUsername = username.trim();
        const cleanPhone = phone.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!USERNAME_REGEX.test(cleanUsername)) {
          throw new Error(
            "Username must be 3–24 characters: letters, numbers, and underscore only."
          );
        }
        if (!cleanPhone || cleanPhone.length < 7) {
          throw new Error("Please enter a valid phone number.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        const usernameKey = normalizeUsername(cleanUsername);
        const usernameRef = doc(db, "usernames", usernameKey);
        const existing = await getDoc(usernameRef);
        if (existing.exists()) {
          throw new Error("That username is already taken. Choose another one.");
        }

        const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const uid = result.user.uid;

        // Claim username first so no one else can take it
        await setDoc(usernameRef, {
          uid,
          username: cleanUsername,
          createdAt: serverTimestamp(),
        });

        await setDoc(doc(db, "users", uid), {
          username: cleanUsername,
          usernameLower: usernameKey,
          email: cleanEmail,
          phone: cleanPhone,
          completedWorkouts: [],
          createdAt: serverTimestamp(),
        });

        setProfile({
          username: cleanUsername,
          email: cleanEmail,
          phone: cleanPhone,
        });
        setUser(result.user);
        setPage("home");
        setUsername("");
        setPhone("");
        setPassword("");
      }
    } catch (err) {
      const msg = (err.message || "").replace("Firebase: ", "").replace(/\(auth\/.*\)\.?/, "").trim();
      setAuthError(msg || "Something went wrong. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setPage("home");
    setSession(null);
    setTimerRunning(false);
  }

  function openWorkout(id) {
    setSelectedArea(id);
    setPage("workout");
  }

  function startWorkout(id) {
    setSession({ id, index: 0 });
    setCompleted([]);
    setSelectedArea(id);
    setPage("session");
  }

  async function completeExercise() {
    if (!session) return;

    const workout = workouts[session.id];
    const next = [...completed, session.index];

    if (session.index >= workout.exercises.length - 1) {
      const entry = { id: session.id, date: new Date().toISOString() };
      const updated = [...completedWorkouts, entry];
      setCompletedWorkouts(updated);
      setCompleted(next);
      setSession(null);
      setPage("progress");
      resetTimer(30);

      if (user) {
        try {
          await setDoc(
            doc(db, "users", user.uid),
            { completedWorkouts: updated },
            { merge: true }
          );
        } catch {
          /* offline / rules — local state still updated */
        }
      }
      return;
    }

    setCompleted(next);
    setSession({ ...session, index: session.index + 1 });
  }

  function applyPreset(seconds) {
    setCustomTimer(seconds);
    setTimerSeconds(seconds);
    setTimerTotalSeconds(seconds);
    setTimerFinished(false);
    setTimerRunning(false);
  }

  function toggleTimer() {
    if (timerSeconds <= 0) {
      setTimerSeconds(customTimer);
      setTimerTotalSeconds(customTimer);
      setTimerFinished(false);
    }
    setTimerRunning((running) => !running);
  }

  function resetCurrentTimer() {
    resetTimer(customTimer);
  }

  async function sendAiMessage(text = aiInput) {
    const message = String(text || "").trim();
    if (!message || aiLoading) return;

    const nextMessages = [...aiMessages, { role: "user", content: message }];
    setAiMessages(nextMessages);
    setAiInput("");
    setAiError("");
    setAiLoading(true);

    try {
      const response = await fetch("/api/fitness-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.slice(-12),
          userEmail: user?.email || "",
          username: profile?.username || "",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiMessages((old) => [
          ...old,
          {
            role: "assistant",
            content: data.answer || localFitnessAnswer(message),
          },
        ]);
      } else {
        // API not configured — use built-in coach answers
        setAiMessages((old) => [
          ...old,
          { role: "assistant", content: localFitnessAnswer(message) },
        ]);
      }
    } catch {
      setAiMessages((old) => [
        ...old,
        { role: "assistant", content: localFitnessAnswer(message) },
      ]);
    } finally {
      setAiLoading(false);
    }
  }

  if (!authReady) {
    return (
      <div className="app-shell auth-shell">
        <div className="bg-overlay" />
        <div className="auth-card">
          <div className="logo-mark">HF</div>
          <p className="muted">Loading Hassan Fitness…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-shell auth-shell">
        <div className="bg-overlay" />
        <div className="auth-card">
          <div className="logo-mark">HF</div>
          <p className="eyebrow">HASSAN FITNESS HUB</p>
          <h1>
            Build your body.
            <br />
            Build your discipline.
          </h1>
          <p className="muted">
            Free workouts, real timers, AI coach & progress tracking.
          </p>

          <form onSubmit={handleAuth}>
            {authMode === "signup" && (
              <>
                <input
                  type="text"
                  placeholder="Username (unique)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  minLength={3}
                  maxLength={24}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  required
                />
              </>
            )}
            <input
              type="email"
              placeholder="Gmail / Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={authMode === "login" ? "current-password" : "new-password"}
              minLength={6}
              required
            />
            {authError && <div className="error-box">{authError}</div>}
            <button className="primary-btn btn-3d" type="submit" disabled={authLoading}>
              {authLoading
                ? "PLEASE WAIT…"
                : authMode === "login"
                  ? "LOGIN"
                  : "CREATE ACCOUNT"}
            </button>
          </form>

          <button
            type="button"
            className="text-btn"
            onClick={() => {
              setAuthMode(authMode === "login" ? "signup" : "login");
              setAuthError("");
            }}
          >
            {authMode === "login"
              ? "New here? Create an account"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    );
  }

  const selectedWorkout = selectedArea ? workouts[selectedArea] : null;
  const currentExercise = session
    ? workouts[session.id]?.exercises[session.index]
    : null;

  const displayName = profile?.username || user.email?.split("@")[0] || "Athlete";

  return (
    <div className="app-shell">
      <div className="bg-overlay" />

      <header className="topbar">
        <div>
          <div className="brand">
            HASSAN <span>FITNESS</span>
          </div>
          <div className="tiny">YOUR BODY. YOUR DISCIPLINE.</div>
        </div>
        <button type="button" className="logout-btn btn-3d-sm" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="content">
        {page === "home" && (
          <>
            <section className="hero-card">
              <div>
                <p className="eyebrow">WELCOME BACK, {displayName.toUpperCase()}</p>
                <h1>
                  Train smarter.
                  <br />
                  <span>Get stronger.</span>
                </h1>
                <p>
                  Choose a focus area, start a timed workout, or ask the AI coach.
                </p>
                <div className="hero-actions">
                  <button
                    type="button"
                    className="primary-btn btn-3d"
                    onClick={() => setPage("workouts")}
                  >
                    EXPLORE WORKOUTS →
                  </button>
                  <button
                    type="button"
                    className="secondary-btn btn-3d"
                    onClick={() => setPage("ai")}
                  >
                    🤖 ASK AI COACH
                  </button>
                </div>
              </div>
              <div className="hero-badge">
                🔥
                <br />
                <strong>FREE</strong>
              </div>
            </section>

            <section className="stats-row">
              <div className="stat-chip btn-3d-flat">
                <strong>{completedWorkouts.length}</strong>
                <span>Workouts</span>
              </div>
              <div className="stat-chip btn-3d-flat">
                <strong>{completed.length || completedWorkouts.reduce((s, w) => s + (workouts[w.id]?.exercises.length || 0), 0)}</strong>
                <span>Exercises</span>
              </div>
              <div className="stat-chip btn-3d-flat">
                <strong>{streak}</strong>
                <span>Streak</span>
              </div>
            </section>

            <section className="section-heading">
              <div>
                <p className="eyebrow">START HERE</p>
                <h2>Choose your focus area</h2>
              </div>
            </section>

            <BodyGrid onOpen={openWorkout} />

            <section className="ai-preview">
              <div>
                <p className="eyebrow">AI FITNESS COACH</p>
                <h2>Have a fitness question?</h2>
                <p className="muted">
                  Ask your AI coach about training, food, recovery and more.
                </p>
              </div>
              <button
                type="button"
                className="secondary-btn btn-3d"
                onClick={() => setPage("ai")}
              >
                OPEN AI COACH →
              </button>
            </section>
          </>
        )}

        {page === "workouts" && (
          <>
            <section className="page-title">
              <p className="eyebrow">WORKOUT LIBRARY</p>
              <h1>Hit your focus areas</h1>
              <p>Choose a muscle group and get a ready-made workout with a real timer.</p>
            </section>
            <BodyGrid onOpen={openWorkout} />
            <PlanPreview onStart={startWorkout} />
          </>
        )}

        {page === "workout" && selectedWorkout && (
          <>
            <button
              type="button"
              className="back-btn"
              onClick={() => setPage("workouts")}
            >
              ← Back
            </button>

            <section className="workout-head">
              <p className="eyebrow">WORKOUT PLAN</p>
              <h1>{selectedWorkout.title}</h1>
              <p>{selectedWorkout.subtitle}</p>
              <button
                type="button"
                className="primary-btn btn-3d"
                onClick={() => startWorkout(selectedArea)}
              >
                ▶ START WORKOUT TIMER
              </button>
            </section>

            <div className="exercise-list">
              {selectedWorkout.exercises.map((exercise, index) => (
                <div className="exercise-item" key={`${exercise[0]}-${index}`}>
                  <div className="exercise-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="exercise-info">
                    <strong>{exercise[0]}</strong>
                    <span>
                      {exercise[1]} • {exercise[2]}
                    </span>
                  </div>
                  <span className="exercise-check">○</span>
                </div>
              ))}
            </div>

            <section className="pdf-box">
              <div className="pdf-icon">📄</div>
              <div>
                <p className="eyebrow">WORKOUT GUIDE</p>
                <h3>Timer-guided session</h3>
                <p>
                  Start the workout to get a real countdown for timed moves.
                  Rep-based moves use a 30s work window by default — adjust with presets.
                </p>
              </div>
            </section>
          </>
        )}

        {page === "session" && session && currentExercise && (
          <section className="session-card">
            <button
              type="button"
              className="back-btn"
              onClick={() => {
                setTimerRunning(false);
                setSession(null);
                setPage("workout");
              }}
            >
              ← Exit workout
            </button>

            <p className="eyebrow">
              EXERCISE {session.index + 1} OF{" "}
              {workouts[session.id].exercises.length}
            </p>

            <div
              className={`timer-ring ${timerRunning ? "running" : ""} ${timerFinished ? "finished" : ""}`}
              style={{
                "--progress": Math.max(
                  0,
                  Math.min(1, timerSeconds / Math.max(1, timerTotalSeconds))
                ),
              }}
            >
              <div className="timer-inner">
                <strong>{formatTime(timerSeconds)}</strong>
                <span>
                  {timerFinished
                    ? "TIME'S UP"
                    : timerRunning
                      ? "WORK"
                      : "PAUSED"}
                </span>
              </div>
            </div>

            <h1>{currentExercise[0]}</h1>

            <div className="session-target">Target: {currentExercise[1]}</div>

            <p className="muted">
              Real countdown timer. For rep-based exercises the default work
              window is 30 seconds — use presets to change it.
            </p>

            <div className="timer-controls">
              <button
                type="button"
                className="secondary-btn btn-3d"
                onClick={toggleTimer}
              >
                {timerRunning
                  ? "⏸ PAUSE"
                  : timerSeconds <= 0
                    ? "▶ START"
                    : "▶ RESUME"}
              </button>
              <button
                type="button"
                className="ghost-btn btn-3d-sm"
                onClick={resetCurrentTimer}
              >
                ↻ RESET
              </button>
            </div>

            <div className="preset-row">
              <span>Quick timer:</span>
              {[30, 45, 60, 90].map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  className={`preset-btn btn-3d-sm ${customTimer === seconds ? "selected" : ""}`}
                  onClick={() => applyPreset(seconds)}
                >
                  {seconds}s
                </button>
              ))}
            </div>

            <button
              type="button"
              className="primary-btn large-btn btn-3d"
              onClick={completeExercise}
            >
              {session.index === workouts[session.id].exercises.length - 1
                ? "✓ COMPLETE WORKOUT"
                : "✓ COMPLETE & NEXT"}
            </button>
          </section>
        )}

        {page === "ai" && (
          <section className="ai-page">
            <div className="page-title">
              <p className="eyebrow">HASSAN FITNESS AI</p>
              <h1>AI Fitness Coach</h1>
              <p>
                Ask about workouts, exercises, nutrition, recovery and fitness
                planning.
              </p>
            </div>

            <div className="quick-prompts">
              {QUICK_AI_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="quick-prompt-btn btn-3d-sm"
                  onClick={() => sendAiMessage(prompt)}
                  disabled={aiLoading}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="ai-chat">
              {aiMessages.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={`ai-bubble ${msg.role === "user" ? "user" : "assistant"}`}
                >
                  {msg.content.split("\n").map((line, li) => (
                    <p key={li}>{line || "\u00A0"}</p>
                  ))}
                </div>
              ))}
              {aiLoading && (
                <div className="ai-bubble assistant">
                  <p className="muted">Coach is thinking…</p>
                </div>
              )}
              {aiError && <div className="error-box">{aiError}</div>}
            </div>

            <form
              className="ai-input-row"
              onSubmit={(e) => {
                e.preventDefault();
                sendAiMessage();
              }}
            >
              <input
                type="text"
                placeholder="Ask a fitness question…"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                disabled={aiLoading}
              />
              <button
                type="submit"
                className="primary-btn btn-3d"
                disabled={aiLoading || !aiInput.trim()}
              >
                Send
              </button>
            </form>
          </section>
        )}

        {page === "progress" && (
          <>
            <section className="page-title">
              <p className="eyebrow">YOUR PROGRESS</p>
              <h1>Keep showing up</h1>
              <p>Completed workouts and consistency unlock real results.</p>
            </section>

            <section className="progress-grid">
              <div className="progress-card btn-3d-flat">
                <strong>{completedWorkouts.length}</strong>
                <span>Workouts done</span>
              </div>
              <div className="progress-card btn-3d-flat">
                <strong>{streak}</strong>
                <span>Active days</span>
              </div>
              <div className="progress-card btn-3d-flat">
                <strong>{totalExercises}</strong>
                <span>Exercises in library</span>
              </div>
              <div className="progress-card btn-3d-flat">
                <strong>28</strong>
                <span>Day plan length</span>
              </div>
            </section>

            <section className="plan-box">
              <h2>Recent sessions</h2>
              <p>Your completed workouts appear here.</p>
              {completedWorkouts.length === 0 ? (
                <p className="muted">No workouts completed yet. Start one from the library.</p>
              ) : (
                [...completedWorkouts]
                  .slice()
                  .reverse()
                  .slice(0, 12)
                  .map((w, i) => (
                    <div className="plan-row" key={`${w.id}-${w.date}-${i}`}>
                      <strong>
                        {workouts[w.id]?.title || w.id}
                      </strong>
                      <span>
                        {new Date(w.date).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  ))
              )}
            </section>

            <button
              type="button"
              className="primary-btn btn-3d"
              style={{ marginTop: 16 }}
              onClick={() => setPage("workouts")}
            >
              START ANOTHER WORKOUT
            </button>
          </>
        )}

        {page === "profile" && (
          <>
            <section className="page-title">
              <p className="eyebrow">ACCOUNT</p>
              <h1>Profile</h1>
            </section>

            <section className="profile-card btn-3d-flat">
              <div className="avatar">
                {(profile?.username || displayName).slice(0, 2).toUpperCase()}
              </div>
              <h2>@{profile?.username || displayName}</h2>
              <p className="muted">{user.email}</p>
              {profile?.phone && (
                <p className="muted" style={{ marginTop: 4 }}>
                  📱 {profile.phone}
                </p>
              )}

              <div className="stats-row" style={{ marginTop: 22, marginBottom: 0 }}>
                <div>
                  <strong>{completedWorkouts.length}</strong>
                  <span>Workouts</span>
                </div>
                <div>
                  <strong>{streak}</strong>
                  <span>Streak</span>
                </div>
                <div>
                  <strong>FREE</strong>
                  <span>Plan</span>
                </div>
              </div>

              <button
                type="button"
                className="secondary-btn btn-3d"
                style={{ marginTop: 22, width: "100%" }}
                onClick={logout}
              >
                LOG OUT
              </button>
            </section>
          </>
        )}
      </main>

      <nav className="bottom-nav">
        <button
          type="button"
          className={`nav-item btn-3d-sm ${page === "home" ? "active" : ""}`}
          onClick={() => setPage("home")}
        >
          <span>🏠</span>
          <small>Home</small>
        </button>
        <button
          type="button"
          className={`nav-item btn-3d-sm ${page === "workouts" || page === "workout" || page === "session" ? "active" : ""}`}
          onClick={() => setPage("workouts")}
        >
          <span>💪</span>
          <small>Train</small>
        </button>
        <button
          type="button"
          className={`nav-item btn-3d-sm ${page === "ai" ? "active" : ""}`}
          onClick={() => setPage("ai")}
        >
          <span>🤖</span>
          <small>AI</small>
        </button>
        <button
          type="button"
          className={`nav-item btn-3d-sm ${page === "progress" ? "active" : ""}`}
          onClick={() => setPage("progress")}
        >
          <span>📈</span>
          <small>Progress</small>
        </button>
        <button
          type="button"
          className={`nav-item btn-3d-sm ${page === "profile" ? "active" : ""}`}
          onClick={() => setPage("profile")}
        >
          <span>👤</span>
          <small>Profile</small>
        </button>
      </nav>
    </div>
  );
}

export default App;
