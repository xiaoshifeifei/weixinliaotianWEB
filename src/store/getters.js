const getters = {
  // 用户登录状态
  loginStatus: state => state.user.loginStatus,
  // socket 连接状态
  socketStatus: state => state.socketStatus,
  transitionGroup: state => {
    const trans = require('@/assets/transform/transform.js')
    //transition: 'slipRight',
    return trans.slipRight
  }
}

export default getters
