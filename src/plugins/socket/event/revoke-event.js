import AppMessageEvent from './app-message-event'
import store from '@/store'

/**
 * 好友邀请消息处理
 */
class RevokeEvent extends AppMessageEvent {
  /**
   * @var resource 资源
   */
  resource

  /**
   * 初始化构造方法
   *
   * @param {Object} resource Socket消息
   */
  constructor(resource) {
    super()

    this.resource = resource
  }

  handle() {
    if (
      !this.isChatting(
        this.resource.chatType,
        this.resource.chatId,
        this.resource.userId
      )
    ) {
      return false
    }

    let record_id = this.resource.record_id
    let index = store.state.dialogue.records.findIndex(
      item => item.id === record_id
    )

    store.commit('UPDATE_DIALOGUE', {
      index,
      item: {
        is_revoke: 1,
      },
    })
  }
}

export default RevokeEvent
