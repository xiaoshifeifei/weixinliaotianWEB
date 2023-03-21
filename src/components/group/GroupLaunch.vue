<template>
  <div class="lum-dialog-mask">
    <el-container class="lum-dialog-box" v-outside="close">
      <el-header class="no-padding header no-select" height="60px">
        <p>
          {{ from.roomId == 0 ? '创建群组' : '请选择需要邀请的好友' }}
        </p>
        <p class="tools">
          <i class="el-icon-close" @click="close" />
        </p>
      </el-header>
      <el-main class="main no-padding">
        <el-container class="full-height">
          <el-aside width="250px" class="aside-border">
            <el-container class="full-height no-select">
              <el-header
                class="no-padding search-header"
                height="50px"
                :class="{ shadow: searchHeaderShadow }"
              >
                <el-input
                  v-model="keywords"
                  placeholder="搜索 | 好友 or 群组"
                  prefix-icon="el-icon-search"
                  clearable
                  size="small"
                />
              </el-header>
              <el-main class="no-padding">
                <el-scrollbar
                  ref="scrollbar"
                  class="full-height"
                  tag="section"
                  :native="false"
                >
                  <ul class="friend-items no-select">
                    <li
                      v-for="item in search"
                      :key="item.id"
                      @click="triggerContacts(item)"
                    >
                      <el-avatar
                        class="avatar"
                        style="margin-top: 5px"
                        :size="25"
                        :src="item.avatar"
                      >
                        <img src="~@/assets/image/detault-avatar.jpg" />
                      </el-avatar>
                      <span class="nickname max-length"  :title="item.remark || item.nickname">{{item.remark ? item.remark : item.nickname}}</span>
                      <span class="select-btn">
                        <i
                          class="el-icon-success"
                          :class="{ 'icon-active': item.checked }"
                        />
                      </span>
                    </li>
                  </ul>
                </el-scrollbar>
              </el-main>
            </el-container>
          </el-aside>

          <el-main class="no-padding">
            <el-container class="full-height">
              <el-header height="50px" v-show="!readonly">
                <div class="group-from no-select">
                  <label>群名称</label>
                  <p>
                    <el-input
                      v-model="from.groupName"
                      placeholder="请输入群名称(必填)"
                      size="small"
                      :maxlength="20"
                    />
                  </p>
                </div>
              </el-header>
              <el-header height="40px" :class="{ mt40: !readonly }">
                <el-divider content-position="left" class="no-select">
                  <span style="color: #c4c5c7">
                    邀请成员 ({{ selected.length }})
                  </span>
                </el-divider>
              </el-header>
              <el-main>
                <el-scrollbar :native="false" tag="section" class="full-height">
                  <div class="selectd-items">
                    <div
                      v-for="item in selected"
                      :key="item.id"
                      class="selectd-item no-select"
                    >
                      <el-avatar :size="25" :src="item.avatar" />
                      <p>{{ item.nickname }}</p>
                      <div class="triangle-topleft"></div>
                      <div class="del-mask" @click="delContacts(item)">
                        <i class="el-icon-delete" />
                      </div>
                    </div>
                  </div>
                </el-scrollbar>
              </el-main>
            </el-container>
          </el-main>
        </el-container>
      </el-main>
      <el-footer height="50px" class="no-padding footer">
        <el-button size="small" @click="close" plain>取消</el-button>
        <el-button
          v-if="from.roomId == 0"
          type="primary"
          size="small"
          @click="createSubmit"
        >
          创建群组<span v-show="selected.length">({{ selected.length }})</span>
        </el-button>
        <el-button v-else type="primary" size="small" @click="inviteSubmit">
          立即邀请({{ selected.length }})
        </el-button>
      </el-footer>
    </el-container>
  </div>
</template>
<script>
  import {
  } from '@/api/group'
import {contactData} from "@/utils/data/contactData";
import {randomId} from "@/utils/utils";
  import {WEBIM} from "@/utils/old/webim";
  import {msgConst} from "@/utils/my/const/msgConst";
  import {room} from "@/utils/old/room";
  import {roomService} from "@/service/roomService";
  import {roomApi} from "@/api/group";

