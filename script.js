// ============================================================
//  SCRIPT GANTT - avec checkboxes fonctionnelles + carrousel
// ============================================================

let tasks = [];

// ------------------------------------------------------------------
//  Chargement / Sauvegarde localStorage
// ------------------------------------------------------------------
function loadTasksFromStorage() {
  const stored = localStorage.getItem("tasks");
  if (stored) {
    tasks = JSON.parse(stored);
    tasks.forEach((t) => {
      if (t.dependencies === undefined) t.dependencies = [];
      if (t.successors === undefined) t.successors = [];
      if (t.start === undefined) t.start = null;
      if (t.end === undefined) t.end = null;
      if (t.lateStart === undefined) t.lateStart = null;
      if (t.lateEnd === undefined) t.lateEnd = null;
      if (t.mt === undefined) t.mt = 0;
      if (t.ml === undefined) t.ml = 0;
    });
  } else {
    tasks = [];
  }
}

function saveTasksToStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ------------------------------------------------------------------
//  Ajout d'une tâche
// ------------------------------------------------------------------
function addTask() {
  let name = document.getElementById("name").value.trim();
  let duration = parseInt(document.getElementById("duration").value);
  let deps = document.getElementById("deps").value.trim();

  if (isNaN(duration) || !name) {
    alert("Veuillez entrer une tâche et une durée");
    return;
  }

  if (tasks.some((t) => t.name === name)) {
    alert("Une tâche avec ce nom existe déjà.");
    return;
  }

  if (duration <= 0) {
    alert("Veuillez entrer une durée positive.");
    return;
  }

  let dependencies = deps ? deps.split(",").map((d) => d.trim()) : [];

  for (let dep of dependencies) {
    if (!tasks.some((t) => t.name === dep)) {
      alert(`La dépendance "${dep}" n'existe pas. Ajoutez-la d'abord.`);
      return;
    }
  }

  tasks.push({
    name,
    duration,
    dependencies,
    successors: [],
    start: null,
    end: null,
    lateStart: null,
    lateEnd: null,
    mt: 0,
    ml: 0,
  });

  saveTasksToStorage();

  document.getElementById("name").value = "";
  document.getElementById("duration").value = "";
  document.getElementById("deps").value = "";

  updateTaskCarousel();

  if (document.querySelector("#result tbody"))
    document.querySelector("#result tbody").innerHTML = "";
  const ganttDiv = document.getElementById("gantt");
  if (ganttDiv) ganttDiv.innerHTML = "";
}

// ------------------------------------------------------------------
//  Carrousel des tâches
// ------------------------------------------------------------------
const CAROUSEL_VISIBLE = 6;
let carouselOffset = 0;

function getCardWidth() {
  const track = document.getElementById("taskCarousel");
  if (!track) return 162;
  const card = track.querySelector(".task-card");
  if (!card) return 162;
  return card.offsetWidth + 12;
}

function createNameRow(name, index) {
  return `
    <div class="task-row border-none" data-index="${index}" data-field="name">
      <div class="task-card-name flex justify-between items-center w-full">
        <span class="task-value text-lg font-bold text-brand ">${name}</span>
        <div class="row-actions">
          <button class="icon-btn edit-btn" onclick="startEdit(this)">
            ${iconEdit()}
          </button>
        </div>
      </div>
    </div>
  `;
}
function createRow(label, value, index, field) {
  return `
    <div class="task-row" data-index="${index}" data-field="${field}">
      <span class="task-label">${label}</span>
      <div class="task-row-bottom">
        <span class="task-value">${value || "-"}</span>
        <div class="row-actions">
          <button class="icon-btn edit-btn" onclick="startEdit(this)">
            ${iconEdit()}
          </button>
        </div>
      </div>
    </div>
  `;
}
function applyCarouselTransform() {
  const track = document.getElementById("taskCarousel");
  const card = track.querySelector(".task-card");

  if (!card) return;

  const cardWidth = card.offsetWidth + 16;

  track.style.transform = `translateX(-${carouselOffset * cardWidth}px)`;
}

