import {WEBIM} from "@/utils/old/webim";
import store from "@/store";
import {msgConst} from "@/utils/my/const/msgConst";

export const chatUtils = {
    isGroupId(chatId) {
        chatId += "";
        if (chatId.indexOf("/") >= 0)
            return false;
        let reg = /^[0-9]*$/;
        if (!reg.test(chatId)){
            return true;
        }
        else{
            return false;
        }
    },
    hasChat(chatId){
        return store.state.talks.items.some(function (item) {
            return item.chatId==chatId
        })
    },
    currentChatId(){
        return store.state.dialogue.chatId
    },
    isCurrentChat(chatId){
        return chatId==store.state.dialogue.chatId
    },
    isCurrentChatMsg(msg){
        return this.isCurrentChat(chatUtils.getChatId(msg))
    },
    /*是否是 群组消息*/
    isGroupType: function (chatType) {
        return WEBIM.GROUPCHAT == chatType;
    },
    getChatType(chatId){
        return this.isGroupId(chatId) ? 2 : 1;
    },
    /*是否是 单聊消息*/
    isChatType: function (chatType) {
        return WEBIM.CHAT == chatType;
    },

    //自己的消息
    isSelf(msg){
        return msg.fromUserId==store.state.user.userId
    },
    //发送的消息
    isSend(msg){
        return chatUtils.isSelf(msg)
    },
    //接收的消息
    isReceive(msg){
        return !(chatUtils.isSend(msg))
    },
    isGroup(msg){
        let chatType = msg.chatType
        if(!chatType){
            let head = msg.messageHead
            if(head && head.chatType){
                chatType = head.chatType;
            }
        }
        return chatType==2
    },
    isChat(msg){
        let chatType = msg.chatType
        if(!chatType){
            let head = msg.messageHead
            if(head && head.chatType){
                chatType = head.chatType;
            }
        }
        return chatType==1
    },
    // isCurrent(chatId){
    //     return ConversationManager.fromUserId==chatId
    // },
    // isCurrentChatMsg(msg){
    //     return chatUtils.getChatId(msg) == ConversationManager.fromUserId
    // },
    getChatId(msg){
        let head = msg.messageHead
        if(head && head.to){
            return head.to;
        }
        //删除消息chatId==objectId
        if(parseInt(msg.type / 100) == 9){
            return msg.objectId;
        }

        let groupMsg = chatUtils.isGroup(msg);
        let roomJid = msg.roomJid
        if(roomJid){
            return roomJid
        }
        let chatId = ''
        if(groupMsg){
            if(msg.from){
                chatId = msg.from
                chatId = WEBIM.getUserIdFromJid(chatId)
            }
            if(!chatId || !WEBIM.isGroup(chatId)){
                chatId = msg.to
                chatId = WEBIM.getUserIdFromJid(chatId)
            }
        }else{
            //非自己则是回话Id
            if(msg.from){
                chatId = msg.from
                chatId = WEBIM.getUserIdFromJid(chatId)
            }
            if(!chatId || store.state.user.userId == chatId){
                chatId = msg.to
                chatId = WEBIM.getUserIdFromJid(chatId)
            }
        }
        return chatId;
    },
}
