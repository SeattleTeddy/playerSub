class GameState {
    constructor() {
        this.players = [];
        this.gameHalf = 0;
        this.elapsedTime = 0;
        this.isRunning = false; // Add isRunning to track game state
        this.startTime = null; // Track the actual start time
        this.pauseTime = null; // Track the pause time
        this.savedPlayers = JSON.parse(localStorage.getItem('savedPlayers')) || null;
        this.initialTeamState = null; // Add this to store initial team state
        if (!localStorage.getItem('players')) {
            this.resetToSounders(); // Load Sounders players if no game state is stored
        } else {
            this.loadState(); // Load existing game state
        }
        // Store initial team state after loading
        this.initialTeamState = this.players.map(({ id, name, number }) => ({ id, name, number }));
        console.log('GameState initialized:', this);
    }

    resetState() {
        console.log('Game state is being reset');
        localStorage.removeItem('players'); // Clear players from local storage
        localStorage.removeItem('gameHalf'); // Clear gameHalf from local storage
        localStorage.removeItem('elapsedTime'); // Clear elapsedTime from local storage
        localStorage.removeItem('isRunning'); // Clear isRunning from local storage
        localStorage.removeItem('startTime'); // Clear startTime from local storage
        localStorage.removeItem('pauseTime'); // Clear pauseTime from local storage

        this.players = this.getDefaultPlayers();
        this.gameHalf = 0;
        this.elapsedTime = 0;
        this.isRunning = false; // Reset isRunning state
        this.startTime = null;
        this.pauseTime = null;
        this.saveState();
        console.log('Game state after reset:', this);
    }

    loadPlayerData(players) {
        console.log('Loading player data:', players);
        this.players = players;
        this.saveState();
        console.log('Player data loaded:', this.players);
    }

    loadState() {
        try {
            console.log('Loading game state from localStorage');
            const players = JSON.parse(localStorage.getItem('players'));
            const gameHalf = JSON.parse(localStorage.getItem('gameHalf'));
            const elapsedTime = JSON.parse(localStorage.getItem('elapsedTime'));
            const isRunning = JSON.parse(localStorage.getItem('isRunning'));
            const startTime = JSON.parse(localStorage.getItem('startTime'));
            const pauseTime = JSON.parse(localStorage.getItem('pauseTime'));

            this.players = players || this.getDefaultPlayers();
            this.gameHalf = gameHalf || 0;
            this.elapsedTime = elapsedTime || 0;
            this.isRunning = isRunning || false; // Load isRunning state
            this.startTime = startTime ? new Date(startTime) : null;
            this.pauseTime = pauseTime ? new Date(pauseTime) : null;
            console.log('Game state loaded:', this);
        } catch (error) {
            console.error('Error loading game state:', error);
            this.resetState();
        }
    }

    saveState() {
        try {
            console.log('Saving game state to localStorage:', this);
            localStorage.setItem('players', JSON.stringify(this.players));
            localStorage.setItem('gameHalf', JSON.stringify(this.gameHalf));
            localStorage.setItem('elapsedTime', JSON.stringify(this.elapsedTime));
            localStorage.setItem('isRunning', JSON.stringify(this.isRunning)); // Save isRunning state
            localStorage.setItem('startTime', JSON.stringify(this.startTime));
            localStorage.setItem('pauseTime', JSON.stringify(this.pauseTime));
            console.log('Game state saved successfully');
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

    saveTeam() {
        if (confirm("Are you sure you want to save the current team? This will overwrite any previously saved team.")) {
            const teamToSave = this.players.map(({ id, name, number }) => ({ id, name, number }));
            localStorage.setItem('savedTeam', JSON.stringify(teamToSave)); // Changed key to 'savedTeam' and saved simplified player data
            this.savedPlayers = teamToSave;
            localStorage.setItem('savedPlayers', JSON.stringify(this.savedPlayers)); // Save the simplified player data
        }
    }

    loadSavedTeam() {
        const savedTeam = JSON.parse(localStorage.getItem('savedTeam')); // Changed key to 'savedTeam'
        if (savedTeam && confirm("Are you sure you want to load the saved team? This will reset the current game.")) {
            // Reset timer-related properties
            const loadedPlayers = savedTeam.map(player => ({
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
            this.loadPlayerData(loadedPlayers);
            this.resetGameState(); // Reset the game state without reloading player data
        } else {
            alert("No saved team found.");
        }
    }

    resetToSampleTeam() {
        if (confirm("Are you sure you want to reset to the sample team? This will reset the current game.")) {
            this.loadPlayerData(this.getDefaultPlayers());
            this.resetGameState(); // Reset the game state without reloading player data
        }
    }

    resetToSounders() {
        const soundersPlayers = [
            { name: "Frei", number: 1 },
            { name: "Roldan", number: 2 },
            { name: "Gómez Andrade", number: 3 },
            { name: "Ragen", number: 4 },
            { name: "Tolo", number: 5 },
            { name: "Paulo", number: 6 },
            { name: "Rusnák", number: 7 },
            { name: "Roldan", number: 8 },
            { name: "Morris", number: 9 },
            { name: "Ruidíaz", number: 10 },
            { name: "Chú", number: 11 }
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
        this.loadPlayerData(soundersPlayers);
        this.resetGameState(); // Reset the game state without reloading player data
    }

    resetGameState() {
        this.gameHalf = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.startTime = null;
        this.pauseTime = null;

        // Reset players' timer-related properties
        this.players.forEach(player => {
            player.timeIn = 0;
            player.timeOut = 0;
            player.totalTimeIn = 0;
            player.totalTimeOut = 0;
            player.lastSubbedInTime = null;
            player.lastSubbedOutTime = 0;
        });

        this.saveState();
    }

    clearAllData() {
        if (confirm("Are you sure you want to delete all saved data? This action cannot be undone.")) {
            localStorage.clear();
            this.resetState();
            console.log('All saved data has been cleared.');
        }
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
            elapsedTime: document.getElementById("elapsedTime"),
            saveTeamBtn: document.getElementById("saveTeamBtn"),
            loadSavedTeamBtn: document.getElementById("loadSavedTeamBtn"),
            resetSampleTeamBtn: document.getElementById("resetSampleTeamBtn"),
            resetSoundersBtn: document.getElementById("resetSoundersBtn"),
            deleteAllDataBtn: document.getElementById("deleteAllDataBtn")
        };
        this.bindEvents();
        this.checkSavedTeam();
        this.trackChanges();
    }

    bindEvents() {
        this.elements.startStopBtn.addEventListener("click", () => this.startStopGame());
        this.elements.resetGameBtn.addEventListener("click", () => this.resetGame());
        this.elements.addPlayerBtn.addEventListener("click", () => this.addPlayer());
        this.elements.playersList.addEventListener("click", (event) => {
            if (event.target.classList.contains("name")) {
                const playerId = event.target.closest(".player").id.split("-")[1];
                this.editPlayer(playerId);
            }
        });
        this.elements.saveTeamBtn.addEventListener("click", () => this.saveTeam());
        this.elements.loadSavedTeamBtn.addEventListener("click", () => this.loadSavedTeam());
        this.elements.resetSampleTeamBtn.addEventListener("click", () => this.resetToSampleTeam());
        this.elements.resetSoundersBtn.addEventListener("click", () => this.resetToSounders());
        this.elements.deleteAllDataBtn.addEventListener("click", () => this.deleteAllData());
    }

    checkSavedTeam() {
        this.elements.loadSavedTeamBtn.disabled = !this.gameState.savedPlayers; // Disable the "Load Saved Team" button if no saved team
    }

    trackChanges() {
        // Compare current players with initial state instead of just storing current state
        const currentTeam = this.gameState.players.map(({ id, name, number }) => ({ id, name, number }));
        const initialTeam = this.gameState.initialTeamState;
        this.elements.saveTeamBtn.disabled = JSON.stringify(currentTeam) === JSON.stringify(initialTeam);
    }

    enableSaveButton() {
        const currentTeam = this.gameState.players.map(({ id, name, number }) => ({ id, name, number }));
        const initialTeam = this.gameState.initialTeamState;
        this.elements.saveTeamBtn.disabled = JSON.stringify(currentTeam) === JSON.stringify(initialTeam);
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
        } else if (this.gameState.pauseTime) {
            this.gameState.elapsedTime = Math.floor((this.gameState.pauseTime - this.gameState.startTime) / 1000);
        }
        const minutes = Math.floor(this.gameState.elapsedTime / 60);
        const seconds = this.gameState.elapsedTime % 60;
        this.elements.elapsedTime.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    renderPlayers() {
        this.elements.playersList.innerHTML = `
            <div class="player header">
                <div>&nbsp;</div>
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
                <div>${player.currentStatus === "bench" ? playButton : pauseButton}</div>
                <div class="name" onclick="ui.editPlayer(${player.id})"><strong>${player.name}</strong><br>${statusText}</div>
                <div class="timer">
                    ${player.currentStatus === "playing" ? `${this.formatTime(player.timeIn)}<br>&nbsp;` : `<br>${this.formatTime(player.timeOut)}`}
                </div>
                <div class="total-timer">
                    <div>${this.formatTime(player.totalTimeIn)}</div>
                    <div>${this.formatTime(player.totalTimeOut)}</div>
                </div>
            `;
            this.elements.playersList.appendChild(playerEl);
        });
    }

    togglePlayerStatus(id) {
        const player = this.gameState.players.find((p) => p.id === id);
        if (player) {
            const currentTime = this.gameState.elapsedTime;

            // Add visual feedback BEFORE state changes and sorting
            const playerEl = document.getElementById(`player-${id}`);
            if (playerEl) {
                if (player.currentStatus === "bench") {
                    playerEl.classList.add('subbing-in');
                } else {
                    playerEl.classList.add('subbing-out');
                }
            }

            if (player.currentStatus === "bench") {
                // Subbing in logic
                player.isRecentlySubbedIn = true;
                player.currentStatus = "playing";
                player.subbedInTime = this.formatTime(currentTime);
                player.lastSubbedInTime = currentTime;
                player.timeOut = 0;
            } else {
                // Subbing out logic
                player.isRecentlySubbedOut = true;
                player.currentStatus = "bench";
                player.subbedOutTime = this.formatTime(currentTime);
                player.lastSubbedOutTime = currentTime;
                player.timeIn = 0;
            }

            this.gameState.saveState();

            // Delay sorting to allow visual feedback to be seen
            setTimeout(() => {
                this.needsSorting = true;
                this.sortPlayers();
                
                // Remove visual feedback after sorting
                setTimeout(() => {
                    player.isRecentlySubbedIn = false;
                    player.isRecentlySubbedOut = false;
                    this.renderPlayers();
                }, 500);
            }, 200);
        }
        //this.enableSaveButton();
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
            number: this.gameState.players.length + 1, // Assign a default number
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
        this.gameState.saveState();
        this.sortPlayers();      // Sort the players list
        this.renderPlayers();    // Render the updated list
        this.enableSaveButton();
    }

    editPlayer(id) {
        const player = this.gameState.players.find((p) => p.id === parseInt(id));
        if (player) {
            const newName = prompt("Edit player name (Leave empty to delete):", player.name);
            if (newName !== null) {
                if (newName.trim() === "") {
                    if (confirm("Do you want to delete this player?")) {
                        this.gameState.players = this.gameState.players.filter((p) => p.id !== player.id);
                        this.gameState.saveState();
                        this.sortPlayers();      // Sort after deletion
                        this.renderPlayers();    // Render the updated list
                    }
                } else {
                    player.name = newName.trim();
                    this.gameState.saveState();
                    this.sortPlayers();          // Sort if name changes
                    this.renderPlayers();        // Render the updated list
                }
            }
        }
        this.enableSaveButton();
    }

    updatePlayerTimers() {
        const now = Date.now();
        if (this.gameState.isRunning) {
            this.gameState.elapsedTime = Math.floor((now - this.gameState.startTime) / 1000);
        } else if (this.gameState.pauseTime) {
            this.gameState.elapsedTime = Math.floor((this.gameState.pauseTime - this.gameState.startTime) / 1000);
        }

        this.gameState.players.forEach((player) => {
            if (player.currentStatus === "playing") {
                player.timeIn = this.gameState.elapsedTime - player.lastSubbedInTime;
                
                // Update timer element
                const timerEl = document.querySelector(`#player-${player.id} .timer`);
                if (timerEl) {
                    timerEl.innerHTML = `${this.formatTime(player.timeIn)}<br>&nbsp;`;
                }

                // Update total time in element - FIX: Accumulate total time
                const totalTimerEl = document.querySelector(`#player-${player.id} .total-timer`);
                if (totalTimerEl) {
                    if (player.timeIn > 0) {
                        player.totalTimeIn = (player.totalTimeIn || 0) + 1; // Increment by 1 second
                    }
                    totalTimerEl.firstElementChild.textContent = this.formatTime(player.totalTimeIn);
                }
            } else {
                player.timeOut = this.gameState.elapsedTime - player.lastSubbedOutTime;
                
                // Update timer element
                const timerEl = document.querySelector(`#player-${player.id} .timer`);
                if (timerEl) {
                    timerEl.innerHTML = `<br>${this.formatTime(player.timeOut)}`;
                }

                // Update total time out element - FIX: Accumulate total time
                const totalTimerEl = document.querySelector(`#player-${player.id} .total-timer`);
                if (totalTimerEl) {
                    if (player.timeOut > 0) {
                        player.totalTimeOut = (player.totalTimeOut || 0) + 1; // Increment by 1 second
                    }
                    totalTimerEl.lastElementChild.textContent = this.formatTime(player.totalTimeOut);
                }
            }
        });
        this.gameState.saveState();

        if (this.needsSorting) {
            this.sortPlayers();
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
            const now = Date.now();
            if (!this.gameState.startTime) {
                this.gameState.startTime = now;
            } else if (this.gameState.pauseTime) {
                // Adjust startTime to account for paused duration
                this.gameState.startTime += (now - this.gameState.pauseTime);
                this.gameState.pauseTime = null;
            }
            this.intervalId = setInterval(() => {
                this.renderElapsedTime();
                this.updatePlayerTimers();
            }, 1000);
            this.elements.startStopBtn.innerHTML = "&#10074;&#10074;"; // Pause glyph
            this.elements.startStopBtn.classList.remove('play-button');
            this.elements.startStopBtn.classList.add('pause-button');
            this.gameState.isRunning = true; // Update isRunning state
        } else {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.gameState.pauseTime = Date.now();
            this.elements.startStopBtn.innerHTML = "&#9658;"; // Play glyph
            this.elements.startStopBtn.classList.remove('pause-button');
            this.elements.startStopBtn.classList.add('play-button');
            this.gameState.isRunning = false; // Update isRunning state
        }
        this.gameState.saveState();
    }

    resetGame() {
        if (confirm("Are you sure you want to reset the game?")) {
            this.gameState.resetGameState(); // Call resetGameState instead of resetState to avoid resetting players
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.renderElapsedTime();
            this.renderPlayers();
            this.elements.startStopBtn.innerHTML = "&#9658;"; // Play glyph
            this.elements.startStopBtn.classList.remove('pause-button');
            this.elements.startStopBtn.classList.add('play-button');
        }
    }

    sortPlayers(sortBy = 'timeOut') {
        switch (sortBy) {
            case 'name':
                this.gameState.players.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'timeOut':
                this.gameState.players.sort((a, b) => b.timeOut - a.timeOut);
                break;
            case 'totalTimeOut':
                this.gameState.players.sort((a, b) => b.totalTimeOut - a.totalTimeOut);
                break;
            default:
                // Default sorting logic if needed
                break;
        }
        //this.renderPlayers(); // Ensure players are rendered after sorting
    }

    saveTeam() {
        this.gameState.saveTeam();
        this.elements.loadSavedTeamBtn.disabled = false; // Ensure the button is enabled after saving a team
        this.trackChanges(); // Reset tracking after saving
        // this.resetGame(); <!-- Removed to prevent resetting the game after saving -->
    }

    loadSavedTeam() {
        this.gameState.loadSavedTeam();
        this.renderPlayers();
        this.resetGame(); // Reset the game
        this.elements.startStopBtn.innerHTML = "&#9658;"; // Play glyph
        this.elements.startStopBtn.classList.remove('pause-button');
        this.elements.startStopBtn.classList.add('play-button');
    }

    resetToSampleTeam() {
        this.gameState.resetToSampleTeam();
        this.renderPlayers();
        this.resetGame(); // Reset the game
    }

    resetToSounders() {
        this.gameState.resetToSounders();
        this.renderPlayers();
        this.resetGame(); // Reset the game
        this.trackChanges(); // Reset tracking after resetting to Sounders
    }

    deleteAllData() {
        this.gameState.clearAllData();
        this.renderPlayers();
        this.resetGame();
    }

    renderAll() {
        this.renderElapsedTime();
        this.renderPlayers();
        //this.elements.loadSavedTeamBtn.disabled = !this.gameState.savedPlayers;
    }
}

// Initialize the application
let game = new GameState();

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
    if (ui) {
        if (document.hidden && ui.intervalId) {
            clearInterval(ui.intervalId);
            ui.intervalId = null;
        } else if (!document.hidden) {
            // Force immediate timer update when returning to page
            ui.renderElapsedTime();
            ui.updatePlayerTimers();
            if (game.isRunning && !ui.intervalId) {
                ui.startStopGame();
            }
        }
    }
});