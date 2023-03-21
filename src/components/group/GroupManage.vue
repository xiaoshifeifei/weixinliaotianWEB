<template>
	<div class="lum-dialog-mask">
		<div class="lum-dialog-box">
			<el-container class="container">
				<el-header class="header no-select" height="60px">
					<p>群管理 ({{ room.nickname }})</p>
					<p class="tools">
						<i class="el-icon-close" @click="$emit('close')" />
					</p>
				</el-header>
				<el-main class="main no-padding">
					<el-container class="full-height">
						<el-aside width="100px" class="aside-border no-select">
							<div
								v-for="(menu, index) in menus"
								:key="menu.name"
								class="menu-list"
								:class="{ selectd: tabIndex == index }"
								v-text="menu.name"
								@click="triggerTab(index)"
							/>
						</el-aside>

						<!-- 群介绍模块 -->
						<el-main v-if="tabIndex == 0">
							<el-row>
								<el-col :span="14">
									<el-form
										ref="groupForm"
										:model="form"
										:rules="rules"
									>
										<el-form-item
											label="群名:"
											prop="nickname"
										>
											<el-input
												v-model="form.nickname"
												size="medium"
												placeholder="请输入群名称"
												maxlength="30"
												show-word-limit
											/>
										</el-form-item>
										<el-form-item label="群描述:">
											<el-input
												v-model="form.desc"
												type="textarea"
												rows="3"
												placeholder="请输入群描述"
											/>
										</el-form-item>
										<el-form-item>
											<el-button
												type="primary"
												icon="el-icon-edit"
												size="small"
												:loading="loading"
												@click="editGroup"
												>修改信息
											</el-button>
										</el-form-item>
									</el-form>
								</el-col>
								<el-col :span="10" class="avatar-col">
									<div class="avatar-box">
										<img
											v-show="form.avatar"
											:src="form.avatar"
										/>
										<div class="upload-icon">
											<i class="el-icon-upload" />
										</div>
										<div
											class="upload-mask"
											@click="isAvatarCropper = true"
										>
											<i class="el-icon-plus" />
										</div>
									</div>
									<p style="margin-top: 20px">设置头像</p>
								</el-col>
							</el-row>
						</el-main>

						<!-- 群成员模块 -->
						<el-main v-else-if="tabIndex == 1" class="no-padding">
							<el-container class="full-height">
								<el-header height="50px" class="notice-header">
									<!-- ( 共${members.length}人 )-->
									<el-input
										v-model="searchMembers"
										style="width: 150px"
										size="small"
										clearable
										prefix-icon="el-icon-search"
										:placeholder="`搜索群成员`"
									/>
									<p>
										<el-button
											plain
											size="small"
											icon="el-icon-plus"
											@click="inviteFriendBox = true"
											>邀请好友
										</el-button>

										<el-button
											plain
											size="small"
											icon="el-icon-plus"
											@click="selectAll"
											>全选
										</el-button>

										<el-dropdown
											v-if="hasSelect"
											size="small"
											style="margin-left: 10px"
											@command="batchMembers"
										>
											<el-button
												type="primary"
												size="small"
											>
												批量操作<i
													class="el-icon-arrow-down el-icon--right"
												></i>
											</el-button>
											<el-dropdown-menu slot="dropdown">
												<el-dropdown-item command="del"
													>批量踢出</el-dropdown-item
												>
												<!--<el-dropdown-item command="talk">批量禁言</el-dropdown-item>-->
												<!--<el-dropdown-item>设置管理</el-dropdown-item>-->
												<!--<el-dropdown-item>取消管理</el-dropdown-item>-->
											</el-dropdown-menu>
										</el-dropdown>
									</p>
								</el-header>
								<el-main class="no-padding">
									<el-scrollbar
										class="full-height"
										tag="section"
										:native="false"
									>
										<div class="members">
											<div
												v-for="member in filterMembers"
												class="member no-select"
												:class="{
													selectd:
														member.selected &&
														batchDelMember,
												}"
												:key="member.userId"
												@contextmenu="
													showMemberMenu(member)
												"
												@click.stop="select(member)"
											>
												<div class="item-header">
													<div class="avatar">
														<el-avatar
															:size="30"
															:src="member.avatar"
														>
															<img
																src="~@/assets/image/detault-avatar.jpg"
															/>
														</el-avatar>
														<span
															class="nickname max-length"
															:title="
																member.remark
																	? member.remark
																	: member.nickname
															"
														>
															{{
																member.remark
																	? member.remark
																	: member.nickname
															}}
														</span>
														<span
															class="larkc-tag"
															v-show="
																member.role == 1
															"
															>群主</span
														>
														<span
															class="larkc-tag"
															v-show="
																member.role == 2
															"
															>管理</span
														>
													</div>
													<div
														v-show="
															room.myRole <
																member.role
														"
														class="tools"
													>
														<i
															class="el-icon-success"
															:class="{
																'is-delete':
																	member.selected,
															}"
														/>
													</div>
												</div>
												<div class="profile">
													签名 |
													{{
														member.motto
															? member.motto
															: '未设置'
													}}
												</div>
											</div>
										</div>
									</el-scrollbar>
								</el-main>
							</el-container>
						</el-main>

						<!-- 群公告模块 -->
						<el-main v-else-if="tabIndex == 2" class="no-padding">
							<el-container class="full-height">
								<el-header
									class="notice-header"
									height="50px"
									style="padding-left: 14px"
								>
									<span
										>群公告 ({{
											notice.items.length
										}})</span
									>
									<el-button
										plain
										size="small"
										icon="el-icon-plus"
										@click="showNoticeBox(0, '', '')"
									>
										添加公告
									</el-button>
								</el-header>

								<el-main class="no-padding">
									<el-scrollbar
										class="full-height"
										tag="section"
										:native="false"
									>
										<div
											v-if="notice.items.length == 0"
											class="empty-notice"
										>
											<SvgNotData
												style="width: 80px; margin-bottom: 10px"
											/>
											<span>暂无群公告</span>
										</div>

										<div v-else class="notices">
											<div
												v-for="(item,
												index) in notice.items"
												:key="item.id"
												class="notice"
											>
												<div class="title">
													<!--@click="showNoticeBox(item.id, item.text)"-->
													<span
														class="left-title max-length"
														v-text="item.text"
													></span>
													<span
														class="right-tools no-select"
														@click="
															catNoticeDetail(
																index
															)
														"
														>{{
															item.isShow
																? '收起'
																: '展开'
														}}</span
													>
												</div>
												<p class="datetime">
													<el-avatar
														:size="15"
														:src="
															$root.getAvatar(
																item.userId
															)
														"
													>
														<img
															src="~@/assets/image/detault-avatar.jpg"
														/>
													</el-avatar>
													<span
														class="text nickname"
														v-text="item.nickname"
														@click="
															$refs.userBusinessCard.open(
																item.userId
															)
														"
													></span>
													<span class="text">
														发表于
														{{
															formatTime(
																item.time
															)
														}}
													</span>
												</p>
												<p
													class="content"
													:class="{
														retract: !item.isShow,
													}"
													v-text="item.text"
												></p>
											</div>
										</div>
									</el-scrollbar>
								</el-main>
							</el-container>
						</el-main>

						<el-main v-else-if="tabIndex == 3" class="no-padding">
						</el-main>
					</el-container>
				</el-main>
			</el-container>
		</div>

		<!-- 编辑公告信息 -->
		<div class="lum-dialog-mask animated fadeIn" v-show="notice.isShowform">
			<div class="notice-box">
				<h4>编辑群公告</h4>
				<el-form
					ref="noticeForm"
					:model="notice.form"
					:rules="notice.rules"
				>
					<!--<el-form-item label="标题" prop="title">-->
					<!--<el-input-->
					<!--v-model="notice.form.title"-->
					<!--size="medium"-->
					<!--placeholder="请输入标题..."-->
					<!--maxlength="30"-->
					<!--show-word-limit-->
					<!--/>-->
					<!--</el-form-item>-->
					<el-form-item label="详情" prop="content">
						<el-input
							class="inputhei"
							v-model="notice.form.content"
							type="textarea"
							rows="8"
							placeholder="请输入公告详情..."
							maxlength="500"
						/>
					</el-form-item>
					<el-form-item style="text-align: right">
						<el-button
							plain
							size="small"
							@click="notice.isShowform = false"
						>
							取消
						</el-button>
						<el-button
							type="primary"
							size="small"
							:loading="notice.loading"
							@click="onSubmitNotice"
							>提交
						</el-button>
					</el-form-item>
				</el-form>
			</div>
		</div>

		<transition name="el-fade-in-linear">
			<AvatarCropper
				:chatId="room.chatId"
				v-if="isAvatarCropper"
				@close="closeAvatarCropper"
			/>
		</transition>

		<!-- 查看好友用户信息 -->
		<UserBusinessCard ref="userBusinessCard" />

		<transition name="el-fade-in-linear">
			<GroupLaunch
				v-if="inviteFriendBox"
				:room-id="roomId"
				@close="inviteFriendBox = false"
				@invite-success="inviteSuccess"
			/>
		</transition>

		<!--群员右键-->
		<vue-context-menu
			:contextMenuData="menuMemberData"
			@detailMember="detailMember"
			@talkMember="setTalkTime"
			@delMember="delMember"
			@setRole="setRole"
		></vue-context-menu>
		<!-- @delMembers="delMembers" -->
	</div>
