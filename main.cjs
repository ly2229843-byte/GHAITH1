// محتوى ملف main.cjs (للتشخيص المؤقت)
const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url'); 

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200, 
    height: 800, 
    webPreferences: {
      nodeIntegration: false, 
      contextIsolation: true,
      partition: 'persist:main' 
    }
  });

  mainWindow.loadURL(
    url.format({
        pathname: path.join(__dirname, 'dist', 'index.html'),
        protocol: 'file:',
        slashes: true
    })
  );
  
  // 💡 السطر الجديد المضاف: تشغيل أدوات المطورين
  mainWindow.webContents.openDevTools(); 
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});