<template>
	<div class="header">
		<!--<el-input placeholder="请输入软件名称搜索" @keyup.enter.native="search" v-model="name" style="display: none"-->
		<!--class="none-input" :style="searchStyle" suffix-icon="el-icon-search">-->
		<!--</el-input>-->
		<div class="rightBox">
			<img
				@click="closeWindow"
				class="rightIcon rightIconLast"
				src="static/img/tools/close.png"
			/>
			<!--<img @click="fullWindow" class="rightIcon" style="width: 18px;" src="/src/renderer/assets/img/max.png"/>-->
			<img
				@click="minWindow"
				class="rightIcon"
				src="static/img/tools/min.png"
			/>
			<el-tooltip
				:content="isTop ? '取消置顶' : '置顶'"
				placement="bottom"
				effect="light"
			>
				<img
					@click="top"
					class="rightIcon"
					style="padding-top: 8px;"
					src="static/img/tools/top.png"
				/>
			</el-tooltip>
		</div>
	</div>
</template>

<script>
import { busService } from '@/service/busService';
import { electronService } from '@/service/electronService';

export default {
	name: 'mainHead',
	data() {
		return {
			name: '',
			isTop: false,
			state: '',
			searchStyle: {
				display: 'inlineBlock',
				width: '200px',
				color: 'white',
				float: 'left',
			},
		};
	},
	computed: {
		// path(){
		//     return this.$route.path
		// }
	},
	watch: {
		// path(val){
		//     console.log(val)
		//     if(val=='/index/treasury'){
		//         this.searchStyle.display= 'inline-block'
		//     }else {
		//         this.searchStyle.display= 'none'
		//     }
		// }
	},
	methods: {
		// search(){
		//     busService.emit('search-goods', this.name)
		// },
		// historySearch(queryString, cb) {
		//     var restaurants = historyQuery;
		//     var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
		//     // 调用 callback 返回建议列表的数据
		//     cb(results);
		// },
		// createFilter(queryString) {
		//     return (restaurant) => {
		//         return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
		//     };
		// },
		// query(){
		//
		// },
		// settings(){
		//     this.$router.push('index/userInfo')
		// },
		closeWindow() {
			electronService.hideWin();
		},
		fullWindow() {
			electronService.fullWin();
		},
		minWindow() {
			electronService.minWin();
		},
		top() {
			this.isTop = !this.isTop;
			electronService.topWin();
		},

		logout() {},
		commands(type) {
			let _this = this;
			if (type == 1) {
				this.$store.dispatch('Logout').then((res) => {
					_this.$router.push('/login');
				});
			}
		},
		gotoHome() {
			this.$router.push('/login');
		},
	},
	components: {},
};
</script>

<style scoped>
.header {
	position: absolute;
	right: 0px;
	top: 0px;
	z-index: 999;
}
.rightIcon {
	width: 12px;
	float: right;
	font-size: 18px;
	padding: 5px 8px 5px 4px;
	cursor: pointer;
	-webkit-app-region: no-drag;
}

.rightIcon:hover {
	background: rgba(195, 195, 195, 0.36);
}

.rightIconLast {
	margin-right: 6px;
}

.rightBox {
	width: 100px;
	float: right;
}

.setting-icon {
	width: 16px;
	height: 16px;
	padding-top: 8px;
}
</style>
<style lang="scss">
/*width: 30px*/
.head-search {
	float: left;
	width: 200px;
	height: 40px;
	line-height: 40px;
	margin-left: 20px;
	.el-autocomplete {
		width: 100%;
		input {
			width: 100%;
			background: transparent;
		}
	}
}
</style>
