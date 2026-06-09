// // ============================================================
// //  SCRIPT GANTT - avec checkboxes fonctionnelles + carrousel
// // ============================================================

// let tasks = [];

// // ------------------------------------------------------------------
// //  Chargement / Sauvegarde localStorage
// // ------------------------------------------------------------------
// function loadTasksFromStorage() {
//   const stored = localStorage.getItem("tasks");
//   if (stored) {
//     tasks = JSON.parse(stored);
//     tasks.forEach((t) => {
//       if (t.dependencies === undefined) t.dependencies = [];
//       if (t.successors === undefined) t.successors = [];
//       if (t.start === undefined) t.start = null;
//       if (t.end === undefined) t.end = null;
//       if (t.lateStart === undefined) t.lateStart = null;
//       if (t.lateEnd === undefined) t.lateEnd = null;
//       if (t.mt === undefined) t.mt = 0;
//       if (t.ml === undefined) t.ml = 0;
//     });
//   } else {
//     tasks = [];
//   }
// }

// function saveTasksToStorage() {
//   localStorage.setItem("tasks", JSON.stringify(tasks));
// }

// // ------------------------------------------------------------------
// //  Ajout d'une tâche
// // ------------------------------------------------------------------
// function addTask() {
//   let name = document.getElementById("name").value.trim();
//   let duration = parseInt(document.getElementById("duration").value);
//   let deps = document.getElementById("deps").value.trim();

//   if (isNaN(duration) || !name) {
//     alert("Veuillez entrer une tâche et une durée");
//     return;
//   }

//   if (tasks.some((t) => t.name === name)) {
//     alert("Une tâche avec ce nom existe déjà.");
//     return;
//   }

//   if (duration <= 0) {
//     alert("Veuillez entrer une durée positive.");
//     return;
//   }

//   let dependencies = deps ? deps.split(",").map((d) => d.trim()) : [];

//   for (let dep of dependencies) {
//     if (!tasks.some((t) => t.name === dep)) {
//       alert(`La dépendance "${dep}" n'existe pas. Ajoutez-la d'abord.`);
//       return;
//     }
//   }

//   tasks.push({
//     name,
//     duration,
//     dependencies,
//     successors: [],
//     start: null,
//     end: null,
//     lateStart: null,
//     lateEnd: null,
//     mt: 0,
//     ml: 0,
//   });

//   saveTasksToStorage();

//   document.getElementById("name").value = "";
//   document.getElementById("duration").value = "";
//   document.getElementById("deps").value = "";

//   updateTaskCarousel();

//   if (document.querySelector("#result tbody"))
//     document.querySelector("#result tbody").innerHTML = "";
//   const ganttDiv = document.getElementById("gantt");
//   if (ganttDiv) ganttDiv.innerHTML = "";
// }

// // ------------------------------------------------------------------
// //  Carrousel des tâches
// // ------------------------------------------------------------------
// const CAROUSEL_VISIBLE = 6;
// let carouselOffset = 0;

// function getCardWidth() {
//   const track = document.getElementById("taskCarousel");
//   if (!track) return 162;
//   const card = track.querySelector(".task-card");
//   if (!card) return 162;
//   return card.offsetWidth + 12;
// }

// function createNameRow(name, index) {
//   return `
//     <div class="task-row border-none" data-index="${index}" data-field="name">
//       <div class="task-card-name flex justify-between items-center w-full">
//         <span class="task-value text-lg font-bold text-brand ">${name}</span>
//         <div class="row-actions">
//           <button class="icon-btn edit-btn" onclick="startEdit(this)">
//             ${iconEdit()}
//           </button>
//         </div>
//       </div>
//     </div>
//   `;
// }
// function createRow(label, value, index, field) {
//   return `
//     <div class="task-row" data-index="${index}" data-field="${field}">
//       <span class="task-label">${label}</span>
//       <div class="task-row-bottom">
//         <span class="task-value">${value || "-"}</span>
//         <div class="row-actions">
//           <button class="icon-btn edit-btn" onclick="startEdit(this)">
//             ${iconEdit()}
//           </button>
//         </div>
//       </div>
//     </div>
//   `;
// }
// function applyCarouselTransform() {
//   const track = document.getElementById("taskCarousel");
//   const card = track.querySelector(".task-card");

//   if (!card) return;

//   const cardWidth = card.offsetWidth + 16;

//   track.style.transform = `translateX(-${carouselOffset * cardWidth}px)`;
// }

// function carouselMove(dir) {
//   const maxOffset = Math.max(0, tasks.length - CAROUSEL_VISIBLE);

