import {Message} from "element-ui";
import {chatUtils} from "@/utils/my/chatUtils";
import {myFn} from "@/utils/old/myFn";
import {WEBIM} from "@/utils/old/webim";
import store from '@/store';

export const room = {

    /**
     *
     * @param userId
     * @param groupName
     * @param groupData
     */
    createGroupChat: function (groupId, userId, jid) {  //groupId :群组id    userId：创建者的userId
        // mySdk.getRoomOnly(groupId, function (obj) {
        //     if (null == obj) {
        //         UI.removeGroupMessagesList(jid);
        //         return;
        //     }
        //     if (obj.showRead == 1 || obj.showRead == '1') { //如果开启群已读，则更新缓存中已读状态值
        //         myData.isShowGroupMsgReadNum = true;
        //     }
        //     GroupManager.roomData = obj;
        //     DataMap.myRooms[obj.jid] = obj;
        //
        //     ConversationManager.open(obj.jid, obj.name, groupId);
        //
        //     // ConversationManager.showAvatar(obj.jid, 1);//显示聊天窗口顶部头像(群聊)
        //     //获取群已读状态进行缓存
        //     if (0 == obj.showRead || '0' == obj.showRead) {
        //         myData.isShowGroupMsgReadNum = false;
        //     } else if (1 == obj.showRead || '1' == obj.showRead) {
        //         myData.isShowGroupMsgReadNum = true;
        //     }
        //
        //     // 成员角色：1=创建者、2=管理员、3=成员
        //     let role = obj.member.role;
        //     Temp.roomRole = role;
        //     DataMap.current.createUserName = obj.member.nickname;
        //
        //
        //     if (3 == role) {
        //         $("#btnKicking_1").empty();
        //         $("#btnKicking_1").append("成员列表");
        //     } else if (2 == role) {
        //         $("#btnKicking_1").empty();
        //         $("#btnKicking_1").append("成员管理");
        //     } else if (1 == role) {
        //         $("#btnKicking_1").empty();
        //         $("#btnKicking_1").append("成员管理");
        //     }
        //
        // });
    },

    // del(){
    //     if (GroupManager.roomData.userId = myData.userId) {
    //         ownAlert(4, "是否确认解散本群组？", function () {
    //             let roomJid = GroupManager.roomData.jid;
    //             myFn.invoke({
    //                 url: '/room/delete',
    //                 data: {
    //                     roomId: GroupManager.roomData.id
    //                 },
    //                 success: function (result) {
    //                     if (1 != result.resultCode) {
    //                         ownAlert(2, "群组删除失败，请稍后再试。");
    //                         return;
    //                     }
    //                     ownAlert(1, "群组删除成功！");
    //                     $("#myMessagesList #groups_" + roomJid).remove();
    //                     $("#myRoomList #groups_" + roomJid).remove();
    //                     $("#tabCon_2").hide();
    //
    //                     // $("#chatPanel").hide();
    //                     $("#tab").hide();
    //                     DataUtils.deleteFriend(roomJid);
    //                     ConversationManager.isOpen = false;
    //                     ConversationManager.from = null;
    //                     // GroupManager.showMyRoom(0);
    //                 },
    //                 error: function (result) {
    //                     ownAlert(2, "群组删除失败，请稍后再试");
    //                 }
    //             });
    //         });
    //     } else {
    //         ownAlert(3, "权限不足！");
    //         return;
    //     }
    // },

    /*转换 群控制消息*/
    convertGroupMsg : function(msg) {

    },

    //处理 群控制信息的 值变化
    // processGroupControlMsg: function (msg) { //用于显示群组日志
    //     console.error('消息类型' + msg.contentType)
    //     //ws-info 变动
    //     switch (msg.contentType) {
    //         case MessageType.group.change_member_name:
    //             break;
    //         case MessageType.group.change_root_name:
    //             if (ConversationManager.isOpen && msg.roomJid == ConversationManager.fromUserId) {
    //                 $("#myRoomList #groups_" + msg.objectId + " .groupName").html(msg.text);
    //                 $("#myMessagesList #groups_" + msg.objectId + " .groupName").html(msg.text);
    //                 $("#gname").html(msg.text);
    //             }
    //             roomUi.setName(msg.roomJid ,msg.text)
    //             break;
    //         case MessageType.group.del_room:
    //
    //             break;
    //         case MessageType.group.del_member:
    //             //  被踢出群后的处理
    //             let roomId = msg.objectId
    //             DataUtils.delMember(msg)
    //             if (WEBIM.isUserId(msg.toUserId) && !WEBIM.isGroupType(msg.chatType)) {
    //                 if (myData.userId != msg.fromUserId)
    //                     ownAlert(3, '你已被移出' + msg.text + '群');
    //                 DataMap.deleteRooms[roomId] = DataMap.myRooms[roomId]; //将被踢出的群的数据储存
    //                 delete DataMap.myRooms[roomId];
    //                 UI.clearMsgNum(roomId);
    //                 $("#myMessagesList #groups_" + roomId).remove();
    //                 $("#myRoomList #groups_" + roomId).remove();
    //                 if (roomId == ConversationManager.fromUserId) {
    //                     UI.hideChatBodyAndDetails();
    //                 }
    //                 // GroupManager.showMyRoom(0);
    //             }
    //             break;
    //         case MessageType.group.add_notice:
    //             //群公告
    //             //$("#myRoomList #titgroups_"+msg.objectId).html(msg.text);
    //             if (ConversationManager.isOpen && msg.roomJid == ConversationManager.fromUserId)
    //                 $("#gnotice").html(msg.text);
    //             break;
    //         case MessageType.group.gag:
    //             //判断被禁言者是否为用户自己
    //             if (!WEBIM.isUserId(msg.toUserId))
    //                 break;
    //             DataMap.talkTime[msg.objectId] = msg.talkTime;//储存我在该群组的talkTime
    //             if (ConversationManager.fromUserId == msg.objectId) {
    //                 ConversationManager.talkTime = Number(msg.talkTime);
    //                 GroupManager.roomData.member.talkTime = Number(msg.talkTime);
    //             }
    //             break;
    //         case MessageType.group.add_member:
    //             let roomId = msg.objectId
    //             DataUtils.addMember(msg);
    //             if (WEBIM.isUserId(msg.toUserId) && !WEBIM.isGroupType(msg.chatType)) {
    //                 mySdk.getRoomOnly(msg.fileName, function (obj) {
    //                     DataMap.myRooms[obj.jid] = obj;
    //                     WEBIM.joinGroupChat(roomId);
    //                 });
    //             }
    //             //检查该群是否存在于被踢出数据中，存在则清除
    //             if (!myFn.isNil(DataMap.deleteRooms[roomId])) {
    //                 delete DataMap.deleteRooms[roomId];
    //                 //检查当前打开的是否为目标界面,是则将隐藏的详情按钮显示
    //                 if (roomId == ConversationManager.fromUserId) {
    //                     $("#tab #details").show();
    //                 }
    //             }
    //             break;
    //         case MessageType.group.set_manager:
    //             DataUtils.setManager(msg)
    //             if (ConversationManager.isOpen && ConversationManager.fromUserId == msg.objectId) {
    //                 if (WEBIM.isUserId(msg.toUserId)) {
    //                     if (1 == msg.content || "1" == msg.content) {
    //                         GroupManager.roomData.member.role = 2;
    //                         $("#chatBannedDiv").hide();
    //                         $("#sendMsgScopeDiv *").attr('disabled', false);
    //                     } else {
    //                         GroupManager.roomData.member.role = 3;
    //                         if (getCurrentSeconds() < GroupManager.roomData.talkTime)
    //                             $("#chatBannedDiv").show();
    //                         $("#sendMsgScopeDiv *").attr('disabled', true);
    //                     }
    //                 }
    //             }
    //         case MessageType.group.set_read:
    //             //群已读消息开关
    //             if (msg.objectId == ConversationManager.fromUserId) {
    //                 if (1 == msg.text || "1" == msg.text) {
    //                     myData.isShowGroupMsgReadNum = true;
    //                 } else
    //                     myData.isShowGroupMsgReadNum = false;
    //                 GroupManager.roomData.showRead = parseInt(msg.text);
    //             }
    //             break;
    //         case 916:
    //             if (myFn.isNil(msg.content)) {
    //
    //             } else if (ConversationManager.isOpen && ConversationManager.fromUserId == msg.objectId) {
    //                 GroupManager.roomData.isNeedVerify = parseInt(msg.text);
    //             }
    //             break;
    //         case 917:
    //             //群公开状态
    //             if (ConversationManager.isOpen && ConversationManager.fromUserId == msg.objectId)
    //                 GroupManager.roomData.isLook = parseInt(msg.text);
    //             break;
    //         case 918:
    //             if (ConversationManager.isOpen && ConversationManager.fromUserId == msg.objectId) {
    //                 GroupManager.roomData.showMember = parseInt(msg.text);
    //                 if (3 == GroupManager.roomData.member.role && 0 == GroupManager.roomData.showMember) {
    //                     $("#btnKicking").hide();
    //                 } else
    //                     $("#btnKicking").show();
    //             }
    //
    //             break;
    //         case 919:
    //             if (ConversationManager.isOpen && ConversationManager.fromUserId == msg.objectId) {
    //                 GroupManager.roomData.allowSendCard = parseInt(msg.text);
    //                 if (3 == GroupManager.roomData.member.role && 1 != GroupManager.roomData.allowSendCard) {
    //                     $("#btnmin").hide();
    //                 } else {
    //                     $("#btnmin").show();
    //                 }
    //             }
    //
    //             break;
    //
    //         case MessageType.group.all_gag:
    //             let jid = msg.objectId
    //             let talkTime = msg.text
    //             DataUtils.setTalkTime(jid, talkTime)
    //             if (ConversationManager.isOpen && ConversationManager.fromUserId == msg.objectId) {
    //                 GroupManager.roomData.talkTime = parseInt(msg.text);
    //                 roomUi.currentMessageEnable()
    //             }
    //             break;
    //         case 921:
    //             if (ConversationManager.isOpen && ConversationManager.fromUserId == msg.objectId) {
    //                 GroupManager.roomData.allowInviteFriend = parseInt(msg.text);
    //                 if (3 == GroupManager.roomData.member.role && 0 == GroupManager.roomData.allowInviteFriend) {
    //                     $("#btnInvite").hide();
    //                 } else
    //                     $("#btnInvite").show();
    //             }
    //             break;
    //         case 922:
    //             if (ConversationManager.isOpen && ConversationManager.fromUserId == msg.objectId) {
    //                 GroupManager.roomData.allowUploadFile = parseInt(msg.text);
    //                 if (3 == GroupManager.roomData.member.role && 0 == GroupManager.roomData.allowUploadFile) {
    //                     $("#btnUploadGroupFile").hide();
    //                 } else
    //                     $("#btnUploadGroupFile").show();
    //             }
    //             break;
    //         case 923:
    //             if (ConversationManager.isOpen && ConversationManager.fromUserId == msg.objectId) {
    //                 GroupManager.roomData.allowConference = parseInt(msg.text);
    //                 if (3 == GroupManager.roomData.member.role && 0 == GroupManager.roomData.allowConference) {
    //                     $("#btncall").hide();
    //                     $("#btnvideo").hide();
    //                 } else {
    //                     $("#btncall").show();
    //                     $("#btnvideo").show();
    //                 }
    //             }
    //             break;
    //         case 924:
    //             if (ConversationManager.isOpen && ConversationManager.fromUserId == msg.objectId)
    //                 GroupManager.roomData.allowSpeakCourse = parseInt(msg.text);
    //             break;
    //         case 925:
    //             DataUtils.receiveTransfer(msg)
    //             if (ConversationManager.isOpen && ConversationManager.fromUserId == msg.objectId) {
    //                 GroupManager.roomData.userId = parseInt(msg.toUserId);
    //                 $("#chatBannedDiv").hide();
    //                 $("#sendMsgScopeDiv *").attr('disabled', false);
    //                 $("#groupTransferDiv").show()
    //             }
    //             break;
    //         default:
    //             break;
    //     }
    //     return msg;
    // },

}
