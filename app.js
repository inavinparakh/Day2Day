// Navin Day Planner — View Switching & Control

const App = {
  currentTab: 'today',
  todayFilter: 'schedule',

  async init() {
    await DB.init();
    await Tasks.runCarryForward();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    }

    this.bindEvents();
    this.startLiveClock();

    const dateEl = document.getElementById('today-date');
    if (dateEl) {
      dateEl.textContent = Utils.formatDateDisplay(Utils.todayDateStr());
    }

    setInterval(() => {
      Notifications.checkReminders();
      Alarms.checkAlarms();
    }, 15000);

    this.switchView('today');
  },

  bindEvents() {
    // तळभागातील बटणे (Bottom Navigation)
    document.querySelectorAll('.bottom-nav button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchView(btn.dataset.tab);
      });
    });

    // Today वरील ४ बटणे (Schedule, Important, Carry Fwd, Done)
    document.querySelectorAll('.today-tab').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        document.querySelectorAll('.today-tab').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        this.todayFilter = tabBtn.dataset.tab;
        this.renderTodayView();
      });
    });

    // Floating Button (+)
    const fab = document.getElementById('fab-add');
    if (fab) {
      fab.addEventListener('click', () => UI.showTaskModal());
    }

    // शोधपट्टी (Search)
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

  // मुख्य स्विचिंग लॉजिक — एका वेळी फक्त १ च पान पूर्ण स्क्रीनवर दिसेल
  switchView(viewName) {
    this.currentTab = viewName;

    // खालच्या बारवर ॲक्टिव्ह हायलाइट करा
    document.querySelectorAll('.bottom-nav button').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === viewName);
    });

    // सर्व पाहाणे लपवा
    document.querySelectorAll('.view').forEach(v => {
      v.classList.remove('active');
    });

    // निवडलेले पान पूर्णपणे उघडा
    const activeView = document.getElementById(`${viewName}-view`);
    if (activeView) {
      activeView.classList.add('active');
    }

    // Settings पेजवर असताना (+) चे बटण बंद ठेवा
    const fab = document.getElementById('fab-add');
    if (fab) {
      fab.style.display = (viewName === 'settings') ? 'none' : 'flex';
    }

    this.refreshCurrentView();
  },

  refreshCurrentView() {
    switch (this.currentTab) {
      case 'today':
        this.renderTodayView();
        break;
      case 'calendar':
        CalendarView.render(document.getElementById('calendar-content'));
        break;
      case 'tasks':
        this.renderTasksView();
        break;
      case 'completed':
        this.renderCompletedView();
        break;
      case 'settings':
        SettingsView.render(document.getElementById('settings-content'));
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

    const scheduleTasks = allTasks.filter(t => t.dueDate === todayStr && t.status === 'pending');
    const importantTasks = allTasks.filter(t => t.priority === 'high' && t.status === 'pending');
    const pendingTasks = allTasks.filter(t => t.status === 'pending' && (t.carryForwardCount && t.carryForwardCount > 0));
    const completedTasks = allTasks.filter(t => t.status === 'completed' && t.completedAt && t.completedAt.startsWith(todayStr));

    document.getElementById('tabcount-schedule').textContent = scheduleTasks.length;
    document.getElementById('tabcount-important').textContent = importantTasks.length;
    document.getElementById('tabcount-pending').textContent = pendingTasks.length;
    document.getElementById('tabcount-completed').textContent = completedTasks.length;

    let displayTasks = [];
    if (this.todayFilter === 'schedule') displayTasks = scheduleTasks;
    else if (this.todayFilter === 'important') displayTasks = importantTasks;
    else if (this.todayFilter === 'pending') displayTasks = pendingTasks;
    else if (this.todayFilter === 'completed') displayTasks = completedTasks;

    if (displayTasks.length === 0) {
      grid.innerHTML = '<div style="text-align: center; color: #718096; padding: 40px 0;">कोणतेही टास्क नाहीत. (+) वर क्लिक करून जोडा.</div>';
      return;
    }

    grid.innerHTML = displayTasks.map(t => UI.renderTaskCard(t, catMap[t.categoryId])).join('');
  },

  async renderTasksView() {
    const container = document.getElementById('tasks-content');
    const allTasks = await Tasks.getAll();
    const categories = await Categories.getAll();
    const catMap = Object.fromEntries(categories.map(c => [c.id, c]));
    const pending = allTasks.filter(t => t.status === 'pending');

    if (pending.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: #718096; padding: 40px 0;">एकही अपूर्ण टास्क नाही.</div>';
      return;
    }
    container.innerHTML = pending.map(t => UI.renderTaskCard(t, catMap[t.categoryId])).join('');
  },

  async renderCompletedView() {
    const container = document.getElementById('completed-content');
    const allTasks = await Tasks.getAll();
    const completed = allTasks.filter(t => t.status === 'completed');

    if (completed.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: #718096; padding: 40px 0;">पूर्ण झालेले टास्क येथे दिसतील.</div>';
      return;
    }

    container.innerHTML = completed.map(t => `
      <div class="task-card is-done">
        <span style="color: #38a169; font-weight: bold; font-size: 1.2rem;">✓</span>
        <div class="task-body">
          <div class="task-title" style="text-decoration: line-through;">${Utils.escapeHtml(t.title)}</div>
          <div class="task-meta">${t.completedAt ? Utils.formatDateDisplay(t.completedAt.split('T')[0]) : ''}</div>
        </div>
      </div>
    `).join('');
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
      container.innerHTML = '<div style="text-align: center; color: #718096; padding: 20px;">कोणताही टास्क सापडला नाही.</div>';
      return;
    }

    container.innerHTML = filtered.map(t => UI.renderTaskCard(t, catMap[t.categoryId])).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
    
