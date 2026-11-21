const { app, BrowserWindow, session } = require('electron');
const { startLocalServer } = require('./server');

let mainWindow;
let localServerInstance;

async function createWindow() {
  const { server, port } = await startLocalServer(3456);
  localServerInstance = server;

  // Garantir que requisições ao YouTube enviem um Referer HTTP válido para evitar Erro 153
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['*://*.youtube.com/*', '*://*.youtube-nocookie.com/*', '*://*.googlevideo.com/*'] },
    (details, callback) => {
      details.requestHeaders['Referer'] = `http://localhost:${port}/`;
      details.requestHeaders['Origin'] = `http://localhost:${port}`;
      callback({ requestHeaders: details.requestHeaders });
    }
  );

  mainWindow = new BrowserWindow({
    width: 380,
    height: 650,
    resizable: true,
    backgroundColor: '#0b111e',
    autoHideMenuBar: true,
    title: 'iPod Classic',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL(`http://localhost:${port}/index.html`);
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
  if (localServerInstance) {
    try { localServerInstance.close(); } catch (_) {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