//   carouselOffset = Math.max(0, Math.min(maxOffset, carouselOffset + dir));

//   updateTaskCarousel();
// }

// function updateTaskCarousel() {
//   const track = document.getElementById("taskCarousel");
//   const emptyMsg = document.getElementById("carouselEmpty");
//   const prev = document.getElementById("carouselPrev");
//   const next = document.getElementById("carouselNext");

//   track.innerHTML = "";

//   if (tasks.length === 0) {
//     emptyMsg.classList.remove("hidden");
//     prev.classList.add("hidden");
//     next.classList.add("hidden");
//     return;
//   }

//   emptyMsg.classList.add("hidden");

//   tasks.forEach((task, i) => {
//     const card = document.createElement("div");
//     card.className = "task-card shrink-0";

//     card.innerHTML = `
//       ${createNameRow(task.name, i)}
//       ${createRow("Durée", task.duration, i, "duration")}
//       ${createRow("Dépendances", task.dependencies.join(","), i, "dependencies")}

//       <div class="task-delete">
//         <button class="delete-btn" onclick="deleteTask(${i})">
//           Supprimer
//         </button>
//       </div>
//     `;

//     track.appendChild(card);
//   });

//   const maxOffset = Math.max(0, tasks.length - CAROUSEL_VISIBLE);

//   prev.classList.toggle("hidden", carouselOffset === 0);
//   next.classList.toggle("hidden", carouselOffset >= maxOffset);

//   applyCarouselTransform();
// }

// function startEdit(btn) {
//   const row = btn.closest(".task-row");
//   const valueEl = row.querySelector(".task-value");
//   const actions = row.querySelector(".row-actions");

//   const oldValue = valueEl.textContent;

//   valueEl.innerHTML = `
//     <input class="edit-input" value="${oldValue}">
//   `;

//   actions.innerHTML = `
//       <button class="icon-btn-confirm confirm-btn" onclick="confirmEdit(this)">
//         ${iconCheck()}
//       </button>
//       <button class="icon-btn-cancel cancel-btn" onclick="cancelEdit(this,'${oldValue}')">
//         ${iconX()}
//       </button>
//   `;
// }

// function cancelEdit(btn, oldValue) {
//   const row = btn.closest(".task-row");
//   const actions = row.querySelector(".row-actions");

//   row.querySelector(".task-value").textContent = oldValue;

//   actions.innerHTML = `
//     <button class="icon-btn edit-btn" onclick="startEdit(this)">
//       ${iconEdit()}
//     </button>
//   `;
// }

// function confirmEdit(btn) {
//   const row = btn.closest(".task-row");
//   const input = row.querySelector("input");
//   const index = parseInt(row.dataset.index);
//   const field = row.dataset.field;
//   let newValue = input.value.trim();

//   if (!newValue && field === "name") {
//     alert("Le nom ne peut pas être vide");
//     return;
//   }

//   if (field === "duration") {
//     newValue = parseInt(newValue);
//     if (isNaN(newValue) || newValue <= 0) return;
//   }

//   if (field === "dependencies") {
//     newValue = newValue ? newValue.split(",").map((d) => d.trim()) : [];
//     for (let dep of newValue) {
//       if (!tasks.some((t, i) => t.name === dep && i !== index)) {
//         alert(`La dépendance "${dep}" n'existe pas.`);
//         return;
//       }
//     }
//   }

//   if (field === "name") {
//     const oldName = tasks[index].name;
//     if (tasks.some((t, i) => t.name === newValue && i !== index)) {
//       alert("Ce nom de tâche existe déjà.");
//       return;
//     }
//     tasks.forEach((t) => {
//       t.dependencies = t.dependencies.map((dep) =>
//         dep === oldName ? newValue : dep,
//       );
//     });
//   }

//   tasks[index][field] = newValue;
//   saveTasksToStorage();

//   calculate();
//   updateTaskCarousel();
// }

// // ------------------------------------------------------------------
// //  Suppression d'une tâche
// // ------------------------------------------------------------------
// function deleteTask(taskIndex) {
//   const taskName = tasks[taskIndex].name;
//   if (!confirm(`Supprimer la tâche "${taskName}" ?`)) return;

//   tasks.splice(taskIndex, 1);
//   tasks.forEach((t) => {
//     t.dependencies = t.dependencies.filter((d) => d !== taskName);
//   });

//   const maxOffset = Math.max(0, tasks.length - CAROUSEL_VISIBLE);
//   if (carouselOffset > maxOffset) carouselOffset = maxOffset;

//   saveTasksToStorage();
//   updateTaskCarousel();

