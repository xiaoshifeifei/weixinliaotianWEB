import { ChatType, Command, imSdk } from '@/utils/old/websocket_sdk';
import { msgConst } from '@/utils/my/const/msgConst';
import { WEBIM } from '@/utils/old/webim';
import store from '@/store';
import { chatUtils } from '@/utils/my/chatUtils';
import { isNil } from '@/utils/utils';
import { messageUtils } from '@/utils/my/message';
import TalkEvent from '@/plugins/socket/event/talk-event';
import { friendService } from '@/service/friendService';
import { messageService } from '@/service/messageService';
import { chatData } from '@/utils/data/chatData';

export const receiver = {
	handlerMessageBycmd(cmd, message) {
		/*发送客户端消息回执*/
		if (
			ChatType.CHAT == message.chatType &&
			85 < message.type &&
			94 > message.type
		) {
			return;
		} else if (
			ChatType.GROUPCHAT == message.chatType &&
			imSdk.userIdStr == message.fromJid
		) {
			imSdk.handlerMsgReceipt(message.messageId);
		}
		switch (cmd) {
			//接受消息， 发送回执，
			case Command.COMMAND_CHAT:
				WEBIM.notifyRender(message);
				receiver.handlerMessageByType(message);
				break;
			case Command.SUCCESS:
				imSdk.handlerMsgReceipt(message.messageId);
				break;
			case Command.MESSAGE_RECEIPT:
				imSdk.handlerMsgReceipt(message.messageId);
				break;
			case Command.PULL_BATCH_GROUP_MESSAGE_RESP:
				imSdk.handlerGroupMessageResult(message);
				break;
			case Command.PULL_MESSAGE_RECORD_RESP:
				imSdk.handlerHistoryMessageResult(message);
				break;
			case Command.COMMAND_AUTH_RESP:
				console.log('ws 登录结果');
				console.log(message);
				imSdk.loginSuccess(message);
				break;
			case Command.Login_Conflict:
				imSdk.handlerLoginConflict();
				break;
			case Command.ERROR:
				console.log('收到错误消息回执');
				console.log(message);
				if (message.code == -2) {
					layer.msg('敏感词, 禁止发送.', { icon: 2 });
				}
				//删除等待
				delete WEBIM.waitReceiptMessageIds[message.messageId];
				// UI.showReSendImg(message.messageId)
				//提示错误
				// imSdk.handlerMsgReceipt(message.messageId);
				break;
			default:
				//默认 其他
				// content="";
				break;
		}
	},
	/*根据消息类型处理逻辑*/
	handlerMessageByType: function(message) {
		message.content = WEBIM.decryptMessage(message);
		let fromUser = message.fromUserId;
		let msgType = message.type;
		let isSelf = store.state.user.userId == fromUser;
		let messageId = message.messageId;
		//不是自己的消息， 且为好友消息则发送已读
		let chatId = chatUtils.getChatId(message);
		if (!isSelf) {
			if (!chatUtils.isGroupId(chatId)) {
				if (chatUtils.isCurrentChat(chatId)) {
					messageService.sendMessageReadReceipt(chatId, messageId);
				} else {
					chatData.unreadMsgIdAdd(chatId, messageId);
				}
			}
		}

		//群控消息
		if (
			parseInt(message.type / 100) == 9 ||
			401 == message.type ||
			402 == message.type
		) {
			WEBIM.handlerGroupGontrolMessage(message);
		}
		if (505 == msgType && !isSelf) {
			console.log('我被删除了');
			friendService.beDel(message.fromUserId, 1);
			return;
		}
		if (msgConst.friend.friend == msgType && !isSelf) {
			console.log('我被添加了');
			friendService.beAdd(message.fromUserId);
			return;
		}
		if (msgConst.friend.say_hello == msgType && !isSelf) {
			this.onReplay(message);
			return;
		}
		if (msgConst.group.del_member == msgType) {
			messageService.delMember(message);
			return;
		}
		if (msgConst.group.add_member == msgType) {
			messageService.addMember(message);
			return;
		}
		if (msgConst.group.del_room == msgType) {
			messageService.delRoom(message);
			return;
		}
		if (msgConst.group.set_manager == msgType) {
			messageService.setRole(message);
		}
		if (msgConst.group.gag == msgType) {
			//被禁言方会收到2条消息（单聊和群聊）， 出现重复接受问题， 此处单聊的不作处理
			if (message.chatType == 2) {
				messageService.gagMember(message);
			}
			return;
		}
		if (msgConst.group.all_gag == msgType) {
			messageService.gagRoom(message);
			return;
		}
		if (msgConst.revoke == msgType) {
			messageService.revoke(message);
			return;
		}

		//群控消息
		if (
			parseInt(message.type / 100) == 9 ||
			401 == message.type ||
			402 == message.type
		) {
			return;
		}
		//音频消息
		else if (message.type > 99 && message.type < 130) {
			return WEBIM.handlerAudioOrVideoMessage(message);
		}
		//新朋友
		else if (parseInt(message.type / 100) == 5) {
			return WEBIM.handlerNewFriendMessage(message);
		}
		//群消息，添加成员， 添加自己...
		else if (
			(message.fromUserId == message.toUserId) == WEBIM.userId &&
			message.type == msgConst.group.add_member &&
			message.chatType == WEBIM.GROUPCHAT
		) {
			return;
		} else if (86 == message.type) {
			/*红包过期退款消息不处理*/
			return;
		}

		switch (message.type) {
			case msgConst.read:
				WEBIM.handlerReadReceipt(message);
				break;
			case msgConst.input:
				WEBIM.handlerInputingMessage(message);
				break;
			case msgConst.revoke:
				if (
					message.messageId.substring(0, 8) == 'skimweb_' &&
					WEBIM.userId == message.fromUserId
				)
					break;
				// WEBIM.handlerRevokeMessage(message);

				break;
			case msgConst.DEVICE_UPDATE_SETTING: //多设备更新用户设置，web 端不处理
				break;
			case msgConst.DEVICE_UPDATE_USER_INFO: //多设备更新用户信息
				WEBIM.handlerDeviceUserDataUpdateMessage(message);
				break;
			case msgConst.DEVICEONLINE: //当前用户在其他设备上线
				// DeviceManager.receiveReceived(message);
				break;
			default:
				receiver.processMsg(message);
				break;
		}
	},

	onReplay(msg) {
		console.error('ws-todo  别人申请加我好友');
		friendService.beApply(msg);
	},

	//处理收到的单条消息
	processMsg: function(message) {
		//保存ait消息, 如果是@我的消息， 缓存， 如果是当前会话， 则不需缓存
		let ait = messageUtils.isAitMe(message);
		if (ait) {
			if (ait == 'all') message.aitContent = '@全体成员';
			if (ait == 'me') message.aitContent = '有人@我';
		}

		switch (message.type) {
			case 96:
				/*清除双方聊天记录*/
				return;
				break;
			case 801:
				break;
			default:
				break;
		}
		new TalkEvent(message).handle();
		return;
		let chatType = message.chatType;
		let from = message.from;
		let toJid = message.to;
		let fromUserId = WEBIM.getUserIdFromJid(from);
		//收到的是当前设备发送的消息
		// if(WEBIM.resource==resource&&store.state.user.userId==fromUserId)
		// 	return;
		//判断消息是否来自于黑名单用户，是则不接收
		if (chatType == WEBIM.CHAT) {
			//单聊
			// 收到消息立即发送回执给发送者
			let delay = message.offline; //有这个字段就代表是离线消息
			if (message.offline) {
			}
		}
		let msg = message;
		//消息的发送者userID  群组的Jid
		msg.fromId = fromUserId;
		//消息来源的JID  其他地方要用
		msg.fromJid = from;
		msg.toJid = toJid;
		//多设备模块的  消息处理
		// if(1==myData.multipleDevices){
		//     //// 好友消息处理
		//     if(WEBIM.CHAT==chatType&&fromUserId!=store.state.user.userId){
		//         DeviceManager.receiverMessage(message);
		//     }else if(WEBIM.CHAT==chatType&&fromUserId==store.state.user.userId){
		//         //其他 设备消息处理
		//         if(DeviceManager.receiverDeviceMessage(message))
		//             return;
		//     }
		// }

		// 处理客服模块的xmpp消息    320 : 建立对话   321: 结束会话
		if (msg.type == 320 || msg.type == '320') {
			// CustomerService.sendSayHello(parseInt(msg.fromUserId));
			return;
		}

		// //过滤消息类型  接受到true 就 返回不继续执行
		// if(ConversationManager.filterMsgType(msg,fromUserId))
		//     return;
		//发送者设备标识
		//let resource=WEBIM.getResource(from);
		if (
			WEBIM.CHAT == chatType &&
			store.state.user.userId == msg.fromUserId
		) {
			//自己发送的消息  fromUserName 改为null
			//显示的时候 会根据 fromUserId 取得 用户名
			msg.fromUserName = null;
		}
		if (msg.isEncrypt) msg.content = WEBIM.decryptMessage(msg);
		receiver.receiverShowMsg(msg);
	},

	//ws-info  接受的消息显示到页面
	receiverShowMsg: function(msg) {
		//已经接受到的消息 返回
		if (!isNil(DataMap.msgIds[msg.messageId])) {
			return;
		}
		let isFilter = false;
		let from = msg.from;
		let fromUserId = msg.fromUserId;

		let isSelf = chatUtils.isSelf(msg);
		if (WEBIM.GROUPCHAT == msg.chatType) {
			fromUserId = msg.from;
			//ws-todo 消息免打扰
			// isFilter = DataUtils.getMsgFilters(from);
		}
		//自己发的消息
		else if (isSelf) {
			//撤回
			if (msgConst.revoke == msg.type) {
				// if(isNil(msg.toUserId)){
				//     let message=DataUtils.getMessage(msg.msgId);
				//     if(isNil(message))
				//         return;
				//     msg.toUserId=message.toUserId;
				// }
			}

			if (store.state.user.userId != msg.toUserId) {
				//自己其他设备发送给好友的消息 转发给我的
				from = msg.toUserId;
			} else from = msg.fromJid;
		}
		let fromUserName = msg.fromUserName; //发送方的用户昵称
		let fromJid = ConversationManager.from;

		//聊天界面没有打开//判断聊天面板是否打开
		let isOpen = ConversationManager.isOpen;
		//发送者不是 当前页面好友 或群组jid.
		if (WEBIM.getBareJid(fromJid) != WEBIM.getBareJid(from)) isOpen = false;
		else if (WEBIM.getBareJid(from) == store.state.user.userId) {
			if (fromJid != from) isOpen = false;
		}

		// 已读消息
		if (msgConst.read == msg.type) {
			let isGroup = chatUtils.isGroupType(msg.chatType);
			let isSelf = store.state.user.userId == msg.fromUserId;
			if (isGroup && !self) {
				//已读回执
				//群聊的已读消息 改变已读人数
				GroupManager.disposeReadReceipt(msg);
				//调用方法处理已读回执 ,这里的fromUserId为群组jid
			}
			//如果是群消息， 判断是否为自己的已读， 如果未自己的已读， 则设置已读
			if ((isGroup && isSelf) || msg.chatType == 1) {
				let tempMsg = DataUtils.getMessage(msg.content);
				if (!isNil(tempMsg)) {
					tempMsg.isRead = 1;
					DataUtils.saveMessage(tempMsg);
					if (!isOpen) {
						UI.showMsg(msg, isSelf ? 0 : 1, 'newMsg');
						return;
					}
				} else if (!isOpen && myFn.isReadDelMsg(tempMsg)) {
					DataUtils.deleteMessage(msg.content);
					return;
				}
			}
		}

		//判断是否同账号发送过来的消息
		if (
			1 == myData.multipleDevices &&
			chatUtils.isChatType(msg.chatType) &&
			store.state.user.userId == msg.fromUserId
		) {
			//多设备的消息处理
			msg = DeviceManager.processShowMessage(msg, 0, isOpen);
			if (isNil(msg)) return;
			/*if(store.state.user.userId!=msg.toUserId)
                fromUserId=msg.toUserId;*/
		}
		//聊天界面已打开 显示消息
		if (isOpen) {
			$('#state').html('(在线)');
			menus.groupRightMenu();
		}
		UI.showMsg(msg, isSelf ? 0 : 1, 'newMsg');
		if (msg.type > 100 && 202 != msg.type) return;

		if (chatUtils.isGroupType(msg.chatType)) {
			//已读回执
			if (
				store.state.user.userId != msg.fromUserId &&
				msgConst.read == msg.type
			) {
				//群聊的已读消息 改变已读人数
				GroupManager.disposeReadReceipt(msg);
				//调用方法处理已读回执 ,这里的fromUserId为群组jid
			}
		}
		if (msgConst.input == msg.type || msgConst.read == msg.type) {
			return;
		}
		if (isOpen) {
			if (chatUtils.isChatType(msg.chatType) && !isSelf) {
				//单聊
				if (!myFn.isReadDelMsg(msg))
					ConversationManager.sendReadReceipt(
						WEBIM.getUserIdFromJid(from),
						msg.messageId
					);
				else if (
					1 != msg.type &&
					2 != msg.type &&
					3 !== msg.type &&
					6 !== msg.type
				)
					ConversationManager.sendReadReceipt(
						WEBIM.getUserIdFromJid(from),
						msg.messageId
					); //发送已读回执
			} else if (chatUtils.isGroupType(msg.chatType)) {
				//群聊
				//发送已读回执到群内
				if (store.state.user.userId != msg.fromUserId) {
					if (myData.isShowGroupMsgReadNum || !isNil(msg.objectId)) {
						GroupManager.sendRead(msg.messageId); //调用方法发送已读回执
					}
				}
			}
		} else {
			if (false == isFilter) {
				//显示通知
				ConversationManager.parseNotification(
					msg,
					fromUserId,
					msg.fromUserName
				);
			}
		}

		if (chatUtils.isChatType(msg.chatType)) {
			//接受到消息好友移动到新朋友的下方  //显示未读消息数量提示
			// $("#myFriendsList #friends_"+fromUserId).insertAfter("#friends_10001");
			msg.isGroup = 0;
			if (store.state.user.userId == fromUserId) {
				fromUserId = msg.toUserId;
				msg.fromJid = msg.toUserId;
				fromUserName = null;
			}
			UI.moveFriendToTop(msg, fromUserId, fromUserName, isOpen ? 0 : 1);
			UI.playSound();
		} else if (chatUtils.isGroupType(msg.chatType)) {
			msg.isGroup = 1;
			if (true == isFilter)
				UI.moveFriendToTop(msg, msg.from, fromUserName, isOpen ? 0 : 0);
			else {
				UI.moveFriendToTop(msg, msg.from, fromUserName, isOpen ? 0 : 1);
				UI.playSound();
			}
			$('#myRoomList #groups_' + fromUserId).prependTo($('#myRoomList'));
		}
	},

	/*处理 漫游的历史聊天记录*/
	handlerHistoryMessageResult: function(result) {
		// let message=null;
		// if(result.messageList){
		//     console.error('收到漫游消息：' + result.messageList.length)
		//     for (let i = 0; i <result.messageList.length; i++) {
		//         message=result.messageList[i];
		//         message=imSdk.convertToClientMsg(message);
		//         message.content=WEBIM.decryptMessage(message);
		//         result.messageList[i]=message;
		//         DataUtils.putMsgRecordList(result.jid, message.messageId,1);
		//     }
		// }
		// messageUtils.handlerHistoryMessageResult(result);
	},
};
