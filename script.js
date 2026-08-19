// --- App State ---
let tasks = JSON.parse(localStorage.getItem('dailyFlowTasks')) || [];
let isDarkMode = localStorage.getItem('dailyFlowTheme') === 'dark';

// --- DOM Elements ---
const taskForm = document.getElementById('task-form');
const taskNameInput = document.getElementById('task-name');
const taskTimeInput = document.getElementById('task-time');
const taskImportantInput = document.getElementById('task-important');
const taskReminderInput = document.getElementById('task-reminder');

const activeTasksList = document.getElementById('active-tasks');
const completedTasksList = document.getElementById('completed-tasks');
const activeCount = document.getElementById('active-count');
const completedCount = document.getElementById('completed-count');

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const currentDateEl = document.getElementById('current-date');
const toastContainer = document.getElementById('toast-container');
const digitalClockEl = document.getElementById('digital-clock');

// --- Timer Elements ---
const timerHoursEl = document.getElementById('timer-hours');
const timerMinutesEl = document.getElementById('timer-minutes');
const timerSecondsEl = document.getElementById('timer-seconds');
const timerStartBtn = document.getElementById('timer-start');
const timerPauseBtn = document.getElementById('timer-pause');
const timerResetBtn = document.getElementById('timer-reset');

// --- Initialization ---
function init() {
  // Set Current Date
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDateEl.textContent = new Date().toLocaleDateString(undefined, options);

  // Apply Theme
  applyTheme(isDarkMode);

  // Request Notification Permission if needed
  if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }

  // Render Tasks
  renderTasks();

  // Start Reminder Loop (runs every 10 seconds)
  setInterval(checkReminders, 10000);

  // Initialize Clock and Timer
  startClock();
  updateTimerDisplay();
}

// --- Theme Management ---
function toggleTheme() {
  isDarkMode = !isDarkMode;
  localStorage.setItem('dailyFlowTheme', isDarkMode ? 'dark' : 'light');
  applyTheme(isDarkMode);
}

function applyTheme(dark) {
  if (dark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.innerHTML = '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
  }
}

themeToggle.addEventListener('click', toggleTheme);

// --- Task Management ---
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = taskNameInput.value.trim();
  const time = taskTimeInput.value;
  const important = taskImportantInput.checked;
  const reminder = taskReminderInput.checked;

  if (name && time) {
    const newTask = {
      id: Date.now().toString(),
      name,
      time,
      important,
      reminder,
      completed: false,
      notified: false
    };

    tasks.push(newTask);
    saveAndRender();
    taskForm.reset();
  }
});

function toggleTaskStatus(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveAndRender();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveAndRender();
}

function saveAndRender() {
  // Sort tasks by time
  tasks.sort((a, b) => a.time.localeCompare(b.time));
  localStorage.setItem('dailyFlowTasks', JSON.stringify(tasks));
  renderTasks();
}

// --- Rendering ---
function renderTasks() {
  activeTasksList.innerHTML = '';
  completedTasksList.innerHTML = '';

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  activeCount.textContent = activeTasks.length;
  completedCount.textContent = completedTasks.length;

  activeTasks.forEach(task => {
    activeTasksList.appendChild(createTaskElement(task));
  });

  completedTasks.forEach(task => {
    completedTasksList.appendChild(createTaskElement(task));
  });
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item ${task.important ? 'important' : ''} ${task.completed ? 'completed' : ''}`;
  
  const formattedTime = new Date(`1970-01-01T${task.time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  li.innerHTML = `
    <div class="task-info">
      <div class="task-name">${task.name}</div>
      <div class="task-meta">
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          ${formattedTime}
        </span>
        ${task.reminder ? `
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </span>
        ` : ''}
      </div>
    </div>
    <div class="task-actions">
      <button class="action-btn complete-btn" onclick="toggleTaskStatus('${task.id}')" aria-label="Toggle Complete">
        ${task.completed ? 
          '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>' : 
          '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
        }
      </button>
      <button class="action-btn delete-btn" onclick="deleteTask('${task.id}')" aria-label="Delete">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>
  `;
  
  return li;
}

// --- Reminders ---
function checkReminders() {
  const now = new Date();
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;

  let needsSave = false;

  tasks.forEach(task => {
    if (!task.completed && task.reminder && !task.notified) {
      if (task.time <= currentTime) {
        showToast(`Time for: ${task.name}`, 'Reminder');
        sendBrowserNotification(task.name);
        task.notified = true;
        needsSave = true;
      }
    }
  });

  if (needsSave) {
    localStorage.setItem('dailyFlowTasks', JSON.stringify(tasks));
  }
}

function showToast(message, title = "Notification") {
  const toast = document.createElement('div');
  toast.className = 'toast';
  
  toast.innerHTML = `
    <div class="toast-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
    </div>
    <div class="toast-content">
      <h4>${title}</h4>
      <p>${message}</p>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

function sendBrowserNotification(taskName) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Daily Flow Reminder", {
      body: `It's time to: ${taskName}`,
      icon: 'https://cdn-icons-png.flaticon.com/512/825/825590.png' // Generic checklist icon for the notification
    });
  }
}

