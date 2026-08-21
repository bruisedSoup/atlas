// Preload script for Atlas Desktop
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  showNotification: (data) => ipcRenderer.send('show-notification', data),
});
