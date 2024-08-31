import Observer from '@Services/store';

// 监听安装事件
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
    // 执行初始化操作
    await initializeExtension();
  } else if (details.reason === 'update') {
    console.log('Extension updated');
    // 执行更新操作
    await handleExtensionUpdate();
  }
});

// 监听启动事件
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started, extension running');
  // 初始化Observer
  Observer.init();
});

// 初始化扩展
async function initializeExtension() {
  // 这里可以添加初始化逻辑，比如设置默认配置等
  console.log('Initializing extension');
  await Observer.init();
}

// 处理扩展更新
async function handleExtensionUpdate() {
  // 这里可以添加更新逻辑，比如迁移数据等
  console.log('Handling extension update');
  await Observer.init();
}

// 处理来自popup和options页面的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('收到消息:', request);
    
    switch (request.action) {
      case 'getData':
        // 处理获取数据的请求
        handleGetData(request.payload, sendResponse);
        break;
      case 'updateData':
        // 处理更新数据的请求
        handleUpdateData(request.payload, sendResponse);
        break;
      // 添加其他消息处理case
      default:
        console.log('未知操作:', request.action);
        sendResponse({ error: '未知操作' });
    }
    
    // 返回true表示我们将异步发送响应
    return true;
  });
  
  function handleGetData(payload, sendResponse) {
    // 实现获取数据的逻辑
    // 使用chrome.storage.sync.get或其他适当的方法
    chrome.storage.sync.get(payload.key, (result) => {
      sendResponse({ data: result[payload.key] });
    });
  }
  
  function handleUpdateData(payload, sendResponse) {
    // 实现更新数据的逻辑
    // 使用chrome.storage.sync.set或其他适当的方法
    chrome.storage.sync.set({ [payload.key]: payload.value }, () => {
      sendResponse({ success: true });
    });
  }