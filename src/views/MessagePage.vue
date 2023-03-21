<template>
	<div>
		<MainLayout :idx="0">
			<el-container slot="container" class="full-height">
				<!-- 左侧侧边栏 -->
				<el-aside width="320px" class="aside-box">
					<div
						class="drag"
						style="width: calc(100%); height: 20px"
					></div>
					<el-container class="full-height" direction="vertical">
						<div class="networkDelay" v-if="myPing < 500">
							网络延时 [ {{ myPing }}ms ]
						</div>
						<div class="networkDelayRed" v-else-if="myPing < 9999">
							网络延时 [ {{ myPing }}ms ]
						</div>
						<div class="networkDelayRed" v-else>
							网络延时 [ {{ myPing }}+ ]
						</div>
						<!-- 搜索栏 -->
						<el-header height="40px" class="header">
							<div class="from-search">
								<el-input
									v-model="input"
									prefix-icon="el-icon-search"
									placeholder="搜索聊天 / 好友 / 群组"
									size="small"
								/>
							</div>
							<!-- 工具栏 -->
							<div class="tools" v-outside="closeSubMenu">
								<el-button
									circle
									plain
									size="small"
									icon="el-icon-plus"
									@click="subMenu = !subMenu"
								/>
								<transition name="el-zoom-in-top">
									<div class="tools-menu" v-show="subMenu">
										<div
											class="menu-item"
											@click="triggerSubMenu(1)"
										>
											创建群组
										</div>
										<div
											class="menu-item"
											@click="triggerSubMenu(2)"
										>
											添加好友
										</div>
									</div>
								</transition>
							</div>
						</el-header>

						<!-- 置顶栏 -->
						<el-header
							v-show="loadStatus == 1 && topItems.length > 0"
							class="subheader"
							:class="{ shadow: subHeaderShadow }"
							:height="subHeaderPx"
						>
							<div
								v-for="item in topItems"
								:key="item.chatId"
								class="top-item"
								@click="clickChatItem(item.chatId)"
							>
								<el-tooltip
									effect="dark"
									placement="top-start"
									:content="
										item.remark ? item.remark : item.name
									"
								>
									<div class="avatar">
										<span v-show="!item.avatar">
											{{
												(item.remark
													? item.remark
													: item.name
												).substr(0, 1)
											}}
										</span>
										<img
											v-show="item.avatar"
											:src="$root.getAvatar(item.chatId)"
											:onerror="
												$store.state.detaultAvatar
											"
										/>
									</div>
								</el-tooltip>

								<div
									class="name"
									:class="{ active: chatId == item.chatId }"
								>
									{{ item.remark ? item.remark : item.name }}
								</div>
							</div>
						</el-header>

						<!-- 对话列表栏 -->
						<el-scrollbar
							tag="section"
							ref="menusScrollbar"
							class="full-height"
							:native="false"
						>
							<el-main class="main">
								<p v-show="loadStatus == 0" class="empty-data">
									<i class="el-icon-loading" /> 数据加载中...
								</p>

								<p
									v-show="loadStatus == 1 && talkNum == 0"
									class="empty-data"
								>
									暂无聊天消息
								</p>

								<p
									v-show="loadStatus == 1 && talkNum > 0"
									class="main-menu"
								>
									<span class="title"
										>消息记录 ({{ talkNum }})</span
									>
								</p>

								<!-- 对话列表 -->
								<template v-if="loadStatus == 1">
									<div
										v-for="item in search"
										:key="item.chatId"
										class="talk-item pointer"
										:class="{
											active: chatId == item.chatId,
										}"
										@click="clickChatItem(item.chatId)"
										@contextmenu="showMenu(item)"
									>
										<div class="avatar-box">
											<img
												:src="item.avatar"
												:onerror="
													$store.state.detaultAvatar
												"
											/>
											<div
												v-show="item.isTop == 0"
												class="top-mask"
												@click.stop="topChatItem(item)"
											>
												<i class="el-icon-top" />
											</div>
										</div>
										<div class="card-box">
											<div class="title">
												<div class="card-name">
													<p
														class="nickname max-length"
														:title="
															item.remark ||
																item.name
														"
													>
														{{
															item.remark
																? item.remark
																: item.name
														}}
													</p>
													<div
														v-show="
															item.unreadNum > 0
														"
														class="larkc-tag unread"
													>
														{{ item.unreadNum }}
													</div>
													<div
														v-show="item.isTop"
														class="larkc-tag top"
													>
														TOP
													</div>
													<div
														v-show="
															isGroup(item.chatId)
														"
														class="larkc-tag group"
													>
														群组
													</div>
													<div
														v-show="item.disturb"
														class="larkc-tag disturb"
													>
														<i
															class="iconfont icon-xiaoximiandarao"
														/>
													</div>
												</div>
												<div class="card-time">
													{{
														beautifyTime(
															item.updateTime
														)
													}}
												</div>
											</div>
											<div class="content">
												<template
													v-if="
														chatId != item.chatId &&
															item.draftText
													"
												>
													<span class="draft-color"
														>[草稿]</span
													>
													<span>{{
														item.draftText
													}}</span>
												</template>
												<template v-else>
													<span
														v-if="item.type == 1"
														:class="{
															'online-color':
																item.online,
														}"
													>
														<!--[{{ item.online ? '在线' : '离线' }}]-->
													</span>
													<!--<span v-else>[群消息]</span>-->
													<!-- <span v-if="item.type == 202 && isShowRevoke == 0"></span> -->
													<span>{{
														item.content
													}}</span>
												</template>
											</div>
										</div>
									</div>
								</template>
							</el-main>
						</el-scrollbar>
					</el-container>
				</el-aside>

				<!-- 聊天面板容器 -->
				<el-main
					class="ov-hidden full-height no-padding"
					style="position: relative"
				>
					<WelcomeModule v-if="chatId == null" />
					<TalkPanel
						v-else
						class="full-height"
						:params="params"
						:is-online="isFriendOnline"
						@change-talk="changeTalk"
						@close-talk="closeTalk"
					/>
				</el-main>
			</el-container>
		</MainLayout>

		<!-- 创建群聊组件 -->
		<GroupLaunch
			v-if="launchGroupShow"
			@close="launchGroupShow = false"
			@create-success="groupChatSuccess"
		/>

		<!-- 查看用户组件 -->
		<UserBusinessCard ref="userBusinessCard" />

		<!-- 用户查询组件 -->
		<UserSearch ref="searchUsers" />

		<vue-context-menu
			:contextMenuData="contextMenuData"
			@showUserInfo="showUserInfo"
			@editFriendRemarks="editFriendRemarks"
			@topChatItem="topChatItem"
			@setNotDisturb="setNotDisturb"
			@delContact="delContact"
			@delChatItem="delChatItem"
		></vue-context-menu>
	</div>
