<template>
	<div id="app">
		<keep-alive>
			<router-view v-if="showView" />
		</keep-alive>
	</div>
</template>
<script>
import { httpConfig, httpSetLogin } from '@/api/user';
import { getToken } from '@/utils/auth';
import { WEBIM } from '@/utils/old/webim';
import { busService } from '@/service/busService';
import { AppConfig } from '@/utils/old/appconfig';
import { eventConst } from '@/utils/my/const/eventConst';
import { imSdk } from '@/utils/old/websocket_sdk';
import { appUtils } from '@/utils/my/appUtils';
import { getUserInfo } from '@/utils/auth';
import { Notification } from 'element-ui';

export default {
	name: 'App',
	data() {
		return {
			// 用于点击当前页的router时，刷新当前页
			showView: true,
		};
	},
	beforeCreate() {},
	mounted() {
		window.addEventListener('beforeunload', this.solveBeforeUnload);
	},
	destroyed() {
		window.removeEventListener('beforeunload', this.solveBeforeUnload);
	},
	created() {
		if (sessionStorage.getItem('myData')) {
			this.getdata();
		} else {
			if (sessionStorage.getItem('sx') == 2) {
				this.$confirm(`该账号在其他设备登陆过,请重新登录`, '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning',
					center: true,
					dangerouslyUseHTMLString: true,
				})
					.then(() => {
						sessionStorage.setItem('sx', null);

						location.reload();
					})
					.catch((err) => {
						sessionStorage.setItem('sx', null);
						// localStorage.clear();
						// sessionStorage.clear();
						location.reload();
					});
			}
		}
		let that = this;
		//获取配置信息
		httpConfig(function() {
			//不存在登录信息， 且非登录页， 进入登录页， 监听登录成功
			if (!that.$store.state.user.account) {
				if (window.location.href.indexOf('/login?USER') != -1) {
				} else {
					that.$router.push({
						path: '/login',
					});
				}
			}
		});

		busService.on('login-success', function(userInfo) {
			that.connect();
		});

		busService.on('init-success', function() {
			if ('/index/message' != that.$route.path) {
				that.$router.push('/index/message');
			}
			// that.$store.commit('reset_chat', null)
		});

		busService.on('go-login', function() {
			// debugger;
			console.log(
				"sessionStorage.getItem('sx')",
				sessionStorage.getItem('sx')
			);
			WEBIM.disconnect();
			clearInterval(imSdk.ping);
			imSdk.sendReceiptTask = null;
			// localStorage.clear();
			// 			sessionStorage.clear();
			if (sessionStorage.getItem('sx') == 1) {
				for (let i = 1; i < 100000; i++) {
					clearInterval(i);
				}
				sessionStorage.setItem('sx', null);
				that.$router.push({
					path: '/login',
				});
				location.reload();
			} else if (sessionStorage.getItem('sx') == 2) {
				Notification({
					title: '提示',
					message: '该账号在其他设备登陆过,请重新登录',
					position: 'top-right',
				});
				sessionStorage.setItem('se', 1);
				location.reload(true);
			}
			that.$store.commit('clear_login');
		});

		busService.on(eventConst.connect, function() {
			that.$store.commit('init_data');
			that.$store.commit('UPDATE_SOCKET_STATUS', true);
			imSdk.lockReconnect = false;
		});
	},
	methods: {
		solveBeforeUnload() {
			console.log('监听浏览器关闭,停止链接websocket');
			// localStorage.clear();
			// sessionStorage.clear();
			imSdk.disconnect();
			clearInterval(imSdk.ping);
			imSdk.sendReceiptTask = null;
		},
		getdata() {
			// 获取用户信息
			let userInfo = getUserInfo();
			if (userInfo.avatar) {
				this.$store.state.user.avatar = '';
				var random_sum = Math.random();
				userInfo.avatar = userInfo.avatar + '&time=' + random_sum;
				this.$nextTick(() => {
					this.$store.state.user.avatar = userInfo.avatar;
				});
			}
			// sessionStorage.setItem("isFalse",1)
			let that = this;
			WEBIM.initWebIM(
				'ws://' + AppConfig.initUrl + ':5260',
				this.$store.state.user.userId,
				appUtils.getEnv(),
				getToken(),
				AppConfig.keepalive,
				this.$store.state.user.nickname
			);
			httpSetLogin().then(({ resultCode, data }) => {
				if (resultCode) {
					try {
						WEBIM.loginIM();
					} catch (ex) {
						console.log(ex);
					}
				}
			});
		},
		connect() {
			let that = this;
			WEBIM.initWebIM(
				AppConfig.websocketUrl,
				this.$store.state.user.userId,
				appUtils.getEnv(),
				getToken(),
				AppConfig.keepalive,
				this.$store.state.user.nickname
			);

			httpSetLogin().then(({ resultCode, data }) => {
				if (resultCode) {
					// var logoutTime = DataUtils.getLogoutTime();
					// console.log("autoLogin " + JSON.stringify(result));
					// myData.nickname = result.nickname;
					// myData.settings = result.settings;
					// myData.multipleDevices = result.settings.multipleDevices;
					// if (1 == myData.multipleDevices)
					//     myData.resource = "web";
					// myData.jid = store.state.user.userId + "/" + myData.resource;
					try {
						WEBIM.loginIM();
					} catch (ex) {
						console.log(ex);
					}
				}
			});
		},

		// 刷新当前路由方法
		refreshView() {
			this.showView = false;
			this.$nextTick(() => (this.showView = true));
		},
	},
};
</script>
