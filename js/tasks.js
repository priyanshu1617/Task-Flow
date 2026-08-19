const TaskManager = {
  tasks: [],
  categories: [],
  currentFilter: 'all', // all, today, upcoming, completed, important
  currentCategory: null,
  searchQuery: '',

  init: () => {
    // Categories Init
    const savedCategories = Storage.getCategories();
    if (savedCategories) {
      TaskManager.categories = savedCategories;
    } else {
      TaskManager.categories = [
        { name: 'College', color: '#8c7ae6' },
        { name: 'Personal', color: '#10b981' },
        { name: 'Projects', color: '#3b82f6' },
        { name: 'Work', color: '#f59e0b' }
      ];
      Storage.saveCategories(TaskManager.categories);
    }

    TaskManager.tasks = Storage.getTasks();
    
    // Migrate old tasks if they exist in localStorage from old version
    const oldTasksStr = localStorage.getItem('dailyFlowTasks');
    if (oldTasksStr && TaskManager.tasks.length === 0) {
      try {
        const oldTasks = JSON.parse(oldTasksStr);
        TaskManager.tasks = oldTasks.map(ot => ({
          id: ot.id,
          title: ot.name,
          category: 'Personal',
          priority: ot.important ? 'High' : 'Low',
          date: new Date().toISOString().split('T')[0], // Map to today
          time: ot.time || '',
          completed: ot.completed,
          createdAt: new Date().toISOString()
        }));
        Storage.saveTasks(TaskManager.tasks);
        // Clear the old storage so they don't respawn if the user deletes everything
        localStorage.removeItem('dailyFlowTasks');
      } catch (e) {
        console.error("Migration failed", e);
      }
    }
  },

  addCategory: (name) => {
    // Avoid duplicates
    if (TaskManager.categories.find(c => c.name.toLowerCase() === name.toLowerCase())) return false;
    
    const colors = ['#e84393', '#00cec9', '#fdcb6e', '#d63031', '#6c5ce7', '#0984e3', '#e17055', '#00b894'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    TaskManager.categories.push({ name, color: randomColor });
    Storage.saveCategories(TaskManager.categories);
    return true;
  },

  deleteCategory: (name) => {
    TaskManager.categories = TaskManager.categories.filter(c => c.name !== name);
    Storage.saveCategories(TaskManager.categories);
    
    // Update tasks that had this category to the first available category
    const defaultCat = TaskManager.categories.length > 0 ? TaskManager.categories[0].name : '';
    TaskManager.tasks.forEach(t => {
      if (t.category === name) {
        t.category = defaultCat;
      }
    });
    Storage.saveTasks(TaskManager.tasks);

    if (TaskManager.currentCategory === name) {
      TaskManager.currentCategory = null;
    }
  },

  addTask: (taskData) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString()
    };
    TaskManager.tasks.push(newTask);
    Storage.saveTasks(TaskManager.tasks);
    return newTask;
  },

  updateTask: (id, updates) => {
    const index = TaskManager.tasks.findIndex(t => String(t.id) === String(id));
    if (index !== -1) {
      TaskManager.tasks[index] = { ...TaskManager.tasks[index], ...updates };
      Storage.saveTasks(TaskManager.tasks);
    }
  },

  deleteTask: (id) => {
    TaskManager.tasks = TaskManager.tasks.filter(t => String(t.id) !== String(id));
    Storage.saveTasks(TaskManager.tasks);
  },

  toggleComplete: (id) => {
    const task = TaskManager.tasks.find(t => String(t.id) === String(id));
    if (task) {
      task.completed = !task.completed;
      Storage.saveTasks(TaskManager.tasks);
    }
  },

  toggleImportant: (id) => {
    const task = TaskManager.tasks.find(t => String(t.id) === String(id));
    if (task) {
      task.priority = task.priority === 'High' ? 'Medium' : 'High';
      Storage.saveTasks(TaskManager.tasks);
    }
  },

  getFilteredTasks: () => {
    let filtered = [...TaskManager.tasks];

    // Search
    if (TaskManager.searchQuery) {
      const q = TaskManager.searchQuery.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(q));
    }

    // Category
    if (TaskManager.currentCategory) {
      filtered = filtered.filter(t => t.category === TaskManager.currentCategory);
    }

    // Navigation Filter
    const today = new Date().toISOString().split('T')[0];
    
    switch (TaskManager.currentFilter) {
      case 'today':
        filtered = filtered.filter(t => t.date === today && !t.completed);
        break;
      case 'upcoming':
        filtered = filtered.filter(t => t.date > today && !t.completed);
        break;
      case 'completed':
        filtered = filtered.filter(t => t.completed);
        break;
      case 'important':
        filtered = filtered.filter(t => t.priority === 'High' && !t.completed);
        break;
      case 'tasks': // All Tasks (not completed usually, or all?) Let's show all
        break;
      case 'all': // Dashboard
        filtered = filtered.filter(t => !t.completed); // Show pending by default
        break;
    }

    // Sort by date then time
    filtered.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.time && b.time) return a.time.localeCompare(b.time);
      return 0;
    });

    return filtered;
  },

  getStats: () => {
    const total = TaskManager.tasks.length;
    const completed = TaskManager.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    const today = new Date().toISOString().split('T')[0];
    const overdue = TaskManager.tasks.filter(t => !t.completed && t.date < today).length;
    const highPriority = TaskManager.tasks.filter(t => !t.completed && t.priority === 'High').length;

    // Monthly completion for progress circle
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const tasksThisMonth = TaskManager.tasks.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    
    const completedThisMonth = tasksThisMonth.filter(t => t.completed).length;
    const totalThisMonth = tasksThisMonth.length;
    const progressPercent = totalThisMonth === 0 ? 0 : Math.round((completedThisMonth / totalThisMonth) * 100);

    // Nav counts
    const countToday = TaskManager.tasks.filter(t => !t.completed && t.date === today).length;
    const countUpcoming = TaskManager.tasks.filter(t => !t.completed && t.date > today).length;

    // Streak logic
    const completedDates = [...new Set(TaskManager.tasks.filter(t => t.completed).map(t => t.date))].sort((a, b) => b.localeCompare(a));
    let currentStreak = 0;
    
    const getLocalDateStr = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    let checkDate = new Date();
    let checkDateStr = getLocalDateStr(checkDate);

    // If today is not in completed dates, maybe yesterday is. If neither, streak is 0.
    if (!completedDates.includes(checkDateStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateStr = getLocalDateStr(checkDate);
    }
    
    while (completedDates.includes(checkDateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateStr = getLocalDateStr(checkDate);
    }

    return {
      total,
      completed,
      pending,
      overdue,
      highPriority,
      completedThisMonth,
      totalThisMonth,
      progressPercent,
      countToday,
      countUpcoming,
      currentStreak
    };
  }
};
