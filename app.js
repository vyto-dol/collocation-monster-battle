const SPORTS = [
  { sport: "football", answer: "play", image: "assets/flashcards-trimmed/4.png", attackImage: "assets/handout-extract/page01_img03_X20.png" },
  { sport: "basketball", answer: "play", image: "assets/flashcards-trimmed/5.png", attackImage: "assets/handout-extract/page01_img05_X24.png" },
  { sport: "volleyball", answer: "play", image: "assets/flashcards-trimmed/6.png", attackImage: "assets/sports/volleyball.png" },
  { sport: "badminton", answer: "play", image: "assets/flashcards-trimmed/7.png", attackImage: "assets/handout-extract/page01_img06_X26.png" },
  { sport: "pickleball", answer: "play", image: "assets/flashcards-trimmed/8.png", attackImage: "assets/sports/pickleball.png" },
  { sport: "tennis", answer: "play", image: "assets/flashcards-trimmed/9.png", attackImage: "assets/handout-extract/page01_img07_X28.png" },
  { sport: "chess", answer: "play", image: "assets/flashcards-trimmed/10.png", attackImage: "assets/handout-extract/page01_img08_X30.png" },
  { sport: "cycling", answer: "go", image: "assets/flashcards-trimmed/11.png", attackImage: "assets/handout-extract/page02_img07_X21.png" },
  { sport: "jogging", answer: "go", image: "assets/flashcards-trimmed/12.png" },
  { sport: "fishing", answer: "go", image: "assets/flashcards-trimmed/13.png", attackImage: "assets/handout-extract/page02_img09_X25.png" },
  { sport: "swimming", answer: "go", image: "assets/flashcards-trimmed/14.png", attackImage: "assets/handout-extract/page02_img08_X23.png" },
  { sport: "yoga", answer: "do", image: "assets/flashcards-trimmed/15.png", attackImage: "assets/handout-extract/page02_img04_X15.png" },
  { sport: "karate", answer: "do", image: "assets/flashcards-trimmed/16.png", attackImage: "assets/handout-extract/page02_img10_X27.png" },
  { sport: "aerobics", answer: "do", image: "assets/flashcards-trimmed/17.png", attackImage: "assets/handout-extract/page02_img11_X29.png" },
];

const STUDENT_AVATARS = [
  "assets/handout-extract/page01_img02_X16.png",
  "assets/handout-extract/page02_img04_X15.png",
  "assets/handout-extract/page02_img05_X17.png",
  "assets/handout-extract/page02_img07_X21.png",
  "assets/handout-extract/page02_img10_X27.png",
  "assets/handout-extract/page02_img11_X29.png",
  "assets/handout-extract/page03_img01_X4.png",
];

const MAX_CLASS_HP = 100;
const TURN_SECONDS = 10;
const CONFIG = {
  TARGET_ROUNDS: 3,
  CORRECT_RATE: 0.65,
  DMG_CORRECT: 10,
  DMG_WRONG: 12,
};
const SERVER_MODE = window.location.protocol.startsWith("http");
const params = new URLSearchParams(window.location.search);
const els = {
  landing: document.querySelector("#landingView"),
  battle: document.querySelector("#battleView"),
  tabs: document.querySelectorAll(".tab"),
  teacherForm: document.querySelector("#teacherForm"),
  studentForm: document.querySelector("#studentForm"),
  teacherRoom: document.querySelector("#teacherRoom"),
  studentRoom: document.querySelector("#studentRoom"),
  studentName: document.querySelector("#studentName"),
  roomCodeLabel: document.querySelector("#roomCodeLabel"),
  screenTitle: document.querySelector("#screenTitle"),
  musicToggleBtn: document.querySelector("#musicToggleBtn"),
  copyLinkBtn: document.querySelector("#copyLinkBtn"),
  leaveBtn: document.querySelector("#leaveBtn"),
  classHpBar: document.querySelector("#classHpBar"),
  classHpText: document.querySelector("#classHpText"),
  monsterHpBar: document.querySelector("#monsterHpBar"),
  monsterHpText: document.querySelector("#monsterHpText"),
  turnStudent: document.querySelector("#turnStudent"),
  timerText: document.querySelector("#timerText"),
  sportPrompt: document.querySelector("#sportPrompt"),
  sportImage: document.querySelector("#sportImage"),
  options: document.querySelector("#options"),
  feedback: document.querySelector("#feedback"),
  nextTurnBtn: document.querySelector("#nextTurnBtn"),
  overlayNextBtn: document.querySelector("#overlayNextBtn"),
  resultOverlay: document.querySelector("#resultOverlay"),
  resultText: document.querySelector("#resultText"),
  sidePanel: document.querySelector("#sidePanel"),
  playerCount: document.querySelector("#playerCount"),
  rosterList: document.querySelector("#rosterList"),
  answerKey: document.querySelector("#answerKey"),
  answerKeyPanel: document.querySelector("#answerKeyPanel"),
  teacherControlsPanel: document.querySelector("#teacherControlsPanel"),
  resetBattleBtn: document.querySelector("#resetBattleBtn"),
  clearRoomBtn: document.querySelector("#clearRoomBtn"),
  impactBurst: document.querySelector("#impactBurst"),
  sportAttackProp: document.querySelector("#sportAttackProp"),
  toast: document.querySelector("#toast"),
};