</template>
<script>
import { mapState } from 'vuex';
import AvatarCropper from '@/components/layout/AvatarCropper';
import UserBusinessCard from '@/components/user/UserBusinessCard';
import GroupLaunch from '@/components/group/GroupLaunch';
import { SvgNotData } from '@/core/icons';
import { roomApi } from '@/api/group';
import { contactData } from '@/utils/data/contactData';
import { beautifyTime, formateTime } from '@/utils/functions';
import { imUtils } from '@/utils/my/imUtils';
import { roomService } from '@/service/roomService';
import { busService } from '@/service/busService';
import { eventConst } from '@/utils/my/const/eventConst';

export default {
	name: 'GroupManage',
	props: {
		roomId: {
			type: [String, Number],
			default: null,
		},
	},
	components: {
		AvatarCropper,
		UserBusinessCard,
		GroupLaunch,
		SvgNotData,
	},
	data() {
		return {
			// 当前选中菜单
			tabIndex: 0,
			menus: [
				{ name: '群信息' },
				{ name: '群成员' },
				{ name: '群公告' },
				// { name: '群设置' },
			],

			loading: false,
			form: {
				nickname: '',
				desc: '',
				avatar: '',
			},
			rules: {
				nickname: [
					{
						required: true,
						message: '用户昵称不能为空!',
						trigger: 'blur',
					},
				],
			},
			// 群成员列表
			searchMembers: '',
			batchDelMember: true,
			// 群公告相关数据
			notice: {
				isShowform: false,
				loading: false,
				form: {
					id: 0,
					title: '',
					content: '',
				},
				rules: {
					title: [
						{
							required: true,
							message: '标题不能为空!',
							trigger: 'blur',
						},
					],
					content: [
						{
							required: true,
							message: '详情不能为空',
							trigger: 'blur',
						},
					],
				},
				items: [],
			},
			inviteFriendBox: false,
			isAvatarCropper: false,
			contextMember: null,
		};
	},
	computed: {
		...mapState({
			records: (state) => state.dialogue.records,
		}),
		filterMembers() {
			let members =
				this.searchMembers == ''
					? this.members
					: this.members.filter((item) => {
							return (
								item.nickname.match(this.searchMembers) != null
							);
					  });
			members.forEach((item) => {
				let userId = item.userId;
				let friend = contactData.getItem(userId);
				console.log(friend);
				if (friend) item.remark = friend.nickname;
			});
			return members;
		},
		room() {
			if (this.roomId) {
				let room = contactData.getRoomById(this.roomId);
				this.form = room;
				return room;
			}
			return {};
		},
		members() {
			if (this.room) {
				return this.room.members;
			}
			return [];
		},
		menuMemberData() {
			let item = this.contextMember;
			let data = {
				menuName: 'memberItem',
				axis: {
					x: -100,
					y: -100,
				},
				menulists: [],
			};
			if (item && item.float != 'right') {
				data.axis = {
					x: item.x,
					y: item.y,
				};
				let menulists = [];
				//如果不是自己且角色为1,.float
				if (this.room.myRole != 3) {
					let userId = item.userId;
					let member = contactData.getRoomMember(
						this.room.id,
						userId
					);
					if (member) {
						if (this.room.myRole < member.role) {
							let talkTime = member.talkTime;
							if (talkTime == null || talkTime == 0) {
								menulists.push({
									btnName: '禁言',
									icoName: 'el-icon-turn-off-microphone',
									children: [
										{
											btnName: '禁言15分钟',
											time: 15 * 60,
											icoName:
												'el-icon-turn-off-microphone',
											fnHandler: 'talkMember',
										},
										{
											btnName: '禁言30分钟',
											time: 30 * 60,
											icoName:
												'el-icon-turn-off-microphone',
											fnHandler: 'talkMember',
										},
										{
											btnName: '禁言1小时',
											time: 60 * 60,
											icoName:
												'el-icon-turn-off-microphone',
											fnHandler: 'talkMember',
										},
										{
											btnName: '禁言1天',
											time: 24 * 60 * 60,
											icoName:
												'el-icon-turn-off-microphone',
											fnHandler: 'talkMember',
										},
										{
											btnName: '禁言3天',
											time: 3 * 24 * 60 * 60,
											icoName:
												'el-icon-turn-off-microphone',
											fnHandler: 'talkMember',
										},
										{
											btnName: '永久禁言',
											time: -1,
											icoName:
												'el-icon-turn-off-microphone',
											fnHandler: 'talkMember',
										},
									],
								});
							} else {
								menulists.push({
									btnName: '取消禁言',
									icoName: 'el-icon-microphone',
									time: 0,
									fnHandler: 'talkMember',
								});
							}
							menulists.push({
								btnName: '踢出',
								icoName: 'el-icon-document-delete',
								fnHandler: 'delMember',
							});
							// menulists.push({
							// 	btnName: '踢出并清空所有消息',
							// 	icoName: 'el-icon-document-delete',
							// 	fnHandler: 'delMembers',
							// });
						}

						if (this.room.myRole == 1) {
							if (item.role == 2) {
								menulists.push({
									btnName: '取消管理员',
									icoName: 'el-icon-medal',
									fnHandler: 'setRole',
								});
							} else if (item.role == 3) {
								menulists.push({
									btnName: '设置管理员',
									icoName: 'el-icon-medal-1',
									fnHandler: 'setRole',
								});
							}
						}
					}
				}

				menulists.pushAll([
					{
						btnName: '成员详情',
						icoName: 'el-icon-tickets',
						fnHandler: 'detailMember',
					},
				]);
				data.menulists = menulists;
			}
			return data;
		},
		hasSelect() {
			return this.members.some((member) => {
				return member.selected;
			});
		},
	},

	created() {
		this.loadNotices();
		let that = this;
		busService.on(eventConst.refreshAvatar, function(chatId) {
			if (chatId == that.room.chatId) {
				that.form.avatar = imUtils.getAvatarUrl(chatId);
			}
		});
	},
	methods: {
		showMemberMenu(item) {
			let contextMember = item;
			this.contextMember = null;

			event.preventDefault();
			let x = event.clientX;
			let y = event.clientY;
			contextMember.x = x;
			contextMember.y = y;
			this.contextMember = contextMember;
		},
		setTalkTime(data) {
			let time = data.time;
			if (time != 0 && time != -1) {
				time = Math.round(new Date().getTime() / 1000) + time;
			}
			let userId = this.contextMember.userId;
			roomApi.setTalkTime(this.room.id, userId, time).then((res) => {
				if (data.btnName == '取消禁言') {
					return this.$message.success('以取消禁言');
				} else {
					this.$message.success('禁言成功');
				}
			});
			this.contextMember = null;
		},
		setRole() {
			let isManager = this.contextMember.role == 2;
			let setRole = isManager ? 3 : 2;
			let preText = isManager ? '取消' : '设置';
			roomApi
				.setRole(this.room.id, this.contextMember.userId, setRole)
				.then((res) => {
					if (res.resultCode == 1) {
						this.$store.commit('set_role', {
							roomId: this.room.id,
							userId: this.contextMember.userId,
							role: setRole,
						});
						this.$message.success(preText + '管理员成功.');
					} else {
						this.$message.error(
							preText + '管理员失败.' + res.resultMsg
						);
					}
				})
				.finally((res) => {
					this.contextMember = null;
				});
		},
		// 查看好友用户信息
		detailMember() {
			this.$refs.userBusinessCard.open(this.contextMember.userId);
			this.contextMember = null;
		},
		// 查看好友用户信息
		delMember() {
			roomService.delMember(this.room.id, [this.contextMember.userId]);
			this.contextMember = null;
		},
		// 查看好友用户信息
		delMembers() {
			roomService.delMember(this.room.id, [this.contextMember.userId]);
			this.contextMember = null;

			let params = this.records.filter((item) => {
				console.log('item', item.fromUserId);
				return this.contextMember.userId != item.fromUserId;
			});
			this.$store.state.dialogue.records = params;
		},
		formatTime(time) {
			return beautifyTime(time);
		},
		// 加载群组公告列表
		loadNotices() {
			roomApi
				.listNotice({
					roomId: this.roomId,
					pageIndex: 0,
					pageSize: 10,
				})
				.then((res) => {
					if (res.resultCode == 1) {
						this.notice.items = res.data.pageData.map((item) => {
							item.isShow = false;
							return item;
						});
					}
				});
		},

		// 修改群信息
		editGroup() {
			this.$refs.groupForm.validate((valid) => {
				if (!valid) return false;
				this.loading = true;
				roomApi
					.updateRoom({
						roomId: this.roomId,
						roomName: this.form.nickname,
						desc: this.form.desc,
					})
					.then((res) => {
						if (res.resultCode == 1) {
							this.room.nickname = this.form.nickname;
							this.room.desc = this.form.desc;
							this.room.avatar = this.form.avatar;
							this.$message({
								message: '信息修改成功...',
								type: 'success',
							});
						} else {
							this.$message('信息修改失败...');
						}
					})
					.finally(() => {
						this.loading = false;
					});
			});
		},

		// 左侧菜单栏切换事件
		triggerTab(i) {
			this.tabIndex = i;
		},

		// 关闭头像裁剪弹出层
		closeAvatarCropper(type) {
			this.isAvatarCropper = false;
			if (type == 1) {
				this.form.avatar = imUtils.getAvatarUrl(this.room.chatId, true);
			}
		},

		// 显示编辑公告窗口
		showNoticeBox(id = 0, content = '') {
			this.notice.isShowform = true;
			this.notice.form.id = id;
			this.notice.form.content = content;
		},

		// 编辑公告提交事件
		onSubmitNotice() {
			this.$refs.noticeForm.validate((valid) => {
				if (!valid) return false;

				this.notice.loading = true;
				roomApi
					.addNotice(this.roomId, this.notice.form.content)
					.then((res) => {
						if (res.resultCode == 1) {
							this.notice.isShowform = false;
							this.loadNotices();
							this.$notify({
								title: '消息提示',
								message: this.notice.form.id
									? '群公告修改成功...'
									: '群公告添加成功...',
								type: 'success',
							});
						} else {
							this.$notify({
								title: '消息提示',
								message: this.notice.form.id
									? '群公告修改失败...'
									: '群公告添加失败...',
								type: 'success',
							});
						}
					})
					.catch(() => {
						this.$notify({
							title: '消息提示',
							message: '网络异常，请稍后再试...',
							position: 'bottom-right',
							type: 'warning',
						});
					})
					.finally(() => {
						this.notice.loading = false;
					});
			});
		},

		// 展开/收起群公告详情
		catNoticeDetail(index) {
			this.notice.items[index].isShow = !this.notice.items[index].isShow;
		},

		// 查看群成员信息事件
		catUserDetail(item) {
			this.$refs.userBusinessCard.open(item.userId);
		},

		selectAll() {
			let params = this.members.map((item) => {
				if (this.room.myRole < item.role) {
					if (item.selected) {
						return true;
					}
				}
			});

			params = params.filter((item) => {
				return item === true;
			});
			if (params.length < this.members.length - 1) {
				this.members.map((item) => {
					if (this.room.myRole < item.role) {
						item.selected = true;
					}
				});
			} else {
				this.members.map((item) => {
					if (this.room.myRole < item.role) {
						item.selected = false;
					}
				});
			}

			// this.members.forEach(item => {
			//   if(this.room.myRole < item.role){
			//     item.selected = !item.selected
			//   }
			// })
		},

		// 选中删除成员事件
		select(member) {
			//如果是群住， 不可选择群住
			//如果是管理员， 只能选择成员
			if (this.room.myRole < member.role) {
				let i = this.members.findIndex((item) => {
					return item.userId === member.userId;
				});
				this.members[i].selected = !this.members[i].selected;
			}
		},

		// 批量删除群成员
		batchMembers(type) {
			let ids = [],
				names = [];
			this.members.forEach((item) => {
				if (item.selected) {
					ids.push(item.userId);
					names.push(item.nickname);
				}
			});

			if (ids.length == 0) {
				this.batchDelMember = false;
				return;
			}

			if (type == 'del') {
				this.batchDelMembers(ids, names);
			} else if (type == 'talk') {
				this.batchTalk(ids, names);
			}
		},

		batchDelMembers(ids, names) {
			let that = this;
			this.$confirm(
				`您确定要将【 ${names.join('、')}】移出群聊?`,
				'温馨提示',
				{
					confirmButtonText: '确定删除',
					cancelButtonText: '取消',
					dangerouslyUseHTMLString: true,
					customClass: 'border-radius0',
				}
			)
				.then(() => {
					roomService.delMember(this.roomId, ids);
				})
				.catch(() => {
					this.members.map((item) => {
						return (item.selected = false);
					});
				});
		},

		batchTalk(ids, names) {
			let that = this;
			this.$confirm(
				`您确定要将【 ${names.join('、')}】禁言吗?`,
				'温馨提示',
				{
					confirmButtonText: '确定禁言',
					cancelButtonText: '取消',
					dangerouslyUseHTMLString: true,
					customClass: 'border-radius0',
				}
			)
				.then(() => {
					roomService.batchTalk(this.roomId, ids);
				})
				.catch(() => {
					this.members.map((item) => {
						return (item.selected = false);
					});
				});
		},

		// 好友邀请成功回调方法
		inviteSuccess() {
			this.inviteFriendBox = false;
		},
	},
};
</script>
<style lang="less" scoped>
.lum-dialog-box {
	width: 80%;
	height: 500px;
	max-width: 800px;
}

