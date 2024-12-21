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

            this.players = players || this.getDefaultPlayers();
            this.gameHalf = gameHalf || 0;
            this.elapsedTime = elapsedTime || 0;
            this.isRunning = isRunning || false;
            
            this.startTime = localStorage.getItem('startTime') ? parseInt(localStorage.getItem('startTime'), 10) : null;
            this.pauseTime = localStorage.getItem('pauseTime') ? parseInt(localStorage.getItem('pauseTime'), 10) : null;

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
            localStorage.setItem('startTime', this.startTime !== null ? this.startTime : null);
            localStorage.setItem('pauseTime', this.pauseTime !== null ? this.pauseTime : null);

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
            this.elements.startStopBtn.innerHTML = "&#10074;&#10074;";
            this.startTimers();
        } else {
            this.elements.startStopBtn.innerHTML = "&#9658;";
            this.renderElapsedTime();
            this.renderPlayers();
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
        if (!this.gameState.startTime) {
            this.elements.elapsedTime.textContent = "0:00";
            return;
        }
    
        const now = Date.now();
        if (this.gameState.isRunning) {
            this.gameState.elapsedTime = Math.floor((now - this.gameState.startTime) / 1000);
        }
        const minutes = Math.floor(this.gameState.elapsedTime / 60);
        const seconds = this.gameState.elapsedTime % 60;
    
        this.elements.elapsedTime.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    updatePlayerTimers() {
        if (this.gameState.isRunning) {
            const now = Date.now();
            this.gameState.elapsedTime = Math.floor((now - this.gameState.startTime) / 1000);
        }
        this.renderPlayers();
        this.gameState.saveState();
    }
    
    startStopGame() {
        const now = Date.now();
    
        if (this.intervalId === null) {
            if (this.gameState.pauseTime && this.gameState.elapsedTime) {
                this.gameState.startTime = now - (this.gameState.elapsedTime * 1000);
                this.gameState.pauseTime = null;
            } else if (!this.gameState.startTime) {
                this.gameState.startTime = now;
                this.gameState.elapsedTime = 0;
            }
    
            this.startTimers();
            this.elements.startStopBtn.innerHTML = "&#10074;&#10074;";
            this.elements.startStopBtn.classList.remove("pause-button");
            this.elements.startStopBtn.classList.add("play-button");
            this.gameState.isRunning = true;
    
        } else {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.gameState.elapsedTime = Math.floor((now - this.gameState.startTime) / 1000);
    
            this.elements.startStopBtn.innerHTML = "&#9658;";
            this.elements.startStopBtn.classList.remove("play-button");
            this.elements.startStopBtn.classList.add("pause-button");
            this.gameState.isRunning = false;
            this.gameState.pauseTime = now;
        }
    
        this.gameState.saveState();
        this.renderPlayers();
    }
    

    stopGame() {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.gameState.pauseTime = Date.now();
        this.elements.startStopBtn.innerHTML = "&#9658;";
        this.elements.startStopBtn.classList.remove("play-button");
        this.elements.startStopBtn.classList.add("pause-button");
        this.gameState.isRunning = false;
        this.gameState.saveState();
        this.renderPlayers();
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

    // Color references:
    // Play button (original): #28a745 (green)
    // Pause button (original): #f0ad4e (orange)
    //
    // According to instructions:
    // Total In font color = orange (#f0ad4e)
    // Total Out font color = green (#28a745)
    //
    // When player is IN:
    //   Status and Timer = orange (#f0ad4e)
    // When player is OUT:
    //   Status and Timer = green (#28a745)

    renderPlayers() {
        this.gameState.players.sort((a, b) => {
            const aVal = a.totalTimeIn + (a.currentStatus === "playing" ? (this.gameState.elapsedTime - a.lastSubbedInTime) : 0);
            const bVal = b.totalTimeIn + (b.currentStatus === "playing" ? (this.gameState.elapsedTime - b.lastSubbedInTime) : 0);
            return aVal - bVal;
        });

        this.elements.playersList.innerHTML = `
            <div class="player header">
                <div>Command</div>
                <div>Player / Status <br><small>(touch to edit)</small></div>
                <div>Timer</div>
                <div>Total In / Total Out</div>
            </div>
        `;

        const totalElapsed = this.gameState.elapsedTime;
        let playingCount = 0;
        let benchCount = 0;

        this.gameState.players.forEach((player) => {
            const isPlaying = player.currentStatus === "playing";
            
            const currentIn = isPlaying ? (totalElapsed - player.lastSubbedInTime) : 0;
            const currentOut = !isPlaying ? (totalElapsed - player.lastSubbedOutTime) : 0;

            const displayTotalIn = player.totalTimeIn + currentIn;
            const displayTotalOut = player.totalTimeOut + currentOut;

            // Determine colors
            const totalOutColor = "#f0ad4e";  // orange (pause button color)
            const totalInColor = "#28a745"; // green (play button color)

            let statusColor, timerColor;
            if (isPlaying) {
                // Player IN -> status and timer = green (#28a745)
                statusColor = "#28a745";
                timerColor = "#28a745";
                playingCount++;
            } else {
                // Player OUT -> status and timer = orange (#f0ad4e)
                statusColor = "#f0ad4e";
                timerColor = "#f0ad4e";
                benchCount++;
            }

            const buttonHtml = isPlaying
                ? `<button class="small-button small-pause-button" onclick="ui.togglePlayerStatus(${player.id})">&#10074;&#10074;</button>`
                : `<button class="small-button small-play-button" onclick="ui.togglePlayerStatus(${player.id})">&#9658;</button>`;

            // Status text
            const statusText = isPlaying 
                ? `<strong>In</strong> <span style="color: black;">@ ${player.subbedInTime || 'Start'}</span>`
                : player.currentStatus === "Started Out" 
                    ? "Started Out" 
                    : `<strong>Out</strong> <span style="color: black;">@ ${player.subbedOutTime || 'Start'}</span>`;

            const playerEl = document.createElement("div");
            playerEl.id = `player-${player.id}`;
            playerEl.className = `player ${isPlaying ? "playing" : "bench"}`;

            playerEl.innerHTML = `
                <div>${buttonHtml}</div>
                <div class="name"><strong style="font-size: 1.2em;">${player.name.charAt(0)}</strong>${player.name.slice(1)}<br><span style="color:${statusColor}; font-size: 0.9em;">${statusText}</span></div>
                <div class="timer" style="color:${timerColor}; font-size: 1.75em;"><strong>${isPlaying ? this.formatTime(currentIn) : this.formatTime(currentOut)}</strong></div>
                <div class="total-timer">
                    <div style="color:${totalInColor}; font-weight: ${isPlaying ? 'bold' : 'normal'}; font-size: 1.2em;">${this.formatTime(displayTotalIn)}</div>
                    <div style="color:${totalOutColor}; font-weight: ${isPlaying ? 'normal' : 'bold'}; font-size: 1.2em;">${this.formatTime(displayTotalOut)}</div>
                </div>
            `;

            const nameDiv = playerEl.querySelector('.name');
            nameDiv.addEventListener('click', () => this.editPlayerName(player.id));

            this.elements.playersList.appendChild(playerEl);
        });

        // Update player status counts
        document.getElementById('playingCount').innerHTML = `<strong>${playingCount}</strong> playing`;
        document.getElementById('benchCount').innerHTML = `<strong>${benchCount}</strong> on bench`;
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

        this.gameState.saveState();
        this.renderPlayers();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const gameState = new GameState();
    const gameUI = new GameUI(gameState);
    window.ui = gameUI;
});
