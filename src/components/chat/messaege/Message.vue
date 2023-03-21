<template>
    <div class="chat-message">
        <!-- 文本消息 -->
        <text-message  v-if="msg.type == msgConst.text"
                :content="msg.contentFmt" :float="msg.float" :full-width="false" :arrow="true" />

        <!-- 回复消息 -->
        <reply-message v-else-if="msg.type == msgConst.answer" :msg="msg" />

        <!-- 图片消息 -->
        <image-message :src="msg.contentFmt" v-else-if="msg.type==msgConst.image"/>
        <image-message :src="gifContent(msg.contentFmt)" v-else-if="msg.type==msgConst.gif"/>

        <!-- 音频文件预留 -->
        <audio-message v-else-if="msg.type==msgConst.voice" :src="msg.contentFmt" />

        <!-- 视频文件预留 -->
        <video-message v-else-if="msg.type==msgConst.video" :src="msg.contentFmt" />

        <!-- 文件消息 -->
        <file-message v-else-if="msg.type==msgConst.file" :file="msg"/>
        <card-message v-else-if="msg.type==msgConst.card" :msg="msg"/>

        <!-- 会话记录消息 -->
        <forward-message v-else-if="msg.type == 4" :forward="msg.forward" :record_id="msg.id" />
        <red-message v-else-if="msg.type == msgConst.red" :msg="msg" />

        <!-- 未知消息 -->
        <div class="unknown-msg" v-else>
            <!-- 未知消息类型[{{ msg.type }}] -->
            您收到转账红包，请在手机上领取
        </div>
    </div>
</template>

<script>
import {msgConst} from "@/utils/my/const/msgConst";
import {gifSources} from "@/utils/my/const/emoji";
import CardMessage from "@/components/chat/messaege/CardMessage";
import RedMessage from "@/components/chat/messaege/RedMessage";

export default {
  name: 'Message',
    components: {RedMessage, CardMessage},
    props:{
    msg:{
      type: Object,
      default: function () {
        return {};
      }
    }
  },
  computed:{
      gifData(){
          let res = {};
          this.gifSources.forEach(gif=>{
              res[gif.name] = gif.src;
          })
          return res;
      }
  },
  data() {
    return {
        msgConst,
        gifSources
    }
  },
  created() {},
  methods: {
      gifContent(name){
          return this.gifData[name]
      }
  },
}
</script>
<style lang="less" scoped>
  .reply-message {
    margin-top: 5px;
    min-height: 28px;
    background: #f7f1f1;
    line-height: 28px;
    font-size: 12px;
    padding: 0 10px;
    border-radius: 3px;
    color: #a7a2a2;
  }

</style>
