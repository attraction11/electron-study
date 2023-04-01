const { ipcRenderer } = require('electron');

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
        .getElementsByTagName('div');

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

    /* 4、阻止窗口关闭 */
    window.onbeforeunload = function () {
      let oBox = document.getElementsByClassName('isClose')[0]
      oBox.style.display = 'block'
  
      let yesBtn = oBox.getElementsByTagName('span')[0]
      let noBtn = oBox.getElementsByTagName('span')[1]
  
      yesBtn.addEventListener('click', () => {
        ipcRenderer.send('window-close'); // 通知主进程我要关闭
      })
  
      noBtn.addEventListener('click', () => {
        oBox.style.display = 'none'
      })
  
      return false
    }
});
