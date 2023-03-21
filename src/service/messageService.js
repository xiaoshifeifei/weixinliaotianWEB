import {imUtils} from "@/utils/my/imUtils";
import {roomService} from "@/service/roomService";
import {WEBIM} from "@/utils/old/webim";
import {msgApi} from "@/api/msgApi";
import store from '@/store';
import {msgConst} from "@/utils/my/const/msgConst";
import {chatUtils} from "@/utils/my/chatUtils";
import {contactData} from "@/utils/data/contactData";
import {roomApi} from "@/api/group";
import TalkEvent from "@/plugins/socket/event/talk-event";
import {chatData} from "@/utils/data/chatData";

export const messageService = {

    addMember(msg){
        let chatId = msg.chatId
        let userId = msg.toUserId
        let roomId = msg.fileName

        //判断是否存在群组， 不存在查询添加，存在则设置成员信息
        let room = contactData.getItem(chatId)
        if(!room){
            //自己被添加， 创建新会话
            if(msg.toUserId==imUtils.userId()){
                console.log('我被加入新群组了')
                let roomId = msg.fileName;
                WEBIM.joinGroupChat(chatId);
                roomService.getNewRoom(roomId, msg.content, function () {
                    new TalkEvent(msg).handle()
                });
            }
        }else{
            //是否获取过members
            if(contactData.getRoomMembers(roomId)){
                roomApi.getMember(roomId, userId).then(res=>{
                    console.log('群组添加新成员了')
                    console.log(res)
                    store.commit('add_member', {roomId: roomId, members: res.data});
                    new TalkEvent(msg).handle();
                })
            }
        }

    },
    sendCard(userIds){
        userIds.forEach(function (userId) {
            let nickname = contactData.getItem(userId).nickname
            let msg = WEBIM.createMessage(msgConst.card, nickname, chatUtils.currentChatId());
            msg.objectId = userId + "";
            WEBIM.sendMessage(msg);
        })
    },
    delMember(msg){
        let chatId = msg.chatId;
        let userId = msg.toUserId;
        //自己被删除了
        if(userId == imUtils.userId()){
            //如果是当前会话， 移除
            if(chatUtils.isCurrentChat(chatId)){
                store.commit('UPDATE_DIALOGUE_MESSAGE', null)
            }
            //删除群组， 删除会话， 删除缓存
            store.commit('del_contact', chatId)
            store.commit('del_chat', chatId)
            chatData.delNew(chatId);
        }
        //其他人被删除了
        else{
            let detail = contactData.getItem(chatId);
            console.error(detail?'':'群员被删除了， 但是找不到群组.......');
            store.commit('del_members', {roomId: detail.id, userIds: [userId]});
            if(msg) new TalkEvent(msg).handle()
        }
    },

    gagMember(msg){
        let userId = msg.toUserId;
        // if (!WEBIM.isUserId(msg.toUserId)) return;
        let chatId = msg.objectId;

        console.log(`群员被禁言${chatId}-${userId}-${msg.talkTime}`)
        store.commit('update_member_talkTime', {chatId: chatId, userId: userId, talkTime: msg.talkTime})
        new TalkEvent(msg).handle();
    },

    gagRoom(msg){
        let talkTime = msg.text;
        let chatId = msg.objectId;
        store.commit('update_talkTime', {chatId: chatId, talkTime: talkTime})
        new TalkEvent(msg).handle();
    },

    delRoom(msg){
        console.log('删除房间')
        let chatId = msg.objectId;
        roomService.delRoomData(chatId);
    },
    setRole(msg){
        let chatId = chatUtils.getChatId(msg)
        let toUserId = msg.toUserId;
        let fromUserId = msg.fromUserId;
        let setManager = msg.content==1;

        let room = contactData.getItem(chatId)
        let myUserId = store.state.user.userId

        if(fromUserId!=myUserId && room){
            let isSelf = myUserId==toUserId;
            store.commit('set_role', {roomId: room.id, userId: toUserId, role: setManager?2:3, isSelf: isSelf})
        }
    },
    transfer(msg, userIdArr){
        let toUserId = null;
        for (let i = 0; i < userIdArr.length; i++) {
            toUserId = userIdArr[i].id;
            WEBIM.transferMsgFmt(msg, toUserId);
            WEBIM.sendMessage(msg);
            msg.isGroup = WEBIM.isGroup(toUserId);
        }
    },

    //删除当前会话消息
    delMsg(msg){
        console.log('删除消息')
        msgApi.del(msg).then(res=>{
            store.commit('del_msg', msg.id);
        })
    },

    revoke(msg){
        store.commit('del_msg', msg.content);
        new TalkEvent(msg).handle();
    },

    //撤回当前会话消息
    revokeMsg(msg){
        console.log('删除消息')
        console.log(msg)
        msgApi.revoke(msg).then(res=>{
            store.commit('del_msg', msg.id);
            let message = WEBIM.createMessage(msgConst.revoke, msg.id, chatUtils.getChatId(msg));
            WEBIM.sendMessage(message);
        })
    },
    /*发送消息已读回执*/
    sendMessageReadReceipt:function(chatId,messageId){
        let msg=WEBIM.createMessage(msgConst.read, messageId, chatId);
        msg.to=chatId;
        if (WEBIM.isGroup(chatId)) {
            msg.chatType=WEBIM.GROUPCHAT;
        } else {
            msg.chatType =WEBIM.CHAT;
        }
        let msgObj=msg;
        WEBIM.sendMessage(msgObj);
        return msg;
    },
    /*收到消息已读回执*/
    handlerReadReceipt:function(message){
        // ConversationManager.handlerReadReceipt(message);
    },

}
