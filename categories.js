// Navin Day Planner — Categories Module

const Categories = {
  async getAll() {
    return await DB.getAll('categories');
  },

  async getById(id) {
    return await DB.get('categories', id);
  },

  async add(name, color = '#16324F') {
    if (!name || !name.trim()) return null;
    const cat = {
      id: 'cat_' + Date.now().toString(36),
      name: name.trim(),
      color: color
    };
    await DB.put('categories', cat);
    return cat;
  },

  async update(id, updates) {
    const cat = await this.getById(id);
    if (!cat) return null;
    const updated = { ...cat, ...updates };
    await DB.put('categories', updated);
    return updated;
  },

  async delete(id) {
    return await DB.delete('categories', id);
  }
};
