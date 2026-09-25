// Navin Day Planner — Notifications Engine

const Notifications = {
  async init() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      // Permission can be requested via settings
    }
  },

  async requestPermission() {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications.');
      return false;
    }
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  },

  show(title, body = '') {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: body,
          icon: 'icon-192.png'
        });
      } catch (e) {
        console.error('Notification error:', e);
      }
    }
  },

  // Check pending reminders
  async checkReminders() {
    const today = Utils.todayDateStr();
    const tasks = await Tasks.getAll();
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMins = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMins}`;

    for (const t of tasks) {
      if (t.status === 'pending' && t.dueDate === today && t.dueTime === currentTimeStr) {
        this.show(t.title, `Reminder for today at ${Utils.formatTime12(t.dueTime)}`);
      }
    }
  }
};