//   const resultTbody = document.querySelector("#result tbody");
//   if (resultTbody) resultTbody.innerHTML = "";
//   const ganttDiv = document.getElementById("gantt");
//   if (ganttDiv) ganttDiv.innerHTML = "";
// }

// // ------------------------------------------------------------------
// //  SVG des icônes d'édition (edit, check, cancel)
// // ------------------------------------------------------------------

// function iconEdit() {
//   return `
//   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>`;
// }

// function iconCheck() {
//   return `
//  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`;
// }

// function iconX() {
//   return `
//   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
// }

// // ------------------------------------------------------------------
// //  Affichage du tableau des résultats
// // ------------------------------------------------------------------
// function displayResult() {
//   const tbody = document.querySelector("#result tbody");
//   if (!tbody) return;
//   tbody.innerHTML = "";

//   tasks.forEach((t) => {
//     const isCritical = t.mt === 0;
//     const row = tbody.insertRow();
//     if (isCritical) {
//       row.style.backgroundColor = "#fde8ec";
//     }
//     const cells = [
//       t.name,
//       t.duration,
//       t.start,
//       t.end,
//       t.successors.join(", ") || "—",
//       t.mt,
//       t.ml,
//     ];
//     cells.forEach((val, i) => {
//       const cell = row.insertCell(i);
//       cell.innerText = val;
//       if (i === 0) {
//         cell.style.textAlign = "left";
//         cell.style.fontWeight = "500";
//       }
//     });
//   });
// }

// // ------------------------------------------------------------------
// //  Dessin du diagramme de Gantt — version moderne
// // ------------------------------------------------------------------
// function drawGantt() {
//   const container = document.getElementById("gantt");
//   if (!container) return;
//   container.innerHTML = "";

//   if (tasks.length === 0) {
//     container.innerHTML = `<p class="gantt-empty">Aucune tâche à afficher.</p>`;
//     return;
//   }
//   if (tasks.some((t) => t.start === null)) {
//     container.innerHTML = `<p class="gantt-empty">Veuillez d'abord cliquer sur "Générer le diagramme".</p>`;
//     return;
//   }

//   const showLate = document.getElementById("showLate").checked;
//   const showFree = document.getElementById("showFree").checked;
//   const showCritical = document.getElementById("showCritical").checked;

//   // Récupère les CSS custom properties pour les couleurs
//   const style = getComputedStyle(document.documentElement);
//   const colorEarly =
//     style.getPropertyValue("--color-earlier-date").trim() || "#69adfa";
//   const colorLate =
//     style.getPropertyValue("--color-later-date").trim() || "#f1ae00";
//   const colorCritical =
//     style.getPropertyValue("--color-critical-task").trim() || "#f7554d";
//   const colorFree =
//     style.getPropertyValue("--color-marge-libre").trim() || "#94aa64";

//   // ── Calcul des dimensions ────────────────────────────────────────
//   // projectDuration = fin de la dernière tâche (au plus tôt)
//   const projectDuration = Math.max(...tasks.map((t) => t.end));

//   // maxExtent = vrai maximum en tenant compte des barres tardives et marges
//   const maxExtent = Math.max(
//     ...tasks.map((t) =>
//       Math.max(t.end, t.lateEnd ?? 0, t.end + (t.ml > 0 ? t.ml : 0)),
//     ),
//   );

//   const labelWidth = 140;
//   const minBarPx = 8;

//   // Scale basé sur projectDuration pour que les barres principales remplissent l'écran
//   const containerW = container.clientWidth || 900;
//   const availableW = Math.max(containerW - labelWidth, 200);
//   const idealScale = Math.floor(availableW / projectDuration);
//   const minScalePx = 14;
//   const maxScalePx = 100;
//   const scale = Math.max(minScalePx, Math.min(idealScale, maxScalePx));

//   // totalWidth couvre TOUT (barres tardives + marges qui dépassent)
//   const totalWidth = maxExtent * scale;
//   // Largeur totale de chaque ligne = label + zone de barres
//   const totalRowWidth = labelWidth + totalWidth;

//   // ── Tooltip global ──────────────────────────────────────────────
//   const tooltip = document.createElement("div");
//   tooltip.className = "gantt-tooltip";
//   container.appendChild(tooltip);

//   function showTooltip(e, html) {
//     tooltip.innerHTML = html;
//     tooltip.classList.add("visible");
//     moveTooltip(e);
//   }
//   function moveTooltip(e) {
//     const rect = container.getBoundingClientRect();
//     const tx = e.clientX - rect.left + 14;
//     const ty = e.clientY - rect.top - 10;
//     tooltip.style.left = tx + "px";
//     tooltip.style.top = ty + "px";
//   }
//   function hideTooltip() {
//     tooltip.classList.remove("visible");
//   }

