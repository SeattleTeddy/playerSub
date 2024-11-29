class GameState {
    constructor() {
        this.players = [];
        this.gameHalf = 0;
        this.elapsedTime = 0;
        this.isRunning = false; // Add isRunning to track game state
    }

    resetState() {
        localStorage.removeItem('players'); // Clear players from local storage
        localStorage.removeItem('gameHalf'); // Clear gameHalf from local storage
        localStorage.removeItem('elapsedTime'); // Clear elapsedTime from local storage
        localStorage.removeItem('isRunning'); // Clear isRunning from local storage

        this.players = this.getDefaultPlayers();
        this.gameHalf = 0;
        this.elapsedTime = 0;
        this.isRunning = false; // Reset isRunning state
        this.saveState();
    }

    loadState() {
        try {
            const players = JSON.parse(localStorage.getItem('players'));
            const gameHalf = JSON.parse(localStorage.getItem('gameHalf'));
            const elapsedTime = JSON.parse(localStorage.getItem('elapsedTime'));
            const isRunning = JSON.parse(localStorage.getItem('isRunning'));

            this.players = players || this.getDefaultPlayers();
            this.gameHalf = gameHalf || 0;
            this.elapsedTime = elapsedTime || 0;
            this.isRunning = isRunning || false; // Load isRunning state
        } catch (error) {
            console.error('Error loading game state:', error);
            this.resetState();
        }
    }

    saveState() {
        try {
            localStorage.setItem('players', JSON.stringify(this.players));
            localStorage.setItem('gameHalf', JSON.stringify(this.gameHalf));
            localStorage.setItem('elapsedTime', JSON.stringify(this.elapsedTime));
            localStorage.setItem('isRunning', JSON.stringify(this.isRunning)); // Save isRunning state
        } catch (error) {
            console.error('Error saving game state:', error);
        }
    }

    getDefaultPlayers() {
        return [
            { name: "Theo", number: 1 },
            { name: "Jasper", number: 2 },
            { name: "Lucas", number: 3 },
            { name: "Kaiden", number: 4 },
            { name: "Henry", number: 5 },
            { name: "Liam", number: 6 },
            { name: "George", number: 7 },
            { name: "Talon", number: 8 },
            { name: "Nathan", number: 9 },
            { name: "Jackson", number: 10 },
            { name: "Connor", number: 11 }
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
            lastSubbedOutTime: 0
        }));
    }
}

class GameUI {
    constructor(gameState) {
        this.gameState = gameState;
        this.needsSorting = false; // Add this flag
        this.intervalId = null;
        this.elements = {
            playersList: document.getElementById("playersList"),
            startStopBtn: document.getElementById("startStopBtn"),
            resetGameBtn: document.getElementById("resetGameBtn"),
            playerNameInput: document.getElementById("playerNameInput"),
            playerNumberInput: document.getElementById("playerNumberInput"),
            addPlayerBtn: document.getElementById("addPlayerBtn"),
            elapsedTime: document.getElementById("elapsedTime")
        };
        this.bindEvents();
    }