function carouselMove(dir) {
  const maxOffset = Math.max(0, tasks.length - CAROUSEL_VISIBLE);

  carouselOffset = Math.max(0, Math.min(maxOffset, carouselOffset + dir));

  updateTaskCarousel();
}

function updateTaskCarousel() {
  const track = document.getElementById("taskCarousel");
  const emptyMsg = document.getElementById("carouselEmpty");
  const prev = document.getElementById("carouselPrev");
  const next = document.getElementById("carouselNext");

  track.innerHTML = "";

  if (tasks.length === 0) {
    emptyMsg.classList.remove("hidden");
    prev.classList.add("hidden");
    next.classList.add("hidden");
    return;
  }

  emptyMsg.classList.add("hidden");

  tasks.forEach((task, i) => {
    const card = document.createElement("div");
    card.className = "task-card shrink-0";

    card.innerHTML = `
      ${createNameRow(task.name, i)}
      ${createRow("Durée", task.duration, i, "duration")}
      ${createRow("Dépendances", task.dependencies.join(","), i, "dependencies")}

      <div class="task-delete">
        <button class="delete-btn" onclick="deleteTask(${i})">
          Supprimer
        </button>
      </div>
    `;

    track.appendChild(card);
  });

  const maxOffset = Math.max(0, tasks.length - CAROUSEL_VISIBLE);

  prev.classList.toggle("hidden", carouselOffset === 0);
  next.classList.toggle("hidden", carouselOffset >= maxOffset);

  applyCarouselTransform();
}

function startEdit(btn) {
  const row = btn.closest(".task-row");
  const valueEl = row.querySelector(".task-value");
  const actions = row.querySelector(".row-actions");

  const oldValue = valueEl.textContent;

  valueEl.innerHTML = `
    <input class="edit-input" value="${oldValue}">
  `;

  actions.innerHTML = `
      <button class="icon-btn-confirm confirm-btn" onclick="confirmEdit(this)">
        ${iconCheck()}
      </button>
      <button class="icon-btn-cancel cancel-btn" onclick="cancelEdit(this,'${oldValue}')">
        ${iconX()}
      </button>
  `;
}

function cancelEdit(btn, oldValue) {
  const row = btn.closest(".task-row");
  const actions = row.querySelector(".row-actions");

  row.querySelector(".task-value").textContent = oldValue;

  actions.innerHTML = `
    <button class="icon-btn edit-btn" onclick="startEdit(this)">
      ${iconEdit()}
    </button>
  `;
}

function confirmEdit(btn) {
  const row = btn.closest(".task-row");
  const input = row.querySelector("input");
  const index = parseInt(row.dataset.index);
  const field = row.dataset.field;
  let newValue = input.value.trim();

  if (!newValue && field === "name") {
    alert("Le nom ne peut pas être vide");
    return;
  }

  if (field === "duration") {
    newValue = parseInt(newValue);
    if (isNaN(newValue) || newValue <= 0) return;
  }

  if (field === "dependencies") {
    newValue = newValue ? newValue.split(",").map((d) => d.trim()) : [];
    // Vérification si les dépendances existent
    for (let dep of newValue) {
      if (!tasks.some((t, i) => t.name === dep && i !== index)) {
        alert(`La dépendance "${dep}" n'existe pas.`);
        return;
      }
    }
  }

  if (field === "name") {
    const oldName = tasks[index].name;
    // Vérifier l'unicité
    if (tasks.some((t, i) => t.name === newValue && i !== index)) {
      alert("Ce nom de tâche existe déjà.");
      return;
    }
    // Mettre à jour les dépendances dans les autres tâches
    tasks.forEach((t) => {
      t.dependencies = t.dependencies.map((dep) =>
        dep === oldName ? newValue : dep,
      );
    });
  }

  tasks[index][field] = newValue;
  saveTasksToStorage();

  // Si on change le nom ou la durée, il faut recalculer le planning
  calculate();
  updateTaskCarousel();
}

