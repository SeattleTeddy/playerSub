class GameState {
    constructor() {
        this.players = [];
        this.gameHalf = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.startTime = null;
        this.pauseTime = null;
        this.savedPlayers = JSON.parse(localStorage.getItem('savedPlayers')) || null;
        if (!localStorage.getItem('players')) {
            this.players = this.getDefaultPlayers();
            this.saveState();
        } else {
            this.loadState();
        }
    }

    loadState() {
        try {
            const players = JSON.parse(localStorage.getItem('players'));
            const gameHalf = JSON.parse(localStorage.getItem('gameHalf'));
            const elapsedTime = JSON.parse(localStorage.getItem('elapsedTime'));
            const isRunning = JSON.parse(localStorage.getItem('isRunning'));
            const startTime = JSON.parse(localStorage.getItem('startTime'));
            const pauseTime = JSON.parse(localStorage.getItem('pauseTime'));

            this.players = players || this.getDefaultPlayers();
            this.gameHalf = gameHalf || 0;
            this.elapsedTime = elapsedTime || 0;
            this.isRunning = isRunning || false;
            this.startTime = startTime ? new Date(startTime) : null;
            this.pauseTime = pauseTime ? new Date(pauseTime) : null;
        } catch (error) {
            this.resetStateToTimersOnly();
        }
    }

    saveState() {
        try {
            localStorage.setItem('players', JSON.stringify(this.players));
            localStorage.setItem('gameHalf', JSON.stringify(this.gameHalf));
            localStorage.setItem('elapsedTime', JSON.stringify(this.elapsedTime));
            localStorage.setItem('isRunning', JSON.stringify(this.isRunning));
            localStorage.setItem('startTime', JSON.stringify(this.startTime));
            localStorage.setItem('pauseTime', JSON.stringify(this.pauseTime));
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
            currentStatus: "Started Out",
            subbedInTime: null,
            subbedOutTime: null,
            timeIn: 0,
            timeOut: 0,
            totalTimeIn: 0,
            totalTimeOut: 0,
            lastSubbedInTime: 0,
            lastSubbedOutTime: 0
        }));
    }

    resetStateToTimersOnly() {
        this.gameHalf = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.startTime = null;
        this.pauseTime = null;

        this.players.forEach(player => {
            player.currentStatus = "Started Out";
            player.subbedInTime = null;
            player.subbedOutTime = null;
            player.timeIn = 0;
            player.timeOut = 0;
            player.totalTimeIn = 0;
            player.totalTimeOut = 0;
            player.lastSubbedInTime = 0;
            player.lastSubbedOutTime = 0;
        });

        this.saveState();
    }

    loadSampleTeam() {
        this.players = this.getDefaultPlayers();
        this.resetStateToTimersOnly();
        this.saveState();
    }

    loadSoundersTeam() {
        this.players = [
            { name: "Frei", number: 24 },
            { name: "Roldan", number: 7 },
            { name: "Morris", number: 13 },
            { name: "Lodeiro", number: 10 },
            { name: "Ruidiaz", number: 9 },
            { name: "Nouhou", number: 5 },
            { name: "Arreaga", number: 3 },
            { name: "João Paulo", number: 6 },
            { name: "Atencio", number: 84 },
            { name: "C. Roldan", number: 16 },
            { name: "Rusnák", number: 11 }
        ].map((player, index) => ({
            id: index + 1,
            ...player,
            currentStatus: "Started Out",
            subbedInTime: null,
            subbedOutTime: null,
            timeIn: 0,
            timeOut: 0,
            totalTimeIn: 0,
            totalTimeOut: 0,
            lastSubbedInTime: 0,
            lastSubbedOutTime: this.elapsedTime
        }));
        this.resetStateToTimersOnly();
        this.saveState();
    }

    deleteAllData() {
        localStorage.clear();
        this.players = this.getDefaultPlayers();
        this.resetStateToTimersOnly();
    }
}

class GameUI {
    constructor(gameState) {
        this.gameState = gameState;
        this.intervalId = null;
        this.elements = {
            playersList: document.getElementById("playersList"),
            startStopBtn: document.getElementById("startStopBtn"),
            resetGameBtn: document.getElementById("resetGameBtn"),
            playerNameInput: document.getElementById("playerNameInput"),
            addPlayerBtn: document.getElementById("addPlayerBtn"),
            elapsedTime: document.getElementById("elapsedTime"),
            resetSoundersBtn: document.getElementById("resetSoundersBtn"),
            resetSampleTeamBtn: document.getElementById("resetSampleTeamBtn"),
            deleteAllDataBtn: document.getElementById("deleteAllDataBtn")
        };
        this.bindEvents();
        this.renderPlayers(); 
        if (this.gameState.isRunning) {
            this.startTimers();
        }
    }

