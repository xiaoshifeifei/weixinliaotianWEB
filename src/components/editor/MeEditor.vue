<template>
	<div>
		<el-container
			:class="[
				'editor-container',
				(roomTalkTime != 0 || memberTalkTime != 0) && room.myRole == 3
					? 'disabled'
					: '',
			]"
		>
			<el-header class="no-padding toolbar" height="35px">
				<ul>
					<li v-popover:popoverEmoticon>
						<i
							class="iconfont icon-icon_im_face"
							style="font-size: 15px"
						/>
						<p class="tip-title">表情符号</p>
					</li>
					<!--<li @click="codeBlock.isShow = true">-->
					<!--<i class="iconfont icon-daima" />-->
					<!--<p class="tip-title">代码片段</p>-->
					<!--</li>-->
					<!--<li @click="recorder = true">-->
					<!--<i class="el-icon-headset" />-->
					<!--<p class="tip-title">语音消息</p>-->
					<!--</li>-->
					<li @click="$refs.restFile.click()">
						<i class="el-icon-picture-outline-round" />
						<p class="tip-title">图片</p>
					</li>
					<li @click="$refs.restFile2.click()">
						<i class="el-icon-folder" />
						<p class="tip-title">附件</p>
					</li>
					<li v-popover:commonText>
						<i class="el-icon-reading" />
						<p class="tip-title">常用语</p>
					</li>
					<li @click="$refs.friends.show()">
						<i class="el-icon-share" />
						<p class="tip-title">好友分享</p>
					</li>
					<li @click="$refs.redSendCard.show()">
						<img
							class="icon"
							style="width: 20px;padding-top: 6px"
							src="~@/assets/image/red.png"
							alt=""
						/>
						<p class="tip-title">红包</p>
					</li>
					<!--<li @click="filesManager.isShow = true">-->
					<!--<i class="el-icon-folder-opened" />-->
					<!--<p class="tip-title">上传管理</p>-->
					<!--</li>-->

					<p class="text-tips no-select">
						<span>按Enter发送 / Shift+Enter 换行</span>
						<el-popover
							placement="top-end"
							width="600"
							trigger="click"
						>
							<div class="editor-books">
								<div class="books-title">编辑说明:</div>
								<p>
									1.支持上传QQ及微信截图，在QQ或微信中截图后使用Ctrl+v上传图片。
								</p>
								<p>
									2.支持浏览器及Word文档中的图片复制上传、复制后使用Ctrl+v上传图片。
								</p>
								<p>3.支持图片拖拽上传。</p>
								<p>4.支持文件上传 ( 文件小于100M ) 。</p>
								<p>5. 按Enter发送 / Shift+Enter 换行。</p>
								<p>
									6.注意：当文件正在上传时，请勿关闭网页或离开当前对话框，否则将导致文件停止上传或上传失败。
								</p>
							</div>
							<i class="el-icon-info" slot="reference" />
						</el-popover>
					</p>
				</ul>

				<friends ref="friends" @confirm="sendFriends" />

				<el-popover
					ref="popoverEmoticon"
					placement="top-start"
					width="500"
					trigger="click"
					popper-class="no-padding"
				>
					<MeEditorEmoticon
						ref="editorEmoticon"
						@selected="selecteEmoticon"
					/>
				</el-popover>

				<form
					enctype="multipart/form-data"
					style="display: none"
					ref="fileFrom"
				>
					<input
						type="file"
						ref="restFile"
						accept="image/*"
						@change="uploadImageChange"
					/>
					<input
						type="file"
						ref="restFile2"
						@change="uploadFileChange"
					/>
				</form>
			</el-header>
			<el-main class="no-padding textarea">
				<div
					class="center-vertical"
					v-if="
						roomTalkTime != null &&
							roomTalkTime != 0 &&
							room.myRole == 3
					"
				>
					群组禁言中
				</div>
				<div
					class="center-vertical"
					v-else-if="
						memberTalkTime != null &&
							memberTalkTime != 0 &&
							room.myRole == 3
					"
				>
					个人禁言中
				</div>

				<div
					id="inputContent"
					class="textInput lum-scrollbar"
					contenteditable="true"
					v-else
					ref="textarea"
					v-paste="pasteImage"
					v-drag="dragPasteImage"
					rows="6"
					placeholder="你想要的聊点什么呢 ..."
					@keydown="keydownEvent($event)"
					@input="inputEvent($event)"
				></div>
			</el-main>
		</el-container>

		<!-- 图片查看器 -->
		<MeEditorImageView
			ref="imageViewer"
			v-model="imageViewer.isShow"
			:file="imageViewer.file"
			@confirm="confirmUploadImage"
		/>

		<red-send-card ref="redSendCard" />

		<MeEditorRecorder v-if="recorder" @close="recorder = false" />

		<!-- 代码块编辑器 -->
		<!--<TalkCodeBlock-->
		<!--v-if="codeBlock.isShow"-->
		<!--:edit-mode="codeBlock.editMode"-->
		<!--@close="codeBlock.isShow = false"-->
		<!--@confirm="confirmCodeBlock"-->
		<!--/>-->

		<!--群员-->
		<group-members
			ref="groupMembers"
			:room-id="isGroup ? room.id : null"
			@submit="selectAitMembers"
		/>

		<!-- 文件上传管理器 -->
		<MeEditorFileManage ref="filesManager" v-model="filesManager.isShow" />

		<el-popover
			ref="commonText"
			placement="top-start"
			width="500"
			trigger="click"
			popper-class="no-padding"
		>
			<div style="padding: 10px">
				<el-button type="primary" size="small" @click="add"
					>添加</el-button
				>
			</div>
			<div
				class="infinite-list-wrapper lum-scrollbar"
				style="overflow-y:scroll;height: 180px;width: 100%"
			>
				<ul
					class="list"
					v-infinite-scroll="loadTexts"
					infinite-scroll-disabled="disabled"
				>
					<li v-for="commonText in commonTexts" class="list-item">
						<span
							class="max-length"
							style="width: calc(100% - 30px)"
							@click="clickCommon(commonText)"
						>
							{{ commonText.content }}
						</span>
						<span
							class="el-icon-delete"
							style="flex: 1;text-align: right"
							@click="delCommon(commonText)"
						></span>
					</li>
				</ul>
				<p v-if="loading" style="text-align: center; margin-top: 10px;">
					加载中...
				</p>
				<p v-if="noMore" style="text-align: center; margin-top: 10px">
					没有更多了
				</p>
			</div>
		</el-popover>
	</div>
