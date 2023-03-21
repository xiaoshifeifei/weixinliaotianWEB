/*
	web IM 相关的处理与UI 解耦
	依赖于 具体 协议相关的 比如 xmpp-sdk 或者 websocket_sdk js
	UI调用 当前类  不直接调用 协议相关类  做得协议类 逻辑 解耦
*/
import { imSdk } from '@/utils/old/websocket_sdk';
import { receiver } from '@/utils/old/receiver';
import { AppConfig } from '@/utils/old/appconfig';
import { getCurrentSeconds, isNil } from '@/utils/utils';
import CryptoJS from 'crypto-js';
import md5 from 'js-md5';
import { contactData } from '@/utils/data/contactData';
import { msgData } from '@/utils/data/msgData';
import { chatUtils } from '@/utils/my/chatUtils';
import { parseTime } from '@/utils/functions';
import { busService } from '@/service/busService';
import { eventConst } from '@/utils/my/const/eventConst';
import { msgUtils } from '@/utils/my/msgUtils';
import { myFn } from '@/utils/old/myFn';
import { msgConst } from '../my/const/msgConst';
import { Message } from 'element-ui';
import { appUtils } from '@/utils/my/appUtils';
import { initData } from '@/api/login';
import store from '@/store';
import router from '@/router';
import { chatApi } from '@/api/chatApi';
import { chatData } from '@/utils/data/chatData';

