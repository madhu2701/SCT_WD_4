const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const timeInput = document.getElementById('timeInput');
const priorityInput = document.getElementById('priorityInput');
const categoryInput = document.getElementById('categoryInput');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

const totalTasksElem = document.getElementById('totalTasks');
const completedTasksElem = document.getElementById('completedTasks');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const celebration = document.getElementById('celebration');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

document.getElementById('addTaskBtn').onclick = addTask;
sortSelect.onchange = () => renderTasks(currentFilter);
searchInput.oninput = () => renderTasks(currentFilter);

function addTask() {
    if (!taskInput.value.trim()) return;

    tasks.push({
        id: Date.now(),
        text: taskInput.value,
        date: dateInput.value,
        time: timeInput.value,
        priority: priorityInput.value,
        category: categoryInput.value,
        completed: false
    });

    save();
}

function renderTasks(filter) {
    taskList.innerHTML = '';
    currentFilter = filter;

    let filtered = tasks.filter(t => {
        if (filter === 'pending') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
    });

    filtered = filtered.filter(t =>
        t.text.toLowerCase().includes(searchInput.value.toLowerCase())
    );

    filtered = applySorting(filtered);

    filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''} ${getDueClass(task)}`;

        li.innerHTML = `
            <h3>${task.text}
                <span class="category-badge cat-${task.category}">${task.category}</span>
            </h3>
            <button onclick="toggle(${task.id})">✔</button>
        `;
        taskList.appendChild(li);
    });

    updateStats();
}

function applySorting(list) {
    switch (sortSelect.value) {
        case 'date': return list.sort((a,b)=>new Date(a.date||0)-new Date(b.date||0));
        case 'priority':
            const p={high:1,medium:2,low:3};
            return list.sort((a,b)=>p[a.priority]-p[b.priority]);
        case 'name': return list.sort((a,b)=>a.text.localeCompare(b.text));
        case 'status': return list.sort((a,b)=>a.completed-b.completed);
        default: return list;
    }
}

function getDueClass(task) {
    if (!task.date || task.completed) return '';
    const today = new Date().setHours(0,0,0,0);
    const due = new Date(task.date).setHours(0,0,0,0);
    if (due < today) return 'task-overdue';
    if (due === today) return 'task-today';
    return '';
}

function toggle(id) {
    const t = tasks.find(x => x.id === id);
    t.completed = !t.completed;
    save();
}

function updateStats() {
    totalTasksElem.textContent = tasks.length;
    const done = tasks.filter(t=>t.completed).length;
    completedTasksElem.textContent = done;

    const percent = tasks.length ? Math.round(done / tasks.length * 100) : 0;
    progressFill.style.width = percent + '%';
    progressText.textContent = percent + '% Completed';

    if (tasks.length && done === tasks.length) {
        celebration.classList.remove('hidden');
        setTimeout(()=>celebration.classList.add('hidden'),3000);
    }
}

function save() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks(currentFilter);
}

window.filterTasks = renderTasks;
