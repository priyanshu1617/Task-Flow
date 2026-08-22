const Storage = {
  getTasks: () => {
    const tasks = localStorage.getItem('taskflow_tasks');
    return tasks ? JSON.parse(tasks) : [];
  },

  saveTasks: (tasks) => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  },

  getTheme: () => {
    return localStorage.getItem('taskflow_theme') || 'light';
  },

  saveTheme: (theme) => {
    localStorage.setItem('taskflow_theme', theme);
  },

  getCategories: () => {
    const cats = localStorage.getItem('taskflow_categories');
    return cats ? JSON.parse(cats) : null;
  },

  saveCategories: (categories) => {
    localStorage.setItem('taskflow_categories', JSON.stringify(categories));
  },

  getDiaryEntries: () => {
    const entries = localStorage.getItem('taskflow_diary');
    return entries ? JSON.parse(entries) : {};
  },

  saveDiaryEntries: (entries) => {
    localStorage.setItem('taskflow_diary', JSON.stringify(entries));
  }
};
