import protoRoot from '@/proto/proto';
import { receiver } from '@/utils/old/receiver';
import { isNil, sleep } from '@/utils/utils';
import { msgData } from '@/utils/data/msgData';
import TalkEvent from '@/plugins/socket/event/talk-event';
import { msgUtils } from '@/utils/my/msgUtils';
import { busService } from '@/service/busService';
import { eventConst } from '@/utils/my/const/eventConst';
import { localCache } from '@/utils/data/localData';
import { WEBIM } from '@/utils/old/webim';
import { appUtils } from '@/utils/my/appUtils';
import { msgConst } from '@/utils/my/const/msgConst';
import store from '@/store';
import { chatApi } from '@/api/chatApi';

export const imSdk = {
	//定时发送回执
	sendReceiptTask: null,
	cont: 'skim_',
	websocket: null,
	serverUrl: null,
	/*登陆成功的回调*/
	logincallBack: null,
	/*消息回执 处理方法*/
	handlerMsgReceipt: null,
	handlerLoginConflict: null,
	userIdStr: null,
	token: null,
	deviceId: null,
	/*心跳间隔时间*/
	pingTime: 30,
	/*最后一次传递消息的时间*/
	lastTransferTime: 0,
	lockReconnect: false,

	initApi(url, userId, resource, token, pingTime, server) {
		let deviceId = localCache.get('deviceId');
		if (!deviceId) {
			deviceId = imSdk.randomUUID();
			localCache.set('deviceId', deviceId);
		}

		imSdk.deviceId = deviceId;
		imSdk.token = token;
		imSdk.serverUrl = url;
		imSdk.server = server;
		// imSdk.myCount = 0;
		imSdk.resource = imSdk.resource;
		imSdk.userIdStr = userId + '/' + resource;
		imSdk.pingTime = pingTime * 1000;
		imSdk.server = server;
	},
	loginIM: function(callback) {
		if (imSdk.isConnect()) {
			console.log('websocket已经连接了， 不需要在连接了.....');
			busService.emit(eventConst.connect);
			return true;
		}
		// console.log("socket connect ....",callback);
		try {
			if (callback) imSdk.logincallBack = callback;
			imSdk.websocket = new WebSocket(imSdk.serverUrl);
			imSdk.websocket.onopen = imSdk.onopen;
			imSdk.websocket.onmessage = imSdk.onmessage;
			imSdk.websocket.onerror = imSdk.onerror;
			imSdk.websocket.onclose = imSdk.onclose;
			imSdk.websocket.binaryType = 'arraybuffer';

			if (!this.sendReceiptTask)
				this.sendReceiptTask = setInterval(function() {
					console.log('3s  发送回执一次.');

					let groupsReceiptIds = msgData.receiptRoomMsgIds;
					if (groupsReceiptIds) {
						let receipt = imSdk.buildReceiptMessage(
							groupsReceiptIds,
							2,
							imSdk.server
						);
						// let unread = localCache.get(
						// 	'unread_' + '3875b8fd5c67421bb6d6cc34a046c508'
						// );
						// imSdk.myCount += 1;
						// console.log(
						// 	'总条数:' +
						// 		unread +
						// 		'---' +
						// 		'回执数：' +
						// 		imSdk.myCount
						// );

						console.log('群组回执: ' + JSON.stringify(receipt));
						let buffer = imSdk.encodeMessage(
							receipt,
							Command.MESSAGE_RECEIPT
						);
						imSdk.sendBytes(buffer);
						msgData.receiptRoomMsgIds = '';
					}

					let friendsReceiptIds = msgData.receiptFriendMsgIds;
					if (friendsReceiptIds) {
						let receipt = imSdk.buildReceiptMessage(
							friendsReceiptIds,
							1,
							imSdk.server
						);

						console.log('群组回执: ' + JSON.stringify(receipt));
						let buffer = imSdk.encodeMessage(
							receipt,
							Command.MESSAGE_RECEIPT
						);
						imSdk.sendBytes(buffer);
						msgData.receiptFriendMsgIds = '';
					}
				}, 3000);
		} catch (e) {
			console.log(e.message);
			imSdk.reconnect();
		}
	},
	loginSuccess: function(message) {
		if (imSdk.logincallBack) imSdk.logincallBack(message);
		if (imSdk.userIdStr == message.from) {
			clearInterval(imSdk.ping);
			imSdk.ping = window.setInterval(function() {
				imSdk.sendPing();
			}, imSdk.pingTime);
		} else {
			/*其他设备登陆*/
		}
	},
	onopen: function(e) {
		console.log('打开连接  ===> ');
		console.log(e);
		let message = imSdk.buildAuthMessage();
		let buffer = imSdk.encodeMessage(message, Command.COMMAND_AUTH_REQ);
		imSdk.sendBytes(buffer);
	},
	/*收到服务器消息*/
	onmessage: function(e) {
		// DBUtils.setLastMsgTime()
		//heartCheck.reset().start();
		let dataArr = new Uint8Array(e.data);
		let cmd = dataArr[0];
		if (cmd > 127) {
			cmd = cmd - 256;
		}
		imSdk.lastTransferTime = imSdk.getCurrentSeconds();
		// console.log("onmessage  cmd ===> " + cmd);
		if (0 == cmd) return;
		//错误信息
		let bytes;
		if (cmd == -1) {
			bytes = dataArr.subarray(2, dataArr.length);
		} else {
			bytes = dataArr.subarray(1, dataArr.length);
		}
		let message = imSdk.decodeMessage(bytes, cmd);
		/*let dataStr=JSON.stringify(message);*/
		message = imSdk.convertToClientMsg(message);
		if (msgData.hasId(message.messageId)) {
			return;
		}
		message = msgUtils.wrapMessage(message);
		// console.log("收到 message " + JSON.stringify(message));
		if (store.state.talks.items && message.type == 202) {
			let isRecords = store.state.talks.items;
			var maArr = [];
			isRecords.map((item) => {
				maArr.push(item.chatId);
			});
			var typeParams = null;
			maArr.map((item, index) => {
				if (item == message.chatId) {
					typeParams = index;
				}
			});
			const data = {
				chatId: message.chatId,
			};
			var myDatas = [];
			chatApi
				.pageMsg(data)
				.then((res) => {
					if (res.resultCode != 1) return;
					let Arr = res.data;
					if (Arr.length) {
						Arr.map((item) => {
							if (item.contentType == 1) {
								myDatas.push(item.content);
							}
							if (myDatas.length) {
								isRecords[typeParams].type = 202;
								isRecords[typeParams].content = myDatas[0];
								store.state.talks.items = isRecords;
							} else {
								isRecords[typeParams].type = 202;
								isRecords[typeParams].content = '';
								store.state.talks.items = isRecords;
							}
						});
					} else {
						isRecords[typeParams].type = 202;
						isRecords[typeParams].content = '';
						store.state.talks.items = isRecords;
					}
				})
				.catch(() => {
					this.records.loadStatus = 0;
				});
		}

		sessionStorage.setItem('mess', message.type);
		// console.log("收到 message", message);
		msgData.receiveMsg(message, cmd);
		receiver.handlerMessageBycmd(cmd, message);
	},
	//重连
	reconnect: function() {
		// console.error('当前状态： ' + imSdk.websocket.readyState)
		if (imSdk.lockReconnect) {
			return;
		}

		imSdk.lockReconnect = true;
		//没连接上会一直重连，设置延迟避免请求过多
		setTimeout(function() {
			console.log('reconnect 。。。');
			WEBIM.loginIM();
			//执行重连初始化逻辑
		}, 2000);
	},

	disconnect: function(e) {
		clearInterval(imSdk.ping);
		imSdk.websocket.close();
	},
	isConnect: function() {
		if (!imSdk.websocket) return false;
		return 1 == imSdk.websocket.readyState;
	},
	sendPing: function() {
		if (!imSdk.isConnect()) return;
		console.log('发送心跳包');
		let message = imSdk.buildPingMessage();
		let buffer = imSdk.encodeMessage(message, Command.Ping_REQ);
		imSdk.sendBytes(buffer);
	},
	onerror: function(e) {
		console.error(
			'websocket 异常: ' + e.code + ' ' + e.reason + ' ' + e.wasClean
		);
		// console.log(e);
		// imSdk.lockReconnect = false;
		imSdk.reconnect();
	},
	onclose: function(e) {
		console.error(
			'websocket 断开: ' + e.code + ' ' + e.reason + ' ' + e.wasClean
		);
		// console.log(e);
		imSdk.lockReconnect = false;
		// setTimeout(function () {
		imSdk.reconnect();
		// }, 10000)
	},

	/*
    发送消息 api
    */
	sendMessage: function(msg, cmd) {
		// console.log('====================================');
		// console.log("发送消息 api",msg, cmd);
		// console.log('====================================');
		if (!cmd) cmd = Command.COMMAND_CHAT;

		let to = msg.to;
		if (!to) {
			to = msg.toUserId;
		}
		let head = imSdk.buildMessageHead(to, msg.chatType);
		if (msg.messageId) head.messageId = msg.messageId;
		msg.messageHead = head;
		if (msg.timeLen) msg.fileTime = msg.timeLen;

		if (!head.from || !head.to) {
			console.error('消息体有误。。。。。。。');
			return;
		}
		//delete msg["to"];
		let buffer = imSdk.encodeMessage(msg, cmd);
		imSdk.sendBytes(buffer);
		msg.isSend = true;
		// return
		if (msg.type != msgConst.read) {
			new TalkEvent(msgUtils.wrapMessage(msg)).handle();
		}
	},
	sendBytes: function(bytes) {
		if (!imSdk.isConnect()) sleep(1000);
		//console.log("sendBytes  ===>  "+bytes);
		imSdk.websocket.send(bytes);
	},

	/*转换为 客户端的 消息*/
	convertToClientMsg: function(msg) {
		msg = JSON.parse(JSON.stringify(msg));
		let message = msg;
		if (msg.messageHead) {
			if (ChatType.GROUPCHAT == msg.messageHead.chatType) {
				message.from = msg.messageHead.to;
				message.to = imSdk.userIdStr;
				message.fromJid = msg.messageHead.from;
			} else {
				message.from = msg.messageHead.from;
				message.to = msg.messageHead.to;
			}
			message.messageId = msg.messageHead.messageId;
			message.chatType = msg.messageHead.chatType;
			message.offline = msg.messageHead.offline;
			message.timeLen = message.fileTime;
			if (message.locationX) {
				message.location_x = message.locationX;
				delete message['locationX'];
			}
			if (message.locationY) {
				message.location_y = message.locationY;
				delete message['locationY'];
			}

			delete message['messageHead'];
			delete message['fileTime'];
		} else {
			message.messageId = msg.messageId;
			message.chatType = msg.chatType;
		}

		/* let dataStr=JSON.stringify(message);
         console.log("convertToClientMsg end  ===> "+dataStr);*/
		return message;
	},
	buildChatMessage: function() {},
	/*创建消息头*/
	buildMessageHead: function(to, chatType) {
		let head = {
			from: imSdk.userIdStr,
			messageId: imSdk.randomUUID(),
			chatType: !chatType ? 0 : chatType,
			to: !to ? '' : to + '',
		};
		return head;
	},
	buildAuthMessage: function() {
		let head = imSdk.buildMessageHead('server', ChatType.AUTH);
		let message = {
			messageHead: head,
			token: imSdk.token,
			deviceId: imSdk.deviceId,
		};
		return message;
	},
	buildPingMessage: function() {
		let head = imSdk.buildMessageHead('server', ChatType.PING);
		let message = {
			messageHead: head,
		};
		return message;
	},
	buildReceiptMessage: function(messageId, chatType, to) {
		let head = imSdk.buildMessageHead(to, chatType);
		let message = {
			messageHead: head,
			messageId: messageId,
			status: 2,
		};
		return message;
	},
	/*加入群组*/
	joinGroupChat(jid, seconds) {
		let head = imSdk.buildMessageHead('server', ChatType.CHAT);
		let message = {
			messageHead: head,
			jid: jid,
			seconds: seconds,
		};
		let buffer = imSdk.encodeMessage(message, Command.JOINGROUP_REQ);
		imSdk.sendBytes(buffer);
	},
	exitGroupChat(jid) {
		let head = imSdk.buildMessageHead('server', ChatType.CHAT);
		let message = {
			messageHead: head,
			jid: jid,
		};
		let buffer = imSdk.encodeMessage(message, Command.EXITGROUP_REQ);
		imSdk.sendBytes(buffer);
	},
	/*批量请求 群组消息数量*/
	pullBatchGroupMessage: function(jidList) {
		let head = imSdk.buildMessageHead('server', ChatType.CHAT);
		let message = {
			messageHead: head,
			jidList: jidList,
			endTime: imSdk.getCurrentSeconds(),
		};
		let buffer = imSdk.encodeMessage(
			message,
			Command.PULL_BATCH_GROUP_MESSAGE_REQ
		);
		imSdk.sendBytes(buffer);
	},
	/*请求漫游聊天记录*/
	pullHistoryMessage: function(chatType, jid, size, startTime, endTime) {
		let head = imSdk.buildMessageHead('server', chatType);

		let message = {
			messageHead: head,
			jid: jid + '',
			size: size,
			startTime: startTime,
			endTime: endTime,
		};
		let buffer = imSdk.encodeMessage(
			message,
			Command.PULL_MESSAGE_RECORD_REQ
		);
		imSdk.sendBytes(buffer);
	},
	/*解码*/
	decodeMessage: function(buffer, cmd, messageType) {
		let message = null;
		if (cmd) {
			if (!messageType) messageType = imSdk.getProtoMessageType(cmd);
			message = messageType.decode(buffer);
		} else {
			message = messageType.decode(buffer);
		}

		return message;
	},
	/*编码*/
	encodeMessage: function(jsonMsg, cmd, messageType) {
		if (!messageType) {
			messageType = imSdk.getProtoMessageType(cmd);
		}

		// 容错处理，
		if (jsonMsg.deleteTime) {
			jsonMsg.deleteTime = parseInt(jsonMsg.deleteTime);
		}
		if (jsonMsg.fileSize) {
			jsonMsg.fileSize = parseInt(jsonMsg.fileSize);
		}

		let errMsg = messageType.verify(jsonMsg);
		if (errMsg) {
			throw Error(errMsg);
		}
		let message = messageType.create(jsonMsg);

		let buffer = messageType.encode(message).finish();
		//console.log("encodeMessage cmd   > "+cmd);
		if (cmd) {
			let bytes = new Uint8Array(buffer.length + 1);
			bytes[0] = cmd;
			for (let i = 0; i < buffer.length; i++) {
				bytes[i + 1] = buffer[i];
			}
			return bytes;
		} else {
			return buffer;
		}
	},
	/*根据 cmd 获取 proto 的编解码 MessageType */
	getProtoMessageType: function(cmd) {
		let messageType = null;
		switch (cmd) {
			case Command.COMMAND_CHAT:
				messageType = ProtoMessageType.chatMessage;
				break;
			case Command.COMMAND_AUTH_REQ:
				messageType = ProtoMessageType.authMessageReq;
				break;
			case Command.COMMAND_AUTH_RESP:
				messageType = ProtoMessageType.authMessageResp;
				break;
			case Command.MESSAGE_RECEIPT:
				messageType = ProtoMessageType.messageReceipt;
				break;
			case Command.PULL_MESSAGE_RECORD_REQ:
				messageType = ProtoMessageType.pullMessageHistoryRecordReq;
				break;
			case Command.PULL_MESSAGE_RECORD_RESP:
				messageType = ProtoMessageType.pullMessageHistoryRecordResp;
				break;
			case Command.PULL_BATCH_GROUP_MESSAGE_REQ:
				messageType = ProtoMessageType.pullBatchGroupMessageReq;
				break;
			case Command.PULL_BATCH_GROUP_MESSAGE_RESP:
				messageType = ProtoMessageType.pullBatchGroupMessageResp;
				break;
			case Command.SUCCESS:
				messageType = ProtoMessageType.commonSuccess;
				break;
			case Command.ERROR:
				messageType = ProtoMessageType.commonError;
				break;
			case Command.Ping_REQ:
				messageType = ProtoMessageType.pingMessage;
				break;
			case Command.JOINGROUP_REQ:
				messageType = ProtoMessageType.joinGroupMessage;
				break;
			case Command.EXITGROUP_REQ:
				messageType = ProtoMessageType.exitGroupMessage;
				break;
			case Command.GROUP_REQUEST_RESULT:
				messageType = ProtoMessageType.groupMessageResp;
				break;
			case Command.Login_Conflict:
				messageType = ProtoMessageType.commonError;
				break;

			default:
				//默认 其他

				break;
		}

		return messageType;
	},
	getUserIdFromJid: function(jid) {
		jid += '';
		return jid ? jid.split('/')[0] : '';
	},
	getBareJid: function(jid) {
		jid += '';
		return jid ? jid.split('/')[0] : '';
	},
	getResource: function(jid) {
		if (isNil(jid)) return '';
		jid += '';
		let resource = jid.substr(jid.indexOf('/') + 1, jid.length);
		return resource;
	},
	/*是否为群组 Jid*/
	isGroup: function(userId) {
		let reg = /^[0-9]*$/;
		if (!reg.test(userId)) return true;
		else return false;
	},
	randomUUID: function() {
		return (
			imSdk.cont +
			appUtils.getEnv() +
			'_' +
			imSdk.getCurrentSeconds() +
			Math.round(Math.random() * 1000)
		);
	},
	getCurrentSeconds: function() {
		return Math.round(new Date().getTime());
	},
};

