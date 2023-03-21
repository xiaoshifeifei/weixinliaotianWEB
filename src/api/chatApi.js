import { post, get, upload } from '@/utils/request';
import { chatUtils } from '@/utils/my/chatUtils';
import { AppConfig } from '@/utils/old/appconfig';
import { getToken } from '@/utils/auth';
import store from '@/store';

export const chatApi = {
	// 获取聊天列表服务接口
	listChat(data) {
		return get('/api/tigase/getLastChatList', {
			startTime: 0,
			endTime: 0,
			pageSize: 20,
		});
	},
	// 获取聊天记录服务接口
	pageMsg({ chatId, endTime, startTime, pageIndex }) {
		let paramsData = Date.now();

		let group = chatUtils.isGroupId(chatId);
		let url = '/api/tigase/shiku_msgs';
		let maxType = 500;
		if (group) {
			url = '/api/tigase/shiku_muc_msgs';
			maxType = 0;
		}
		let params = {
			pageIndex: pageIndex ? pageIndex : 0,
			pageSize: 50,
			endTime: endTime ? endTime : paramsData,
			startTime: startTime ? startTime : 0,
			maxType: maxType,
		};
		params[!group ? 'receiver' : 'roomId'] = chatId;
		return get(url, params);
	},
	// 对话列表置顶服务接口
	setTop(data) {
		if (data.type == 2) {
			return post('/api/friends/update/OfflineNoPushMsg', data);
		} else {
			return post('/api/room/member/setOfflineNoPushMsg', data);
		}
	},
	// 发送聊天图片服务接口
	uploadImage(file) {
		let formData = new FormData();
		// formData.append('name', 'file');
		// formData.append('access_token', getToken());
		formData.append('file', file);
		formData.append('userId', store.state.user.userId);
		return upload(AppConfig.uploadUrl, formData);
	},

	delChat(chatId) {
		let isGroup = chatUtils.isGroupId(chatId);
		return post('/api/tigase/delLastChatList', {
			toUserId: chatId,
			isJid: isGroup ? 1 : 0,
		});
	},
};

// 发送聊天文件服务接口
export const ServeSendTalkFile = (data) => {
	return post('/api/v1/talk/send-file', data);
};

// 聊天列表创建服务接口
export const ServeCreateTalkList = (data) => {
	return post('/api/v1/talk/create', data);
};

// 删除聊天列表服务接口
export const ServeDeleteTalkList = (data) => {
	return post('/api/v1/talk/delete', data);
};

// 清除聊天消息未读数服务接口
export const ServeClearTalkUnreadNum = (data) => {
	return post('/api/v1/talk/update-unread-num', data);
};

// 撤回消息服务接口
export const ServeRevokeRecords = (data) => {
	return post('/api/v1/talk/revoke-records', data);
};

// 删除消息服务接口
export const ServeRemoveRecords = (data) => {
	return post('/api/v1/talk/remove-records', data);
};

// 转发消息服务接口
export const ServeForwardRecords = (data) => {
	return post('/api/v1/talk/forward-records', data);
};

// 获取转发会话记录详情列表服务接口
export const ServeGetForwardRecords = (data) => {
	return get('/api/v1/talk/get-forward-records', data);
};

// 查找用户聊天记录服务接口
export const ServeFindTalkRecords = (data) => {
	return get('/api/v1/talk/find-chat-records', data);
};

// 搜索用户聊天记录服务接口
export const ServeSearchTalkRecords = (data) => {
	return get('/api/v1/talk/search-chat-records', data);
};

export const ServeGetRecordsContext = (data) => {
	return get('/api/v1/talk/get-records-context', data);
};

// 发送代码块消息服务接口
export const ServeSendTalkCodeBlock = (data) => {
	return post('/api/v1/talk/send-code-block', data);
};

// 发送表情包服务接口
export const ServeSendEmoticon = (data) => {
	return post('/api/v1/talk/send-emoticon', data);
};
