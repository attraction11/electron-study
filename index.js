const path = require('path')
const { shell, ipcRenderer, clipboard, nativeImage  } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    /* 1、显示当前 electron 运行的环境 */
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type]);
    }

    /* 2、点击按钮打开一个新窗口 */
    document.getElementById('btn').addEventListener('click', () => {
        ipcRenderer.send('openNewWindow');
    });

    /* 3、获取元素添加点击操作的监听 */
    let aBtn = document
        .getElementsByClassName('windowTool')[0]
        ?.getElementsByTagName('div');

    if (aBtn) {
        aBtn[0].addEventListener('click', () => {
            // 当前事件发生后说明需要关闭窗口
            ipcRenderer.send('window-close'); // 通知主进程我要关闭
        });

        aBtn[1].addEventListener('click', () => {
            ipcRenderer.send('window-max'); // 通知主进程我要进行最大化 或 还原
        });

        aBtn[2].addEventListener('click', () => {
            ipcRenderer.send('window-min'); // 通知主进程我要进行窗口最小化操作
        });
    }

    /* 4、阻止窗口关闭 */
    /*     
    window.onbeforeunload = function () {
        let oBox = document.getElementsByClassName('isClose')[0];
        oBox.style.display = 'block';

        let yesBtn = oBox.getElementsByTagName('span')[0];
        let noBtn = oBox.getElementsByTagName('span')[1];

        yesBtn.addEventListener('click', () => {
            ipcRenderer.send('window-close'); // 通知主进程我要关闭
        });

        noBtn.addEventListener('click', () => {
            oBox.style.display = 'none';
        });

        return false;
    }; 
    */

    /* 5、自定义菜单（动态） */
    // 获取要应的元素
    let addMenu = document.getElementById('addMenu');
    let menuCon = document.getElementById('menuCon');
    let addItem = document.getElementById('addItem');

    // 生成自定义的菜单
    addMenu.addEventListener('click', () => {
        ipcRenderer.send('create-menu'); // 通知主进程我要创建菜单
    });

    // 动态添加菜单项
    addItem.addEventListener('click', () => {
        // 获取当前 input 输入框当中的内容
        let con = menuCon.value.trim();
        if (con) {
            // menuItem.append(new MenuItem({ label: con, type: 'normal' }))
            ipcRenderer.send('add-menu', con); // 通知主进程我要添加菜单项
            menuCon.value = '';
        }
    });

    /* 6、给鼠标右击添加监听 */
    window.addEventListener(
        'contextmenu',
        (ev) => {
            ev.preventDefault();
            ipcRenderer.send('right-click'); // 通知主进程弹出菜单项
        },
        false
    );

    /* 7、渲染进程与主进程间通信 */
    // 获取元素
    const asyncBtn = document.getElementById('renderToAsync');
    const syncBtn = document.getElementById('renderToSync');

    // 01 采用异步的 API 在渲染进程中给主进程发送消息
    asyncBtn.addEventListener('click', () => {
        ipcRenderer.send('asyncMsg', '当前是来自于渲染进程的一条异步消息');
    });

    // 02 采用同步的方式完成数据通信
    syncBtn.addEventListener('click', () => {
        let val = ipcRenderer.sendSync('syncMsg', '同步消息');
        console.log('44444: ', val);
    });

    // 当前区域是接收消息
    ipcRenderer.on('msg1Re', (ev, data) => {
        console.log('33333: ', data);
    });

    ipcRenderer.on('mtp', (ev, data) => {
        console.log('55555: ', data);
    });

    /* 8、渲染间通信 */
    let openBtn = document.getElementById('openOther')

    openBtn.addEventListener('click', () => {
        ipcRenderer.send('openWin2', '来自于 index 进程')
        // 打开窗口2之后，保存数据至....
        localStorage.setItem('name', 'Hello World')
    })

    // 接收消息
    ipcRenderer.on('mti', (ev, data) => {
        console.log('on mti...: ', data);
    })

    /* 9、Dialog 模块 */
    const dialogBtn = document.getElementById('dialogBtn')
    const dialogBtnErr = document.getElementById('dialogBtnErr')
  
    dialogBtn.addEventListener('click', () => {
        ipcRenderer.send('open-dialog'); // 通知主进程弹出 Dialog
    })
  
    dialogBtnErr.addEventListener('click', () => {
      ipcRenderer.send('open-error-box', ['自定义标题', '当前错误内容']); // 通知主进程弹出 Dialog
    })

    /* 10、shell 与 iframe */
    const openUrl = document.getElementById('openUrl')
    const openFolder = document.getElementById('openFolder')
  
    openUrl.addEventListener('click', (ev) => {
      ev.preventDefault()
      shell.openExternal("https://www.electronjs.org/zh/")
    })
  
    openFolder.addEventListener('click', (ev) => {
      shell.showItemInFolder(path.resolve(__filename))
    })

    ipcRenderer.on('openUrl', () => {
        let iframe = document.getElementById('webview')
        iframe.src = 'https://www.electronjs.org/'
    })

    /* 11、基于 H5 实现消息通知 */
    const triggerBtn = document.getElementById('triggerBtn')

    triggerBtn.addEventListener('click', () => {
        ipcRenderer.send('show-notice'); // 通知主进程弹出 Dialog
    })

    /* 12、剪切板 */
    // 获取元素
    const copyBtn = document.getElementById('copyBtn')
    const pasteBtn = document.getElementById('pasteBtn')
    const aInput = document.querySelector('input.txt1')
    const bInput = document.querySelector('input.txt2')
    const clipImg = document.getElementById('clipImg')
    const ret = null

    copyBtn.onclick = function () {
        // 复制内容
        ret = clipboard.writeText(aInput.value)
    }

    pasteBtn.onclick = function () {
        // 粘贴内容
        bInput.value = clipboard.readText(ret)
    }

    clipImg.onclick = function () {
        // 将图片放置于剪切板当中的时候要求图片类型属于 nativeImage 实例
        let oImage = nativeImage.createFromPath('./msg.png')
        clipboard.writeImage(oImage)

        // 将剪切板中的图片做为 DOM 元素显示在界面上
        let oImg = clipboard.readImage()
        let oImgDom = new Image()
        oImgDom.src = oImg.toDataURL()
        document.body.appendChild(oImgDom)
    }

});