export const Command = {
	/*握手请求，含http的websocket握手请求*/
	COMMAND_HANDSHAKE_REQ: 1,
	/*握手响应，含http的websocket握手响应*/
	COMMAND_HANDSHAKE_RESP: 2,
	/*登录消息请求*/
	COMMAND_AUTH_REQ: 5,
	/*登录消息结果*/
	COMMAND_AUTH_RESP: 6,
	/*关闭请求*/
	COMMAND_CLOSE: 7,
	/*聊天请求*/
	COMMAND_CHAT: 10,
	/*消息回执*/
	MESSAGE_RECEIPT: 11,
	/*拉取 聊天历史记录 */
	PULL_MESSAGE_RECORD_REQ: 12,
	/*拉取 聊天历史记录 结果*/
	PULL_MESSAGE_RECORD_RESP: 13,
	/*批量拉取群组消息数量  请求*/
	PULL_BATCH_GROUP_MESSAGE_REQ: 14,
	/*批量拉取群组消息数量  结果*/
	PULL_BATCH_GROUP_MESSAGE_RESP: 15,
	/*失败错误*/
	ERROR: -1,
	/*登陆 被挤下线*/
	Login_Conflict: -3,
	/*加入群组*/
	JOINGROUP_REQ: 20,
	/*退出群组*/
	EXITGROUP_REQ: 21,
	/*群组请求结果协议*/
	GROUP_REQUEST_RESULT: 22,
	/*心跳消息*/
	Ping_REQ: 99,
	/*成功请求*/
	SUCCESS: 100,
};
let ProtoMessageType = {
	messageHead: null,
	chatMessage: null,
	authMessageReq: null,
	authMessageResp: null,
	messageReceipt: null,
	joinGroupMessage: null,
	exitGroupMessage: null,
	groupMessageResp: null,
	pullMessageHistoryRecordReq: null,
	pullMessageHistoryRecordResp: null,
	pullBatchGroupMessageReq: null,
	pullBatchGroupMessageResp: null,
	pingMessage: null,
	commonSuccess: null,
	commonError: null,
};

