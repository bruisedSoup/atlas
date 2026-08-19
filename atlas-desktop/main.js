const { app, BrowserWindow, shell, session } = require('electron');
const path = require('path');

// Load .env if present
try {
  require('dotenv').config();
} catch (e) {
  // dotenv is optional in production builds
}

const ATLAS_WEB_URL = process.env.ATLAS_WEB_URL || 'http://localhost:3000';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    title: 'Atlas',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    backgroundColor: '#ffffff',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Strip Electron identifier from User-Agent to allow Google OAuth
  const defaultUserAgent = mainWindow.webContents.userAgent;
  const cleanUserAgent = defaultUserAgent
    .replace(/Electron\/\S+\s?/, '')
    .replace(/atlas-desktop\/\S+\s?/, '');
  mainWindow.webContents.setUserAgent(cleanUserAgent);

  // Load the web app
  mainWindow.loadURL(ATLAS_WEB_URL);

  // Smooth show when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Allow external navigation in default browser if needed, or handle popups
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // If it's OAuth or internal route, let it open or redirect in window
    if (url.startsWith(ATLAS_WEB_URL) || url.includes('accounts.google.com') || url.includes('supabase.co')) {
      return { action: 'allow' };
    }
    // Otherwise open in user's default browser
    shell.openExternal(url);
    return { action: 'deny' };
  });

  return mainWindow;
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
