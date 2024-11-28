const players = JSON.parse(localStorage.getItem('players')) || [
  { name: "Theo", number: 1 },
  { name: "Jasper", number: 2 },
  { name: "Lucas", number: 3 },
  { name: "Kaiden", number: 4 },
  { name: "Henry", number: 5 },
  { name: "Liam", number: 6 },
  { name: "Lucas", number: 7 },
  { name: "Talon", number: 8 },
  { name: "Nathan", number: 9 },
  { name: "Jackson", number: 10 }
].map((player, index) => ({
  id: index + 1,
  ...player,
  currentStatus: "bench",
  subbedInTime: null,
  subbedOutTime: null,
  timeIn: 0,
  timeOut: 0,
  totalTimeIn: 0,
  totalTimeOut: 0,
  lastSubbedInTime: null,
  lastSubbedOutTime: 0 // Initialize to 0
}));

let gameHalf = JSON.parse(localStorage.getItem('gameHalf')) || 0; // 0: Not started, 1: First half, 2: Second half
let elapsedTime = JSON.parse(localStorage.getItem('elapsedTime')) || 0; // Time in seconds
let intervalId = null;

const gameStatusEl = document.getElementById("gameStatus");
const playersListEl = document.getElementById("playersList");
const nextHalfBtn = document.getElementById("nextHalfBtn");
const resetGameBtn = document.getElementById("resetGameBtn");
const playerNameInput = document.getElementById("playerNameInput");
const playerNumberInput = document.getElementById("playerNumberInput");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const elapsedTimeEl = document.getElementById("elapsedTime");

const saveData = () => {
  localStorage.setItem('players', JSON.stringify(players));
  localStorage.setItem('gameHalf', JSON.stringify(gameHalf));
  localStorage.setItem('elapsedTime', JSON.stringify(elapsedTime));
};

const renderGameStatus = () => {
  gameStatusEl.textContent =
    gameHalf === 0
      ? "Game Not Started"
      : gameHalf === 1
      ? "First Half"
      : "Second Half";
};

const renderElapsedTime = () => {
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  elapsedTimeEl.textContent = `Elapsed Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const renderPlayers = () => {
  playersListEl.innerHTML = `
    <div class="player header">
      <div>Name</div>
      <div>Status</div>
      <div>Timer</div>
      <div>Total Time In</div>
      <div>Total Time Out</div>
      <div class="actions">Actions</div>
    </div>
  `; // Add headers
  players.forEach((player) => {
    const playerEl = document.createElement("div");
    playerEl.className = `player ${
      player.currentStatus === "playing" ? "playing" : ""
    }`;

    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const statusText = player.currentStatus === "playing"
      ? `In @ ${player.subbedInTime}`
      : player.subbedOutTime
      ? `Out @ ${player.subbedOutTime}`
      : `Started out`;

    const timerText = player.currentStatus === "playing"
      ? formatTime(player.timeIn)
      : formatTime(player.timeOut);

    playerEl.innerHTML = `
      <div>${player.name}</div>
      <div>${statusText}</div>
      <div>${timerText}</div>
      <div>${formatTime(player.totalTimeIn)}</div>
      <div>${formatTime(player.totalTimeOut)}</div>
      <div class="actions">
        <button class="button" onclick="togglePlayerStatus(${player.id})">
          ${player.currentStatus === "bench" ? "Sub In" : "Sub Out"}
        </button>
        <button class="button" onclick="removePlayer(${player.id})">Remove</button>
      </div>
    `;
    playersListEl.appendChild(playerEl);
  });
};

const togglePlayerStatus = (id) => {
  const player = players.find((p) => p.id === id);
  if (player) {
    if (player.currentStatus === "bench") {
      player.currentStatus = "playing";
      player.subbedInTime = `${Math.floor(elapsedTime / 60)}:${elapsedTime % 60 < 10 ? '0' : ''}${elapsedTime % 60}`;
      if (player.subbedOutTime) {
        player.totalTimeOut += player.timeOut;
      }
      player.timeOut = 0;
      player.lastSubbedInTime = elapsedTime;
    } else {
      player.currentStatus = "bench";
      player.subbedOutTime = `${Math.floor(elapsedTime / 60)}:${elapsedTime % 60 < 10 ? '0' : ''}${elapsedTime % 60}`;
      player.totalTimeIn += player.timeIn;
      player.timeIn = 0;
      player.lastSubbedOutTime = elapsedTime;
    }
    saveData();
    renderPlayers();
  }
};

const addPlayer = () => {
  const name = playerNameInput.value.trim();
  const number = playerNumberInput.value.trim();

  if (!name || !number) {
    alert("Please fill in both name and number.");
    return;
  }

  players.push({
    id: players.length + 1,
    name,
    number,
    currentStatus: "bench",
    subbedInTime: null,
    subbedOutTime: null,
    timeIn: 0,
    timeOut: 0,
    totalTimeIn: 0,
    totalTimeOut: 0,
    lastSubbedInTime: null,
    lastSubbedOutTime: elapsedTime // Initialize to current elapsed time
  });

  playerNameInput.value = "";
  playerNumberInput.value = "";
  saveData();
  renderPlayers();
};

const removePlayer = (id) => {
  if (confirm("Are you sure you want to remove this player?")) {
    const index = players.findIndex((p) => p.id === id);
    if (index !== -1) {
      players.splice(index, 1);
      saveData();
      renderPlayers();
    }
  }
};

const updatePlayerTimers = () => {
  players.forEach((player) => {
    if (player.currentStatus === "playing") {
      player.timeIn = elapsedTime - player.lastSubbedInTime;
      player.totalTimeIn += 1;
    } else {
      player.timeOut = elapsedTime - player.lastSubbedOutTime;
      player.totalTimeOut += 1;
    }
  });
  saveData();
  renderPlayers();
};

const startGame = () => {
  if (gameHalf < 2) {
    if (confirm("Are you sure you want to start the next half?")) {
      gameHalf += 1;
      renderGameStatus();
      if (intervalId === null) {
        intervalId = setInterval(() => {
          elapsedTime += 1;
          renderElapsedTime();
          updatePlayerTimers();
        }, 1000);
      }
      saveData();
    }
  }
};

const resetGame = () => {
  if (confirm("Are you sure you want to reset the game?")) {
    gameHalf = 0;
    elapsedTime = 0;
    clearInterval(intervalId);
    intervalId = null;
    players.forEach((player) => {
      player.currentStatus = "bench";
      player.subbedInTime = null;
      player.subbedOutTime = null;
      player.timeIn = 0;
      player.timeOut = 0;
      player.totalTimeIn = 0;
      player.totalTimeOut = 0;
      player.lastSubbedInTime = null;
      player.lastSubbedOutTime = 0; // Reset to 0
    });
    renderGameStatus();
    renderElapsedTime();
    renderPlayers();
    saveData();
  }
};

const sortPlayers = (key) => {
  players.sort((a, b) => {
    if (a[key] > b[key]) return -1;
    if (a[key] < b[key]) return 1;
    return 0;
  });
  renderPlayers();
};

// Event Listeners
nextHalfBtn.addEventListener("click", startGame);
resetGameBtn.addEventListener("click", resetGame);
addPlayerBtn.addEventListener("click", addPlayer);

// Initial Render
renderGameStatus();
renderElapsedTime();
renderPlayers();