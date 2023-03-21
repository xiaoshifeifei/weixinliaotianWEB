// areaCode: "86"
// like[write]: "on"
// password: "123456"
// telephone: "1334"
import { getCurrentMilliSeconds, isNil } from '@/utils/utils';
import { ApiAuthUtils } from '@/utils/apiAuthUtils';
import { post } from '@/utils/request';
import { AppConfig } from '@/utils/old/appconfig';
import { setToken } from '@/utils/auth';
import { ServeGetContacts } from './contacts';
import { busService } from '@/service/busService';
import { chatApi } from '@/api/chatApi';
import { lastUtils } from '@/utils/my/lastChatUtils';
import store from '@/store';
import { roomApi } from '@/api/group';
import { loginCacheData } from '@/utils/data/loginData';
import { WEBIM } from '@/utils/old/webim';
import { imSdk } from '@/utils/old/websocket_sdk';

export function login(loginInfo, handler) {
	loginInfo.salt = getCurrentMilliSeconds();
	// 获取随机code
	loginInfo.account = loginInfo.mobile;
	loginInfo.access_token = '';
	setToken('');
	loginInfo.apiKey = AppConfig.apiKey;

	loginInfo.areaCode = '86';
	getLoginCode(
		loginInfo,
		function(codeResult) {
			console.log(
				' getLoginCode JSON codeResult : ' + JSON.stringify(codeResult)
			);
			// 获取加密私钥
			let privateKey = {};
			let code = codeResult.code;
			privateKey.userId = codeResult.userId;
			privateKey.salt = getCurrentMilliSeconds();
			privateKey.apiKey = AppConfig.apiKey;
			privateKey.pwd = loginInfo.password;
			privateKey.areaCode = loginInfo.areaCode;
			privateKey.account = loginInfo.account;
			getLoginPrivateKey(
				privateKey,
				function(privateKeyResult) {
					let pKey = privateKeyResult.data.privateKey;
					var userLogin = {};
					userLogin.salt = getCurrentMilliSeconds();
					userLogin.userId = privateKey.userId;
					userLogin.apiKey = AppConfig.apiKey;
					userLogin.pwd = loginInfo.password;
					userLogin.privateKey = pKey;
					console.log(
						' getLoginPrivateKey JSON privateKeyResult : ' +
							JSON.stringify(privateKeyResult)
					);

					if (isNil(code)) {
						getLoginCode(loginInfo, function(codeData) {
							code = codeData.code;
							userLogin.code = code;
							getUserLoginV1(
								userLogin,
								code,
								pKey,
								loginInfo,
								handler
							);
						});
					} else {
						userLogin.code = code;
						getUserLoginV1(
							userLogin,
							code,
							pKey,
							loginInfo,
							handler
						);
					}
				},
				handler
			);
		},
		handler
	);
	return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
}

/**
 * 初始化：
 *  下载好友和群组信息
 */
export function initData() {
	// console.log(11111111);
	//下载所有好友和群组， 存储到ls， key为userId_friend_fid(userId_group_gid)
	ServeGetContacts().then((res) => {
		// console.log(222222,res.data);
		let friends = res.data.pageData.filter((item) => {
			// 客户账号为10000，当前设置不能添加客服
			// if(item.toUserId!=10000){
			//     return item
			// }
			return item;
		});
		console.log('info-301, friends=', friends);
		let userId = store.state.user.userId;
		//ws-todo 缓存
		// setTimeout(() => {
		//     sessionStorage.setItem("isFalse",1)
		// }, 3000);
		roomApi.listRoom().then((res) => {
			let rooms = res.data;
			//ws-todo 缓存
			store.commit('contact_init', {
				friends: friends,
				rooms: rooms,
			});
			console.log('login-Rooms元数据', rooms);
			chatApi
				.listChat()
				.then(({ resultCode, data }) => {
					if (resultCode != 1) return false;
					data = data.filter((item) => {
						// 修改 原为客服判定
						// if(item.jid!=10000){
						//     return item
						// }
						return item;
					});
					store.commit('chats_init', data);
					console.log('6. 初始化数据完成， 传播事件。', data);
					var random_sum = Math.random();
					var myparams =
						store.state.user.avatar + '&time=' + random_sum;
					store.state.user.avatar = myparams;
					busService.emit('init-success');
				})
				.finally(() => {});
		});
	});
}

