/*
 * @Date: 2021-03-23 14:37:02
 * @LastEditors: elegantYu
 * @LastEditTime: 2021-05-28 14:03:52
 * @Description: chrome api 封装
 */
import { DefaultObject, SyncDataType } from '@InterFace/index';
import { storage } from 'webextension-polyfill';

type SendMessage = (params: { command: string; data?: DefaultObject | string | number | null }) => Promise<any>;

type CreateNotify = (options: chrome.notifications.NotificationOptions) => Promise<string>;

type SetBadgeText = (text: string) => Promise<void>;

type SetBadgeColor = (color: string) => Promise<void>;

type GetSyncMethod<T> = <K extends keyof T>(fields: K | K[] | null) => Promise<T>;

export const sendMessage: SendMessage = ({ command, data = null }) =>
	new Promise((resolve) => {
		chrome.runtime.sendMessage({ command, data }, (res) => {
			console.log('sendMessage res', command, data, res, chrome.runtime.lastError);
			resolve(res);
		});
	});

export const createNotify: CreateNotify = (options) =>
	new Promise((resolve) => {
		chrome.notifications.create('', options, resolve);
	});

export const setBadgeText: SetBadgeText = (text) =>
	new Promise((resolve) => {
		chrome.action.setBadgeText({ text }, resolve);
	});

export const setBadgeBackground: SetBadgeColor = (color) =>
	new Promise((resolve) => {
		chrome.action.setBadgeBackgroundColor({ color }, resolve);
	});

export const setBadgeTitle = (title: string) =>
	new Promise((resolve) => {
		chrome.action.setTitle({ title }, () => resolve(1));
	});

export const getExtURL = (path: string) => chrome.runtime.getURL(path);

export const getManifest = () => chrome.runtime.getManifest();

export const getSyncData: GetSyncMethod<SyncDataType> = (fields) =>
	new Promise((resolve) => {
		storage.sync.get(fields as string | string[] | Record<string, unknown> | null).then((d) => resolve(d as SyncDataType));
	});

export const setSyncData = (items: DefaultObject) =>
	new Promise((resolve) => {
		storage.sync.set(items).then(() => resolve(1));
	});

export const removeSyncData = (fields: string | string[]) =>
	new Promise((resolve) => {
		storage.sync.remove(fields).then(() => resolve(1));
	});
