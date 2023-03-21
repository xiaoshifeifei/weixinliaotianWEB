<template>
  <el-container class="container">
    <el-header class="header">
      <span>群信息</span>
      <el-tooltip content="发送消息" placement="top">
        <i class="icon-send el-icon-chat-line-square" @click="sendGroup" />
      </el-tooltip>
      <i class="el-icon-close" @click="$emit('close')" />
    </el-header>
    <el-main class="main lum-scrollbar">
      <div class="list-item flex">
        <p>
          <span>群名称：</span>
          <span class="group-setting-title">{{ room.nickname }}</span>
        </p>
        <span v-show="room.myRole != 3" class="more" @click="isShowManager = true">管理
        </span>
      </div>

      <div class="list-item">
        <span>群主：</span>
        <span class="group-boss-name">{{ room.createrNickName }}</span>
      </div>

      <div class="list-item">
        <span>我的群昵称：{{ room.myNickName }}</span>
      </div>

      <!-- 预留 -->
      <div class="list-item flex" v-if="room.myRole != 3">
        <span>全员禁言：</span>
        <el-switch v-model="room.gag" inactive-color="#e0d6d6" @change="editGag" />
      </div>

      <div class="list-item">
        <span>群成员：</span>
        <span>{{ room.userSize }} 人</span>
      </div>

      <div class="list-item-tips">群主已开启“新成员入群可查看所有聊天记录”</div>

      <div class="list-item">群简介</div>

      <div class="list-item-tips">
        {{ room.groupProfile ? room.groupProfile : '暂无群简介' }}
      </div>

      <div class="list-item flex">
        <span>群公告</span>
        <span v-show="room.group_notice" class="more" @click="isShowGroupNotice = true">更多
        </span>
      </div>

      <div class="list-item-tips group-notice">
        <span v-if="room.group_notice || gText">
          <b>#{{ room.group_notice || gText }}#</b>
          <br />
          <!-- {{ room.group_notice || gText}} -->
        </span>
        <span v-else>暂无群公告</span>
      </div>

      <div class="list-item" v-if="room.myRole != 3">
        <p class="group-invite" @click="addGroupMembers">
          <i class="el-icon-plus" />
          <span>&nbsp;邀请好友</span>
        </p>
      </div>

      <div class="list-item">
        <div class="member-box">
          <div class="view-box">
            <i class="iconfont icon-sousuo i-sousuo" />
            <input type="text" placeholder="搜索群成员" v-model="keywords" />
          </div>

          <el-row class="row-header">
            <el-col :span="11">昵称</el-col>
            <el-col :span="8">名片</el-col>
            <el-col :span="5">性别</el-col>
          </el-row>

          <template v-if="search.length == 0">
            <el-row class="row-items">
              <el-col :span="24">
                <p style="text-align:center;">无数据</p>
              </el-col>
            </el-row>
          </template>
          <template v-else>
            <el-row v-for="member in search" :key="member.userId" class="row-items"
              @click.native="openUserDetail(member.userId)">
              <el-col :span="11">
                <img :src="member.avatar" width="20px" height="20px" :onerror="$store.state.detaultAvatar" />
                <span class="nickname max-length" :title="member.remark ? member.remark : member.nickname">
                  {{ member.remark ? member.remark : member.nickname }}
                </span>
              </el-col>
              <el-col :span="8">
                <span>{{ member.visit_card ? member.visit_card : '-' }}</span>
              </el-col>
              <el-col :span="5">
                <span v-if="member.sex == 1">男</span>
                <span v-else-if="member.sex == 2">女</span>
                <span v-else>未知</span>
              </el-col>
            </el-row>
          </template>
        </div>
      </div>
    </el-main>

    <el-footer class="footer">
      <button @click="isShowSignout = true">退出该群聊</button>
    </el-footer>

    <!-- 退群提示层 -->
    <div class="signout-box no-select" v-show="isShowSignout">
      <p v-show="signoutStatus == 0">您确认退出当前群聊吗？</p>
      <p v-show="signoutStatus == 0">退群后群聊信息将不能查看</p>
      <p v-show="signoutStatus == 0" class="signout-btn">
        <button @click="signout">确认</button>
        <button @click="isShowSignout = false">取消</button>
      </p>

      <p v-show="signoutStatus == 1" class="signout-btn mt38">
        <span style="color: #ccc">
          <i class="el-icon-loading" />
          正在退出群聊...
        </span>
      </p>

      <p v-show="signoutStatus == 2" class="signout-btn mt38">
        <span style="color: #cccccc">退出群聊失败，请3(s)后再试...</span>
      </p>

      <p v-show="signoutStatus == 3" class="signout-btn mt38">
        <span style="color: #339e19">
          <i class="iconfont icon-success_no_circle" /> 已成功退出群聊...
        </span>
      </p>
    </div>

    <!-- 查看好友用户信息 -->
    <UserBusinessCard ref="userBusinessCard" />

    <!-- 邀请好友组件 -->
    <transition name="el-fade-in-linear">
      <GroupLaunch v-if="inviteFriendBox" :room-id="roomId" @close="inviteFriendBox = false"
        @invite-success="inviteSuccess" />
    </transition>

    <!-- 群管理组件 -->
    <transition name="el-fade-in-linear">
      <GroupManage v-if="isShowManager" :room-id="roomId" @close="isShowManager = false" />
    </transition>

    <!-- 群公告组件 -->
    <transition name="el-fade-in-linear">
      <GroupNotice v-if="isShowGroupNotice" :group-id="roomId" @close="isShowGroupNotice = false" />
    </transition>
  </el-container>