</template>
<script>
import { mapGetters, mapState } from 'vuex';
import MainLayout from '@/views/layout/MainLayout';
import WelcomeModule from '@/components/layout/WelcomeModule';
import GroupLaunch from '@/components/group/GroupLaunch';
import TalkPanel from '@/components/chat/panel/TalkPanel';
import UserBusinessCard from '@/components/user/UserBusinessCard';
import UserSearch from '@/components/user/UserSearch';
import { chatApi } from '@/api/chatApi';
import { friendApi, ServeEditContactRemark } from '@/api/contacts';
import { beautifyTime } from '@/utils/functions';
import { lastUtils } from '@/utils/my/lastChatUtils';
import { contactData } from '@/utils/data/contactData';
import { chatUtils } from '@/utils/my/chatUtils';
import { roomService } from '@/service/roomService';
import { busService } from '@/service/busService';
import { eventConst } from '@/utils/my/const/eventConst';
import { imUtils } from '@/utils/my/imUtils';
import { friendService } from '@/service/friendService';
import { chatData } from '@/utils/data/chatData';
import { httpPing } from '@/api/user';

const title = document.title;

export default {
	name: 'MessagePage',
	components: {
		MainLayout,
		GroupLaunch,
		TalkPanel,
		UserBusinessCard,
		UserSearch,
		WelcomeModule,
	},
	data() {
		return {
			currentMenuItem: null,
			subHeaderShadow: false,
			launchGroupShow: false,
			// 对话面板的传递参数
			params: {
				source: 0,
				nickname: '',
				chatId: null,
			},
			// 查询关键词
			input: '',
			// header 工具菜单
			subMenu: false,
			// 对话消息列表加载状态[0:加载中;1:加载完成;2:加载失败;]
			loadStatus: 1,
			// 消息未读数计时器
			interval: null,
			isShowRevoke: sessionStorage.getItem('isShowRevoke'),
			playTimeout: null, //网络延时
			myPing: 0, //ping的初始值
		};
	},
	computed: {
		...mapGetters(['topItems', 'talkItems', 'unreadNum', 'talkNum']),
		...mapState({
			talks: (state) => state.talks.items,
			chatId: (state) => state.dialogue.chatId,
			monitorUserStatus: (state) => state.notify.friendStatus,
		}),
		contextMenuData() {
			let item = this.currentMenuItem;
			let data = {
				// the contextmenu name(@1.4.1 updated)
				menuName: 'chatItem',
				// The coordinates of the display(菜单显示的位置)
				axis: {
					x: -100,
					y: -100,
				},
				menulists: [],
			};
			// console.log(item);
			if (item) {
				data.axis = {
					x: item.x,
					y: item.y,
				};
				let menulists = [];
				if (item.type == 1) {
					menulists.pushAll([
						{
							btnName: '好友信息',
							icoName: 'el-icon-user',
							fnHandler: 'showUserInfo',
						},
						{
							btnName: '修改备注',
							icoName: 'el-icon-edit-outline',
							fnHandler: 'editFriendRemarks',
						},
					]);
				}
				menulists.pushAll([
					{
						btnName: item.isTop == 0 ? '会话置顶' : '取消置顶',
						icoName: 'el-icon-top',
						fnHandler: 'topChatItem',
					},
					{
						btnName:
							item.disturb == 0 ? '消息免打扰' : '开启消息提示',
						icoName:
							item.disturb == 0
								? 'el-icon-close-notification'
								: 'el-icon-bell',
						fnHandler: 'setNotDisturb',
					},
					{
						btnName: item.type == 1 ? '删除好友' : '退出群聊',
						icoName: 'el-icon-delete',
						fnHandler: 'delContact',
					},
					{
						btnName: '删除对话',
						icoName: 'el-icon-delete',
						fnHandler: 'delChatItem',
					},
				]);
				data.menulists = menulists;
			}
			// console.log(data);
			return data;
		},
		// 计算置顶栏目的高度
		subHeaderPx() {
			const n = 7; // 一排能显示的用户数
			const num = this.topItems.length;
			let len = 60;

			if (num > n) {
				len = (Math.floor(num / n) + (num % n > 0 ? 1 : 0)) * len;
			}
			return `${len}px`;
		},
		// 当前对话好友在线状态
		isFriendOnline() {
			let index = lastUtils.findTalkIndex(this.chatId);
			return index >= 0 && this.talks[index].online == 1;
		},
		search() {
			let list = this.talkItems.filter((item) => {
				let name = item.remark || item.name;
				return name.match(this.input) != null;
			});
			// console.log("isCharlist", list);
			return list;
		},
	},
	watch: {
		isShowRevoke(params) {
			this.isShowRevoke = params;
		},
		unreadNum(value) {
			clearInterval(this.interval);
			this.$store.commit('SET_UNREAD_NUM', value);

			if (value > 0) {
				this.interval = setInterval(() => {
					document.title =
						document.title == title ? `【新消息】${title}` : title;
				}, 2000);
			} else {
				document.title = title;
			}
		},

		// 监听用户在线状态
		monitorUserStatus(value) {
			let index = lastUtils.findTalkIndex(`${value.friendId}`);
			if (index >= 0) {
				this.$store.commit('UPDATE_TALK_ONLINE_STATUS', {
					index,
					status: value.status,
				});
			}
		},
	},
	created() {
		// 网络延时 定时器
		this.delay();
		let that = this;
		console.error('监听初始化完成事件');
		this.clearTalk();
		busService.on(eventConst.setChatId, function(chatId) {
			that.initSelectChat(chatId);
		});

		let userId = this.$root.userId;
		busService.on(eventConst.refreshAvatar, function(chatId) {
			console.log(`会话${chatId}头像变化了`);
			that.talkItems.forEach(function(item) {
				if (chatId == item.chatId) {
					item.avatar = imUtils.getAvatarUrl(chatId);
				}
			});
		});
	},
	mounted() {
		this.scrollEvent();
		window.addEventListener('beforeunload', this.solveBeforeUnload);
	},
	destroyed() {
		document.title = title;
		clearInterval(this.interval);
		console.error('================destroyed');
		this.clearTalk();
		window.removeEventListener('beforeunload', this.solveBeforeUnload);
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
		delay() {
			// setInterval(() => {}, interval);
			var that = this;
			this.playTimeout = setInterval(() => {
				let dateStart = +new Date();
				httpPing()
					.then((res) => {
						let dateEnd = +new Date();
						that.myPing = dateEnd - dateStart;
					})
					.catch((err) => {
						that.myPing = 9999;
					});
			}, 2000);
		},
		// 美化时间格式
		beautifyTime,
		showMenu(item) {
			this.currentMenuItem = null;
			event.preventDefault();
			let x = event.clientX;
			let y = event.clientY;
			item.x = x;
			item.y = y;
			this.currentMenuItem = item;
		},
		isGroup(chatId) {
			return chatUtils.isGroupId(chatId);
		},
		// header 功能栏隐藏事件
		closeSubMenu() {
			this.subMenu = false;
		},

		// 清除当前对话
		clearTalk() {
			this.params = {
				source: 0,
				nickname: '',
				chatId: '',
			};

			this.$store.commit('update_current_chatId', null);
		},

		// 工具栏事件
		triggerSubMenu(type) {
			this.closeSubMenu();

			if (type == 1) {
				this.launchGroupShow = true;
			} else {
				this.$refs.searchUsers.open();
			}
		},

		// 监听自定义滚动条事件
		scrollEvent() {
			let scrollbarEl = this.$refs.menusScrollbar.wrap;
			scrollbarEl.onscroll = () => {
				this.subHeaderShadow = scrollbarEl.scrollTop > 0;
			};
		},

		initSelectChat(chatId) {
			if (chatId) {
				this.$nextTick(() => this.clickChatItem(chatId));
			}
		},

		// 获取用户对话列表
		loadChatList() {
			this.loadStatus = 0;
			chatApi
				.listChat()
				.then(({ resultCode, data }) => {
					if (resultCode != 1) return false;
					this.$store.commit('chats_init', data);
				})
				.finally(() => {
					this.loadStatus = 1;
				});
		},

		// 发起群聊成功后回调方法
		groupChatSuccess(data) {
			this.launchGroupShow = false;
		},

		// 切换聊天栏目
		clickChatItem(chatId) {
			let index = lastUtils.findTalkIndex(chatId);
			if (index == -1) return;
			let item = this.talks[index];
			let source = !chatUtils.isGroupId(chatId) ? 1 : 2;
			let nickname = item.remark ? item.remark : item.name;
			this.params = {
				chatId: chatId,
				nickname: nickname,
			};

			this.$store.commit('update_current_chatId', chatId);

			//如果是群组， 查询成员信息
			if (chatUtils.isGroupId(chatId)) {
				let room = contactData.getItem(chatId);
				this.$store.commit('setRoomMember', { roomId: room.id });
			}

			this.$nextTick(() => {
				if (chatId == this.chatId) {
					// 清空对话的未读数
					chatData.unreadClear(chatId);
				}
			});
		},

		// 修改当前对话
		changeTalk(chatId) {
			sessionStorage.setItem('send_message_chat_id', chatId);
			this.loadChatList();
		},

		// 关闭当前对话及刷新对话列表
		closeTalk() {
			this.$store.commit('update_current_chatId', null);
			this.loadChatList();
		},

		showUserInfo() {
			this.$refs.userBusinessCard.open(this.currentMenuItem.id);
			this.currentMenuItem = null;
		},
		updateRemark() {},
		// 修改好友备注信息
		editFriendRemarks() {
			let item = this.currentMenuItem;
			let title = `您正在设置【${item.name}】好友的备注信息`;

			if (item.remark) {
				title += `，当前备注为【${item.remark}】`;
			}

			this.$prompt(title, '修改备注', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				customClass: 'border-radius0',
				inputPlaceholder: '请设置好友备注信息',
				inputValue: item.remark ? item.remark : item.name,
			})
				.then(({ value }) => {
					if (!value || !value.trim()) {
						this.$message.error('好友备注不能为空');
						return false;
					}
					if (value == item.remark) {
						return false;
					}
					friendApi.updateRemark(item.id, value).then((res) => {
						if (res.resultCode == 1) {
							this.$store.commit('update_chat_name', {
								chatId: item.chatId,
								name: value,
							});

							this.$store.commit('update_contact_remark', {
								chatId: item.chatId,
								name: value,
							});

							this.$notify({
								title: '成功',
								message: '好友备注修改成功...',
								type: 'success',
							});
						} else {
							this.$notify({
								title: '消息',
								message: '好友备注修改失败，请稍后再试...',
								type: 'warning',
							});
						}
					});
				})
				.catch(() => {});
			this.currentMenuItem = null;
		},

		delContact() {
			let item = this.currentMenuItem;
			let title = item.type == 1 ? '删除好友' : '退出群聊';
			this.$confirm(
				`此操作将 <span style="color:red;font-size:16px;">${title}</span>, 是否继续?`,
				'提示',
				{
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning',
					center: true,
					dangerouslyUseHTMLString: true,
				}
			).then(() => {
				if (item.type == 1) {
					this.removeFriend(item);
				} else {
					this.removeGroup(item);
				}
			});
			this.currentMenuItem = null;
		},
		// 会话列表置顶
		//type: 1
		// offlineNoPushMsg: 1
		// userId: 10000071
		// roomId: 60cf5caa30c49e00016417b6
		topChatItem() {
			let item = this.currentMenuItem;
			let chatId = item.chatId;
			let chatData = contactData.getItem(chatId);
			let enable = 1;

			let group = chatUtils.isGroupId(chatId);
			let data = {
				type: group ? 1 : 2,
				offlineNoPushMsg: 1,
			};
			if (group) {
				data.roomId = chatData.id;
				data.userId = this.$store.state.user.userId;
			} else {
				data.userId = item.id;
				data.toUserId = item.id;
			}
			//ws-todo 区分取消和置顶
			chatApi.setTop(data).then(({ resultCode }) => {
				if (resultCode == 1) {
					this.$store.commit('UPDATE_TALK_ITEM', {
						index: lastUtils.findTalkIndex(item.chatId),
						item: {
							isTop: item.isTop == 0 ? 1 : 0,
						},
					});
				}
			});
			this.currentMenuItem = null;
		},

		// 设置消息免打扰
		setNotDisturb() {
			let item = this.currentMenuItem;
			roomService.setDisturb(item.chatId, item.disturb == 0);
			this.currentMenuItem = null;
		},

		// 移除会话列表
		delChatItem() {
			let item = this.currentMenuItem;
			let chatId = item.chatId;
			//
			chatData.delNew(chatId);
			//最近会话删除
			this.$store.commit('del_chat', chatId);
			//如果是当前会话， 则清除
			if (chatUtils.isCurrentChat(chatId)) {
				this.clearTalk();
			}
			this.currentMenuItem = null;
			// 接口废弃，直接走成功
			// chatApi.delChat(item.chatId).then(({ resultCode }) => {
			//   if (resultCode == 1) {
			//     let chatId = item.chatId;
			//     //
			//     chatData.delNew(chatId);
			//     //最近会话删除
			//     this.$store.commit("del_chat", chatId);
			//     //如果是当前会话， 则清除
			//     if (chatUtils.isCurrentChat(chatId)) {
			//       this.clearTalk();
			//     }
			//   }
			// });
			// this.currentMenuItem = null;
		},

		// 解除好友关系
		removeFriend(item) {
			friendService.delFriend(item.chatId);
		},

		// 退出群聊
		removeGroup(item) {
			roomService.delRoom(item.chatId).then(() => {
				this.$notify({
					title: '成功',
					message: '解散群组...',
					type: 'success',
				});
			});
		},
	},
};
</script>
<style lang="less" scoped>
.networkDelay {
	width: 100%;
	height: 35px;
	padding-left: 15px;
	font-weight: 500;
	color: #19a00f;
}
.networkDelayRed {
	width: 100%;
	height: 35px;
	padding-left: 15px;
	font-weight: 500;
	color: #f50023;
}
/deep/.el-scrollbar__wrap {
	overflow-x: hidden;
}

