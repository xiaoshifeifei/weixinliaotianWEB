import { post, get } from '@/utils/request';
import { AppConfig } from '@/utils/old/appconfig';
import { getCurrentMilliSeconds, isNil } from '@/utils/utils';
import store from '@/store';
import { ApiAuthUtils } from '@/utils/apiAuthUtils';
import { EncryptUtils } from '@/utils/encryptUtils';
import CryptoJS from 'crypto-js';
import { getToken } from '@/utils/auth';

// 注册服务接口
export const httpConfig = (callback) => {
	if (AppConfig.init) {
		callback();
	} else {
		return get('/api/config', {}).then((res) => {
			sessionStorage.setItem('isShowRevoke', res.data.isShowRevoke);
			var result = res.data;
			//覆盖api接口地址
			if (!isNil(result.apiUrl)) {
				// if(result.apiUrl.endsWith("/")){
				//   result.apiUrl+="__";
				//   result.apiUrl=result.apiUrl.replace("/__","");
				// }
				AppConfig.apiUrl = result.apiUrl;
			}
			// AppConfig.apiUrl='http://www.baidu.com';
			// console.log(AppConfig.apiUrl)
			//覆盖xmpp服务器接口
			if (!isNil(result.XMPPHost)) {
				AppConfig.websocketUrl = 'ws://' + result.XMPPHost + ':5260';
			}

			//上传
			if (!isNil(result.uploadUrl)) {
				AppConfig.uploadServer = result.uploadUrl;
			}
			if (!isNil(result.downloadUrl)) {
				AppConfig.fileServer = result.downloadUrl;
			}
			if (!isNil(result.downloadAvatarUrl)) {
				AppConfig.downloadAvatarUrl = result.downloadAvatarUrl;
			}

			if (!isNil(result.registerInviteCode)) {
				AppConfig.registerInviteCode = result.registerInviteCode;
			}

			if (!isNil(result.apiKey)) {
				AppConfig.apiKey = result.apiKey;
			}

			if (!isNil(result.isOpenReceipt)) {
				AppConfig.isOpenReceipt = result.isOpenReceipt;
			}

			if (!isNil(result.isOpenSMSCode)) {
				AppConfig.isOpenSMSCode = result.isOpenSMSCode;
			}
			let accountType = result.regeditPhoneOrName;
			if (!isNil(accountType)) {
				AppConfig.regeditPhoneOrName = accountType;
				store.commit('set_accountType', accountType);
			}
			if (result.jitsiServer) {
				AppConfig.jitsiServer = result.jitsiServer.replace(
					'https://',
					''
				);
			}

			if (!isNil(result.meetingHost)) {
				AppConfig.meetingHost = result.meetingHost;
			}

			AppConfig.companyId = result.customer_companyId; //客服模块公司id
			AppConfig.departmentId = result.customer_departmentId; //客服部门id

			// AppConfig.uploadUrl=AppConfig.uploadServer+"upload/UploadifyServlet";
			AppConfig.uploadUrl = '/file/upload/UploadServlet';
			// AppConfig.uploadAvatarUrl=AppConfig.uploadServer+"/file/upload/UploadifyAvatarServlet";
			AppConfig.uploadAvatarUrl = '/file/upload/UploadAvatarServlet';
			// AppConfig.uploadGroupAvatarUrl=AppConfig.uploadServer+"upload/GroupAvatarServlet";
			AppConfig.uploadGroupAvatarUrl = '/file/upload/GroupAvatarServlet';
			// AppConfig.uploadVoiceUrl=AppConfig.uploadServer+"upload/UploadVoiceServlet";
			AppConfig.uploadVoiceUrl = '/file/upload/UploadVoiceServlet';
			// AppConfig.deleteFileUrl=AppConfig.uploadServer+"upload/deleteFileServlet";
			AppConfig.deleteFileUrl = '/file/upload/deleteFileServlet';

			AppConfig.avatarBase = AppConfig.downloadAvatarUrl + 'avatar/o/';
			AppConfig.defaultAvatarUrl =
				AppConfig.downloadAvatarUrl + 'avatar/t/104/10000104.jpg';
			AppConfig.defaultAvatarUrl =
				AppConfig.downloadAvatarUrl + 'image/ic_avatar.png';

			if (result.xmppPingTime) {
				AppConfig.keepalive = result.xmppPingTime;
			}

			AppConfig.isOpenReceipt = result.isOpenReceipt;
			if (1 == AppConfig.isOpenReceipt) {
				AppConfig.isOpenReceipt = 1;
			}

			AppConfig.isOpenReceipt = 1;

			AppConfig.isOpenSMSCode = result.isOpenSMSCode;
			AppConfig.registerInviteCode = result.registerInviteCode;
			AppConfig.regeditPhoneOrName = result.regeditPhoneOrName;
			AppConfig.isOpenRoomSearch = isNil(result.isOpenRoomSearch)
				? 1
				: result.isOpenRoomSearch;

			AppConfig.displayRedPacket = result.displayRedPacket;

			callback();
		});
	}
};

