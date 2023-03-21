import {chatApi} from "@/api/chatApi";
import store from '@/store';
import {getCurrentSeconds} from "@/utils/utils";
import {Message, Notification} from "element-ui";
import {chatData} from "@/utils/data/chatData";
import {roomApi} from "@/api/group";
import {WEBIM} from "@/utils/old/webim";
import {msgConst} from "@/utils/my/const/msgConst";
import {imUtils} from "@/utils/my/imUtils";
import {room} from "@/utils/old/room";
import {lastUtils} from "@/utils/my/lastChatUtils";
import {wrapUtils} from "@/utils/my/wrapUtils";
import {contactData} from "@/utils/data/contactData";
import {chatUtils} from "@/utils/my/chatUtils";
import TalkEvent from "@/plugins/socket/event/talk-event";
import {myUtils} from "@/utils/my/myUtils";

export const roomService = {

    createRoom(name, userIds, callback){
        return new Promise((resolve, reject)=>{
            roomApi.createRoom(name, userIds).then(res => {
                if (res.resultCode == 1) {
                    let roomData = res.data;
                    let roomId = roomData.id;
                    let jid = roomData.jid;

                    let msg = WEBIM.createMessage(msgConst.group.add_member, name, imUtils.userId());
                    msg.objectId = jid;
                    msg.fileName = roomId
                    // if (1 == myData.multipleDevices) {
                    //   DeviceManager.sendMsgToMyDevices(msg);
                    // }
                    wrapUtils.wrapRoomMsg(msg);
                    msg.isGroup = 1;

                    roomService.getNewRoom(roomId, msg.content);

                    WEBIM.joinGroupChat(jid);
                    resolve(roomData)
                } else {
                    reject();

                }
            }).catch(res=>{
                reject()
            })
        })
    },

    getNewRoom(roomId, content, callback){
        //初始化
        roomApi.getRoom(roomId).then(res=>{
            let room = res.data
            //群组数据添加
            store.commit('addRoom', room)
            lastUtils.newRoomChat(room.jid, content)
            callback && callback()
        });

    },

    delRoom(chatId){
        let chat = contactData.getItem(chatId)
        return new Promise((resolve, reject) => {
            if(chat){
                roomApi.delGroup(chat).then(({ resultCode }) => {
                    if (resultCode == 1) {
                        roomService.delRoomData(chatId)
                        resolve()
                    }else{
                        reject()
                    }
                }).catch(res=>{
                    reject()
                })
            }else{
                roomService.delRoomData(chatId)
                resolve()
            }
        })
    },
    delMember(roomId, ids){
        roomApi.delMember(roomId, myUtils.copy(ids), function (res) {
            store.commit('del_members', {roomId: roomId, userIds: ids});
            // that.loadMembers()
            Notification({
                title: '删除成功',
                message: `已成功将群成员移除群组...`,
                type: 'success',
            })
        })
    },
    delRoomData(chatId){
        chatData.delNew(chatId)
        store.commit('del_chat', chatId);
        store.commit('del_contact', chatId);
    },



    /**
     * 免打扰
     * @param chatId
     * @param disturb
     */
    setDisturb(chatId, disturb){
        //本地修改即可
        if(disturb){
            chatData.addDisturb(chatId);
        }else{
            chatData.delDisturb(chatId);
        }
    },

    //禁言
    gag(room, gag){
        let talkTime = (gag ? getCurrentSeconds() + 604800 : 0);
        let data = {
            talkTime: talkTime,//全体禁言 7天
            roomId: room.id
        }
        roomApi.updateRoom(data).then(res=>{
            if(res.resultCode==1){
                // store.commit('update_talkTime', {chatId: room.chatId, key: 'talkTime', value: talkTime})
                Message({
                    message: gag?'已开启全体禁言!':'已关闭全体禁言!',
                    type: 'success',
                })
                room.gag = gag
            }
        })
    },

    //进群验证
    setValidate(room, valid){
        let data = {
            isNeedVerify: (valid ? 1 : 0),
            roomId: room.id
        }
    },

    //设置显示群员
    setShowMember(room, show){
        let data = {
            showMember: (show ? 1 : 0),
            roomId: room.id
        }
    },

    //设置私聊
    setAllowSendCard(room, allow) {
        let data = {
            allowSendCard: (allow ? 1 : 0),
            roomId: room.id
        }
        // "已允许普通群成员私聊 !" : "已禁止普通群成员私聊 !"
    },

    //设置允许邀请好友
    setAllowInvite(room, allow){
        let data = {
            allowInviteFriend: (allow ? 1 : 0),
            roomId: room.id
        }
    //    "已允许群成员邀请好友 !" : "已禁止群成员邀请好友!"
    },

    //允许群员上传文件
    setAllowUploadFile(room, allow){
        let data = {
            allowUploadFile: (allow ? 1 : 0),
            roomId: room.id
        }
        //    "已允许群成员上传共享文件 !" : "已禁止群成员上传共享文件!"
    },

}
