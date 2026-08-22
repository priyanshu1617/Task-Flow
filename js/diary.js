const Diary = {
  currentDate: new Date(),
  entries: {},
  saveTimeout: null,

  init: () => {
    Diary.entries = Storage.getDiaryEntries();
    Diary.bindEvents();
    Diary.render();
  },

  bindEvents: () => {
    const prevBtn = document.getElementById('diary-prev-day');
    const nextBtn = document.getElementById('diary-next-day');
    const textarea = document.getElementById('diary-textarea');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        Diary.changeDate(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        Diary.changeDate(1);
      });
    }

    if (textarea) {
      textarea.addEventListener('input', (e) => {
        Diary.updateLineNumbers();
        // Auto save with debounce
        clearTimeout(Diary.saveTimeout);
        Diary.saveTimeout = setTimeout(() => {
          Diary.saveEntry(e.target.value);
        }, 500);
      });

      textarea.addEventListener('scroll', () => {
        const lineNumbers = document.getElementById('diary-line-numbers');
        if (lineNumbers) {
          lineNumbers.scrollTop = textarea.scrollTop;
        }
      });
    }

    const datePicker = document.getElementById('diary-date-picker');
    if (datePicker) {
      datePicker.addEventListener('change', (e) => {
        if (e.target.value) {
          Diary.jumpToDate(e.target.value);
        }
      });
    }
  },

  getFormattedDate: (dateObj) => {
    return dateObj.getFullYear() + '-' + String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + String(dateObj.getDate()).padStart(2, '0');
  },

  getDisplayDate: (dateObj) => {
    const today = new Date();
    const isToday = 
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear();
      
    const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return isToday ? `Today, ${dateStr}` : dateStr;
  },

  changeDate: (days) => {
    // Save current before flipping just in case
    const textarea = document.getElementById('diary-textarea');
    if (textarea) Diary.saveEntry(textarea.value);

    // Update Date
    Diary.currentDate.setDate(Diary.currentDate.getDate() + days);
    
    // Animation
    const page = document.getElementById('diary-page-container');
    if (page) {
      page.classList.remove('flip-in');
      page.classList.add('flip-out');
      
      setTimeout(() => {
        Diary.render();
        page.classList.remove('flip-out');
        page.classList.add('flip-in');
      }, 400); // Wait for half animation
    } else {
      Diary.render();
    }
  },

  jumpToDate: (dateString) => {
    // Save current before flipping just in case
    const textarea = document.getElementById('diary-textarea');
    if (textarea) Diary.saveEntry(textarea.value);

    // Update Date
    const parts = dateString.split('-');
    if (parts.length === 3) {
      Diary.currentDate = new Date(parts[0], parts[1] - 1, parts[2]);
    }
    
    // Animation
    const page = document.getElementById('diary-page-container');
    if (page) {
      page.classList.remove('flip-in');
      page.classList.add('flip-out');
      
      setTimeout(() => {
        Diary.render();
        page.classList.remove('flip-out');
        page.classList.add('flip-in');
      }, 400); // Wait for half animation
    } else {
      Diary.render();
    }
  },

  saveEntry: (text) => {
    const dateKey = Diary.getFormattedDate(Diary.currentDate);
    if (text.trim() === '') {
      delete Diary.entries[dateKey];
    } else {
      Diary.entries[dateKey] = text;
    }
    Storage.saveDiaryEntries(Diary.entries);
  },

  render: () => {
    const dateDisplay = document.getElementById('diary-current-date');
    const textarea = document.getElementById('diary-textarea');
    const nextBtn = document.getElementById('diary-next-day');
    const datePicker = document.getElementById('diary-date-picker');
    
    const today = new Date();
    const isToday = 
      Diary.currentDate.getDate() === today.getDate() &&
      Diary.currentDate.getMonth() === today.getMonth() &&
      Diary.currentDate.getFullYear() === today.getFullYear();

    if (nextBtn) {
       nextBtn.disabled = isToday;
    }
    
    if (datePicker) {
      datePicker.value = Diary.getFormattedDate(Diary.currentDate);
      datePicker.max = Diary.getFormattedDate(today);
    }

    if (dateDisplay) {
      dateDisplay.textContent = Diary.getDisplayDate(Diary.currentDate);
    }

    if (textarea) {
      const dateKey = Diary.getFormattedDate(Diary.currentDate);
      textarea.value = Diary.entries[dateKey] || '';
      Diary.updateLineNumbers();
    }
  },

  updateLineNumbers: () => {
    const textarea = document.getElementById('diary-textarea');
    const lineNumbers = document.getElementById('diary-line-numbers');
    if (!textarea || !lineNumbers) return;
    
    const lines = textarea.value.split('\n').length;
    let numbersHTML = '';
    for (let i = 1; i <= Math.max(lines, 1); i++) {
      numbersHTML += i + '<br>';
    }
    lineNumbers.innerHTML = numbersHTML;
  }
};