</template>
<script>
import {
  ServeUpdateGroupCard, roomApi,
} from '@/api/group'

//创建群聊组件
import GroupLaunch from '@/components/group/GroupLaunch'
import UserBusinessCard from '@/components/user/UserBusinessCard'
import GroupManage from '@/components/group/GroupManage'
import GroupNotice from '@/components/group/GroupNotice'
import { contactData } from "@/utils/data/contactData";
import { chatData } from "@/utils/data/chatData";
import { roomService } from "@/service/roomService";
import { wrapUtils } from "@/utils/my/wrapUtils";
import { AppConfig } from "@/utils/old/appconfig";
// console.log(AppConfig.downloadAvatarUrl);
export default {
  name: 'GroupPanel',
  components: {
    GroupLaunch,
    UserBusinessCard,
    GroupManage,
    GroupNotice,
  },
  props: {
    roomId: {
      type: [String, Number],
      default: null,
    },
    chatId: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      keywords: '',
      isEditRemark: false,
      editRemarkText: '',
      inviteFriendBox: false,
      isShowSignout: false,
      signoutStatus: 0,
      disturbDisabled: false,
      // 是否显示群管理窗口
      isShowManager: false,
      // 是否显示群公告窗口
      isShowGroupNotice: false,
      gText: "",
    }
  },
  created() {
    roomApi.listNotice({
      roomId: this.roomId,
      pageIndex: 0,
      pageSize: 10
    }).then(res => {
      if (res.resultCode == 1) {
        if (res.data.pageData.length) {
          this.gText = res.data.pageData[0].text
          this.$nextTick(() => {
            this.gText = res.data.pageData[0].text
          })
        } else {
          this.$nextTick(() => {
            this.gText = ""
          })
        }
      }
    })
  },
  computed: {
    room() {
      // console.log('room元数据',contactData.getRoomById(this.roomId));
      if (this.roomId) {
        return contactData.getRoomById(this.roomId);
      }
      return {};
    },
    members() {
      function handleAvatar(members) {
        members.map((item) => {
          let userId = item.userId;
          item.avatar = AppConfig.downloadAvatarUrl + "avatar/o/" + String(userId).split('1000')[1] + "/" + userId + ".jpg?x=0"
          return item;
        })
        return members;
      }
      if (this.room) return handleAvatar(this.room.members);
      return [];
    },
    search() {
      // console.log('members', this.members);
      if (this.members) {
        let res = this.keywords == '' ? this.members : this.members.filter(item => {
          return (item.nickname.match(this.keywords) != null)
        })
        res.forEach(item => {
          let userId = item.userId;
          let friend = contactData.getItem(userId)
          // console.log(friend)
          if (friend) item.remark = friend.nickname;
        })
        // console.log("搜索群成员列表", res);
        return res;
      }
      return [];
    },
  },
  watch: {
    room(params) {
      roomApi.listNotice({
        roomId: this.roomId,
        pageIndex: 0,
        pageSize: 10
      }).then(res => {
        if (res.resultCode == 1) {
          if (res.data.pageData.length) {
            this.gText = res.data.pageData[0].text
            this.$nextTick(() => {
              this.gText = res.data.pageData[0].text
            })
          } else {
            this.$nextTick(() => {
              this.gText = ""
            })
          }
        }
      })
    }
  },
  methods: {
    // 设置群免打扰状态
    editDisturb(value) {
      roomService.setDisturb(this.room.chatId, value)
    },
    editGag(value) {
      roomService.gag(this.room, value)
    },
    // 设置用户群名片
    editRemark() {
      if (this.editRemarkText == '') {
        this.isEditRemark = false
        return
      }

      if (this.room.visitCard == this.editRemarkText) {
        this.isEditRemark = false
        return
      }

      ServeUpdateGroupCard({
        roomId: this.roomId,
        visit_card: this.editRemarkText,
      }).then(res => {
        if (res.resultCode == 1) {
          this.isEditRemark = false
          this.room.visitCard = this.editRemarkText
        }
      })
    },

    // 查看用户信息
    openUserDetail(userId) {
      this.$refs.userBusinessCard.open(userId)
    },

    // 邀请好友加入群聊
    addGroupMembers() {
      sessionStorage.setItem('invite_roomId', this.room.id)
      this.inviteFriendBox = true
    },

    // 邀请好友成功之后的回调事件
    inviteSuccess() {
      this.inviteFriendBox = false
      this.$notify({
        title: '邀请成功',
        message: `好友已成功加入群组...`,
        type: 'success',
      })
    },

    // 发送群聊
    sendGroup() {
      // this.$emit('send-group', this.roomId)
      this.$emit('send-group', this.chatId)
    },

    // 退出群操操作
    signout() {
      this.signoutStatus = 1
      roomService.delRoom(this.room.chatId)
        .then(res => {
          this.signoutStatus = 3
          setTimeout(() => {
            this.signoutStatus = 0
            this.isShowSignout = false
            this.$emit('quit-group')
          }, 1500)
        })
        .catch(() => {
          this.signoutStatus = 2
          setTimeout(() => {
            this.signoutStatus = 0
          }, 3000)
        })
    },
  },
}
</script>
<style lang="less" scoped>
.container {
  height: 100%;

  .header {
    height: 60px;
    line-height: 60px;
    padding: 0;
    text-align: center;
    box-shadow: -1px 0px 5px 0px #cccccc45;
    position: relative;

    span {
      font-size: 16px;
      font-weight: 400;
    }

    .icon-send {
      position: absolute;
      left: 15px;
      top: 22px;
      font-size: 18px;
      cursor: pointer;
    }

    .el-icon-close {
      position: absolute;
      right: 15px;
      top: 22px;
      font-size: 18px;
      cursor: pointer;
    }
  }

  .main {
    padding: 0;
  }
}

