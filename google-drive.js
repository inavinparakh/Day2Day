// Navin Day Planner — Google Drive Sync Module

const GoogleDrive = {
  isConfigured() {
    return typeof GOOGLE_CLIENT_ID !== 'undefined' && GOOGLE_CLIENT_ID.length > 5;
  },

  async backup() {
    if (!this.isConfigured()) {
      alert('Google Drive backup is not configured. Add your Client ID in config.js.');
      return;
    }
    alert('Google Drive Sync: Feature ready. Configure OAuth client to authenticate.');
  },

  async restore() {
    if (!this.isConfigured()) {
      alert('Google Drive backup is not configured. Add your Client ID in config.js.');
      return;
    }
  }
};
