import Vue from 'vue'
import store from '@/store'
import router from '@/router'
import AppMessageEvent from './app-message-event'
import { parseTime } from '@/utils/functions'
import {lastUtils} from '@/utils/my/lastChatUtils'
import {chatUtils} from "@/utils/my/chatUtils";
import {msgConst} from "@/utils/my/const/msgConst";
import {msgData} from "@/utils/data/msgData";
import {chatData} from "@/utils/data/chatData";
import {messageService} from "@/service/messageService";


/**
 * 聊天消息处理
 */
class TalkEvent extends AppMessageEvent {
  /**
   * @var msg 资源
   */
  msg

  /**
   * 初始化构造方法
   *
   * @param {Object} msg Socket消息
   */
  constructor(msg) {
    super()
    this.msg = msg
  }

  handle() {
    const chatId = this.msg.chatId

    if(this.msg.type==msgConst.top){
      return ;
    }

    console.log('收到消息........')
    //收到消息
    msgData.sendMsg(this.msg)
    //移除新会话(本地缓存)
    chatData.delNew(chatId)
    if (!this.isTalkPage()) {
      // this.showMessageNocice(chatId)
      // return false
    }

    const index = lastUtils.findTalkIndex(chatId)

    if (index == -1 && this.msg.type!=msgConst.friend.del && !this.msg.isSend) {
        console.log('会话不存在， 创建.')
      // 判断消息来源是否在对话列表中, 不存在则创建回话
      // this.loadTalkItem()
      lastUtils.createChat(this.msg);
    }

    if (this.isChatting(this.msg.chatId)) {
      this.updateTalkRecord(index)
    } else {
      chatData.unreadAdd(this.msg.chatId)
      this.updateTalkItem(index)
    }
    if (!chatUtils.isCurrentChatMsg(this.msg)) {
        store.commit('INCR_UNREAD_NUM')
    }
  }

  /**
   * 显示消息提示
   *
   * @param {String} chatId
   * @returns
   */
  showMessageNocice(chatId) {
    let source = (chatUtils.isGroupId(chatId)?2:1)
    let tag = source == 1 ? '[私信]' : '[群聊]'
    let nickname = this.msg.nickname
    let group_name = nickname || '好友'
    let content = this.getTalkText()

    this.$notify({
      title: `${tag} 聊天通知`,
      message: `「${group_name}」@${nickname} : ${content}`,
      duration: 3000000,
      customClass: 'talk-notify pointer',
      onClick: function() {
        sessionStorage.setItem('send_message_chat_id', chatId)
        router.push('/index/message')
        this.close()
      },
      position: 'bottom-right',
    })

  }

  /**
   * 更新对话记录
   *
   * @param {Number} index 聊天列表的索引
   */
  updateTalkRecord(index) {
    let record = this.msg
    record.float = record.userId == 0 ? 'center' : record.fromUserId == this.UserId ? 'right' : 'left'

    store.commit('PUSH_MSG', record)

    // 获取聊天面板元素节点
    let elChatPanel = document.getElementById('lumenChatPanel')
    if(elChatPanel){
      // 判断的滚动条是否在底部
      let isBottom =
          Math.ceil(elChatPanel.scrollTop) + elChatPanel.clientHeight >=
          elChatPanel.scrollHeight

      if (isBottom || record.userId == this.UserId) {
        Vue.nextTick(() => {
          // 更新聊天面板滚动条置底
          elChatPanel.scrollTop = elChatPanel.scrollHeight
        })
      } else {
        store.commit('SET_TLAK_UNREAD_MESSAGE', {
          content: this.getTalkText(),
          nickname: record.nickname,
        })
      }

      store.commit('UPDATE_TALK_ITEM', {
        index,
        item: {
          content: this.getTalkText(),
          updateTime: parseTime(new Date()),
        },
      })

      if (
          this.msg.chatType == 1 &&
          this.UserId !== this.msg.userId
      ) {
        // 更新未读消息 ws-todo
        // ServeClearTalkUnreadNum({
        //   type: store.state.dialogue.source,
        //   receive: store.state.dialogue.receive_id,
        // })
      }
    }
  }

  /**
   * 更新对话列表记录
   *
   * @param {Number} index 聊天列表的索引
   */
  updateTalkItem(index) {
    if (index == -1) {
      // 对话列表不存在需请求后端...
      return
    }
    store.commit('UPDATE_TALK_MESSAGE', {
      index,
      item: {
        content: this.getTalkText(),
        updateTime: parseTime(new Date()),
      },
    })
  }

  /**
   * 获取聊天列表左侧的对话信息
   */
  getTalkText() {
    let text = this.msg.content
    switch (this.msg.type) {
      case msgConst.image:
        text = '[图片消息]'
        break
      case msgConst.file:
        text = '[文件消息]'
        break
      case 4:
        text = '[会话记录]'
        break
    }

    return text
  }

  /**
   * 判断用户是否打开对话页
   */
  isTalkPage() {
    let path = router.currentRoute.fullPath
    return !(path != '/message' && path != '/')
  }

  /**
   * 通过消息获取消息对应的对话索引
   */
  getIndexName() {
    return msg.chatId
  }

  /**
   * 加载对接节点
   */
  loadTalkItem() {
    let receive_id = this.msg.fromUserId
    let type = this.msg.chatType

  }
}

export default TalkEvent
