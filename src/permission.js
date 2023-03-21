import router from '@/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import config from '@/config/config';
import store from '@/store';
import { myUtils } from '@/utils/my/myUtils';
import { setToken } from '@/utils/auth';
import { loginCacheData } from '@/utils/data/loginData';
import { busService } from '@/service/busService';
import { AppConfig } from '@/utils/old/appconfig';
import { appUtils } from '@/utils/my/appUtils';
import { httpSetLogin } from '@/api/user';
import { WEBIM } from '@/utils/old/webim';

NProgress.configure({
	showSpinner: false,
});

const WEBSITE_NAME = config.WEBSITE_NAME;

// 登录用户强制重定向页面
const redirect = ['/login', '/register', '/forget'];

router.beforeEach((to, from, next) => {
	if (myUtils.isMobile() && to.path != '/mobile') {
		next('/mobile');
	} else {
		NProgress.start();
		let nickname = store.state.user.nickname;
		document.title = nickname
			? nickname
			: to.meta.title
			? `${WEBSITE_NAME} | ${to.meta.title}`
			: WEBSITE_NAME;
		// 如果有token说明该用户已登陆
		if (store.state.user.account) {
			if (redirect.indexOf(to.path) > 0) {
				next('/');
			}
		} else if (to.meta.needLogin) {
			store.commit('clear_login');
			next('/login');
		}

		if (to.path == '/login') {
			store.commit('clear_login');
		}
		next();
	}
});

router.afterEach(() => {
	NProgress.done();
});
