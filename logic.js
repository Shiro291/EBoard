let currentConfig = {};
const scoreMap = {1: 5, 2: 10, 3: 15};

// Generate tile editor UI
function generateTileEditor() {
  const count = parseInt(document.getElementById('tile-count').value);
  if (count < 5) return alert("Minimal 5 tile");
  
  const editor = document.getElementById('config-form');
  editor.innerHTML = `
    <h1 class="text-3xl font-bold mb-6">Custom Game Board Builder</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <label>Jumlah Tile (5-100):
        <input type="number" id="tile-count" class="w-full border p-2" min="5" max="100" value="${count}">
      </label>
      <label>Sisi Dadu (1-12):
        <input type="number" id="dice-sides" class="w-full border p-2" min="1" max="12" value="6">
      </label>
      <label><input type="checkbox" id="randomize" class="mr-2"> Acak Urutan</label>
      <label><input type="checkbox" id="punishment" class="mr-2"> Mode Hukuman</label>
    </div>
    <hr class="my-4">
    <div id="tile-editor" class="space-y-4"></div>
    <button onclick="generateGameLink()" class="mt-6 bg-green-500 text-white px-4 py-2 rounded">Buat Link Permainan</button>
  `;
  
  currentConfig.tiles = [];
  const tileEditor = document.getElementById('tile-editor');
  
  for (let i = 0; i < count; i++) {
    const isStart = i === 0;
    const isFinish = i === count - 1;

    const tileDiv = document.createElement('div');
    tileDiv.className = 'tile-config';
    tileDiv.dataset.index = i;
    tileDiv.innerHTML = `
      <h3 class="font-bold">Tile ${i + 1} ${isStart ? '(Start)' : isFinish ? '(Finish)' : ''}</h3>
      <select class="type-select" ${isStart || isFinish ? 'disabled' : ''}>
        <option value="start" ${isStart ? 'selected' : ''}>Start</option>
        <option value="finish" ${isFinish ? 'selected' : ''}>Finish</option>
        <option value="quiz">Quiz</option>
        <option value="info">Info</option>
        <option value="reward">Hadiah</option>
      </select>
      <div class="tile-details mt-2"></div>
    `;
    
    const typeSelect = tileDiv.querySelector('.type-select');
    typeSelect.addEventListener('change', () => updateTileFields(tileDiv, typeSelect.value));
    updateTileFields(tileDiv, typeSelect.value);
    
    tileEditor.appendChild(tileDiv);
    currentConfig.tiles.push(getDefaultTile(i, count));
  }
}

// Get default tile
function getDefaultTile(index, total) {
  if (index === 0) return { 
    type: 'start', 
    icon: '🏁',
    color: 'bg-green-custom'
  };
  if (index === total - 1) return { 
    type: 'finish', 
    icon: '🏆',
    color: 'bg-red-custom'
  };
  return { 
    type: 'quiz', 
    level: 1,
    question: '', 
    options: [], 
    icon: '💡',
    color: 'bg-yellow-custom',
    imageUrl: ''
  };
}