function getUserLoginV1(obj, code, pKey, loginInfo, handler) {
	if (WEBIM.isConnect()) {
		WEBIM.disconnect();
		clearInterval(imSdk.ping);
		imSdk.sendReceiptTask = null;
	}
	obj = ApiAuthUtils.getUserLoginV1Param_Forge(obj);
	post('/api/user/login/v1', obj).then((result) => {
		if (1 == result.resultCode) {
			let loginResult = result.data;
			console.log(
				' getUserLoginV1 JSON loginResult : ' +
					JSON.stringify(loginResult)
			);
			let userInfo = ApiAuthUtils.decryptLoginSuccessData(
				loginResult.data,
				code,
				pKey,
				loginInfo.password
			);
			userInfo = JSON.parse(userInfo);

			// 保存授权信息到本地缓存
			userInfo.account = loginInfo.account;
			userInfo.areaCode = loginInfo.areaCode;
			userInfo.password = loginInfo.password;
			userInfo.platform = loginInfo.platform;
			//设置store之前添加账号信息缓存
			loginCacheData.addNew(userInfo);
			//
			store.commit('UPDATE_USER_INFO', userInfo);
			store.commit('UPDATE_LOGIN_STATUS');
			setToken(userInfo.access_token);
			sessionStorage.setItem('myData', JSON.stringify(userInfo));
			// SocketInstance.connect();
			console.log('3. 登录成功， 传播事件。');
			busService.emit('login-success', userInfo);
			handler({
				code: 1,
				data: userInfo,
			});
		}
	});
}

function getLoginCode(obj, callback, fail) {
	obj = ApiAuthUtils.getLoginCodeParam(obj);
	console.log('AuthortyLogin objParam : ' + JSON.stringify(obj));
	post('/api/auth/getLoginCode', null, { data: obj }).then((result) => {
		if (1 == result.resultCode) {
			if (callback) callback(result.data);
		} else {
			fail({
				code: -1,
				msg: result.resultMsg,
			});
		}
	});
}

/**
 * 获取加密私钥
 * /authkeys/getLoginPrivateKey?userId=10010304&mac=lBKrHBAIPkPHQGxSxN60rA==&language=zh&salt=1567664162180&secret=LYZKo0ARWdNDXQ+GJfR78A==&
 */
function getLoginPrivateKey(obj, callback, handler) {
	obj = ApiAuthUtils.getLoginPrivateKeyParam(obj);
	let that = this;
	post('/api/authkeys/getLoginPrivateKey', obj).then((result) => {
		if (1 == result.resultCode) {
			let baseResult;
			if (isNil(result.data)) {
				// 上传公私钥
				uploadLoginKey(obj, function(uploadResult) {
					if (1 == uploadResult.resultCode) {
						console.log(
							'uploadLoginKey uploadResult',
							JSON.stringify(uploadResult)
						);
						let privateKey = {};
						privateKey.userId = obj.userId;
						privateKey.salt = obj.salt;
						privateKey.apiKey = AppConfig.apiKey;
						privateKey.pwd = obj.pwd;
						privateKey.salt = obj.salt;
						getLoginPrivateKey(privateKey, callback, handler);
					}
				});
			}
			if (isNil(result.data)) {
				result = baseResult;
			}
			console.log(
				'getLoginPrivateKey result data: ' + JSON.stringify(result.data)
			);
			// 获取私钥
			if (callback) callback(result);
		} else {
			handler({ code: -1, msg: '获取私钥失败.' });
		}
	});
}

/**
 * 上传RSA公私钥
 */
function uploadLoginKey(obj, callback) {
	obj = ApiAuthUtils.uploadLoginKeyParam(obj);
	// obj = ApiAuthUtils.uploadLoginKeyParam_Forge(obj);
	post('/api/authkeys/uploadLoginKey', obj).then((result) => {
		if (1 == result.resultCode) {
			if (callback) callback(result);
		}
	});
}