//   // ── Légende ─────────────────────────────────────────────────────
//   const legend = document.createElement("div");
//   legend.className = "gantt-legend";
//   const legendItems = [
//     { color: colorEarly, label: "Dates au plus tôt" },
//     ...(showCritical
//       ? [{ color: colorCritical, label: "Chemin critique" }]
//       : []),
//     ...(showLate ? [{ color: colorLate, label: "Dates au plus tard" }] : []),
//     ...(showFree ? [{ color: colorFree, label: "Marge libre" }] : []),
//   ];
//   legend.innerHTML = legendItems
//     .map(
//       ({ color, label }) => `
//     <span class="gantt-legend-item">
//       <span class="gantt-legend-swatch" style="background:${color}"></span>
//       ${label}
//     </span>`,
//     )
//     .join("");
//   container.appendChild(legend);

//   // ── Wrapper scrollable ──────────────────────────────────────────
//   const wrapper = document.createElement("div");
//   wrapper.className = "gantt-wrapper";
//   // Force le wrapper à avoir la bonne largeur minimale
//   wrapper.style.minWidth = "100%";
//   container.appendChild(wrapper);

//   // ── Grille de fond ──────────────────────────────────────────────
//   const timeMarkInterval =
//     scale >= 50 ? 1 : scale >= 30 ? 2 : scale >= 15 ? 5 : 10;

//   // ── Header échelle de temps ──────────────────────────────────────
//   const header = document.createElement("div");
//   header.className = "gantt-header-row";
//   // Force la largeur totale du header
//   header.style.minWidth = totalRowWidth + "px";

//   const headerLabel = document.createElement("div");
//   headerLabel.className = "gantt-label";
//   headerLabel.style.minWidth = labelWidth + "px";
//   headerLabel.style.width = labelWidth + "px";
//   headerLabel.style.flexShrink = "0";
//   header.appendChild(headerLabel);

//   const timeScale = document.createElement("div");
//   timeScale.className = "gantt-timescale";
//   timeScale.style.width = totalWidth + "px";
//   timeScale.style.flexShrink = "0";

//   // Ticks de l'échelle (on va jusqu'à maxExtent pour couvrir tout)
//   for (let t = 0; t <= maxExtent; t += timeMarkInterval) {
//     const tick = document.createElement("div");
//     tick.className = "gantt-tick";
//     tick.style.left = t * scale + "px";
//     tick.innerHTML = `<span class="gantt-tick-label">${t}</span>`;
//     timeScale.appendChild(tick);
//   }

//   // Colonnes de grille verticales — aussi jusqu'à maxExtent
//   for (let t = 0; t <= maxExtent; t += timeMarkInterval) {
//     const col = document.createElement("div");
//     col.className = "gantt-grid-col";
//     col.style.left = t * scale + "px";
//     col.style.height = tasks.length * 56 + 48 + "px";
//     timeScale.appendChild(col);
//   }

//   header.appendChild(timeScale);
//   wrapper.appendChild(header);

//   // ── Corps des lignes ────────────────────────────────────────────
//   const body = document.createElement("div");
//   body.className = "gantt-body";
//   // Force le body à avoir la même largeur que le header
//   body.style.minWidth = totalRowWidth + "px";
//   wrapper.appendChild(body);

//   tasks.forEach((task, idx) => {
//     const isCritical = task.mt === 0;

//     const row = document.createElement("div");
//     row.className = "gantt-row" + (idx % 2 === 1 ? " gantt-row-alt" : "");
//     // Force chaque ligne à avoir la largeur totale → alternance uniforme jusqu'au bout
//     row.style.minWidth = totalRowWidth + "px";
//     body.appendChild(row);

//     // Label
//     const label = document.createElement("div");
//     label.className =
//       "gantt-label" +
//       (isCritical && showCritical ? " gantt-label-critical" : "");
//     label.style.minWidth = labelWidth + "px";
//     label.style.width = labelWidth + "px";
//     label.style.flexShrink = "0";
//     label.innerHTML = `<span class="gantt-label-text">${task.name}</span>`;
//     row.appendChild(label);

//     // Zone de barres — largeur fixe, pas de flex:1 qui écrase
//     const barsArea = document.createElement("div");
//     barsArea.className = "gantt-bars-area";
//     barsArea.style.width = totalWidth + "px";
//     barsArea.style.minWidth = totalWidth + "px";
//     barsArea.style.flexShrink = "0";
//     row.appendChild(barsArea);

