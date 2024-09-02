import { runtime } from 'webextension-polyfill';

import badge from '@Services/badge';
import marketMap from './business/market';
import local from './business/local';
import news from './business/news';
import search from './business/search';
import notify from './business/notify';

import './storage';
import './smallWindow';

runtime.onMessage.addListener((msg: any, sender: any, sendResponse: (response?: any) => void) => {
	const cmdMap = new Map([...marketMap, ...local, ...news, ...search, ...notify, ...badge]);
	const { command, data } = msg;
	cmdMap.get(command)?.(sendResponse, data);

	return true;
});