import SocketInstance from './socket-instance'
import {imUtils} from "@/utils/my/imUtils";
import {chatUtils} from "@/utils/my/chatUtils";
import {chatService} from "@/service/chatService";
import {beautifyTime} from "@/utils/functions";
import {lastUtils} from "@/utils/my/lastChatUtils";
import {busService} from "@/service/busService";
import {eventConst} from "@/utils/my/const/eventConst";
import {msgConst} from "@/utils/my/const/msgConst";

export default {
    created() {
    },
    computed: {
        userId() {
            return this.$store.state.user.userId
        },
        chatId(){
            return this.$store.state.dialogue.chatId;
        }
    },
    methods: {
        // 美化时间格式
        beautifyTime,
        getAvatar: imUtils.getAvatarUrl,
        // 页面初始化设置
        initialize() {
            SocketInstance.connect()
        },
        // 跳转到指定好友对话页
        dumpTalkPage(chatId) {
            //如果没有此会话， 则创建
            if(!chatUtils.hasChat(chatId)){
                console.log(`跳转回话${chatId}, 不存在创建.......`)
                lastUtils.newChat(chatId, '', msgConst.text)
            }
            busService.emit(eventConst.setChatId, chatId);
            if (this.$route.path == '/index/message') {
                this.$root.$children[0].refreshView()
                return
            }
            this.$router.push('/index/message')

        },
    },
}
