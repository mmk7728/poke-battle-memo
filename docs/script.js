// ポケモンデータ構造
class Pokemon {
    constructor() {
        this.name = '';
        this.ability = '';
        this.item = '';
        this.moves = ['', '', '', ''];
        this.terasType = '';
        this.notes = '';
        this.selected = false;
        this.lead = false;
    }
}

// パーティ管理クラス
class PartyApp {
    constructor() {
        this.party = Array(6).fill().map(() => new Pokemon());
        this.savedParties = [];
        this.containerElement = document.getElementById('partyFormContainer');
        this.partyNameInput = document.getElementById('partyNameInput');
        this.winCheckbox = document.getElementById('winCheckbox');
        this.lossCheckbox = document.getElementById('lossCheckbox');
        this.remarksInput = document.getElementById('remarksInput');
        this.saveBtn = document.getElementById('saveBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.csvFileInput = document.getElementById('csvFileInput');
        this.savedPartiesSection = document.getElementById('savedPartiesSection');
        this.savedPartiesList = document.getElementById('savedPartiesList');

        this.init();
    }

    init() {
        this.loadSavedParties();
        this.renderForm();
        this.attachEventListeners();
    }

    renderForm() {
        this.containerElement.innerHTML = '';
        
        for (let i = 0; i < 6; i++) {
            const card = this.createPokemonCard(i);
            this.containerElement.appendChild(card);
        }
    }

    createPokemonCard(index) {
        const pokemon = this.party[index];
        const card = document.createElement('div');
        card.className = `pokemon-card ${pokemon.selected ? 'selected' : ''}`;
        card.id = `pokemon-card-${index}`;

        card.innerHTML = `
            <div class="pokemon-number" data-index="${index}">
                <div class="number-and-name">
                    <strong>#${index + 1}</strong>
                    <input type="text" id="name-${index}" class="name-input" placeholder="例：ピカチュウ" value="${pokemon.name}">
                </div>
                <div class="header-controls">
                    <label class="small-check"><input type="checkbox" id="selected-${index}" ${pokemon.selected ? 'checked' : ''}> 選出</label>
                    <label class="small-check"><input type="checkbox" id="lead-${index}" ${pokemon.lead ? 'checked' : ''}> 先発</label>
                    <span class="pokemon-toggle-icon collapsed">▼</span>
                </div>
            </div>

            <div class="pokemon-details collapsed">
                <div class="form-group">
                    <label for="ability-${index}">特性</label>
                    <input 
                        type="text" 
                        id="ability-${index}" 
                        placeholder="例：静電気" 
                        value="${pokemon.ability}"
                    >
                </div>

                <div class="form-group">
                    <label for="item-${index}">持ち物</label>
                    <input 
                        type="text" 
                        id="item-${index}" 
                        placeholder="例：こだわりスカーフ" 
                        value="${pokemon.item}"
                    >
                </div>

                <div class="form-group">
                    <label>技</label>
                    <div class="moves-group">
                        <div class="form-group" style="margin-bottom: 0;">
                            <input 
                                type="text" 
                                id="move1-${index}" 
                                placeholder="技1" 
                                value="${pokemon.moves[0]}"
                            >
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <input 
                                type="text" 
                                id="move2-${index}" 
                                placeholder="技2" 
                                value="${pokemon.moves[1]}"
                            >
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <input 
                                type="text" 
                                id="move3-${index}" 
                                placeholder="技3" 
                                value="${pokemon.moves[2]}"
                            >
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <input 
                                type="text" 
                                id="move4-${index}" 
                                placeholder="技4" 
                                value="${pokemon.moves[3]}"
                            >
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="teras-${index}">テラスタイプ</label>
                    <select id="teras-${index}">
                        <option value="">選択してください</option>
                        <option value="ノーマル" ${pokemon.terasType === 'ノーマル' ? 'selected' : ''}>ノーマル</option>
                        <option value="ほのお" ${pokemon.terasType === 'ほのお' ? 'selected' : ''}>ほのお</option>
                        <option value="みず" ${pokemon.terasType === 'みず' ? 'selected' : ''}>みず</option>
                        <option value="でんき" ${pokemon.terasType === 'でんき' ? 'selected' : ''}>でんき</option>
                        <option value="くさ" ${pokemon.terasType === 'くさ' ? 'selected' : ''}>くさ</option>
                        <option value="こおり" ${pokemon.terasType === 'こおり' ? 'selected' : ''}>こおり</option>
                        <option value="かくとう" ${pokemon.terasType === 'かくとう' ? 'selected' : ''}>かくとう</option>
                        <option value="どく" ${pokemon.terasType === 'どく' ? 'selected' : ''}>どく</option>
                        <option value="じめん" ${pokemon.terasType === 'じめん' ? 'selected' : ''}>じめん</option>
                        <option value="ひこう" ${pokemon.terasType === 'ひこう' ? 'selected' : ''}>ひこう</option>
                        <option value="エスパー" ${pokemon.terasType === 'エスパー' ? 'selected' : ''}>エスパー</option>
                        <option value="むし" ${pokemon.terasType === 'むし' ? 'selected' : ''}>むし</option>
                        <option value="いわ" ${pokemon.terasType === 'いわ' ? 'selected' : ''}>いわ</option>
                        <option value="ゴースト" ${pokemon.terasType === 'ゴースト' ? 'selected' : ''}>ゴースト</option>
                        <option value="ドラゴン" ${pokemon.terasType === 'ドラゴン' ? 'selected' : ''}>ドラゴン</option>
                        <option value="あく" ${pokemon.terasType === 'あく' ? 'selected' : ''}>あく</option>
                        <option value="はがね" ${pokemon.terasType === 'はがね' ? 'selected' : ''}>はがね</option>
                        <option value="フェアリー" ${pokemon.terasType === 'フェアリー' ? 'selected' : ''}>フェアリー</option>
                        <option value="ステラ" ${pokemon.terasType === 'ステラ' ? 'selected' : ''}>ステラ</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="notes-${index}">その他（役割・対策など）</label>
                    <textarea 
                        id="notes-${index}" 
                        placeholder="例：物理受け, ステルスロック設定用 など"
                        rows="3"
                    >${pokemon.notes}</textarea>
                </div>
            </div>
        `;

        // イベントリスナーを付与
        this.attachCardListeners(card, index);
        return card;
    }

    attachCardListeners(card, index) {
        const titleElement = card.querySelector('.pokemon-number');
        const detailsElement = card.querySelector('.pokemon-details');
        const toggleIcon = card.querySelector('.pokemon-toggle-icon');
        
        const nameInput = card.querySelector(`#name-${index}`);
        const abilityInput = card.querySelector(`#ability-${index}`);
        const itemInput = card.querySelector(`#item-${index}`);
        const move1Input = card.querySelector(`#move1-${index}`);
        const move2Input = card.querySelector(`#move2-${index}`);
        const move3Input = card.querySelector(`#move3-${index}`);
        const move4Input = card.querySelector(`#move4-${index}`);
        const terasSelect = card.querySelector(`#teras-${index}`);
        const notesInput = card.querySelector(`#notes-${index}`);
        const selectedCheckbox = card.querySelector(`#selected-${index}`);
        const leadCheckbox = card.querySelector(`#lead-${index}`);

        // アコーディオン機能
        titleElement.addEventListener('click', (e) => {
            // クリックがヘッダ内の入力要素から来た場合は無視
            detailsElement.classList.toggle('collapsed');
            toggleIcon.classList.toggle('collapsed');
        });

        // 入力値をpartyに反映
        const updateParty = () => {
            this.party[index].name = nameInput.value;
            this.party[index].ability = abilityInput.value;
            this.party[index].item = itemInput.value;
            this.party[index].moves = [
                move1Input.value,
                move2Input.value,
                move3Input.value,
                move4Input.value
            ];
            this.party[index].terasType = terasSelect.value;
            this.party[index].notes = notesInput.value;
            this.party[index].selected = selectedCheckbox.checked;
            this.party[index].lead = leadCheckbox.checked;

            // 選出状態でカードの見た目を変更
            if (selectedCheckbox.checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        };

        nameInput.addEventListener('input', updateParty);
        nameInput.addEventListener('click', (e) => e.stopPropagation());
        abilityInput.addEventListener('input', updateParty);
        itemInput.addEventListener('input', updateParty);
        move1Input.addEventListener('input', updateParty);
        move2Input.addEventListener('input', updateParty);
        move3Input.addEventListener('input', updateParty);
        move4Input.addEventListener('input', updateParty);
        terasSelect.addEventListener('change', updateParty);
        notesInput.addEventListener('input', updateParty);
        selectedCheckbox.addEventListener('click', (e) => { e.stopPropagation(); updateParty(); });
        if (leadCheckbox) {
            leadCheckbox.addEventListener('click', (e) => { e.stopPropagation(); updateParty(); });
        }
    }

    attachEventListeners() {
        this.saveBtn.addEventListener('click', () => this.saveParty());
        this.resetBtn.addEventListener('click', () => this.resetForm());
        this.clearAllBtn.addEventListener('click', () => this.clearAllParties());
        this.exportBtn.addEventListener('click', () => this.exportToCSV());
        this.importBtn.addEventListener('click', () => this.csvFileInput.click());
        this.csvFileInput.addEventListener('change', (e) => this.importFromCSV(e));
        if (this.winCheckbox && this.lossCheckbox) {
            this.winCheckbox.addEventListener('change', () => {
                if (this.winCheckbox.checked) this.lossCheckbox.checked = false;
            });
            this.lossCheckbox.addEventListener('change', () => {
                if (this.lossCheckbox.checked) this.winCheckbox.checked = false;
            });
        }
    }

    saveParty() {
        this.collectFormData();

        const partyName = this.partyNameInput.value.trim();
        if (!partyName) {
            alert('パーティの名前を入力してください');
            this.partyNameInput.focus();
            return;
        }

        const result = (this.winCheckbox && this.winCheckbox.checked) ? '勝' : ((this.lossCheckbox && this.lossCheckbox.checked) ? '敗' : '');
        const remarks = (this.remarksInput && this.remarksInput.value) ? this.remarksInput.value.trim() : '';

        const savedParty = {
            id: Date.now(),
            name: partyName,
            party: JSON.parse(JSON.stringify(this.party)),
            timestamp: new Date().toLocaleString('ja-JP'),
            result: result,
            remarks: remarks
        };

        this.savedParties.unshift(savedParty);
        this.saveToStorage();
        this.renderSavedParties();

        alert('パーティを保存しました！');
        
        // 保存後にリセット
        this.partyNameInput.value = '';
        if (this.winCheckbox) this.winCheckbox.checked = false;
        if (this.lossCheckbox) this.lossCheckbox.checked = false;
        if (this.remarksInput) this.remarksInput.value = '';
        this.resetForm();
    }

    collectFormData() {
        for (let i = 0; i < 6; i++) {
            const nameInput = document.querySelector(`#name-${i}`);
            const abilityInput = document.querySelector(`#ability-${i}`);
            const itemInput = document.querySelector(`#item-${i}`);
            
            if (nameInput) {
                this.party[i].name = nameInput.value;
                this.party[i].ability = abilityInput.value;
                this.party[i].item = itemInput.value;
                this.party[i].moves = [
                    document.querySelector(`#move1-${i}`).value,
                    document.querySelector(`#move2-${i}`).value,
                    document.querySelector(`#move3-${i}`).value,
                    document.querySelector(`#move4-${i}`).value
                ];
                this.party[i].terasType = document.querySelector(`#teras-${i}`).value;
                this.party[i].notes = document.querySelector(`#notes-${i}`).value;
                this.party[i].selected = document.querySelector(`#selected-${i}`).checked;
                const leadEl = document.querySelector(`#lead-${i}`);
                this.party[i].lead = leadEl ? leadEl.checked : false;
            }
        }
    }

    resetForm() {
        this.party = Array(6).fill().map(() => new Pokemon());
        this.renderForm();
        if (this.winCheckbox) this.winCheckbox.checked = false;
        if (this.lossCheckbox) this.lossCheckbox.checked = false;
        if (this.remarksInput) this.remarksInput.value = '';
    }

    clearAllParties() {
        if (confirm('保存されたすべてのパーティを削除しますか？')) {
            this.savedParties = [];
            this.saveToStorage();
            this.renderSavedParties();
            alert('すべてのパーティを削除しました。');
        }
    }

    loadParty(id) {
        const party = this.savedParties.find(p => p.id === id);
        if (!party) return;

        this.party = JSON.parse(JSON.stringify(party.party));
        this.partyNameInput.value = party.name || '';
        if (this.winCheckbox) this.winCheckbox.checked = (party.result === '勝');
        if (this.lossCheckbox) this.lossCheckbox.checked = (party.result === '敗');
        if (this.remarksInput) this.remarksInput.value = party.remarks || '';
        this.renderForm();
        window.scrollTo(0, 0);
    }

    deleteParty(id) {
        if (confirm('このパーティを削除しますか？')) {
            this.savedParties = this.savedParties.filter(p => p.id !== id);
            this.saveToStorage();
            this.renderSavedParties();
        }
    }

    renderSavedParties() {
        if (this.savedParties.length === 0) {
            this.savedPartiesSection.style.display = 'none';
            return;
        }

        this.savedPartiesSection.style.display = 'block';
        this.savedPartiesList.innerHTML = '';

        this.savedParties.forEach(savedParty => {
            const item = document.createElement('div');
            item.className = 'saved-party-item';

            const selectedCount = savedParty.party.filter(p => p.selected).length;
            const memberNames = savedParty.party.map(p => p.name).filter(n => n).join('、') || 'メンバなし';

            item.innerHTML = `
                <div class="saved-party-item-name">
                    <h3>${this.escapeHtml(savedParty.name)}</h3>
                    <p class="saved-party-item-time">
                        ${savedParty.timestamp} ${savedParty.result ? '| ' + this.escapeHtml(savedParty.result) : ''} | ${memberNames}
                    </p>
                    ${savedParty.remarks ? `<p class="saved-party-remarks">${this.escapeHtml(savedParty.remarks)}</p>` : ''}
                </div>
                <div class="saved-party-buttons">
                    <button class="btn btn-small btn-load">読込</button>
                    <button class="btn btn-small btn-delete">削除</button>
                </div>
            `;

            const loadBtn = item.querySelector('.btn-load');
            const deleteBtn = item.querySelector('.btn-delete');

            loadBtn.addEventListener('click', () => this.loadParty(savedParty.id));
            deleteBtn.addEventListener('click', () => this.deleteParty(savedParty.id));

            this.savedPartiesList.appendChild(item);
        });
    }

    exportToCSV() {
        this.collectFormData();

        let csv = 'パーティ名,ポケモン番号,ポケモン名,特性,持ち物,技1,技2,技3,技4,テラスタイプ,その他,選出有無,勝敗,備考\n';

        this.savedParties.forEach(party => {
            party.party.forEach((pokemon, index) => {
                const selected = pokemon.selected ? '○' : '';
                const row = [
                    party.name,
                    index + 1,
                    pokemon.name,
                    pokemon.ability,
                    pokemon.item,
                    pokemon.moves[0],
                    pokemon.moves[1],
                    pokemon.moves[2],
                    pokemon.moves[3],
                    pokemon.terasType,
                    pokemon.notes.replace(/\n/g, ' '),
                    selected,
                    party.result || '',
                    (party.remarks || '').replace(/\n/g, ' ')
                ];
                csv += row.map(cell => `"${cell}"`).join(',') + '\n';
            });
        });

        // ダウンロード処理
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `pokemon-parties-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert('CSVをダウンロードしました！');
    }

    importFromCSV(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.trim().split('\n');
                
                if (lines.length < 2) {
                    alert('有効なCSVファイルではありません');
                    return;
                }

                // ヘッダーをスキップ
                const currentParties = new Map();

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i];
                    // CSVパース（ダブルクオート対応）
                    const cells = [];
                    let current = '';
                    let inQuotes = false;
                    
                    for (let j = 0; j < line.length; j++) {
                        const char = line[j];
                        if (char === '"') {
                            inQuotes = !inQuotes;
                        } else if (char === ',' && !inQuotes) {
                            cells.push(current);
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    cells.push(current);

                    if (cells.length < 12) continue;

                    const partyName = cells[0] || `パーティ${i}`;
                    const pokemonIndex = parseInt(cells[1]) - 1;
                    
                    if (pokemonIndex < 0 || pokemonIndex >= 6) continue;

                    if (!currentParties.has(partyName)) {
                        currentParties.set(partyName, {
                            party: Array(6).fill().map(() => new Pokemon()),
                            result: '',
                            remarks: ''
                        });
                    }

                    const partyObj = currentParties.get(partyName);
                    partyObj.party[pokemonIndex] = new Pokemon();
                    partyObj.party[pokemonIndex].name = cells[2];
                    partyObj.party[pokemonIndex].ability = cells[3];
                    partyObj.party[pokemonIndex].item = cells[4];
                    partyObj.party[pokemonIndex].moves = [cells[5], cells[6], cells[7], cells[8]];
                    partyObj.party[pokemonIndex].terasType = cells[9];
                    partyObj.party[pokemonIndex].notes = cells[10];
                    partyObj.party[pokemonIndex].selected = cells[11] === '○';
                    // optional party-level columns
                    if (cells.length > 12) {
                        partyObj.result = cells[12] || partyObj.result;
                    }
                    if (cells.length > 13) {
                        partyObj.remarks = cells[13] || partyObj.remarks;
                    }
                }

                // パーティを追加
                currentParties.forEach((value, name) => {
                    const savedParty = {
                        id: Date.now() + Math.random(),
                        name: name,
                        party: value.party,
                        timestamp: new Date().toLocaleString('ja-JP'),
                        result: value.result || '',
                        remarks: value.remarks || ''
                    };
                    this.savedParties.unshift(savedParty);
                });

                this.saveToStorage();
                this.renderSavedParties();
                alert(`${currentParties.size}個のパーティをインポートしました！`);

            } catch (error) {
                console.error('CSVインポートエラー:', error);
                alert('CSVファイルの読み込み中にエラーが発生しました');
            }
        };
        reader.readAsText(file);

        // 次回のために入力をリセット
        this.csvFileInput.value = '';
    }

    saveToStorage() {
        localStorage.setItem('savedParties', JSON.stringify(this.savedParties));
    }

    loadSavedParties() {
        const data = localStorage.getItem('savedParties');
        this.savedParties = data ? JSON.parse(data) : [];
        this.renderSavedParties();
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, char => map[char]);
    }
}

// アプリケーション開始
document.addEventListener('DOMContentLoaded', () => {
    new PartyApp();
});
