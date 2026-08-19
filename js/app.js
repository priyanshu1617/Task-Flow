// Create Toast Container if it doesn't exist
if (!document.getElementById('toast-container')) {
  const tc = document.createElement('div');
  tc.id = 'toast-container';
  tc.style.position = 'fixed';
  tc.style.bottom = '20px';
  tc.style.right = '20px';
  tc.style.zIndex = '9999';
  document.body.appendChild(tc);
}

const app = {
  init: () => {
    // 1. Init Theme
    const savedTheme = Storage.getTheme();
    Dashboard.applyTheme(savedTheme);

    // 2. Init State
    TaskManager.init();

    // 3. Init Widgets
    if (typeof TimeWidget !== 'undefined') TimeWidget.init();

    // 4. Bind Events
    app.bindEvents();

    // 5. Initial Render
    app.fullRender();
  },

  fullRender: () => {
    Dashboard.renderCategories();
    Dashboard.renderStats();
    Dashboard.renderTasks();
    Dashboard.renderUpcoming();
    Calendar.render();
  },

  bindEvents: () => {
    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent opening profile modal if clicked inside
        localStorage.removeItem('isLoggedIn');
        window.location.replace('index.html');
      });
    }

    // Profile Modal
    const profileTrigger = document.getElementById('profile-trigger');
    const profileModal = document.getElementById('profile-modal');
    const closeProfileBtn = document.getElementById('close-profile-modal-btn');
    const loggedInUsername = localStorage.getItem('username') || 'Priyanshu';

    // Update Sidebar display
    if (profileTrigger) {
      const sidebarAvatar = profileTrigger.querySelector('.avatar');
      const sidebarName = profileTrigger.querySelector('h4');
      if (sidebarAvatar) sidebarAvatar.src = `https://ui-avatars.com/api/?name=${loggedInUsername}&background=6c5ce7&color=fff`;
      if (sidebarName) sidebarName.textContent = loggedInUsername;
    }

    if (profileTrigger && profileModal) {
      profileTrigger.addEventListener('click', () => {
        profileModal.classList.add('active');
        
        // Dynamically update
        const username = localStorage.getItem('username') || 'Priyanshu';
        
        document.getElementById('profile-modal-username').textContent = username;
        document.getElementById('profile-modal-avatar').src = `https://ui-avatars.com/api/?name=${username}&background=6c5ce7&color=fff`;
      });

      closeProfileBtn.addEventListener('click', () => {
        profileModal.classList.remove('active');
      });

      profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) {
          profileModal.classList.remove('active');
        }
      });
    }

    // Theme Toggle (Sidebar)
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('change', (e) => {
        const newTheme = e.target.checked ? 'dark' : 'light';
        Dashboard.applyTheme(newTheme);
        Storage.saveTheme(newTheme);
      });
    }

    // Theme Toggle (Header)
    const headerThemeToggle = document.getElementById('header-theme-toggle');
    if (headerThemeToggle) {
      headerThemeToggle.addEventListener('click', () => {
        const currentTheme = Storage.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        Dashboard.applyTheme(newTheme);
        Storage.saveTheme(newTheme);
      });
    }

    // Modal Triggers
    document.getElementById('open-add-modal-btn').addEventListener('click', () => {
      document.getElementById('task-date').value = new Date().toISOString().split('T')[0];
      Dashboard.showModal();
    });
    
    document.getElementById('close-modal-btn').addEventListener('click', Dashboard.hideModal);
    document.getElementById('cancel-modal-btn').addEventListener('click', Dashboard.hideModal);

    // Form Submit
    document.getElementById('task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const id = document.getElementById('task-id').value;
      const title = document.getElementById('task-title').value.trim();
      const category = document.getElementById('task-category').value;
      const priority = document.getElementById('task-priority').value;
      const date = document.getElementById('task-date').value;
      const time = document.getElementById('task-time').value;

      if (!title || !date) return;

      const data = { title, category, priority, date, time };

      if (id) {
        TaskManager.updateTask(id, data);
        Dashboard.showToast('Task updated successfully!');
      } else {
        TaskManager.addTask(data);
        Dashboard.showToast('Task added successfully!');
      }

      Dashboard.hideModal();
      app.fullRender();
    });

    // Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        TaskManager.searchQuery = e.target.value;
        Dashboard.renderTasks();
      });
    }

    // Add Category
    const addCategoryBtn = document.querySelector('.add-category-btn');
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener('click', () => {
        const name = prompt("Enter new category name:");
        if (name && name.trim()) {
          const success = TaskManager.addCategory(name.trim());
          if (success) {
            Dashboard.showToast(`Category '${name.trim()}' added!`);
            Dashboard.renderCategories();
          } else {
            Dashboard.showToast(`Category '${name.trim()}' already exists!`);
          }
        }
      });
    }

    // Sidebar Navigation & Filters (initial static items)
    const filters = document.querySelectorAll('.nav-section .nav-item[data-filter]');
    filters.forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.nav-section .nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        TaskManager.currentFilter = item.dataset.filter;
        TaskManager.currentCategory = null;
        Dashboard.renderTasks();
      });
    });

    // Calendar Navigation
    const calLeft = document.querySelector('.ph-caret-left');
    const calRight = document.querySelector('.ph-caret-right');
    if (calLeft) calLeft.addEventListener('click', () => Calendar.prevMonth());
    if (calRight) calRight.addEventListener('click', () => Calendar.nextMonth());
  },

  bindSidebarEvents: () => {
    // Re-bind only dynamic category items, without breaking static filters
    const catItems = document.querySelectorAll('#category-list .nav-item');
    catItems.forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.nav-section .nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        TaskManager.currentCategory = item.dataset.category;
        TaskManager.currentFilter = null;
        Dashboard.renderTasks();
      });
    });
  },



  // Actions exposed for onclick attributes in dynamically generated HTML
  toggleTask: (id) => {
    TaskManager.toggleComplete(id);
    app.fullRender();
  },

  toggleImportant: (id) => {
    TaskManager.toggleImportant(id);
    app.fullRender();
  },

  deleteTask: (id) => {
    if (confirm("Are you sure you want to delete this task?")) {
      TaskManager.deleteTask(id);
      app.fullRender();
      Dashboard.showToast("Task deleted.");
    }
  },

  deleteCategory: (name) => {
    if (confirm(`Are you sure you want to delete the category '${name}'? Tasks in this category will be moved to a default category.`)) {
      TaskManager.deleteCategory(name);
      Dashboard.renderCategories();
      Dashboard.renderTasks();
      Dashboard.showToast(`Category '${name}' deleted!`);
    }
  }
};

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', app.init);
