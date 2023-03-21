import Vue from 'vue'
import {chatUtils} from "@/utils/my/chatUtils";
import {wrapUtils} from "@/utils/my/wrapUtils";
import {contactData} from "@/utils/data/contactData";
import {chatData} from "@/utils/data/chatData";
import {roomApi} from "@/api/group";

const Contact = {
    state: {
        friends: [],
        rooms: [],
    },
    getters: {
        friends: state => {
            return state.friends
        },
        rooms: state => {
            return state.rooms
        },
    },
    mutations: {
        // 设置对话列表
        contact_init(state, {friends, rooms}) {
            state.friends = wrapUtils.wrapFriends(friends);
            state.rooms = wrapUtils.wrapRooms(rooms);
        },
        //允许私聊
        setAllowSendCard(state, {chatId, allow}) {
            state.rooms.forEach(function (room) {
                if (room.chatId == chatId) {
                    room.allowSendCard = allow;
                }
            })
        },
        updateRoomAvatar(state, chatId){

        },
        addRoom(state, room) {
            state.rooms.pushAll(wrapUtils.wrapRooms(room));
        },
        add_friend(state, friend) {
            state.friends.pushAll(wrapUtils.wrapFriends(friend));
        },
        del_contact(state, chatId) {
            if (chatUtils.isGroupId(chatId)) {
                state.rooms.delByFields('chatId', chatId)
            } else {
                state.friends.delByFields('chatId', chatId)
            }
        },
        update_contact_remark(state, {chatId, name}){
            state.friends.forEach(item=>{
                if(item.chatId==chatId){
                    item.remark = name;
                }
            })
        },
        setRoomMember(state, {roomId, focus}) {
            //如果是群组， 查询成员信息
            let room = contactData.getRoomById(roomId)
            let members = room.members;

            console.log('设置成员信息--------')
            // console.log(members)

            if(!members || members.length==0 || focus){
                roomApi.listMembers({
                    roomId: room.id,
                }).then(res => {
                    if (res.resultCode == 1) {
                        let members = res.data;
                        if(members){
                            wrapUtils.wrapRoomMember(members);
                            room.members = members;
                        }
                    }
                })
            }
        },
        add_member(state, {roomId, members}) {
            if(!Array.isArray(members)){
                members = [members];
            }
            let data = state.rooms;
            for (let i = 0; i < data.length; i++) {
                if (data[i].id == roomId) {
                    data[i].members.pushAll(members);
                }
            }
        },
        del_members(state, {roomId, userIds}) {
            let data = state.rooms
            for (let i = 0; i < data.length; i++) {
                if (data[i].id == roomId) {
                    let members = data[i].members;
                    if(members) members.delByValues(userIds, 'userId');
                }
            }
        },
        update_talkTime(state, {chatId, talkTime}) {
            let data = state.rooms
            for (let i = 0; i < data.length; i++) {
                if(data[i].chatId==chatId){
                    data[i].talkTime = talkTime;
                }
            }
        },
        update_member_talkTime(state, {chatId, userId, talkTime}) {
            let data = state.rooms
            for (let i = 0; i < data.length; i++) {
                if(data[i].chatId==chatId){
                    let members = data[i].members;
                    if(members) members.forEach(function(member){
                        if(member.userId == userId){
                            member.talkTime = talkTime;
                        }
                    })
                }
            }
        },
        set_role(state, {roomId, userId, role, isSelf}) {
            let data = state.rooms;
            for (let i = 0; i < data.length; i++) {
                if(data[i].id==roomId){
                    let members = data[i].members;
                    if(members) members.forEach(function(member){
                        if(member.userId == userId){
                            member.role = role;
                        }

                    })
                    //如果成员是自己， 设置myrole
                    if(isSelf){
                        data[i].myRole = role;
                    }
                }
            }
        },
    },
}
export default Contact
