import store from '@/store'
import {parseTime} from '@/utils/functions'
import {contactData} from "@/utils/data/contactData";
import {imUtils} from "@/utils/my/imUtils";
import {chatUtils} from "@/utils/my/chatUtils";
import {chatData} from "@/utils/data/chatData";
import {msgUtils} from "@/utils/my/msgUtils";
import {Message} from "element-ui";
import {msgConst} from "@/utils/my/const/msgConst";

export const lastUtils = {
    findTalkIndex(chatId) {
        // console.log("群组转发",chatId,store.state.talks.items);
        return store.state.talks.items.findIndex(
            item => item.chatId == chatId
        )
    },
    findTalk(chatId) {
        return store.state.talks.items.find(item => item.chatId == chatId)
    },
    formatTalkItem(params) {
        let name = params.toUserName
        let id = params.id;
        let isRoom = params.isRoom == 1
        let type = (!isRoom) ? 1 : 2;
        let chatId = params.jid

        params.chatType = chatUtils.getChatType(chatId);
        params.messageHead = {to: chatId}
        msgUtils.setContentFmt(params)

        let content = params.contentFmt
        let contactDetail = contactData.getItem(chatId)
        let isTop = 0

        if (!contactDetail) {
            console.error('群组或者好友信息未找到.....................')
            console.log(chatId)
        } else {
            name = contactDetail.nickname;
            id = contactDetail.id
            isTop = contactDetail.topTime ? 1 : 0;

            let options = {
                id: id,
                chatId: chatId,
                type: type,
                name: name ? name : '未设置昵称',
                avatar: imUtils.getAvatarUrl(chatId),
                roomId: id,
                disturb: 0,
                isTop: isTop,
                unreadNum: chatData.unreadGet(chatId),
                content: content ? content : '......',
                draftText: '',
                createTime: parseTime(new Date()),
                updateTime: parseTime(new Date(params.timeSend)),

            }
            return options
        }
    },
    createChat(msg) {
        let content = msg.content
        let chatId = msg.chatId
        let chat = null
        console.log('createChat')
        if (chatUtils.isGroupId(chatId)) {
            this.newRoomChat(chatId, content, msg.type)
        }else{
            this.newFriendChat(chatId, content, msg.type)
        }
    },
    newRoomChat(chatId, content, type) {
        console.log('创建会话， newRoomChat');
        let chat = {
            _id: chatId,
            type: type != null ? type : msgConst.text,
            messageId: chatId,
            timeSend: new Date().getTime(),
            content: content,
            jid: chatId,
            isRoom: 1,
            isEncrypt: false,
            encryptType: 0,
            to: chatId,
            // userId: createId,
            // from: "10005/Server",
            // fromUserName: "1333昵称",
            // toUserName: "1335"
        };
        chat = lastUtils.formatTalkItem(chat)
        if(chat){
            chatData.addNew(chat);
            store.commit('INSERT_TALK_ITEM', chat)
        }
    },
    newChat(chatId, content){
      if(chatUtils.isGroupId(chatId)){
          this.newRoomChat(chatId, content);
      }  else{
          this.newFriendChat(chatId, content);
      }
    },
    newFriendChat(chatId, content) {
        console.log('创建会话， newFriendChat');
        // let chatId = friend.toUserId;
        // let nickname = friend.toUserName;
        let user = store.state.user.userInfo
        if(user){
            let contact = contactData.getItem(chatId);
            let nickname = contact?contact.nickname:''
            console.log(chatId)
            let chat = {
                _id: chatId,
                type: 1,
                messageId: chatId,
                timeSend: new Date().getTime(),
                content: content ? content : "我们已经是好友了",
                userId: chatId,
                jid: chatId,
                isRoom: 0,
                isEncrypt: false,
                encryptType: 0,
                from: user.userId + "/web",
                to: chatId,
                fromUserName: user.nickname,
                toUserName: nickname
            }
            console.log('info-002', chat);
            chat = lastUtils.formatTalkItem(chat)
            console.log('info-003', chat);
            if(chat){
                console.log('info-001');
                chatData.addNew(chat);
                store.commit('INSERT_TALK_ITEM', chat)
            }
        }else{
            Message.error('创建对话失败[]')
        }

    },

}
