<template>
	<settings-page>
		<div class="box">
			<div class="container">
				<h4>设置个人信息</h4>
				<el-row>
					<el-col :span="15">
						<el-form ref="form" :model="form" :rules="rules">
							<el-form-item label="登录账号:">
								<p>{{ form.mobile }}</p>
							</el-form-item>
							<el-form-item label="版本号:">
								<p style="font-weight: 700;">{{ myData }}</p>
							</el-form-item>
							<!--<el-form-item label="电子邮箱:">-->
							<!--<p>-->
							<!--<span>{{ form.email ? form.email : '未设置邮箱' }}</span>-->
							<!--<el-button-->
							<!--type="text"-->
							<!--icon="el-icon-edit-outline"-->
							<!--style="margin-left: 20px; font-weight: 300"-->
							<!--@click="toEmail"-->
							<!--&gt;{{ form.email ? '修改邮箱' : '设置邮箱' }}</el-button-->
							<!--&gt;-->
							<!--</p>-->
							<!--</el-form-item>-->
							<el-form-item label="昵称:" prop="nickname">
								<el-input
									v-model="form.nickname"
									size="medium"
									placeholder="给自己起个名字"
								/>
							</el-form-item>
							<el-form-item label="性别:">
								<el-radio-group v-model="form.sex">
									<el-radio :label="1">男</el-radio>
									<el-radio :label="0">女</el-radio>
								</el-radio-group>
							</el-form-item>
							<el-form-item label="座右铭:">
								<el-input
									type="textarea"
									v-model="form.description"
									rows="3"
									placeholder="编辑我的座右铭..."
								/>
							</el-form-item>
							<el-form-item>
								<el-button
									type="primary"
									@click="onSubmit"
									size="medium"
									:loading="loading"
									>立即修改</el-button
								>
							</el-form-item>
						</el-form>
					</el-col>
					<el-col :span="8" class="avatar-col">
						<div class="avatar-box">
							<img :src="form.avatar" v-show="form.avatar" />
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
						<p>设置头像</p>
					</el-col>
				</el-row>
			</div>

			<AvatarCropper
				:chatId="form.userId"
				v-if="isAvatarCropper"
				@close="closeAvatarCropper"
			/>
		</div>
	</settings-page>
</template>
<script>
import AvatarCropper from '@/components/layout/AvatarCropper';
import { ServeUpdateUserDetail, userApi } from '@/api/user';
import { imUtils } from '@/utils/my/imUtils';
import { busService } from '@/service/busService';
import { eventConst } from '@/utils/my/const/eventConst';
import SettingsPage from '@/views/settings/Layout';
import { AppConfig } from '@/utils/old/appconfig';

export default {
	name: 'UsrBasePage',
	components: {
		SettingsPage,
		AvatarCropper,
	},
	data() {
		return {
			isAvatarCropper: false,
			myData: AppConfig.version,
			form: {
				nickname: '',
				sex: '',
				avatar: '',
				motto: '',
				email: '',
				mobile: '',
				userId: null,
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

			loading: false,
		};
	},
	activated() {
		this.getUserDetail();
		let userId = this.$root.userId;
		let that = this;
		busService.on(eventConst.refreshAvatar, function(chatId) {
			if (chatId == userId) {
				that.form.avatar = imUtils.getAvatarUrl(chatId);
				// that.form.avatar = this.$store.state.user.avatar
			}
		});
	},
	created() {
		this.getUserDetail();
		let userId = this.$root.userId;
		let that = this;
		busService.on(eventConst.refreshAvatar, function(chatId) {
			if (chatId == userId) {
				that.form.avatar = imUtils.getAvatarUrl(chatId);
				// that.form.avatar = this.$store.state.user.avatar
			}
		});
	},
	methods: {
		toEmail() {
			this.$router.push('/index/settings/security');
		},
		onSubmit() {
			this.$refs['form'].validate((valid) => {
				if (!valid) return false;
				this.editUserDetail();
			});
		},

		// 关闭头像裁剪弹出层
		closeAvatarCropper(type, avatar = '') {
			this.isAvatarCropper = false;
			if (type == 1) {
				this.form.avatar = imUtils.getAvatarUrl(this.form.userId, true);
				this.$store.commit('updateAvatar');
			}
		},

		// 获取用户信息
		getUserDetail() {
			userApi.get().then((res) => {
				if (res.resultCode == 1) {
					let data = res.data;
					data.mobile = data.phone;
					this.form = data;
					// this.form.avatar = imUtils.getAvatarUrl(data.userId)
					this.form.avatar = this.$store.state.user.avatar;
				}
			});
		},

		// 修改用户信息
		editUserDetail() {
			this.loading = true;
			ServeUpdateUserDetail({
				nickname: this.form.nickname,
				avatar: this.form.avatar,
				description: this.form.description,
				sex: this.form.sex,
			})
				.then((res) => {
					if (res.resultCode == 1) {
						this.$store.commit('UPDATE_USER_INFO', {
							nickname: this.form.nickname,
							sex: this.form.sex,
							signature: this.form.motto,
							avatar: this.form.avatar,
						});

						this.$message({
							message: '信息修改成功...',
							type: 'success',
						});
					}
				})
				.finally(() => {
					this.loading = false;
				});
		},
	},
};
</script>
<style lang="less" scoped>
.box {
	height: 100%;
	overflow-y: auto;
}

.container h4 {
	color: rgba(0, 0, 0, 0.85);
	font-size: 20px;
	font-weight: 500;
	line-height: 28px;
	margin-bottom: 12px;
}

.container /deep/ .el-input__inner,
.container /deep/ .el-textarea__inner {
	border-radius: 0;
}

.container /deep/ .el-button {
	border-radius: 2px;
	font-weight: 400;
}

.avatar-col {
	display: flex;
	justify-content: center;
	flex-direction: column;
	align-items: center;

	.avatar-box {
		width: 180px;
		height: 180px;
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

	> p {
		margin-top: 20px;
	}
}

@media screen and (max-width: 1150px) {
	.avatar-box {
		width: 130px;
		height: 130px;
	}
}

@media screen and (max-width: 750px) {
	.avatar-box {
		width: 100px;
		height: 100px;
	}
}
</style>