.aside-border {
	display: flex;
	flex-direction: column;
	padding: 8px;
	border-right: 1px solid #f5f5f5;

	.menu-list {
		height: 25px;
		line-height: 25px;
		margin: 8px 2px;
		font-weight: 400;
		font-size: 13px;
		background-color: white;
		cursor: pointer;
		border-left: 3px solid white;
		padding-left: 10px;

		&.selectd {
			color: #2196f3;
			border-color: #2196f3;
		}
	}
}

.avatar-col {
	display: flex;
	justify-content: center;
	flex-direction: column;
	align-items: center;
}

.avatar-box {
	width: 100px;
	height: 100px;
	box-shadow: 0px 0px 7px 1px #e8e4e4;
	border-radius: 50%;
	position: relative;
	cursor: pointer;
	transition: ease 0.5s;

	.upload-icon {
		position: absolute;
		right: 0;
		top: 0;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background-color: rgba(184, 184, 197, 0.2);
		display: flex;
		justify-content: center;
		align-items: center;

		i {
			font-size: 30px;
			color: #1bb0f3;
		}
	}

	img {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		z-index: 0;
	}

	.upload-mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background-color: rgba(0, 0, 0, 0.2);
		z-index: 3;
		display: none;
		justify-content: center;
		align-items: center;

		i {
			font-size: 30px;
			color: white;
		}
	}

	&:hover .upload-mask {
		display: flex;
	}
}