.aside-box {
	position: relative;
	border-right: 1px solid rgb(245, 245, 245);
	overflow: hidden;
	padding: 0;
	transition: width 0.3s;

	.header {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 0 15px;

		.from-search {
			flex: 1 1;
			flex-shrink: 0;
			height: 40px;

			/deep/ .el-input .el-input__inner {
				border-radius: 20px;
			}
		}

		.tools {
			flex-basis: 32px;
			flex-shrink: 0;
			height: 32px;
			margin-bottom: 8px;
			margin-left: 15px;
			cursor: pointer;
			line-height: 32px;
			text-align: center;
			position: relative;
			user-select: none;

			.tools-menu {
				position: absolute;
				right: 0;
				top: 38px;
				width: 100px;
				min-height: 80px;
				box-sizing: border-box;
				background-color: rgba(31, 35, 41, 0.9);
				border-radius: 5px;
				z-index: 1;
				padding: 3px 0;

				.menu-item {
					height: 40px;
					line-height: 40px;
					color: white;
					font-size: 14px;

					&:hover {
						background-color: rgba(70, 72, 73, 0.9);
					}
				}
			}
		}
	}

	.subheader {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		padding: 3px 8px 10px;
		overflow: hidden;
		flex-shrink: 0;

		.top-item {
			flex-basis: 41px;
			flex-shrink: 0;
			height: 50px;
			margin: 0 1px 6px 1px;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
			cursor: pointer;

			.avatar {
				flex-basis: 32px;
				width: 32px;
				height: 32px;
				background-color: #508afe;
				border-radius: 50%;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 10px;
				color: white;
				flex-shrink: 0;
				overflow: hidden;
				user-select: none;

				img {
					width: 100%;
					height: 100%;
					background-color: white;
				}
			}

			.name {
				font-size: 12px;
				text-align: center;
				color: #8f959e;
				transform: scale(0.84);
				text-align: center;
				line-height: 20px;
				word-break: break-all;
				overflow: hidden;

				&.active {
					color: #508afe;
				}
			}
		}

		&.shadow {
			box-shadow: 0 2px 6px 0 rgba(31, 35, 41, 0.05);
		}
	}
}

