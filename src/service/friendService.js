import {userApi} from "@/api/user";
import {Message} from "element-ui";
import {WEBIM} from "@/utils/old/webim";
import store from '@/store'
import {msgConst} from "@/utils/my/const/msgConst";
import {chatData} from "@/utils/data/chatData";
import {lastUtils} from "@/utils/my/lastChatUtils";
import {contactApi} from "@/api/contacts";
import {busService} from "@/service/busService";
import {eventConst} from "@/utils/my/const/eventConst";

export const friendService = {

    accept(userId){
        //判断时候已是好友
        userApi.get(userId).then(res=>{
            let user = res.data
            if (user.friends && 2 == user.friends.status) {
                Message.warning('已经是好友了.')
                return;
            }
            userApi.acceptFriend(userId).then(res=>{
                if (1 == res.resultCode) {

                    //获取好友，添加到列表中
                    userApi.getFriend(userId).then(res=>{
                        let friend = res.data;
                        store.commit('add_friend', friend)
                        console.log(friend)

                        //发送新关注 信息
                        let msg=WEBIM.createMessage(508, "", userId, user.nickname);
                        WEBIM.sendMessage(msg)
                        Message.success('添加好友成功.');

                        //创建一个新会话
                        lastUtils.newFriendChat(userId)
                        //
                        busService.emit(eventConst.friend.add, {userId: userId, direction: 0})
                    })
                }
            })
        })
    },
    delFriend(userId){
        return new Promise((resolve, reject)=>{
            contactApi.delFriend(userId).then(res => {
                if (res.resultCode == 1) {
                    //发送删除好友 信息
                    let msg=WEBIM.createMessage(msgConst.friend.del, "", userId);
                    WEBIM.sendMessage(msg);
                    //被删逻辑
                    friendService.beDel(userId, 0)
                    resolve(res);
                }else{
                    reject(res);
                }
            }).catch(res=>{
                reject(res);
            })
        })
    },
    requestFriend(userId, content){
        //发送请求消息
        let msg = WEBIM.createMessage(msgConst.friend.say_hello, content, userId, null);
        WEBIM.sendMessage(msg);
        //请求接口
        return userApi.requestFriend(userId)
    },
    //被删除了
    beDel(userId, direction){
        store.commit('del_contact', userId)
        store.commit('del_chat', userId)
        //删除chat
        chatData.delNew(userId);
        busService.emit(eventConst.friend.del, {userId: userId, direction: direction})
    },
    beAdd(userId){
        userApi.getFriend(userId).then(res=>{
            let friend = res.data
            store.commit('add_friend', friend)
            //创建一个新会话
            lastUtils.newFriendChat(userId)

            busService.emit(eventConst.friend.add, {userId: userId, direction: 1})
        })
    },
    //被申请加
    beApply(msg){
        busService.emit(eventConst.friend.apply, {userId: msg.fromUserId, direction: 1, msg: msg})
    }

}
