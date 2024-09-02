/*
 * @Date: 2021-05-12 20:41:16
 * @LastEditors: elegantYu
 * @LastEditTime: 2021-06-17 21:42:17
 * @Description: 轮询store通知，及插件badge轮询
 */
import {
	setBadgeBackground,
	setBadgeText,
	setBadgeTitle,
	createNotify,
	getExtURL,
	getSyncData,
	setSyncData,
	sendMessage,
} from '@Utils/chrome';
import { getDetailXHR } from '@Api/coin';
import { convertCNUnit, formatBadge, isWindows } from '@Utils/index';
import { BackgroundCmdMap, BackgroundAsyncMethod, BadgeData } from '@InterFace/index';
import { SyncKey } from '@Const/local';
import decode from '@Utils/crypto';
import Saga from '@Utils/saga';
import { CMDS_PAGE, CMDS } from '@Src/constants/commands';

let lastStatus = false; //	上次百分比动态
const LOGO = getExtURL('./static/icons/icon.png');
const defaultSetting = {
	dataType: 'price',
	observe: false,
	viewType: true,
	speed: 5000,
};

// 获取和修改badge 设置
const setBadgeSetting: BackgroundAsyncMethod = async (send, d) => {
	await setSyncData({ [SyncKey.BadgeSetting]: d });
	send(1);
};
const getBadgeSetting: BackgroundAsyncMethod = async (send, d) => {
	const syncData = await getSyncData(SyncKey.BadgeSetting);
	const setting = syncData[SyncKey.BadgeSetting];

	send(setting || defaultSetting);
};

const badgeLoop = async () => {
	const syncData = await getSyncData(SyncKey.Badge);
	const badge = syncData[SyncKey.Badge];

	const { code, timestamp } = decode();
	const { data } = await getDetailXHR({ code, timestamp, currency_on_market_id: badge });

	return data;
};

// 创建一个名为 'updateBadge' 的定时任务，每分钟执行一次
chrome.alarms.create('updateBadge', { periodInMinutes: 1 });

// 监听定时任务
chrome.alarms.onAlarm.addListener(async (alarm) => {
  // 检查是否是 updateBadge 任务
  if (alarm.name === 'updateBadge') {
    // 获取最新的徽章数据
    const data = await badgeLoop();
    // 如果数据是数组，取第一个元素，否则使用整个数据
    const d = data?.[0] ?? data;

    // 如果没有数据，直接返回
    if (!d) return;

    // 从存储中获取设置
    const syncData = await getSyncData([SyncKey.Settings, SyncKey.BadgeSetting]);
    // 解构设置数据
    const { crease } = syncData[SyncKey.Settings];
    const { dataType, observe, viewType } = syncData[SyncKey.BadgeSetting] || defaultSetting;
    // 解构币种数据
    const { percent_change_utc0, price_usd, pair, turnover_rate, alias, market_name, logo } = d;
    // 判断价格变化方向
    const status = percent_change_utc0 > 0;
    // 根据设置和变化方向确定颜色
    const up = crease ? '#c35466' : '#4aaa91';
    const down = crease ? '#4aaa91' : '#c35466';
    const color = status ? up : down;
    // 构建徽章标题
    const title = `  特殊关注:
    ${pair}    ${convertCNUnit(price_usd).toString()}
    涨跌幅    ${percent_change_utc0}%
    换手率    ${turnover_rate}  `;

    // 构建发送数据
    const sendData: BadgeData = {
      logo,
      alias,
      pair,
      price: price_usd,
      percent: percent_change_utc0,
      turnover: turnover_rate,
      market: market_name,
    };
    // 根据设置获取显示文本
    const tempText = sendData[dataType];
    const realText = formatBadge(tempText, dataType, viewType)?.toString();

    // 如果需要观察并且状态发生变化，发送通知
    if (observe && lastStatus !== status) {
      lastStatus = status;
      const ctxMsg = `${pair} = ${price_usd} USD`;
      const msg = `特殊关注：${pair} 正在${status ? '上涨' : '下跌'}!`;
      const isWin = isWindows();

      // 构建通知选项
      const notifyOpts: chrome.notifications.NotificationOptions = {
        iconUrl: LOGO,
        contextMessage: isWin ? msg : ctxMsg,
        message: isWin ? ctxMsg : msg,
        title: `"币"浏览器插件`,
        type: 'basic',
      };

      // 创建通知
      createNotify(notifyOpts);
    }

    // 发送消息更新徽章数据
    sendMessage({ command: CMDS_PAGE.CMD_GET_BADGE, data: sendData });
    // 设置徽章背景颜色
    chrome.action.setBadgeBackgroundColor({ color });
    // 设置徽章文本
    chrome.action.setBadgeText({ text: realText });
    // 设置徽章标题
    chrome.action.setTitle({ title });
  }
});

export default [
	[CMDS.CMD_GET_BADGESETTING, (send) => getBadgeSetting(send)],
	[CMDS.CMD_SET_BADGESETTING, (send, d) => setBadgeSetting(send, d)],
] as BackgroundCmdMap;