</template>

<script>
import MeEditorEmoticon from './MeEditorEmoticon';
import MeEditorFileManage from './MeEditorFileManage';
import MeEditorImageView from './MeEditorImageView';
import MeEditorRecorder from './MeEditorRecorder';
import TalkCodeBlock from '@/components/chat/TalkCodeBlock';
import { getPasteImgs, getDragPasteImg } from '@/utils/editor';
import { lastUtils } from '@/utils/my/lastChatUtils';

import { ServeSendTalkCodeBlock } from '@/api/chatApi';
import { chatApi } from '@/api/chatApi';
import { WEBIM } from '@/utils/old/webim';
import { msgConst } from '@/utils/my/const/msgConst';
import { chatUtils } from '@/utils/my/chatUtils';
import { contactData } from '@/utils/data/contactData';
import { InputContent } from '@/utils/my/inputContent';
import GroupMembers from '@/components/group/GroupMembers';
import { commonTextApi } from '@/api/commonTexts';
import Friends from '@/components/chat/Friends';
import { messageService } from '@/service/messageService';
import RedSendCard from '@/components/chat/RedSendCard';

export default {
	name: 'MeEditor',
	components: {
		RedSendCard,
		Friends,
		GroupMembers,
		MeEditorEmoticon,
		MeEditorFileManage,
		MeEditorImageView,
		TalkCodeBlock,
		MeEditorRecorder,
	},

	props: ['params'],
	computed: {
		chatId() {
			return this.$store.state.dialogue.chatId;
		},
		isGroup() {
			return chatUtils.isGroupId(this.chatId);
		},
		roomTalkTime() {
			if (this.room) return this.room.talkTime;
		},
		memberTalkTime() {
			if (this.room) {
				let member = contactData.getRoomMember(
					this.room.id,
					this.$root.userId
				);
				if (member) return member.talkTime;
			}
		},
		room() {
			return contactData.getItem(this.chatId);
		},
		disabled() {
			return this.loading || this.noMore;
		},
	},
	watch: {
		chatId(chatId) {
			let text = this.getDraftText(chatId);
			this.inputContent.setHtml(text);
		},
		params() {},
	},
	data() {
		return {
			//分享好友
			showFriendsDia: false,

			page: 0,
			loading: false,
			noMore: false,
			commonTexts: [],
			//显示群员， @
			showGroupMembers: false,
			// 当前编辑的内容
			// 图片查看器相关信息
			imageViewer: {
				isShow: false,
				file: null,
			},

			codeBlock: {
				isShow: false,
				editMode: true,
			},

			filesManager: {
				isShow: false,
			},

			// 录音器
			recorder: false,

			// 上次发送消息的时间
			sendtime: 0,

			// 发送间隔时间（默认1秒）
			interval: 1000,
			inputContent: null,
		};
	},
	mounted() {
		this.inputContent = new InputContent(this.$refs.textarea);
		this.loadTexts();
	},
	methods: {
		sendFriends(ids) {
			messageService.sendCard(ids);
		},
		clickCommon(item) {
			this.inputContent.appendMessage(item.content);
			this.$refs.commonText.doClose();
		},
		loadTexts() {
			this.loading = true;
			commonTextApi
				.page(this.page)
				.then((res) => {
					if (res.resultCode == 1) {
						let data = res.data;
						this.commonTexts.pushAll(data);
						this.page++;
						if (data.length != 15) {
							this.noMore = true;
						}
					}
				})
				.finally(() => {
					this.loading = false;
				});
		},
		delCommon(item) {
			this.$confirm(
				`此操作将 <span style="color:red;font-size:16px;">删除常用语</span>, 是否继续?`,
				'提示',
				{
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning',
					center: true,
					dangerouslyUseHTMLString: true,
				}
			).then(() => {
				commonTextApi.del(item.id);
				this.commonTexts.delByFields('id', item.id);
			});
		},
		add() {
			this.$prompt('请输入常用语内容', '添加', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				customClass: 'border-radius0',
				inputPlaceholder: '请输入常用语内容',
				inputValue: '',
			})
				.then(({ value }) => {
					if (!value || !value.trim()) {
						this.$message.error('常用语内容不能为空');
						return false;
					}
					commonTextApi.add(value).then((res) => {
						if (res.resultCode == 1) {
							this.page = 0;
							this.commonTexts = [];
							this.loadTexts();

							this.$notify({
								title: '成功',
								message: '常用语内容添加成功...',
								type: 'success',
							});
						} else {
							this.$notify({
								title: '消息',
								message: '常用语内容添加失败，请稍后再试...',
								type: 'warning',
							});
						}
					});
				})
				.catch(() => {});
		},
		// 读取对话编辑草稿信息
		getDraftText(chatId) {
			return lastUtils.findTalk(chatId).draftText || '';
		},

		//复制粘贴图片回调方法
		pasteImage(e) {
			let files = getPasteImgs(e);
			if (files.length == 0) {
				let text = e.clipboardData.getData('text');
				this.inputContent.appendMessage(text);
			} else {
				this.openImageViewer(files[0]);
				e.stopPropagation();
			}
			e.preventDefault();
		},

		//拖拽上传图片回调方法
		dragPasteImage(e) {
			let files = getDragPasteImg(e);
			if (files.length == 0) return;

			this.openImageViewer(files[0]);
		},

		inputEvent(e) {
			let word = e.data;
			if (word == '@' && this.isGroup) {
				this.inputContent.delLastWord();
				this.$refs.groupMembers.show();
			} else {
				let val = e.target.innerHTML;
				this.$emit('keyboard-event', val);
			}
		},
		selectAitMembers(members) {
			members.forEach((member) => {
				this.aitMember(member.userId, member.nickname);
			});
		},
		// 键盘按下监听事件
		keydownEvent(e) {
			let val = this.inputContent.getHtml();

			if (e.keyCode == 13 && val == '') {
				e.preventDefault();
			}
			// 回车发送消息
			if (e.keyCode == 13 && e.shiftKey == false && val != '') {
				let currentTime = new Date().getTime();

				if (this.sendtime > 0) {
					// 判断 1秒内只能发送一条消息
					if (currentTime - this.sendtime < this.interval) {
						e.preventDefault();
						return false;
					}
				}

				let ids = this.inputContent.getAits().join(',');
				let content = this.inputContent.getText();
				if (content) {
					if (ids == '-1') {
						ids = this.chatId;
					}
					this.$emit('send', { content: content, objectId: ids });
					this.sendtime = currentTime;
					e.target.innerHTML = '';
				} else {
					e.target.innerHTML = val;
				}
				e.preventDefault();
			}
		},

		aitMember(userId, name) {
			this.inputContent.ait(userId, name);
		},

		getInputContent() {
			let inputContentEl = this.$refs.textarea;
			let text = inputContentEl.innerText || inputContentEl.textContent;
			return text.trim();
		},

		// 选择图片文件后回调方法
		uploadImageChange(e) {
			this.openImageViewer(e.target.files[0]);
			this.$refs.restFile.value = null;
		},

		// 选择文件回调事件
		uploadFileChange(e) {
			let maxsize = 100 * 1024 * 1024;
			if (e.target.files.length == 0) {
				return false;
			}

			let file = e.target.files[0];
			if (/\.(gif|jpg|jpeg|png|webp|GIF|JPG|PNG|WEBP)$/.test(file.name)) {
				this.openImageViewer(file);
				return;
			}

			if (file.size > maxsize) {
				this.$notify.info({
					title: '消息',
					message: '上传文件不能大于100M',
				});
				return;
			}

			let fileMsg = WEBIM.createMessage(
				msgConst.file,
				'fileUrl',
				this.chatId
			);
			fileMsg.fileName = file.name;
			fileMsg.fileSize = file.size;
			let isVideo =
				file.type.indexOf('mp4') != -1 ||
				file.type == 'video/quicktime';
			if (isVideo) {
				fileMsg.type = msgConst.video;
			}
			// this.filesManager.isShow = true
			this.$refs.restFile2.value = null;
			// this.$refs.filesManager.upload(file)

			chatApi
				.uploadImage(file)
				.then((res) => {
					if (res.resultCode == 1) {
						let audios = res.data.audios;
						let videos = res.data.videos;
						let others = res.data.others;
						let url = null;
						if (audios && audios.length != 0)
							url = audios[0].ourl || audios[0].oUrl;
						if (videos && videos.length != 0)
							url = videos[0].ourl || videos[0].oUrl;
						if (others && others.length != 0)
							url = others[0].ourl || others[0].oUrl;
						if (url) {
							fileMsg.content = url;
							// let imgMsg = WEBIM.createMessage(, ourl, this.chatId);
							WEBIM.sendMessage(fileMsg);
						}
					}
				})
				.finally(() => {});
		},

		// 打开图片查看器
		openImageViewer(file) {
			this.imageViewer.isShow = true;
			this.imageViewer.file = file;
		},

		// 代码块编辑器确认完成回调事件
		confirmCodeBlock(data) {
			const { source, receive_id } = this.$store.state.dialogue;
			ServeSendTalkCodeBlock({
				source,
				receive_id,
				code: data.code,
				lang: data.language,
			}).then((res) => {
				if (res.resultCode == 1) {
					this.codeBlock.isShow = false;
				} else {
					this.$notify.error({
						title: '错误',
						message: '代码消息发送失败',
					});
				}
			});
		},

		// 确认上传图片消息回调事件
		confirmUploadImage(type) {
			let ref = this.$refs.imageViewer;
			let file = this.imageViewer.file;
			console.log('661', type, file);
			chatApi
				.uploadImage(file)
				.then((res) => {
					ref.loading = false;
					console.log('662', res);
					//{"total":1,"data":{"images":[{"status":1,"message":null,"ofileName":"机器人.png",
					// "ourl":"http://47.75.105.163:18089/u/2/10000002/202108/o/机器人.png",
					// "turl":"http://47.75.105.163:18089/u/2/10000002/202108/t/机器人.png"}],
					// "audios":[],"videos":[],"others":[]},"success":1,"failure":0,"resultCode":1,"time":161,"resultMsg":null}
					if (res.resultCode == 1) {
						ref.closeBox();
						let oUrl = res.data.images[0].oUrl;
						if (!oUrl) oUrl = res.data.images[0].oUrl;
						let imgMsg = WEBIM.createMessage(
							msgConst.image,
							oUrl,
							this.chatId
						);
						WEBIM.sendMessage(imgMsg);
					}
				})
				.finally(() => {
					console.log('663', 'error');
					ref.loading = false;
				});
		},

		// 选中表情包回调事件
		selecteEmoticon(data) {
			if (data.type == 1) {
				this.inputContent.appendMessage(data.value);
			}
			this.$refs.popoverEmoticon.doClose();
		},
	},
};
</script>
<style scoped>
.list-item {
	display: flex;
	align-items: center;
	justify-content: left;
	height: 35px;
	background: #fff6f6;
	color: #ff8484;
	padding: 0px 10px;
}