//     // ─ Barre au plus tard ─
//     if (showLate) {
//       const bar = document.createElement("div");
//       bar.className = "gantt-bar gantt-bar-late";
//       bar.style.cssText = `left:${task.lateStart * scale}px;width:${Math.max(task.duration * scale, minBarPx)}px;background:${colorLate};top:6px;`;
//       bar.addEventListener("mouseenter", (e) =>
//         showTooltip(
//           e,
//           `<strong>${task.name}</strong> — au plus tard<br>
//           Début : <b>${task.lateStart}</b> &nbsp;·&nbsp; Fin : <b>${task.lateEnd}</b><br>
//           Durée : <b>${task.duration}</b>`,
//         ),
//       );
//       bar.addEventListener("mousemove", moveTooltip);
//       bar.addEventListener("mouseleave", hideTooltip);
//       barsArea.appendChild(bar);
//     }

//     // ─ Barre marge libre ─
//     if (showFree && task.ml > 0) {
//       const bar = document.createElement("div");
//       bar.className = "gantt-bar gantt-bar-free";
//       bar.style.cssText = `left:${task.end * scale}px;width:${Math.max(task.ml * scale, minBarPx)}px;background:${colorFree};top:${showLate ? 24 : 6}px;`;
//       bar.addEventListener("mouseenter", (e) =>
//         showTooltip(
//           e,
//           `<strong>${task.name}</strong> — marge libre<br>
//           Marge : <b>${task.ml}</b>`,
//         ),
//       );
//       bar.addEventListener("mousemove", moveTooltip);
//       bar.addEventListener("mouseleave", hideTooltip);
//       barsArea.appendChild(bar);
//     }

//     // ─ Barre au plus tôt ─
//     const earlyColor = isCritical && showCritical ? colorCritical : colorEarly;
//     const earlyBar = document.createElement("div");
//     const earlyTop = showLate ? (showFree ? 38 : 24) : showFree ? 22 : 6;
//     earlyBar.className = "gantt-bar gantt-bar-early";
//     earlyBar.style.cssText = `left:${task.start * scale}px;width:${Math.max(task.duration * scale, minBarPx)}px;background:${earlyColor};top:${earlyTop}px;`;
//     earlyBar.addEventListener("mouseenter", (e) =>
//       showTooltip(
//         e,
//         `<strong>${task.name}</strong> — au plus tôt<br>
//         Début : <b>${task.start}</b> &nbsp;·&nbsp; Fin : <b>${task.end}</b><br>
//         Durée : <b>${task.duration}</b><br>
//         MT : <b>${task.mt}</b> &nbsp;·&nbsp; ML : <b>${task.ml}</b>
//         ${isCritical ? '<br><span class="gantt-tooltip-critical">⬥ Tâche critique</span>' : ""}`,
//       ),
//     );
//     earlyBar.addEventListener("mousemove", moveTooltip);
//     earlyBar.addEventListener("mouseleave", hideTooltip);
//     barsArea.appendChild(earlyBar);
//   });
// }

// // ------------------------------------------------------------------
// //  Calcul principal
// // ------------------------------------------------------------------
// function calculate() {
//   if (tasks.length === 0) {
//     alert("Ajoutez au moins une tâche avant de calculer.");
//     return;
//   }

//   tasks.forEach((t) => {
//     t.start = null;
//     t.end = null;
//     t.lateStart = null;
//     t.lateEnd = null;
//     t.mt = 0;
//     t.ml = 0;
//   });

//   const map = {};
//   tasks.forEach((t) => (map[t.name] = t));

//   function calcEarly(task) {
//     if (task.start !== null) return;
//     if (task.dependencies.length === 0) {
//       task.start = 0;
//     } else {
//       let maxEnd = 0;
//       task.dependencies.forEach((dep) => {
//         const depTask = map[dep];
//         if (!depTask) {
//           alert("Dépendance inconnue : " + dep);
//           return;
//         }
//         calcEarly(depTask);
//         if (depTask.end > maxEnd) maxEnd = depTask.end;
//       });
//       task.start = maxEnd;
//     }
//     task.end = task.start + task.duration;
//   }

//   tasks.forEach((t) => calcEarly(t));

//   const projectDuration = Math.max(...tasks.map((t) => t.end));

