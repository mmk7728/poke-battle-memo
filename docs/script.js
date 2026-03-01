// ポケモンデータ構造
class Pokemon {
  constructor() {
    this.name = "";
    this.ability = "";
    this.item = "";
    this.moves = ["", "", "", ""];
    this.terasType = "";
    this.notes = "";
    this.selected = false;
    this.lead = false;
    this.actualSpeed = 0; // 実数値の素早さ
  }
}

// パーティ管理クラス - 独立した自分と相手のパーティを管理
class PartyApp {
  constructor() {
    // 自分と相手のパーティを分離
    this.ownParty = Array(6)
      .fill()
      .map(() => new Pokemon());
    this.opponentParty = Array(6)
      .fill()
      .map(() => new Pokemon());
    this.currentPartyMode = "own";
    this.battleOrder = []; // 対戦時の順番を保存

    this.savedOwnParties = [];
    this.savedOpponentParties = [];

    // タッチドラッグ用の状態管理
    this.touchDragState = {
      isDragging: false,
      dragElement: null,
      startY: 0,
      currentY: 0,
    };

    // DOM - 自分のパーティ
    this.ownFormContainer = document.getElementById("ownPartyFormContainer");
    this.ownNameInput = document.getElementById("ownPartyNameInput");
    this.ownRemarksInput = document.getElementById("ownRemarksInput");
    this.ownSaveBtn = document.getElementById("ownSaveBtn");
    this.ownResetBtn = document.getElementById("ownResetBtn");
    this.ownClearBtn = document.getElementById("ownClearAllBtn");
    this.ownExportBtn = document.getElementById("ownExportBtn");
    this.ownImportBtn = document.getElementById("ownImportBtn");
    this.ownCsvInput = document.getElementById("ownCsvFileInput");

    // DOM - 相手のパーティ
    this.oppFormContainer = document.getElementById(
      "opponentPartyFormContainer",
    );
    this.oppNameInput = document.getElementById("opponentPartyNameInput");
    this.oppWinCheckbox = document.getElementById("oppWinCheckbox");
    this.oppLossCheckbox = document.getElementById("oppLossCheckbox");
    this.oppRemarksInput = document.getElementById("opponentRemarksInput");
    this.oppSaveBtn = document.getElementById("opponentSaveBtn");
    this.oppResetBtn = document.getElementById("opponentResetBtn");
    this.oppClearBtn = document.getElementById("opponentClearAllBtn");
    this.oppExportBtn = document.getElementById("oppExportBtn");
    this.oppImportBtn = document.getElementById("oppImportBtn");
    this.oppCsvInput = document.getElementById("oppCsvFileInput");

    // DOM - 対戦中
    this.battleBtn = document.getElementById("initBattleBtn");
    this.speedContainer = document.getElementById("speedOrderContainer");

    // DOM - 保存済み
    this.savedSection = document.getElementById("savedPartiesSection");
    this.ownSavedList = document.getElementById("ownSavedPartiesList");
    this.oppSavedList = document.getElementById("opponentSavedPartiesList");

    this.init();
  }

  init() {
    this.loadSavedParties();
    this.renderForms();
    this.attachTabListeners();
    this.attachEventListeners();
  }

  // タッチドラッグアンドドロップのセットアップ
  setupTouchDragDrop(element, container, options = {}) {
    const {
      onDragStart = () => {},
      onDragEnd = () => {},
      getPosition = (el) => el.parentNode.children.indexOf(el),
    } = options;

    element.addEventListener(
      "touchstart",
      (e) => {
        this.touchDragState.isDragging = true;
        this.touchDragState.dragElement = element;
        this.touchDragState.startY = e.touches[0].clientY;
        element.classList.add("dragging");
        onDragStart();
      },
      { passive: false },
    );

    element.addEventListener(
      "touchmove",
      (e) => {
        if (!this.touchDragState.isDragging) return;
        e.preventDefault();

        this.touchDragState.currentY = e.touches[0].clientY;
        const allElements = Array.from(
          container.querySelectorAll(`.${element.className.split(" ")[0]}`),
        );
        const draggedIdx = getPosition(element);

        allElements.forEach((el) => {
          if (el === element) return;

          const elRect = el.getBoundingClientRect();
          const elMidpoint = elRect.top + elRect.height / 2;
          const touchY = e.touches[0].clientY;

          if (draggedIdx < getPosition(el)) {
            // ドラッグ要素が上にあり、下へ移動
            if (touchY > elMidpoint) {
              container.insertBefore(element, el.nextSibling);
            }
          } else {
            // ドラッグ要素が下にあり、上へ移動
            if (touchY < elMidpoint) {
              container.insertBefore(element, el);
            }
          }
        });
      },
      { passive: false },
    );

    element.addEventListener(
      "touchend",
      (e) => {
        if (!this.touchDragState.isDragging) return;

        this.touchDragState.isDragging = false;
        element.classList.remove("dragging");
        container.querySelectorAll(".drag-over").forEach((el) => {
          el.classList.remove("drag-over");
        });
        onDragEnd();
      },
      { passive: false },
    );
  }

