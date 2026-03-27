// ============================================================
//  SCRIPT UNIQUEMENT POUR LA PAGE PRINCIPALE (interface.html)
//  (sans gestion de la page successeur)
// ============================================================

let tasks = [];

// ------------------------------------------------------------------
//  Chargement / Sauvegarde localStorage
// ------------------------------------------------------------------
function loadTasksFromStorage() {
    const stored = localStorage.getItem('tasks');
    if (stored) {
        tasks = JSON.parse(stored);
        tasks.forEach(t => {
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
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ------------------------------------------------------------------
//  Ajout d'une tâche
// ------------------------------------------------------------------
function addTask() {
    let name = document.getElementById('name').value.trim();
    let duration = parseInt(document.getElementById('duration').value);
    let deps = document.getElementById('deps').value.trim();

    if (isNaN(duration) || !name) {
        alert('Veuillez entrer une tâche et une durée');
        return;
    }

    if (tasks.some(t => t.name === name)) {
        alert('Une tâche avec ce nom existe déjà.');
        return;
    }

    if (duration <= 0) {
        alert('Veuillez entre une durée positive.');
        return;
    }

    let dependencies = deps ? deps.split(',').map(d => d.trim()) : [];

    // 🔍 Vérification : toutes les dépendances doivent exister
    for (let dep of dependencies) {
        if (!tasks.some(t => t.name === dep)) {
            alert(`La dépendance "${dep}" n'existe pas dans la liste des tâches. Ajoutez-la d'abord.`);
            return;
        }
    }

    tasks.push({
        name: name,
        duration: duration,
        dependencies: dependencies,
        successors: [],
        start: null,
        end: null,
        lateStart: null,
        lateEnd: null,
        mt: 0,
        ml: 0
    });

    saveTasksToStorage();

    // Réinitialiser les champs
    document.getElementById('name').value = '';
    document.getElementById('duration').value = '';
    document.getElementById('deps').value = '';

    // Rafraîchir l'affichage
    updateTaskList();
    // Effacer les résultats précédents
    if (document.querySelector('#result tbody')) {
        document.querySelector('#result tbody').innerHTML = '';
    }
    const ganttDiv = document.getElementById('gantt');
    if (ganttDiv) ganttDiv.innerHTML = '';
}

// ------------------------------------------------------------------
//  Mise à jour du tableau des tâches (avec édition inline)
// ------------------------------------------------------------------
let isEditing = false;

function lockTable(activeCell) {
    isEditing = true;
    const table = document.getElementById('taskList');
    if (!table) return;
    table.querySelectorAll('td, th').forEach(cell => {
        if (cell === activeCell) return;
        cell.dataset.locked = 'true';
        cell.style.opacity = '0.4';
        cell.style.pointerEvents = 'none';
        cell.style.cursor = 'not-allowed';
    });
}

function unlockTable() {
    isEditing = false;
    const table = document.getElementById('taskList');
    if (!table) return;
    table.querySelectorAll('[data-locked]').forEach(cell => {
        delete cell.dataset.locked;
        cell.style.opacity = '';
        cell.style.pointerEvents = '';
        cell.style.cursor = '';
    });
}

function startEditCell(td, taskIndex, field) {
    if (isEditing) return;
    if (td.querySelector('input')) return;

    const originalValue = field === 'dependencies'
        ? tasks[taskIndex].dependencies.join(', ')
        : tasks[taskIndex][field];

    lockTable(td);

    td.style.opacity = '1';
    td.style.pointerEvents = 'auto';
    td.style.background = '#fffde7';
    td.style.outline = '2px solid #4caf50';
    td.style.width = 'auto';
    td.style.minWidth = '180px';
    td.style.whiteSpace = 'normal';
    td.style.overflow = 'visible';
    td.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;padding:4px;';

    const input = document.createElement('input');
    input.type = field === 'duration' ? 'number' : 'text';
    input.value = originalValue;
    input.style.cssText = 'width:120px;padding:4px 6px;border:1px solid #aaa;border-radius:3px;font-size:13px;box-sizing:border-box;';
    if (field === 'duration') input.min = '1';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:6px;';

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '✔ Valider';
    confirmBtn.style.cssText = 'background:#4caf50;color:white;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;font-size:12px;white-space:nowrap;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✖ Annuler';
    cancelBtn.style.cssText = 'background:#9e9e9e;color:white;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;font-size:12px;white-space:nowrap;';

    function doConfirm() {
        const newVal = input.value.trim();
        if (field === 'duration') {
            const n = parseInt(newVal);
            if (isNaN(n) || n <= 0) { alert('Durée invalide.'); input.focus(); return; }
            tasks[taskIndex].duration = n;
        } else if (field === 'dependencies') {
            tasks[taskIndex].dependencies = newVal ? newVal.split(',').map(d => d.trim()).filter(Boolean) : [];
        }
        saveTasksToStorage();
        unlockTable();
        updateTaskList();
        const ganttDiv = document.getElementById('gantt');
        if (ganttDiv) ganttDiv.innerHTML = '';
    }

    function doCancel() {
        unlockTable();
        updateTaskList();
    }

    confirmBtn.addEventListener('mousedown', e => { e.preventDefault(); doConfirm(); });
    cancelBtn.addEventListener('mousedown', e => { e.preventDefault(); doCancel(); });
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') doConfirm();
        if (e.key === 'Escape') doCancel();
    });

    btnRow.appendChild(confirmBtn);
    btnRow.appendChild(cancelBtn);
    wrapper.appendChild(input);
    wrapper.appendChild(btnRow);
    td.appendChild(wrapper);
    input.focus();
    input.select();
}

function startEditHeader(th, taskIndex) {
    if (isEditing) return;
    if (th.querySelector('input')) return;

    const originalName = tasks[taskIndex].name;

    lockTable(th);

    th.style.opacity = '1';
    th.style.pointerEvents = 'auto';
    th.style.background = '#e3f2fd';
    th.style.outline = '2px solid #2196f3';
    th.style.width = 'auto';
    th.style.minWidth = '180px';
    th.style.whiteSpace = 'normal';
    th.style.overflow = 'visible';
    th.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;padding:4px;';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalName;
    input.style.cssText = 'width:120px;padding:4px 6px;border:1px solid #aaa;border-radius:3px;font-size:13px;box-sizing:border-box;';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:6px;';

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '✔ Valider';
    confirmBtn.style.cssText = 'background:#2196f3;color:white;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;font-size:12px;white-space:nowrap;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✖ Annuler';
    cancelBtn.style.cssText = 'background:#9e9e9e;color:white;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;font-size:12px;white-space:nowrap;';

    function doConfirm() {
        const newName = input.value.trim();
        if (!newName) { alert('Le nom ne peut pas être vide.'); input.focus(); return; }
        if (newName !== originalName && tasks.some(t => t.name === newName)) {
            alert('Une tâche avec ce nom existe déjà.');
            input.focus();
            return;
        }
        // Mettre à jour les dépendances des autres tâches
        tasks.forEach(t => {
            t.dependencies = t.dependencies.map(d => d === originalName ? newName : d);
        });
        tasks[taskIndex].name = newName;
        saveTasksToStorage();
        unlockTable();
        updateTaskList();
        const ganttDiv = document.getElementById('gantt');
        if (ganttDiv) ganttDiv.innerHTML = '';
    }

    function doCancel() {
        unlockTable();
        updateTaskList();
    }

    confirmBtn.addEventListener('mousedown', e => { e.preventDefault(); doConfirm(); });
    cancelBtn.addEventListener('mousedown', e => { e.preventDefault(); doCancel(); });
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') doConfirm();
        if (e.key === 'Escape') doCancel();
    });

    btnRow.appendChild(confirmBtn);
    btnRow.appendChild(cancelBtn);
    wrapper.appendChild(input);
    wrapper.appendChild(btnRow);
    th.appendChild(wrapper);
    input.focus();
    input.select();
}

