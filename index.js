const { BrowserWindow } = require('@electron/remote')

window.addEventListener('DOMContentLoaded', () => {
  // 点击按钮打开一个新窗口
  const oBtn = document.getElementById('btn')
  oBtn.addEventListener('click', () => {
    // ?? 如何去创建窗口
    let indexMin = new BrowserWindow({
      width: 200,
      height: 200
    })
    indexMin.loadFile('list.html')

    indexMin.on("close", () => {
      indexMin = null
    })
  })
})