ProtoMessageType.messageHead = protoRoot.lookupType('Message.MessageHead');

ProtoMessageType.chatMessage = protoRoot.lookupType('Message.ChatMessage');

ProtoMessageType.authMessageReq = protoRoot.lookupType('Message.AuthMessage');

ProtoMessageType.authMessageResp = protoRoot.lookupType(
	'Message.AuthRespMessageProBuf'
);

ProtoMessageType.messageReceipt = protoRoot.lookupType(
	'Message.MessageReceiptStatusProBuf'
);

ProtoMessageType.joinGroupMessage = protoRoot.lookupType(
	'Message.JoinGroupMessageProBuf'
);

ProtoMessageType.exitGroupMessage = protoRoot.lookupType(
	'Message.ExitGroupMessageProBuf'
);

ProtoMessageType.groupMessageResp = protoRoot.lookupType(
	'Message.GroupMessageRespProBuf'
);

ProtoMessageType.pullMessageHistoryRecordReq = protoRoot.lookupType(
	'Message.PullMessageHistoryRecordReqProBuf'
);

ProtoMessageType.pullMessageHistoryRecordResp = protoRoot.lookupType(
	'Message.PullMessageHistoryRecordRespProBuf'
);

ProtoMessageType.pullBatchGroupMessageReq = protoRoot.lookupType(
	'Message.PullBatchGroupMessageReqProBuf'
);

ProtoMessageType.pullBatchGroupMessageResp = protoRoot.lookupType(
	'Message.PullGroupMessageRespProBuf'
);

ProtoMessageType.pingMessage = protoRoot.lookupType(
	'Message.PingMessageProBuf'
);

ProtoMessageType.commonSuccess = protoRoot.lookupType(
	'Message.CommonSuccessProBuf'
);

ProtoMessageType.commonError = protoRoot.lookupType(
	'Message.CommonErrorProBuf'
);

export const ChatType = {
	UNKNOW: 0,
	/**
	 * 单聊
	 */
	CHAT: 1,
	/**
	 * 群聊
	 */
	GROUPCHAT: 2,
	/**
	 * 广播
	 */
	ALL: 3,

	/*授权*/
	AUTH: 5,

	/**
	 *心跳消息
	 */
	PING: 9,
	/**
	 * 返回结果
	 */
	RESULT: 10,
	/**
	 * 消息回执
	 */
	RECEIPT: 11,
};
