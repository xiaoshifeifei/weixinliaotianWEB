export const msgConst = {
	// /**
	//  * 消息类型：商务圈消息
	//  */
	// NEW_COMMENT: 600,// 新评论
	// _601: 601,// 新礼物
	// _602: 602,// 新赞
	// _603: 603,// 新公共消息
	//
	//
	// /**
	//  * 消息类型：音视频通话 会议消息
	//  */
	// //单聊 语音
	// VOICE_ASK: 100,//询问能否接听语音通话
	// VOICE_ANSWER: 101,//确定可以接听语音通话
	// VOICE_CONNECT: 102,//接听语音通话无用
	// VOICE_CANCEL: 103,//拒绝取消语音拨号
	// VOICE_STOP: 104,//接通后结束语音通话
	// //单聊视频
	// VIDEO_ASK: 110,//询问能否接听通话
	// VIDEO_ANSWER: 111,//确定可以接听通话
	// VIDEO_CONNECT: 112,//接听通话  无用
	// VIDEO_CANCEL: 113,//拒绝取消拨号
	// VIDEO_STOP: 114,//接通后结束通话
	// //视频会议
	// Conference_VIDEO_INVITE: 115,//邀请进行视频会议
	// Conference_VIDEO_JOIN: 116,//加入视频会议
	// Conference_VIDEO_EXIT: 117,//退出视频会议
	// Conference_VIDEO_OUT: 118,//踢出视频会议
	// //语音会议
	// Conference_VOICE_INVITE: 120,//邀请进行视频会议
	// Conference_VOICE_JOIN: 121,//加入视频会议
	// Conference_VOICE_EXIT: 122,//退出视频会议
	// Conference_VOICE_OUT: 123,//踢出视频会议
	// COMMENT: 27, // 通知评论消息

	DEVICEONLINE: 200, //用户的其它设备上线

	top: 802,

	/**
	 * 消息类型：新朋友消息
	 */
	friend: {
		say_hello: 500, // 打招呼
		new_see: 503, // 新关注

		pass: 501, // 同意加好友
		feed_back: 502, // 回话, 待处理
		del_see: 504, // 删除关注
		del: 505, // 彻底删除
		recommend: 506, // 新推荐好友
		black: 507, // 黑名单
		friend: 508, // 直接成为好友
		del_black: 509, //取消黑名单
	},

	read: 26, // 是否已读的回执类型
	red: 28, // 红包消息
	transfer: 29, // 转账消息
	TIP: 10, // 自己添加的消息类型,代表系统的提示
	IMAGE_TEXT: 80, // 单条图文
	IMAGE_TEXT_MANY: 81, // 多条图文
	red_receive: 83, //
	answer: 94, // 回复消息

	////////////////////////////以下为在聊天界面显示的类型/////////////////////////////////
	text: 1, // 文字
	image: 2, // 图片
	voice: 3, // 语音
	location: 4, // 位置
	gif: 5, // gif
	video: 6, // 视频
	audio: 7, // 音频
	card: 8, // 名片
	file: 9, //文件
	revoke: 202, //撤回消息
	input: 201, // 正在输入消息

	device_online: 200, //用户的其它设备上线
	DEVICE_UPDATE_SETTING: 800, //多设备更新用户设置
	DEVICE_UPDATE_USER_INFO: 801, //多设备更新用户信息

	// 群聊通知类推送
	group: {
		all_gag: 920, // 全禁言
		set_read: 915, // 设置群已读
		set_manager: 913, // 取消、设置管理员
		add_member: 907, // 增加新成员
		gag: 906, // 禁言
		add_notice: 905, // 新公告
		del_member: 904, // 删除成员
		del_members: 942, // 踢出并清空所有消息
		del_room: 903, // 删除房间
		change_root_name: 902, //修改房间名
		change_member_name: 901, // 修改昵称
		in: 900, // 已进群
		out: 901, // 已退群
	},
};
