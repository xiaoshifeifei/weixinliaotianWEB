import {chatUtils} from "@/utils/my/chatUtils";
import store from '@/store'

export const contactData = {
    friends:[],
    rooms:[],

    getItem(chatId){
        let data = store.state.contact.friends
        if(chatUtils.isGroupId(chatId)){
            data = store.state.contact.rooms
        }else{
            if(chatId==store.state.user.userId){
                return store.state.user;
            }
        }
        for (let i = 0; i < data.length; i++) {
            if(data[i].chatId==chatId){
                return data[i];
            }
        }
    },

    getRoomById(roomId){
        let data = store.state.contact.rooms
        for (let i = 0; i < data.length; i++) {
            if(data[i].id==roomId){
                return data[i];
            }
        }
    },

    getRoomMembers(roomId){
        let data = store.state.contact.rooms
        for (let i = 0; i < data.length; i++) {
            if(data[i].id==roomId){
                return data[i].members;
            }
        }
    },

    getRoomMember(roomId, userId){
        let res = null;
        let data = store.state.contact.rooms
        for (let i = 0; i < data.length; i++) {
            if(data[i].id==roomId){
                let members = data[i].members
                if(members) members.forEach(function(member){
                    if(member.userId == userId){
                        res = member;
                    }
                })
            }
        }
        return res;
    }
}