let role = null;
let roomCode = null;
let studentId = null;
let timerId = null;
let channel = null;
let events = null;
let state = null;
let audioContext = null;
let lastFxKey = "";
let musicOn = false;
let musicTimerId = null;
let musicResumeTimerId = null;
const heyYaAudio = new Audio("assets/audio/hey-ya.mp3");

function roomKey(code) {
  return `collocation-battle:${code}`;
}

function makeRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getDefaultState(code) {
  return {
    roomCode: code,
    players: [],
    queue: [],
    turnIndex: 0,
    round: 0,
    classHp: MAX_CLASS_HP,
    classMaxHp: MAX_CLASS_HP,
    monsterHp: MAX_CLASS_HP,
    monsterMaxHp: MAX_CLASS_HP,
    correctCount: 0,
    wrongCount: 0,
    streak: 0,
    phase: 1,
    isOver: false,
    turn: null,
    usedSports: [],
    status: "lobby",
    updatedAt: Date.now(),
  };
}

function loadState(code) {
  const raw = localStorage.getItem(roomKey(code));
  if (!raw) return getDefaultState(code);
  try {
    return normalizeState(code, JSON.parse(raw));
  } catch {
    return getDefaultState(code);
  }
}

function normalizeState(code, rawState = {}) {
  const base = getDefaultState(code);
  return {
    ...base,
    ...rawState,
    classMaxHp: rawState.classMaxHp || rawState.classHp || base.classMaxHp,
    monsterMaxHp: rawState.monsterMaxHp || rawState.monsterHp || base.monsterMaxHp,
    queue: rawState.queue || [],
    turnIndex: rawState.turnIndex || 0,
    round: rawState.round || 0,
    correctCount: rawState.correctCount || 0,
    wrongCount: rawState.wrongCount || 0,
    streak: rawState.streak || 0,
    phase: rawState.phase || 1,
    isOver: Boolean(rawState.isOver),
  };
}

async function fetchState(code) {
  if (!SERVER_MODE) return loadState(code);
  try {
    const response = await fetch(`/api/${encodeURIComponent(code)}`);
    if (!response.ok) throw new Error("Room fetch failed");
    return normalizeState(code, await response.json());
  } catch {
    showToast("Server unavailable. Using this browser only.");
    return loadState(code);
  }
}

