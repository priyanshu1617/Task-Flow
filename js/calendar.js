const Calendar = {
  currentDate: new Date(),
  
  render: () => {
    const monthYearEl = document.getElementById('calendar-month');
    const gridEl = document.querySelector('.calendar-grid');
    
    // Clear old days (keep headers)
    const headers = Array.from(gridEl.querySelectorAll('.calendar-day-header'));
    gridEl.innerHTML = '';
    headers.forEach(h => gridEl.appendChild(h));

    const year = Calendar.currentDate.getFullYear();
    const month = Calendar.currentDate.getMonth();
    
    // Month Name
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthYearEl.textContent = `${monthNames[month]} ${year}`;

    // Get first day index and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const today = new Date();
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day muted';
      dayEl.textContent = daysInPrevMonth - i;
      gridEl.appendChild(dayEl);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';
      dayEl.textContent = i;
      
      // Check if today
      if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        dayEl.classList.add('active');
      }

      // Check if has tasks
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
      const hasTask = TaskManager.tasks.some(t => t.date === dateStr && !t.completed);
      if (hasTask) {
        dayEl.classList.add('has-task');
      }

      gridEl.appendChild(dayEl);
    }

    // Next month days (to fill grid)
    const totalCells = firstDay + daysInMonth;
    const nextDays = 42 - totalCells; // 6 rows max
    if (nextDays < 14) { // Only fill if not a whole empty row
      for (let i = 1; i <= nextDays; i++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day muted';
        dayEl.textContent = i;
        gridEl.appendChild(dayEl);
      }
    }
  },

  prevMonth: () => {
    Calendar.currentDate.setMonth(Calendar.currentDate.getMonth() - 1);
    Calendar.render();
  },

  nextMonth: () => {
    Calendar.currentDate.setMonth(Calendar.currentDate.getMonth() + 1);
    Calendar.render();
  }
};