    bindEvents() {
        this.elements.startStopBtn.addEventListener("click", () => this.startStopGame());
        this.elements.resetGameBtn.addEventListener("click", () => this.resetGame());
        this.elements.addPlayerBtn.addEventListener("click", () => this.addPlayer());

        if (this.elements.resetSoundersBtn) {
            this.elements.resetSoundersBtn.addEventListener("click", () => {
                if (confirm("Reset to Sounders team and pause the game?")) {
                    this.stopGame();
                    this.gameState.loadSoundersTeam();
                    this.renderPlayers();
                    this.renderElapsedTime();
                }
            });
        }

        if (this.elements.resetSampleTeamBtn) {
            this.elements.resetSampleTeamBtn.addEventListener("click", () => {
                if (confirm("Reset to Sample Team and pause the game?")) {
                    this.stopGame();
                    this.gameState.loadSampleTeam();
                    this.renderPlayers();
                    this.renderElapsedTime();
                }
            });
        }

        if (this.elements.deleteAllDataBtn) {
            this.elements.deleteAllDataBtn.addEventListener("click", () => {
                if (confirm("Delete all saved data and pause the game?")) {
                    this.stopGame();
                    this.gameState.deleteAllData();
                    this.renderPlayers();
                    this.renderElapsedTime();
                }
            });
        }
    }

