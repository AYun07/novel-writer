const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 保存对话框
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  
  // 打开对话框
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // 消息框
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  
  // 获取应用路径
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // 监听事件
  onNewProject: (callback) => {
    ipcRenderer.on('new-project', callback);
    return () => ipcRenderer.removeListener('new-project', callback);
  },
  
  onOpenProject: (callback) => {
    ipcRenderer.on('open-project', (event, path) => callback(path));
    return () => ipcRenderer.removeListener('open-project', callback);
  },
  
  onSaveProject: (callback) => {
    ipcRenderer.on('save-project', callback);
    return () => ipcRenderer.removeListener('save-project', callback);
  },
  
  onExportProject: (callback) => {
    ipcRenderer.on('export-project', (event, format) => callback(format));
    return () => ipcRenderer.removeListener('export-project', callback);
  },
  
  onCreateBackup: (callback) => {
    ipcRenderer.on('create-backup', callback);
    return () => ipcRenderer.removeListener('create-backup', callback);
  }
});
