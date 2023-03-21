<template>
  <div>
    <MainLayout :idx="1">
      <el-container slot="container" class="full-height">

        <!-- 左侧侧边栏 -->
        <el-aside width="250px" class="aside-box">
          <div class="drag" style="width: calc(100%); height: 20px"></div>
          <el-container class="full-height" direction="vertical">
            <!-- 搜索栏 -->
            <el-header height="40px" class="no-padding header">
              <div class="from">
                <el-input v-model="input" prefix-icon="el-icon-search"
                  placeholder="搜索好友 / 群组" size="small"/>
              </div>

              <!-- 工具栏 -->
              <div class="tools" v-outside="closeSubMenu">
                <el-button
                  icon="el-icon-plus"
                  circle
                  plain
                  size="small"
                  @click="subMenu = !subMenu"
                />

                <transition name="el-zoom-in-top">
                  <div class="tools-menu" v-show="subMenu">
                    <div class="menu1-item" @click="triggerSubMenu(1)">
                      创建群组
                    </div>
                    <div class="menu1-item" @click="triggerSubMenu(2)">
                      添加好友
                    </div>
                  </div>
                </transition>
              </div>
            </el-header>

            <!-- 对话列表栏 -->
            <el-main class="main">
              <div
                class="menu-item"
                :class="{ 'active-border': activeIndex == 0 }"
                @click="triggerMenu(0)"
              >
                <span>新的联系人</span>
              </div>
              <div
                class="menu-item"
                :class="{ 'active-border': activeIndex == 1 }"
                @click="triggerMenu(1)"
              >
                <span>我的好友</span>
              </div>
              <div
                class="menu-item"
                :class="{ 'active-border': activeIndex == 2 }"
                @click="triggerMenu(2)"
              >
                <span>我的群组</span>
              </div>
            </el-main>
          </el-container>
        </el-aside>

        <!-- 聊天面板容器 -->
        <el-container class="no-padding full-height ov-hidden panel">
          <el-header height="60px" class="main-drag panel-header no-select">
            <template v-if="activeIndex == 0">
              <p>新的联系人</p>
              <p>
                <span class="wait-btn" v-show="waitHandleNum">
                  【{{ waitHandleNum }}】待处理
                  <i class="el-icon-warning" />
                </span>
              </p>
            </template>
            <template v-else-if="activeIndex == 1">
              <p>我的好友({{ friends.length }})</p>
            </template>
            <template v-else-if="activeIndex == 2">
              <p>我的群组({{ rooms.length }})</p>
            </template>
          </el-header>
          <el-main class="panel-main lum-scrollbar">
            <template v-if="activeIndex == 0">
              <template v-if="apply.status == 0">
                <div class="preloading">
                  <div class="ant-spin ant-spin-lg ant-spin-spinning">
                    <span class="ant-spin-dot ant-spin-dot-spin">
                      <i class="ant-spin-dot-item" />
                      <i class="ant-spin-dot-item" />
                      <i class="ant-spin-dot-item" />
                      <i class="ant-spin-dot-item" />
                    </span>
                  </div>
                  <p>数据加载中 ...</p>
                </div>
              </template>
              <template v-if="apply.status == 1">
                <template v-if="apply.items.length == 0">
                  <div class="preloading" style="height: 50%">
                    <img
                      src="~@/assets/image/no-oncall.6b776fcf.png"
                      width="180"
                    />
                    <p>暂无联系人申请</p>
                  </div>
                </template>
                <template>

                  <div
                    v-for="item in apply.items"
                    :key="item.id"
                    class="data-item"
                    @click="openUserDetail(item.toUserId)"
                    v-if="item.type!=512"
                  >
                    <el-avatar
                      shape="square"
                      class="avatar"
                      :src="$root.getAvatar(item.toUserId)"
                      :size="35"
                    >
                      {{ item.toNickname}}
                    </el-avatar>
                    <div class="card">
                      <div class="title" v-if="item.direction==0">
                        <span class="name max-length">{{ item.toNickname }}</span>
                        <div class="larkc-tag wait" v-show="item.type == msgConst.friend.say_hello
                        || item.type == msgConst.friend.new_see">等待对方验证中</div>
                        <div class="larkc-tag wait" v-show="item.type == msgConst.friend.feed_back">待处理</div>
                        <div class="larkc-tag wait" v-show="item.type == msgConst.friend.del_see">已取消好友</div>

                        <div class="larkc-tag wait" v-show="item.type == msgConst.friend.del">已删除</div>
                        <div class="larkc-tag wait" v-show="item.type == msgConst.friend.black">已拉黑</div>
                        <div class="larkc-tag agree" v-show="item.type == msgConst.friend.friend">已互为好友</div>
                      </div>
                      <div class="title" v-if="item.direction==1">
                        <span class="name">{{ item.toNickname }}</span>
                        <div class="larkc-tag wait" v-show="item.type == msgConst.friend.say_hello||item.type == msgConst.friend.feed_back">待处理</div>
                        <div class="larkc-tag wait" v-show="item.type == msgConst.friend.new_see">申请加我为好友</div>

                        <div class="larkc-tag wait" v-show="item.type == msgConst.friend.del||item.type == msgConst.friend.del_see">被取消了好友</div>
                        <div class="larkc-tag wait" v-show="item.type == msgConst.friend.black">已被拉黑</div>
                        <div class="larkc-tag agree" v-show="item.type == msgConst.friend.friend">已互为好友</div>
                      </div>
                      <div class="content">
                        [申请时间] {{ $root.beautifyTime(item.createTime) }} ~ [{{item.content ? item.content : '备注说明'}}]
                        {{ item.remarks }}
                      </div>
                    </div>
                    <div class="apply-from" @click.prevent.stop v-if="item.direction==1">
                      <el-button
                        v-show="item.type == 500 || item.type == 502"
                        size="mini"
                        type="primary"
                        icon="el-icon-check"
                        @click="handleFrom(item)"
                        >同意申请
                      </el-button>
                      <el-button
                              v-show="item.type == 503||item.type == 504||item.type == 505"
                              size="mini"
                              type="primary"
                              icon="el-icon-check"
                              @click="handleFrom(item)"
                      >加好友
                      </el-button>

                    </div >
                    <div class="apply-from" @click.prevent.stop v-if="item.direction==0">
                      <el-button
                              v-show="item.type == 505"
                              size="mini"
                              type="primary"
                              icon="el-icon-check"
                              @click="handleFrom(item)"
                      >加好友
                      </el-button>
                      <el-button
                              v-show="item.type == 507"
                              size="mini"
                              type="primary"
                              icon="el-icon-check"
                              @click="handleFrom(item)"
                      >移除黑名单
                      </el-button>

                      <el-button
                        v-show="item.type == 502"
                        size="mini"
                        type="primary"
                        icon="el-icon-check"
                        @click="handleFrom(item)"
                        >同意申请
                      </el-button>
                      <el-button
                        v-show="item.status == 2 && item.type != msgConst.friend.del"
                        size="mini"
                        type="primary"
                        icon="el-icon-s-promotion"
                        @click="toTalk(item.toUserId)"
                        >发送消息
                      </el-button>
                      <!--<el-button-->
                        <!--size="mini"-->
                        <!--type="danger"-->
                        <!--icon="el-icon-delete"-->
                        <!--@click="deleteFriendApply(item)"-->
                        <!--&gt;删除记录-->
                      <!--</el-button>-->
                    </div>
                  </div>
                </template>
              </template>
            </template>
            <template v-else-if="activeIndex == 1">
              <template v-if="friends.length == 0">
                <div class="preloading">
                  <img
                    src="~@/assets/image/no-oncall.6b776fcf.png"
                    width="180"
                  />
                  <p>暂无好友</p>
                </div>
              </template>
              <template>
                <div
                  v-for="item in friendSearch"
                  :key="item.toUserId"
                  class="data-item"
                  @click="openUserDetail(item.chatId)"
                >
                  <el-avatar
                    class="avatar"
                    shape="square"
                    :size="35"
                    :src="item.avatar"
                  >
                    {{ item.nickname}}
                  </el-avatar>
                  <div class="card">
                    <div class="title">
                      <span class="name max-length">
                        {{item.remark? item.remark: item.nickname}}
                      </span>
                      <div v-show="item.online == 1" class="larkc-tag agree">
                        在线
                      </div>
                    </div>
                    <div class="content">
                      [个性签名] 「{{ item.motto ? item.motto : '未设置' }}」
                    </div>
                  </div>

                  <div class="apply-from" @click.prevent.stop>
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-s-promotion"
                      @click="toTalk(item.chatId)"
                      >发送消息
                    </el-button>
                    <el-button
                      size="mini"
                      type="danger"
                      icon="el-icon-delete"
                      @click="deleteFriend(item)"
                      >删除好友
                    </el-button>
                  </div>
                </div>
              </template>
            </template>
            <template v-else-if="activeIndex == 2">
              <template v-if="rooms.length == 0">
                <div class="preloading">
                  <img
                    src="~@/assets/image/no-oncall.6b776fcf.png"
                    width="180"
                  />
                  <p>暂未加入群聊</p>
                </div>
              </template>
              <template>
                <div
                  v-for="item in roomSearch"
                  :key="item.id"
                  class="data-item"
                  @click="clickRoom(item)"
                >
                  <el-avatar
                    class="avatar"
                    shape="square"
                    :size="35"
                    :src="item.avatar"
                  >
                    {{ item.nickname }}
                  </el-avatar>
                  <div class="card">
                    <div class="title">
                      <span class="name max-length">{{ item.nickname }}</span>
                      <div v-show="item.disturb == 1" class="larkc-tag">
                        <i
                          class="iconfont icon-xiaoximiandarao"
                          style="font-size: 10px; color: #7d7a7a"
                        />
                      </div>
                      <div v-show="item.myRole == 0" class="larkc-tag wait">
                        群主
                      </div>
                    </div>
                    <div class="content">
                      [群介绍] ~ 「{{
                        item.group_profile ? item.group_profile : '未设置'
                      }}」
                    </div>
                  </div>
                  <div class="apply-from" @click.prevent.stop>
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-s-promotion"
                      @click="toTalk(item.chatId)"
                      >发送消息
                    </el-button>
                    <el-button
                      size="mini"
                      type="danger"
                      icon="el-icon-delete"
                      @click="deleteGroup(item)"
                      >退出群聊
                    </el-button>
                  </div>
                </div>
              </template>
            </template>
          </el-main>

          <div class="broadside-box" v-show="groupDetailId">
            <group-panel class="max-hei"
              :room-id="groupDetailId"
              :chat-id="groupChatId"
              @close="groupDetailId = 0"
              @send-group="sendMessage"
              @quit-group="quitGroupSuccess"
            />
          </div>
        </el-container>
      </el-container>
    </MainLayout>

    <!-- 创建群聊组件 -->
    <GroupLaunch
      v-if="launchGroupShow"
      @close="launchGroupShow = false"
      @create-success="groupChatSuccess"
    />

    <!-- 查看好友用户信息 -->
    <UserBusinessCard ref="userBusinessCard" @changeRemark="changeRemark" />

    <!-- 用户查询 -->
    <UserSearch ref="searchUsers" />
  </div>