function deleteTask(taskIndex) {
    const taskName = tasks[taskIndex].name;
    if (!confirm(`Supprimer la tâche "${taskName}" ?`)) return;

    tasks.splice(taskIndex, 1);
    tasks.forEach(t => {
        t.dependencies = t.dependencies.filter(d => d !== taskName);
    });

    saveTasksToStorage();
    updateTaskList();

    const resultTbody = document.querySelector('#result tbody');
    if (resultTbody) resultTbody.innerHTML = '';
    const ganttDiv = document.getElementById('gantt');
    if (ganttDiv) ganttDiv.innerHTML = '';
}

function updateTaskList() {
    const table = document.getElementById('taskList');
    if (!table) return;
    table.innerHTML = '';

    if (tasks.length === 0) {
        const caption = document.createElement('caption');
        caption.textContent = 'Aucune tâche ajoutée';
        table.appendChild(caption);
        return;
    }

    // En-tête
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const emptyTh = document.createElement('th');
    emptyTh.textContent = 'Tâches';
    headerRow.appendChild(emptyTh);
    tasks.forEach((task, i) => {
        const th = document.createElement('th');
        th.textContent = task.name;
        th.title = 'Cliquez pour modifier le nom';
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => startEditHeader(th, i));
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Corps
    const tbody = document.createElement('tbody');

    // Durée
    const durationRow = document.createElement('tr');
    const durationLabel = document.createElement('th');
    durationLabel.textContent = 'Durée';
    durationRow.appendChild(durationLabel);
    tasks.forEach((task, i) => {
        const td = document.createElement('td');
        td.textContent = task.duration;
        td.title = 'Cliquez pour modifier';
        td.style.cursor = 'pointer';
        td.addEventListener('click', () => startEditCell(td, i, 'duration'));
        durationRow.appendChild(td);
    });
    tbody.appendChild(durationRow);

    // Dépendances
    const depsRow = document.createElement('tr');
    const depsLabel = document.createElement('th');
    depsLabel.textContent = 'Dépendances';
    depsRow.appendChild(depsLabel);
    tasks.forEach((task, i) => {
        const td = document.createElement('td');
        td.textContent = task.dependencies.join(', ');
        td.title = 'Cliquez pour modifier';
        td.style.cursor = 'pointer';
        td.addEventListener('click', () => startEditCell(td, i, 'dependencies'));
        depsRow.appendChild(td);
    });
    tbody.appendChild(depsRow);

    // Suppression
    const deleteRow = document.createElement('tr');
    const deleteLabel = document.createElement('th');
    deleteLabel.textContent = 'Supprimer';
    deleteRow.appendChild(deleteLabel);
    tasks.forEach((task, i) => {
        const td = document.createElement('td');
        td.style.padding = '4px';
        const btn = document.createElement('button');
        btn.textContent = '🗑';
        btn.style.cssText = 'background:#e53935;color:white;border:none;border-radius:4px;padding:4px 10px;cursor:pointer;font-size:14px;width:100%';
        btn.title = `Supprimer la tâche ${task.name}`;
        btn.addEventListener('click', () => deleteTask(i));
        td.appendChild(btn);
        deleteRow.appendChild(td);
    });
    tbody.appendChild(deleteRow);

    table.appendChild(tbody);
}

// ------------------------------------------------------------------
//  Affichage du tableau des résultats
// ------------------------------------------------------------------
function displayResult() {
    const tbody = document.querySelector('#result tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    tasks.forEach(t => {
        const isCritical = t.mt === 0;
        const row = tbody.insertRow();
        row.style.backgroundColor = isCritical ? '#ffcccc' : 'white';
        row.insertCell(0).innerText = t.name;
        row.insertCell(1).innerText = t.duration;
        row.insertCell(2).innerText = t.start;
        row.insertCell(3).innerText = t.end;
        row.insertCell(4).innerText = t.successors.join(',');
        row.insertCell(5).innerText = t.mt;
        row.insertCell(6).innerText = t.ml;
    });
}