export default {
  name: 'GroupLaunch',
  props: {
    roomId: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      readonly: false,
      from: {
        roomId: 0,
        groupName: '',
      },
      contacts: [],
      search: [],
      searchHeaderShadow: false,
      keywords: '',
      isAvatarCropper: false,
    }
  },
  computed: {
    selected() {
      return this.contacts.filter(item => item.checked)
    },
  },
  watch: {
    keywords(val) {
      this.search =
        val == ''
          ? this.contacts
          : this.contacts.filter(item => {
              return item.nickname.match(this.keywords) != null
            })
    },
    contacts(arr) {
      if (this.keywords == '') {
        this.search = arr
      }
    },
  },
  created() {
    let that = this
    if (this.roomId) {
      this.readonly = true
      this.from.roomId = this.roomId;
      this.contacts = this.$store.state.contact.friends.filter(friend=>{
        let has = contactData.getRoomMembers(that.roomId).some(item=>{
          return item.userId==friend.id;
        })
        console.log(has)
        return !has;
      })
    }else{
      this.contacts = this.$store.state.contact.friends
    }
  },
  mounted() {
    this.handleScroll()
  },
  methods: {
    // 触发选择联系人事件
    triggerContacts(item) {
      let index = this.contacts.findIndex(val => {
        return val.id === item.id
      })
      this.contacts[index].checked = !this.contacts[index].checked
    },

    // 取消选中的联系人
    delContacts(item) {
      let index = this.contacts.findIndex(val => {
        return val.id === item.id
      })

      this.contacts[index].checked = false
    },

    // 移除所有选中选项
    delAll() {
      this.contacts.forEach((item, i) => {
        this.contacts[i].checked = false
      })
    },

    // 关闭窗口
    close() {
      this.$emit('close')
    },

    // 获取选中的ID列表
    getIds() {
      return this.selected.map(item => item.id)
    },
    //创建聊天群
    createSubmit() {
      let name = this.from.groupName
      if (!name) {
        this.$message('群聊名称不能为空！')
        return
      }

      if (this.getIds().length < 2) {
        this.$message('群聊人数必须大于俩人！')
        return
      }
      let that = this
      roomService.createRoom(name, this.getIds()).then((data)=>{
        this.$emit('create-success', data)
        this.$message.success('创建群聊成功！')
      }).catch(()=>{
        this.$message('创建群聊失败！')
      })
      //
      // roomApi.createRoom(name, this.getIds()).then(res => {
      //   if (res.resultCode == 1) {
      //     let msg = WEBIM.createMessage(msgConst.group.add_member, name, this.$root.userId);
      //     msg.objectId = jid;
      //     msg.fileName = res.id;
      //     // if (1 == myData.multipleDevices) {
      //     //   DeviceManager.sendMsgToMyDevices(msg);
      //     // }
      //     room.convertGroupMsg(msg);
      //     msg.isGroup = 1;
      //     WEBIM.joinGroupChat(jid);
      //     this.$emit('create-success', res.data)
      //   } else {
      //     this.$message('创建群聊失败！')
      //   }
      // })

    },

    //好友邀请提交
    inviteSubmit() {
      roomApi.invite({
        roomId: this.from.roomId,
        text: JSON.stringify(this.getIds()),
      }).then(res => {
        if (res.resultCode == 1) {
          this.$emit('invite-success')
        } else {
          this.$message('邀请好友失败！')
        }
      })
    },

    // 滚动条监听
    handleScroll() {
      let scrollbarEl = this.$refs.scrollbar.wrap
      scrollbarEl.onscroll = () => {
        this.searchHeaderShadow = scrollbarEl.scrollTop != 0
      }
    },
  },
}
</script>
<style lang="less" scoped>
/deep/.el-scrollbar__wrap {
  overflow-x: hidden;
}

.lum-dialog-box {
  width: 650px;
  max-width: 650px;
  height: 550px;

  .main {
    .aside-border {
      border-right: 1px solid #f5eeee;
    }
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-right: 10px;
    border-top: 1px solid #f5eeee;
  }
}

.search-header {
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;

  &.shadow {
    box-shadow: 0 2px 6px 0 rgba(31, 35, 41, 0.05);
  }
}

.friend-items {
  li {
    padding: 10px;
    cursor: pointer;
    position: relative;

    &:hover {
      background: #f5f5f5;
    }

    .avatar {
      margin-top: 3px;
    }

    .nickname {
      width: 60%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      position: absolute;
      top: 10px;
      left: 52px;
      height: 35px;
      line-height: 35px;
      font-weight: 400;
      font-size: 13px;
    }

    .select-btn {
      position: absolute;
      width: 32px;
      height: 35px;
      right: 3px;
      top: 10px;
      line-height: 35px;
      text-align: center;

      i {
        color: #ccc;

        &.icon-active {
          color: #26bcfe !important;
        }
      }
    }
  }
}

.group-from {
  label {
    height: 45px;
    line-height: 47px;
    width: 50px;
    color: #606266;
    padding-right: 3px;
    font-size: 13px;
  }

  input {
    height: 25px;
    width: 100%;
    text-indent: 3px;
    color: #a9a4a4;
    font-size: 12px;
    border-bottom: 1px solid #efebeb;
  }
}

.selectd-items {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;

  .selectd-item {
    width: 23%;
    height: 65px;
    margin: 6px 2px 0px 2px;
    cursor: pointer;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    box-shadow: 0px 0px 3px 0 rgba(0, 0, 0, 0.1);

    p {
      width: 90%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 10px;
      margin-top: 8px;
      text-align: center;
    }

    .del-mask {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(31, 35, 41, 0.5);
      display: none;
      justify-content: center;
      align-items: center;
      color: white;
      transition: ease 0.5s;
      border-radius: 2px;
    }

    &:hover .del-mask {
      display: flex;
    }
  }
}

.mt40 {
  margin-top: 40px;
}
</style>