function saveState(nextState, broadcast = true) {
  state = { ...nextState, updatedAt: Date.now() };
  localStorage.setItem(roomKey(roomCode), JSON.stringify(state));
  if (broadcast && SERVER_MODE) {
    fetch(`/api/${encodeURIComponent(roomCode)}/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    }).catch(() => showToast("Live sync paused. Check the server."));
  } else if (broadcast && channel) {
    channel.postMessage({ type: "state", state });
  }
  syncTeacherTimer();
  render();
}

async function joinPlayer(player) {
  if (!SERVER_MODE) {
    const existing = state.players.find((item) => item.id === player.id);
    const players = existing
      ? state.players.map((item) => (item.id === player.id ? { ...item, ...player } : item))
      : [...state.players, player];
    saveState({ ...state, players }, true);
    return;
  }

  try {
    const response = await fetch(`/api/${encodeURIComponent(roomCode)}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player }),
    });
    if (!response.ok) throw new Error("Room join failed");
    state = normalizeState(roomCode, await response.json());
    localStorage.setItem(roomKey(roomCode), JSON.stringify(state));
    render();
  } catch {
    showToast("Could not join live room. Try refreshing.");
  }
}

function setMode(mode) {
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === mode));
  els.teacherForm.classList.toggle("hidden", mode !== "teacher");
  els.studentForm.classList.toggle("hidden", mode !== "student");
}

async function joinRoom(nextRole, code, name = "") {
  role = nextRole;
  roomCode = code.trim().toUpperCase();
  state = await fetchState(roomCode);
  setupLiveSync();

  if (role === "student") {
    studentId = sessionStorage.getItem(`${roomKey(roomCode)}:studentId`) || makeId();
    sessionStorage.setItem(`${roomKey(roomCode)}:studentId`, studentId);
    const cleanName = name.trim().slice(0, 24);
    await joinPlayer({ id: studentId, name: cleanName, turnsTaken: 0, correct: 0, wrong: 0 });
  }

  els.landing.classList.add("hidden");
  els.battle.classList.remove("hidden");
  window.createBattlePhaser?.();
  render();
}

function setupLiveSync() {
  channel?.close();
  events?.close();
  if (SERVER_MODE) {
    events = new EventSource(`/api/${encodeURIComponent(roomCode)}/events`);
    events.onmessage = (event) => {
      state = normalizeState(roomCode, JSON.parse(event.data));
      localStorage.setItem(roomKey(roomCode), JSON.stringify(state));
      syncTeacherTimer();
      render();
    };
    events.onerror = () => showToast("Trying to reconnect live sync...");
    return;
  }

  channel = new BroadcastChannel(`collocation-battle-${roomCode}`);
  channel.onmessage = (event) => {
    if (event.data?.type === "state") {
      state = normalizeState(roomCode, event.data.state);
      syncTeacherTimer();
      render();
    }
  };
}

