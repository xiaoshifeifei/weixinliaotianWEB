<template>
	<div class="login-page">
		<div class="head-drag"></div>
		<img
			v-if="$store.state.user.isPc"
			@click="closeWindow"
			class="login-app-btn"
			style="width: 18px;"
			src="static/img/tools/close.png"
		/>
		<el-container id="auth-container">
			<el-main>
				<!--<div id="logo-name" class="animated slideInLeft">-->
				<!--{{ $store.state.website_name }}-->
				<!--</div>-->
				<div id="login-box">
					<div class="header">快捷登录</div>
					<div class="main">
						<el-form ref="form" :model="form" :rules="rules">
							<el-form-item prop="username">
								<!--<el-input-->
								<!--v-model="form.username"-->
								<!--placeholder="手机号"-->
								<!--class="cuborder-radius"-->
								<!--maxlength="11"-->
								<!--@keyup.enter.native="onSubmit('form')"-->
								<!--&gt;-->
								<!--<country-code-selector v-if="accountType==0" slot="prepend" :countryCode.sync="form.areaCode"></country-code-selector>-->
								<!--</el-input>-->

								<el-autocomplete
									class="inline-input area-code-input"
									v-model="form.username"
									:fetch-suggestions="searchAcc"
									placeholder="请输入内容"
									@select="selectAcc"
								>
									<country-code-selector
										v-if="accountType == 0"
										slot="prepend"
										:countryCode.sync="form.areaCode"
									></country-code-selector>
								</el-autocomplete>
							</el-form-item>
							<el-form-item prop="password">
								<el-input
									v-model="form.password"
									type="password"
									placeholder="密码"
									class="cuborder-radius"
									@keyup.enter.native="onSubmit('form')"
								/>
							</el-form-item>
							<el-form-item>
								<el-button
									type="primary"
									class="submit-btn"
									:loading="loginLoading"
									@click="onSubmit('form')"
									>立即登录
								</el-button>
							</el-form-item>
							<el-form-item>
								<div class="links">
									<!--<el-link-->
									<!--type="primary"-->
									<!--:underline="false"-->
									<!--@click="toLink('/forget')"-->
									<!--&gt;找回密码-->
									<!--</el-link>-->
									<el-link
										type="primary"
										:underline="false"
										@click="toLink('/register')"
										>还没有账号？立即注册
									</el-link>
								</div>
							</el-form-item>

							<!--<p style="margin-top: 50px">-->
							<!--<el-divider>-->
							<!--<span style="color: rgb(181, 176, 176); font-weight: 200">-->
							<!--<i class="el-icon-mobile-phone" /> 预览账号-->
							<!--</span>-->
							<!--</el-divider>-->
							<!--</p>-->
							<!--<el-form-item class="preview-account">-->
							<!--<p>预览账号:18798272054 / 密码: admin123</p>-->
							<!--<p>预览账号:18798272055 / 密码: admin123</p>-->
							<!--</el-form-item>-->
						</el-form>
					</div>
				</div>
				<!--<div class="copyright" v-html="$store.state.copyright"></div>-->
			</el-main>
		</el-container>
		<div class="fly-box">
			<div class="fly bg-fly-circle1"></div>
			<div class="fly bg-fly-circle2"></div>
			<div class="fly bg-fly-circle3"></div>
			<div class="fly bg-fly-circle4"></div>
		</div>
	</div>
</template>
<script>
import { isMobile } from '@/utils/validate';
import { login } from '@/api/login';
import { electronService } from '@/service/electronService';
import { loginCacheData } from '@/utils/data/loginData';
import { appUtils } from '@/utils/my/appUtils';
import { WEBIM } from '@/utils/old/webim';
import { imSdk } from '@/utils/old/websocket_sdk';

export default {
	name: 'LoginPage',
	data() {
		let validateMobile = (rule, value, callback) => {
			if (value === '') {
				callback(new Error('登录手机号不能为空！'));
			} else {
				isMobile(value)
					? callback()
					: callback(new Error('登录手机号格式不正确！'));
			}
		};
		return {
			loginLoading: false,
			//本地缓存账号列表
			accounts: [],
			//输入的账号
			inputAccount: '',
			form: {
				// username: '1333',
				username: '',
				// password: '123456',
				password: '',
				areaCode: 86,
			},
			rules: {
				username: [
					// {
					//   validator: validateMobile,
					//   trigger: 'blur',
					// },
					// {
					//   min: 11,
					//   max: 11,
					//   message: '手机号格式不正确!',
					//   trigger: 'blur',
					// },
				],
				password: [
					{
						required: true,
						message: '登录密码不能为空!',
						trigger: 'blur',
					},
				],
			},
		};
	},
	watch: {
		$route(to, from) {
			if ('/login' == to.path) {
				this.loginLoading = false;
			}
		},
	},
	created() {
		let MYUSER = this.GetUrlParam('USER');
		let MYPASS = this.GetUrlParam('PASS');
		let MYauto = this.GetUrlParam('auto');
		this.form.username = MYUSER || '';
		this.form.password = MYPASS || '';
		if (MYauto == 1) {
			this.login();
		}
		WEBIM.disconnect();
		clearInterval(imSdk.ping);
		imSdk.sendReceiptTask = null;
		if (sessionStorage.getItem('se') == 1) {
		}
		let loginData = loginCacheData.list();
		if (!loginData) loginData = [];
		loginData.forEach((item) => {
			item.value = item.account;
		});
		console.error(loginData);
		this.accounts = loginData;
		this.loginLoading = false;
	},
	computed: {
		accountType() {
			return this.$store.state.settings.accountType;
		},
	},
	methods: {
		GetUrlParam(paraName) {
			var url = document.location.toString();
			var arrObj = url.split('?');
			if (arrObj.length > 1) {
				var arrPara = arrObj[1].split('&');
				var arr;
				for (var i = 0; i < arrPara.length; i++) {
					arr = arrPara[i].split('=');
					if (arr != null && arr[0] == paraName) {
						return arr[1];
					}
				}
				return '';
			} else {
				return '';
			}
		},
		searchAcc(key, callback) {
			callback(
				this.accounts.filter((acc) => {
					return acc.value.indexOf(key) != -1;
				})
			);
		},
		selectAcc(acc) {
			this.form.password = acc.password;
		},
		closeWindow() {
			electronService.hideWin();
		},
		onSubmit(formName) {
			if (this.loginLoading) return false;
			this.$refs[formName].validate((valid) => {
				if (!valid) return false;
				this.loginLoading = true;
				this.login();
			});
		},
		login() {
			let that = this;
			login(
				{
					mobile: this.form.username,
					password: this.form.password,
					areaCode: this.form.areaCode,
					platform: appUtils.getEnv(),
				},
				function(res) {
					if (res && res.code == 1) {
					} else {
						that.$notify.info({
							title: '提示',
							message: '登录密码不正确或账号不存在...',
						});
						that.loginLoading = false;
					}
				}
			);
		},
		toLink(url) {
			this.$router.push(url);
		},
	},
};
</script>
<style lang="less" scoped>
@import '~@/assets/css/page/login-auth.less';

.login-app-btn {
	width: 18px;
	position: absolute;
	z-index: 999;
	right: 20px;
	top: 10px;
}
</style>
