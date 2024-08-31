// 定义一个延迟函数，返回一个 Promise
const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

// 定义函数数组类型
type Fns = ((...args: any[]) => any)[];

// 定义 Saga 类型
export type Saga = {
  new (...fns: Fns): Saga; // 构造函数
  time: number; // 时间间隔
  start(callback: (a: any) => any, time?: number): void; // 开始方法
  stop(): void; // 停止方法
};

// 定义 Saga 构造函数
const Saga = function Saga(...fns): Saga {
  this.fns = fns; // 存储传入的函数数组
  this.time = 5000; // 默认时间间隔为 5000 毫秒
  this.alarmName = `saga_${Math.random().toString(36).substr(2, 9)}`; // 生成唯一的 alarm 名称
} as Saga;

// 定义一个辅助函数，用于执行函数或返回 undefined
const self = (_) => _?.();

// 定义 Saga 的 start 方法
Saga.prototype.start = function (callback, time) {
  this.time = time || this.time; // 如果提供了时间，则更新时间间隔
  const periodInMinutes = this.time / 60000; // 将毫秒转换为分钟

  // 创建一个 alarm
  chrome.alarms.create(this.alarmName, { periodInMinutes });

  // 监听 alarm 事件
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === this.alarmName) { // 检查是否是本 Saga 实例的 alarm
      try {
        // 执行所有函数并将结果传给回调函数
        callback(await Promise.all(this.fns.map(self)));
      } catch (error) {
        console.log('网络错误，但是keep going', error, this.fns);
      }
    }
  });
};

// 定义 Saga 的 stop 方法
Saga.prototype.stop = function () {
  chrome.alarms.clear(this.alarmName); // 清除 alarm
};

export default Saga; // 导出 Saga 类