/* 群成员相关 start */
.members {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	padding: 5px 20px;
	justify-content: space-between;

	.member {
		width: 48%;
		height: 70px;
		border-radius: 3px;
		cursor: pointer;
		border: 1px dashed #e2dcdc;
		margin: 5px 0;
		padding: 3px;
		transition: ease 0.5s;

		.larkc-tag {
			color: #3370ff;
			background-color: #e1eaff;
		}

		.item-header {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;

			.avatar {
				flex: 1 1;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				display: flex;
				flex-direction: row;
				align-items: center;
				padding: 3px 5px;

				.nickname {
					max-width: 120px;
					font-size: 13px;
					margin: 0 5px 0 15px;
				}
			}

			.tools {
				flex-basis: 50px;
				overflow: hidden;
				text-align: right;
				padding-right: 5px;

				i {
					color: #cccccc;
				}

				.is-delete {
					color: #03a9f4;
				}
			}
		}

		.profile {
			color: #8f8a8a;
			font-size: 12px;
			padding: 3px 5px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			margin: 3px 0;
		}

		&:hover,
		&.selectd {
			border-color: #2196f3;
		}
	}
}

/* 群成员相关 end */

/* 公告相关 start */
.notice-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.empty-notice {
	width: 100%;
	height: 100%;
	min-height: 200px;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;

	span {
		color: #cccccc;
		font-size: 13px;
	}
}