  // タブ切り替え
  attachTabListeners() {
    document.querySelectorAll(".tab-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        document
          .querySelectorAll(".tab-button")
          .forEach((b) => b.classList.remove("active"));
        document
          .querySelectorAll(".tab-content")
          .forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        const id = tab === "own" ? "ownPartyTab" : "opponentPartyTab";
        document.getElementById(id).classList.add("active");
      });
    });

    document.querySelectorAll(".saved-tab-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        document
          .querySelectorAll(".saved-tab-button")
          .forEach((b) => b.classList.remove("active"));
        document
          .querySelectorAll(".saved-tab-content")
          .forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        const id =
          tab === "own-saved"
            ? "ownSavedPartiesTab"
            : "opponentSavedPartiesTab";
        document.getElementById(id).classList.add("active");
      });
    });
  }

  renderForms() {
    this.renderOwnForm();
    this.renderOppForm();
  }

  renderOwnForm() {
    this.ownFormContainer.innerHTML = "";
    this.ownFormContainer.className = "party-form-container own-party";
    for (let i = 0; i < 6; i++) {
      this.ownFormContainer.appendChild(this.createCard(i, "own"));
    }
  }

  renderOppForm() {
    this.oppFormContainer.innerHTML = "";
    this.oppFormContainer.className = "party-form-container opponent-party";
    for (let i = 0; i < 6; i++) {
      this.oppFormContainer.appendChild(this.createCard(i, "opponent"));
    }
  }

  createCard(index, type) {
    const party = type === "own" ? this.ownParty : this.opponentParty;
    const poke = party[index];
    const card = document.createElement("div");
    card.className = `pokemon-card ${poke.selected ? "selected" : ""}`;
    card.id = `card-${type}-${index}`;

    card.innerHTML = `
            <div class="pokemon-number">
                <div class="number-and-name">
                    <strong>#${index + 1}</strong>
                    <input type="text" id="name-${type}-${index}" class="name-input" placeholder="ポケモン名" value="${poke.name}">
                </div>
                <div class="header-controls">
                    <label class="small-check"><input type="checkbox" id="sel-${type}-${index}" ${poke.selected ? "checked" : ""}> 選出</label>
                    <label class="small-check"><input type="checkbox" id="lead-${type}-${index}" ${poke.lead ? "checked" : ""} ${!poke.selected ? "disabled" : ""}> 先発</label>
                    <span class="pokemon-toggle-icon collapsed">▼</span>
                </div>
            </div>
            <div class="pokemon-details collapsed">
                <div class="form-group">
                    <label>特性</label>
                    <input type="text" id="abil-${type}-${index}" placeholder="特性" value="${poke.ability}">
                </div>
                <div class="form-group">
                    <label>持ち物</label>
                    <input type="text" id="item-${type}-${index}" placeholder="持ち物" value="${poke.item}">
                </div>
                <div class="form-group">
                    <label>素早さ(実数値)</label>
                    <input type="number" id="speed-${type}-${index}" placeholder="0" value="${poke.actualSpeed}">
                </div>
                <div class="form-group">
                    <label>技</label>
                    <div class="moves-group">
                        ${[0, 1, 2, 3].map((m) => `<div class="form-group" style="margin-bottom:0"><input type="text" id="move${m + 1}-${type}-${index}" placeholder="技${m + 1}" value="${poke.moves[m]}"></div>`).join("")}
                    </div>
                </div>
                <div class="form-group">
                    <label>テラスタイプ</label>
                    <select id="teras-${type}-${index}">
                        <option value="">選択</option>
                        <option value="ノーマル" ${poke.terasType === "ノーマル" ? "selected" : ""}>ノーマル</option>
                        <option value="ほのお" ${poke.terasType === "ほのお" ? "selected" : ""}>ほのお</option>
                        <option value="みず" ${poke.terasType === "みず" ? "selected" : ""}>みず</option>
                        <option value="でんき" ${poke.terasType === "でんき" ? "selected" : ""}>でんき</option>
                        <option value="くさ" ${poke.terasType === "くさ" ? "selected" : ""}>くさ</option>
                        <option value="こおり" ${poke.terasType === "こおり" ? "selected" : ""}>こおり</option>
                        <option value="かくとう" ${poke.terasType === "かくとう" ? "selected" : ""}>かくとう</option>
                        <option value="どく" ${poke.terasType === "どく" ? "selected" : ""}>どく</option>
                        <option value="じめん" ${poke.terasType === "じめん" ? "selected" : ""}>じめん</option>
                        <option value="ひこう" ${poke.terasType === "ひこう" ? "selected" : ""}>ひこう</option>
                        <option value="エスパー" ${poke.terasType === "エスパー" ? "selected" : ""}>エスパー</option>
                        <option value="むし" ${poke.terasType === "むし" ? "selected" : ""}>むし</option>
                        <option value="いわ" ${poke.terasType === "いわ" ? "selected" : ""}>いわ</option>
                        <option value="ゴースト" ${poke.terasType === "ゴースト" ? "selected" : ""}>ゴースト</option>
                        <option value="ドラゴン" ${poke.terasType === "ドラゴン" ? "selected" : ""}>ドラゴン</option>
                        <option value="あく" ${poke.terasType === "あく" ? "selected" : ""}>あく</option>
                        <option value="はがね" ${poke.terasType === "はがね" ? "selected" : ""}>はがね</option>
                        <option value="フェアリー" ${poke.terasType === "フェアリー" ? "selected" : ""}>フェアリー</option>
                        <option value="ステラ" ${poke.terasType === "ステラ" ? "selected" : ""}>ステラ</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>その他</label>
                    <textarea id="note-${type}-${index}" placeholder="役割など" rows="3">${poke.notes}</textarea>
                </div>
            </div>
        `;

    // アコーディオン
    const header = card.querySelector(".pokemon-number");
    const details = card.querySelector(".pokemon-details");
    const icon = card.querySelector(".pokemon-toggle-icon");
    header.addEventListener("click", () => {
      details.classList.toggle("collapsed");
      icon.classList.toggle("collapsed");
    });

    // 入力監視
    const selCheckbox = card.querySelector(`#sel-${type}-${index}`);
    const leadCheckbox = card.querySelector(`#lead-${type}-${index}`);

    const updateParty = () => {
      poke.name = card.querySelector(`#name-${type}-${index}`).value;
      poke.ability = card.querySelector(`#abil-${type}-${index}`).value;
      poke.item = card.querySelector(`#item-${type}-${index}`).value;
      poke.moves = [0, 1, 2, 3].map(
        (m) => card.querySelector(`#move${m + 1}-${type}-${index}`).value,
      );
      poke.terasType = card.querySelector(`#teras-${type}-${index}`).value;
      poke.notes = card.querySelector(`#note-${type}-${index}`).value;
      poke.selected = selCheckbox.checked;
      poke.lead = leadCheckbox.checked;
      poke.actualSpeed =
        parseInt(card.querySelector(`#speed-${type}-${index}`).value) || 0;

      // 選出チェックが外れたら先発をdisableにする
      if (!poke.selected) {
        leadCheckbox.disabled = true;
        leadCheckbox.checked = false;
        poke.lead = false;
      } else {
        leadCheckbox.disabled = false;
      }

      card.classList.toggle("selected", poke.selected);
    };

    card.querySelectorAll("input, select, textarea").forEach((el) => {
      el.addEventListener("change", updateParty);
      el.addEventListener("input", updateParty);
      if (el.type !== "checkbox") {
        el.addEventListener("click", (e) => e.stopPropagation());
      } else {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          updateParty();
        });
      }
    });

    return card;
  }

  attachEventListeners() {
    // 自分のパーティ
    this.ownSaveBtn?.addEventListener("click", () => {
      this.collectData("own");
      this.savePartyData("own");
    });
    this.ownResetBtn?.addEventListener("click", () => this.resetParty("own"));
    this.ownClearBtn?.addEventListener("click", () => this.clearAllData("own"));
    this.ownExportBtn?.addEventListener("click", () => this.exportCSV("own"));
    this.ownImportBtn?.addEventListener("click", () =>
      this.ownCsvInput?.click(),
    );
    this.ownCsvInput?.addEventListener("change", (e) =>
      this.importCSV(e, "own"),
    );

    // 相手のパーティ
    this.oppSaveBtn?.addEventListener("click", () => {
      this.collectData("opponent");
      this.savePartyData("opponent");
    });
    this.oppResetBtn?.addEventListener("click", () =>
      this.resetParty("opponent"),
    );
    this.oppClearBtn?.addEventListener("click", () =>
      this.clearAllData("opponent"),
    );
    this.oppExportBtn?.addEventListener("click", () =>
      this.exportCSV("opponent"),
    );
    this.oppImportBtn?.addEventListener("click", () =>
      this.oppCsvInput?.click(),
    );
    this.oppCsvInput?.addEventListener("change", (e) =>
      this.importCSV(e, "opponent"),
    );

    if (this.oppWinCheckbox && this.oppLossCheckbox) {
      this.oppWinCheckbox.addEventListener("change", () => {
        if (this.oppWinCheckbox.checked) this.oppLossCheckbox.checked = false;
      });
      this.oppLossCheckbox.addEventListener("change", () => {
        if (this.oppLossCheckbox.checked) this.oppWinCheckbox.checked = false;
      });
    }

    // 対戦
    this.battleBtn?.addEventListener("click", () => this.startBattle());
  }

  collectData(type) {
    const party = type === "own" ? this.ownParty : this.opponentParty;
    for (let i = 0; i < 6; i++) {
      const el = document.querySelector(`#name-${type}-${i}`);
      if (el) {
        party[i].name = el.value;
        party[i].ability = document.querySelector(`#abil-${type}-${i}`).value;
        party[i].item = document.querySelector(`#item-${type}-${i}`).value;
        party[i].moves = [0, 1, 2, 3].map(
          (m) => document.querySelector(`#move${m + 1}-${type}-${i}`).value,
        );
        party[i].terasType = document.querySelector(
          `#teras-${type}-${i}`,
        ).value;
        party[i].notes = document.querySelector(`#note-${type}-${i}`).value;
        party[i].selected = document.querySelector(`#sel-${type}-${i}`).checked;
        party[i].lead = document.querySelector(`#lead-${type}-${i}`).checked;
        party[i].actualSpeed =
          parseInt(document.querySelector(`#speed-${type}-${i}`).value) || 0;
      }
    }
  }

  savePartyData(type) {
    const name =
      type === "own"
        ? this.ownNameInput?.value.trim()
        : this.oppNameInput?.value.trim();
    if (!name) {
      alert("パーティ名を入力してください");
      return;
    }

    let result = "";
    if (type === "opponent") {
      result = this.oppWinCheckbox?.checked
        ? "勝"
        : this.oppLossCheckbox?.checked
          ? "敗"
          : "";
    }

    const remarks =
      type === "own"
        ? this.ownRemarksInput?.value.trim()
        : this.oppRemarksInput?.value.trim();

    // 対戦順序を保存（相手パーティの場合、party-form-containerの実際の順序を保存）
    let battleOrder = [];
    if (type === "opponent") {
      const cards = this.oppFormContainer.querySelectorAll(".battle-pokemon");
      cards.forEach((card) => {
        // party-form-container に表示されているカードから情報を取得
        const name = card.querySelector(".battle-pokemon-name")?.value || "";
        const ability = card.querySelector(".battle-ability")?.value || "";
        const item = card.querySelector(".battle-item")?.value || "";
        const speed = parseInt(card.querySelector(".battle-speed")?.value) || 0;
        const moves = Array.from(card.querySelectorAll(".battle-move")).map(
          (m) => m.value,
        );
        const teras = card.querySelector(".battle-teras")?.value || "";
        const notes = card.querySelector(".battle-notes")?.value || "";
        const selected =
          card.querySelector(".battle-sel-check")?.checked || false;
        const lead = card.querySelector(".battle-lead-check")?.checked || false;

        // type 情報を取得（id から抽出：battle-card-{type}-{idx}）
        const cardId = card.id;
        const pokeType = cardId.includes("battle-card-own")
          ? "own"
          : "opponent";

        battleOrder.push({
          name,
          ability,
          item,
          actualSpeed: speed,
          moves,
          terasType: teras,
          notes,
          selected,
          lead,
          type: pokeType,
        });
      });
    }

    const saved = {
      id: Date.now(),
      name,
      party: JSON.parse(
        JSON.stringify(type === "own" ? this.ownParty : this.opponentParty),
      ),
      timestamp: new Date().toLocaleString("ja-JP"),
      result,
      remarks,
      battleOrder: battleOrder, // party-form-containerの順番を保存
    };

    if (type === "own") {
      this.savedOwnParties.unshift(saved);
    } else {
      this.savedOpponentParties.unshift(saved);
    }

    this.saveToStorage();
    this.renderSavedParties();
    alert("保存しました！");

    if (type === "own") {
      this.ownNameInput.value = "";
      if (this.ownRemarksInput) this.ownRemarksInput.value = "";
    } else {
      this.oppNameInput.value = "";
      if (this.oppWinCheckbox) this.oppWinCheckbox.checked = false;
      if (this.oppLossCheckbox) this.oppLossCheckbox.checked = false;
      if (this.oppRemarksInput) this.oppRemarksInput.value = "";
      this.resetParty("opponent");
      this.oppFormContainer.innerHTML = "";
      this.battleOrder = [];
    }
  }

  resetParty(type) {
    if (type === "own") {
      this.ownParty = Array(6)
        .fill()
        .map(() => new Pokemon());
      this.renderOwnForm();
    } else {
      this.opponentParty = Array(6)
        .fill()
        .map(() => new Pokemon());
      this.renderOppForm();
    }
  }

  clearAllData(type) {
    if (!confirm("すべて削除しますか？")) return;
    if (type === "own") {
      this.savedOwnParties = [];
    } else {
      this.savedOpponentParties = [];
    }
    this.saveToStorage();
    this.renderSavedParties();
    alert("削除しました！");
  }

  loadPartyData(id, type) {
    const list =
      type === "own" ? this.savedOwnParties : this.savedOpponentParties;
    const saved = list.find((p) => p.id === id);
    if (!saved) return;

    if (type === "own") {
      this.ownParty = JSON.parse(JSON.stringify(saved.party));
      this.ownNameInput.value = saved.name;
      if (this.ownRemarksInput)
        this.ownRemarksInput.value = saved.remarks || "";
      this.renderOwnForm();
    } else {
      this.opponentParty = JSON.parse(JSON.stringify(saved.party));
      this.oppNameInput.value = saved.name;
      if (this.oppWinCheckbox)
        this.oppWinCheckbox.checked = saved.result === "勝";
      if (this.oppLossCheckbox)
        this.oppLossCheckbox.checked = saved.result === "敗";
      if (this.oppRemarksInput)
        this.oppRemarksInput.value = saved.remarks || "";
      this.renderOppForm();
      if (saved.battleOrder && saved.battleOrder.length > 0) {
        this.renderBattleFormContainer(saved.battleOrder);
      }
    }
    window.scrollTo(0, 0);
  }

  deletePartyData(id, type) {
    if (!confirm("削除しますか？")) return;
    if (type === "own") {
      this.savedOwnParties = this.savedOwnParties.filter((p) => p.id !== id);
    } else {
      this.savedOpponentParties = this.savedOpponentParties.filter(
        (p) => p.id !== id,
      );
    }
    this.saveToStorage();
    this.renderSavedParties();
  }

  renderSavedParties() {
    if (
      this.savedOwnParties.length === 0 &&
      this.savedOpponentParties.length === 0
    ) {
      this.savedSection.style.display = "none";
      return;
    }
    this.savedSection.style.display = "block";

    // 自分のパーティ
    this.ownSavedList.innerHTML = "";
    this.savedOwnParties.forEach((saved) => {
      const div = document.createElement("div");
      div.className = "saved-party-item";
      div.innerHTML = `
                <div class="saved-party-item-name">
                    <h3>${this.escapeHtml(saved.name)}</h3>
                    <p class="saved-party-item-time">${saved.timestamp} ${saved.result ? "| " + saved.result : ""}</p>
                    ${saved.remarks ? `<p class="saved-party-remarks">${this.escapeHtml(saved.remarks)}</p>` : ""}
                </div>
                <div class="saved-party-buttons">
                    <button class="btn btn-small btn-load">読込</button>
                    <button class="btn btn-small btn-delete">削除</button>
                </div>
            `;
      div
        .querySelector(".btn-load")
        .addEventListener("click", () => this.loadPartyData(saved.id, "own"));
      div
        .querySelector(".btn-delete")
        .addEventListener("click", () => this.deletePartyData(saved.id, "own"));
      this.ownSavedList.appendChild(div);
    });

    // 相手のパーティ
    this.oppSavedList.innerHTML = "";
    this.savedOpponentParties.forEach((saved) => {
      const div = document.createElement("div");
      div.className = "saved-party-item";
      div.innerHTML = `
                <div class="saved-party-item-name">
                    <h3>${this.escapeHtml(saved.name)}</h3>
                    <p class="saved-party-item-time">${saved.timestamp}</p>
                    ${saved.remarks ? `<p class="saved-party-remarks">${this.escapeHtml(saved.remarks)}</p>` : ""}
                </div>
                <div class="saved-party-buttons">
                    <button class="btn btn-small btn-load">読込</button>
                    <button class="btn btn-small btn-delete">削除</button>
                </div>
            `;
      div
        .querySelector(".btn-load")
        .addEventListener("click", () =>
          this.loadPartyData(saved.id, "opponent"),
        );
      div
        .querySelector(".btn-delete")
        .addEventListener("click", () =>
          this.deletePartyData(saved.id, "opponent"),
        );
      this.oppSavedList.appendChild(div);
    });
  }

  // 対戦初期化
  startBattle() {
    this.collectData("own");
    this.collectData("opponent");

    // 相手のパーティのすべてのポケモンを追加
    const battlePokemon = [];
    this.opponentParty.forEach((p, i) => {
      if (p.name) {
        battlePokemon.push({ ...p, type: "opponent", idx: i });
      }
    });

    // 自分のパーティから選出有無でフィルタリング
    this.ownParty.forEach((p, i) => {
      if (p.name && p.selected) {
        battlePokemon.push({ ...p, type: "own", idx: i });
      }
    });

    if (battlePokemon.length === 0) {
      alert("ポケモンを登録してください");
      return;
    }

    // 素早さ(実数値)でソート (降順)
    battlePokemon.sort((a, b) => (b.actualSpeed || 0) - (a.actualSpeed || 0));

    // battlePokemon を保存（保存時に使用）
    this.battleOrder = battlePokemon;

    // 相手のformコンテナに相手パーティと自分の選出済みを表示
    this.renderBattleFormContainer(battlePokemon);
  }

  // 対戦用にformコンテナに相手と自分のポケモンを表示
  renderBattleFormContainer(battlePokemon) {
    this.oppFormContainer.innerHTML = "";
    this.oppFormContainer.className =
      "party-form-container battle-form-container";

    battlePokemon.forEach((poke, displayIdx) => {
      const card = document.createElement("div");

      // プロパティのデフォルト値を設定
      const pokeName = poke.name || "";
      const pokeAbility = poke.ability || "";
      const pokeItem = poke.item || "";
      const pokeActualSpeed = poke.actualSpeed || 0;
      const pokeMoves = Array.isArray(poke.moves)
        ? poke.moves
        : ["", "", "", ""];
      const pokeTerasType = poke.terasType || "";
      const pokeNotes = poke.notes || "";
      const pokeSelected = poke.selected === true;
      const pokeLead = poke.lead === true;
      const pokeType = poke.type || "opponent"; // own または opponent

      card.className = `pokemon-card battle-pokemon ${pokeType} ${pokeSelected ? "selected" : ""}`;
      card.id = `battle-card-${pokeType}-${poke.idx || displayIdx}`;
      card.draggable = true;
      card.dataset.orderIdx = displayIdx;
      card.dataset.pokeType = pokeType;

      card.innerHTML = `
        <div class="pokemon-number">
          <div class="number-and-name">
            <div class="poke-type-label" style="font-size: 12px; color: ${pokeType === "own" ? "#2e7d32" : "#c62828"};">
              ${pokeType === "own" ? "【自】" : "【敵】"}
            </div>
            <strong>#${displayIdx + 1}</strong>
            <input type="text" class="name-input battle-pokemon-name" placeholder="ポケモン名" value="${pokeName}">
          </div>
          <div class="header-controls">
            <label class="small-check"><input type="checkbox" class="battle-sel-check" ${pokeSelected ? "checked" : ""}> 選出</label>
            <label class="small-check"><input type="checkbox" class="battle-lead-check" ${pokeLead ? "checked" : ""}> 先発</label>
            <span class="pokemon-toggle-icon collapsed">▼</span>
          </div>
        </div>
        <div class="pokemon-details collapsed">
          <div class="form-group">
            <label>特性</label>
            <input type="text" class="battle-ability" placeholder="特性" value="${pokeAbility}">
          </div>
          <div class="form-group">
            <label>持ち物</label>
            <input type="text" class="battle-item" placeholder="持ち物" value="${pokeItem}">
          </div>
          <div class="form-group">
            <label>素早さ(実数値)</label>
            <input type="number" class="battle-speed" placeholder="0" value="${pokeActualSpeed}">
          </div>
          <div class="form-group">
            <label>技</label>
            <div class="moves-group">
              ${[0, 1, 2, 3].map((m) => `<div class="form-group" style="margin-bottom:0"><input type="text" class="battle-move" placeholder="技${m + 1}" value="${pokeMoves[m] || ""}"></div>`).join("")}
            </div>
          </div>
          <div class="form-group">
            <label>テラスタイプ</label>
            <select class="battle-teras">
              <option value="">選択</option>
              <option value="ノーマル" ${pokeTerasType === "ノーマル" ? "selected" : ""}>ノーマル</option>
              <option value="ほのお" ${pokeTerasType === "ほのお" ? "selected" : ""}>ほのお</option>
              <option value="みず" ${pokeTerasType === "みず" ? "selected" : ""}>みず</option>
              <option value="でんき" ${pokeTerasType === "でんき" ? "selected" : ""}>でんき</option>
              <option value="くさ" ${pokeTerasType === "くさ" ? "selected" : ""}>くさ</option>
              <option value="こおり" ${pokeTerasType === "こおり" ? "selected" : ""}>こおり</option>
              <option value="かくとう" ${pokeTerasType === "かくとう" ? "selected" : ""}>かくとう</option>
              <option value="どく" ${pokeTerasType === "どく" ? "selected" : ""}>どく</option>
              <option value="じめん" ${pokeTerasType === "じめん" ? "selected" : ""}>じめん</option>
              <option value="ひこう" ${pokeTerasType === "ひこう" ? "selected" : ""}>ひこう</option>
              <option value="エスパー" ${pokeTerasType === "エスパー" ? "selected" : ""}>エスパー</option>
              <option value="むし" ${pokeTerasType === "むし" ? "selected" : ""}>むし</option>
              <option value="いわ" ${pokeTerasType === "いわ" ? "selected" : ""}>いわ</option>
              <option value="ゴースト" ${pokeTerasType === "ゴースト" ? "selected" : ""}>ゴースト</option>
              <option value="ドラゴン" ${pokeTerasType === "ドラゴン" ? "selected" : ""}>ドラゴン</option>
              <option value="あく" ${pokeTerasType === "あく" ? "selected" : ""}>あく</option>
              <option value="はがね" ${pokeTerasType === "はがね" ? "selected" : ""}>はがね</option>
              <option value="フェアリー" ${pokeTerasType === "フェアリー" ? "selected" : ""}>フェアリー</option>
              <option value="ステラ" ${pokeTerasType === "ステラ" ? "selected" : ""}>ステラ</option>
            </select>
          </div>
          <div class="form-group">
            <label>その他</label>
            <textarea class="battle-notes" placeholder="役割など" rows="3">${pokeNotes}</textarea>
          </div>
        </div>
      `;

      // アコーディオン
      const header = card.querySelector(".pokemon-number");
      const details = card.querySelector(".pokemon-details");
      const icon = card.querySelector(".pokemon-toggle-icon");
      header.addEventListener("click", () => {
        details.classList.toggle("collapsed");
        icon.classList.toggle("collapsed");
      });

      // ドラッグアンドドロップ
      card.addEventListener("dragstart", () => {
        card.classList.add("dragging");
      });
      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
        this.oppFormContainer
          .querySelectorAll(".battle-pokemon")
          .forEach((item) => {
            item.classList.remove("drag-over");
          });
        // ドラッグ終了時に番号と battleOrder を更新
        this.updateBattleCardNumbers();
        this.updateBattleOrderFromDOM();
      });
      card.addEventListener("dragover", (e) => {
        e.preventDefault();
        card.classList.add("drag-over");
      });
      card.addEventListener("dragleave", () => {
        card.classList.remove("drag-over");
      });
      card.addEventListener("drop", (e) => {
        e.preventDefault();
        const dragging = this.oppFormContainer.querySelector(".dragging");
        if (dragging && dragging !== card) {
          if (
            parseInt(dragging.dataset.orderIdx) <
            parseInt(card.dataset.orderIdx)
          ) {
            card.parentNode.insertBefore(dragging, card.nextSibling);
          } else {
            card.parentNode.insertBefore(dragging, card);
          }
        }
        card.classList.remove("drag-over");
      });

      // タッチドラッグアンドドロップのセットアップ
      this.setupTouchDragDrop(card, this.oppFormContainer, {
        onDragStart: () => {
          // タッチドラッグ開始時の処理
        },
        onDragEnd: () => {
          this.updateBattleCardNumbers();
          this.updateBattleOrderFromDOM();
        },
        getPosition: (el) => {
          const allCards = Array.from(
            this.oppFormContainer.querySelectorAll(".battle-pokemon"),
          );
          return allCards.indexOf(el);
        },
      });

      // 入力監視（名前と選出・先発のチェック）
      const selCheckbox = card.querySelector(".battle-sel-check");
      const leadCheckbox = card.querySelector(".battle-lead-check");

      const updateBattlePokemon = () => {
        poke.name = card.querySelector(".battle-pokemon-name").value;
        poke.selected = selCheckbox.checked;
        poke.lead = leadCheckbox.checked;
        poke.ability = card.querySelector(".battle-ability").value;
        poke.item = card.querySelector(".battle-item").value;
        poke.moves = Array.from(card.querySelectorAll(".battle-move")).map(
          (m) => m.value,
        );
        poke.terasType = card.querySelector(".battle-teras").value;
        poke.notes = card.querySelector(".battle-notes").value;
        poke.actualSpeed =
          parseInt(card.querySelector(".battle-speed").value) || 0;

        // 選出チェックが外れたら先発をdisableにする
        if (!poke.selected) {
          leadCheckbox.disabled = true;
          leadCheckbox.checked = false;
          poke.lead = false;
        } else {
          leadCheckbox.disabled = false;
        }
      };

      // 選出チェックボックスの初期状態を反映
      if (!selCheckbox.checked) {
        leadCheckbox.disabled = true;
      }

      card.querySelectorAll("input, select, textarea").forEach((el) => {
        el.addEventListener("change", updateBattlePokemon);
        el.addEventListener("input", updateBattlePokemon);
        if (el.type !== "checkbox") {
          el.addEventListener("click", (e) => e.stopPropagation());
        } else {
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            updateBattlePokemon();
          });
        }
      });

      this.oppFormContainer.appendChild(card);
    });
  }

  // バトルカード番号を更新
  updateBattleCardNumbers() {
    const cards = this.oppFormContainer.querySelectorAll(".battle-pokemon");
    cards.forEach((card, newIdx) => {
      const numberElement = card.querySelector(".number-and-name strong");
      if (numberElement) {
        numberElement.textContent = `#${newIdx + 1}`;
      }
      card.dataset.orderIdx = newIdx;
    });
  }

  // バトルカードのDOMから battleOrder を再構築（ドラッグ後に呼び出し）
  updateBattleOrderFromDOM() {
    const cards = this.oppFormContainer.querySelectorAll(".battle-pokemon");
    this.battleOrder = Array.from(cards).map((card) => {
      return {
        name: card.querySelector(".battle-pokemon-name")?.value || "",
        ability: card.querySelector(".battle-ability")?.value || "",
        item: card.querySelector(".battle-item")?.value || "",
        terasType: card.querySelector(".battle-teras")?.value || "",
        notes: card.querySelector(".battle-notes")?.value || "",
        selected: card.querySelector(".battle-sel-check")?.checked || false,
        lead: card.querySelector(".battle-lead-check")?.checked || false,
        actualSpeed: parseInt(card.querySelector(".battle-speed")?.value) || 0,
        moves: Array.from(card.querySelectorAll(".battle-move")).map(
          (m) => m.value,
        ),
        type:
          card.dataset.pokeType ||
          (card.classList.contains("own") ? "own" : "opponent"),
      };
    });
  }

  // デフォルト素早さ計算 (Level 50, 努力値252振り, 性格補正有り)
  getSpeed(poke) {
    const baseStats = {
      ピカチュウ: 90,
      ギャラドス: 81,
      ファイアロー: 126,
      アーマーガア: 67,
      テツノカイナ: 120,
      テツノツユハ: 85,
      テツノボウ: 70,
      テツノドクガ: 112,
      テツノブジン: 61,
    };
    const base = baseStats[poke.name] || 90;
    let s = Math.floor((2 * base + 94) * 0.5) + 5;
    return Math.floor(s * 1.1);
  }

  renderSpeedOrder(party) {
    this.speedContainer.innerHTML = "";
    party.forEach((p, idx) => {
      const div = document.createElement("div");
      div.className = `speed-order-item ${p.type}`;
      div.draggable = true;
      div.dataset.idx = idx;
      const actualSpeed = p.actualSpeed || 0;
      div.innerHTML = `
                <div class="speed-order-item-info">
                    <div class="speed-order-item-name">${p.type === "own" ? "【自】" : "【敵】"} ${this.escapeHtml(p.name)}</div>
                    <div class="speed-order-item-stats">
                        <span>特性: ${this.escapeHtml(p.ability || "-")}</span>
                        <span>持ち物: ${this.escapeHtml(p.item || "-")}</span>
                        <span class="speed-order-item-speed">素早さ: ${actualSpeed}</span>
                    </div>
                </div>
                <div class="speed-order-item-controls">
                    <input type="number" class="actual-speed" value="${actualSpeed}" placeholder="実値">
                </div>
            `;

      // ドラッグアンドドロップ
      div.addEventListener("dragstart", () => {
        div.classList.add("dragging");
      });
      div.addEventListener("dragend", () => {
        div.classList.remove("dragging");
        this.speedContainer
          .querySelectorAll(".speed-order-item")
          .forEach((item) => {
            item.classList.remove("drag-over");
          });
        // ドラッグ終了時にbattleOrderを更新
        this.updateBattleOrder();
      });
      div.addEventListener("dragover", (e) => {
        e.preventDefault();
        div.classList.add("drag-over");
      });
      div.addEventListener("dragleave", () => {
        div.classList.remove("drag-over");
      });
      div.addEventListener("drop", (e) => {
        e.preventDefault();
        const dragging = this.speedContainer.querySelector(".dragging");
        if (dragging && dragging !== div) {
          if (parseInt(dragging.dataset.idx) < parseInt(div.dataset.idx)) {
            div.parentNode.insertBefore(dragging, div.nextSibling);
          } else {
            div.parentNode.insertBefore(dragging, div);
          }
        }
        div.classList.remove("drag-over");
      });

      // タッチドラッグアンドドロップのセットアップ
      this.setupTouchDragDrop(div, this.speedContainer, {
        onDragStart: () => {
          // タッチドラッグ開始時の処理
        },
        onDragEnd: () => {
          this.updateBattleOrder();
        },
        getPosition: (el) => {
          const allItems = Array.from(
            this.speedContainer.querySelectorAll(".speed-order-item"),
          );
          return allItems.indexOf(el);
        },
      });

      this.speedContainer.appendChild(div);
    });
  }

  // battleOrderを更新
  updateBattleOrder() {
    const items = this.speedContainer.querySelectorAll(".speed-order-item");
    this.battleOrder = Array.from(items).map((item, idx) => {
      const originalIdx = parseInt(item.dataset.idx);
      const updatedPoke = this.battleOrder[originalIdx];
      updatedPoke.actualSpeed =
        parseInt(item.querySelector(".actual-speed").value) || 0;
      return updatedPoke;
    });
  }

  exportCSV(type) {
    this.collectData(type);
    const list =
      type === "own" ? this.savedOwnParties : this.savedOpponentParties;

    let csv =
      "パーティ名,勝敗,備考,ポケモン番号,ポケモン側,ポケモン名,特性,持ち物,技1,技2,技3,技4,テラスタイプ,先発,素早さ(実数値),その他,選出有無\n";

    list.forEach((party) => {
      // battleOrderがある場合はそれを使用、なければpartyの順序で出力
      const pokemonList =
        party.battleOrder && party.battleOrder.length > 0
          ? party.battleOrder
          : party.party.map((p, idx) => ({
              ...p,
              type: type === "opponent" ? "opponent" : "own",
              idx,
            }));

      pokemonList.forEach((p, dispIdx) => {
        const idx = p.idx || dispIdx;
        const row = [
          party.name,
          party.result || "",
          (party.remarks || "").replace(/\n/g, " "),
          dispIdx + 1,
          p.type || "opponent",
          p.name,
          p.ability,
          p.item,
          p.moves[0],
          p.moves[1],
          p.moves[2],
          p.moves[3],
          p.terasType,
          p.lead ? "○" : "",
          p.actualSpeed || 0,
          p.notes.replace(/\n/g, " "),
          p.selected ? "○" : "",
        ];
        csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${type}-parties-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    alert("CSVをダウンロードしました！");
  }

  importCSV(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const csv = evt.target.result;
      const lines = csv.trim().split("\n");
      if (lines.length < 2) {
        alert("有効なCSVファイルではありません");
        return;
      }

      const parties = new Map();
      for (let i = 1; i < lines.length; i++) {
        const cells = [];
        let cur = "",
          quoted = false;
        for (let j = 0; j < lines[i].length; j++) {
          const ch = lines[i][j];
          if (ch === '"') quoted = !quoted;
          else if (ch === "," && !quoted) {
            cells.push(cur);
            cur = "";
          } else cur += ch;
        }
        cells.push(cur);

        if (cells.length < 17) continue;
        const pName = cells[0] || `パーティ${i}`;
        const pIdx = parseInt(cells[3]) - 1;
        if (pIdx < 0 || pIdx >= 6) continue;

        if (!parties.has(pName)) {
          parties.set(pName, {
            party: Array(6)
              .fill()
              .map(() => new Pokemon()),
            result: cells[1] || "",
            remarks: cells[2] || "",
            battleOrder: [],
          });
        }

        const p = new Pokemon();
        p.name = cells[5];
        p.ability = cells[6];
        p.item = cells[7];
        p.moves = [cells[8], cells[9], cells[10], cells[11]];
        p.terasType = cells[12];
        p.lead = cells[13] === "○";
        p.actualSpeed = parseInt(cells[14]) || 0;
        p.notes = cells[15] || "";
        p.selected = cells[16] === "○";
        p.type = cells[4] || "opponent";

        parties.get(pName).party[pIdx] = p;
        // battleOrderに追加（対戦順序を保持）
        parties.get(pName).battleOrder.push({
          ...p,
          idx: pIdx,
        });
      }

      const list =
        type === "own" ? this.savedOwnParties : this.savedOpponentParties;
      parties.forEach((v, name) => {
        list.unshift({
          id: Date.now() + Math.random(),
          name,
          party: v.party,
          timestamp: new Date().toLocaleString("ja-JP"),
          result: v.result || "",
          remarks: v.remarks || "",
          battleOrder: v.battleOrder || [],
        });
      });

      this.saveToStorage();
      this.renderSavedParties();
      alert(`${parties.size}個をインポートしました！`);
    };
    reader.readAsText(file);

    if (type === "own") this.ownCsvInput.value = "";
    else this.oppCsvInput.value = "";
  }

  saveToStorage() {
    localStorage.setItem(
      "savedOwnParties",
      JSON.stringify(this.savedOwnParties),
    );
    localStorage.setItem(
      "savedOpponentParties",
      JSON.stringify(this.savedOpponentParties),
    );
  }

  loadSavedParties() {
    this.savedOwnParties = JSON.parse(
      localStorage.getItem("savedOwnParties") || "[]",
    );
    this.savedOpponentParties = JSON.parse(
      localStorage.getItem("savedOpponentParties") || "[]",
    );
    this.renderSavedParties();
  }

  escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (c) => map[c]);
  }
}

document.addEventListener("DOMContentLoaded", () => new PartyApp());
