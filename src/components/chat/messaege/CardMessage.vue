<template>
  <div class="file-message">
    <div class="main" @click="showUserInfo">
      <div class="ext avatar-box">
        <img :src="$root.getAvatar(msg.objectId)" :onerror="$store.state.detaultAvatar"/>
      </div>
      <div class="file-box">
        <p class="info">
          <span class="name max-length">{{ msg.content }}</span>
        </p>
        <p class="notice">点击查看联系人信息</p>
      </div>
    </div>

    <!-- 查看用户组件 -->
    <UserBusinessCard ref="userBusinessCard" />

  </div>
</template>
<script>
import UserBusinessCard from "@/components/user/UserBusinessCard";
export default {
  name: 'CardMessage',
  components: {UserBusinessCard},
  props: {
    msg: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {

    }
  },
  created() {
  },
  methods: {
    showUserInfo(){
      this.$refs.userBusinessCard.open(this.msg.objectId);
    },
  },
}
</script>
<style lang="less" scoped>

  .avatar-box {
    width: 80px;
    height: 80px;
    background-color: white;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      height: 40px;
      width: 40px;
      border-radius: 50%;
    }
  }

.file-message {
  width: 250px;
  height: 60px;
  background: white;
  box-shadow: 0 0 5px 0px #e8e4e4;
  padding: 10px;
  border-radius: 3px;
  transition: all 0.5s;

  &:hover {
    box-shadow: 0 0 5px 0px #cac6c6;
  }

  .main {
    height: 45px;
    display: flex;
    flex-direction: row;

    .ext {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 45px;
      height: 45px;
      flex-shrink: 0;
      color: #ffffff;
      border-radius: 5px;
      font-size: 12px;
    }

    .file-box {
      flex: 1 1;
      height: 45px;
      margin-left: 10px;
      overflow: hidden;

      .info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        overflow: hidden;
        height: 24px;
        color: rgb(76, 76, 76);
        font-size: 14px;

        .name {
          flex: 1 auto;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 170px;
        }

        .size {
          font-size: 12px;
          color: #cac6c6;
        }
      }

      .notice {
        height: 25px;
        line-height: 25px;
        font-size: 12px;
        color: #929191;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .footer {
    height: 30px;
    line-height: 37px;
    color: #409eff;
    text-align: right;
    font-size: 12px;
    border-top: 1px solid #eff7ef;
    margin-top: 10px;

    a {
      margin: 0 3px;
      user-select: none;
      cursor: pointer;

      &:hover {
        color: royalblue;
      }
    }
  }
}
</style>