</template>
<script>
import MainLayout from '@/views/layout/MainLayout'
import GroupLaunch from '@/components/group/GroupLaunch'
import UserBusinessCard from '@/components/user/UserBusinessCard'
import UserSearch from '@/components/user/UserSearch'
import GroupPanel from '@/components/group/GroupPanel'
import {
  httpFriendDelApply, contactApi,
} from '@/api/contacts'
import {friendService} from "@/service/friendService";
import {busService} from "@/service/busService";
import {eventConst} from "@/utils/my/const/eventConst";
import {chatUtils} from "@/utils/my/chatUtils";
import {imUtils} from "@/utils/my/imUtils";
import {msgConst} from "@/utils/my/const/msgConst";
import {roomService} from "@/service/roomService";
import {randomId} from "@/utils/utils";
import FriendApplyEvent from "@/plugins/socket/event/friend-apply-event";

export default {
  name: 'ContactsPage',
  components: {
    MainLayout,
    GroupLaunch,
    UserBusinessCard,
    UserSearch,
    GroupPanel,
  },
  data() {
    return {
      msgConst,
      launchGroupShow: false,

      // 查询关键词
      input: '',

      // header 工具菜单
      subMenu: false,

      // 当前显示的栏目
      activeIndex: 0,

      // 好友申请列表
      apply: {
        items: [],
        status: 0,
      },
      groupDetailId: 0,
      groupChatId:0,
    }
  },
  computed: {
    waitHandleNum() {
      if(this.apply && this.apply.items){
        return this.apply.items.filter(item => {
          return item.status == 0
        }).length
      }
      return 0;
    },
    rooms(){
      return this.$store.state.contact.rooms;
    },
    roomSearch(){
      return this.rooms.filter(item=>{
        let name = item.nickname;
        return name.match(this.input) != null;
      })
    },
    friends(){
      return this.$store.state.contact.friends;
    },
    friendSearch(){
      return this.friends.filter(item=>{
        let name = item.remark ? item.remark: item.nickname;
        return name.match(this.input) != null;
      })
    }
  },
  created() {
    this.loadFriendApply()

    let that = this;
    let userId = this.$root.userId;
    busService.on(eventConst.refreshAvatar, function (chatId) {
      if(chatUtils.isGroupId(chatId)){
        that.rooms.forEach(function (item) {
          if(chatId==item.chatId){
            item.avatar = imUtils.getAvatarUrl(chatId);
          }
        })
      }
    })

    //申请好友
    busService.on(eventConst.friend.apply, function ({userId, direction, msg}) {
      console.log(`${userId}申请好友`)
      //是否存在， 不存在则添加一个， 存在则修改

      let exist = that.apply.items.some(item=>{
        return item.toUserId==userId
      })
      if(exist){
        that.apply.items.forEach(item=>{
          if(item.toUserId==userId){
            item.type = that.msgConst.friend.say_hello;
            item.direction = direction;
          }
        })
      }else{
        that.apply.items.push({
          id: randomId(),
          //内容
          "content": msg.content,
          //创建时间
          "createTime": new Date().getTime(),
          //方向 1 别人发的   0 我发送的
          "direction": 1,
          "modifyTime": new Date().getTime(),
          // 状态
          "status": 0,
          "toNickname": msg.fromUserName,
          "toUserId": msg.fromUserId,
          "type": 500,
          "userId": this.$root.userId
        });
      }
      new FriendApplyEvent({}).handle()
    })

    //被添加好友
    busService.on(eventConst.friend.add, function ({userId, direction}) {
      console.log(`${userId}被添加未好友`)
      that.apply.items.forEach(item=>{
        if(item.toUserId==userId){
          item.type=that.msgConst.friend.friend
          item.direction = direction;
          // new FriendApplyEvent({}).handle()
        }
      })

    })

    //被删除好友 apply.items
    busService.on(eventConst.friend.del, function ({userId, direction}) {
      console.log(`${userId}被删除好友`)
      that.apply.items.forEach(item=>{
        if(item.toUserId==userId){
          item.type=that.msgConst.friend.del
          item.direction = direction;
          // new FriendApplyEvent({}).handle()
        }
      })
    })

  },
  methods: {
    clickRoom(room){
      this.groupDetailId = room.id;
      this.groupChatId = room.chatId;
      this.$store.commit('setRoomMember', {roomId: room.id});
    },
    // header 功能栏隐藏事件
    closeSubMenu() {
      this.subMenu = false
    },

    // 工具栏事件
    triggerSubMenu(type) {
      this.closeSubMenu()
      if (type == 1) {
        this.launchGroupShow = true
      } else {
        this.$refs.searchUsers.open()
      }
    },

    // 左侧菜单栏点击事件
    triggerMenu(i) {
      this.activeIndex = i
      if (i != 2) this.groupDetailId = 0
    },

    // 查看好友申请列表
    loadFriendApply() {
      contactApi.listApply({
        page: 1
      }).then(res => {
        if (res.resultCode == 1) {
          this.apply.status = 1
          let data = res.data.pageData;
          this.apply.items = data
        }
      })
    },
    // 查看用户名片
    openUserDetail(userId) {
      this.$refs.userBusinessCard.open(userId)
    },

    // 跳转聊天页面
    toTalk(chatId) {
      this.$root.dumpTalkPage(chatId)
    },

    // 发起群聊成功后回调方法
    groupChatSuccess(data) {
      this.launchGroupShow = false
      // this.loadUserGroups()
    },

    // 根据用户对话索引获取对话数组对应的key
    getGroupIndex(roomId) {
      return this.rooms.findIndex(item => {
        return item.id == roomId
      })
    },

    // 群聊窗口点击发送群聊信息按钮回调事件
    sendMessage(groupId) {
      // this.toTalk(2, `2_${groupId}`)
      this.toTalk(groupId)
    },

    // 用户退出群聊回调事件
    quitGroupSuccess() {
      this.$delete(this.rooms, this.getGroupIndex(this.groupDetailId))
      this.groupDetailId = 0
      this.groupChatId = 0
    },

    // 处理好友申请信息
    handleFrom(item) {
      friendService.accept(item.toUserId);
    },

    // 删除好友申请记录
    deleteFriendApply(item) {
      let apply_id = item.id
      httpFriendDelApply({
        apply_id,
      }).then(res => {
        if (res.resultCode == 1) {
          this.$delete(
            this.apply.items,
            this.apply.items.findIndex(item => {
              return item.id == apply_id
            })
          )
        }
      })
    },

    // 删除好友
    deleteFriend(item) {
      let name = item.remark ? item.remark : item.nickname
      this.$alert(`您确定要删除【${name}】好友吗？`, '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        showCancelButton: true,
        customClass: 'border-radius0',
        closeOnClickModal: true,
        callback: action => {
          if (action == 'confirm') {
            let friendId = item.id
            friendService.delFriend(friendId).then(res => {
                this.$message({
                  message: `好友 【${name}】已删除 ...`,
                  type: 'success',
                })
            }).catch((res)=>{
              this.$message({
                message: `好友 【${name}】删除失败[${res.resultMsg}] ...`,
                type: 'info',
              })
            })

          }
        },
      })
    },

    // 退出群聊
    deleteGroup(item) {
      this.$alert(`您确定要退出【${item.nickname}】群聊吗？`, '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        showCancelButton: true,
        customClass: 'border-radius0',
        closeOnClickModal: true,
        callback: action => {
          if (action == 'confirm') {
            roomService.delRoom(item.chatId).then(() => {
              this.$message({
                message: `您已成功退出【${item.nickname}】群聊 ...`,
                type: 'success',
              })
            }).catch(()=>{
              this.$message({
                message: `退出 【${item.nickname}】群聊失败 ...`,
                type: 'info',
              })
            })
          }
        },
      })
    },

    // 更新好友备注昵称
    changeRemark(firendInfo) {
      let index = this.friends.findIndex(item => {
        return item.id == firendInfo.friend_id
      })
      if (index >= 0) {
        this.friends[index].remark = firendInfo.remarks
      }
    },
  },
}
</script>
<style lang="less" scoped>
.aside-box {
  position: relative;
  background-color: white;
  border-right: 1px solid rgb(245, 245, 245);
  overflow: hidden;
  padding: 0;

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 15px;

    .from {
      flex: 1 1;
      flex-shrink: 0;
      height: 40px;

      /deep/.el-input .el-input__inner {
        border-radius: 20px;
        width: 170px;
      }
    }

    .tools {
      flex-basis: 32px;
      flex-shrink: 0;
      height: 32px;
      margin-bottom: 8px;
      cursor: pointer;
      line-height: 32px;
      text-align: center;
      position: relative;
      user-select: none;

      .tools-menu {
        position: absolute;
        right: 0;
        top: 38px;
        width: 100px;
        min-height: 80px;
        box-sizing: border-box;
        background-color: rgba(31, 35, 41, 0.9);
        border-radius: 5px;
        z-index: 1;
        padding: 3px 0;

        .menu1-item {
          height: 40px;
          line-height: 40px;
          color: white;
          font-size: 14px;

          &:hover {
            background-color: rgba(70, 72, 73, 0.9);
          }
        }
      }
    }
  }

  .main {
    padding: 0;
    user-select: none;

    .menu-item {
      height: 42px;
      display: flex;
      align-items: center;
      padding-left: 20px;
      cursor: pointer;
      border-left: 3px solid white;
      position: relative;
      transition: 0.2s ease-in;

      i:first-child {
        margin-right: 10px;
      }

      span {
        font-size: 14px;
      }

      &:hover {
        background-color: #eff0f1;
        border-color: #eff0f1;
      }

      &.active-border {
        border-color: #3370ff !important;
        background-color: #eff0f1;
      }
    }
  }
}

