// ============================================================
//  FICHIER UNIQUE POUR gantt.html ET gantt_successeur.html
// ============================================================

let tasks = [];
let currentPage = '';   // 'main' ou 'successor'

// ------------------------------------------------------------------
//  Détection de la page (basée sur des éléments uniques)
// ------------------------------------------------------------------
function detectPage() {
    // Si l'élément #taskList existe, c'est la page principale
    if (document.getElementById('taskList')) {
        currentPage = 'main';
    }
    // Sinon, si un lien vers gantt.html est présent, c'est la page successeur
    else if (document.querySelector('a[href="gantt.html"]')) {
        currentPage = 'successor';
    }
    // Fallback : on peut aussi tester la présence d'un titre spécifique
    else if (document.querySelector('h2') && document.querySelector('h2').innerText.includes('Successeurs')) {
        currentPage = 'successor';
    }
    else {
        // Par défaut, on considère que c'est la page principale
        currentPage = 'main';
    }
}

// ------------------------------------------------------------------
//  Chargement / Sauvegarde localStorage
// ------------------------------------------------------------------
function loadTasksFromStorage() {
    const stored = localStorage.getItem('tasks');
    if (stored) {
        tasks = JSON.parse(stored);
        // S'assurer que chaque tâche a toutes les propriétés nécessaires
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
//  Fonctions communes (ajout, etc.)
// ------------------------------------------------------------------
function addTask() {
    let name = document.getElementById('name').value.trim();
    let duration = parseInt(document.getElementById('duration').value);
    let deps = document.getElementById('deps').value.trim();

    if (!name || isNaN(duration) || duration <= 0) {
        alert('Veuillez entrer un nom valide et une durée positive.');
        return;
    }

    // Vérifier doublon
    if (tasks.some(t => t.name === name)) {
        alert('Une tâche avec ce nom existe déjà.');
        return;
    }

    let dependencies = deps ? deps.split(',').map(d => d.trim()) : [];

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

    // Réinitialiser les champs du formulaire
    document.getElementById('name').value = '';
    document.getElementById('duration').value = '';
    document.getElementById('deps').value = '';

    // Rafraîchir l'affichage selon la page courante
    if (currentPage === 'main') {
        updateTaskList();
        // Effacer les résultats précédents
        if (document.querySelector('#result tbody')) {
            document.querySelector('#result tbody').innerHTML = '';
        }
        const ganttDiv = document.getElementById('gantt');
        if (ganttDiv) ganttDiv.innerHTML = '';
    } else {
        // Sur la page successeur, on recalcule tout avec les nouvelles données
        if (tasks.length > 0) {
            calculate();
        } else {
            // Réinitialiser l'affichage
            if (document.querySelector('#result tbody')) {
                document.querySelector('#result tbody').innerHTML = '';
            }
            const ganttDiv = document.getElementById('gantt');
            if (ganttDiv) ganttDiv.innerHTML = '';
        }
    }
}

// ------------------------------------------------------------------
//  PAGE PRINCIPALE (gantt.html)
// ------------------------------------------------------------------
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
    tasks.forEach(task => {
        const th = document.createElement('th');
        th.textContent = task.name;
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
    tasks.forEach(task => {
        const td = document.createElement('td');
        td.textContent = task.duration;
        durationRow.appendChild(td);
    });
    tbody.appendChild(durationRow);

    // Dépendances
    const depsRow = document.createElement('tr');
    const depsLabel = document.createElement('th');
    depsLabel.textContent = 'Dépendances';
    depsRow.appendChild(depsLabel);
    tasks.forEach(task => {
        const td = document.createElement('td');
        td.textContent = task.dependencies.join(', ');
        depsRow.appendChild(td);
    });
    tbody.appendChild(depsRow);

    table.appendChild(tbody);
}

function displayResultMain() {
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
        row.insertCell(4).innerText = t.lateStart;
        row.insertCell(5).innerText = t.lateEnd;
        row.insertCell(6).innerText = t.mt;
        row.insertCell(7).innerText = t.ml;
    });
}

function drawGanttMain() {
    const container = document.getElementById('gantt');
    if (!container) return;
    container.innerHTML = '';

    if (tasks.some(t => t.start === null)) {
        container.innerHTML = '<p>Veuillez d’abord cliquer sur "Calculer".</p>';
        return;
    }

    // 1. Déterminer la durée totale du projet
    const projectDuration = Math.max(...tasks.map(t => t.end));
    const scale = 40;               // pixels par unité de temps
    const timeMarkInterval = 5;     // intervalle des graduations (ajustable)
    const totalWidth = projectDuration * scale;

    // 2. Créer la structure principale : tableau flexible
    const ganttTable = document.createElement('div');
    ganttTable.className = 'gantt-table';
    container.appendChild(ganttTable);

    // 3. Ligne d'en-tête : les numéros de temps
    const headerRow = document.createElement('div');
    headerRow.className = 'gantt-header';
    ganttTable.appendChild(headerRow);

    // Colonne vide pour l'alignement (les noms des tâches)
    const labelCol = document.createElement('div');
    labelCol.className = 'gantt-label-cell';
    headerRow.appendChild(labelCol);

    // Zone des graduations
    const timeScale = document.createElement('div');
    timeScale.className = 'gantt-time-scale';
    timeScale.style.width = totalWidth + 'px';
    headerRow.appendChild(timeScale);

    // Ajouter les repères de temps (graduations)
    for (let t = 0; t <= projectDuration; t += timeMarkInterval) {
        const mark = document.createElement('div');
        mark.className = 'gantt-time-mark';
        mark.style.left = (t * scale) + 'px';
        mark.innerText = t;
        timeScale.appendChild(mark);
    }

    // 4. Pour chaque tâche, créer une ligne
    tasks.forEach(task => {
        const taskRow = document.createElement('div');
        taskRow.className = 'gantt-row';
        ganttTable.appendChild(taskRow);

        // Colonne avec le nom de la tâche
        const taskLabel = document.createElement('div');
        taskLabel.className = 'gantt-label-cell';
        taskLabel.innerText = task.name;
        taskRow.appendChild(taskLabel);

        // Conteneur de la barre
        const barContainer = document.createElement('div');
        barContainer.className = 'gantt-bar-container';
        barContainer.style.width = totalWidth + 'px';
        taskRow.appendChild(barContainer);

        // Barre elle-même
        const bar = document.createElement('div');
        bar.className = 'bar';
        if (task.mt === 0) bar.classList.add('critical');
        bar.style.width = (task.duration * scale) + 'px';
        bar.style.marginLeft = (task.start * scale) + 'px';
        bar.innerText = task.name;
        barContainer.appendChild(bar);
    });
}

function calculateMain() {
    if (tasks.length === 0) {
        alert('Ajoutez au moins une tâche avant de calculer.');
        return;
    }

    // Réinitialiser les champs de calcul
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

    // ----- 1. Dates au plus tôt (récursif) -----
    function calcEarly(task) {
        if (task.start !== null) return;
        if (task.dependencies.length === 0) {
            task.start = 0;
        } else {
            let maxEnd = 0;
            task.dependencies.forEach(dep => {
                const depTask = map[dep];
                if (!depTask) {
                    alert(`Dépendance inconnue : ${dep} pour la tâche ${task.name}`);
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

    // Durée totale du projet
    const projectDuration = Math.max(...tasks.map(t => t.end));

    // ----- 2. Dates au plus tard -----
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

    // ----- 3. Marges -----
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
    displayResultMain();
    drawGanttMain();
}

// ------------------------------------------------------------------
//  PAGE SUCCESSEURS (gantt_successeur.html)
// ------------------------------------------------------------------
function buildSuccessors() {
    tasks.forEach(t => t.successors = []);
    tasks.forEach(t => {
        t.dependencies.forEach(dep => {
            const parent = tasks.find(x => x.name === dep);
            if (parent) parent.successors.push(t.name);
        });
    });
}

function displayResultSuccessor() {
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

function drawGanttSuccessor() {
    const container = document.getElementById('gantt');
    if (!container) return;
    container.innerHTML = '';

    if (tasks.some(t => t.start === null)) {
        container.innerHTML = '<p>Veuillez d’abord cliquer sur "Calculer".</p>';
        return;
    }

    const scale = 40;
    tasks.forEach(t => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        if (t.mt === 0) bar.style.background = 'red';
        bar.style.marginLeft = (t.start * scale) + 'px';
        bar.style.width = (t.duration * scale) + 'px';
        bar.innerText = t.name + ' → ' + t.successors.join(',');
        container.appendChild(bar);
    });
}

function calculateSuccessor() {
    if (tasks.length === 0) {
        alert('Ajoutez au moins une tâche avant de calculer.');
        return;
    }

    buildSuccessors();

    // Réinitialiser les champs de calcul
    tasks.forEach(t => {
        t.start = null;
        t.end = null;
        t.lateStart = null;
        t.lateEnd = null;
        t.mt = 0;
    });

    const map = {};
    tasks.forEach(t => map[t.name] = t);

    // ----- 1. Dates au plus tôt -----
    function calcEarly(task) {
        if (task.start !== null) return;
        if (task.dependencies.length === 0) {
            task.start = 0;
        } else {
            let maxEnd = 0;
            task.dependencies.forEach(dep => {
                const depTask = map[dep];
                if (!depTask) {
                    alert(`Dépendance inconnue : ${dep} pour la tâche ${task.name}`);
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

    // ----- 2. Dates au plus tard (avec successeurs) -----
    function calcLate(task) {
        if (task.lateEnd !== null) return;
        if (task.successors.length === 0) {
            task.lateEnd = projectDuration;
        } else {
            let minStart = Infinity;
            task.successors.forEach(succName => {
                const succTask = map[succName];
                if (!succTask) {
                    alert(`Successeur inconnu : ${succName} pour la tâche ${task.name}`);
                    return;
                }
                calcLate(succTask);
                if (succTask.lateStart < minStart) minStart = succTask.lateStart;
            });
            task.lateEnd = minStart;
        }
        task.lateStart = task.lateEnd - task.duration;
    }

    tasks.forEach(t => calcLate(t));

    // ----- 3. Marge -----
    tasks.forEach(t => {
        t.mt = t.lateStart - t.start;
    });

    saveTasksToStorage();
    displayResultSuccessor();
    drawGanttSuccessor();
}

// ------------------------------------------------------------------
//  Fonction commune "calculate" qui appelle la bonne méthode
// ------------------------------------------------------------------
function calculate() {
    if (currentPage === 'main') {
        calculateMain();
    } else {
        calculateSuccessor();
    }
}

function generateGantt() {
    if (currentPage === 'main') {
        drawGanttMain();
    } else {
        drawGanttSuccessor();
    }
}

// ------------------------------------------------------------------
//  Initialisation au chargement
// ------------------------------------------------------------------
function init() {
    detectPage();
    loadTasksFromStorage();

    if (currentPage === 'main') {
        // Afficher la liste des tâches
        updateTaskList();
        // Si des tâches existent déjà et ont été calculées, on affiche les résultats
        if (tasks.length > 0 && tasks[0].start !== null) {
            displayResultMain();
            drawGanttMain();
        } else if (tasks.length > 0) {
            // Les tâches sont présentes mais non calculées : rien de plus
        }
    } else if (currentPage === 'successor') {
        // Sur la page successeur, on calcule et affiche si des tâches sont chargées
        if (tasks.length > 0) {
            calculateSuccessor();
        } else {
            // Afficher un message dans le diagramme si aucune tâche
            const ganttDiv = document.getElementById('gantt');
            if (ganttDiv) ganttDiv.innerHTML = '<p>Aucune tâche à afficher. Ajoutez des tâches depuis la page principale.</p>';
        }
    }
}

// ------------------------------------------------------------------
//  Réinitialisation complète des données
// ------------------------------------------------------------------
function resetData() {
    // Vider le tableau des tâches
    tasks = [];
    
    // Sauvegarder le tableau vide dans localStorage
    saveTasksToStorage();
    
    // Réinitialiser l'affichage en fonction de la page
    if (currentPage === 'main') {
        // Réafficher la liste des tâches (vide)
        updateTaskList();
        
        // Vider le tableau des résultats
        const resultTbody = document.querySelector('#result tbody');
        if (resultTbody) resultTbody.innerHTML = '';
        
        // Vider le diagramme
        const ganttDiv = document.getElementById('gantt');
        if (ganttDiv) ganttDiv.innerHTML = '';
    } else if (currentPage === 'successor') {
        // Sur la page successeur, on recalcule (ce qui affichera un message ou rien)
        if (tasks.length === 0) {
            const resultTbody = document.querySelector('#result tbody');
            if (resultTbody) resultTbody.innerHTML = '';
            const ganttDiv = document.getElementById('gantt');
            if (ganttDiv) ganttDiv.innerHTML = '<p>Aucune tâche à afficher. Ajoutez des tâches depuis la page principale.</p>';
        }
    }
    
    // Optionnel : afficher un message de confirmation
    alert('Toutes les tâches ont été supprimées.');
}

// Lancer l'initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', init);