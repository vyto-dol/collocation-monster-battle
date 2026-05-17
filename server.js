const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 4173);
const ROOT = __dirname;
const rooms = new Map();
const clients = new Map();
const HEARTBEAT_MS = 15000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".webm": "audio/webm",
};

function defaultState(roomCode) {
  return {
    roomCode,
    players: [],
    queue: [],
    turnIndex: 0,
    round: 0,
    classHp: 100,
    classMaxHp: 100,
    monsterHp: 100,
    monsterMaxHp: 100,
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

function getRoom(roomCode) {
  const cleanCode = roomCode.toUpperCase();
  if (!rooms.has(cleanCode)) rooms.set(cleanCode, defaultState(cleanCode));
  return rooms.get(cleanCode);
}

function setRoom(roomCode, state) {
  const cleanCode = roomCode.toUpperCase();
  const currentState = rooms.get(cleanCode);
  const nextState = { ...defaultState(cleanCode), ...state, roomCode: cleanCode, updatedAt: Date.now() };

  if (currentState && Array.isArray(state.players) && !(state.status === "lobby" && state.players.length === 0)) {
    const playersById = new Map(currentState.players.map((player) => [player.id, player]));
    state.players.forEach((player) => playersById.set(player.id, { ...playersById.get(player.id), ...player }));
    nextState.players = [...playersById.values()];
  }

  rooms.set(cleanCode, nextState);
  broadcast(cleanCode, nextState);
  return nextState;
}

function joinRoom(roomCode, player) {
  const cleanCode = roomCode.toUpperCase();
  const currentState = getRoom(cleanCode);
  if (!player?.id || !player?.name) return currentState;

  const currentPlayer = currentState.players.find((item) => item.id === player.id);
  const nextPlayer = {
    turnsTaken: 0,
    correct: 0,
    wrong: 0,
    ...currentPlayer,
    ...player,
    name: String(player.name).trim().slice(0, 24),
  };
  const players = currentPlayer
    ? currentState.players.map((item) => (item.id === player.id ? nextPlayer : item))
    : [...currentState.players, nextPlayer];

  return setRoom(cleanCode, { ...currentState, players });
}

function broadcast(roomCode, state) {
  const roomClients = clients.get(roomCode);
  if (!roomClients) return;
  const payload = `data: ${JSON.stringify(state)}\n\n`;
  roomClients.forEach((res) => res.write(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/health") {
    sendJson(res, 200, { ok: true, uptime: process.uptime() });
    return;
  }

  const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.normalize(path.join(ROOT, requested));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean);

  if (parts[0] !== "api") {
    serveStatic(req, res);
    return;
  }

  try {
    const roomCode = parts[1]?.toUpperCase();
    const action = parts[2];
    if (!roomCode) {
      sendJson(res, 400, { error: "Missing room code" });
      return;
    }

    if (req.method === "GET" && !action) {
      sendJson(res, 200, getRoom(roomCode));
      return;
    }

    if (req.method === "GET" && action === "events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-store",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });
      res.write(`data: ${JSON.stringify(getRoom(roomCode))}\n\n`);
      const heartbeat = setInterval(() => res.write(": ping\n\n"), HEARTBEAT_MS);
      const roomClients = clients.get(roomCode) || new Set();
      roomClients.add(res);
      clients.set(roomCode, roomClients);
      req.on("close", () => {
        clearInterval(heartbeat);
        roomClients.delete(res);
      });
      return;
    }

    if (req.method === "POST" && action === "join") {
      const body = await readJson(req);
      sendJson(res, 200, joinRoom(roomCode, body.player || body));
      return;
    }

    if (req.method === "POST" && action === "state") {
      const body = await readJson(req);
      sendJson(res, 200, setRoom(roomCode, body.state || body));
      return;
    }

    sendJson(res, 404, { error: "Unknown route" });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Collocation Monster Battle running at http://127.0.0.1:${PORT}`);
});
