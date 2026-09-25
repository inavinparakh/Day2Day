// Navin Day Planner — Backup & Restore Module

const Backup = {
  async exportJSON() {
    const tasks = await Tasks.getAll();
    const categories = await Categories.getAll();
    const alarms = await Alarms.getAll();

    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks,
      categories,
      alarms
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NavinDayPlanner_Backup_${Utils.todayDateStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async importJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.tasks && Array.isArray(data.tasks)) {
          for (const t of data.tasks) {
            await DB.put('tasks', t);
          }
        }
        if (data.categories && Array.isArray(data.categories)) {
          for (const c of data.categories) {
            await DB.put('categories', c);
          }
        }
        if (data.alarms && Array.isArray(data.alarms)) {
          for (const a of data.alarms) {
            await DB.put('alarms', a);
          }
        }
        alert('Backup restored successfully!');
        App.refreshCurrentView();
      } catch (err) {
        alert('Invalid backup file.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  }
};
