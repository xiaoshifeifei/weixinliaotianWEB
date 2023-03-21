import {post, get} from '@/utils/request'
import store from '@/store'
import {randomId} from "@/utils/utils";

export const roomApi = {

    // 创建群聊服务接口
    createRoom(name, ids) {
        let jid = randomId();
        let data = {
            jid: jid,
            name: name,
            desc: '群主很懒,什么都没留下.',
            isLook: 0,
            text: JSON.stringify(ids)
        };
        return post('/api/room/add', data)
    },

    getRoom(roomId) {
        return get('/api/room/getRoom', {roomId: roomId})
    },
    listMembers({roomId, keyword}) {
        return get('/api/room/member/list', {
            roomId: roomId,
            keyword: keyword
        })
    },

    // 移除群聊成员服务接口
    delMember(groupId, userIdArray, callback) {
        post('/api/room/member/delete', {
            roomId: groupId,
            userId: userIdArray[0]
        }).then(res => {
            if (userIdArray.length >= 2) {
                userIdArray.delByIndex(0)
                roomApi.delMember(groupId, userIdArray, callback);
            } else {
                callback();
            }
        })
    },
    //设置管理员, 3取消管理员， 2设置管理员
    setRole(roomId, userId, role){
        return post('/api/room/set/admin', {
            roomId: roomId,
            touserId: userId,
            type: role
        })
    },
    updateRoom(data) {
        return post('/api/room/update', data);
    },

    listRoom() {
        return get('/api/room/list/his', {
            pageIndex: 0,
            pageSize: 100,
            roomName: null
        })
    },

    invite(data) {
        return post('/api/room/member/update', data)
    },

    setTalkTime(roomId, userId, talkTime) {
        return post('/api/room/member/update', {
            roomId: roomId,
            userId: userId,
            talkTime: talkTime
        })
    },

    getMember(roomId, userId) {
        return post('/api/room/member/get', {
            roomId: roomId,
            userId: userId
        })
    },

    delGroup(chat) {
        let roomId = chat.id;
        let role = chat.myRole;
        if (role == 1) {
            return post('/api/room/delete', {roomId: roomId})
        } else {
            return post('/api/room/member/delete', {roomId: roomId, userId: store.state.user.userId})
        }
    },


    addNotice(roomId, content) {
        return post('/api/room/update', {
            roomId: roomId,
            notice: content
        })
    },

    listNotice(data) {
        return get('/api/room/noticesPage', data)
    },

}


//  编辑群公告
export const ServeEditGroupNotice = data => {
    return post('/api/v1/group/edit-notice', data)
}

// 管理员解散群聊服务接口
export const ServeDismissGroup = data => {
    return post('/api/v1/group/dismiss', data)
}

// 修改群聊名片服务接口
export const ServeUpdateGroupCard = data => {
    return post('/api/v1/group/set-group-card', data)
}

