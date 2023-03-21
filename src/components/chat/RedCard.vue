<template>
  <div v-show="visible" class="lum-dialog-mask animated fadeIn red">
    <el-container class="container" v-outside="close">
      <el-header class="no-padding header" height="80px">
        <i class="close el-icon-error pointer" @click="close" />
        <div class="img-banner"></div>
        <div class="user-header">
          <div class="avatar">
            <div class="avatar-box">
              <img :src="$root.getAvatar(redPacket.userId)" :onerror="$store.state.detaultAvatar"/>
            </div>
          </div>
        </div>
      </el-header>

      <el-main style="padding: 0px">
        <div class="red-my">

          <div class="line-item tt"> {{redPacket.userName}}的红包</div>

          <div class="line-item"> {{redPacket.greetings}}</div>

          <div class="line-item money"> {{myMoney}}</div>
        </div>

        <div class="red-info-total">
          已领取{{redPacket.receiveCount}}/{{redPacket.count}}个，
          共{{openMoney}}/{{redPacket.money}}元{{redPacket.receiveCount==redPacket.count?'，已领完':''}}!</div>

        <div class="red-info">
          <div class="red-info-mems">
            <div v-for="item in list" class="red-info-mem">
              <img :src="$root.getAvatar(item.userId)" :onerror="$store.state.detaultAvatar"/>
              <div class="main-info">
                <div class="nickname">{{item.userName}}</div>
                <div class="time">{{parseTime(item.time)}}</div>
              </div>
              <div class="money">{{item.money}}元</div>
            </div>
          </div>
        </div>

      </el-main>
    </el-container>
  </div>
</template>
<script>

import {parseTime} from "@/utils/functions";

export default {
  name: 'RedCard',
  computed:{

  },
  data() {
    return {
      visible: false,
      redPacket:{},
      list:[],

      //我领取的
      myMoney: 0,
      //打开金额
      openMoney: 0,
    }
  },
  created(){
  },
  methods: {
    parseTime,
    show(redPacket, list){
      this.redPacket = redPacket;
      this.list = list;
      this.visible = true;

      let openMoney = 0;
      let myMoney = this.redPacket.money
      let userId = this.$root.userId
      this.list.forEach(item=>{
        if(item.userId==userId){
          myMoney = item.money
        }
        openMoney += item.money;
      })
      this.myMoney = myMoney;
      this.openMoney = openMoney;
    },
    close(){
      this.visible = false;
    }
  },
}
</script>
<style lang="less" scoped>


  .red-info-mem{
    display: flex;
    flex-direction: row;
    padding: 5px;
    img{
      width: 50px;
      height: 50px;
      border-radius: 50%;
      justify-content: flex-start;
    }
    .main-info{
      justify-content: center;
      margin-left: 10px;
      flex: 1;
      display: flex;
      flex-direction: column;
      .time{
        font-size: 12px;
        margin-top: 5px;
      }
    }
    .money{
      justify-content: flex-end;
      font-weight: 700;
    }
  }

  .line-item{
    text-align: center;
    padding: 5px;
  }

  .red{
    .red-my{
      margin-top: 50px;
      font-size: 12px;
      .money{
        font-weight: 700;
        font-size: 26px;
        margin-top: 10px;
        margin-bottom: 20px;
      }
    }
    .red-info-total{
      padding: 10px 15px;
      background: white;
      border-bottom: 1px solid #F2F2F2;
    }
    .red-info{
      background: white;
      height: 280px;
      padding: 10px;
    }
  }


.container {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 350px;
  height: 90%;
  max-height: 600px;
  overflow: hidden;
  border-radius: 3px;
  background: #F2F2F2;

  .header {
    position: relative;

    .close {
      position: absolute;
      right: 10px;
      top: 10px;
      color: white;
      transition: all 1s;
      z-index: 1;
      font-size: 20px;
    }

    .img-banner {
      width: 100%;
      height: 100%;
      background-image: url(~@/assets/image/default-user-banner.png);
      background-size: 100%;
      transition: all 0.2s linear;
      cursor: pointer;
      overflow: hidden;

      img:hover {
        -webkit-transform: scale(1.1);
        transform: scale(1.1);
        -webkit-filter: contrast(130%);
        filter: contrast(130%);
      }
    }
  }

  .main {
    background-color: white;
    padding: 45px 16px 0;
  }

  .footer {
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid #f5eeee;

    button {
      width: 90%;
    }
  }
}
  .avatar-box {
    width: 80px;
    height: 80px;
    background-color: white;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      height: 70px;
      width: 70px;
      border-radius: 50%;
    }
  }

.user-header {
  width: 100%;
  height: 80px;
  position: absolute;
  bottom: -40px;
  display: flex;
  flex-direction: row;
  justify-content: center;

  .avatar {
    width: 100px;
    flex-shrink: 0;
    display: flex;
    justify-content: center;


  }

  .nickname {
    flex: auto;
    padding-top: 50px;
    font-size: 16px;
    font-weight: 400;

    span {
      margin-left: 5px;
    }

    .share {
      display: inline-flex;
      width: 50px;
      height: 22px;
      background: #ff5722;
      color: white;
      align-items: center;
      justify-content: center;
      padding: 3px 8px;
      border-radius: 20px;
      transform: scale(0.7);
      cursor: pointer;
      i {
        margin-top: 2px;
      }
      span {
        font-size: 14px;
        margin-left: 4px;
      }
    }
  }
}

.user-sign {
  min-height: 26px;
  border-radius: 5px;
  padding: 5px;
  line-height: 25px;
  background: #f3f5f7;
  color: #7d7d7d;
  font-size: 12px;
  margin-bottom: 20px;
  position: relative;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  position: relative;

  .sign-arrow {
    position: absolute;
    width: 0;
    height: 0;
    font-size: 0;
    border: 5px solid hsla(0, 0%, 96.9%, 0);
    border-bottom-color: #f3f5f7;
    left: 28px;
    top: -9px;
  }
}

.card-rows {
  .card-row {
    height: 35px;
    line-height: 35px;
    font-size: 14px;
    position: relative;
    cursor: pointer;
    color: #736f6f;

    label {
      width: 60px;
      display: inline-block;
      color: #cbc5c5;
    }

    .friend-remark {
      border-bottom: 1px dashed #bec3d0;
      padding-bottom: 2px;
      color: #736f6f;
      width: 60%;
      padding-right: 5px;
    }

    .el-icon-edit-outline {
      margin-left: 3px !important;
    }

    span{
      vertical-align: bottom;
      width: calc(100% - 80px);
    }
  }
}

/* 好友申请表单 */
.friend-from {
  position: absolute;
  background: #fbf6f6;
  height: 80px;
  z-index: 2;
  width: 100%;
  bottom: -80px;
  left: 0;
  transition: all 0.5s ease-in-out;

  p {
    height: 20px;
    line-height: 20px;
    padding: 7px 5px 5px 15px;
    font-size: 13px;

    span {
      &:nth-child(2) {
        float: right;
        margin-right: 13px;
        color: #32caff;
        cursor: pointer;
      }
    }
  }

  div {
    height: 31px;
    line-height: 20px;
    padding: 7px 5px 5px 15px;
    font-size: 13px;
  }

  input {
    height: 30px;
    line-height: 30px;
    width: 220px;
    border-radius: 3px;
    padding: 0 5px;
    margin-right: 5px;
  }
}

.friend-from-show {
  bottom: 0;
}
</style>