.notices {
	.notice {
		cursor: pointer;
		min-height: 76px;
		overflow: hidden;
		border-bottom: 1px dashed #e2dcdc;
		margin-bottom: 15px;
		margin-right: 15px;
		padding-bottom: 5px;
		margin: 2px 20px 15px 15px;

		h6 {
			font-size: 15px;
			font-weight: 300;
		}

		.title {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			height: 30px;

			.left-title {
				flex: 1 1;
				height: 100%;
				line-height: 30px;
				font-size: 14px;
			}

			.right-tools {
				flex-basis: 70px;
				flex-shrink: 0;
				height: 100%;
				line-height: 30px;
				text-align: right;
				font-weight: 300;
				font-size: 12px;
				color: #2196f3;
			}
		}

		.datetime {
			font-size: 10px;
			color: #a59696;
			font-weight: 300;
			display: flex;
			flex-direction: row;
			align-items: center;
			margin: 10px 0;

			.text {
				margin: 0 5px;
			}

			.nickname {
				color: #2196f3;
				font-weight: 400;
			}
		}

		.retract {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.content {
			font-size: 12px;
			line-height: 28px;
			font-weight: 500;
			color: #7d7a7a;
		}
	}
}

.notice-box {
	position: relative;
	padding: 28px;
	background: #fff;
	box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.2);
	border-radius: 4px;
	overflow: hidden;
	box-sizing: border-box;
	height: 420px;
	width: 420px;

	h4 {
		margin-bottom: 20px;
		font-weight: 400;
	}
}
.inputhei {
	height: 200px;
	overflow-y: auto;
}

/* 公告相关 end */

/deep/.el-scrollbar__wrap {
	overflow-x: hidden;
}
</style>
