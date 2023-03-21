import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);

const RouteView = {
	name: 'RouteView',
	render: (h) => h('router-view'),
};

const routes = [
	{
		path: '*',
		redirect: '/',
	},
	{
		path: '/',
		name: 'home',
		component: () => import('@/views/MessagePage'),
		meta: {
			title: '消息通知',
			needLogin: true,
		},
	},
	{
		path: '/mobile',
		name: 'mobile',
		component: () => import('@/views/MobilePage'),
		meta: {
			title: '移动端',
			needLogin: false,
		},
	},
	// 授权相关
	{
		path: '/login',
		name: 'login',
		component: () => import('@/views/auth/LoginPage'),
		meta: {
			title: '账号登录？',
			needLogin: false,
		},
	},
	{
		path: '/logins',
		name: 'logins',
		component: () => import('@/views/auth/LoginPage1'),
		meta: {
			title: '账号登录？',
			needLogin: false,
		},
	},
	{
		path: '/register',
		name: 'register',
		component: () => import('@/views/auth/RegisterPage'),
		meta: {
			title: '账号注册？',
			needLogin: false,
		},
	},
	{
		path: '/forget',
		name: 'forget',
		component: () => import('@/views/auth/ForgetPasswordPage'),
		meta: {
			title: '找回密码？',
			needLogin: false,
		},
	},
	{
		path: '*',
		name: '404 NotFound',
		component: () => import('@/views/auth/NotFoundPage'),
		meta: {
			title: '404 NotFound',
			needLogin: false,
		},
	},
	{
		path: '/index/message',
		name: 'message',
		component: () => import('@/views/MessagePage'),
		meta: {
			title: '消息通知',
			needLogin: true,
		},
	},
	{
		path: '/index/contacts',
		name: 'contacts',
		component: () => import('@/views/ContactsPage'),
		meta: {
			title: '我的联系人',
			needLogin: true,
		},
	},
	{
		path: '/index/notes',
		name: 'notes',
		component: () => import('@/views/NotePage'),
		meta: {
			title: '我的笔记',
			needLogin: true,
		},
	},
	{
		path: '/index/settings',
		name: 'settings',
		meta: {
			title: '个人信息',
			needLogin: true,
		},
		component: () => import('@/views/settings/BasePage'),
	},
];
const RouterPush = Router.prototype.push;
Router.prototype.push = function push(to) {
	return RouterPush.call(this, to).catch((err) => err);
};
const RouterReplace = Router.prototype.replace;
Router.prototype.replace = function replace(to) {
	return RouterReplace.call(this, to).catch((err) => err);
};

export default new Router({
	routes,
	mode: 'hash',
});
