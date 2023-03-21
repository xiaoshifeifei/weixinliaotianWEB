import {msgConst} from "@/utils/my/const/msgConst";
import {chatUtils} from "@/utils/my/chatUtils";
import {imUtils} from "@/utils/my/imUtils";
import {wrapUtils} from "@/utils/my/wrapUtils";
import store from "@/store";
import {myFn} from "@/utils/old/myFn";

export const msgUtils = {

    wrapMessages(messages) {
        let msgs = []
        messages.forEach(function (data) {
            let msg = JSON.parse(data.message);
            msgs.push(msgUtils.wrapMessage(msg))
        })
        return msgs
    },

    wrapMessage(msg) {
      
        try{
            let messageId = msg.messageId;
            let head = msg.messageHead
            if(!messageId){
                messageId = head?head.messageId:'';
            }
            let content = msg.content
            let fromUserId = msg.fromUserId
            //3311 邀请 jiangm 加入群组
            msgUtils.setContentFmt(msg);
            let chatId = chatUtils.getChatId(msg);
            let isGroup = chatUtils.isGroupId(chatId)
            msg.messageId = messageId;
            msg.chatId = chatId;
            if(!msg.chatType) msg.chatType = isGroup ? 2 : 1;
            msg.id = messageId;
            msg.createTime = new Date(parseInt(msg.timeSend)).toString()
            msg.nickname = msg.fromUserName
            msg.avatar = imUtils.getAvatarUrl(fromUserId);
            msg.isNotice = msgUtils.isNotice(msg)
            return msg
        }catch (e) {
            console.error(e)
        }
    },
    oldMessage(msg) {
        try{

            delete msg.chatId
            delete msg.avatar
            delete msg.isNotice
            delete msg.nickname
            delete msg.createTime
            delete msg.id
            delete msg.chatId

            return msg
        }catch (e) {
            console.error(e)
        }
    },

    isNotice(msg) {
        let msgType = msg.type;
        if (msgType == msgConst.revoke || msgType == msgConst.red_receive || msgType >= 200) {
            return true
        }
        return false
    },

    setContentFmt(msg){
        let content = msg.content;
        // console.log(111111,msg)
        msg.text = content;
        let appendTime = true;
        let chatId = chatUtils.getChatId(msg)
        // console.log('====================================');
        // console.log(222222,msg.type,msgConst.revoke,msg);
        // console.log('====================================');
        switch (msg.type) {
            case msgConst.revoke:
                if(msg.fromUserId == store.state.user.userId){
                    content = '你撤回了一条消息';
                }else{
                    content = msg.fromUserName + ' 撤回了一条消息';
                }
                break;
            case 83:
                msg.isNotice=true;
                content = msg.fromUserName + " 领取了" + msg.toUserName + "的红包 ";
                break;
            case 401:
                let fileName = msg.fileName ? msg.fileName.substring(msg.fileName.lastIndexOf("/") + 1) : '';
                content = msg.fromUserName + " 上传了群文件 " + fileName;
                break;
            case 402:
                content = msg.fromUserName + " 删除了群文件 ";
                break;
            case 901:
                content = msg.fromUserName + " 群昵称修改为 " + content;
                break;
            case 902:
                content = "群组名称修改为： " + content;
                break;
            case 903:
                store.commit('del_contact', chatId);
                //Message('群组被删除.')
                return;
                break;
            case 904:
                if (msg.fromUserId == msg.toUserId)
                    content = msg.toUserName + " 已退出群组";
                else
                    content = msg.toUserName + " 已被移出群组";
                break;
            case 905:
                content = "新公告为: " + content;
                break;
            case 906:
                if (!chatUtils.isGroupId(chatId))
                    return null;
                msg.talkTime = content;
                if (0 == content || "0" == content) {
                    content = msg.toUserName + " 已被取消禁言";
                } else {
                    content = msg.toUserName + " 已被禁言 ";
                }
                break;
            case 907:
                if (msg.fromUserId == msg.toUserId)
                    content = msg.fromUserName + " 已加入群组";
                else
                    content = msg.fromUserName + " 邀请 " + msg.toUserName + " 加入群组";
                break;
            case 913:
                if (!chatUtils.isGroupId(chatId))
                    return null;
                if (1 == content || "1" == content)
                    content = msg.toUserName + " 被设置管理员 ";
                else
                    content = msg.toUserName + " 被取消管理员 ";
                break;
            case 915:
                //群已读消息开关
                if (1 == content || "1" == content) {
                    content = msg.fromUserName + " 开启了显示消息已读人数";
                } else
                    content = msg.fromUserName + " 关闭了显示消息已读人数";
                break;
            case 916:
                if (myFn.isNil(content)) {
                    //邀请好友
                    appendTime = false;
                    let inviteObj = eval("(" + msg.objectId + ")");
                    if ("0" == inviteObj.isInvite || 0 == inviteObj.isInvite) {
                        let count = inviteObj.userIds.split(",").length;
                        content = msg.fromUserName + " 想邀请 " + count + " 位朋友加入群聊 ";
                    } else {
                        content = msg.fromUserName + " 申请加入群聊 ";
                    }
                    content += '，请确认';
                } else {
                    if (1 == content || "1" == content || content==undefined) {
                        content = msg.fromUserName + " 开启了进群验证";
                    } else
                        content = msg.fromUserName + " 关闭了进群验证";
                }
                // console.log(777777,content);
                break;
            case 917:
                //群公开状态
                if (1 == content || "1" == content) {
                    content = msg.fromUserName + " 修改为隐私群组";
                } else
                    content = msg.fromUserName + " 修改为公开群组";
                break;
            case 918:
                if (1 == content || "1" == content) {
                    content = msg.fromUserName + " 开启了显示群成员列表";
                } else
                    content = msg.fromUserName + " 关闭了显示群成员列表";
                break;
            case 919:
                let allowSendCard = content
                if (1 == content || "1" == content) {
                    content = msg.fromUserName + " 开启了允许普通群成员私聊";
                } else {
                    content = msg.fromUserName + " 关闭了允许普通群成员私聊";
                }
                if (chatUtils.isCurrentChatMsg(msg)) {
                    store.commit('setAllowSendCard', {chatId: chatId, allow: allowSendCard});
                }
                break;
            case 920:
                if (0 == content || "0" == content) {
                    content = msg.fromUserName + "已取消全体禁言";
                } else {
                    content = msg.fromUserName + "已开启全体禁言";
                }
                break;
            case 921:
                if (1 == content || "1" == content) {
                    content = msg.fromUserName + " 开启了允许普通成员邀请好友";
                } else
                    content = msg.fromUserName + " 关闭了允许普通成员邀请好友";
                break;
            case 922:
                if (1 == content || "1" == content) {
                    content = msg.fromUserName + " 开启了允许普通成员上传群共享文件";
                } else
                    content = msg.fromUserName + " 关闭了允许普通成员上传群共享文件";
                break;
            case 923:
                if (1 == content || "1" == content) {
                    content = msg.fromUserName + " 开启了允许普通成员召开会议";
                } else
                    content = msg.fromUserName + " 关闭了允许普通成员召开会议";
                break;
            case 924:
                if (1 == content || "1" == content) {
                    content = msg.fromUserName + " 开启了允许普通成员讲课";
                } else
                    content = msg.fromUserName + " 关闭了允许普通成员讲课";
                break;

            case 925:
                if (!chatUtils.isGroupId(chatId))
                    return null;
                content = msg.toUserName + " 已成为新群主";
                break;
            case 931:  //群锁定、解锁
                content = "此群已" + (content == -1 ? "被锁定" : "解除锁定");
                break;
            default:
                break;
        }
        msg.contentFmt = content;
        return content;
    }


}


