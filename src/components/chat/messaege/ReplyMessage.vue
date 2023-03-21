<template>
    <div class="reply-message text-message">
        <div class="original_msg" onclick="toOriginal">
            回复： <message :msg="originalMsg"/>
        </div>
        <div class="real-msg">
            {{msg.contentFmt}}
        </div>
    </div>
</template>

<script>
    import {msgUtils} from "@/utils/my/msgUtils";
    import Message from "@/components/chat/messaege/Message";

    export default {
        name: 'ReplyMessage',
        components: {Message},
        props: {
            msg: {
                type: Object,
                default: function () {
                    return {};
                }
            }
        },
        computed: {
            originalMsg() {
                if (this.msg && this.msg.objectId) {
                    let msg = JSON.parse(this.msg.objectId)
                    return msgUtils.wrapMessage(msg)
                }
                return {};
            }
        },
        data() {
            return {}
        },
        created() {
        },
        methods: {
            toOriginal() {
                this.$emit('toOriginal', this.originalMsg)
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