function pickSport() {
  const unused = SPORTS.filter((item) => !state.usedSports.includes(item.sport));
  const pool = unused.length ? unused : SPORTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function initHP(numStudents) {
  const totalQuestions = numStudents * CONFIG.TARGET_ROUNDS;
  const estimatedCorrect = Math.floor(totalQuestions * CONFIG.CORRECT_RATE);
  const estimatedWrong = totalQuestions - estimatedCorrect;
  return {
    monsterHp: Math.max(CONFIG.DMG_CORRECT, Math.floor(estimatedCorrect * CONFIG.DMG_CORRECT * 1.1)),
    classHp: Math.max(CONFIG.DMG_WRONG, Math.floor(estimatedWrong * CONFIG.DMG_WRONG * 1.5)),
  };
}

function shuffle(array) {
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
  return array;
}

function startGameState(players) {
  const { monsterHp, classHp } = initHP(players.length);
  return {
    ...state,
    players: players.map((player) => ({ ...player, turnsTaken: 0, correct: 0, wrong: 0 })),
    queue: shuffle([...players]),
    turnIndex: 0,
    round: 0,
    monsterHp,
    monsterMaxHp: monsterHp,
    classHp,
    classMaxHp: classHp,
    correctCount: 0,
    wrongCount: 0,
    streak: 0,
    phase: 1,
    isOver: false,
    status: "ready",
    turn: null,
    usedSports: [],
  };
}

function getCurrentStudent(nextState = state) {
  return nextState.queue?.[nextState.turnIndex] || nextState.players[0];
}

function getPhaseMultiplier(monsterHp, monsterMaxHp) {
  const ratio = monsterHp / Math.max(1, monsterMaxHp);
  if (ratio > 0.66) return 1.0;
  if (ratio > 0.33) return 1.3;
  return 1.6;
}

function getPhase(monsterHp, monsterMaxHp) {
  const ratio = monsterHp / Math.max(1, monsterMaxHp);
  if (ratio > 0.66) return 1;
  if (ratio > 0.33) return 2;
  return 3;
}

function advanceTurn(nextState) {
  const advanced = { ...nextState, turnIndex: nextState.turnIndex + 1 };
  if (advanced.turnIndex >= advanced.players.length) {
    advanced.turnIndex = 0;
    advanced.round += 1;
    advanced.queue = shuffle([...advanced.players]);
  }
  return advanced;
}

function finishIfNeeded(nextState) {
  if (nextState.monsterHp <= 0) return { ...nextState, isOver: true, status: "won" };
  if (nextState.classHp <= 0) return { ...nextState, isOver: true, status: "lost" };
  if (nextState.round >= CONFIG.TARGET_ROUNDS) {
    const monsterPct = nextState.monsterHp / Math.max(1, nextState.monsterMaxHp);
    const classPct = nextState.classHp / Math.max(1, nextState.classMaxHp);
    return { ...nextState, isOver: true, status: classPct > monsterPct ? "won" : "lost" };
  }
  return nextState;
}

function startTurn() {
  if (role !== "teacher") return;
  getAudioContext();
  if (!state.players.length) {
    showToast("Add at least one student first.");
    return;
  }

  const baseState = state.status === "lobby" || !state.queue?.length ? startGameState(state.players) : state;
  const player = getCurrentStudent(baseState);
  const prompt = pickSport();
  saveState({
    ...baseState,
    status: "active",
    turn: {
      playerId: player.id,
      sport: prompt.sport,
      answer: prompt.answer,
      secondsLeft: TURN_SECONDS,
      resolved: false,
      startedAt: Date.now(),
    },
    usedSports: [...baseState.usedSports.filter((sport) => sport !== prompt.sport), prompt.sport].slice(-SPORTS.length),
  });
  beginTimer();
}

function beginTimer() {
  clearInterval(timerId);
  if (role !== "teacher" || !state?.turn || state.turn.resolved) return;
  timerId = setInterval(() => {
    const secondsLeft = Math.max(0, state.turn.secondsLeft - 1);
    const nextTurn = { ...state.turn, secondsLeft };
    saveState({ ...state, turn: nextTurn }, true);
    if (secondsLeft <= 0) {
      resolveTurn(null);
    }
  }, 1000);
}

function syncTeacherTimer() {
  if (role !== "teacher") return;
  if (state?.status !== "active" || state?.turn?.resolved) {
    clearInterval(timerId);
  }
}

function resolveTurn(answer) {
  if (!state.turn || state.turn.resolved) return;
  const isCorrect = answer === state.turn.answer;
  const multiplier = getPhaseMultiplier(state.monsterHp, state.monsterMaxHp);
  const players = state.players.map((player) => {
    if (player.id !== state.turn.playerId) return player;
    return {
      ...player,
      turnsTaken: Math.min(CONFIG.TARGET_ROUNDS, player.turnsTaken + 1),
      correct: player.correct + (isCorrect ? 1 : 0),
      wrong: player.wrong + (isCorrect ? 0 : 1),
    };
  });
  const monsterHp = isCorrect ? Math.max(0, state.monsterHp - CONFIG.DMG_CORRECT) : state.monsterHp;
  const classHp = isCorrect ? state.classHp : Math.max(0, state.classHp - Math.floor(CONFIG.DMG_WRONG * multiplier));

  clearInterval(timerId);
  const resolvedState = {
    ...state,
    players,
    monsterHp,
    classHp,
    correctCount: state.correctCount + (isCorrect ? 1 : 0),
    wrongCount: state.wrongCount + (isCorrect ? 0 : 1),
    streak: isCorrect ? state.streak + 1 : 0,
    phase: getPhase(monsterHp, state.monsterMaxHp),
    status: "paused",
    turn: {
      ...state.turn,
      selected: answer,
      resolved: true,
      correct: isCorrect,
      resolvedAt: Date.now(),
      secondsLeft: Math.max(0, state.turn.secondsLeft),
    },
  };
  const hpChecked = finishIfNeeded(resolvedState);
  const finalState = hpChecked.isOver ? hpChecked : finishIfNeeded(advanceTurn(hpChecked));
  saveState(finalState);
}

function resetBattle(keepPlayers = true) {
  const players = keepPlayers
    ? state.players.map((player) => ({ ...player, turnsTaken: 0, correct: 0, wrong: 0 }))
    : [];
  saveState({
    ...getDefaultState(roomCode),
    players,
  });
  window.dispatchEvent(new CustomEvent("battle:reset-scene"));
}

function canAnswer() {
  return role === "student" && state?.turn && !state.turn.resolved && state.turn.playerId === studentId && state.status === "active";
}

function render() {
  if (!state) return;
  els.roomCodeLabel.textContent = state.roomCode;
  els.screenTitle.textContent = role === "teacher" ? "Teacher Console" : "Student Battle";
  els.copyLinkBtn.classList.toggle("hidden", role !== "teacher");
  els.nextTurnBtn.classList.toggle("hidden", role !== "teacher");
  els.sidePanel.classList.toggle("hidden", role !== "teacher");
  els.answerKeyPanel.classList.toggle("hidden", role !== "teacher");
  els.teacherControlsPanel.classList.toggle("hidden", role !== "teacher");
  els.resetBattleBtn.disabled = role !== "teacher";
  els.clearRoomBtn.disabled = role !== "teacher";
  els.battle.dataset.phase = getBattlePhase();
  els.battle.dataset.card = getCardState();
  els.battle.dataset.sport = state.turn?.sport || "none";

  const classPct = Math.max(0, (state.classHp / Math.max(1, state.classMaxHp)) * 100);
  const monsterPct = Math.max(0, (state.monsterHp / Math.max(1, state.monsterMaxHp)) * 100);
  const timerPct =
    state.turn && state.status === "active" ? Math.max(0, (state.turn.secondsLeft / TURN_SECONDS) * 100) : 100;
  els.classHpBar.style.width = `${classPct}%`;
  els.monsterHpBar.style.width = `${monsterPct}%`;
  els.timerText.style.setProperty("--timer-pct", `${timerPct}%`);
  els.classHpText.textContent = `${state.classHp}/${state.classMaxHp}`;
  els.monsterHpText.textContent = `${state.monsterHp}/${state.monsterMaxHp}`;
  els.playerCount.textContent = state.players.length;
  els.rosterList.innerHTML = state.players
    .map((player) => `<li><span>${escapeHtml(player.name)}</span><span>${player.turnsTaken}/${CONFIG.TARGET_ROUNDS}</span></li>`)
    .join("");

  renderQuestion();
  renderAnswerKey();
  renderSportAttackProp();
  triggerTurnFx();
}

function renderQuestion() {
  const turn = state.turn;
  const activePlayer = turn ? state.players.find((player) => player.id === turn.playerId) : null;
  renderTurnStudent(activePlayer);
  els.timerText.textContent = turn && state.status === "active" ? turn.secondsLeft : TURN_SECONDS;
  els.sportPrompt.textContent = turn ? turn.sport : "Ready?";
  const sportData = turn ? SPORTS.find((item) => item.sport === turn.sport) : null;
  els.sportImage.src = sportData?.image || "";
  els.sportImage.alt = sportData ? `${sportData.sport} illustration` : "";
  els.sportImage.parentElement.classList.toggle("hidden", !sportData);
  els.nextTurnBtn.disabled = role !== "teacher" || state.status === "active" || !state.players.length || state.status === "won" || state.status === "lost";
  els.nextTurnBtn.textContent = state.status === "lobby" ? "Start Turn" : "Next Turn";

  [...els.options.querySelectorAll("button")].forEach((button) => {
    const value = button.dataset.answer;
    button.disabled = !canAnswer();
    button.classList.toggle("correct", Boolean(turn?.resolved && value === turn.answer));
    button.classList.toggle("wrong", Boolean(turn?.resolved && value === turn.selected && value !== turn.answer));
  });

  if (state.status === "won") {
    els.feedback.textContent = "Victory! The class defeated the collocation monster.";
    els.resultText.textContent = "Victory! The class defeated the monster.";
  } else if (state.status === "lost") {
    els.feedback.textContent = "The monster won this round. Reset and try again.";
    els.resultText.textContent = "The monster won this round.";
  } else if (!turn) {
    els.feedback.textContent = role === "teacher" ? "Share the join link, then start the first turn." : "Waiting for the teacher to start.";
    els.resultText.textContent = "";
  } else if (turn.resolved) {
    els.feedback.textContent = turn.correct
      ? `${activePlayer?.name || "Student"} used ${turn.answer} ${turn.sport}. Direct hit!`
      : `Answer: ${turn.answer} ${turn.sport}. The monster hits back.`;
    els.resultText.textContent = turn.correct
      ? `${activePlayer?.name || "Student"} landed a hit!`
      : `Monster counterattacks! Answer: ${turn.answer} ${turn.sport}.`;
  } else if (canAnswer()) {
    els.feedback.textContent = "Your turn. Choose now.";
    els.resultText.textContent = "";
  } else {
    els.feedback.textContent = `${activePlayer?.name || "A student"} is answering.`;
    els.resultText.textContent = "";
  }

  els.overlayNextBtn.classList.toggle("hidden", role !== "teacher" || !turn?.resolved || state.status === "won" || state.status === "lost");
}

function renderTurnStudent(activePlayer) {
  const avatar = els.turnStudent.querySelector(".student-avatar");
  const name = els.turnStudent.querySelector(".student-name");
  if (!activePlayer) {
    avatar.textContent = "";
    avatar.style.backgroundImage = "";
    name.textContent = "Waiting for players";
    return;
  }
  avatar.textContent = "";
  avatar.style.setProperty("--avatar-hue", getNameHue(activePlayer.name));
  avatar.style.backgroundImage = `url("${getStudentAvatar(activePlayer.name)}")`;
  name.textContent = `${activePlayer.name}'s turn`;
}

function getNameHue(name) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return `${hash}deg`;
}

