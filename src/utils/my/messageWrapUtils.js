import store from '@/store'


/**
 * 收到的消息， 进行包装
 * @type {{}}
 */
export const messageWrap = {

    /**
     * 别人请求加我好友
     */
    getReplayByMessage(msg) {
        return {
            content: msg.content,
            createTime: msg.timeSend,
            direction: 1,
            modifyTime: msg.timeSend,
            status: 0,
            toNickname: msg.fromUserName,
            toUserId: msg.fromUserId,
            type: msg.type,
            userId: state.state.user.userId
        }
    }

}
