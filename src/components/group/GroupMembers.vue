<template>
  <div v-show="isShow" class="lum-dialog-mask">
    <el-container class="lum-dialog-box" v-outside.stop="close">
      <el-header class="no-padding header no-select" height="60px">
        <p>请选择成员</p>
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
                  placeholder="搜索 | 好友"
                  prefix-icon="el-icon-search" clearable size="small"
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

                    <li key="-1" @click.stop="triggerAll()">
                      <span class="nickname max-length"  :title="all.nickname">{{all.nickname}}</span>
                      <span class="select-btn">
                        <i class="el-icon-success" :class="{ 'icon-active': all.selected }"/>
                      </span>
                    </li>

                    <li
                      v-for="item in search"
                      :key="item.id"
                      @click.stop="triggerMember(item)"
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
                          :class="{ 'icon-active': item.selected }"
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

              <!--<el-header height="40px" :class="{ mt40: !readonly }">-->
                <!--<el-divider content-position="left" class="no-select">-->
                  <!--<span style="color: #c4c5c7">-->
                    <!--邀请成员 ({{ selected.length }})-->
                  <!--</span>-->
                <!--</el-divider>-->
              <!--</el-header>-->
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
                      <div class="del-mask" @click.stop="delMember(item)">
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

        <el-button type="primary" size="small" @click="submit">
          确定({{ selected.length }})
        </el-button>
      </el-footer>
    </el-container>
  </div>
</template>
<script>
    import {} from '@/api/group'
    import {contactData} from "@/utils/data/contactData"
    import {objectUtils} from "@/utils/my/objectUtils"

    export default {
        name: 'GroupMembers',
        props: {
            roomId: {
                type: [String, Number],
                default: null,
            },
        },
        data() {
            return {
                all: {
                  userId: -1,
                  nickname: '全体成员',
                  selected: false
                },
                isShow: false,
                readonly: false,
                // members: [],
                // search: [],
                searchHeaderShadow: false,
                keywords: '',
                isAvatarCropper: false,
            }
        },
        computed: {
            selected() {
              if(this.all.selected)return [this.all]
              return this.members.filter(item => item.selected)
            },
            search() {
                let members = this.keywords == ''
                    ? this.members
                    : this.members.filter(item => {
                        return item.nickname.match(this.keywords) != null
                    })
                return members;
            },
            room(){
                if(this.roomId) return contactData.getRoomById(this.roomId);
                return {};
            },
            members(){
                let members = []
                if(this.room && this.room.members) {
                    members = this.room.members
                    // members = objectUtils.clone(this.room.members)
                    // members.forEach(member => {
                    //     member.selected = false;
                    // })
                }
                return members;
            }
        },
      watch:{
        'all.selected'(val){
          //如果选中， 设置其他为非选中
          if(val){
            this.members.forEach(member=>{
                member.selected = false
            })
          }
        }
      },
        created() {
            // this.members = contactData.getRoomMembers(this.roomId)
        },
        mounted() {
            this.handleScroll()
        },
        methods: {
            // 触发选择联系人事件
            triggerMember(item) {
              if(!this.all.selected){
                this.search.forEach(member=>{
                  if(member.userId == item.userId){
                    member.selected = !member.selected;
                  }
                })
              }
            },
            triggerAll(){
                this.all.selected=!this.all.selected;
            },
            // 取消选中的联系人
            delMember(item) {
                this.search.forEach(member=>{
                    if(member.userId == item.userId){
                        member.selected = false
                    }
                })
            },

            // 移除所有选中选项
            delAll() {
                this.search.forEach(member=>{
                    member.selected = false
                })
            },

            // 关闭窗口
            close() {
                this.isShow = false
            },
            show(){
                this.isShow = true
            },
            //好友邀请提交
            submit() {
              let selecteds = []
              if(this.all.selected){
                selecteds = [this.all]
              }else{
                selecteds = this.selected.map(item => {
                  return {
                    userId: item.userId,
                    nickname: item.nickname
                  }
                })
              }
                this.$emit('submit', selecteds)
                this.isShow = false
            },

            // 滚动条监听
            handleScroll() {
                this.$nextTick(()=>{
                    let el = this.$refs.scrollbar;
                    if(el){
                        let scrollbarEl = el.wrap
                        scrollbarEl.onscroll = () => {
                            this.searchHeaderShadow = scrollbarEl.scrollTop != 0
                        }
                    }
                })
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
