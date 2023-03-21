import { getSort, getMutipSort } from '@/utils/functions';
import Vue from 'vue';
import { chatData } from '@/utils/data/chatData';
import { chatUtils } from '@/utils/my/chatUtils';
import { lastUtils } from '@/utils/my/lastChatUtils';

const Talk = {
	state: {
		// 用户对话列表
		items: [],

		// 最后一条消息
		unreadMessage: {
			num: 0,
			nickname: '未知',
			content: '...',
		},

		// 对话列表重载状态
		heavyLoad: false,
	},
	getters: {
		// 过滤所有置顶对话列表
		topItems: (state) => {
			return state.items.filter((item) => item.isTop == 1);
		},
		talkItems: (state) => {
			return state.items.sort(
				getMutipSort([
					getSort((a, b) => a.isTop > b.isTop),
					getSort((a, b) => a.unreadNum > b.unreadNum),
					getSort((a, b) => a.updateTime > b.updateTime),
				])
			);
		},
		// 消息未读数总计
		unreadNum: (state) => {
			return state.items.reduce((total, item) => {
				return total + parseInt(item.unreadNum);
			}, 0);
		},
		talkNum: (state) => state.items.length,
	},
	mutations: {
		unread_add(state, { chatId, count, params }) {
			// console.log('222', chatId, count, params);
			if (params == 'go') {
				// console.log('1111', chatId, count, params);
				state.items.forEach((chat) => {
					// console.log('chat.chatId == chatId', chat.chatId == chatId);
					if (chat.chatId == chatId) {
						// console.log('有这个数据么', count);
						chat.unreadNum = 0;
					}
				});
				// console.log(7755555, state.items);

				return;
			}
			state.items.forEach((chat) => {
				if (params == 202) {
					chat.unreadNum -= count;
					if (chat.unreadNum < 0) {
						chat.unreadNum = 0;
					}
				} else {
					if (chat.chatId == chatId) {
						chat.unreadNum += count;
					}
				}
			});
		},
		unread_clear(state, chatId) {
			state.items.forEach((chat) => {
				if (chat.chatId == chatId) {
					chat.unreadNum = 0;
				}
			});
		},
		// 设置对话列表
		chats_init(state, data) {
			let items = [];
			data.forEach((item) => {
				let format = lastUtils.formatTalkItem(item);
				if (format) {
					items.push(format);
				}
			});

			items.pushAllFilter(chatData.listNew(), 'chatId');
			state.items = items;
		},
		del_draft(state, chatId) {
			state.items.forEach((chat) => {
				if (chat.chatId == chatId) {
					chat.draftText = '';
				}
			});
		},
		update_chat_name(state, { chatId, name }) {
			state.items.forEach((chat) => {
				if (chat.chatId == chatId) {
					chat.name = name;
				}
			});
		},
		// 更新对话节点
		UPDATE_TALK_ITEM(state, resource) {
			Object.assign(state.items[resource.index], resource.item);
		},
		// 新增对话节点
		INSERT_TALK_ITEM(state, resource) {
			if (resource) {
				if (!chatUtils.hasChat(resource.chatId)) {
					state.items.push(resource);
				}
			}
		},

		// 移除对话节点
		del_chat(state, chatId) {
			if (chatUtils.isCurrentChat(chatId)) {
				this.commit('update_current_chatId', null);
			}
			state.items.delByFields('chatId', chatId);
		},

		// 更新对话节点在线状态
		UPDATE_TALK_ONLINE_STATUS(state, resource) {
			state.items[resource.index].online = parseInt(resource.status);
		},
		// 更新节点
		update_chat(state, { chatId, key, value }) {
			state.items.forEach(function(item) {
				if (item.chatId == chatId) {
					console.log(chatId);
					Vue.set(item, key, value);
					// item[key] = value
				}
			});
		},
		// 更新对话消息
		UPDATE_TALK_MESSAGE(state, resource) {
			state.items[resource.index].content = resource.item.content;
			// state.items[resource.index].unreadNum++
			state.items[resource.index].updateTime = resource.item.updateTime;
		},

		// 触发对话列表重新加载
		TRIGGER_TALK_ITEMS_LOAD(state, status = false) {
			state.heavyLoad = status;
		},

		SET_TLAK_UNREAD_MESSAGE(state, resource) {
			state.unreadMessage.num++;
			state.unreadMessage.nickname = resource.nickname;
			state.unreadMessage.content = resource.content;
		},

		// 清除最后一条未读消息
		CLEAR_TLAK_UNREAD_MESSAGE(state) {
			state.unreadMessage = {
				num: 0,
				nickname: '未知',
				content: '...',
			};
		},
	},
};

export default Talk;
