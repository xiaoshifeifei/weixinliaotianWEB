import {get, post} from "@/utils/request";
import {chatUtils} from "@/utils/my/chatUtils";
import {WEBIM} from "@/utils/old/webim";

export const msgApi = {

    get(msgId, chatType) {
        return get('/api/tigase/getMessage', {
            messageId: msgId,
            type: chatType
        })
    },

    del(msg) {
        return get('/api/tigase/deleteMsg', {
            type: chatUtils.getChatType(msg.chatId),
            delete: 1,
            messageId: msg.messageId,
            roomJid: msg.chatId
        })
    },

    revoke(msg) {
        return get('/api/tigase/deleteMsg', {
            type: chatUtils.getChatType(msg.chatId),
            delete: 2,
            messageId: msg.messageId,
            roomJid: msg.chatId
        })
    },

    getRed(id) {
        return get('/api/redPacket/getRedPacket', {
            id: id
        })
    },

    openRed(id) {
        return get('/api/redPacket/openRedPacket', {
            id: id
        })
    },
    sendRed(data) {
        return post('/api/redPacket/sendRedPacket/v2', data)
    },


}