// ------------------------------------------------------------------
//  Calcul principal (dates au plus tôt, au plus tard, marges)
// ------------------------------------------------------------------
function calculate() {
    if (tasks.length === 0) {
        alert('Ajoutez au moins une tâche avant de calculer.');
        return;
    }

    // Réinitialisation
    tasks.forEach(t => {
        t.start = null;
        t.end = null;
        t.lateStart = null;
        t.lateEnd = null;
        t.mt = 0;
        t.ml = 0;
    });

    const map = {};
    tasks.forEach(t => map[t.name] = t);

    // Dates au plus tôt
    function calcEarly(task) {
        if (task.start !== null) return;
        if (task.dependencies.length === 0) {
            task.start = 0;
        } else {
            let maxEnd = 0;
            task.dependencies.forEach(dep => {
                const depTask = map[dep];
                if (!depTask) {
                    alert("Dépendance inconnue : " + dep + " pour la tâche " + task.name);
                    return;
                }
                calcEarly(depTask);
                if (depTask.end > maxEnd) maxEnd = depTask.end;
            });
            task.start = maxEnd;
        }
        task.end = task.start + task.duration;
    }

    tasks.forEach(t => calcEarly(t));

    const projectDuration = Math.max(...tasks.map(t => t.end));

    // Dates au plus tard
    function calcLate(task) {
        if (task.lateEnd !== null) return;
        const successors = tasks.filter(t => t.dependencies.includes(task.name));
        if (successors.length === 0) {
            task.lateEnd = projectDuration;
        } else {
            let minStart = Infinity;
            successors.forEach(s => {
                calcLate(s);
                if (s.lateStart < minStart) minStart = s.lateStart;
            });
            task.lateEnd = minStart;
        }
        task.lateStart = task.lateEnd - task.duration;
    }

    tasks.forEach(t => calcLate(t));

    // Marges
    tasks.forEach(t => {
        t.mt = t.lateStart - t.start;
        const successors = tasks.filter(s => s.dependencies.includes(t.name));
        if (successors.length === 0) {
            t.ml = t.mt;
        } else {
            const minStart = Math.min(...successors.map(s => s.start));
            t.ml = minStart - t.end;
        }
    });

    saveTasksToStorage();
    displayResult();
    drawGantt();
}


