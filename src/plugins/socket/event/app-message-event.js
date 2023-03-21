import store from '@/store'
import { Notification } from 'element-ui'

/**
 * 处理App消息
 */
class AppMessageEvent {
  /**
   * 初始化
   */
  constructor() {
    this.$notify = Notification
  }

  /**
   * 获取当前登录用户的ID
   */
  get UserId() {
    return store.state.user.userId
  }

  /**
   * 判断消息是否来自当前对话
   *
   * @param {Number} source 聊天消息类型（1：私聊，2：群聊）
   * @param {Number} chatId 接收者ID
   * @param {Number} userId 发送者ID
   */
  isChatting(chatId) {
    return store.state.dialogue.chatId == chatId
  }
}

export default AppMessageEvent
