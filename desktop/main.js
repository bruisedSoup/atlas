const { app, BrowserWindow, shell, Notification, ipcMain } = require('electron');
const path = require('path');
const { randomBytes } = require('crypto');

// Set Application User Model ID on Windows so desktop notifications show properly with icon and app title
if (process.platform === 'win32') {
  app.setAppUserModelId('Atlas');
}

// Load .env if present
try {
  require('dotenv').config();
} catch (e) {
  // dotenv is optional in production builds
}

const ATLAS_WEB_URL = process.env.ATLAS_WEB_URL || 'http://localhost:3000';

let mainWindow;

// Handle Native Desktop Notifications from renderer
ipcMain.on('show-notification', (event, data = {}) => {
  const { title = 'Atlas Alert', body = '', sound = true } = data;
  
  if (Notification.isSupported()) {
    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    const notification = new Notification({
      title: title,
      body: body,
      icon: iconPath,
      silent: !sound,
    });

    notification.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    });

    notification.show();
  }
});

// Generate a one-time nonce per sign-in attempt so Electron can poll for it
let currentNonce = null;
let pollInterval = null;

function generateNonce() {
  return randomBytes(16).toString('hex');
}

function startPolling(nonce) {
  if (pollInterval) clearInterval(pollInterval);
  currentNonce = nonce;

  pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`${ATLAS_WEB_URL}/api/auth/desktop-status?nonce=${nonce}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.ready && data.refresh_token) {
        clearInterval(pollInterval);
        pollInterval = null;
        currentNonce = null;
        // Navigate the Electron webview to the sync route to establish session cookies
        if (mainWindow) {
          mainWindow.loadURL(`${ATLAS_WEB_URL}/auth/desktop-sync?refresh_token=${encodeURIComponent(data.refresh_token)}`);
          mainWindow.focus();
        }
      }
    } catch (e) {
      // Network error, will retry
    }
  }, 1500); // Poll every 1.5 seconds

  // Stop polling after 5 minutes to avoid leaking resources
  setTimeout(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }, 5 * 60 * 1000);
}

function createWindow() {
  mainWindow = new BrowserWindow({
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
      sandbox: false,
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

  // Intercept /auth/login navigation — open in system browser with desktop+nonce flags
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.includes('/auth/login')) {
      event.preventDefault();
      const nonce = generateNonce();
      const targetUrl = new URL(url);
      targetUrl.searchParams.set('desktop', 'true');
      targetUrl.searchParams.set('nonce', nonce);
      shell.openExternal(targetUrl.toString());
      // Start polling the status endpoint for this nonce
      startPolling(nonce);
    }
  });

  // Handle cases where the link opens in a new window/tab (e.g. target="_blank")
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(ATLAS_WEB_URL)) {
      return { action: 'allow' };
    }
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
