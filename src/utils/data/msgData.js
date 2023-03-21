import {chatUtils} from "@/utils/my/chatUtils";
import {Command} from "@/utils/old/websocket_sdk";

export const msgData = {
    //消息去重集合
    msgIds: [],
    //待发送的群组回执
    receiptRoomMsgIds: '',
    //待发送的好友回执
    receiptFriendMsgIds: '',

    sendMsg(msg) {
        let msgId = msg.messageId
        //发送消息
        this.msgIds.push(msgId)
    },
    receiveMsg(msg, cmd) {
        let msgId = msg.messageId
        //接受消息
        this.msgIds.push(msgId)
        //回执
        if(Command.COMMAND_CHAT == cmd){
            if(chatUtils.isGroup(msg)){
                this.receiptRoomMsgIds += (msgId + ",")
            }else{
                this.receiptFriendMsgIds += (msgId + ",")
            }
        }
    },

    addId(msgId) {
        this.msgIds.push(msgId)
    },
    hasId(msgId) {
        return this.msgIds.indexOf(msgId) != -1
    },
    unreadMsgIds(chatId, msgId){

    },
    getUnreadMsgIds(chatId){
        return
    },

}