// Boot up is moved to the bottom

// --- Clock and Timer ---
function startClock() {
  function updateClock() {
    const now = new Date();
    digitalClockEl.textContent = now.toLocaleTimeString([], { hour12: false });
  }
  updateClock();
  setInterval(updateClock, 1000);
}

let timerInterval;
let timerSeconds = 0;
let initialTimerSeconds = 0;
let isTimerRunning = false;

function updateTimerDisplay() {
  const hrs = Math.floor(timerSeconds / 3600);
  const mins = Math.floor((timerSeconds % 3600) / 60);
  const secs = timerSeconds % 60;
  timerHoursEl.value = hrs.toString().padStart(2, '0');
  timerMinutesEl.value = mins.toString().padStart(2, '0');
  timerSecondsEl.value = secs.toString().padStart(2, '0');
}

function handleTimeInput() {
  let h = parseInt(timerHoursEl.value) || 0;
  let m = parseInt(timerMinutesEl.value) || 0;
  let s = parseInt(timerSecondsEl.value) || 0;
  if(h < 0) h = 0;
  if(m < 0) m = 0;
  if(s < 0) s = 0;
  if(m > 59) m = 59;
  if(s > 59) s = 59;
  
  timerHoursEl.value = h.toString().padStart(2, '0');
  timerMinutesEl.value = m.toString().padStart(2, '0');
  timerSecondsEl.value = s.toString().padStart(2, '0');
  
  timerSeconds = h * 3600 + m * 60 + s;
  initialTimerSeconds = timerSeconds;
}

timerHoursEl.addEventListener('change', handleTimeInput);
timerMinutesEl.addEventListener('change', handleTimeInput);
timerSecondsEl.addEventListener('change', handleTimeInput);

function startTimer() {
  if (isTimerRunning) return;
  
  // Make sure we have the latest input
  handleTimeInput();
  if (timerSeconds <= 0) return;

  isTimerRunning = true;
  timerHoursEl.readOnly = true;
  timerMinutesEl.readOnly = true;
  timerSecondsEl.readOnly = true;
  
  timerInterval = setInterval(() => {
    if (timerSeconds > 0) {
      timerSeconds--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      isTimerRunning = false;
      timerHoursEl.readOnly = false;
      timerMinutesEl.readOnly = false;
      timerSecondsEl.readOnly = false;
      showToast('Focus session completed!', 'Focus Timer');
      sendBrowserNotification('Focus session completed!');
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  timerHoursEl.readOnly = false;
  timerMinutesEl.readOnly = false;
  timerSecondsEl.readOnly = false;
}

function resetTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  timerHoursEl.readOnly = false;
  timerMinutesEl.readOnly = false;
  timerSecondsEl.readOnly = false;
  timerSeconds = initialTimerSeconds;
  updateTimerDisplay();
}

timerStartBtn.addEventListener('click', startTimer);
timerPauseBtn.addEventListener('click', pauseTimer);
timerResetBtn.addEventListener('click', resetTimer);

// Boot up
init();
