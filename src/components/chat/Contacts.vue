<template>
  <div class="lum-dialog-mask" v-if="isShow">
    <el-container class="lum-dialog-box" v-outside="close">
      <el-header class="no-padding header no-select" height="60px">
        <p>我的联系人</p>
        <p class="tools"><i class="el-icon-close" @click="close" /></p>
      </el-header>
      <el-main class="main no-padding">
        <el-container class="full-height">
          <el-aside width="250px" class="aside-border">
            <el-container class="full-height no-select">
              <el-header class="no-padding search-header" :class="{ shadow: headerShadow }" height="50px">
                <el-input v-model="keywords" clearable size="small" placeholder="搜索 | 好友 or 群组"
                  prefix-icon="el-icon-search" />
              </el-header>
              <div class="my-btns">
                <!--<el-button size="mini" >全部</el-button>-->
                <el-button size="mini" class="my-btn" :type="onlyRoom ? 'success' : 'info'"
                  @click="onlyUser = false; onlyRoom = !onlyRoom">群组</el-button>
                <el-button size="mini" class="my-btn" :type="onlyUser ? 'success' : 'info'"
                  @click="onlyRoom = false; onlyUser = !onlyUser">好友</el-button>
                <el-button size="mini" class="my-btn" :type="selectAll ? 'success' : 'info'"
                  @click="setSelectAll">{{ selectAll ? '取消全选' : '全选' }}</el-button>
              </div>

              <el-main class="no-padding">
                <el-scrollbar ref="scrollbar2" class="full-height" tag="section" :native="false">
                  <ul class="friend-items no-select">
                    <li v-for="(item, index) in search" :key="index" @click="triggerContacts(item)">
                      <el-avatar class="avatar" style="margin-top: 5px" :size="25" :src="item.avatar">
                        <img src="~@/assets/image/detault-avatar.jpg" />
                      </el-avatar>
                      <span class="nickname max-length" :title="item.nickname">
                        [{{ item.type == 1 ? '友' : '群' }}] {{ item.nickname }}
                      </span>
                      <span class="select-btn">
                        <i class="el-icon-success" :class="{ 'i-color-green': item.checked }" />
                      </span>
                    </li>
                  </ul>
                </el-scrollbar>
              </el-main>
            </el-container>
          </el-aside>

          <el-main class="no-padding">
            <el-container class="full-height">
              <el-header height="40px">
                <el-divider class="no-select" content-position="left">
                  <span style="color: #c4c5c7">
                    已选联系人 ({{ selected.length }})
                  </span>
                </el-divider>
              </el-header>
              <el-main>
                <el-scrollbar :native="false" tag="section" class="full-height">
                  <div class="selectd-items">
                    <div v-for="(item, index) in selected" :key="index" class="selectd-item no-select">
                      <el-avatar :size="25" :src="item.avatar">
                        <img src="~@/assets/image/detault-avatar.jpg" />
                      </el-avatar>
                      <p>{{ item.nickname }}</p>
                      <div class="triangle-topleft" :class="{ group: item.type == 2 }"></div>
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
        <el-button size="small" plain @click="close">取消</el-button>
        <el-button type="primary" size="small" @click="confirm">
          确认选择<span v-show="selected.length">({{ selected.length }})</span>
        </el-button>
      </el-footer>
    </el-container>
  </div>
</template>
<script>

export default {
  name: 'Contacts',
  data() {
    return {
      isShow: false,
      contacts: [],
      keywords: '',
      headerShadow: false,
      onlyUser: false,
      onlyRoom: false,
      selectAll: false,
    }
  },
  computed: {
    selected() {
      return this.search.filter(item => item.checked)
    },
    search() {
      let that = this
      let list = this.contacts.filter(item => {
        let match = item.nickname.match(that.keywords) != null;
        let hit = (!that.onlyRoom || item.type == 2) && (!that.onlyUser || item.type == 1) && (!that.keywords || match);

        if (!hit) {
          item.checked = false;
        }
        return hit;
      })

      let selectAll = list.every(item => {
        return item.checked;
      })
      this.selectAll = selectAll;
      console.log("消息聊天列表", list);
      return list;
    }
  },
  mounted() {
    this.scrollEvent()
  },
  created() {
    this.loadFriends()
    this.loadUserGroups()
  },
  methods: {
    show() {
      this.isShow = true;
    },
    hide() {
      this.isShow = false;
    },
    setSelectAll() {
      let check = this.selectAll;
      this.search.forEach(item => {
        item.checked = !check;
      })
      this.selectAll = !this.selectAll
    },
    //触发选择联系人事件
    triggerContacts(item) {
      let index = this.search.findIndex(val => {
        return val.chatId == item.chatId
      })
      this.search[index].checked = !this.search[index].checked;

      let selectAll = this.search.every(item => {
        return item.checked;
      })
      this.selectAll = selectAll;
    },
    //取消选中的联系人
    delContacts(item) {
      let index = this.search.findIndex(val => {
        return val.chatId == item.chatId
      })

      this.search[index].checked = false
    },
    //移除所有选中选项
    delAll() {
      this.search.forEach((item, i) => {
        this.search[i].checked = false
      })
    },
    //关闭窗口
    close() {
      this.delAll();
      this.isShow = false;
      this.$emit('close');
    },
    //确认按钮点击事件
    confirm() {
      console.log("this.selected", this.selected);
      // const arr = this.selected.map(item => ({
      //   id: item.id,
      //   type: item.type,
      // }))
      let arr = []
      this.selected.forEach((item) => {
        if (item.type == 1) {
          arr.push({
            id: item.id,
            type: item.type,
          })
        } else {
          arr.push({
            id: item.chatId,
            type: item.type,
          })
        }
      })
      this.$emit('confirm', arr);
      this.isShow = false;
    },

    //加载好友列表
    loadFriends() {
      this.contacts.pushAll(this.$store.state.contact.friends)
    },

    //加载群聊列表接口
    loadUserGroups() {
      this.contacts.pushAll(this.$store.state.contact.rooms)
    },

    // 监听自定义滚动条事件
    scrollEvent() {
      let scrollbar2 = this.$refs.scrollbar2;
      if (scrollbar2) {
        let scrollbarEl = scrollbar2.wrap;
        scrollbarEl.onscroll = () => {
          this.headerShadow = scrollbarEl.scrollTop > 0;
        }
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
      }

      .i-color-green {
        color: #26bcfe !important;
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
  flex-wrap: wrap;
  flex-direction: row;
  align-items: flex-start;

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

    .triangle-topleft {
      width: 0;
      height: 0;
      border-top: 15px solid #03a9f4;
      border-right: 15px solid transparent;
      position: absolute;
      top: 0;
      left: 0;

      &.group {
        border-top: 15px solid #ff9800;
      }
    }

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
</style>
