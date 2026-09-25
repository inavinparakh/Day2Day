// Navin Day Planner — Alarms Module

const Alarms = {
  async getAll() {
    return await DB.getAll('alarms');
  },

  async add(time, label = 'Alarm') {
    if (!time) return null;
    const alarm = {
      id: 'alarm_' + Date.now().toString(36),
      time: time,
      label: label,
      enabled: true
    };
    await DB.put('alarms', alarm);
    return alarm;
  },

  async toggle(id) {
    const alarm = await DB.get('alarms', id);
    if (!alarm) return null;
    alarm.enabled = !alarm.enabled;
    await DB.put('alarms', alarm);
    return alarm;
  },

  async delete(id) {
    return await DB.delete('alarms', id);
  },

  checkAlarms() {
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMins = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMins}`;

    this.getAll().then((alarms) => {
      for (const a of alarms) {
        if (a.enabled && a.time === currentTimeStr && now.getSeconds() < 15) {
          this.triggerRinging(a);
        }
      }
    });
  },

  triggerRinging(alarm) {
    const root = document.getElementById('alarm-ring-root');
    if (!root) return;

    root.innerHTML = `
      <div class="alarm-ring-screen">
        <div class="alarm-ring-time">${Utils.formatTime12(alarm.time)}</div>
        <div class="alarm-ring-label">${Utils.escapeHtml(alarm.label)}</div>
        <div class="alarm-ring-actions">
          <button class="btn btn-primary" onclick="Alarms.dismiss()">Dismiss</button>
        </div>
      </div>
    `;
    root.classList.add('open');
  },

  dismiss() {
    const root = document.getElementById('alarm-ring-root');
    if (root) {
      root.classList.remove('open');
      root.innerHTML = '';
    }
  }
};
