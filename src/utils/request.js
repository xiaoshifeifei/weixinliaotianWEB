import axios from 'axios';
import { getToken, removeAll, setToken } from '@/utils/auth';
import { Notification } from 'element-ui';
import { ApiAuthUtils } from '@/utils/apiAuthUtils';
import { isNil } from '@/utils/utils';
import Qs from 'qs';
import { login } from '../api/login';
import store from '@/store';
import { busService } from '@/service/busService';
import router from '@/router';
import { appUtils } from '@/utils/my/appUtils';
import { AppConfig } from '@/utils/old/appconfig';

// 创建 axios 实例
axios.defaults.headers['Content-Type'] =
	'application/x-www-form-urlencoded;charset=UTF-8';
axios.defaults.transformRequest = [(obj) => Qs.stringify(obj)];

const request = axios.create({
	// // API 请求的默认前缀
	// baseURL: '',
	// baseURL: '/api',
	// 请求超时时间
	timeout: 200000,
});

/**
 * 异常拦截处理器
 *
 * @param {*} error
 */
const errorHandler = (error) => {
	// 判断是否是响应错误信息
	if (error.response) {
		let status = error.response.status;
		if (status == 401) {
			removeAll();
			location.reload();
		} else if (status == 404) {
			// Notification({
			//     message: '当前不支持此功能.',
			//     position: 'top-right',
			// })
		} else {
			Notification({
				message: '网络异常,请稍后再试...',
				position: 'top-right',
			});
		}
	}

	return Promise.reject(error);
};

// 请求拦截器
request.interceptors.request.use((config) => {
	if (!(config.data instanceof FormData)) {
		let data = null;
		if (config.data) {
			data = config.data;
		} else if (config.params) {
			data = config.params;
		}

		if (!data.secret) {
			// 登录加固生成secret
			config.data = ApiAuthUtils.apiCreateCommApiSecret(data, config.url);
		}
		if (isNil(data['access_token'])) {
			config.data['access_token'] = getToken();
		}
	}

	var apiReg = new RegExp('^/api');
	var fileReg = new RegExp('^/file');
	if (apiReg.test(config.url)) {
		// config.url = config.url.replace(apiReg,"http://10.10.10.118:8094");
		config.url = config.url.replace(apiReg, AppConfig.apiUrlParams);
	}
	if (fileReg.test(config.url)) {
		// config.url = config.url.replace(fileReg, 'http://10.10.10.118:8088');
		config.url = config.url.replace(fileReg, AppConfig.uploadServerParams);
	}
	return config;
}, errorHandler);

// 响应拦截器
request.interceptors.response.use((response) => {
	var data = response.data;
	// console.log("响应拦截器",data);
	//签名失效
	if (data.resultCode == 10110) {
		Notification({
			title: '提示',
			message: '签名失败， 2s后重新登录...',
			position: 'top-right',
		});
		for (let i = 1; i < 100000; i++) {
			clearInterval(i);
		}
		setTimeout(function() {
			sessionStorage.setItem('sx', 1);
			router.push('/login');
		}, 2000);
	}
	//token过期 1030101
	else if (data.resultCode == 1030101 || data.resultCode == 1030102) {
		setToken('');
		//重新登录
		let loginInfo = store.state.user;

		if (loginInfo && loginInfo.account) {
			login(
				{
					mobile: loginInfo.account,
					password: loginInfo.password,
					platform: 'web',
				},
				function(res) {
					if (res && res.code == 1) {
						Notification({
							message: '登录成功',
							position: 'top-right',
						});
					} else {
						Notification({
							title: '提示',
							message: '登录密码不正确或账号不存在...',
							position: 'top-right',
						});
					}
				}
			);
		} else {
			Notification({
				title: '提示',
				message: '账号信息丢失， 请重新登录...',
				position: 'top-right',
			});
			busService.emit('go-login');
		}
	}

	return data;
}, errorHandler);

/**
 * GET 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const get = (url, data = {}, options = {}) => {
	url = appUtils.getApiUrl(url);
	return request({
		url,
		params: data,
		method: 'get',
		...options,
	});
};

/**
 * POST 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const post = (url, data = {}, options = {}) => {
	url = appUtils.getApiUrl(url);
	return request({
		url,
		method: 'post',
		data: data,
		...options,
	});
};

/**
 * 上传文件 POST 请求
 *
 * @param {String} url
 * @param {Object} data
 * @param {Object} options
 * @returns {Promise<any>}
 */
export const upload = (url, data, options = {}) => {
	options['Content-Type'] = 'multipart/form-data';
	options.transformRequest = function(data) {
		return data;
	};
	// config.data["access_token"] = getToken();
	var str = '';
	var params = ApiAuthUtils.apiCreateCommApiSecret(
		data,
		appUtils.getFileUrl(url)
	);
	// for(var prop in params){
	//     str += '&' + prop + '=' + params[prop];
	// }
	// secret=cQSnoErkz%2BgTzH05hO9dGA%3D%3D&salt=1657877715872&access_token=
	url = appUtils.getFileUrl(url); // + '?access_token=' + getToken() + '&secret=' + params.secret + '&salt=' + params.salt;
	console.log(701, 'upload', {
		url,
		method: 'post',
		data: data,
		options: options,
	});
	return request({
		url,
		method: 'post',
		data: data,
		...options,
	});
};
