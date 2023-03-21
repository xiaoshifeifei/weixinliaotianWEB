import { post, get } from '@/utils/request'
import store from '@/store'
import {chatUtils} from "@/utils/my/chatUtils";


// 获取好友列表服务接口
//    "blacklist": 0,
//     "chatRecordTimeOut": -1,
//     "createTime": 1618499235,
//     "dhMsgPublicKey": "",
//     "encryptType": 0,
//     "fromAddType": 4,
//     "isBeenBlack": 0,
//     "isOpenSnapchat": 0,
//     "lastTalkTime": 0,
//     "modifyTime": 0,
//     "msgNum": 0,
//     "offlineNoPushMsg": 0,
//     "openTopChatTime": 0,
//     "rsaMsgPublicKey": "",
//     "status": 2,
//     "toFriendsRole": [],
//     "toNickname": "jiangm",
//     "toUserId": 10005474,
//     "toUserType": 0,
//     "userId": 10000071


export const friendApi = {

  updateRemark(userId, remark){
    return post('/api/friends/remark', {
      toUserId: userId,
      remarkName: remark,
    })
  },
  getContact(id) {
    //非数字， 群组
    if(isNaN(id)){
      return get('/room/get', {
        roomId : id
      });
    }else{
      return get('/friends/get', {
        toUserId : id
      });
    }
  },

}


// 修改好友备注服务接口
export const ServeEditContactRemark = data => {

}


export const ServeGetContacts = data => {
  return get('/api/friends/page', {
    userId : store.state.user.userId,
    pageIndex : 0,
    status:2,
    pageSize : 5000
  })
}

// 搜索联系人
export const ServeSearchContact = (nickname) => {
  return get('/api/nearby/nearbyUserWeb', {
    pageIndex: 0,
    pageSize: 10,
    nickname: nickname
  })
}

// 解除好友关系服务接口
export const httpFriendDel = data => {
  return post('/api/friends/delete', data)
}

export const contactApi = {
  //申请列表
  listApply:(data)=>{
    return get('/api/friends/newFriendListWeb', {
      userId : store.state.user.userId,
      pageIndex : 0,
      pageSize : 500
    })
  },

  delFriend(userId){
    return post('/api/friends/delete', {
      toUserId: userId
    })
  },

}




// 好友申请服务接口
export const ServeCreateContact = data => {
  return post('/api/v1/contacts/add', data)
}


// // 查询好友申请未读数量服务接口
// export const ServeFindFriendApplyNum = () => {
//   return get('/api/v1/contacts/apply-unread-num')
// }


// 处理好友申请服务接口
export const ServeHandleFriendApply = data => {
  return post('/api/v1/contacts/accept-invitation', data)
}

// 删除好友申请记录服务接口
export const httpFriendDelApply = data => {
  return post('/api/v1/contacts/delete-apply', data)
}