.list-item {
  position: relative;
  padding: 16px 16px 0;
  min-height: 18px;
  font-size: 14px;

  &.flex {
    display: flex;
    justify-content: space-between;
  }

  .edit-visit-card {
    position: initial;
    color: #a29f9f;
  }

  list-item .edit-remark-icon {
    margin-left: 5px;
    color: rgb(169, 184, 187);
    position: absolute;
    top: 20px;
    cursor: pointer;
  }

  .edit-input {
    width: 46%;
    height: 25px;
    line-height: 25px;
    border: 1px solid #92cbff;
    padding-left: 5px;
    border-radius: 3px;
  }

  .input-submit {
    width: 55px;
    text-align: center;
    height: 25px;
    line-height: 25px;
    background-color: #008cee;
    border-radius: 2px;
    display: inline-block;
    color: #fff !important;
    font-size: 12px;
    margin-left: 10px;
    cursor: pointer;
  }

  .group-setting-title {
    max-width: 200px;
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    vertical-align: bottom;
  }

  .group-boss-name {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-wrap: normal;
    max-width: 180px;
    position: relative;
    top: 4px;
  }

  .group-invite {
    height: 30px;
    line-height: 30px;
    text-align: center;
    color: #877272;
    cursor: pointer;
    border-radius: 2px;
    border: 1px dashed #d9bbbb;
    font-size: 13px;
    transition: all 0.5s ease-in-out;

    &:hover {
      color: #ff5722;
      border-color: #ff5722;
      transform: scale(1.01);
    }
  }

  .more {
    color: #409eff;
    cursor: pointer;
    font-size: 12px;
  }
}