// ------------------------------------------------------------------
//  Dessin du diagramme de Gantt (version enrichie avec deux barres)
// ------------------------------------------------------------------
function drawGantt() {
    const container = document.getElementById('gantt');
    if (!container) return;
    container.innerHTML = '';

    if (tasks.some(t => t.start === null)) {
        container.innerHTML = "<p>Veuillez d'abord cliquer sur \"Calculer\".</p>";
        return;
    }

    const projectDuration = Math.max(...tasks.map(t => t.end));
    const labelWidth = 120;
    const maxWidth = 900;
    const minScale = 25;
    const availableWidth = Math.min(container.clientWidth || maxWidth, maxWidth) - labelWidth;
    let scale = Math.floor(availableWidth / projectDuration);
    if (scale < minScale) scale = minScale;
    if (scale > 60) scale = 60;

    const totalWidth = projectDuration * scale;

    // Légende
    const legend = document.createElement('div');
    legend.style.cssText = 'display:flex;gap:18px;align-items:center;margin-bottom:8px;font-size:13px;flex-wrap:wrap;';
    legend.innerHTML = `
        <span style="display:flex;align-items:center;gap:5px;">
            <span style="display:inline-block;width:28px;height:14px;background:#4caf50;border-radius:3px;"></span> Dates au plus tôt
        </span>
        <span style="display:flex;align-items:center;gap:5px;">
            <span style="display:inline-block;width:28px;height:14px;background:#1565c0;border-radius:3px;opacity:0.7;"></span> Dates au plus tard
        </span>
        <span style="display:flex;align-items:center;gap:5px;">
            <span style="display:inline-block;width:28px;height:14px;background:#ff4444;border-radius:3px;"></span> Chemin critique
        </span>
    `;
    container.appendChild(legend);

    const ganttTable = document.createElement('div');
    ganttTable.className = 'gantt-table';
    container.appendChild(ganttTable);

    // En-tête avec échelle temporelle
    const headerRow = document.createElement('div');
    headerRow.className = 'gantt-header';
    ganttTable.appendChild(headerRow);

    const labelCol = document.createElement('div');
    labelCol.className = 'gantt-label-cell';
    labelCol.style.minWidth = labelWidth + 'px';
    headerRow.appendChild(labelCol);

    const timeScale = document.createElement('div');
    timeScale.className = 'gantt-time-scale';
    timeScale.style.width = totalWidth + 'px';
    headerRow.appendChild(timeScale);

    const timeMarkInterval = scale >= 40 ? 1 : (scale >= 25 ? 2 : 5);
    for (let t = 0; t <= projectDuration; t += timeMarkInterval) {
        const mark = document.createElement('div');
        mark.className = 'gantt-time-mark';
        mark.style.left = (t * scale) + 'px';
        mark.innerText = t;
        timeScale.appendChild(mark);
    }

    // Lignes des tâches
    tasks.forEach(task => {
        const isCritical = task.mt === 0;

        const taskRow = document.createElement('div');
        taskRow.className = 'gantt-row';
        ganttTable.appendChild(taskRow);

        const taskLabel = document.createElement('div');
        taskLabel.className = 'gantt-label-cell';
        taskLabel.style.minWidth = labelWidth + 'px';
        taskLabel.innerText = task.name;
        taskRow.appendChild(taskLabel);

        const barContainer = document.createElement('div');
        barContainer.className = 'gantt-bar-container';
        barContainer.style.width = totalWidth + 'px';
        barContainer.style.flexShrink = '0';
        barContainer.style.position = 'relative';
        barContainer.style.height = '70px';
        barContainer.style.backgroundImage = `repeating-linear-gradient(90deg,#e8e8e8,#e8e8e8 1px,transparent 1px,transparent ${scale}px)`;
        taskRow.appendChild(barContainer);

        // Barre "au plus tard" (en haut)
        const lateBar = document.createElement('div');
        lateBar.style.cssText = `
            position:absolute;
            top:6px;
            left:${task.lateStart * scale}px;
            width:${task.duration * scale}px;
            height:26px;
            background:#1565c0;
            opacity:0.72;
            color:white;
            font-size:11px;
            font-weight:bold;
            line-height:26px;
            text-align:center;
            border-radius:4px;
            overflow:hidden;
            white-space:nowrap;
            text-overflow:ellipsis;
            padding:0 4px;
            box-sizing:border-box;
            z-index:1;
        `;
        lateBar.title = `${task.name} — Au plus tard : [${task.lateStart} → ${task.lateEnd}]`;
        lateBar.innerText = `${task.name} (${task.lateStart}→${task.lateEnd})`;
        barContainer.appendChild(lateBar);

        // Barre "au plus tôt" (en bas)
        const earlyBar = document.createElement('div');
        const earlyBg = isCritical ? '#ff4444' : '#4caf50';
        earlyBar.style.cssText = `
            position:absolute;
            bottom:6px;
            left:${task.start * scale}px;
            width:${task.duration * scale}px;
            height:26px;
            background:${earlyBg};
            color:white;
            font-size:11px;
            font-weight:bold;
            line-height:26px;
            text-align:center;
            border-radius:4px;
            overflow:hidden;
            white-space:nowrap;
            text-overflow:ellipsis;
            padding:0 4px;
            box-sizing:border-box;
            z-index:2;
        `;
        earlyBar.title = `${task.name} — Au plus tôt : [${task.start} → ${task.end}]`;
        earlyBar.innerText = `${task.name} (${task.start}→${task.end})`;
        barContainer.appendChild(earlyBar);

        // Barre de marge libre (au milieu)
        if (task.ml && task.ml > 0) {
            const freeBar = document.createElement('div');
            freeBar.style.cssText = `
                position:absolute;
                top:50%;
                transform:translateY(-50%);
                left:${task.end * scale}px;
                width:${task.ml * scale}px;
                height:18px;
                background:#ffc107;
                border-radius:3px;
                opacity:0.9;
                z-index:0;
            `;
            freeBar.title = `${task.name} — Marge libre : ${task.ml}`;
            barContainer.appendChild(freeBar);
        }
    });
}

// ------------------------------------------------------------------
//  Réinitialisation des données
// ------------------------------------------------------------------
function resetData() {
    if (!confirm('Voulez-vous vraiment supprimer toutes les tâches ?')) return;
    tasks = [];
    saveTasksToStorage();
    updateTaskList();
    const resultTbody = document.querySelector('#result tbody');
    if (resultTbody) resultTbody.innerHTML = '';
    const ganttDiv = document.getElementById('gantt');
    if (ganttDiv) ganttDiv.innerHTML = '';
    alert('Toutes les tâches ont été supprimées.');
}

// ------------------------------------------------------------------
//  Initialisation
// ------------------------------------------------------------------
function init() {
    loadTasksFromStorage();
    updateTaskList();
    if (tasks.length > 0 && tasks[0].start !== null) {
        displayResult();
        drawGantt();
    }
}

// Lancer l'initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', init);