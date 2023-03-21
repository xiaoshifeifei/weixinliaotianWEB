import {AppConfig} from "@/utils/old/appconfig";
import {chatUtils} from "@/utils/my/chatUtils";
import store from '@/store'
import {localCache} from "@/utils/data/localData";

export const imUtils = {
    getAvatarUrl(chatId) {
        if(chatUtils.isGroupId(chatId)){
            return getGroupAvatarUrl(chatId)
        }
        if(10000==chatId)
            return "img/im_10000.png";
        let imgUrl = AppConfig.avatarBase + (parseInt(chatId) % 10000) + "/" + chatId + ".jpg";
        imgUrl += "?x="+getVersion(chatId);
        return imgUrl;
    },
    userId(){
        return store.state.user.userId;
    },
    refreshVersion(chatId){
        let key = 'img-v-' + chatId
        let version = getVersion(chatId)
        version ++;
        localCache.set(key, version);
    }
}

function getVersion(chatId) {
    let key = 'img-v-' + chatId
    let version = localCache.get(key);
    if(version){
        version = parseInt(version)
    }else{
        version = 0;
    }
    return version;
}


function getGroupAvatarUrl(userId, refresh) {
    if (!userId) {
        return
    }
    let hash = 0, i, chr, len;
    if (userId.length === 0) return '/img/group_avatar.png';
    for (i = 0, len = userId.length; i < len; i++) {
        chr = userId.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    let path1 = hash % 10000 < 0 ? -hash % 10000 : hash % 10000;
    let path2 = hash % 10000 < 0 ? -hash % 20000 : hash % 20000;

    let imgUrl = AppConfig.avatarBase + "" + path1 + "/" + path2 + "/" + userId + ".jpg";
    imgUrl += "?x=" + getVersion(userId, refresh);
    return imgUrl;
}

// export const chatUtils = {
//
//     current: {
//         isGroup(){
//             return ConversationManager.chatType==2
//         },
//         isManager(){
//             if(this.isGroup()){
//                 return 3 != GroupManager.roomData.member.role
//             }
//             return true
//         },
//         isAllGag(){
//             //全局和个人
//             if(this.isGroup()){
//                 if(this.isManager()){
//                     return false
//                 }
//                 return 0 < GroupManager.roomData.talkTime
//             }
//             return false
//         },
//         isMemberGag(){
//             if(this.isGroup()){
//                 let member = DataUtils.getCurrentMember()
//                 return (getCurrentSeconds() < member.talkTime || member.talkTime==-1)
//             }
//             return false
//         },
//     },
//
//     getChecked(dom){
//         let values = []
//         let checkeds = $(dom).parents('.main-model').find('input:checked:visible')
//         checkeds.each(function (index, item) {
//             values.push($(item).val())
//         })
//         return values;
//     },
//
//     getCheckedLable(dom){
//         let values = []
//         let checkeds = $(dom).parents('.main-model').find('input:checked:visible')
//         checkeds.each(function (index, item) {
//             let text = $(item).parents('tr').find('.check-title').text()
//             console.log(text)
//             values.push(text)
//         })
//         return values;
//     },
//
//     copy(data){
//         return JSON.parse(JSON.stringify(data))
//     },
//     //自己的消息
//     isSelf(msg){
//         return msg.fromUserId==store.state.user.userId
//     },
//     //发送的消息
//     isSend(msg){
//         return utils.isSelf(msg)
//     },
//     //接收的消息
//     isReceive(msg){
//         return !(utils.isSend(msg))
//     },
//     isGroup(msg){
//         return msg.chatType==2
//     },
//     isChat(msg){
//         return msg.chatType==1
//     },
//     isCurrent(chatId){
//         return ConversationManager.fromUserId==chatId
//     },
//     isCurrentChatMsg(msg){
//         return utils.getChatId(msg) == ConversationManager.fromUserId
//     },
//     getChatId(msg){
//         let isSelf = utils.isSelf(msg);
//         let groupMsg = utils.isGroup(msg);
//         let roomJid = msg.roomJid
//         if(roomJid){
//             return roomJid
//         }
//         let chatId = ''
//         if(groupMsg){
//             if(msg.from){
//                 chatId = msg.from
//                 chatId = WEBIM.getUserIdFromJid(chatId)
//             }
//             if(!chatId || !WEBIM.isGroup(chatId)){
//                 chatId = msg.to
//                 chatId = WEBIM.getUserIdFromJid(chatId)
//             }
//         }else{
//             //非自己则是回话Id
//             if(msg.from){
//                 chatId = msg.from
//                 chatId = WEBIM.getUserIdFromJid(chatId)
//             }
//             if(!chatId || store.state.user.userId == chatId){
//                 chatId = msg.to
//                 chatId = WEBIM.getUserIdFromJid(chatId)
//             }
//         }
//         return chatId;
//     },
//     isLog(msg){
//         return WEBIM.isGroupChat(ConversationManager.chatType) && msg.type > 400 &&
//             (MessageType.group.add_member != msg.type || msg.fromUserId != WEBIM.userId || msg.toUserId != WEBIM.userId)
//     }
//
// }