export const WEBIM = {
	/*消息ID 前缀 */
	cont: 'skim',
	resource: 'youjob',
	/*单聊标识*/
	CHAT: 1,
	/*群聊标识*/
	GROUPCHAT: 2,
	token: null,
	userId: null,
	nickname: null,
	/*用户 jid 10004541/web */
	userIdStr: null,
	/*服务器连接地址 ws://localhost:5260 */
	serverUrl: null,
	server: 'server',
	/*消息超时 时间 默认 15 秒*/
	sendTimeOut: 15,
	/* 等待消息回执的 消息Id 数组 */
	waitReceiptMessageIds: {},
	/*时间差*/
	timeDelay: 0,
	encrypt: false,
	isReadDel: false,

	setUserIdAndToken: function(userId, token) {
		WEBIM.userId = userId;
		WEBIM.token = token;
	},
	/*初始化*/
	initWebIM: function(
		url,
		userId,
		resource,
		password,
		pingTime,
		nickname,
		server
	) {
		WEBIM.password = password;
		WEBIM.userId = userId + '';
		WEBIM.nickname = nickname;
		WEBIM.serverUrl = url;
		if (server) WEBIM.server = server;
		WEBIM.resource = resource;
		imSdk.initApi(url, userId, resource, password, pingTime, server);
		WEBIM.userIdStr = imSdk.userIdStr;
		imSdk.handlerMsgReceipt = WEBIM.handlerMsgReceipt;
		imSdk.handlerLoginConflict = WEBIM.handlerLoginConflict;
		console.log(' initWebIM pingTime ===> ' + pingTime);
		imSdk.handlerGroupMessageResult = WEBIM.handlerGroupMessageResult;
		imSdk.handlerHistoryMessageResult =
			receiver.handlerHistoryMessageResult;
	},
	loginIM: function() {
		imSdk.loginIM(function(message) {
			if (WEBIM.userIdStr == message.from) {
				if (WEBIM.isContains(message.resources, WEBIM.resource))
					busService.emit(eventConst.connect);
				if (WEBIM.waitPullBatchGroups)
					WEBIM.pullBatchGroupMessage(WEBIM.waitPullBatchGroups);
			} else {
				/*其他设备登陆*/
				WEBIM.updateMyDeviceStatus(message);
			}
		});
	},
	//断线后， 刷新数据
	beautifulReload() {
		// messages.pullAfterOffline();
		// //
		// $('#msgContainers .msg-container[id!="messageContainer_' + ConversationManager.fromUserId + '"]').remove();
	},
	disconnect: function(e) {
		//断线， 设置非当前数据为空
		imSdk.disconnect(e);
	},
	isConnect: function() {
		return imSdk.isConnect();
	},
	updateMyDeviceStatus: function(message) {
		console.log('updateMyDeviceStatus  ' + JSON.stringify(message));
		var resources = message.resources;
		var from = message.from;
		var fromResource = WEBIM.getResource(from);
		// if(WEBIM.isContains(resources,fromResource)){
		// 	DeviceManager.updateDeviceStatus(fromResource,1);
		// }else{
		// 	DeviceManager.updateDeviceStatus(fromResource,0);
		// }
	},
	setEncrypt: function(isEncrypt) {
		WEBIM.encrypt = isEncrypt;
	},
	setIsReadDel: function(isReadDel) {
		WEBIM.isReadDel = isReadDel;
	},
	sendMessage: function(message) {
		if (!this.isConnect()) {
			Message({
				message: '重连中请稍后!',
				type: 'success',
			});
			setTimeout(() => {
				sessionStorage.setItem('sx', 1);
				router.push('/login');
				location.reload();
				that.$store.commit('clear_login');
			}, 2000);
			return;
		}
		imSdk.sendMessage(message);
		// console.log('send  message ' + JSON.stringify(message));
		if (message.type == 202) {
			if (store.state.dialogue.records) {
				let isRecords = store.state.dialogue.records;
				var maArr = [];
				isRecords.map((item) => {
					maArr.push(item.type);
				});
				var typeParams = null;
				maArr.map((item, index) => {
					if (item == 1) {
						typeParams = index;
					}
				});
				var myContent = '';
				if (typeParams != null) {
					myContent = isRecords[typeParams].content;
				} else {
					myContent = '';
				}
				if (store.state.talks.items) {
					let paramsItem = store.state.talks.items;
					let index = paramsItem.findIndex((item) => {
						return item.chatId === message.chatId;
					});
					paramsItem[index].type = 202;
					paramsItem[index].content = myContent;
					store.state.talks.items = paramsItem;
				}
			}
		}

		/*调用等待消息回执*/
		WEBIM.waitMessageReceipt(message.messageId);
	},
	notifyRender(message) {
		// var chatId = utils.getChatId(message)
		// var isFilter = DataUtils.getMsgFilters(chatId);
		// if(!isFilter){
		// 	if(message.fromUserId!=WEBIM.userId && ipcRenderer){
		// 		ipcRenderer.send('message', message)
		// 	}
		// }
	},
	/*收到消息回执*/
	handlerMsgReceipt: function(messageId) {
		// ConversationManager.processReceived(messageId);
		delete WEBIM.waitReceiptMessageIds[messageId];
	},

	/*收到 群控制消息 */
	handlerGroupGontrolMessage: function(msg) {
		console.log('收到 群控制消息', msg);
		// 处理删除并清空聊天信息

		msgUtils.setContentFmt(msg);
		msg.contentType = msg.type;
		msg.type = 10;
		msg.isGroup = 1;
		msg.roomJid = msg.objectId;
		// if (msg.contentType == 942) {
		// 	if (msg.from == store.state.dialogue.chatId) {
		// 		let params = store.state.dialogue.records.filter((res) => {
		// 			return msg.contentFmt != res.fromUserId;
		// 		});
		// 		let len = store.state.dialogue.records.length - params.length;
		// 		let myCounts = chatData.unreadGet(msg.from);
		// 		localCache.set('unread_' + msg.from, myCounts - len - 1);
		// 	}
		// 	// if (msg.from) {
		// 	//   if (store.state.talks.items) {
		// 	// 		let paramsItem = store.state.talks.items;
		// 	// 		let index = paramsItem.findIndex((item) => {
		// 	// 			return item.chatId === msg.from;
		// 	// 		});
		// 	// 		paramsItem[index].type = 202;
		// 	// 		paramsItem[index].content = myContent;
		// 	// 		store.state.talks.items = paramsItem;
		// 	// 	}
		// 	// }
		// 	console.log('进去没有');
		// }
		initData();
		setTimeout(() => {
			if (msg.contentType == 942) {
				if (store.state.talks.items) {
					let isRecords = store.state.talks.items;
					var maArr = [];
					isRecords.map((item) => {
						maArr.push(item.chatId);
					});
					var typeParams = null;
					maArr.map((item, index) => {
						if (item == msg.from) {
							typeParams = index;
						}
					});
					const data = {
						chatId: msg.from,
					};
					var myDatas = [];
					chatApi
						.pageMsg(data)
						.then((res) => {
							if (res.resultCode != 1) return;
							let Arr = res.data;
							let params = res.data.filter((resItem) => {
								if (resItem.contentType == 942) {
									return msg.contentFmt == resItem.content;
								}
							});
							let len = params.length;
							// console.log('paramsparamsparams', params);
							let myCounts = chatData.unreadGet(msg.from);
							// console.log('获取的数据', myCounts);
							// console.log('减少的数据', len);
							// console.log('总数', myCounts - len - 1);
							let conte = myCounts - len - 1;
							chatData.unreadAdd(msg.from, 'go', conte);
							if (Arr.length) {
								Arr.map((item) => {
									if (item.contentType == 1) {
										myDatas.push(item.content);
									}
									if (myDatas.length) {
										isRecords[typeParams].type = 202;
										isRecords[typeParams].content =
											myDatas[0];
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
							// this.records.loadStatus = 0;
						});
				}
			}
		}, 1000);

		// if(!myFn.isNil(DataUtils.getDeleteFirend(msg.roomJid))&&907!=msg.contentType){
		//     /*已退出或删除 解散 这个群组*/
		//     return true;
		// }
		// if(916!=msg.contentType){
		//     UI.moveFriendToTop(msg,msg.objectId,msg.fromUserName,
		//         (ConversationManager.isOpen&&msg.objectId==ConversationManager.fromUserId)?0:1,1);
		// }
		// else{
		// console.log(22222222,myFn.isNil(msg.text));
		if (myFn.isNil(msg.text)) {
			//邀请好友
			let inviteObj = eval('(' + msg.objectId + ')');
			msg.roomJid = inviteObj.roomJid;
			// UI.moveFriendToTop(msg,msg.roomJid,msg.fromUserName,
			//     (ConversationManager.isOpen&&msg.roomJid==ConversationManager.fromUserId)?0:1,1);
		} else {
			// UI.moveFriendToTop(msg,msg.objectId,msg.fromUserName,
			//     (ConversationManager.isOpen&&msg.objectId==ConversationManager.fromUserId)?0:1,1);
		}
		// }
		// DataUtils.saveMessage(msg);
		// room.processGroupControlMsg(msg);
		// if(ConversationManager.isOpen ){
		//     UI.showMsg(msg);
		// }
		// //设置禁言信息
		// if(msg.contentType == MessageType.group.gag){
		//     //是当前会话， 且禁言的是自己
		//     if(utils.isCurrent(chatId) && WEBIM.isUserId(msg.toUserId)){
		//         GroupManager.roomData.member.talkTime = content
		//         roomUi.currentMessageEnable()
		//     }
		// }
	},
	//处理 群控制信息的 值变化
	processGroupControlMsg: function(msg) {
		//用于显示群组日志
		console.error('消息类型' + msg.contentType);
		//ws-info 变动
		switch (msg.contentType) {
			case msgConst.group.change_member_name:
				break;
			case MessageType.group.change_root_name:
				if (
					ConversationManager.isOpen &&
					msg.roomJid == ConversationManager.fromUserId
				) {
					$(
						'#myRoomList #groups_' + msg.objectId + ' .groupName'
					).html(msg.text);
					$(
						'#myMessagesList #groups_' +
							msg.objectId +
							' .groupName'
					).html(msg.text);
					$('#gname').html(msg.text);
				}
				roomUi.setName(msg.roomJid, msg.text);
				break;
			case MessageType.group.del_room:
				break;
			case MessageType.group.del_member:
				//  被踢出群后的处理
				var roomId = msg.objectId;
				DataUtils.delMember(msg);
				if (
					WEBIM.isUserId(msg.toUserId) &&
					!WEBIM.isGroupType(msg.chatType)
				) {
					if (myData.userId != msg.fromUserId)
						ownAlert(3, '你已被移出' + msg.text + '群');
					DataMap.deleteRooms[roomId] = DataMap.myRooms[roomId]; //将被踢出的群的数据储存
					delete DataMap.myRooms[roomId];
					UI.clearMsgNum(roomId);
					$('#myMessagesList #groups_' + roomId).remove();
					$('#myRoomList #groups_' + roomId).remove();
					if (roomId == ConversationManager.fromUserId) {
						UI.hideChatBodyAndDetails();
					}
					// GroupManager.showMyRoom(0);
				}
				break;
			case MessageType.group.add_notice:
				//群公告
				//$("#myRoomList #titgroups_"+msg.objectId).html(msg.text);
				if (
					ConversationManager.isOpen &&
					msg.roomJid == ConversationManager.fromUserId
				)
					$('#gnotice').html(msg.text);
				break;
			case MessageType.group.gag:
				//判断被禁言者是否为用户自己
				if (!WEBIM.isUserId(msg.toUserId)) break;
				DataMap.talkTime[msg.objectId] = msg.talkTime; //储存我在该群组的talkTime
				if (ConversationManager.fromUserId == msg.objectId) {
					ConversationManager.talkTime = Number(msg.talkTime);
					GroupManager.roomData.member.talkTime = Number(
						msg.talkTime
					);
				}
				break;
			case MessageType.group.add_member:
				var roomId = msg.objectId;
				DataUtils.addMember(msg);
				//自己被邀请
				if (
					WEBIM.isUserId(msg.toUserId) &&
					!WEBIM.isGroupType(msg.chatType)
				) {
					mySdk.getRoomOnly(msg.fileName, function(obj) {
						DataMap.myRooms[obj.jid] = obj;
						WEBIM.joinGroupChat(roomId);
					});
				}
				//检查该群是否存在于被踢出数据中，存在则清除
				if (!myFn.isNil(DataMap.deleteRooms[roomId])) {
					delete DataMap.deleteRooms[roomId];
					//检查当前打开的是否为目标界面,是则将隐藏的详情按钮显示
					if (roomId == ConversationManager.fromUserId) {
						$('#tab #details').show();
					}
				}
				break;
			case MessageType.group.set_manager:
				DataUtils.setManager(msg);
				if (
					ConversationManager.isOpen &&
					ConversationManager.fromUserId == msg.objectId
				) {
					if (WEBIM.isUserId(msg.toUserId)) {
						if (1 == msg.content || '1' == msg.content) {
							GroupManager.roomData.member.role = 2;
							$('#chatBannedDiv').hide();
							$('#sendMsgScopeDiv *').attr('disabled', false);
						} else {
							GroupManager.roomData.member.role = 3;
							if (
								getCurrentSeconds() <
								GroupManager.roomData.talkTime
							)
								$('#chatBannedDiv').show();
							$('#sendMsgScopeDiv *').attr('disabled', true);
						}
					}
				}
			case MessageType.group.set_read:
				//群已读消息开关
				if (msg.objectId == ConversationManager.fromUserId) {
					if (1 == msg.text || '1' == msg.text) {
						myData.isShowGroupMsgReadNum = true;
					} else myData.isShowGroupMsgReadNum = false;
					GroupManager.roomData.showRead = parseInt(msg.text);
				}
				break;
			case 916:
				if (myFn.isNil(msg.content)) {
				} else if (
					ConversationManager.isOpen &&
					ConversationManager.fromUserId == msg.objectId
				) {
					GroupManager.roomData.isNeedVerify = parseInt(msg.text);
				}
				break;
			case 917:
				//群公开状态
				if (
					ConversationManager.isOpen &&
					ConversationManager.fromUserId == msg.objectId
				)
					GroupManager.roomData.isLook = parseInt(msg.text);
				break;
			case 918:
				if (
					ConversationManager.isOpen &&
					ConversationManager.fromUserId == msg.objectId
				) {
					GroupManager.roomData.showMember = parseInt(msg.text);
					if (
						3 == GroupManager.roomData.member.role &&
						0 == GroupManager.roomData.showMember
					) {
						$('#btnKicking').hide();
					} else $('#btnKicking').show();
				}

				break;
			case 919:
				if (
					ConversationManager.isOpen &&
					ConversationManager.fromUserId == msg.objectId
				) {
					GroupManager.roomData.allowSendCard = parseInt(msg.text);
					if (
						3 == GroupManager.roomData.member.role &&
						1 != GroupManager.roomData.allowSendCard
					) {
						$('#btnmin').hide();
					} else {
						$('#btnmin').show();
					}
				}

				break;

			case MessageType.group.all_gag:
				var jid = msg.objectId;
				var talkTime = msg.text;
				DataUtils.setTalkTime(jid, talkTime);
				if (
					ConversationManager.isOpen &&
					ConversationManager.fromUserId == msg.objectId
				) {
					GroupManager.roomData.talkTime = parseInt(msg.text);
					roomUi.currentMessageEnable();
				}
				break;
			case 921:
				if (
					ConversationManager.isOpen &&
					ConversationManager.fromUserId == msg.objectId
				) {
					GroupManager.roomData.allowInviteFriend = parseInt(
						msg.text
					);
					if (
						3 == GroupManager.roomData.member.role &&
						0 == GroupManager.roomData.allowInviteFriend
					) {
						$('#btnInvite').hide();
					} else $('#btnInvite').show();
				}
				break;
			case 922:
				if (
					ConversationManager.isOpen &&
					ConversationManager.fromUserId == msg.objectId
				) {
					GroupManager.roomData.allowUploadFile = parseInt(msg.text);
					if (
						3 == GroupManager.roomData.member.role &&
						0 == GroupManager.roomData.allowUploadFile
					) {
						$('#btnUploadGroupFile').hide();
					} else $('#btnUploadGroupFile').show();
				}
				break;
			case 923:
				if (
					ConversationManager.isOpen &&
					ConversationManager.fromUserId == msg.objectId
				) {
					GroupManager.roomData.allowConference = parseInt(msg.text);
					if (
						3 == GroupManager.roomData.member.role &&
						0 == GroupManager.roomData.allowConference
					) {
						$('#btncall').hide();
						$('#btnvideo').hide();
					} else {
						$('#btncall').show();
						$('#btnvideo').show();
					}
				}
				break;
			case 924:
				if (
					ConversationManager.isOpen &&
					ConversationManager.fromUserId == msg.objectId
				)
					GroupManager.roomData.allowSpeakCourse = parseInt(msg.text);
				break;
			case 925:
				DataUtils.receiveTransfer(msg);
				if (
					ConversationManager.isOpen &&
					ConversationManager.fromUserId == msg.objectId
				) {
					GroupManager.roomData.userId = parseInt(msg.toUserId);
					$('#chatBannedDiv').hide();
					$('#sendMsgScopeDiv *').attr('disabled', false);
					$('#groupTransferDiv').show();
				}
				break;
			default:
				break;
		}
		return msg;
	},
	/*收到音视频通话消息*/
	handlerAudioOrVideoMessage: function(message) {
		// ConversationManager.handlerAudioOrVideoMessage(message);
	},
	/*处理新的朋友消息*/
	handlerNewFriendMessage: function(message) {
		// let status = DBUtils.getNewFriendMessage(message.fromUserId);
		// if (status) {
		// 	return;
		// } else {
		// 	DBUtils.setNewFriendMessage(message.fromUserId);
		// }
		// ConversationManager.handlerNewFriendMessage(message);
	},
	/*处理正在输入消息*/
	handlerInputingMessage: function(message) {},
	/*处理撤回消息*/
	handlerRevokeMessage: function(message) {
		// ConversationManager.handlerRevokeMessage(message);
	},
	/*设备登陆冲突被挤下线*/
	handlerLoginConflict: function() {
		console.log('handlerLoginConflict====>');
		// ConversationManager.handlerLoginConflict();
		// localStorage.clear();
		sessionStorage.clear();
		imSdk.disconnect();
		clearInterval(imSdk.ping);
		imSdk.sendReceiptTask = null;
		sessionStorage.setItem('sx', 2);
		busService.emit('go-login');
	},
	/*多设备用户数据更新消息  type 801 */
	handlerDeviceUserDataUpdateMessage: function(message) {},
	/*发送消息已读回执*/
	sendMessageReadReceipt: function(to, messageId) {
		var msg = WEBIM.createMessage(26, messageId);
		msg.to = to;
		if (WEBIM.isGroup(to)) {
			msg.chatType = WEBIM.GROUPCHAT;
		} else {
			msg.chatType = WEBIM.CHAT;
		}
		var msgObj = msg;
		WEBIM.sendMessage(msgObj);
		return msg;
	},
	/*收到消息已读回执*/
	handlerReadReceipt: function(message) {
		// ConversationManager.handlerReadReceipt(message);
	},

	/*处理 批量群组的 离线消息数量*/
	handlerGroupMessageResult: function(result) {
		//console.log("handlerGroupMessageCountResult "+JSON.stringify(result));
		// var message=null;
		// if(result.messageList){
		// 	DataUtils.clearMsgRecordList(result.jid);
		// 	for (var i = 0; i <result.messageList.length; i++) {
		// 		message=result.messageList[i];
		// 		message=imSdk.convertToClientMsg(message);
		// 		result.messageList[i]=message;
		// 		//console.log("handlerGroupMessageCountResult "+JSON.stringify(message));
		// 	}
		// }
		// ConversationManager.handlerGroupMessageResult(result);
	},
	/*批量请求 群组消息数量*/
	pullBatchGroupMessage: function(jidList) {
		if (imSdk.isConnect()) {
			imSdk.pullBatchGroupMessage(jidList);
			WEBIM.waitPullBatchGroups = null;
		} else {
			WEBIM.waitPullBatchGroups = jidList;
		}
	},
	/*请求漫游聊天记录*/
	pullHistoryMessage: function(chatType, jid, size, startTime, endTime) {
		if (!endTime) {
			endTime = 0;
		}
		if (!startTime) {
			startTime = 0;
		}
		imSdk.pullHistoryMessage(chatType, jid, size, startTime, endTime);
	},
	/*等待服务器消息回执*/
	waitMessageReceipt: function(messageId) {
		// WEBIM.waitReceiptMessageIds[messageId] = 1;
		// setTimeout(function () {
		//     //消息 发送失败 没有收到回执
		//     if (WEBIM.waitReceiptMessageIds[messageId]) {
		//         WEBIM.sendMessageTimeOut(messageId);
		//     }
		// }, WEBIM.sendTimeOut * 1000, messageId);
	},
	/*发送消息超时 没有收到消息回执 处理 页面逻辑*/
	sendMessageTimeOut: function(messageId) {
		// ConversationManager.sendTimeout(messageId);
	},
	/**
	 * 加入群聊
	 * @param  {[type]} groupJid [群组Jid]
	 */
	joinGroupChat: function(groupJid, userId, seconds) {
		imSdk.joinGroupChat(groupJid, seconds);
	},
	/*退出群聊*/
	exitGroupChat: function(groupJid) {
		imSdk.exitGroupChat(groupJid);
	},
	/*转发 刷新消息属性*/
	transferMsgFmt: function(msg, toUserId) {
		var timeSend = WEBIM.getServerTime();
		var messageId = WEBIM.randomUUID();
		var chatType = WEBIM.isGroup(toUserId) ? 2 : 1;
		msg.messageId = messageId;
		msg.fromUserId = WEBIM.userId + '';
		msg.fromUserName = WEBIM.nickname;
		msg.toUserId = toUserId + '';
		msg.timeSend = timeSend;
		msg.chatType = chatType;
		msg.messageHead = {
			from: WEBIM.userId,
			chatType: chatType,
			messageId: messageId,
			to: toUserId,
		};
		msg.content = (msg.content + '').replaceAll('<br/>', '\n');
		if (true == WEBIM.encrypt) msg.isEncrypt = 1;
		// if(4>msg.type&&6!=msg.type&&1==myData.isReadDel)
		// 	msg.isReadDel=myData.isReadDel;
		msg.forward = 1;
	},
	/*构建一条消息*/
	createMessage: function(type, content, toUserId) {
		if (toUserId) toUserId = toUserId + '';
		let chat = contactData.getItem(toUserId);

		let toUserName;
		if (chat) {
			toUserName = chat.nickname;
		}

		let chatType = 1;
		if (chatUtils.isGroupId(toUserId)) {
			chatType = 2;
		}
		var timeSend = WEBIM.getServerTime();
		var messageId = WEBIM.randomUUID();
		var msg = {
			id: messageId,
			messageId: messageId,
			fromUserId: WEBIM.userId + '',
			fromUserName: WEBIM.nickname,
			toUserId: toUserId,
			toUserName: toUserName,
			from: WEBIM.userId + '/web',
			to: toUserId,
			isReadDel: false,
			content: content,
			timeSend: timeSend,
			type: type,
		};
		if (true == WEBIM.encrypt) {
			msg.isEncrypt = WEBIM.encrypt;
		}

		msg.to = msg.toUserId;
		if (chatType) {
			msg.chatType = chatType;
		}
		return msg;
	},
	/*创建一个 语音消息*/
	createVoiceMessage: function(type, content, size, time) {
		// var timeSend =WEBIM.getServerTime();
		// var messageId=WEBIM.randomUUID();
		// 	var msg = {
		// 		messageId:messageId,
		// 		fromUserId : WEBIM.userId + "",
		// 		fromUserName : WEBIM.nickname,
		// 		content : content,
		// 		fileSize:size,
		// 		timeLen:time,
		// 		timeSend : timeSend,
		// 		type : type
		// 	};
		// 	if(true==WEBIM.encrypt)
		// 		msg.isEncrypt=WEBIM.encrypt;
		// 	if(4>type&&6!=type)
		// 		msg.isReadDel=1==myData.isReadDel;
		// 	return msg;
	},
	/*转换为 客户端的 消息*/
	convertToClientMsg: function(message) {
		return imSdk.convertToClientMsg(message);
	},

	randomUUID: function() {
		return (
			WEBIM.cont +
			appUtils.getEnv() +
			'_' +
			WEBIM.userId +
			WEBIM.getTimeSecond() +
			Math.round(Math.random() * 1000)
		);
	},
	/*获取服务器的当前时间秒*/
	getServerTime: function() {
		return Math.round(WEBIM.getMilliSeconds() - WEBIM.timeDelay);
	},
	getServerTimeSecond: function() {
		return Math.round((WEBIM.getMilliSeconds() - WEBIM.timeDelay) / 1000);
	},
	getTimeSecond: function() {
		return Math.round(new Date().getTime() / 1000);
	},
	getMilliSeconds: function() {
		return Math.round(new Date().getTime());
	},
	toDateTime: function(timestamp) {
		return parseTime(new Date(timestamp * 1000));
	},
	toDate: function(timestamp) {
		return parseTime(new Date(timestamp * 1000), '{y}-{m}-{d}');
	},
	isContains: function(str, substr) {
		if (!str) return false;
		return str.indexOf(substr) >= 0;
	},
	isNil: function(s) {
		return (
			undefined == s ||
			'undefined' == s ||
			null == s ||
			$.trim(s) == '' ||
			$.trim(s) == 'null' ||
			NaN == s
		);
	},
	notNull: function(s) {
		return !this.isNil(s);
	},
	getUserIdFromJid: function(jid) {
		return imSdk.getUserIdFromJid(jid);
	},
	getBareJid: function(jid) {
		return imSdk.getBareJid(jid);
	},
	getResource: function(jid) {
		return imSdk.getResource(jid);
	},
	/*是否为群组 Jid*/
	isGroup: function(userId) {
		userId += '';
		if (userId.indexOf('/') >= 0) return false;
		var reg = /^[0-9]*$/;
		if (!reg.test(userId)) return true;
		else return false;
	},
	isGroupChat: function(chatType) {
		return WEBIM.GROUPCHAT == chatType;
	},
	isUserId: function(userId) {
		return WEBIM.userId == userId;
	},
	/*判断消息是否加密*/
	isEncrypt: function(msg) {
		return true == msg.isEncrypt;
	},
	//消息加密
	encryptMessage: function(msg) {
		var key = WEBIM.getMsgKey(msg);

		console.log('encryptMsg content  ' + msg.content);
		var content = WEBIM.encryptDES(msg.content, key);
		//msg.content=content;
		console.log('encryptMsg key ' + key + '  content ' + content);
		return content;
	}, //消息解密
	decryptMessage: function(msg) {
		//检查消息是否加密 并解密
		if (WEBIM.isEncrypt(msg)) {
			msg.content = msg.content.replace(' ', '');
			var key = WEBIM.getMsgKey(msg);
			//console.log("decryptMsg content  "+msg.content);
			var content = WEBIM.decryptDES(msg.content, key);
			if (isNil(content)) {
				return msg.content;
			}
			return content;
		} else {
			return msg.content;
		}
	},
	createOpenApiSecret(obj) {
		if (!obj) {
			obj = {};
		}
		obj.time = getCurrentSeconds();
		var api_time = AppConfig.apiKey + obj.time;

		var md5Key = md5(api_time);
		obj.secret = md5Key;
		return obj;
	},
	//创建 密钥
	createCommApiSecret(obj) {
		// obj.time=WEBIM.getServerTimeSecond();
		// var key="";
		// if(!isNil(store.state.user.userId)&&!isNil(obj.access_token)){
		// 	key = AppConfig.apiKey+obj.time+store.state.user.userId+obj.access_token;
		// }else{
		// 	return WEBIM.createOpenApiSecret(obj);
		// }
		// var md5Key=md5(key);
		// obj.secret=md5Key;
		// return obj;
	},
	createRedSecret(obj) {
		obj.salt = WEBIM.getServerTimeSecond();
		var api_time = AppConfig.apiKey + obj.salt;
		var userId_token = WEBIM.userId + WEBIM.token;
		var md5ApiTime = md5(api_time);
		var md5Password = md5(obj.password);
		var key = md5ApiTime + userId_token + md5Password;
		var md5Key = md5(key);
		obj.secret = md5Key;
		return obj;
	},
	receiveRedSecret(obj) {
		obj.time = WEBIM.getServerTimeSecond();
		var api_time = AppConfig.apiKey + obj.time;
		var userId_token = WEBIM.userId + WEBIM.token;
		var md5ApiTime = md5(api_time);
		var key = md5ApiTime + userId_token;
		var md5Key = md5(key);
		obj.secret = md5Key;
		return obj;
	},
	getMsgKey: function(msg) {
		var key = AppConfig.apiKey + parseInt(msg.timeSend) + msg.messageId;
		return md5(key);
	},
	encryptDES: function(message, key) {
		var keyHex = CryptoJS.enc.Utf8.parse(key);
		var encrypted = CryptoJS.TripleDES.encrypt(message, keyHex, {
			iv: CryptoJS.enc.Utf8.parse(iv),
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7,
		});
		var result = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
		return result;
	},
	decryptDES: function(message, key) {
		//把私钥转换成16进制的字符串
		var keyHex = CryptoJS.enc.Utf8.parse(key);

		//把需要解密的数据从16进制字符串转换成字符byte数组
		var decrypted = CryptoJS.TripleDES.decrypt(
			{
				ciphertext: CryptoJS.enc.Base64.parse(message),
			},
			keyHex,
			{
				iv: CryptoJS.enc.Utf8.parse(iv),
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7,
			}
		);
		//以utf-8的形式输出解密过后内容
		var result = decrypted.toString(CryptoJS.enc.Utf8);
		return result;
	},
	//格式化 要显示的 消息标题 如 [图片] [位置]
	parseShowMsgTitle: function(msg) {
		var content;
		switch (msg.type) {
			case 1:
				content = msg.content;
				break;
			case 94:
				content = msg.content;
				break;
			case 2:
				content = '[图片]';
				break;
			case 3:
				content = '[语音]';
				break;
			case 4:
				content = '[位置]';
				break;
			case 5:
				content = '[动画]';
				break;
			case 6:
				content = '[视频]';
				break;
			case 8:
				content = '[名片]';
				break;
			case 9:
				content = '[文件]';
				break;
			case 10:
				/*控制消息和通知*/
				content = msg.content;
				break;
			case 28:
				content = '[红包]';
				break;
			case 83:
				content = '[领取了红包]';
				break;
			default:
				//默认 其他
				content = '';
				break;
		}
		if (isNil(content)) {
			if (
				(99 < msg.type && 130 > msg.type) ||
				(99 < msg.contentType && 130 > msg.contentType)
			) {
				//音视频 消息
				content = msg.content;
			} else if (400 < msg.type) content = '[群控制消息]';
		}
		if (isNil(content)) content = '[不支持 请在手机端查看]';
		return content;
	},
};
