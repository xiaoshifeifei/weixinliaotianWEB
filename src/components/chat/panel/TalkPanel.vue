<template>
	<div>
		<el-container class="ov-hidden full-height" style="position: relative">
			<PanelHeader
				ref="panelHeader"
				:data="params"
				:keyboard="inputEvent"
				@event="handleHeaderEvent"
			/>

			<!-- 主体信息 -->
			<el-main class="main-box no-padding" style="height: 100%">
				<div
					id="lumenChatPanel"
					class="talks-container lum-scrollbar"
					@scroll="talkPanelScroll($event)"
				>
					<!-- 数据加载状态栏 -->
					<div class="loading-toolbar">
						<span v-if="loadRecord.status == 0" class="color-blue">
							<i class="el-icon-loading" /> 正在加载数据中...
						</span>
						<span
							v-else-if="loadRecord.status == 1"
							class="pointer color-blue"
							@click="loadChatRecords"
						>
							<i class="el-icon-bottom" /> 查看更多消息...
						</span>
						<span v-else> 没有更多消息了... </span>
					</div>

					<!-- 消息主体 -->
					<div v-for="(item, idx) in records" :key="item.id">
						<!-- 群消息 -->
						<!-- <div v-if="item.msg_type == 3" class="message-box">
              <invite-message @cat="catFriendDetail" :invite="item.invite" />
            </div> -->

						<!-- 撤回消息 -->
						<div v-if="item.is_revoke == 1" class="message-box">
							<revoke-message :item="item" />
						</div>

						<div v-else-if="item.isNotice == 1">
							<div
								v-if="item.type == 202 && isShowRevoke == 0"
							></div>
							<div class="message-box" v-else>
								<notice-message :item="item" />
							</div>
						</div>

						<!-- 其它对话消息 -->
						<div
							v-else
							class="message-box record-box"
							:class="{
								'direction-rt': item.float == 'right',
								'checkbox-border': multiSelect.isOpen === true,
							}"
						>
							<aside
								v-show="multiSelect.isOpen"
								class="checkbox-column"
							>
								<i
									class="el-icon-success"
									:class="{
										selected: verifyMultiSelect(item.id),
									}"
									@click="triggerMultiSelect(item.id)"
								/>
							</aside>
							<aside
								class="avatar-column"
								@contextmenu="
									showMemberMenu(
										item.fromUserId,
										item.fromUserName
									)
								"
							>
								<el-avatar
									v-if="
										item.fromUserId !=
											$store.state.user.userId
									"
									class="pointer"
									:size="30"
									:src="item.avatar"
								/>
								<el-avatar
									v-else
									class="pointer"
									:size="30"
									:src="$store.state.user.avatar"
								/>
							</aside>
							<main class="main-column">
								<div class="talk-title">
									<span
										class="time"
										v-show="
											item.chatType == 1 ||
												(item.chatType == 2 &&
													item.float == 'right')
										"
									>
										<i class="el-icon-time" />
										{{
											parseTime(
												item.createTime,
												'{m}月{d}日 {h}:{i}'
											)
										}}
									</span>
								</div>

								<div
									@contextmenu="showMsgMenu(item)"
									class="talk-content"
								>
									<span
										v-show="
											item.chatType == 2 &&
												item.float == 'left'
										"
										class="nickname max-length"
										:title="getNickName(item)"
									>
										{{ getNickName(item) }} |
										{{
											parseTime(
												item.createTime,
												'{m}月{d}日 {h}:{i}'
											)
										}}
									</span>

									<message :msg="item" />
								</div>
							</main>
						</div>

						<!-- 消息时间 -->
						<!-- <div v-show="compareTime(idx, item.createTime)" class="datetime no-select"
              v-text="sendTime(item.createTime)" />  -->
						<!-- </span> -->
						<div v-if="item.type == 202 && isShowRevoke == 0"></div>
						<div v-else class="datetime no-select">
							<div
								v-show="compareTime(idx, item.createTime)"
								v-text="sendTime(item.createTime)"
							></div>
						</div>
					</div>
				</div>

				<!-- 置底按钮 -->
				<transition name="el-fade-in-linear">
					<div
						v-show="tipsBoard"
						class="tips-board pointer"
						@click="talkPanelScrollBottom"
					>
						<SvgMentionDown class="svg" />
						<span>回到底部</span>
					</div>
				</transition>

				<!-- 新消息气泡 -->
				<div
					v-show="tipsBoard && unreadMessage.num"
					class="talk-bubble pointer no-select"
					@click="talkPanelScrollBottom"
				>
					<i class="el-icon-chat-dot-round" />
					<span>新消息({{ unreadMessage.num }}条)</span>
					<span>
						&nbsp;#{{ unreadMessage.nickname }}#
						{{ unreadMessage.content }}
					</span>
				</div>
			</el-main>

			<div v-if="currentAnswer" class="current-answer">
				<a class="close pointer" @click="closeAnswer">
					<span aria-hidden="true" style="font-weight: 200;">×</span>
				</a>
				<message :msg="currentAnswer" />
			</div>

			<!-- 页脚信息 -->
			<el-footer class="footer-box" height="160">
				<template v-if="multiSelect.isOpen === false">
					<MeEditor
						ref="myEditor"
						@send="submitSendMesage"
						@keyboard-event="onKeyboardEvent"
						:params="ispa"
					/>
				</template>
				<template v-else>
					<PanelToolbar
						v-model="multiSelect.items.length"
						@event="handleMultiMode"
					/>
				</template>
			</el-footer>

			<!-- 群设置侧边栏 -->
			<div
				class="sidebar-box"
				:class="{ show: group.panel }"
				v-outside="hideChatGroup"
			>
				<GroupPanel
					v-if="isGroup"
					:room-id="roomId"
					@close="hideChatGroup"
					@send-group="hideChatGroup"
					@quit-group="quitGroupSuccess"
				/>
			</div>
		</el-container>

		<!-- 消息管理器 -->
		<transition name="el-fade-in-linear">
			<TalkSearchRecord
				v-if="findChatRecord"
				:source="params.chatType"
				:chat-id="params.chatId"
				:titleName="params.nickname"
				@close="findChatRecord = false"
			/>
		</transition>

		<!-- 选择联系人 -->
		<transition name="el-fade-in-linear">
			<Contacts
				ref="contacts"
				@close="transferCancel"
				@confirm="transferHandler"
			/>
		</transition>

		<!-- 好友用户信息 -->
		<UserBusinessCard ref="userBusinessCard" />

		<!-- 群公告组件 -->
		<transition name="el-fade-in-linear">
			<GroupNotice
				v-if="group.notice"
				:group-id="roomId"
				@close="group.notice = false"
			/>
		</transition>

		<!--消息右键-->
		<vue-context-menu
			:contextMenuData="menuData"
			@onCopy="onCopy"
			@removeRecords="removeRecords"
			@forwardRecords="forwardRecords"
			@revokeRecords="revokeRecords"
			@answerRecord="answerRecord"
		></vue-context-menu>

		<!--群员右键-->
		<vue-context-menu
			:contextMenuData="menuMemberData"
			@detailMember="detailMember"
			@talkMember="setTalkTime"
			@aitMember="aitMember"
			@delMember="delMember"
		></vue-context-menu>
		<!-- @delMembers="delMembers" -->
	</div>
