// Navin Day Planner — Settings Screen

const SettingsView = {
  async render(container) {
    const categories = await Categories.getAll();
    const alarms = await Alarms.getAll();

    const catRows = categories.map(c => `
      <div class="category-row">
        <span class="cat-dot" style="background: ${c.color}"></span>
        <span class="category-name">${Utils.escapeHtml(c.name)}</span>
        <button class="btn btn-danger-ghost" style="padding: 4px 8px; font-size: 12px;" onclick="SettingsView.deleteCategory('${c.id}')">Delete</button>
      </div>
    `).join('');

    const alarmRows = alarms.map(a => `
      <div class="alarm-row">
        <div class="alarm-row-main">
          <span class="alarm-row-time">${Utils.formatTime12(a.time)}</span>
          <span class="alarm-row-label">${Utils.escapeHtml(a.label)}</span>
        </div>
        <button class="btn ${a.enabled ? 'btn-primary' : 'btn-secondary'}" style="padding: 6px 12px; font-size: 12px;" onclick="SettingsView.toggleAlarm('${a.id}')">
          ${a.enabled ? 'Enabled' : 'Disabled'}
        </button>
        <button class="btn btn-danger-ghost" style="padding: 6px 8px; font-size: 12px;" onclick="SettingsView.deleteAlarm('${a.id}')">✕</button>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="settings-section">
        <h3>🎨 Categories</h3>
        <div class="category-list">${catRows}</div>
        <form class="inline-add-form" onsubmit="SettingsView.addCategory(event)">
          <input type="text" id="new-cat-name" placeholder="New category name..." required>
          <input type="color" id="new-cat-color" value="#B8862E">
          <button type="submit" class="btn btn-primary" style="padding: 8px 14px;">Add</button>
        </form>
      </div>

      <div class="settings-section">
        <h3>⏰ Alarms</h3>
        <div class="alarms-list">${alarmRows || '<div class="empty-state" style="padding: 10px;">No alarms set</div>'}</div>
        <form class="inline-add-form" onsubmit="SettingsView.addAlarm(event)">
          <input type="time" id="new-alarm-time" required>
          <input type="text" id="new-alarm-label" placeholder="Alarm note..." style="flex: 2;">
          <button type="submit" class="btn btn-primary" style="padding: 8px 14px;">Set</button>
        </form>
      </div>

      <div class="settings-section">
        <h3>💾 Local Backup & Restore</h3>
        <div class="button-row">
          <button class="btn btn-secondary" onclick="Backup.exportJSON()">Export JSON Backup</button>
          <label class="btn btn-secondary" style="cursor: pointer;">
            Import JSON <input type="file" accept=".json" style="display: none;" onchange="Backup.importJSON(this.files[0])">
          </label>
        </div>
      </div>

      <div class="settings-section">
        <h3>☁️ Google Drive Backup</h3>
        <p class="hint-text">Cloud sync requires Google Client ID in config.js</p>
        <div class="button-row" style="margin-top: 8px;">
          <button class="btn btn-secondary" onclick="GoogleDrive.backup()">Sync to Drive</button>
        </div>
      </div>
    `;
  },

  async addCategory(e) {
    e.preventDefault();
    const name = document.getElementById('new-cat-name').value;
    const color = document.getElementById('new-cat-color').value;
    await Categories.add(name, color);
    App.refreshCurrentView();
  },

  async deleteCategory(id) {
    if (confirm('Delete this category?')) {
      await Categories.delete(id);
      App.refreshCurrentView();
    }
  },

  async addAlarm(e) {
    e.preventDefault();
    const time = document.getElementById('new-alarm-time').value;
    const label = document.getElementById('new-alarm-label').value || 'Alarm';
    await Alarms.add(time, label);
    App.refreshCurrentView();
  },

  async toggleAlarm(id) {
    await Alarms.toggle(id);
    App.refreshCurrentView();
  },

  async deleteAlarm(id) {
    await Alarms.delete(id);
    App.refreshCurrentView();
  }
};