.panel {
  background-color: white;
  position: relative;

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgb(245, 245, 245);

    .wait-btn {
      font-weight: 500;
      padding: 3px 8px;
      font-size: 14px;
      border-radius: 1px;

      i {
        color: tomato;
      }
    }
  }

  .panel-main {
    padding: 10px 0;

    .preloading {
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      user-select: none;

      p {
        margin-top: 20px;
        color: #afacac;
        font-size: 14px;
        font-weight: 300;
      }
    }

    .data-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 60px;
      cursor: pointer;
      padding: 5px 15px;
      position: relative;
      overflow: hidden;
      border-bottom: 1px solid #f1ebeb;
      margin-bottom: 2px;

      .avatar {
        height: 35px;
        width: 35px;
        flex-basis: 35px;
        flex-shrink: 0;
        background-color: #508afe;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        color: white;
        user-select: none;
        transition: ease 1s;
        position: relative;
      }

      .card {
        height: 40px;
        display: flex;
        align-content: center;
        flex-direction: column;
        flex: 1 1;
        margin-left: 10px;
        overflow: hidden;

        .title {
          width: 100%;
          height: 20px;
          display: flex;
          align-items: center;

          .name {
            margin-right: 15px;
            color: #1f2329;
          }

          .larkc-tag {
            font-size: 12px;
            font-weight: 400;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0 6px;
            height: 20px;
            border-radius: 2px;
            cursor: default;
            user-select: none;
            background-color: #dee0e3;
            transform: scale(0.8);
            transform-origin: left;
            flex-shrink: 0;
          }

          .wait {
            background: #ffb445;
            color: white;
          }

          .agree {
            background: #53bd53;
            color: white;
          }
        }

        .content {
          font-size: 10px;
          line-height: 18px;
          color: #8f959e;
          overflow: hidden;
          margin-top: 3px;
          font-weight: 300;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }

      .apply-from {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        position: relative;
        right: -110px;
        top: 0px;
        height: 60px;
        width: 100px;
        transition: ease 0.5s 0.3s;
        background-color: white;
        opacity: 0;
        button {
          margin: 2px;
        }
      }

      &:hover {
        box-shadow: 0 0 8px 4px #f1f1f1;

        .avatar {
          border-radius: 2px;
        }

        .apply-from {
          opacity: 1;
          right: 0px;
        }
      }
    }
  }
}

.broadside-box {
  position: absolute;
  width: 350px;
  height: 100%;
  right: 0;
  z-index: 2;
  animation: showBox 0.5s ease-in-out;
  -webkit-animation: showBox 0.5s ease-in-out;
  -moz-animation: showBox 0.5s ease-in-out;
  -webkit-box-direction: normal;
  background: white;
  box-shadow: 0 0 14px #cccccc70;
}

@keyframes showBox {
  0% {
    transform: translateX(350px);
  }

  to {
    transform: translateX(0);
  }
}

@-webkit-keyframes showBox {
  0% {
    -webkit-transform: translateX(350px);
  }

  to {
    -webkit-transform: translateX(0);
  }
}
</style>