    bindEvents() {
        this.elements.startStopBtn.addEventListener("click", () => this.startStopGame());
        this.elements.resetGameBtn.addEventListener("click", () => this.resetGame());
        this.elements.addPlayerBtn.addEventListener("click", () => this.addPlayer());
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    renderElapsedTime() {
        const minutes = Math.floor(this.gameState.elapsedTime / 60);
        const seconds = this.gameState.elapsedTime % 60;
        this.elements.elapsedTime.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    renderPlayers() {
        this.elements.playersList.innerHTML = `
            <div class="player header">
                <div>Player / Status</div>
                <div>Timer</div>
                <div>Total In / Total Out</div>
            </div>
        `;
        this.gameState.players.forEach((player) => {
            const playerEl = document.createElement("div");
            let playerClasses = `player ${player.currentStatus}`;
            if (player.isRecentlySubbedIn) {
                playerClasses += ' subbing-in';
            }
            if (player.isRecentlySubbedOut) {
                playerClasses += ' subbing-out';
            }
            playerEl.className = playerClasses;
            playerEl.id = `player-${player.id}`; // Assign an ID to each player element

            const statusText = player.currentStatus === "playing"
                ? `In @ ${player.subbedInTime}`
                : player.subbedOutTime
                ? `Out @ ${player.subbedOutTime}`
                : `Started out`;

            const timerText = player.currentStatus === "playing"
                ? `<div class="timer">${this.formatTime(player.timeIn)}<br>&nbsp;</div>`
                : `<div class="timer"><br>${this.formatTime(player.timeOut)}</div>`;

            const playButton = player.currentStatus === "bench"
                ? `<button class="small-button small-play-button" onclick="ui.togglePlayerStatus(${player.id})">&#9658;</button>`
                : '';
            const pauseButton = player.currentStatus === "playing"
                ? `<button class="small-button small-pause-button" onclick="ui.togglePlayerStatus(${player.id})">&#10074;&#10074;</button>`
                : '';

            playerEl.innerHTML = `
                <div class="name">
                    ${pauseButton}
                    ${player.name}<br>${statusText}
                    ${playButton}
                </div>
                <div>${timerText}</div>
                <div>
                    <div class="totalTimeIn">${this.formatTime(player.totalTimeIn)}</div><div class="totalTimeOut">${this.formatTime(player.totalTimeOut)}</div>
                </div>
            `;
            this.elements.playersList.appendChild(playerEl);
        });
    }

    togglePlayerStatus(id) {
        const player = this.gameState.players.find((p) => p.id === id);
        if (player) {
            const currentTime = this.gameState.elapsedTime;

            const playerEl = document.getElementById(`player-${id}`);

            if (player.currentStatus === "bench") {
                // Subbing in
                if (player.lastSubbedOutTime !== null) {
                    player.totalTimeOut += currentTime - player.lastSubbedOutTime;
                }
                player.currentStatus = "playing";
                player.subbedInTime = this.formatTime(currentTime);
                player.lastSubbedInTime = currentTime;
                player.timeOut = 0;

                // Add 'subbing-in' class for green visual feedback
                if (playerEl) {
                    playerEl.classList.add('subbing-in');
                    setTimeout(() => {
                        playerEl.classList.remove('subbing-in');
                    }, 200);
                }
                player.isRecentlySubbedIn = true; // Set flag to keep visual effect
            } else {
                // Subbing out
                if (player.lastSubbedInTime !== null) {
                    player.totalTimeIn += currentTime - player.lastSubbedInTime;
                }
                player.currentStatus = "bench";
                player.subbedOutTime = this.formatTime(currentTime);
                player.lastSubbedOutTime = currentTime;
                player.timeIn = 0;

                // Add 'subbing-out' class for red visual feedback
                if (playerEl) {
                    playerEl.classList.add('subbing-out');
                    setTimeout(() => {
                        playerEl.classList.remove('subbing-out');
                    }, 200);
                }
                player.isRecentlySubbedOut = true; // Set flag to keep visual effect
            }

            this.gameState.saveState();
            this.needsSorting = true; // Indicate that sorting is needed
        }
    }

    addPlayer() {
        const name = this.elements.playerNameInput.value.trim();
        const number = this.elements.playerNumberInput.value.trim();

        if (!name || !number) {
            alert("Please fill in both name and number.");
            return;
        }

        this.gameState.players.push({
            id: this.gameState.players.length + 1,
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
            lastSubbedOutTime: this.gameState.elapsedTime
        });

        this.elements.playerNameInput.value = "";
        this.elements.playerNumberInput.value = "";
        this.gameState.saveState();
        this.renderPlayers();
    }

    updatePlayerTimers() {
        this.gameState.players.forEach((player) => {
            if (player.currentStatus === "playing") {
                player.timeIn = this.gameState.elapsedTime - player.lastSubbedInTime;
                player.totalTimeIn += 1; // Increment totalTimeIn every second

                // Update the player's timer element directly
                const timerEl = document.querySelector(`#player-${player.id} .timer`);
                if (timerEl) {
                    timerEl.innerHTML = `${this.formatTime(player.timeIn)}<br>&nbsp;`;
                }

                // Update total time in element
                const totalTimeInEl = document.querySelector(`#player-${player.id} .totalTimeIn`);
                if (totalTimeInEl) {
                    totalTimeInEl.textContent = this.formatTime(player.totalTimeIn);
                }
            } else {
                player.timeOut = this.gameState.elapsedTime - player.lastSubbedOutTime;
                player.totalTimeOut += 1; // Increment totalTimeOut every second

                // Update the player's timer element directly
                const timerEl = document.querySelector(`#player-${player.id} .timer`);
                if (timerEl) {
                    timerEl.innerHTML = `<br>${this.formatTime(player.timeOut)}`;
                }

                // Update total time out element
                const totalTimeOutEl = document.querySelector(`#player-${player.id} .totalTimeOut`);
                if (totalTimeOutEl) {
                    totalTimeOutEl.textContent = this.formatTime(player.totalTimeOut);
                }
            }
        });
        this.gameState.saveState();
        
        if (this.needsSorting) {
            this.sortPlayers('timeOut');
            this.renderPlayers();

            // Keep the visual effect for a short delay after sorting
            setTimeout(() => {
                this.gameState.players.forEach((player) => {
                    if (player.isRecentlySubbedIn) {
                        player.isRecentlySubbedIn = false; // Reset the flag
                    }
                    if (player.isRecentlySubbedOut) {
                        player.isRecentlySubbedOut = false; // Reset the flag
                    }
                });
                this.renderPlayers(); // Re-render to remove the visual effect
            }, 500); // Adjust the delay as needed (milliseconds)

            this.needsSorting = false; // Reset the sorting flag
        }
    }

    startStopGame() {
        if (this.intervalId === null) {
            this.intervalId = setInterval(() => {
                this.gameState.elapsedTime += 1;
                this.renderElapsedTime();
                this.updatePlayerTimers();
                this.renderPlayers(); // Moved renderPlayers here
            }, 1000);
            this.elements.startStopBtn.innerHTML = "&#10074;&#10074;"; // Pause glyph
            this.elements.startStopBtn.classList.remove('play-button');
            this.elements.startStopBtn.classList.add('pause-button');
            this.gameState.isRunning = true; // Update isRunning state
        } else {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.elements.startStopBtn.innerHTML = "&#9658;"; // Play glyph
            this.elements.startStopBtn.classList.remove('pause-button');
            this.elements.startStopBtn.classList.add('play-button');
            this.gameState.isRunning = false; // Update isRunning state
        }
        this.gameState.saveState();
    }

    resetGame() {
        if (confirm("Are you sure you want to reset the game?")) {
            this.gameState.resetState(); // Use resetState to clear local storage and reset state
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.renderElapsedTime();
            this.renderPlayers();
            this.elements.startStopBtn.innerHTML = "&#9658;"; // Play glyph
            this.elements.startStopBtn.classList.remove('pause-button');
            this.elements.startStopBtn.classList.add('play-button');
        }
    }

    sortPlayers(key) {
        this.gameState.players.sort((a, b) => {
            if (a[key] > b[key]) return -1;
            if (a[key] < b[key]) return 1;
            return 0;
        });
        this.renderPlayers();
    }

    renderAll() {
        this.renderElapsedTime();
        this.renderPlayers();
    }
}

// Initialize the application
let game = new GameState();
game.loadState();

document.addEventListener('DOMContentLoaded', () => {
    ui = new GameUI(game);
    window.ui = ui;
    ui.renderAll();
    if (game.isRunning) {
        ui.startStopGame();
    }
});

// Handle page visibility changes to preserve timer state
document.addEventListener('visibilitychange', () => {
    if (ui && document.hidden && ui.intervalId) {
        clearInterval(ui.intervalId);
        ui.intervalId = null;
    } else if (ui && !document.hidden && game.isRunning && !ui.intervalId) {
        ui.startStopGame();
    }
});