//   function calcLate(task) {
//     if (task.lateEnd !== null) return;
//     const successors = tasks.filter((t) => t.dependencies.includes(task.name));
//     if (successors.length === 0) {
//       task.lateEnd = projectDuration;
//     } else {
//       let minStart = Infinity;
//       successors.forEach((s) => {
//         calcLate(s);
//         if (s.lateStart < minStart) minStart = s.lateStart;
//       });
//       task.lateEnd = minStart;
//     }
//     task.lateStart = task.lateEnd - task.duration;
//   }

//   tasks.forEach((t) => calcLate(t));

//   tasks.forEach((t) => {
//     t.successors = [];
//   });
//   tasks.forEach((t) => {
//     t.dependencies.forEach((dep) => {
//       const depTask = tasks.find((x) => x.name === dep);
//       if (depTask) depTask.successors.push(t.name);
//     });
//   });

//   tasks.forEach((t) => {
//     t.mt = t.lateStart - t.start;
//     const successors = tasks.filter((s) => s.dependencies.includes(t.name));
//     if (successors.length === 0) {
//       t.ml = t.mt;
//     } else {
//       const minStart = Math.min(...successors.map((s) => s.start));
//       t.ml = minStart - t.end;
//     }
//   });

//   saveTasksToStorage();
//   displayResult();
//   drawGantt();
//   updateTaskCarousel();
// }

// function generateGantt() {
//   calculate();
//   drawGantt();
// }

// // ------------------------------------------------------------------
// //  Réinitialisation
// // ------------------------------------------------------------------
// function resetData() {
//   if (!confirm("Voulez-vous vraiment supprimer toutes les tâches ?")) return;
//   tasks = [];
//   carouselOffset = 0;
//   saveTasksToStorage();
//   updateTaskCarousel();
//   const resultTbody = document.querySelector("#result tbody");
//   if (resultTbody) resultTbody.innerHTML = "";
//   const ganttDiv = document.getElementById("gantt");
//   if (ganttDiv) ganttDiv.innerHTML = "";
//   alert("Toutes les tâches ont été supprimées.");
// }

// // ------------------------------------------------------------------
// //  Initialisation
// // ------------------------------------------------------------------
// function init() {
//   loadTasksFromStorage();
//   updateTaskCarousel();
//   if (tasks.length > 0) {
//     if (tasks.some((t) => t.start === null)) {
//       calculate();
//     } else {
//       displayResult();
//       drawGantt();
//     }
//   }
// }

// document.addEventListener("DOMContentLoaded", init);

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
    for (let dep of newValue) {
      if (!tasks.some((t, i) => t.name === dep && i !== index)) {
        alert(`La dépendance "${dep}" n'existe pas.`);
        return;
      }
    }
  }

  if (field === "name") {
    const oldName = tasks[index].name;
    if (tasks.some((t, i) => t.name === newValue && i !== index)) {
      alert("Ce nom de tâche existe déjà.");
      return;
    }
    tasks.forEach((t) => {
      t.dependencies = t.dependencies.map((dep) =>
        dep === oldName ? newValue : dep,
      );
    });
  }

  tasks[index][field] = newValue;
  saveTasksToStorage();

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
    const cells = [
      t.name,
      t.duration,
      t.start,
      t.end,
      t.lateStart,
      t.lateEnd,
      t.successors.join(", ") || "—",
      t.mt,
      t.ml,
    ];
    cells.forEach((val, i) => {
      const cell = row.insertCell(i);
      cell.innerText = val;
      if (i === 0) {
        cell.style.textAlign = "left";
        cell.style.fontWeight = "500";
      }
      if (isCritical) {
        cell.style.color = "#c53e50";
        cell.style.fontWeight = "600";
      }
    });
  });
}