    editPlayerName(playerId) {
        const player = this.gameState.players.find(p => p.id === playerId);
        if (!player) return;
        const newName = prompt("Enter a new name for the player (Leave blank to delete):", player.name);
        
        if (newName === null) return;
        const trimmedName = newName.trim();
        if (trimmedName === "") {
            this.gameState.players = this.gameState.players.filter(p => p.id !== playerId);
        } else {
            player.name = trimmedName;
        }
        this.gameState.saveState();
        this.renderPlayers();
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    renderElapsedTime() {
        const now = Date.now();
        if (this.gameState.isRunning) {
            this.gameState.elapsedTime = Math.floor((now - this.gameState.startTime) / 1000);
        }
        const minutes = Math.floor(this.gameState.elapsedTime / 60);
        const seconds = this.gameState.elapsedTime % 60;
        this.elements.elapsedTime.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    updatePlayerTimers() {
        if (!this.gameState.players.length) return; 
        if (this.gameState.isRunning) {
            const now = Date.now();
            this.gameState.elapsedTime = Math.floor((now - this.gameState.startTime) / 1000);
        }
        this.gameState.players.forEach((player) => {
            const elapsedSinceGameStart = this.gameState.elapsedTime;
            if (player.currentStatus === "playing") {
                player.timeIn = elapsedSinceGameStart - player.lastSubbedInTime;
            } else {
                player.timeOut = elapsedSinceGameStart - player.lastSubbedOutTime;
            }
        });
        this.renderPlayers();
        this.gameState.saveState();
    }
    
    startStopGame() {
        if (this.intervalId === null) {
            const now = Date.now();
            if (!this.gameState.startTime) {
                this.gameState.startTime = now;
            } else if (this.gameState.pauseTime) {
                this.gameState.startTime += (now - this.gameState.pauseTime);
                this.gameState.pauseTime = null;
            }
            this.startTimers();
            this.elements.startStopBtn.innerHTML = "&#10074;&#10074;";
            this.gameState.isRunning = true;
        } else {
            this.stopGame();
        }
        this.gameState.saveState();
    }

    stopGame() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.gameState.pauseTime = Date.now();
        this.elements.startStopBtn.innerHTML = "&#9658;";
        this.gameState.isRunning = false;
        this.gameState.saveState();
    }

    startTimers() {
        this.intervalId = setInterval(() => {
            this.renderElapsedTime();
            this.updatePlayerTimers();
        }, 1000);
    }

    resetGame() {
        if (confirm("Are you sure you want to reset the game? Clicking OK will reset all timers to 0:00.")) {
            this.stopGame();
            this.gameState.resetStateToTimersOnly();
            this.renderElapsedTime();
            this.renderPlayers();
        }
    }

    addPlayer() {
        const name = this.elements.playerNameInput.value.trim();
        if (!name) {
            alert("Please fill in the name.");
            return;
        }

        this.gameState.players.push({
            id: this.gameState.players.length + 1,
            name,
            number: this.gameState.players.length + 1,
            currentStatus: "Started Out",
            subbedInTime: null,
            subbedOutTime: null,
            timeIn: 0,
            timeOut: 0,
            totalTimeIn: 0,
            totalTimeOut: 0,
            lastSubbedInTime: 0,
            lastSubbedOutTime: this.gameState.elapsedTime
        });

        this.elements.playerNameInput.value = "";
        this.gameState.saveState();
        this.renderPlayers();
    }

    renderPlayers() {
        // Sorting by total playing time in + current stint if playing
        this.gameState.players.sort((a, b) => {
            const aVal = a.totalTimeIn + (a.currentStatus === "playing" ? a.timeIn : 0);
            const bVal = b.totalTimeIn + (b.currentStatus === "playing" ? b.timeIn : 0);
            return aVal - bVal;
        });

        this.elements.playersList.innerHTML = `
            <div class="player header">
                <div>&nbsp;</div>
                <div>Player / Status <br><small><strong>(touch to edit)</strong></small></div>
                <div>Timer</div>
                <div>Total In / Total Out</div>
            </div>
        `;

        this.gameState.players.forEach((player) => {
            const isPlaying = player.currentStatus === "playing";
            const displayTotalIn = player.totalTimeIn + (isPlaying ? player.timeIn : 0);
            const displayTotalOut = player.totalTimeOut + (!isPlaying ? player.timeOut : 0);

            const buttonHtml = isPlaying
                ? `<button class="small-button small-pause-button" onclick="ui.togglePlayerStatus(${player.id})">&#10074;&#10074;</button>`
                : `<button class="small-button small-play-button" onclick="ui.togglePlayerStatus(${player.id})">&#9658;</button>`;

            const timerHtml = isPlaying
                ? `${this.formatTime(player.timeIn)}<br>&nbsp;`
                : `<br>${this.formatTime(player.timeOut)}`;

            let statusClass = isPlaying ? "playing" : "bench";
            const playerEl = document.createElement("div");
            playerEl.id = `player-${player.id}`;
            playerEl.className = `player ${statusClass}`;

            // Align glyphs by using an inline-block of fixed width
            playerEl.innerHTML = `
                <div>${buttonHtml}</div>
                <div class="name"><strong>${player.name}</strong><br>${
                    isPlaying 
                        ? `In @ ${player.subbedInTime || 'Start'}`
                        : player.currentStatus === "Started Out" 
                            ? "Started Out" 
                            : `Out @ ${player.subbedOutTime || 'Start'}`
                }</div>
                <div class="timer">${timerHtml}</div>
                <div class="total-timer">
                    <div><span class="glyph-container">▶</span> ${this.formatTime(displayTotalIn)}</div>
                    <div><span class="glyph-container">&#x23F8;</span> ${this.formatTime(displayTotalOut)}</div>
                </div>
            `;

            const nameDiv = playerEl.querySelector('.name');
            nameDiv.addEventListener('click', () => this.editPlayerName(player.id));

            this.elements.playersList.appendChild(playerEl);
        });
    }

    togglePlayerStatus(playerId) {
        const player = this.gameState.players.find((p) => p.id === playerId);
        if (!player) return;
        const currentTime = this.gameState.elapsedTime;
        const playerEl = document.getElementById(`player-${player.id}`);

        if (player.currentStatus === "bench" || player.currentStatus === "Started Out") {
            const outDuration = currentTime - player.lastSubbedOutTime;
            if (outDuration > 0) player.totalTimeOut += outDuration;
            player.currentStatus = "playing";
            player.lastSubbedInTime = currentTime;
            player.subbedInTime = this.formatTime(currentTime);
            player.timeIn = 0;
            playerEl.classList.add('subbing-in');
            setTimeout(() => playerEl.classList.remove('subbing-in'), 600);
        } else {
            const inDuration = currentTime - player.lastSubbedInTime;
            if (inDuration > 0) player.totalTimeIn += inDuration;
            player.currentStatus = "bench";
            player.lastSubbedOutTime = currentTime;
            player.subbedOutTime = this.formatTime(currentTime);
            player.timeOut = 0;
            playerEl.classList.add('subbing-out');
            setTimeout(() => playerEl.classList.remove('subbing-out'), 600);
        }

        this.renderPlayers();
        this.gameState.saveState();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const gameState = new GameState();
    const gameUI = new GameUI(gameState);
    window.ui = gameUI;
});