function getStudentAvatar(name) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % STUDENT_AVATARS.length;
  return STUDENT_AVATARS[hash];
}

function getBattlePhase() {
  if (!state?.turn) return "idle";
  if (!state.turn.resolved) return "charging";
  return state.turn.correct ? "hero-hit" : "monster-hit";
}

function getCardState() {
  if (!state?.turn) return "visible";
  return state.turn.resolved ? "hidden" : "visible";
}

function renderAnswerKey() {
  const grouped = SPORTS.reduce((acc, item) => {
    acc[item.answer] = acc[item.answer] || [];
    acc[item.answer].push(item.sport);
    return acc;
  }, {});
  els.answerKey.innerHTML = ["play", "go", "do"]
    .map((verb) => `<dt>${verb}</dt><dd>${grouped[verb].join(", ")}</dd>`)
    .join("");
}

function renderSportAttackProp() {
  const turn = state?.turn;
  if (!turn?.correct) {
    els.sportAttackProp.style.backgroundImage = "";
    return;
  }
  const sportData = SPORTS.find((item) => item.sport === turn.sport);
  els.sportAttackProp.style.backgroundImage = sportData?.attackImage ? `url("${sportData.attackImage}")` : "";
}

function triggerTurnFx() {
  if (!state?.turn?.resolved) return;
  const fxKey = `${state.turn.startedAt}:${state.turn.resolvedAt}:${state.turn.correct}`;
  if (fxKey === lastFxKey) return;
  lastFxKey = fxKey;
  window.dispatchEvent(
    new CustomEvent("battle:effect", {
      detail: {
        correct: state.turn.correct,
        sport: state.turn.sport,
        selected: state.turn.selected,
      },
    }),
  );
  speakAttackCue();
  playSfx(state.turn.correct ? "hero" : "monster");
}

function getAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  audioContext = audioContext || new AudioContext();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playTone(ctx, frequency, start, duration, type, gainValue) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(gainValue, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
}

function playNoise(ctx, start, duration, gainValue) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
  }
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  gain.gain.setValueAtTime(gainValue, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  source.connect(gain).connect(ctx.destination);
  source.start(start);
}

function playSfx(kind) {
  const ctx = getAudioContext();
  if (!ctx) return;
  pauseMusicForFx();
  const now = ctx.currentTime;
  playNoise(ctx, now, 0.16, kind === "hero" ? 0.18 : 0.13);
  playTone(ctx, kind === "hero" ? 180 : 110, now, 0.22, "sawtooth", 0.08);
  playTone(ctx, kind === "hero" ? 720 : 260, now + 0.03, 0.12, "triangle", 0.06);
  if (kind === "hero") playTone(ctx, 980, now + 0.11, 0.08, "square", 0.035);
}

function pauseMusicForFx() {
  if (!musicOn) return;
  stopMusicLoop();
  if (musicResumeTimerId) window.clearTimeout(musicResumeTimerId);
  musicResumeTimerId = window.setTimeout(() => {
    if (musicOn) startMusicLoop();
  }, 4200);
}

function speakAttackCue() {
  if (heyYaAudio?.src) {
    heyYaAudio.currentTime = 0;
    heyYaAudio.play().catch(() => {});
    return;
  }
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance("hey ya");
  utterance.lang = "en-US";
  utterance.rate = 1.05;
  utterance.pitch = 1.2;
  utterance.volume = 0.9;
  window.speechSynthesis.speak(utterance);
}