// ------------------------------------------------------------------
//  Dessin du diagramme de Gantt — version moderne
// ------------------------------------------------------------------
function drawGantt() {
  const container = document.getElementById("gantt");
  if (!container) return;
  container.innerHTML = "";

  if (tasks.length === 0) {
    container.innerHTML = `<p class="gantt-empty">Aucune tâche à afficher.</p>`;
    return;
  }
  if (tasks.some((t) => t.start === null)) {
    container.innerHTML = `<p class="gantt-empty">Veuillez d'abord cliquer sur "Générer le diagramme".</p>`;
    return;
  }

  const showLate = document.getElementById("showLate").checked;
  const showFree = document.getElementById("showFree").checked;
  const showCritical = document.getElementById("showCritical").checked;

  // Récupère les CSS custom properties pour les couleurs
  const style = getComputedStyle(document.documentElement);
  const colorEarly =
    style.getPropertyValue("--color-earlier-date").trim() || "#69adfa";
  const colorLate =
    style.getPropertyValue("--color-later-date").trim() || "#f1ae00";
  const colorCritical =
    style.getPropertyValue("--color-critical-task").trim() || "#f7554d";
  const colorFree =
    style.getPropertyValue("--color-marge-libre").trim() || "#94aa64";

  // ── Calcul des dimensions ────────────────────────────────────────
  // projectDuration = fin de la dernière tâche (au plus tôt)
  const projectDuration = Math.max(...tasks.map((t) => t.end));

  // maxExtent = vrai maximum en tenant compte des barres tardives et marges
  const maxExtent = Math.max(
    ...tasks.map((t) =>
      Math.max(t.end, t.lateEnd ?? 0, t.end + (t.ml > 0 ? t.ml : 0)),
    ),
  );

  const labelWidth = 140;
  const minBarPx = 8;

  // Scale basé sur projectDuration pour que les barres principales remplissent l'écran
  const containerW = container.clientWidth || 900;
  const availableW = Math.max(containerW - labelWidth, 200);
  const idealScale = Math.floor(availableW / projectDuration);
  const minScalePx = 14;
  const maxScalePx = 100;
  const scale = Math.max(minScalePx, Math.min(idealScale, maxScalePx));

  // totalWidth couvre TOUT (barres tardives + marges qui dépassent)
  const totalWidth = maxExtent * scale;
  // Largeur totale de chaque ligne = label + zone de barres
  const totalRowWidth = labelWidth + totalWidth;

  // ── Tooltip global ──────────────────────────────────────────────
  const tooltip = document.createElement("div");
  tooltip.className = "gantt-tooltip";
  container.appendChild(tooltip);

  function showTooltip(e, html) {
    tooltip.innerHTML = html;
    tooltip.classList.add("visible");
    moveTooltip(e);
  }
  function moveTooltip(e) {
    const rect = container.getBoundingClientRect();
    const tx = e.clientX - rect.left + 14;
    const ty = e.clientY - rect.top - 10;
    tooltip.style.left = tx + "px";
    tooltip.style.top = ty + "px";
  }
  function hideTooltip() {
    tooltip.classList.remove("visible");
  }

  // ── Légende ─────────────────────────────────────────────────────
  const legend = document.createElement("div");
  legend.className = "gantt-legend";
  const legendItems = [
    { color: colorEarly, label: "Dates au plus tôt" },
    ...(showCritical
      ? [{ color: colorCritical, label: "Chemin critique" }]
      : []),
    ...(showLate ? [{ color: colorLate, label: "Dates au plus tard" }] : []),
    ...(showFree ? [{ color: colorFree, label: "Marge libre" }] : []),
  ];
  legend.innerHTML = legendItems
    .map(
      ({ color, label }) => `
    <span class="gantt-legend-item">
      <span class="gantt-legend-swatch" style="background:${color}"></span>
      ${label}
    </span>`,
    )
    .join("");
  container.appendChild(legend);

  // ── Wrapper scrollable ──────────────────────────────────────────
  const wrapper = document.createElement("div");
  wrapper.className = "gantt-wrapper";
  // Force le wrapper à avoir la bonne largeur minimale
  wrapper.style.minWidth = "100%";
  container.appendChild(wrapper);

  // ── Grille de fond ──────────────────────────────────────────────
  const timeMarkInterval =
    scale >= 50 ? 1 : scale >= 30 ? 2 : scale >= 15 ? 5 : 10;

  // ── Header échelle de temps ──────────────────────────────────────
  const header = document.createElement("div");
  header.className = "gantt-header-row";
  // Force la largeur totale du header
  header.style.minWidth = totalRowWidth + "px";

  const headerLabel = document.createElement("div");
  headerLabel.className = "gantt-label";
  headerLabel.style.minWidth = labelWidth + "px";
  headerLabel.style.width = labelWidth + "px";
  headerLabel.style.flexShrink = "0";
  header.appendChild(headerLabel);

  const timeScale = document.createElement("div");
  timeScale.className = "gantt-timescale";
  timeScale.style.width = totalWidth + "px";
  timeScale.style.flexShrink = "0";

  // Ticks de l'échelle (on va jusqu'à maxExtent pour couvrir tout)
  for (let t = 0; t <= maxExtent; t += timeMarkInterval) {
    const tick = document.createElement("div");
    tick.className = "gantt-tick";
    tick.style.left = t * scale + "px";
    tick.innerHTML = `<span class="gantt-tick-label">${t}</span>`;
    timeScale.appendChild(tick);
  }

  // Colonnes de grille verticales — aussi jusqu'à maxExtent
  for (let t = 0; t <= maxExtent; t += timeMarkInterval) {
    const col = document.createElement("div");
    col.className = "gantt-grid-col";
    col.style.left = t * scale + "px";
    col.style.height = tasks.length * 56 + 48 + "px";
    timeScale.appendChild(col);
  }

  header.appendChild(timeScale);
  wrapper.appendChild(header);

  // ── Corps des lignes ────────────────────────────────────────────
  const body = document.createElement("div");
  body.className = "gantt-body";
  // Force le body à avoir la même largeur que le header
  body.style.minWidth = totalRowWidth + "px";
  wrapper.appendChild(body);

  tasks.forEach((task, idx) => {
    const isCritical = task.mt === 0;

    const row = document.createElement("div");
    row.className = "gantt-row" + (idx % 2 === 1 ? " gantt-row-alt" : "");
    // Force chaque ligne à avoir la largeur totale → alternance uniforme jusqu'au bout
    row.style.minWidth = totalRowWidth + "px";
    body.appendChild(row);

    // Label
    const label = document.createElement("div");
    label.className =
      "gantt-label" +
      (isCritical && showCritical ? " gantt-label-critical" : "");
    label.style.minWidth = labelWidth + "px";
    label.style.width = labelWidth + "px";
    label.style.flexShrink = "0";
    label.innerHTML = `<span class="gantt-label-text">${task.name}</span>`;
    row.appendChild(label);

    // Zone de barres — largeur fixe, pas de flex:1 qui écrase
    const barsArea = document.createElement("div");
    barsArea.className = "gantt-bars-area";
    barsArea.style.width = totalWidth + "px";
    barsArea.style.minWidth = totalWidth + "px";
    barsArea.style.flexShrink = "0";
    row.appendChild(barsArea);

    // ─ Barre au plus tard ─
    if (showLate) {
      const bar = document.createElement("div");
      bar.className = "gantt-bar gantt-bar-late";
      bar.style.cssText = `left:${task.lateStart * scale}px;width:${Math.max(task.duration * scale, minBarPx)}px;background:${colorLate};top:6px;`;
      bar.addEventListener("mouseenter", (e) =>
        showTooltip(
          e,
          `<strong>${task.name}</strong> — au plus tard<br>
          Début : <b>${task.lateStart}</b> &nbsp;·&nbsp; Fin : <b>${task.lateEnd}</b><br>
          Durée : <b>${task.duration}</b>`,
        ),
      );
      bar.addEventListener("mousemove", moveTooltip);
      bar.addEventListener("mouseleave", hideTooltip);
      barsArea.appendChild(bar);
    }

    // ─ Barre marge libre ─
    if (showFree && task.ml > 0) {
      const bar = document.createElement("div");
      bar.className = "gantt-bar gantt-bar-free";
      bar.style.cssText = `left:${task.end * scale}px;width:${Math.max(task.ml * scale, minBarPx)}px;background:${colorFree};top:${showLate ? 24 : 6}px;`;
      bar.addEventListener("mouseenter", (e) =>
        showTooltip(
          e,
          `<strong>${task.name}</strong> — marge libre<br>
          Marge : <b>${task.ml}</b>`,
        ),
      );
      bar.addEventListener("mousemove", moveTooltip);
      bar.addEventListener("mouseleave", hideTooltip);
      barsArea.appendChild(bar);
    }

    // ─ Barre au plus tôt ─
    const earlyColor = isCritical && showCritical ? colorCritical : colorEarly;
    const earlyBar = document.createElement("div");
    const earlyTop = showLate ? (showFree ? 38 : 24) : showFree ? 22 : 6;
    earlyBar.className = "gantt-bar gantt-bar-early";
    earlyBar.style.cssText = `left:${task.start * scale}px;width:${Math.max(task.duration * scale, minBarPx)}px;background:${earlyColor};top:${earlyTop}px;`;
    earlyBar.addEventListener("mouseenter", (e) =>
      showTooltip(
        e,
        `<strong>${task.name}</strong> — au plus tôt<br>
        Début : <b>${task.start}</b> &nbsp;·&nbsp; Fin : <b>${task.end}</b><br>
        Durée : <b>${task.duration}</b><br>
        MT : <b>${task.mt}</b> &nbsp;·&nbsp; ML : <b>${task.ml}</b>
        ${isCritical ? '<br><span class="gantt-tooltip-critical">⬥ Tâche critique</span>' : ""}`,
      ),
    );
    earlyBar.addEventListener("mousemove", moveTooltip);
    earlyBar.addEventListener("mouseleave", hideTooltip);
    barsArea.appendChild(earlyBar);
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