.list-item-tips {
  font-size: 12px;
  color: #b1b1b1;
  margin-top: 5px;
  padding-left: 16px;
  padding-right: 16px;
  font-weight: 300;
  overflow: hidden;
  word-break: break-word;
}

.group-notice {
  line-height: 22px;
}

.member-box {
  min-height: 180px;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ecebeb;
  border-radius: 3px;

  .view-box {
    width: 100%;
    height: 30px;
    margin-top: 20px;
    margin-bottom: 15px;
    position: relative;

    input {
      width: calc(100% - 40px);
      height: 30px;
      line-height: 28px;
      border-radius: 3px;
      border: 1px solid #f1e9e9;
      color: #b3b0b0;
      font-size: 13px;
      padding: 0 10px 0 30px;

      &::-webkit-input-placeholder {
        color: #ccc9c9;
        font-size: 13px;
      }
    }

    .i-sousuo {
      color: rgb(179, 176, 176);
      position: absolute;
      left: 10px;
      top: 9px;
    }

    span {
      position: relative;

      i {
        font-size: 24px;
        top: -3px;
        left: 10px;
        position: absolute;
        color: #ccc;
      }
    }
  }

  .row-header {
    width: 100%;
    height: 30px;
    margin-bottom: 10px;
    border-bottom: 1px solid #e0dddd;

    div {
      height: 30px;
      line-height: 30px;

      &:nth-child(2) {
        text-align: center;
      }

      &:nth-child(3) {
        text-align: right;
      }
    }
  }

  .row-items {
    width: 100%;
    height: 30px;
    margin-bottom: 3px;
    font-size: 12px;
    cursor: pointer;

    &:hover {
      background: #f6f6f6;
    }

    div {
      height: 30px;
      line-height: 30px;

      &:nth-child(2) {
        text-align: center;
      }

      &:nth-child(3) {
        text-align: right;
      }
    }

    img {
      width: 20px;
      height: 20px;
      display: inline-block;
      border-radius: 50%;
      position: relative;
      bottom: 5px;
    }

    .nickname {
      width: 100px;
      margin-left: 5px;

      &:hover {
        color: #3685d6;
      }
    }
  }
}

.signout-box {
  width: 100%;
  height: 100px;
  background: #ffffff;
  position: absolute;
  z-index: 2;
  bottom: 0;
  box-shadow: -1px -3px 11px 0px #cccccc82;
  -webkit-animation: showFooter 0.35s ease-in-out;
  -moz-animation: showFooter 0.35s ease-in-out;
  animation: showFooter 0.35s ease-in-out;

  p {
    &:first-child {
      text-align: center;
      height: 35px;
      line-height: 35px;
    }

    &:nth-child(2) {
      text-align: center;
      font-size: 12px;
      color: #cccccc;
    }
  }

  .mt38 {
    margin-top: 38px;
  }
}

.signout-btn {
  text-align: center;
  margin-top: 10px;

  button {
    height: 30px;
    width: 90px;
    line-height: 30px;
    background: #007fbb;
    border-radius: 3px;
    cursor: pointer;
    font-size: 14px;

    &:first-child {
      background: #ff3333;
      color: white;
    }

    &:last-child {
      background: #f1eded;
    }
  }
}

.container .footer {
  height: 60px;
  padding: 0;
  line-height: 60px;
  text-align: center;
  background-color: #f8f8f8;

  button {
    width: 180px;
    height: 35px;
    line-height: 35px;
    background: #ed3c3b;
    border-radius: 3px;
    color: white;
    cursor: pointer;
    font-size: 12px;
    margin: auto auto;

    &:active {
      background: #f5b8b8;
    }
  }
}

@keyframes showFooter {
  0% {
    transform: translateY(75px);
  }

  to {
    transform: translateY(0);
  }
}

@-webkit-keyframes showFooter {
  0% {
    -webkit-transform: translateY(75px);
  }

  to {
    -webkit-transform: translateY(0);
  }
}
</style>