// ------------------------------------------------------------------
//  Suppression d'une tâche
// ------------------------------------------------------------------
function deleteTask(taskIndex) {
  const taskName = tasks[taskIndex].name;
  if (!confirm(`Supprimer la tâche "${taskName}" ?`)) return;

  tasks.splice(taskIndex, 1);
  tasks.forEach((t) => {
    t.dependencies = t.dependencies.filter((d) => d !== taskName);
  });

  const maxOffset = Math.max(0, tasks.length - CAROUSEL_VISIBLE);
  if (carouselOffset > maxOffset) carouselOffset = maxOffset;

  saveTasksToStorage();
  updateTaskCarousel();

  const resultTbody = document.querySelector("#result tbody");
  if (resultTbody) resultTbody.innerHTML = "";
  const ganttDiv = document.getElementById("gantt");
  if (ganttDiv) ganttDiv.innerHTML = "";
}

// ------------------------------------------------------------------
//  SVG des icônes d'édition (edit, check, cancel)
// ------------------------------------------------------------------

function iconEdit() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>`;
}

function iconCheck() {
  return `
 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`;
}

function iconX() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
}

// ------------------------------------------------------------------
//  Affichage du tableau des résultats
// ------------------------------------------------------------------
function displayResult() {
  const tbody = document.querySelector("#result tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  tasks.forEach((t) => {
    const isCritical = t.mt === 0;
    const row = tbody.insertRow();
    row.style.backgroundColor = isCritical ? "#ffcccc" : "white";
    row.insertCell(0).innerText = t.name;
    row.insertCell(1).innerText = t.duration;
    row.insertCell(2).innerText = t.start;
    row.insertCell(3).innerText = t.end;
    row.insertCell(4).innerText = t.successors.join(",");
    row.insertCell(5).innerText = t.mt;
    row.insertCell(6).innerText = t.ml;
  });
}

// ------------------------------------------------------------------
//  Dessin du diagramme de Gantt
//  - Barre "au plus tôt" : TOUJOURS affichée
//    → verte si tâche normale
//    → rouge si tâche critique ET showCritical coché
//  - Barre "au plus tard" (bleue) : uniquement si showLate coché
//  - Marge libre (jaune)          : uniquement si showFree coché
// ------------------------------------------------------------------
function drawGantt() {
  const container = document.getElementById("gantt");
  if (!container) return;
  container.innerHTML = "";

  if (tasks.length === 0) {
    container.innerHTML =
      "<p style='padding:12px;color:#666;'>Aucune tâche à afficher.</p>";
    return;
  }

  if (tasks.some((t) => t.start === null)) {
    container.innerHTML =
      "<p style='padding:12px;color:#666;'>Veuillez d'abord cliquer sur \"Générer le diagramme\".</p>";
    return;
  }

  const showLate = document.getElementById("showLate").checked;
  const showFree = document.getElementById("showFree").checked;
  const showCritical = document.getElementById("showCritical").checked;

  const projectDuration = Math.max(...tasks.map((t) => t.end));
  const labelWidth = 120;
  const maxWidth = 900;
  const minScale = 25;
  const availableWidth =
    Math.min(container.clientWidth || maxWidth, maxWidth) - labelWidth;
  let scale = Math.floor(availableWidth / projectDuration);
  if (scale < minScale) scale = minScale;
  if (scale > 60) scale = 60;

  const totalWidth = projectDuration * scale;

  // Légende dynamique
  const legend = document.createElement("div");
  legend.style.cssText =
    "display:flex;gap:18px;align-items:center;margin-bottom:8px;font-size:13px;flex-wrap:wrap;";

  let legendHTML = `
    <span style="display:flex;align-items:center;gap:5px;">
      <span style="display:inline-block;width:28px;height:14px;background:#4caf50;border-radius:3px;"></span> Dates au plus tôt
    </span>`;
  if (showCritical) {
    legendHTML += `
    <span style="display:flex;align-items:center;gap:5px;">
      <span style="display:inline-block;width:28px;height:14px;background:#ff4444;border-radius:3px;"></span> Chemin critique
    </span>`;
  }
  if (showLate) {
    legendHTML += `
    <span style="display:flex;align-items:center;gap:5px;">
      <span style="display:inline-block;width:28px;height:14px;background:#1565c0;border-radius:3px;opacity:0.7;"></span> Dates au plus tard
    </span>`;
  }
  if (showFree) {
    legendHTML += `
    <span style="display:flex;align-items:center;gap:5px;">
      <span style="display:inline-block;width:28px;height:14px;background:#ffc107;border-radius:3px;"></span> Marge libre
    </span>`;
  }
  legend.innerHTML = legendHTML;
  container.appendChild(legend);

  const ganttTable = document.createElement("div");
  ganttTable.className = "gantt-table";
  container.appendChild(ganttTable);

  const headerRow = document.createElement("div");
  headerRow.className = "gantt-header";
  ganttTable.appendChild(headerRow);

  const labelCol = document.createElement("div");
  labelCol.className = "gantt-label-cell";
  labelCol.style.minWidth = labelWidth + "px";
  headerRow.appendChild(labelCol);

  const timeScale = document.createElement("div");
  timeScale.className = "gantt-time-scale";
  timeScale.style.width = totalWidth + "px";
  headerRow.appendChild(timeScale);

  const timeMarkInterval = scale >= 40 ? 1 : scale >= 25 ? 2 : 5;
  for (let t = 0; t <= projectDuration; t += timeMarkInterval) {
    const mark = document.createElement("div");
    mark.className = "gantt-time-mark";
    mark.style.left = t * scale + "px";
    mark.innerText = t;
    timeScale.appendChild(mark);
  }

  const rowHeight = 40 + (showLate ? 35 : 0) + (showFree ? 20 : 0) + 10;
  const lateTop = 5;
  const freeTop = showLate ? lateTop + 30 : 5;
  const earlyTop =
    showLate && showFree
      ? freeTop + 20
      : showLate
        ? lateTop + 30
        : showFree
          ? freeTop + 20
          : 5;

  tasks.forEach((task) => {
    const isCritical = task.mt === 0;

    const taskRow = document.createElement("div");
    taskRow.className = "gantt-row";
    ganttTable.appendChild(taskRow);

    const taskLabel = document.createElement("div");
    taskLabel.className = "gantt-label-cell";
    taskLabel.style.minWidth = labelWidth + "px";
    taskLabel.innerText = task.name;
    taskRow.appendChild(taskLabel);

    const barContainer = document.createElement("div");
    barContainer.className = "gantt-bar-container";
    barContainer.style.width = totalWidth + "px";
    barContainer.style.flexShrink = "0";
    barContainer.style.position = "relative";
    barContainer.style.height = rowHeight + "px";
    barContainer.style.backgroundImage = `repeating-linear-gradient(90deg,#e8e8e8,#e8e8e8 1px,transparent 1px,transparent ${scale}px)`;
    taskRow.appendChild(barContainer);

    if (showLate) {
      const lateBar = document.createElement("div");
      lateBar.style.cssText = `
        position:absolute;
        top:${lateTop}px;
        left:${task.lateStart * scale}px;
        width:${task.duration * scale}px;
        height:24px;
        background:#1565c0;
        opacity:0.75;
        color:white;
        font-size:11px;
        font-weight:bold;
        line-height:24px;
        text-align:center;
        border-radius:4px;
        overflow:hidden;
      `;
      lateBar.innerText = `${task.name} (${task.lateStart}→${task.lateEnd})`;
      barContainer.appendChild(lateBar);
    }

    if (showFree && task.ml !== undefined && task.ml !== null) {
      let barLeft, barWidth, title;
      if (task.ml > 0) {
        barLeft = task.end * scale;
        barWidth = task.ml * scale;
        title = `Marge libre : ${task.ml}`;
      } else {
        barLeft = task.start * scale;
        barWidth = task.duration * scale;
        title = `Marge libre nulle`;
      }
      const freeBar = document.createElement("div");
      freeBar.style.cssText = `
        position:absolute;
        top:${freeTop}px;
        left:${barLeft}px;
        width:${barWidth}px;
        height:14px;
        background:#ffc107;
        border-radius:3px;
      `;
      freeBar.title = title;
      barContainer.appendChild(freeBar);
    }

    const earlyBg = isCritical && showCritical ? "#ff4444" : "#4caf50";
    const earlyBar = document.createElement("div");
    earlyBar.style.cssText = `
      position:absolute;
      top:${earlyTop}px;
      left:${task.start * scale}px;
      width:${task.duration * scale}px;
      height:24px;
      background:${earlyBg};
      color:white;
      font-size:11px;
      font-weight:bold;
      line-height:24px;
      text-align:center;
      border-radius:4px;
      overflow:hidden;
    `;
    earlyBar.innerText = `${task.name} (${task.start}→${task.end})`;
    barContainer.appendChild(earlyBar);
  });
}

