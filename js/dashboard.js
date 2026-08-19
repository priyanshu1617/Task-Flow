const Dashboard = {
  categoryColors: {},

  renderStats: () => {
    const stats = TaskManager.getStats();
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-completed').textContent = stats.completed;
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-overdue').textContent = stats.overdue;
    document.getElementById('stat-priority').textContent = stats.highPriority;

    const percentText = document.getElementById('stat-completed-percent');
    if (stats.total > 0) {
      const p = Math.round((stats.completed / stats.total) * 100);
      percentText.textContent = `${p}% done`;
    } else {
      percentText.textContent = `0% done`;
    }

    // Nav counts
    document.getElementById('badge-today').textContent = stats.countToday;
    document.getElementById('badge-upcoming').textContent = stats.countUpcoming;
    document.getElementById('badge-completed').textContent = stats.completed;

    // Progress circle
    document.getElementById('progress-completed').textContent = stats.completedThisMonth;
    document.getElementById('progress-total').textContent = stats.totalThisMonth;
    document.getElementById('progress-text-percent').textContent = `${stats.progressPercent}%`;
    
    // Circle math (circumference = 2 * pi * r = 2 * 3.14159 * 30 = 188.5)
    const circle = document.getElementById('progress-circle-fill');
    const offset = 188.5 - (188.5 * stats.progressPercent) / 100;
    setTimeout(() => {
      if (circle) circle.style.strokeDashoffset = offset;
    }, 50);

    // Streak
    const streakCount = document.getElementById('streak-count');
    const fireIcon = document.getElementById('fire-icon');
    if (streakCount) streakCount.textContent = stats.currentStreak;
    if (fireIcon) {
      if (stats.currentStreak > 0) {
        fireIcon.classList.remove('no-streak');
      } else {
        fireIcon.classList.add('no-streak');
      }
    }
  },

  renderCategories: () => {
    const list = document.getElementById('category-list');
    const select = document.getElementById('task-category');
    if (!list || !select) return;

    list.innerHTML = '';
    select.innerHTML = '<option value="" disabled selected>Select Category</option>';
    Dashboard.categoryColors = {};

    TaskManager.categories.forEach(c => {
      Dashboard.categoryColors[c.name] = c.color;
      
      // Sidebar Item
      const div = document.createElement('div');
      div.className = 'nav-item';
      if (TaskManager.currentCategory === c.name) div.classList.add('active');
      div.dataset.category = c.name;
      div.innerHTML = `
        <div class="nav-item-left">
          <span class="category-dot" style="background: ${c.color};"></span>
          <span>${c.name}</span>
        </div>
        <i class="ph ph-trash text-muted delete-cat-btn" onclick="event.stopPropagation(); app.deleteCategory('${c.name}')" title="Delete category"></i>
      `;
      list.appendChild(div);

      // Modal Select Option
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.textContent = c.name;
      select.appendChild(opt);
    });
    
    // Bind click events for new sidebar items
    app.bindSidebarEvents();
  },

  renderTasks: () => {
    const container = document.getElementById('task-list-container');
    const filteredTasks = TaskManager.getFilteredTasks();
    
    // Update header
    let title = 'Tasks';
    if (TaskManager.currentCategory) title = `${TaskManager.currentCategory} Tasks`;
    else if (TaskManager.currentFilter === 'today') title = "Today's Tasks";
    else if (TaskManager.currentFilter === 'upcoming') title = "Upcoming Tasks";
    else if (TaskManager.currentFilter === 'completed') title = "Completed Tasks";
    else if (TaskManager.currentFilter === 'important') title = "Important Tasks";
    else if (TaskManager.currentFilter === 'all') title = "Dashboard Overview";

    document.getElementById('current-view-title').innerHTML = `${title} <span class="badge" id="current-view-count">${filteredTasks.length}</span>`;

    container.innerHTML = '';
    
    if (filteredTasks.length === 0) {
      container.innerHTML = `<div class="empty-state-text" style="text-align:center; padding: 40px;">No tasks found. Relax or add a new one!</div>`;
      return;
    }

    filteredTasks.forEach(task => {
      const color = Dashboard.categoryColors[task.category] || '#94a3b8';
      let priorityHTML = '';
      if (task.priority === 'High') {
        priorityHTML = `<span class="badge badge-danger"><i class="ph ph-arrow-up"></i> High</span>`;
      } else if (task.priority === 'Medium') {
        priorityHTML = `<span class="badge badge-warning"><i class="ph ph-minus"></i> Medium</span>`;
      } else {
        priorityHTML = `<span class="badge badge-success"><i class="ph ph-arrow-down"></i> Low</span>`;
      }

      const dateObj = new Date(task.date);
      const todayStr = new Date().toISOString().split('T')[0];
      let dateDisplay = task.date === todayStr ? 'Today' : dateObj.toLocaleDateString([], {month: 'short', day: 'numeric'});
      if (task.time) dateDisplay += `, ${task.time}`;

      const el = document.createElement('div');
      el.className = `task-item ${task.completed ? 'completed' : ''}`;
      el.innerHTML = `
        <div class="task-item-left">
          <div class="custom-checkbox" onclick="app.toggleTask('${task.id}')">
            <i class="ph-bold ph-check"></i>
          </div>
          <div class="task-info">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
              <span><span class="task-category-dot" style="background: ${color};"></span> ${task.category}</span>
              <span><i class="ph ph-calendar-blank"></i> ${dateDisplay}</span>
            </div>
          </div>
        </div>
        <div class="task-item-right">
          ${priorityHTML}
          <button class="star-btn ${task.priority==='High'?'active':''}" onclick="app.toggleImportant('${task.id}')">
            <i class="ph-fill ph-star"></i>
          </button>
          <button class="btn-icon" onclick="app.deleteTask('${task.id}')" style="width: 32px; height: 32px;">
            <i class="ph ph-trash"></i>
          </button>
        </div>
      `;
      container.appendChild(el);
    });
  },

  renderUpcoming: () => {
    const list = document.getElementById('upcoming-widget-list');
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = TaskManager.tasks.filter(t => !t.completed && t.date > todayStr)
      .sort((a,b) => a.date.localeCompare(b.date))
      .slice(0, 4);

    list.innerHTML = '';
    if (upcoming.length === 0) {
      list.innerHTML = '<div class="text-muted text-sm">No upcoming tasks.</div>';
      return;
    }

    upcoming.forEach(task => {
      const color = Dashboard.categoryColors[task.category] || '#94a3b8';
      const dateObj = new Date(task.date);
      const dStr = dateObj.toLocaleDateString([], {month: 'short', day: 'numeric'});
      const el = document.createElement('div');
      el.className = 'upcoming-item';
      el.innerHTML = `
        <div class="upcoming-left">
          <span class="task-category-dot" style="background: ${color};"></span>
          <span>${task.title}</span>
        </div>
        <div class="upcoming-date">${dStr}</div>
      `;
      list.appendChild(el);
    });
  },

  showModal: () => {
    document.getElementById('task-modal').classList.add('active');
    document.getElementById('task-title').focus();
  },

  hideModal: () => {
    document.getElementById('task-modal').classList.remove('active');
    document.getElementById('task-form').reset();
    document.getElementById('task-id').value = '';
    document.getElementById('modal-title').textContent = 'Add New Task';
  },

  showToast: (message) => {
    const container = document.getElementById('toast-container');
    if (!container) return; // if it wasn't added yet
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.background = 'var(--bg-card)';
    toast.style.color = 'var(--text-primary)';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = 'var(--shadow-md)';
    toast.style.marginBottom = '10px';
    toast.style.borderLeft = '4px solid var(--primary-color)';
    toast.textContent = message;
    
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  applyTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.checked = theme === 'dark';
    }
    const headerIcon = document.getElementById('header-theme-icon');
    if (headerIcon) {
      if (theme === 'dark') {
        headerIcon.className = 'ph ph-sun';
      } else {
        headerIcon.className = 'ph ph-moon';
      }
    }
  }
};
