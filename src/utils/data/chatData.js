/**
 * 问题: 新接入的会话如果自己未曾发过消息， 则接口不会返回此会话
 * 解决： 1. 将新会话， 放到缓存中， 未主动删除则不会消失
 *       2. 初始化时将此类会话合并显示
 * @type {{}}
 */
import { localCache } from '@/utils/data/localData';
import store from '@/store';
import { keyConst } from '@/utils/my/const/keyConst';

export const chatData = {
	addNew(chat) {
		if (chat) {
			if (
				!localCache.List.has(keyConst.lastChats, chat.chatId, 'chatId')
			) {
				localCache.List.add(keyConst.lastChats, chat);
			}
		}
	},
	delNew(chatId) {
		localCache.List.del(keyConst.lastChats, chatId, 'chatId');
	},
	listNew() {
		return localCache.List.get(keyConst.lastChats);
	},
	isDisturb(chatId) {
		return localCache.get('disturb-' + chatId);
	},
	addDisturb(chatId) {
		store.commit('update_chat', {
			chatId: chatId,
			key: 'disturb',
			value: 1,
		});
		localCache.set('disturb-' + chatId, 1);
	},
	delDisturb(chatId) {
		store.commit('update_chat', {
			chatId: chatId,
			key: 'disturb',
			value: 0,
		});
		localCache.remove('disturb-' + chatId);
	},

	unreadMsgIdAdd(chatId, msgId) {
		localCache.List.add('unread_msgIds_' + chatId, msgId);
	},
	unreadMsgIdGet(chatId) {
		return localCache.List.get('unread_msgIds_' + chatId);
	},
	unreadGet(chatId) {
		let unread = localCache.get('unread_' + chatId);
		if (!unread) {
			unread = 0;
		} else {
			unread = parseInt(unread);
		}
		// console.log(8997,unread);
		return unread;
	},
	//增加未读数， 同步store
	unreadAdd(chatId, count, paramsItem) {
		if (count == 'go') {
			console.log('处理数据', chatId, paramsItem);
			localCache.set('unread_' + chatId, paramsItem);
			store.commit('unread_add', {
				chatId: chatId,
				count: paramsItem,
				params: 'go',
			});
			return;
		}
		// console.log(888999,chatId, count);
		if (!count) {
			count = 1;
		}
		let unread = this.unreadGet(chatId);
		// console.log("store.state", store.state);
		// console.log(6666777, sessionStorage.getItem("mess"));
		// console.log("unread111",unread);
		if (
			sessionStorage.getItem('mess') &&
			sessionStorage.getItem('mess') == 202
		) {
			unread -= count;
		} else {
			unread += count;
		}
		if (unread < 0) {
			unread = 0;
		}
		// console.log("unread",unread);
		localCache.set('unread_' + chatId, unread);
		store.commit('unread_add', {
			chatId: chatId,
			count: count,
			params: sessionStorage.getItem('mess') || '',
		});
	},
	//清空， 同步store
	unreadClear(chatId) {
		localCache.set('unread_' + chatId, 0);
		store.commit('unread_clear', chatId);
	},
};