// ------------------------------------------------------------------
//  Calcul principal
// ------------------------------------------------------------------
function calculate() {
  if (tasks.length === 0) {
    alert("Ajoutez au moins une tâche avant de calculer.");
    return;
  }

  tasks.forEach((t) => {
    t.start = null;
    t.end = null;
    t.lateStart = null;
    t.lateEnd = null;
    t.mt = 0;
    t.ml = 0;
  });

  const map = {};
  tasks.forEach((t) => (map[t.name] = t));

  function calcEarly(task) {
    if (task.start !== null) return;
    if (task.dependencies.length === 0) {
      task.start = 0;
    } else {
      let maxEnd = 0;
      task.dependencies.forEach((dep) => {
        const depTask = map[dep];
        if (!depTask) {
          alert("Dépendance inconnue : " + dep);
          return;
        }
        calcEarly(depTask);
        if (depTask.end > maxEnd) maxEnd = depTask.end;
      });
      task.start = maxEnd;
    }
    task.end = task.start + task.duration;
  }

  tasks.forEach((t) => calcEarly(t));

  const projectDuration = Math.max(...tasks.map((t) => t.end));

  function calcLate(task) {
    if (task.lateEnd !== null) return;
    const successors = tasks.filter((t) => t.dependencies.includes(task.name));
    if (successors.length === 0) {
      task.lateEnd = projectDuration;
    } else {
      let minStart = Infinity;
      successors.forEach((s) => {
        calcLate(s);
        if (s.lateStart < minStart) minStart = s.lateStart;
      });
      task.lateEnd = minStart;
    }
    task.lateStart = task.lateEnd - task.duration;
  }

  tasks.forEach((t) => calcLate(t));

  tasks.forEach((t) => {
    t.successors = [];
  });
  tasks.forEach((t) => {
    t.dependencies.forEach((dep) => {
      const depTask = tasks.find((x) => x.name === dep);
      if (depTask) depTask.successors.push(t.name);
    });
  });

  tasks.forEach((t) => {
    t.mt = t.lateStart - t.start;
    const successors = tasks.filter((s) => s.dependencies.includes(t.name));
    if (successors.length === 0) {
      t.ml = t.mt;
    } else {
      const minStart = Math.min(...successors.map((s) => s.start));
      t.ml = minStart - t.end;
    }
  });

  saveTasksToStorage();
  displayResult();
  drawGantt();
  // Rafraîchir le carrousel pour afficher MT/ML et badge critique
  updateTaskCarousel();
}

function generateGantt() {
  calculate();
  drawGantt();
}

// ------------------------------------------------------------------
//  Réinitialisation
// ------------------------------------------------------------------
function resetData() {
  if (!confirm("Voulez-vous vraiment supprimer toutes les tâches ?")) return;
  tasks = [];
  carouselOffset = 0;
  saveTasksToStorage();
  updateTaskCarousel();
  const resultTbody = document.querySelector("#result tbody");
  if (resultTbody) resultTbody.innerHTML = "";
  const ganttDiv = document.getElementById("gantt");
  if (ganttDiv) ganttDiv.innerHTML = "";
  alert("Toutes les tâches ont été supprimées.");
}

// ------------------------------------------------------------------
//  Initialisation
// ------------------------------------------------------------------
function init() {
  loadTasksFromStorage();
  updateTaskCarousel();
  if (tasks.length > 0) {
    if (tasks.some((t) => t.start === null)) {
      calculate();
    } else {
      displayResult();
      drawGantt();
    }
  }
}

document.addEventListener("DOMContentLoaded", init);
