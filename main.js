// 模块来控制应用程序生命周期和创建本机浏览器窗口
const {
    app,
    BrowserWindow,
    ipcMain,
    Menu,
    MenuItem,
    dialog,
    shell
} = require('electron');
const path = require('path');

let newWin = null;
let menu = null;
let mainWinId = null; // 定义全局变量存放主窗口 Id

// 区分操作系统
console.log(process.platform);

// 自定义全局变量存放菜单项
let menuItem = new Menu();

// 创建一个窗口，加载一个界面，界面通过 web 技术实现的，界面运行在渲染进程中
function createWindow() {
    // 创建浏览器窗口
    const mainWin = new BrowserWindow({
        x: 100,
        y: 100, // 设置窗口显示的位置，相对于当前屏幕的左上角
        show: false, // 默认情况下创建一个窗口对象之后就会显示，设置为false 就不会显示了
        width: 800,
        height: 600,
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

    /*
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
    */

    // 定义菜单的内容
    let contextTemp = [
        { label: 'Run Code' },
        { label: '转到定义' },
        { type: 'separator' },
        {
            label: '其它功能',
            click() {
                BrowserWindow.getFocusedWindow().webContents.send(
                    'mtp',
                    '来自于自进程的消息'
                );
            },
        },
    ];

    // 依据上述的内容来创建 menu
    menu = Menu.buildFromTemplate(contextTemp);

    // 加载应用的 index.html
    mainWin.loadFile('index.html');

    mainWinId = mainWin.id;

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
    BrowserWindow.fromId(mainWinId).minimize();
});

ipcMain.on('window-max', () => {
    let mainWin = BrowserWindow.fromId(mainWinId);
    if (mainWin.isMaximized()) {
        // 为true表示窗口已最大化
        mainWin.restore(); // 将窗口恢复为之前的状态.
    } else {
        mainWin.maximize();
    }
});

ipcMain.on('window-close', () => {
    BrowserWindow.fromId(mainWinId).close();
});

ipcMain.on('create-menu', () => {
    // 创建菜单
    let menuFile = new MenuItem({
        label: '菜单',
        submenu: [
            {
                label: '关于',
                click() {
                    shell.openExternal('https://www.electronjs.org/zh/');
                },
            },
            {
                label: '打开',
                click() {
                    BrowserWindow.getFocusedWindow().webContents.send(
                        'openUrl'
                    );
                },
            },
        ],
    });
    let menuEdit = new MenuItem({ label: '编辑', type: 'normal' });
    let customMenu = new MenuItem({ label: '自定义菜单项', submenu: menuItem });

    // 将创建好的自定义菜单添加至 menu
    let menu = new Menu();
    menu.append(menuFile);
    menu.append(menuEdit);
    menu.append(customMenu);

    // 将menu 放置于 app 中显示
    Menu.setApplicationMenu(menu);
});

ipcMain.on('add-menu', (event, label) => {
    console.log('label: ', label);
    menuItem.append(new MenuItem({ label, type: 'normal' }));
});

ipcMain.on('right-click', () => {
    menu.popup({ window: BrowserWindow.getFocusedWindow() });
});

// 主进程接收消息操作
ipcMain.on('asyncMsg', (ev, data) => {
    console.log('11111: ', data);
    ev.sender.send('msg1Re', '这是一条来自于主进程的异步消息');
});

ipcMain.on('syncMsg', (ev, data) => {
    console.log('22222: ', data);
    ev.returnValue = '来自于主进程的同步消息';
});

// 接收其它进程发送的数据，然后完成后续的逻辑
ipcMain.on('openWin2', (ev, data) => {
    console.log('on openWin2...: ', data);
    // 接收到渲染进程中按钮点击信息之后完成窗口2 的打开
    let subWin1 = new BrowserWindow({
        width: 400,
        height: 300,
        parent: BrowserWindow.fromId(mainWinId),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    subWin1.loadFile('subWin1.html');

    subWin1.on('close', () => {
        subWin1 = null;
    });

    // 此时我们是可以直接拿到 sub 进程的窗口对象，因此我们需要考虑的就是等到它里面的所有内容
    // 加载完成之后再执行数据发送
    subWin1.webContents.on('did-finish-load', () => {
        subWin1.webContents.send('its', data);
    });
});

ipcMain.on('stm', (ev, data) => {
    console.log('on stm...: ', data);
    // 当前我们需要将 data 经过 main 进程转交给指定的渲染进程
    // 此时我们可以依据指定的窗口 ID 来获取对应的渲染进程，然后执行消息的发送
    BrowserWindow.fromId(mainWinId).webContents.send('mti', data);
});

ipcMain.on('open-dialog', () => {
    dialog
        .showOpenDialog({
            defaultPath: __dirname,
            buttonLabel: '请选择',
            title: 'xxxx',
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: '代码文件', extensions: ['js', 'json', 'html'] },
                { name: '图片文件', extensions: ['ico', 'jpeg', 'png'] },
                { name: '媒体类型', extensions: ['avi', 'mp4', 'mp3'] },
            ],
        })
        .then((ret) => {
            console.log(ret);
        });
});

ipcMain.on('open-error-box', (ev, data) => {
    dialog.showErrorBox(...data);
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
