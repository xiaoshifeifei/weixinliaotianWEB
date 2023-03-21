import AppMessageEvent from './app-message-event'
import store from '@/store'
/**
 * 好友邀请消息处理
 */
class LoginEvent extends AppMessageEvent {
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
    store.dispatch('ACT_UPDATE_FRIEND_STATUS', {
      status: this.resource.status,
      friendId: parseInt(this.resource.userId),
    })
  }
}

export default LoginEvent
