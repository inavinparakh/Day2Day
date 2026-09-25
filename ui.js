// Navin Day Planner — UI Components & Modal

const UI = {
  // Render a single task card / tile
  renderTaskCard(task, category) {
    const isDone = task.status === 'completed';
    const catColor = category ? category.color : '#B8862E';
    const catName = category ? category.name : 'General';
    const timeDisplay = task.dueTime ? Utils.formatTime12(task.dueTime) : '';
    const carriedBadge = (task.carryForwardCount && task.carryForwardCount > 0)
      ? `<span class="badge badge-carried">Carried x${task.carryForwardCount}</span>`
      : '';

    return `
      <div class="task-card priority-${task.priority} ${isDone ? 'is-done' : ''}" data-id="${task.id}">
        <button class="task-check ${isDone ? 'checked' : ''}" onclick="App.toggleTask('${task.id}')" aria-label="Mark task complete">
          ${isDone ? '✓' : ''}
        </button>
        <div class="task-body" onclick="UI.showEditModal('${task.id}')">
          <div class="task-top">
            <span class="task-title">${Utils.escapeHtml(task.title)}</span>
            <span class="cat-chip" style="background: ${catColor}18; color: ${catColor}">${Utils.escapeHtml(catName)}</span>
          </div>
          ${task.description ? `<div class="task-desc">${Utils.escapeHtml(task.description)}</div>` : ''}
          <div class="task-meta">
            ${timeDisplay ? `<span class="meta-item">⏰ ${timeDisplay}</span>` : ''}
            ${carriedBadge}
          </div>
        </div>
      </div>
    `;
  },

  // Open Modal for Add or Edit
  async showTaskModal(taskId = null) {
    const root = document.getElementById('modal-root');
    const categories = await Categories.getAll();
    let task = null;

    if (taskId) {
      task = await Tasks.getById(taskId);
    }

    const titleVal = task ? Utils.escapeHtml(task.title) : '';
    const descVal = task ? Utils.escapeHtml(task.description) : '';
    const dateVal = task ? task.dueDate : Utils.todayDateStr();
    const timeVal = task && task.dueTime ? task.dueTime : '';
    const priorityVal = task ? task.priority : 'medium';
    const catIdVal = task ? task.categoryId : (categories[0] ? categories[0].id : '');

    const catOptions = categories.map(c =>
      `<option value="${c.id}" ${c.id === catIdVal ? 'selected' : ''}>${Utils.escapeHtml(c.name)}</option>`
    ).join('');

    root.innerHTML = `
      <div class="modal-overlay" onclick="UI.closeModal(event)">
        <div class="modal-sheet" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h2>${task ? 'Edit Task' : 'Add New Task'}</h2>
            <button class="icon-btn" onclick="UI.closeModal()">✕</button>
          </div>
          <form class="modal-form" onsubmit="UI.handleFormSubmit(event, '${taskId || ''}')">
            <div class="field">
              <label>Task Title</label>
              <input type="text" id="m-title" required value="${titleVal}" placeholder="e.g. Call LIC Branch / Client meeting">
            </div>
            <div class="field">
              <label>Notes / Description</label>
              <textarea id="m-desc" rows="2" placeholder="Details...">${descVal}</textarea>
            </div>
            <div class="field-row">
              <div class="field">
                <label>Date</label>
                <input type="date" id="m-date" value="${dateVal}" required>
              </div>
              <div class="field">
                <label>Time (Optional)</label>
                <input type="time" id="m-time" value="${timeVal}">
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label>Priority</label>
                <select id="m-priority">
                  <option value="high" ${priorityVal === 'high' ? 'selected' : ''}>High</option>
                  <option value="medium" ${priorityVal === 'medium' ? 'selected' : ''}>Medium</option>
                  <option value="low" ${priorityVal === 'low' ? 'selected' : ''}>Low</option>
                </select>
              </div>
              <div class="field">
                <label>Category</label>
                <select id="m-category">
                  ${catOptions}
                </select>
              </div>
            </div>
            <div class="modal-actions">
              ${taskId ? `<button type="button" class="btn btn-danger-ghost" onclick="UI.deleteTask('${taskId}')">Delete</button>` : '<span></span>'}
              <button type="submit" class="btn btn-primary">${task ? 'Save Changes' : 'Create Task'}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    root.classList.add('open');
  },

  showEditModal(taskId) {
    this.showTaskModal(taskId);
  },

  closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const root = document.getElementById('modal-root');
    root.classList.remove('open');
    root.innerHTML = '';
  },

  async handleFormSubmit(e, taskId) {
    e.preventDefault();
    const data = {
      title: document.getElementById('m-title').value,
      description: document.getElementById('m-desc').value,
      dueDate: document.getElementById('m-date').value,
      dueTime: document.getElementById('m-time').value || null,
      priority: document.getElementById('m-priority').value,
      categoryId: document.getElementById('m-category').value
    };

    if (taskId) {
      await Tasks.update(taskId, data);
    } else {
      await Tasks.create(data);
    }

    this.closeModal();
    App.refreshCurrentView();
  },

  async deleteTask(taskId) {
    if (confirm('Delete this task?')) {
      await Tasks.delete(taskId);
      this.closeModal();
      App.refreshCurrentView();
    }
  }
};
  
