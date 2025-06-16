let players = [0, 0, 0, 0];
let scores = [0, 0, 0, 0];
let currentPlayer = 0;
let finishedPlayers = [];

// Start game from config
function startGame(config) {
  document.getElementById('config-form').classList.add('hidden');
  document.getElementById('game-output').classList.remove('hidden');
  document.getElementById('status').textContent = 'Klik dadu untuk mulai';

  let tiles = JSON.parse(atob(config)).tiles;
  if (JSON.parse(config).randomize) {
    tiles = shuffleArray(tiles);
  }

  // Draw board
  const board = document.getElementById('game-board');
  board.innerHTML = '';
  tiles.forEach((tile, index) => {
    const div = document.createElement('div');
    div.className = `tile flex flex-col items-center justify-center text-center p-4 rounded-lg border-2 ${tile.color || 'bg-gray-200'}`;
    div.innerHTML = `
      <div class="text-3xl mb-2">${tile.icon || ''}</div>
      <div class="text-xs mt-auto">${index + 1}</div>
    `;
    board.appendChild(div);
  });

  // Dice roll handler
  document.getElementById('dice-btn').addEventListener('click', () => {
    const diceSides = JSON.parse(config).diceSides || 6;
    const steps = Math.floor(Math.random() * diceSides) + 1;
    players[currentPlayer] += steps;
    
    const maxTileIndex = tiles.length - 1;
    if (players[currentPlayer] > maxTileIndex) {
      players[currentPlayer] = maxTileIndex;
    }

    const tile = tiles[players[currentPlayer]];
    showTileModal(tile, players[currentPlayer], currentPlayer, maxTileIndex);

    // Check if finished
    if (players[currentPlayer] === maxTileIndex && !finishedPlayers.includes(currentPlayer)) {
      finishedPlayers.push(currentPlayer);
      alert(`Pemain ${currentPlayer + 1} menyelesaikan permainan!`);
    }

    // Switch player
    let nextPlayer = (currentPlayer + 1) % players.length;
    while (finishedPlayers.includes(nextPlayer)) {
      nextPlayer = (nextPlayer + 1) % players.length;
    }
    currentPlayer = nextPlayer;
    document.getElementById('status').textContent = `Giliran pemain ${currentPlayer + 1}`;
  });
}

// Shuffle array
function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

// Show modal
function showModal(title, text, options = [], imageUrl = '') {
  let modalContent = '';
  if (imageUrl) modalContent += `<img src="${imageUrl}" class="modal-image">`;
  modalContent += text;
  modalTitle.textContent = title;
  modalText.innerHTML = modalContent;
  optionsContainer.innerHTML = '';
  
  const shuffled = shuffleArray(options);
  shuffled.forEach(option => {
    const button = document.createElement('button');
    button.className = "bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition w-full mt-2 flex items-center";
    if (option.imageUrl) {
      button.innerHTML = `<img src="${option.imageUrl}" class="inline mr-2 modal-option-image">${option.text}`;
    } else {
      button.textContent = option.text;
    }
    button.onclick = () => {
      eval(option.action);
      closeModal();
    };
    optionsContainer.appendChild(button);
  });
  
  document.getElementById('question-modal').classList.remove('hidden');
}

// Close modal
function closeModal() {
  document.getElementById('question-modal').classList.add('hidden');
  optionsContainer.innerHTML = '';
}

// Handle Answer
function checkAnswer(isCorrect, playerIndex, level) {
  if (isCorrect) {
    scores[playerIndex] += scoreMap[level];
    updateLeaderboard();
    closeModal();
  } else if (JSON.parse(config).punishment) {
    alert('Jawaban salah! Tidak bisa maju!');
    players[playerIndex] -= 1; // Move back
    closeModal();
  } else {
    closeModal();
  }
  updatePlayerPosition();
}

// Update player position
function updatePlayerPosition() {
  document.querySelectorAll('.player-indicator').forEach(el => el.remove());
  players.forEach((pos, idx) => {
    if (pos < tiles.length) {
      const tile = document.querySelectorAll('#game-board > div')[pos];
      const dot = document.createElement('div');
      dot.className = `player-indicator absolute top-0 right-0 w-4 h-4 rounded-full ${['bg-red-500','bg-blue-500','bg-green-500','bg-yellow-500'][idx]}`;
      tile.appendChild(dot);
    }
  });
}

// Load from URL
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  if (params.has('config')) {
    startGame(params.get('config'));
  } else {
    generateTileEditor();
  }
});
