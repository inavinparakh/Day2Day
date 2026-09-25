// Navin Day Planner — Utilities

const Utils = {
  // Generate unique ID
  uid() {
    return 't_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
  },

  // Date format: YYYY-MM-DD
  todayDateStr() {
    const d = new Date();
    return this.formatDateISO(d);
  },

  formatDateISO(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // Display date: Friday, 25 Sep 2026
  formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  },

  // Format 24h time HH:MM to 12h AM/PM
  formatTime12(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  },

  // Format current live time
  getLiveTimeStr() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  },

  // Compare two ISO dates (YYYY-MM-DD)
  // returns <0 if d1 < d2, 0 if equal, >0 if d1 > d2
  compareDates(d1, d2) {
    if (d1 === d2) return 0;
    return d1 < d2 ? -1 : 1;
  },

  // Escaping for HTML safety
  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
                                         