// Update tile fields based on type
function updateTileFields(tileDiv, type) {
  const container = tileDiv.querySelector('.tile-details');
  container.innerHTML = '';
  
  const index = parseInt(tileDiv.dataset.index);
  const tile = currentConfig.tiles[index];

  switch(type) {
    case 'quiz':
      container.innerHTML = `
        <label>Pertanyaan:<br>
          <input type="text" class="question-input w-full mb-2 p-2 border" value="${tile.question || ''}">
        </label>
        <label>Level:
          <select class="level-select ml-2">
            <option value="1" ${tile.level === 1 ? 'selected' : ''}>Level 1 (5 poin)</option>
            <option value="2" ${tile.level === 2 ? 'selected' : ''}>Level 2 (10 poin)</option>
            <option value="3" ${tile.level === 3 ? 'selected' : ''}>Level 3 (15 poin)</option>
          </select>
        </label>
        <label>Upload Gambar:<br>
          <input type="file" class="image-upload w-full mb-2 p-2 border" accept="image/*">
        </label>
        <label>Icon (emoji atau Unicode):<br>
          <input type="text" class="icon-input w-full mb-2 p-2 border" value="${tile.icon || ''}" placeholder="💡 / U+1F4A1">
        </label>
        <label>Warna Tile:
          <select class="color-select ml-2 w-full">
            <option value="bg-yellow-custom" ${tile.color === 'bg-yellow-custom' ? 'selected' : ''}>Kuning</option>
            <option value="bg-blue-custom" ${tile.color === 'bg-blue-custom' ? 'selected' : ''}>Biru</option>
            <option value="bg-purple-custom" ${tile.color === 'bg-purple-custom' ? 'selected' : ''}>Ungu</option>
            <option value="bg-green-custom" ${tile.color === 'bg-green-custom' ? 'selected' : ''}>Hijau</option>
            <option value="bg-red-custom" ${tile.color === 'bg-red-custom' ? 'selected' : ''}>Merah</option>
          </select>
        </label>
        <div class="options-container mt-2">
          ${(tile.options || []).map((opt, i) => `
            <div class="flex items-center mb-1">
              <input type="text" class="option-text flex-1 p-1 border" value="${opt.text || ''}" placeholder="Opsi ${i+1}">
              <input type="file" class="ml-1 option-img-upload w-20 p-1 border" accept="image/*">
              <input type="checkbox" class="ml-2 is-correct" ${opt.correct ? 'checked' : ''}>
            </div>
          `).join('')}
        </div>
        <button type="button" onclick="addOption(this)" class="text-xs mt-1 underline">+ Tambah Opsi</button>
      `;
      
      // Image upload handler
      container.querySelector('.image-upload')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => tile.imageUrl = reader.result;
          reader.readAsDataURL(file);
        }
      });
      break;

    case 'info':
      container.innerHTML = `
        <label>Isi Informasi:<br>
          <textarea class="info-input w-full p-2 border">${tile.content || ''}</textarea>
        </label>
        <label>Upload Gambar:<br>
          <input type="file" class="image-upload w-full p-2 border" accept="image/*">
        </label>
        <label>Icon (emoji atau Unicode):<br>
          <input type="text" class="icon-input w-full mb-2 p-2 border" value="${tile.icon || ''}" placeholder="ℹ️ / U+2139">
        </label>
        <label>Warna Tile:
          <select class="color-select ml-2 w-full">
            <option value="bg-blue-custom" ${tile.color === 'bg-blue-custom' ? 'selected' : ''}>Biru</option>
            <option value="bg-yellow-custom" ${tile.color === 'bg-yellow-custom' ? 'selected' : ''}>Kuning</option>
            <option value="bg-purple-custom" ${tile.color === 'bg-purple-custom' ? 'selected' : ''}>Ungu</option>
          </select>
        </label>
      `;
      
      container.querySelector('.image-upload')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => tile.imageUrl = reader.result;
          reader.readAsDataURL(file);
        }
      });
      break;

    case 'reward':
      container.innerHTML = `
        <label>Poin Hadiah:<br>
          <input type="number" class="reward-input w-full p-2 border" value="${tile.points || 10}">
        </label>
        <label>Upload Gambar:<br>
          <input type="file" class="image-upload w-full p-2 border" accept="image/*">
        </label>
        <label>Icon (emoji atau Unicode):<br>
          <input type="text" class="icon-input w-full mb-2 p-2 border" value="${tile.icon || ''}" placeholder="⭐ / U+2B50">
        </label>
        <label>Warna Tile:
          <select class="color-select ml-2 w-full">
            <option value="bg-purple-custom" ${tile.color === 'bg-purple-custom' ? 'selected' : ''}>Ungu</option>
            <option value="bg-yellow-custom" ${tile.color === 'bg-yellow-custom' ? 'selected' : ''}>Kuning</option>
            <option value="bg-blue-custom" ${tile.color === 'bg-blue-custom' ? 'selected' : ''}>Biru</option>
          </select>
        </label>
      `;
      
      container.querySelector('.image-upload')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => tile.imageUrl = reader.result;
          reader.readAsDataURL(file);
        }
      });
      break;
  }

  // Common fields for all tile types
  const iconInput = container.querySelector('.icon-input');
  if (iconInput) iconInput.addEventListener('input', (e) => {
    tile.icon = e.target.value;
  });

  const colorSelect = container.querySelector('.color-select');
  if (colorSelect) colorSelect.addEventListener('change', (e) => {
    tile.color = e.target.value;
  });
}

// Add option row
function addOption(btn) {
  const container = btn.parentElement.querySelector('.options-container');
  container.innerHTML += `
    <div class="flex items-center mb-1">
      <input type="text" class="option-text flex-1 p-1 border" placeholder="Opsi baru">
      <input type="file" class="ml-1 option-img-upload w-20 p-1 border" accept="image/*">
      <input type="checkbox" class="ml-2 is-correct">
    </div>`;
}

// Collect all tile data
function collectTileData() {
  document.querySelectorAll('.tile-config').forEach(tileDiv => {
    const index = parseInt(tileDiv.dataset.index);
    const type = tileDiv.querySelector('.type-select').value;
    const tile = currentConfig.tiles[index];
    tile.type = type;

    if (type === 'quiz') {
      tile.question = tileDiv.querySelector('.question-input')?.value || '';
      tile.level = parseInt(tileDiv.querySelector('.level-select')?.value || '1');
      tile.options = Array.from(tileDiv.querySelectorAll('.option-text')).map((input, i) => ({
        text: input.value,
        imageUrl: tileDiv.querySelectorAll('.option-img-upload')[i].dataset.image || '',
        correct: tileDiv.querySelectorAll('.is-correct')[i].checked
      }));
    }

    if (type === 'info') {
      tile.content = tileDiv.querySelector('.info-input')?.value || '';
    }

    if (type === 'reward') {
      tile.points = parseInt(tileDiv.querySelector('.reward-input')?.value || '10');
    }
  });
}

// Generate shareable link
function generateGameLink() {
  collectTileData();
  currentConfig.randomize = document.getElementById('randomize').checked;
  currentConfig.punishment = document.getElementById('punishment').checked;
  currentConfig.diceSides = parseInt(document.getElementById('dice-sides').value) || 6;

  const encoded = btoa(JSON.stringify(currentConfig));
  const url = `${window.location.origin}${window.location.pathname}?config=${encoded}`;
  navigator.clipboard.writeText(url).then(() => {
    alert('Link disalin ke clipboard!');
  });
}
