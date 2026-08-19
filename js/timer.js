const TimeWidget = {
  timerInterval: null,
  remainingSeconds: 0,
  isRunning: false,

  init: () => {
    TimeWidget.startClock();
    
    document.getElementById('timer-start').addEventListener('click', TimeWidget.startTimer);
    document.getElementById('timer-pause').addEventListener('click', TimeWidget.pauseTimer);
    document.getElementById('timer-reset').addEventListener('click', TimeWidget.resetTimer);

    // Input Validation
    const inputs = ['timer-h', 'timer-m', 'timer-s'];

    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      
      el.addEventListener('input', (e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val)) val = 0;
        if (val < 0) e.target.value = 0;
        
        // Prevent typing more than 2 digits
        if (e.target.value.length > 2) {
          e.target.value = e.target.value.slice(0, 2);
        }
      });

      el.addEventListener('blur', () => {
        let h = parseInt(document.getElementById('timer-h').value) || 0;
        let m = parseInt(document.getElementById('timer-m').value) || 0;
        let s = parseInt(document.getElementById('timer-s').value) || 0;

        let totalSeconds = (h * 3600) + (m * 60) + s;
        
        let newH = Math.floor(totalSeconds / 3600);
        let newM = Math.floor((totalSeconds % 3600) / 60);
        let newS = totalSeconds % 60;
        
        if (newH > 24) newH = 24;

        document.getElementById('timer-h').value = String(newH).padStart(2, '0');
        document.getElementById('timer-m').value = String(newM).padStart(2, '0');
        document.getElementById('timer-s').value = String(newS).padStart(2, '0');
      });
    });
  },

  startClock: () => {
    const clockEl = document.getElementById('live-clock');
    // Init immediately
    clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setInterval(() => {
      clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }, 1000);
  },

  startTimer: () => {
    if (TimeWidget.isRunning) return;

    if (TimeWidget.remainingSeconds === 0) {
      const h = parseInt(document.getElementById('timer-h').value) || 0;
      const m = parseInt(document.getElementById('timer-m').value) || 0;
      const s = parseInt(document.getElementById('timer-s').value) || 0;
      TimeWidget.remainingSeconds = (h * 3600) + (m * 60) + s;
    }

    if (TimeWidget.remainingSeconds <= 0) return;

    document.querySelector('.timer-inputs').style.display = 'none';
    document.getElementById('timer-display').style.display = 'block';
    
    document.getElementById('timer-start').style.display = 'none';
    document.getElementById('timer-pause').style.display = 'flex';

    TimeWidget.isRunning = true;
    TimeWidget.updateDisplay();

    TimeWidget.timerInterval = setInterval(() => {
      TimeWidget.remainingSeconds--;
      TimeWidget.updateDisplay();

      if (TimeWidget.remainingSeconds <= 0) {
        TimeWidget.resetTimer();
        Dashboard.showToast("Time's up! Focus session complete. 🔥");
      }
    }, 1000);
  },

  pauseTimer: () => {
    clearInterval(TimeWidget.timerInterval);
    TimeWidget.isRunning = false;
    document.getElementById('timer-start').style.display = 'flex';
    document.getElementById('timer-pause').style.display = 'none';
  },

  resetTimer: () => {
    clearInterval(TimeWidget.timerInterval);
    TimeWidget.isRunning = false;
    TimeWidget.remainingSeconds = 0;
    
    document.querySelector('.timer-inputs').style.display = 'flex';
    document.getElementById('timer-display').style.display = 'none';
    
    document.getElementById('timer-start').style.display = 'flex';
    document.getElementById('timer-pause').style.display = 'none';

    document.getElementById('timer-h').value = "00";
    document.getElementById('timer-m').value = "00";
    document.getElementById('timer-s').value = "00";
  },

  updateDisplay: () => {
    const h = Math.floor(TimeWidget.remainingSeconds / 3600);
    const m = Math.floor((TimeWidget.remainingSeconds % 3600) / 60);
    const s = TimeWidget.remainingSeconds % 60;
    
    const hStr = String(h).padStart(2, '0');
    const mStr = String(m).padStart(2, '0');
    const sStr = String(s).padStart(2, '0');
    
    document.getElementById('timer-display').textContent = `${hStr}:${mStr}:${sStr}`;
  }
};
