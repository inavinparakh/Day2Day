// Navin Day Planner — Tasks Engine

const Tasks = {
  async getAll() {
    return await DB.getAll('tasks');
  },

  async getById(id) {
    return await DB.get('tasks', id);
  },

  async create(taskData) {
    const today = Utils.todayDateStr();
    const task = {
      id: Utils.uid(),
      title: taskData.title ? taskData.title.trim() : 'Untitled Task',
      description: taskData.description ? taskData.description.trim() : '',
      dueDate: taskData.dueDate || today,
      originalDate: taskData.dueDate || today,
      dueTime: taskData.dueTime || null,
      priority: taskData.priority || 'medium', // 'high', 'medium', 'low'
      categoryId: taskData.categoryId || 'cat_work',
      status: 'pending', // 'pending', 'completed', 'cancelled'
      carryForwardCount: 0,
      createdAt: new Date().toISOString(),
      completedAt: null,
      notes: taskData.notes || '',
      reminderTime: taskData.reminderTime || null
    };

    await DB.put('tasks', task);
    return task;
  },

  async update(id, updates) {
    const task = await this.getById(id);
    if (!task) return null;
    const updated = { ...task, ...updates };
    await DB.put('tasks', updated);
    return updated;
  },

  async toggleComplete(id) {
    const task = await this.getById(id);
    if (!task) return null;

    if (task.status === 'completed') {
      task.status = 'pending';
      task.completedAt = null;
    } else {
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
    }

    await DB.put('tasks', task);
    return task;
  },

  async delete(id) {
    return await DB.delete('tasks', id);
  },

  // Engine: Run Carry-Forward for past incomplete tasks
  async runCarryForward() {
    const today = Utils.todayDateStr();
    const allTasks = await this.getAll();
    let carriedCount = 0;

    for (const task of allTasks) {
      if (task.status === 'pending' && Utils.compareDates(task.dueDate, today) < 0) {
        task.dueDate = today;
        task.carryForwardCount = (task.carryForwardCount || 0) + 1;
        await DB.put('tasks', task);
        carriedCount++;
      }
    }
    return carriedCount;
  }
};