export const userApi = {
	getOnLineDevice: function(userId) {
		return get('/api/user/getOnLineDevice', {
			userId: userId,
		});
	},
	get: (userId) => {
		return post('/api/user/get', { userId: userId });
	},
	acceptFriend: (userId) => {
		return post('/api/friends/add', { toUserId: userId });
	},
	getFriend: (userId) => {
		return post('/api/friends/get', { toUserId: userId });
	},
	//请求好友
	requestFriend: (userId) => {
		return post('/api/friends/attention/add', { toUserId: userId });
	},
	//
	register: (data) => {
		data.salt = getCurrentMilliSeconds();
		data = ApiAuthUtils.userRegeditParam(data);
		return post('/api/user/register/v1', data);
	},

	//发红包流程
	//
	// 发红包的时候，第一步，首先检查余额 。
	// 第二步检查是否设置支付密码，如果没有就去设置支付密码
	// 第三步校验支付密码，
	// 第四步获取加固临时密码，
	// 第五步，如果获取加固临时密码的时候返回null，说明服务器上没有上传公私钥，
	// 所有要上传公私钥，上传私钥公私钥成功后重新获取code，（重新获取获取加固临时密码）
	// 第六步 在调用发红包接口
	//
	//
	// 第一步接口  user/getUserMoeny
	// 第二步接口 user/get 中isPayPassword字段。设置支付密码接口 user/update/payPassword
	// 第三部校验支付密码接口。 user/checkPayPassword
	// 第四部获取加固临时密码接口。 transaction/getCode  参数 access_token  salt  Mac
	// 第五部上传公钥和私钥 authkeys/uploadPayKey  参数 access_token  privateKey  publicKey  Mac
	// 第六步发红包接口 redPacket/sendRedPacket/v2  参数 access_token  codeId   data
	// 参数 主要是data 通过@ type moneyStr count greetings （roomJid 或toUserId ）     code ，time（当前时间戳+服务器时间与本地时间的时间差），
	// payPassword 加密演变而来的，参考之前的项目
	//
	//
	// 注意。流程和接口就是上述这几步，具体参数值 请参考老项目，因为尤其是第六步的发红包接口中的data，是比较复杂的
	getMoney() {
		return get('/api/user/getUserMoeny');
	},

	//获取加固临时密码接口
	//{
	// code: "nK1Mb6fVqmPJ/OIP/10GLMcu6DoT1tPOFxSsC5w5Cm9Ej54k5pyiWwsPCMUpEJU4dWyptvFcbYtv20l4chQSQ6ixmvNsu3RirsPdMCutMX14i5q
	//        DzE2R0f6Pnep/1Imdnchq6hgNfKDp0NmrNnFnHrIhBE4xSfVqXm19pLaE4lI="
	// codeId: "01cc63ddde1c4cb889d5f224140630f0"
	// }
	getTmpCode() {
		let userInfo = store.state.user;
		let userId = userInfo.userId;
		let access_token = getToken();
		let salt = getCurrentMilliSeconds();
		let macVal = AppConfig.apiKey + userId + access_token + salt;

		// let payPassword = userInfo.payPassword
		let payPassword = '123456';
		let md5pwd = CryptoJS.MD5(payPassword);

		let encryptAES = EncryptUtils.encryptAES(userId + '', md5pwd);
		let md5Aes = CryptoJS.MD5(encryptAES.ciphertext);

		let encode = CryptoJS.enc.Hex.stringify(md5Aes);
		let mac = EncryptUtils.encryptMacToBase64(macVal, encode);
		return get('/api/transaction/getCode', { mac: mac, salt: salt });
	},

	getPrivateKey() {
		return get('/api/authkeys/getPayPrivateKey');
	},

	//校验支付密码接口 ws-todo: 参数？
	checkPass() {
		return get('user/checkPayPassword');
	},

	//设置密码 ws-todo: 参数？
	setPass() {
		return post('user/update/payPassword', {});
	},
};

// 修改个人信息服务接口
export const ServeUpdateUserDetail = (data) => {
	// nickname: 13341
	// sex: 0
	// birthday: 1624579200
	return post('/api/user/update', data);
};

export const httpSetLogin = () => {
	return post('/api/user/login/auto', {});
};
export const httpPing = () => {
	return get('/api/_ping', {});
};

// 登录服务接口
// areaCode: "86"
// like[write]: "on"
// password: "123456"
// telephone: "1334"

// 注册服务接口
export const ServeRegister = (data) => {
	return post('/api/v1/auth/register', data);
};

// 退出登录服务接口
export const ServeLogout = (data) => {
	return post('/api/v1/auth/logout', data);
};

// 刷新登录Token服务接口
export const ServeRefreshToken = () => {
	return post('/api/v1/auth/refresh-token');
};

// 修改密码服务接口
export const ServeUpdatePassword = (data) => {
	return post('/api/v1/users/change-password', data);
};

// 修改手机号服务接口
export const ServeUpdateMobile = (data) => {
	return post('/api/v1/users/change-mobile', data);
};

// 修改手机号服务接口
export const ServeUpdateEmail = (data) => {
	return post('/api/v1/users/change-email', data);
};

// 发送手机号修改验证码服务接口
export const ServeSendMobileCode = (data) => {
	return post('/api/v1/users/send-mobile-code', data);
};

// 发送找回密码验证码
export const ServeSendVerifyCode = (data) => {
	return post('/api/v1/auth/send-verify-code', data);
};

// 找回密码服务
export const ServeForgetPassword = (data) => {
	return post('/api/v1/auth/forget-password', data);
};

// 获取用户相关设置信息
export const ServeGetUserSetting = () => {
	return get('/api/v1/users/setting');
};

// 发送邮箱验证码服务接口
export const ServeSendEmailCode = (data) => {
	return post('/api/v1/users/send-change-email-code', data);
};
