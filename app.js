// Navin Day Planner — Application Bootstrap & View Controller

const App = {
  currentTab: 'today',
  todayFilter: 'schedule', // 'schedule', 'important', 'pending', 'completed'

  async init() {
    await DB.init();
    await Tasks.runCarryForward();

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    }

    // Bind Global UI Elements
    this.bindEvents();
    this.startLiveClock();

    // Set initial date display
    const dateEl = document.getElementById('today-date');
    if (dateEl) {
      dateEl.textContent = Utils.formatDateDisplay(Utils.todayDateStr());
    }

    // Notification and Alarms check interval
    setInterval(() => {
      Notifications.checkReminders();
      Alarms.checkAlarms();
    }, 15000);

    // Initial View Load
    this.switchView('today');
  },

  bindEvents() {
    // Bottom Nav Tabs
    document.querySelectorAll('.bottom-nav button').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchView(tab);
      });
    });

    // Today Sub-tabs
    document.querySelectorAll('.today-tab').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        document.querySelectorAll('.today-tab').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        this.todayFilter = tabBtn.dataset.tab;
        this.renderTodayView();
      });
    });

    // Floating Action Button (+)
    const fab = document.getElementById('fab-add');
    if (fab) {
      fab.addEventListener('click', () => {
        UI.showTaskModal();
      });
    }

    // Global Search
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value.toLowerCase().trim());
      });
    }
  },

  startLiveClock() {
    const timeEl = document.getElementById('current-time');
    const updateTime = () => {
      if (timeEl) timeEl.textContent = Utils.getLiveTimeStr();
    };
    updateTime();
    setInterval(updateTime, 1000);
  },

  switchView(viewName) {
    this.currentTab = viewName;

    // Update bottom nav active state
    document.querySelectorAll('.bottom-nav button').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === viewName);
    });

    // सर्व views लपवा
    document.querySelectorAll('.view').forEach(v => {
      v.classList.remove('active');
      v.style.display = 'none';
    });

    // फक्त निवडलेला view दाखवा
    const activeView = document.getElementById(`${viewName}-view`);
    if (activeView) {
      activeView.classList.add('active');
      activeView.style.display = 'block';
    }

    // Settings किंवा इतर पेजवर असताना Search आणि FAB (+) बटण लपवा
    const fab = document.getElementById('fab-add');
    const searchBar = document.querySelector('.header-search');
    if (fab) {
      fab.style.display = (viewName === 'settings') ? 'none' : 'flex';
    }
    if (searchBar) {
      searchBar.style.display = (viewName === 'settings') ? 'none' : 'block';
    }

    this.refreshCurrentView();
  },

  refreshCurrentView() {
    switch (this.currentTab) {
      case 'today':
        this.renderTodayView();
        break;
      case 'calendar':
        CalendarView.render(document.getElementById('calendar-view'));
        break;
      case 'tasks':
        this.renderTasksView();
        break;
      case 'completed':
        this.renderCompletedView();
        break;
      case 'settings':
        SettingsView.render(document.getElementById('settings-view'));
        break;
    }
  },

  async renderTodayView() {
    const grid = document.getElementById('today-tile-grid');
    if (!grid) return;

    const todayStr = Utils.todayDateStr();
    const allTasks = await Tasks.getAll();
    const categories = await Categories.getAll();
    const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

    // Counts for tabs
    const scheduleTasks = allTasks.filter(t => t.dueDate === todayStr && t.status === 'pending');
    const importantTasks = allTasks.filter(t => t.priority === 'high' && t.status === 'pending');
    const pendingTasks = allTasks.filter(t => t.status === 'pending' && (t.carryForwardCount && t.carryForwardCount > 0));
    const completedTasks = allTasks.filter(t => t.status === 'completed' && t.completedAt && t.completedAt.startsWith(todayStr));

    const countSched = document.getElementById('tabcount-schedule');
    const countImp = document.getElementById('tabcount-important');
    const countPend = document.getElementById('tabcount-pending');
    const countComp = document.getElementById('tabcount-completed');

    if (countSched) countSched.textContent = scheduleTasks.length;
    if (countImp) countImp.textContent = importantTasks.length;
    if (countPend) countPend.textContent = pendingTasks.length;
    if (countComp) countComp.textContent = completedTasks.length;

    // Filter displayed list based on active tab
    let displayTasks = [];
    if (this.todayFilter === 'schedule') displayTasks = scheduleTasks;
    else if (this.todayFilter === 'important') displayTasks = importantTasks;
    else if (this.todayFilter === 'pending') displayTasks = pendingTasks;
    else if (this.todayFilter === 'completed') displayTasks = completedTasks;

    if (displayTasks.length === 0) {
      grid.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;">No tasks in this list</div>';
      return;
    }

    grid.innerHTML = displayTasks.map(t => UI.renderTaskCard(t, catMap[t.categoryId])).join('');
  },

  async renderTasksView() {
    const container = document.getElementById('tasks-view');
    const allTasks = await Tasks.getAll();
    const categories = await Categories.getAll();
    const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

    const pending = allTasks.filter(t => t.status === 'pending');

    if (pending.length === 0) {
      container.innerHTML = '<div class="empty-state">No pending tasks found. Tap + to add one!</div>';
      return;
    }

    container.innerHTML = `
      <h2 class="section-title">All Pending Tasks (${pending.length})</h2>
      <div class="task-list">
        ${pending.map(t => UI.renderTaskCard(t, catMap[t.categoryId])).join('')}
      </div>
    `;
  },

  async renderCompletedView() {
    const container = document.getElementById('completed-view');
    const allTasks = await Tasks.getAll();
    const completed = allTasks.filter(t => t.status === 'completed');

    if (completed.length === 0) {
      container.innerHTML = '<div class="empty-state">No completed tasks yet.</div>';
      return;
    }

    container.innerHTML = `
      <h2 class="section-title">Completed Tasks (${completed.length})</h2>
      <div class="task-list">
        ${completed.map(t => `
          <div class="completed-row" onclick="UI.showEditModal('${t.id}')">
            <span>✓ ${Utils.escapeHtml(t.title)}</span>
            <span class="completed-time">${t.completedAt ? Utils.formatDateDisplay(t.completedAt.split('T')[0]) : ''}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  async toggleTask(id) {
    await Tasks.toggleComplete(id);
    this.refreshCurrentView();
  },

  async handleSearch(query) {
    if (!query) {
      this.refreshCurrentView();
      return;
    }
    const container = document.getElementById('today-tile-grid');
    if (!container) return;

    const allTasks = await Tasks.getAll();
    const categories = await Categories.getAll();
    const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

    const filtered = allTasks.filter(t =>
      t.title.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query))
    );

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;">No matching tasks found</div>';
      return;
    }

    container.innerHTML = filtered.map(t => UI.renderTaskCard(t, catMap[t.categoryId])).join('');
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