</template>
<script>
import { mapState } from 'vuex';
import UserBusinessCard from '@/components/user/UserBusinessCard';
import TalkSearchRecord from '@/components/chat/TalkSearchRecord';
import Contacts from '@/components/chat/Contacts';
import GroupPanel from '@/components/group/GroupPanel';
import GroupNotice from '@/components/group/GroupNotice';
import MeEditor from '@/components/editor/MeEditor';
import PanelHeader from './PanelHeader';
import PanelToolbar from './PanelToolbar';
import SocketInstance from '@/socket-instance';
import { SvgMentionDown } from '@/core/icons';
import { copyTextToClipboard, formateTime, parseTime } from '@/utils/functions';
import { chatApi, ServeRemoveRecords } from '@/api/chatApi';
import NoticeMessage from '@/components/chat/messaege/NoticeMessage';
import { WEBIM } from '@/utils/old/webim';
import { msgUtils } from '@/utils/my/msgUtils';
import { msgConst } from '@/utils/my/const/msgConst';
import { chatUtils } from '@/utils/my/chatUtils';
import { contactData } from '@/utils/data/contactData';
import { lastUtils } from '@/utils/my/lastChatUtils';
import { messageService } from '@/service/messageService';
import { roomApi } from '@/api/group';
import { roomService } from '@/service/roomService';
import { objectUtils } from '@/utils/my/objectUtils';
import GroupMembers from '@/components/group/GroupMembers';
import Message from '@/components/chat/messaege/Message';
import { busService } from '@/service/busService';
import { electronService } from '@/service/electronService';
import { get, post } from '@/utils/request';
// import { get } from 'lodash'

