import {imUtils} from "@/utils/my/imUtils";
import {chatUtils} from "@/utils/my/chatUtils";
import store from "@/store";
import {Message} from "element-ui";
import {myFn} from "@/utils/old/myFn";
import {WEBIM} from "@/utils/old/webim";
import {msgUtils} from "@/utils/my/msgUtils";

export const wrapUtils = {

    wrapUser(user) {
        let friend = user.friends;
        let settings = user.settings;

        //好友验证
        user.allowAdd = (settings.friendsVerify == 1);
        user.status = friend ? friend.status : 0
        user.isBlack = friend && (1 == friend.blacklist || 1 == friend.isBeenBlack)
        user.remark = friend && friend.remarkName
        user.avatar = imUtils.getAvatarUrl(user.userId)
        user.nameFmt = user.remark ? user.remark : user.nickname
    },
    wrapFriends(data) {
        if (!Array.isArray(data)) {
            data = [data]
        }
        let friends = []
        data.forEach(function (item) {
            let remark = item.remarkName
            let nickname = item.toNickname
            let userId = item.toUserId;
            friends.push({
                id: userId,
                chatId: userId,
                type: 1,
                nickname: remark ? remark : nickname,
                avatar: imUtils.getAvatarUrl(userId),
                checked: false,
            })
        })
        return friends;
    },
    wrapRooms(data) {
        if (!Array.isArray(data)) {
            data = [data]
        }
        let rooms = []
        data.forEach(function (room) {
            let gJid = room.jid
            let talkTime = room.talkTime
            rooms.push({
                id: room.id,
                chatId: gJid,
                type: 2,
                nickname: room.name,
                desc: room.desc,
                talkTime: talkTime,
                gag: talkTime!=null && talkTime!=0,
                avatar: imUtils.getAvatarUrl(gJid),
                checked: false,
                createrNickName: room.nickname,
                userSize: room.userSize,
                myNickName: room.member.nickname,
                myRole: room.member.role,
                isTop: room.member.isOpenTopChat != 0,
                topTime: room.member.openTopChatTime,
                disturb: room.member.offlineNoPushMsg == 0,
                members: []
            })
        })
        return rooms;
    },
    wrapRoomMember(members) {
        if (!Array.isArray(members)) {
            members = [members];
        }
        members.forEach(member => {
            member.selected = false;
        })
    },

    /**
     * 包装群组消息： 主要组装消息内容
     * @param msg
     * @returns {*}
     */
    wrapRoomMsg(msg) {
        msgUtils.setContentFmt(msg);
        msg.contentType = msg.type;
        msg.type = 10;
        // if (true == appendTime)
        //     msg.content += "  (" + WEBIM.toDateTime(msg.timeSend) + ")";
        return msg;
    }

}