.infinite-list-wrapper .list-item + .list-item {
	margin-top: 10px;
}

.textInput {
	height: calc(100% - 10px);
	padding: 5px;
	overflow-y: scroll;
}

.editor-container {
	height: 160px;
	width: 100%;
	background-color: white;
}

.editor-container .toolbar {
	line-height: 35px;
	border-bottom: 1px solid #f5f0f0;
	border-top: 1px solid #f5f0f0;
}

.editor-container .toolbar li {
	list-style: none;
	float: left;
	width: 35px;
	margin-left: 3px;
	cursor: pointer;
	text-align: center;
	line-height: 35px;
	position: relative;
	color: #8d8d8d;
}

.editor-container .toolbar li .tip-title {
	display: none;
	position: absolute;
	top: 38px;
	left: 0px;
	height: 26px;
	line-height: 26px;
	background-color: rgba(31, 35, 41, 0.9);
	color: white;
	min-width: 30px;
	font-size: 10px;
	padding: 0 5px;
	border-radius: 2px;
	white-space: pre;
	text-align: center;
	user-select: none;
	z-index: 1;
}

.editor-container .toolbar li:hover .tip-title {
	display: block;
}

.editor-container .toolbar li:hover {
	background-color: #f7f5f5;
}

.editor-container .toolbar .text-tips {
	float: right;
	margin-right: 15px;
	font-size: 12px;
	color: #ccc;
}

