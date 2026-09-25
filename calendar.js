// Navin Day Planner — Calendar View

const CalendarView = {
  currentDate: new Date(),

  async render(container) {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const monthName = this.currentDate.toLocaleString('default', { month: 'long' });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const allTasks = await Tasks.getAll();
    const taskMap = {};
    for (const t of allTasks) {
      if (!taskMap[t.dueDate]) taskMap[t.dueDate] = [];
      taskMap[t.dueDate].push(t);
    }

    let gridHtml = '';
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    for (const w of weekdays) {
      gridHtml += `<div class="month-head">${w}</div>`;
    }

    for (let i = 0; i < firstDay; i++) {
      gridHtml += `<div class="month-cell empty"></div>`;
    }

    const todayStr = Utils.todayDateStr();

    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      const isToday = dateStr === todayStr;
      const count = taskMap[dateStr] ? taskMap[dateStr].length : 0;

      gridHtml += `
        <div class="month-cell ${isToday ? 'is-today' : ''}" onclick="CalendarView.selectDate('${dateStr}')">
          <span class="month-cell-num">${day}</span>
          ${count > 0 ? `<span class="month-cell-dot">${count}</span>` : ''}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="cal-toolbar">
        <div class="cal-nav">
          <button class="icon-btn" onclick="CalendarView.prevMonth()">◀</button>
          <span class="cal-label">${monthName} ${year}</span>
          <button class="icon-btn" onclick="CalendarView.nextMonth()">▶</button>
        </div>
      </div>
      <div class="month-grid">${gridHtml}</div>
      <div id="calendar-day-tasks" style="margin-top: 16px;"></div>
    `;
  },

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    App.refreshCurrentView();
  },

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    App.refreshCurrentView();
  },

  async selectDate(dateStr) {
    const container = document.getElementById('calendar-day-tasks');
    if (!container) return;
    const allTasks = await Tasks.getAll();
    const categories = await Categories.getAll();
    const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

    const dayTasks = allTasks.filter(t => t.dueDate === dateStr);

    if (dayTasks.length === 0) {
      container.innerHTML = `<div class="empty-state">No tasks scheduled for ${Utils.formatDateDisplay(dateStr)}</div>`;
      return;
    }

    const html = dayTasks.map(t => UI.renderTaskCard(t, catMap[t.categoryId])).join('');
    container.innerHTML = `
      <div class="date-group-label">${Utils.formatDateDisplay(dateStr)}</div>
      <div class="task-list">${html}</div>
    `;
  }
};
