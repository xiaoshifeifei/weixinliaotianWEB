<template>
  <el-header id="panel-header">
    <!---->

    <div class="module left-module">
      <span class="icon-badge" :class="{ 'red-color': !isGroup }">
        {{ !isGroup ? '好友' : '群组' }}
      </span>
      <span class="nickname max-length" :title="chat.nickname">{{ chat.nickname }}</span>

      <span v-show="isGroup" class="num">({{ roomMemberSize }})</span>
    </div>

    <div class="module center-module drag" style="max-width: 100%;flex-direction: column">
      <p v-show="!isGroup" class="online">
        <span v-show="onlineMsg" class="online-status"></span>
        <span>{{ onlineMsg ? (onlineMsg + '在线') : '离线' }}</span>
      </p>
      <span style="color: #ccc;font-size: 10px;font-weight: 300" v-show="!isGroup">({{ userInfo.ip }})</span>

      <!--<p class="keyboard-status" v-show="isKeyboard">对方正在输入 ...</p>-->
    </div>

    <div class="module right-module">
      <!--<el-tooltip content="历史消息" placement="top">-->
      <!--<p>-->
      <!--<i class="el-icon-time" @click="triggerEvent('history')" />-->
      <!--</p>-->
      <!--</el-tooltip>-->
      <el-tooltip content="群公告" placement="top">
        <p v-show="isGroup">
          <i class="iconfont icon-gonggao2" @click="triggerEvent('notice')" />
        </p>
      </el-tooltip>
      <el-tooltip content="群设置" placement="top">
        <p v-show="isGroup">
          <i class="el-icon-setting" @click="triggerEvent('setting')" />
        </p>
      </el-tooltip>

      <!--<el-tooltip content="断线重连测试" placement="top">-->
      <!--<i class="el-icon-setting" @click="testReconnect()" />-->
      <!--</el-tooltip>-->
    </div>
  </el-header>
</template>
<script>
import { chatUtils } from "@/utils/my/chatUtils";
import { userApi } from "@/api/user";
import { contactData } from "@/utils/data/contactData";
import { busService } from "@/service/busService";
import { eventConst } from "@/utils/my/const/eventConst";
import { WEBIM } from "@/utils/old/webim";
import { wrapUtils } from "@/utils/my/wrapUtils";

export default {
  props: {
    data: {
      type: Object,
      default: () => {
        return {
          chatId: null,
          nickname: '',
        }
      },
    },
    keyboard: {
      type: [Boolean, Number],
      default: false,
    },
  },
  data() {
    return {
      onlineMsg: '',
      isKeyboard: false,
      userInfo: {}
    }
  },
  created() {
    let that = this
    this.setOnlineStatus(this.online)
    this.setUserInfo();
    this.refreshDevice();
  },
  watch: {
    online(value) {
      this.setOnlineStatus(value)
    },

    keyboard(value) {
      this.isKeyboard = value
      setTimeout(() => {
        this.isKeyboard = false
      }, 2000)
    },

    chatId(val) {
      this.setUserInfo();
      this.refreshDevice();
    }

  },
  computed: {
    isGroup() {
      return chatUtils.isGroupId(this.chatId)
    },
    chatId() {
      return this.$store.state.dialogue.chatId;
    },
    chat() {
      if (this.chatId) return contactData.getItem(this.chatId);
      return {};
    },
    roomMemberSize() {
      if (this.chatId && this.isGroup) {
        let room = contactData.getItem(this.chatId);
        if (room) {
          let members = room.members
          return members ? members.length : 0;
        }
      }
    }
  },
  methods: {
    refreshDevice() {
      //不是群组， 查询在线信息
      if (this.chatId && !this.isGroup) {
        userApi.getOnLineDevice(this.chatId).then(res => {
          if (res.resultCode == 1) {
            if (res.data) this.onlineMsg = `(${res.data})`
            else { this.onlineMsg = `` }
          }
        })
      }
    },
    setUserInfo() {
      if (!this.isGroup) {
        userApi.get(this.chatId).then(res => {
          if (res.resultCode == 1) {
            let data = res.data
            wrapUtils.wrapUser(data);
            this.userInfo = data
          }
        })
      }
    },
    testReconnect() {
      WEBIM.disconnect()
    },
    setOnlineStatus(value) {
      this.isOnline = value
    },
    triggerEvent(event_name) {
      this.$emit('event', event_name)
    },
  },
}
</script>
<style lang="less" scoped>
#panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  border-bottom: 1px solid #f5eeee;

  .module {
    max-width: 100%/3;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .left-module {
    padding-right: 5px;

    .icon-badge {
      background: rgb(81 139 254);
      height: 18px;
      line-height: 18px;
      padding: 1px 3px;
      font-size: 10px;
      color: white;
      border-radius: 3px;
      margin-right: 8px;
      flex-shrink: 0;

      &.red-color {
        background: #f97348;
      }
    }

    .nickname {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  .center-module {
    flex-direction: row;
    flex-grow: 1;
    justify-content: center;

    .online {
      color: #cccccc;
      font-weight: 300;
      font-size: 15px;

      &.color {
        color: #1890ff;
      }

      .online-status {
        position: relative;
        top: -1px;
        display: inline-block;
        width: 6px;
        height: 6px;
        vertical-align: middle;
        border-radius: 50%;
        position: relative;
        background-color: #1890ff;
        margin-right: 5px;

        &:after {
          position: absolute;
          top: -1px;
          left: -1px;
          width: 100%;
          height: 100%;
          border: 1px solid #1890ff;
          border-radius: 50%;
          -webkit-animation: antStatusProcessing 1.2s ease-in-out infinite;
          animation: antStatusProcessing 1.2s ease-in-out infinite;
          content: '';
        }
      }
    }

    .keyboard-status {
      height: 20px;
      line-height: 18px;
      font-size: 10px;
      animation: inputfade 600ms infinite;
      -webkit-animation: inputfade 600ms infinite;
    }
  }

  .right-module {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: 70px;

    p {
      cursor: pointer;
      margin: 0 8px;
      font-size: 20px;
      color: #828f95;

      &:active i {
        font-size: 26px;
        transform: scale(1.3);
        transition: ease 0.5s;
        color: red;
      }
    }
  }
}

/* css 动画 */
@keyframes inputfade {
  from {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  to {
    opacity: 1;
  }
}

@-webkit-keyframes inputfade {
  from {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  to {
    opacity: 1;
  }
}

@-webkit-keyframes antStatusProcessing {
  0% {
    -webkit-transform: scale(0.8);
    transform: scale(0.8);
    opacity: 0.5;
  }

  to {
    -webkit-transform: scale(2.4);
    transform: scale(2.4);
    opacity: 0;
  }
}

@keyframes antStatusProcessing {
  0% {
    -webkit-transform: scale(0.8);
    transform: scale(0.8);
    opacity: 0.5;
  }

  to {
    -webkit-transform: scale(2.4);
    transform: scale(2.4);
    opacity: 0;
  }
}
</style>
