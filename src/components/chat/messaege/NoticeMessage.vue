<template>
	<div class="revoke-message">
		<div class="content">
			<span v-if="item.type == 10 || item.type == 906">
				<!-- 禁言时间显示处理 -->
				{{ item.contentFmt }} |
				{{ sendTimes(item.content, item.createTime) }}
			</span>
			<span
				v-else-if="item.type == 202"
				:class="{ contents: myParams == 0 }"
			>
				<span v-if="myParams">
					{{ item.contentFmt }} | {{ sendTime(item.createTime) }}
				</span>
				<span v-else> </span>
			</span>
			<span v-else>
				{{ item.contentFmt }} | {{ sendTime(item.createTime) }}
			</span>
		</div>
	</div>
</template>
<script>
import { formateTime as sendTime } from '@/utils/functions';
import { formateTime as sendTimes } from '@/utils/funcPa';

export default {
	name: 'NoticeMessage',
	props: {
		item: {
			type: Object,
		},
	},
	data() {
		return {
			myParams: null,
		};
	},
	created() {
		// console.log("获取参数item", this.item.type, this.item, sessionStorage.getItem("isShowRevoke"));
		this.myParams = sessionStorage.getItem('isShowRevoke');
	},
	methods: {
		sendTime,
		sendTimes,
	},
};
</script>
<style lang="less" scoped>
.revoke-message {
	display: flex;
	justify-content: center;

	.content {
		margin: 10px auto;
		background-color: #f5f5f5;
		font-size: 11px;
		line-height: 30px;
		padding: 0 8px;
		word-break: break-all;
		word-wrap: break-word;
		color: #979191;
		user-select: none;
		font-weight: 300;
		display: inline-block;
		border-radius: 3px;

		span {
			margin: 0 5px;
		}

		a {
			color: #939596;
			cursor: pointer;
			font-size: 12px;
			font-weight: 400;

			&:hover {
				color: black;
			}
		}
	}

	.contents {
		display: none;
	}
}
</style>
