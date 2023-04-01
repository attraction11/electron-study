// 模块来控制应用程序生命周期和创建本机浏览器窗口
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

let newWin = null;
let mainWin = null;

// 区分操作系统
console.log(process.platform);

// 创建一个窗口，加载一个界面，界面通过 web 技术实现的，界面运行在渲染进程中
function createWindow() {
    // 创建浏览器窗口
    mainWin = new BrowserWindow({
        x: 100,
        y: 100, // 设置窗口显示的位置，相对于当前屏幕的左上角
        show: false, // 默认情况下创建一个窗口对象之后就会显示，设置为false 就不会显示了
        width: 800,
        height: 400,
        maxHeight: 600,
        maxWidth: 1000,
        minHeight: 200,
        minWidth: 300, // 可以通过 min max 来设置当前应用窗口的最大和最小尺寸
        // resizable: false,  // 是否允许缩放应用的窗口大小
        // frame: false, // 设置为 false 时可以创建一个无边框窗口 默认值为 true
        // transparent: true,  // 是否透明
        // autoHideMenuBar: true, // 是否显示菜单栏
        icon: 'lg.ico', // 设置一个图片路径，可以自定义当前应用的显示图标
        title: 'Hello Electron', // 自定义当前应用的显示标题
        webPreferences: {
            nodeIntegration: true, // 是否启用Node integration. 默认值为 false.
            contextIsolation: false, // Electron 10+ 中，remote 模块默认处于禁用状态。
            // enableRemoteModule: true, // Electron 14+  已经废弃
            // preload: path.join(__dirname, 'preload.js'),
        },
    });

    // 01 自定义菜单的内容
    let menuTemp = [
        {
            label: '角色', // 角色菜单
            submenu: [
                { label: '复制', role: 'copy' },
                { label: '剪切', role: 'cut' },
                { label: '粘贴', role: 'paste' },
                { label: '最小化', role: 'minimize' },
            ],
        },
        {
            label: '类型', // 类型菜单
            submenu: [
                { label: '选项1', type: 'checkbox' },
                { label: '选项2', type: 'checkbox' },
                { label: '选项3', type: 'checkbox' },
                { type: 'separator' },
                { label: 'item1', type: 'radio' },
                { label: 'item2', type: 'radio' },
                { type: 'separator' },
                { label: 'windows', type: 'submenu', role: 'windowMenu' },
            ],
        },
        {
            label: '其它',
            submenu: [
                {
                    label: '打开',
                    icon: './open.png',
                    accelerator: 'ctrl + o',
                    click() {
                        console.log('open操作执行了');
                    },
                },
            ],
        },
    ];

    // 02 依据上述的数据创建一个 menu
    let menu = Menu.buildFromTemplate(menuTemp);

    // 03 将上述的菜单添加至 app 身上
    Menu.setApplicationMenu(menu);

    // 加载应用的 index.html
    mainWin.loadFile('index.html');

    mainWin.on('ready-to-show', () => {
        mainWin.show();
    });

    // 打开 DevTools
    // mainWin.webContents.openDevTools()

    mainWin.webContents.on('dom-ready', () => {
        console.log('222 dom-ready...');
    });

    mainWin.webContents.on('did-finish-load', () => {
        console.log('333 did-finish-load...');
    });

    mainWin.on('close', () => {
        console.log('888 close...');
        // mainWin = null
    });
}

// 当 Electron 完成时，该方法将被调用（app 启动完成）
// 初始化并准备创建浏览器窗口。
// 某些api只能在此事件发生后使用。
app.whenReady().then(() => {
    createWindow();
    console.log('111 ready...');

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

ipcMain.on('openNewWindow', () => {
    if (!newWin) {
        // ?? 如何去创建窗口
        let indexMin = new BrowserWindow({
            parent: BrowserWindow.getFocusedWindow(),
            width: 200,
            height: 200,
            modal: true,
        });

        indexMin.loadFile('list.html');

        indexMin.on('close', () => {
            indexMin = null;
        });
    }
});

ipcMain.on('get-current-window', (event) => {
    const currentWindow = BrowserWindow.getFocusedWindow();
    event.returnValue = currentWindow;
});

ipcMain.on('window-min', () => {
    mainWin.minimize();
});

ipcMain.on('window-max', () => {
    if (mainWin.isMaximized()) {
        // 为true表示窗口已最大化
        mainWin.restore(); // 将窗口恢复为之前的状态.
    } else {
        mainWin.maximize();
    }
});

ipcMain.on('window-close', () => {
    mainWin.close();
});

// 当所有窗口都关闭时退出
app.on('window-all-closed', function () {
    console.log('444 window-all-closed...');
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
    console.log('555 before-quit...');
});

app.on('will-quit', () => {
    console.log('666 will-quit...');
});

app.on('quit', () => {
    console.log('777 quit...');
});

/* 
  在这个文件中，你可以包含你的应用程序的其他特定的主进程代码。
  您还可以将它们放在单独的文件中，并在这里要求它们。
*/
