import {setUserInfo, getUserInfo, removeAll, getToken, setToken} from '@/utils/auth'

import {ServeLogout} from '@/api/user'
import {initData} from "@/api/login";
import {imUtils} from "@/utils/my/imUtils";
import {appUtils} from "@/utils/my/appUtils";
import createPersistedState from 'vuex-persistedstate'


let state = {
    isPc: appUtils.isPc(),
    // 用户ID
    userId: 0,
    // 用户昵称
    nickname: '',
    // 性别
    sex: 0,
    // 个性签名
    signature: '',
    // 个性头像
    avatar: require('@/assets/image/detault-avatar.jpg'),
    // 名片背景
    visitCardBag: require('@/assets/image/default-user-banner.png'),
    // 当前登录状态
    loginStatus: false,
    httpKey: '',
    account: '',
    password: '',
    platform: 'web',
    isInit: false,
    payPassword: null,
    access_token: null,
    userInfo: {
        userId: '',
        nickname: '',
        sex: '',
        avatar: '',
    }
}

// 判断用户是否登录
// if (getToken()) {
// let userInfo = getUserInfo()
// state.userInfo = userInfo
// state.userId = userInfo.userId
// state.nickname = userInfo.nickname
// state.signature = userInfo.signature
// state.avatar = imUtils.getAvatarUrl(userInfo.userId)
// state.loginStatus = true
// }

const User = {
    state,
    mutations: {
        clear_login(state) {
            state.account = '';
            state.loginStatus = false;
            state.isInit = false;
            state.userId = 0;
            setToken('')
        },
        // 设置用户登录状态
        UPDATE_LOGIN_STATUS(state) {
            state.loginStatus = true
        },
        // 更新用户信息
        UPDATE_USER_INFO(state, data) {
            for (const key in data) {
                if (state.hasOwnProperty(key)) {
                    state[key] = data[key]
                }
            }
            if (state.userId) {
                state.avatar = imUtils.getAvatarUrl(state.userId)
            }
            
            // 保存用户信息到缓存
            setUserInfo({
                userId: state.userId,
                nickname: state.nickname,
                signature: state.signature,
                avatar: state.avatar,
            })
        },
        updateAvatar(state) {
            state.avatar = imUtils.getAvatarUrl(state.userId)
        },
        // 设置用户登录状态
        init_data(state) {
            console.log('初始化数据......')
            initData()
        },
        freshAvatar(state, data) {
            state.avatar = imUtils.getAvatarUrl(state.userId)
        }
    },
    actions: {
        // 退出登录处理操作
        ACT_USER_LOGOUT({commit}) {
            ServeLogout().finally(() => {
                removeAll()
                location.reload()
            })
        },
    },
    plugins:[createPersistedState()]
}

export default User