function toggleMusic() {
  musicOn = !musicOn;
  els.musicToggleBtn.textContent = musicOn ? "Music On" : "Music Off";
  if (musicOn) {
    getAudioContext();
    startMusicLoop();
  } else {
    stopMusicLoop();
  }
}

function startMusicLoop() {
  stopMusicLoop();
  playMusicBar();
  musicTimerId = window.setInterval(playMusicBar, 1600);
}

function stopMusicLoop() {
  if (musicTimerId) window.clearInterval(musicTimerId);
  musicTimerId = null;
}

function playMusicBar() {
  if (!musicOn) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [196, 247, 294, 247, 220, 262, 330, 262];
  notes.forEach((note, index) => {
    const start = now + index * 0.2;
    playTone(ctx, note, start, 0.18, index % 2 ? "triangle" : "sine", 0.025);
    if (index % 2 === 0) playTone(ctx, note / 2, start, 0.18, "sine", 0.018);
  });
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.setTimeout(() => els.toast.classList.remove("show"), 1800);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char];
  });
}

els.tabs.forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.mode)));
els.musicToggleBtn.addEventListener("click", toggleMusic);
els.teacherForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const code = els.teacherRoom.value.trim() || makeRoomCode();
  await joinRoom("teacher", code);
  resetBattle(true);
});
els.studentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await joinRoom("student", els.studentRoom.value, els.studentName.value);
});
els.nextTurnBtn.addEventListener("click", startTurn);
els.overlayNextBtn.addEventListener("click", startTurn);
els.options.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-answer]");
  if (!button || !canAnswer()) return;
  getAudioContext();
  resolveTurn(button.dataset.answer);
});
els.copyLinkBtn.addEventListener("click", async () => {
  const url = new URL(window.location.href);
  url.searchParams.set("room", roomCode);
  url.searchParams.set("mode", "student");
  await navigator.clipboard.writeText(url.toString());
  showToast("Join link copied.");
});
els.leaveBtn.addEventListener("click", () => {
  clearInterval(timerId);
  stopMusicLoop();
  window.location.href = window.location.pathname;
});
els.resetBattleBtn.addEventListener("click", () => {
  if (role === "teacher") resetBattle(true);
});
els.clearRoomBtn.addEventListener("click", () => {
  if (role === "teacher") resetBattle(false);
});

window.addEventListener("storage", (event) => {
  if (roomCode && event.key === roomKey(roomCode) && event.newValue) {
    state = normalizeState(roomCode, JSON.parse(event.newValue));
    syncTeacherTimer();
    render();
  }
});

const initialMode = params.get("mode") === "student" ? "student" : "teacher";
setMode(initialMode);
els.teacherRoom.value = params.get("room") || makeRoomCode();
els.studentRoom.value = params.get("room") || "";