export default {
	name: 'TalkPanel',
	components: {
		Message,
		GroupMembers,
		NoticeMessage,
		MeEditor,
		Contacts,
		GroupPanel,
		TalkSearchRecord,
		UserBusinessCard,
		GroupNotice,
		SvgMentionDown,
		PanelToolbar,
		PanelHeader,
	},
	props: {
		// 对话相关参数
		params: {
			type: Object,
			default: function() {
				return {
					// 消息接收者ID（好友ID或者群聊ID）
					chatId: 0,
					nickname: '',
				};
			},
		},
		// 用户是否在线
		isOnline: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			ispa: false,
			//当前回复的消息
			currentAnswer: null,
			msgConst,
			// 记录加载相关参数
			loadRecord: {
				status: 0,
				minRecord: 0,
				endTime: 0,
			},
			// 多选相关操作
			multiSelect: {
				isOpen: false,
				items: [],
				mode: 0,
			},

			// 群组Box
			group: {
				panel: false,
				notice: false,
			},

			// 键盘输入事件
			keyboardEvent: {
				isShow: false,
				time: 0,
			},

			// 聊天记录管理器数据
			findChatRecord: false,

			// 置底按钮是否显示
			tipsBoard: false,

			//当前右键的消息
			contextMessage: null,
			//当前右键的群员
			contextMember: null,
			isShowRevoke: null, //是否展示撤回消息
		};
	},
	computed: {
		...mapState({
			unreadMessage: (state) => state.talks.unreadMessage,
			inputEvent: (state) => state.notify.inputEvent,
			userId: (state) => state.user.userId,
			records: (state) => state.dialogue.records,
			chatId: (state) => state.dialogue.chatId,
		}),
		lastMsgTime() {
			if (this.records && this.records.length != 0) {
				return this.records[0].timeSend;
			}
			return 0;
		},
		isGroup() {
			return chatUtils.isGroupId(this.chatId);
		},
		roomTalkTime() {
			if (this.room) return this.room.talkTime;
		},
		memberTalkTime() {
			if (this.room)
				return contactData.getRoomMember(
					this.room.id,
					this.$root.userId
				);
		},
		room() {
			return contactData.getItem(this.chatId);
		},
		roomId() {
			let chatDetail = this.room;
			if (chatDetail) {
				return chatDetail.id;
			}
		},
		menuData() {
			let item = this.contextMessage;
			let data = {
				menuName: 'msgItem',
				axis: {
					x: -100,
					y: -100,
				},
				menulists: [],
			};
			if (item) {
				data.axis = {
					x: item.x,
					y: item.y,
				};
				let menulists = [];
				menulists.pushAll([
					{
						btnName: '复制',
						icoName: 'el-icon-document-copy',
						fnHandler: 'onCopy',
					},
					{
						btnName: '删除',
						icoName: 'el-icon-delete',
						fnHandler: 'removeRecords',
					},
					{
						btnName: '转发',
						icoName: 'el-icon-s-promotion',
						fnHandler: 'forwardRecords',
					},
				]);
				// if (item.fromUserId == this.userId || this.room.myRole != 3) {
				//   // let time = new Date().getTime() - Date.parse(item.createTime.replace(/-/g, '/'))
				//   // if (Math.floor(time / 1000 / 60) < 2) {
				//   // menulists.pushAll([
				//   //   {
				//   //     btnName: '撤回',
				//   //     icoName: 'el-icon-s-flag',
				//   //     fnHandler: 'revokeRecords'
				//   //   }
				//   // ])
				//   // }
				// }
				// if (item.fromUserId == this.userId || this.room.myRole == 1) {
				if (this.room.myRole == 1) {
					menulists.pushAll([
						{
							btnName: '撤回',
							icoName: 'el-icon-s-flag',
							fnHandler: 'revokeRecords',
						},
					]);
				} else if (item.fromUserId == this.userId) {
					menulists.pushAll([
						{
							btnName: '撤回',
							icoName: 'el-icon-s-flag',
							fnHandler: 'revokeRecords',
						},
					]);
				}

				// }
				menulists.pushAll([
					{
						btnName: '回复',
						icoName: 'el-icon-chat-line-round',
						fnHandler: 'answerRecord',
					},
				]);
				data.menulists = menulists;
			}
			return data;
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

				if (this.isGroup && this.room.myRole != 3) {
					let userId = item.userId;
					let member = contactData.getRoomMember(
						this.room.id,
						userId
					);
					if (member) {
						let talkTime = member.talkTime;
						if (talkTime == null || talkTime == 0) {
							menulists.push({
								btnName: '禁言',
								icoName: 'el-icon-turn-off-microphone',
								children: [
									{
										btnName: '禁言15分钟',
										time: 15 * 60,
										icoName: 'el-icon-turn-off-microphone',
										fnHandler: 'talkMember',
									},
									{
										btnName: '禁言30分钟',
										time: 30 * 60,
										icoName: 'el-icon-turn-off-microphone',
										fnHandler: 'talkMember',
									},
									{
										btnName: '禁言1小时',
										time: 60 * 60,
										icoName: 'el-icon-turn-off-microphone',
										fnHandler: 'talkMember',
									},
									{
										btnName: '禁言1天',
										time: 24 * 60 * 60,
										icoName: 'el-icon-turn-off-microphone',
										fnHandler: 'talkMember',
									},
									{
										btnName: '禁言3天',
										time: 3 * 24 * 60 * 60,
										icoName: 'el-icon-turn-off-microphone',
										fnHandler: 'talkMember',
									},
									{
										btnName: '永久禁言',
										time: -1,
										icoName: 'el-icon-turn-off-microphone',
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
				}

				menulists.pushAll([
					{
						btnName: '成员详情',
						icoName: 'el-icon-tickets',
						fnHandler: 'detailMember',
					},
					{
						btnName: '@',
						icoName: 'el-icon-price-tag',
						fnHandler: 'aitMember',
					},
				]);

				data.menulists = menulists;
			}
			return data;
		},
	},
	watch: {
		// 监听面板传递参数
		params() {
			this.loadRecord.minRecord = 0;
			this.tipsBoard = false;
			this.multiSelect = {
				isOpen: false,
				items: [],
				mode: 0,
			};
			this.loadChatRecords();
			this.contextMessage = null;
			this.contextMember = null;
		},
		isShowRevoke(item) {
			this.isShowRevoke = item;
		},
		contextMember(item) {
			// console.log("item", item);
			// console.log("this.room.myRole", this.room.myRole);
			// console.log("this.userId", this.userId);
		},
		userId(item) {
			// console.log("userId", item);
			// console.log("this.room.myRole", this.room.myRole);
			// console.log("this.userId", this.userId);
		},
	},
	created() {
		let that = this;

		busService.on('init-success', function() {
			//频繁掉线， 体验很差， 此处只重新拉取消息数据
			//校验当前会话是否存在
			//如果未好友会话， 拉取消息，
			//如果未群组会话， 拉取消息， 并拉取成员信息
			if (that.chatId) {
				that.loadChatRecords({ isFirst: true });
				if (that.isGroup) {
					that.$store.commit('setRoomMember', {
						roomId: that.room.id,
						focus: true,
					});
				}
			}
		});
	},
	mounted() {
		this.loadChatRecords();
	},
	methods: {
		parseTime,
		sendTime: formateTime,
		getNickName(msg) {
			let userId = msg.fromUserId;
			if (msg.float == 'right') {
				return msg.nickname;
			} else {
				let friend = contactData.getItem(userId);
				return friend ? friend.nickname : msg.nickname;
			}
		},
		testData(item) {
			let member = contactData.getRoomMember(
				this.room.id,
				item.fromUserId
			);
			return `群员被禁言${this.room.chatId}-${item.fromUserId}-${
				member ? member.talkTime : ''
			}`;
		},
		showMsgMenu(item) {
			this.contextMessage = null;

			event.preventDefault();
			let x = event.clientX;
			let y = event.clientY;
			item.x = x;
			item.y = y;
			this.contextMessage = item;
		},
		showMemberMenu(userId, name) {
			if (this.isGroup) {
				let contextMember = { userId: userId, name: name };
				this.contextMember = null;
				this.contextMessage = null;

				event.preventDefault();
				let x = event.clientX;
				let y = event.clientY;
				contextMember.x = x;
				contextMember.y = y;
				this.contextMember = contextMember;
			}
		},
		// 处理 Header 组件事件
		handleHeaderEvent(event_name) {
			switch (event_name) {
				case 'history':
					this.findChatRecord = true;
					break;
				case 'notice':
					this.group.notice = true;
					break;
				case 'setting':
					this.group.panel = true;
					break;
			}
		},

		// 回车键发送消息回调事件
		submitSendMesage({ content, objectId }) {
			if (this.roomId) {
				let msg = WEBIM.createMessage(1, content, this.params.chatId);
				if (this.currentAnswer) {
					let targetMsg = objectUtils.copy(this.currentAnswer);
					let answerJson = JSON.stringify(
						msgUtils.oldMessage(targetMsg)
					);
					msg.objectId = answerJson;
					msg.type = 94;
				} else {
					if (objectId) msg.objectId = objectId;
				}
				WEBIM.sendMessage(msg);
				this.currentAnswer = null;
			} else {
				let chatId = this.params.chatId;
				if (chatUtils.isGroupId(chatId)) {
					this.$message.error('该群组已解散.');
				} else {
					this.$message.error('好友已删除.');
				}
			}
			this.$store.commit('del_draft', this.chatId);
			// // 调用组件发送消息
			// SocketInstance.emit('event_talk', {
			//   // 发送消息的用户ID
			//   send_user: this.userId,
			//   // 接受者消息ID(用户ID或群ID)
			//   receive_user: this.params.chatId,
			//   // 聊天类型[1:私聊;2:群聊信息显示用户昵称;]
			//   source_type: this.params.source,
			//   // 消息文本
			//   text_message: content,
			// })
		},

		// 推送编辑事件消息
		onKeyboardEvent(text) {
			this.$store.commit('UPDATE_TALK_ITEM', {
				index: lastUtils.findTalkIndex(this.chatId),
				item: {
					draftText: text,
				},
			});

			// 判断是否推送键盘输入事件消息
			if (!this.$store.state.settings.keyboardEventNotify) {
				return false;
			}

			let time = new Date().getTime();

			// 判断当前对话是否属于私聊信息
			if (this.params.chatType == 2 || !this.isOnline) return;

			// 判断在两秒内是否已推送事件
			if (
				this.keyboardEvent.time != 0 &&
				time - this.keyboardEvent.time < 2000
			)
				return;

			this.keyboardEvent.time = time;

			// 调用父类Websocket组件发送消息
			SocketInstance.emit('event_keyboard', {
				send_user: this.userId,
				receive_user: this.params.chatId,
			});
		},

		// 加载用户聊天详情信息
		/**
		 *
		 * @param noScroll 是否滚动
		 * @param isFirst 是否加载第一页数据
		 */
		loadChatRecords({ noScroll, isFirst } = {}) {
			// // 获取不提示配置开关
			let myParams = {
				// pageIndex: 1,
				// pageSize: 100,
				roomId: this.params.chatId + '',
			};
			var that = this;
			get('/api/config', {})
				.then((res) => {
					// console.log("获取config参数", res.data.isShowRevoke);
					sessionStorage.setItem(
						'isShowRevoke',
						res.data.isShowRevoke
					);
					that.isShowRevoke = res.data.isShowRevoke;
				})
				.catch((err) => {
					console.log(err);
				});

			// roomApi.getRoom(this.params.chatId).then(res => {
			//   // let room = res.data
			//   //群组数据添加
			//   console.log("获取配置字段22", res.data);
			// });

			this.ispa = !this.ispa;
			const userId = this.userId;
			let chatId = this.params.chatId;
			const data = {
				chatId: chatId,
			};
			if (!isFirst && this.lastMsgTime) {
				data.endTime = Math.round(this.lastMsgTime / 1000);
			}
			this.loadRecord.status = 0;

			// //判断会话是否存在
			// if(this.id){
			//   if(chatUtils.isGroupId(chatId)){
			//     this.$message.error('群组已解散.')
			//     roomService.delRoomData(chatId)
			//   }else{
			//     this.$message.error('好友已删除.')
			//     friendService.beDel(chatId)
			//   }
			// }
			// console.log(66666, data);
			chatApi
				.pageMsg(data)
				.then((res) => {
					// 防止点击切换过快消息返回延迟，导致信息错误
					if (
						res.resultCode != 1 ||
						(data.chatId != chatId &&
							data.chatType != this.params.chatType)
					) {
						return;
					}
					let messages = msgUtils.wrapMessages(res.data);
					const records = messages.map((item) => {
						item.float = 'center';
						if (item.fromUserId > 0) {
							item.float =
								item.fromUserId == userId ? 'right' : 'left';
						}
						return item;
					});
					// console.log(data)
					let contents = records.map((msg) => msg.content);
					let timeSends = records.map((msg) => msg.timeSend);
					// console.log(contents)
					// console.log(timeSends)
					// 判断是否是初次加载
					if (!this.lastMsgTime) {
						this.$store.commit('SET_MSG', []);
					}

					this.$store.commit('UNSHIFT_MSG', {
						records: records.reverse(),
						push: isFirst,
					});
					this.loadRecord.status = records.length >= 20 ? 1 : 2;

					this.$nextTick(() => {
						let el = document.getElementById('lumenChatPanel');
						let scrollHeight = el.scrollHeight;
						if (!data.endTime) {
							el.scrollTop = el.scrollHeight;
						} else {
							el.scrollTop = el.scrollHeight - scrollHeight;
						}
					});
				})
				.catch(() => {
					this.loadRecord.status = 1;
				});
		},
		setTalkTime(data) {
			let time = data.time;
			if (time != 0 && time != -1) {
				time = Math.round(new Date().getTime() / 1000) + time;
			}
			let userId = this.contextMember.userId;
			roomApi.setTalkTime(this.roomId, userId, time).then((res) => {
				this.$message.success('禁言成功');
			});
			this.contextMember = null;
		},
		// 查看好友用户信息
		detailMember() {
			this.$refs.userBusinessCard.open(this.contextMember.userId);
			this.contextMember = null;
		},
		// 查看好友用户信息
		delMember() {
			roomService.delMember(this.roomId, [this.contextMember.userId]);
			this.contextMember = null;
		},
		// 查看好友用户信息
		delMembers() {
			roomService.delMember(this.room.id, [this.contextMember.userId]);
			this.contextMember = null;
			let params = this.records.filter((item) => {
				return this.contextMember.userId != item.fromUserId;
			});
			this.$store.state.dialogue.records = params;
		},
		aitMember() {
			this.$refs.myEditor.aitMember(
				this.contextMember.userId,
				this.contextMember.name
			);
			this.contextMember = null;
		},

		transferCancel() {
			this.contextMessage = null;
		},
		// 确认消息转发联系人事件
		transferHandler(arr) {
			messageService.transfer(this.contextMessage, arr);
			this.contextMessage = null;
		},
		// 处理消息时间是否显示
		compareTime(index, datetime) {
			if (datetime == undefined) {
				return false;
			}

			if (this.records[index].is_revoke == 1) {
				return false;
			}

			datetime = datetime.replace(/-/g, '/');
			let time = Math.floor(Date.parse(datetime) / 1000);
			let currTime = Math.floor(new Date().getTime() / 1000);

			// 当前时间5分钟内时间不显示
			if (currTime - time < 300) return false;

			// 判断是否是最后一条消息,最后一条消息默认显示时间
			if (index == this.records.length - 1) {
				return true;
			}
			let createTime = this.records[index + 1].createTime;
			// console.log(createTime)
			// console.log(this.records[index + 1])
			let nextDate = createTime.replace(/-/g, '/');

			return !(
				parseTime(new Date(datetime), '{y}-{m}-{d} {h}:{i}') ==
				parseTime(new Date(nextDate), '{y}-{m}-{d} {h}:{i}')
			);
		},

		// 撤回消息
		revokeRecords() {
			let item = this.contextMessage;
			messageService.revokeMsg(item);
			this.contextMessage = null;
		},
		closeAnswer() {
			this.currentAnswer = null;
		},
		//回复
		answerRecord() {
			let item = this.contextMessage;
			item.isEncrypt = item.isEncrypt ? 1 : 0;
			item.isReadDel = item.isReadDel ? 1 : 0;
			this.currentAnswer = item;

			this.contextMessage = null;
		},
		// 删除消息
		removeRecords() {
			let item = this.contextMessage;
			messageService.delMsg(item);
			this.contextMessage = null;
		},

		// 转发消息
		forwardRecords() {
			this.$refs.contacts.show();
		},

		// 从列表中删除记录
		delRecords(arr) {
			this.$store.commit('del_msg', arr);
			return this;
		},

		// 开启多选模式
		openMultiSelect() {
			this.multiSelect.isOpen = true;
		},

		// 关闭多选模式
		closeMultiSelect() {
			this.multiSelect.isOpen = false;
			this.multiSelect.items = [];
		},

		// 判断记录是否选中
		verifyMultiSelect(records_id) {
			return this.multiSelect.items.indexOf(records_id) >= 0;
		},

		// 触发多选事件
		triggerMultiSelect(records_id) {
			let i = this.multiSelect.items.indexOf(records_id);
			if (i >= 0) {
				this.multiSelect.items.splice(i, 1);
			} else {
				if (this.multiSelect.items.length >= 30) {
					this.$notify({
						title: '温馨提示',
						message: '批量操作最大支持30条数据...',
					});
					return false;
				}
				this.multiSelect.items.push(records_id);
			}
		},

		// 验证是否存在选择的指定类型的消息
		verifyMultiSelectType(type) {
			return this.records.some((item) => {
				return this.verifyMultiSelect(item.id) && item.msg_type == type;
			});
		},

		onCopy() {
			let item = this.contextMessage;
			if (item.type == msgConst.image) {
				electronService.downAndCopy(item.content);
			} else if (item.type == msgConst.text) {
				copyTextToClipboard(item.content);
			}
			this.contextMessage = null;
		},

		hideChatGroup() {
			this.group.panel = false;
		},

		// 退出群聊回调事件
		quitGroupSuccess() {
			this.$emit('close-talk');
		},

		// 对话面板滚动事件
		talkPanelScroll(e) {
			if (e.target.scrollTop == 0 && this.loadRecord.status == 1) {
				this.loadChatRecords({ noScroll: true });
				return;
			}

			const height = e.target.scrollTop + e.target.clientHeight + 5;
			this.tipsBoard = height < e.target.scrollHeight;
			if (this.tipsBoard == false && this.unreadMessage.num > 0) {
				this.$store.commit('CLEAR_TLAK_UNREAD_MESSAGE');
			}
		},

		// 聊天版本滚动到底部
		talkPanelScrollBottom() {
			let el = document.getElementById('lumenChatPanel');
			el.scrollTop = el.scrollHeight;
		},
	},
};
</script>
<style lang="less" scoped>
.main-box {
	position: relative;
}

/* 面板页脚 */
.footer-box {
	height: 160px !important;
	padding: 0;
	border-top: 1px solid #f5f5f5;
}

/* 侧边栏css */
.sidebar-box {
	position: absolute;
	width: 350px;
	height: 100%;
	top: 0px;
	right: -350px;
	background: white;
	transition: all 0.5s ease-in-out;
	-moz-transition: all 0.5s ease-in-out;
	-webkit-transition: all 0.5s ease-in-out;
	-o-transition: all 0.5s ease-in-out;

	&.show {
		right: 0;
		box-shadow: 0 0 14px #e2e1e1;
	}
}

.tips-board {
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	left: 0;
	right: 0;
	margin: 0 auto;
	bottom: 20px;
	height: 30px;
	width: 100px;
	border-radius: 20px;
	font-size: 12px;
	background-color: #fff;
	box-shadow: 0 2.5px 10px 0 rgba(31, 35, 41, 0.1);
	color: #1f2329;

	span {
		margin-left: 5px;
		margin-top: -2px;
	}

	.svg {
		width: 10px;
		height: 10px;
		color: black;
	}
}

.talk-bubble {
	position: absolute;
	left: 0px;
	bottom: 20px;
	max-width: 300px;
	height: 40px;
	line-height: 40px;
	border-radius: 0 20px 20px 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: white;
	padding: 0 15px 0 30px;
	font-size: 13px;
	background: #409eff;

	i {
		font-size: 22px;
		position: absolute;
		left: 5px;
		top: 9px;
	}
}

.talks-container {
	height: 100%;
	width: 100%;
	box-sizing: border-box;
	padding: 10px 15px 30px;
	overflow-y: auto;

	.message-box {
		width: 100%;
		min-height: 30px;
		margin-bottom: 5px;
	}

	.loading-toolbar {
		height: 30px;
		line-height: 30px;
		margin: 5px 0;
		text-align: center;
		user-select: none;
		font-size: 13px;
		color: #cec4c4;

		.color-blue {
			color: #409eff;
		}
	}

	.datetime {
		height: 30px;
		line-height: 30px;
		color: #ccc9c9;
		font-size: 12px;
		text-align: center;
		margin: 5px 0;
	}

	.record-box {
		display: flex;
		flex-direction: row;
		transition: 0.5s ease;

		.checkbox-column {
			display: flex;
			justify-content: center;
			flex-basis: 40px;
			flex-shrink: 0;
			order: 1;
			user-select: none;
			padding-top: 25px;

			i {
				color: #ccc;
				cursor: pointer;
				font-size: 22px;

				&.selected {
					color: #409eff !important;
				}
			}
		}

		.avatar-column {
			width: 40px;
			flex-basis: 40px;
			flex-shrink: 0;
			display: flex;
			justify-content: center;
			order: 2;
			user-select: none;
			padding-top: 22px;
		}

		.main-column {
			flex: 1 auto;
			order: 3;
			position: relative;
			box-sizing: border-box;
			padding: 5px;
			overflow: hidden;

			.talk-title {
				display: flex;
				align-items: center;
				height: 15px;
				margin-bottom: 2px;
				font-size: 10px;
				user-select: none;
				color: #a7a0a0;
				opacity: 1;
				transition: 0.5s ease;

				&.show {
					opacity: 1 !important;
				}

				span {
					transform: scale(0.9);
				}
			}

			.talk-content {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				box-sizing: border-box;
				width: 100%;

				.nickname {
					max-width: calc(100% - 200px);
					font-size: 12px;
					color: #a7a0a0;
					margin: -4px 0 4px -8px;
					transform: scale(0.9);
				}
			}

			&:hover {
				.talk-title {
					opacity: 1;
				}
			}
		}

		&.direction-rt {
			.avatar-column {
				order: 3;
			}

			.main-column {
				order: 2;

				.talk-title {
					justify-content: flex-end;
				}

				.talk-content {
					align-items: flex-end;
				}
			}
		}

		&.checkbox-border {
			border: 1px dashed #c4c4ec;

			&:hover {
				border-color: #409eff;
			}
		}
	}
}

.main-column > .talk-content .emoji {
	width: 100px !important;
	height: 10px !important;
}
</style>