.editor-container .toolbar .text-tips i {
	font-size: 14px;
	cursor: pointer;
	margin-left: 5px;
	color: rgb(255, 181, 111);
}

.editor-container .textarea {
	overflow: hidden;
	position: relative;
}

textarea {
	width: calc(100% - 10px);
	width: -moz-calc(100% - 10px);
	width: -webkit-calc(100% - 10px);
	height: calc(100% - 10px);
	height: -moz-calc(100% - 10px);
	height: -webkit-calc(100% - 10px);
	border: 0 none;
	outline: none;
	resize: none;
	font-size: 15px;
	overflow-y: auto;
	color: #464545;
	padding: 5px;
	position: relative;
}

textarea::-webkit-scrollbar {
	width: 4px;
	height: 1px;
}

textarea::-webkit-scrollbar-thumb {
	background: #d5cfcf;
}

textarea::-webkit-scrollbar-track {
	background: #ededed;
}

textarea::-webkit-input-placeholder {
	color: #dccdcd;
	font-size: 12px;
	font-weight: 400;
}

/* 编辑器文档说明 --- start */
.editor-books .books-title {
	font-size: 16px;
	height: 30px;
	line-height: 22px;
	margin-top: 10px;
	margin-bottom: 10px;
	border-bottom: 1px solid #cbcbcb;
	color: #726f6f;
	font-weight: 400;
	margin-left: 11px;
}

.editor-books p {
	text-indent: 10px;
	font-size: 12px;
	height: 30px;
	line-height: 30px;
	color: #7f7c7c;
}

/* 编辑器文档说明 --- end */
</style>
