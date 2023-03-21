const detaultAvatar = require('@/assets/image/detault-avatar.jpg')

// 根级别的 state
const state = {
  socketStatus: false,
  website_name: process.env.VUE_APP_WEBSITE_NAME,
  copyright: `©2020 - 2021 ${process.env.VUE_APP_WEBSITE_NAME} 在线聊天 `,

  // 头像加载失败后的默认头像
  detaultAvatar: "this.src='" + detaultAvatar + "'",
}

export default state
