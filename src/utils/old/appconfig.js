//let apiUrl=
// let uploadUrl=
export const AppConfig = {
	host: '',
	init: false,
	// apiUrl: 'http://124.222.102.202:8094', // 接口地址
	// apiUrlParams: 'http://124.222.102.202:8094', // 接口地址 修改域名时改此字段名  10.10.10.118
	// uploadServer: 'http://124.222.102.202:8088', //上传图片地址
	// uploadServerParams: 'http://124.222.102.202:8088', //上传图片地址 修改域名时改此字段名
	// initUrl: '124.222.102.202', //域名修改，修改域名时改此字段名
	apiUrl: 'http://10.10.10.118:8094', // 接口地址
	apiUrlParams: 'http://10.10.10.118:8094', // 接口地址 修改域名时改此字段名  10.10.10.118
	uploadServer: 'http://10.10.10.118:8088', //上传图片地址
	uploadServerParams: 'http://10.10.10.118:8088', //上传图片地址 修改域名时改此字段名
	initUrl: '10.10.10.118', //域名修改，修改域名时改此字段名
	keepalive: 70, //xmpp 心跳间隔
	websocketUrl: '', //xmpp 主机的 地址
	fileServer: '',
	downloadAvatarUrl: '',
	registerInviteCode: 0, //注册邀请码  0：关闭 1:一码一用(注册型邀请码)  2：一码多用（推广型邀请码）
	isOpenSMSCode: 0, //是否开短信验证码
	regeditPhoneOrName: 0, // 注册方式 0:手机号注册，1：用户名注册
	jitsiServer: '', //jitsi 音视频链接地址
	meetingHost: '',
	companyId: '',
	departmentId: '',
	uploadUrl: '',
	uploadAvatarUrl: '',
	uploadGroupAvatarUrl: '',
	uploadVoiceUrl: '',
	deleteFileUrl: '',
	avatarBase: '',
	defaultAvatarUrl: '',
	isOpenReceipt: 1,
	isOpenRoomSearch: null,
	displayRedPacket: null,
	apiKey: '5e29f483c48848',
	version: '1.4.8', //每次更新上传版本，此处手动改版本号，以及增加版本信息
	//1.4.7 此版本加上了1.网络延时显示 2.版本号显示
	//1.4.8 此版本加上了1.
};