.aside-box .main {
	overflow: hidden;
	padding: 0;

	.empty-data {
		text-align: center;
		padding-top: 40px;
		color: #ccc;
	}

	.main-menu {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		padding: 3px 10px 3px 10px;
		align-items: center;
		user-select: none;

		.title {
			font-size: 12px;
			font-weight: 600;
			color: #1f2329;
		}

		.icon {
			cursor: pointer;
		}
	}

	.talk-item {
		padding: 8px 10px;
		height: 50px;
		display: flex;
		flex-direction: row;
		align-items: center;
		border-left: 3px solid transparent;
		transition: 0.2s ease-in;

		.avatar-box {
			height: 35px;
			width: 35px;
			flex-shrink: 0;
			background-color: #508afe;
			border-radius: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 14px;
			color: white;
			user-select: none;
			transition: ease 1s;
			position: relative;
			overflow: hidden;

			img {
				width: 100%;
				height: 100%;
				background-color: white;
				border-radius: 3px;
			}

			.top-mask {
				width: 100%;
				height: 100%;
				background-color: rgba(22, 25, 29, 0.6);
				position: absolute;
				top: 0;
				left: 0;
				color: white;
				display: none;
				align-items: center;
				justify-content: center;
				font-weight: bold;
			}

			&:hover .top-mask {
				display: flex;
			}
		}

		.card-box {
			height: 40px;
			display: flex;
			align-content: center;
			flex-direction: column;
			flex: 1 1;
			margin-left: 10px;
			overflow: hidden;

			.title {
				width: 100%;
				height: 20px;
				display: flex;
				align-items: center;

				.card-name {
					color: #1f2329;
					font-size: 14px;
					line-height: 20px;
					flex: 1 1;
					display: -webkit-flex;
					display: -ms-flexbox;
					display: flex;
					align-items: center;
					overflow: hidden;

					.nickname {
						font-weight: 400;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
						margin-right: 3px;
					}

					.top {
						color: #dc9b04 !important;
						background-color: #faf1d1 !important;
					}

					.group {
						color: #3370ff !important;
						background-color: #e1eaff !important;
						font-size: 13px;
					}

					.disturb {
						color: #98999c !important;
						background-color: #ecedf1 !important;

						i {
							font-size: 12px;
						}
					}
				}
			}

			.card-time {
				color: #8f959e;
				font-size: 12px;
				margin-left: 10px;
				user-select: none;
			}

			.content {
				font-size: 13px;
				line-height: 18px;
				color: #8f959e;
				margin-top: 3px;
				font-weight: 300;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;

				span:first-child {
					margin-right: 5px;
				}

				.online-color {
					color: #4aa71c;
					font-weight: 300;
				}

				.draft-color {
					color: red;
					font-weight: 300;
				}
			}
		}

		&:hover {
			background-color: #eff0f1;
		}

		&.active {
			border-color: #3370ff;
			background-color: #eff0f1;
		}
	}
}

@media screen and (max-width: 800px) {
	.aside-box {
		width: 220px !important;

		.subheader {
			display: none;
		}

		/*.card-box .larkc-tag {*/
		/*display: none;*/
		/*}*/
	}
}
</style>
