1. manifest.json 更新
    a. 更新 manifest_version
    b. 调整权限声明
    c. 更新 background 配置
       i. 移除 "page" 和 "persistent" 字段
       ii. 添加 "service_worker" 字段，指向新的 background.js
    d. 修改 content_security_policy
    e. 更新 action（原 browser_action）
2. 后台脚本改造
    a. 将后台页面转换为 Service Worker
       i. 创建新的 background.js 文件
       ii. 将原 background.html 中的 JavaScript 代码迁移到 background.js
       iii. 调整代码以适应 Service Worker 环境（移除 DOM 操作，使用 self 替代 window 等）
    b. 重构长期运行的任务
    c. 实现新的生命周期事件处理
       i. 添加 chrome.runtime.onInstalled 事件监听器
       ii. 添加 chrome.runtime.onStartup 事件监听器
    d. 更新消息传递机制
3. 存储机制调整
    a. 审查并更新存储 API 使用
    b. 实现新的数据同步策略
消息传递机制更新
    a. 重新设计 popup 和 options 页面与后台脚本的通信
    b. 更新内容脚本（如果有）与后台脚本的通信
4. API 替换和调整
    a. 替换已弃用的 API（如 webRequest）
    b. 更新到新版本的 Chrome API
    c. 将 chrome.browserAction 替换为 chrome.action
5. 内容安全策略（CSP）适配
   a. 移除内联脚本
   b. 调整外部资源加载策略
   c. 更新 manifest.json 中的 content_security_policy 配置
6. 权限使用优化
    a. 审查并精简所需权限
    b. 实现可选权限（如果适用）
7. 网络请求处理
    a. 从 webRequest 迁移到 declarativeNetRequest（如果适用）
    b. 更新网络请求相关的配置和代码
构建过程更新
    a. 更新 webpack 配置
       i. 移除生成 background.html 的 HtmlPlugin 配置
       ii. 确保 webpack 入口配置包含 background.js
    b. 更新其他构建脚本（如果需要）
8. 测试和调试
    a. 在 Chrome 开发者模式下进行本地测试
    b. 使用 Chrome 开发者工具进行调试
    c. 进行跨版本兼容性测试
9. 性能优化
    a. 优化 Service Worker 的启动和运行
    b. 实现高效的数据缓存策略
10. 文档更新
    a. 更新扩展的使用说明
    b. 记录重大变更和新功能
11. 发布准备
    a. 更新版本号
    b. 准备新的发布说明
    c. 在 Chrome Web Store 中更新扩展信息