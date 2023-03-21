<template>

    <div style="background:#ff8a2a;">
        <div @click="openRed" class="attach" style="background:#ff8a2a;padding-top:4px">
            <div class="attach_bd">
                <!--fileName 3口令， 2：随机 1普通-->
                <div class="cover"><img src="~@/assets/image/ic_chat_hongbao.png"></div>
                <div class="cont" style="line-height:60px;">
                    <p style="color:white">{{msg.content}}</p>
                </div>
                <!--<div class="cont" style="line-height:60px;">-->
                    <!--<p style="color:white">{{typeContent}}</p>-->
                <!--</div>-->
            </div>
        </div>

        <red-card ref="redDetail"/>

    </div>

</template>

<script>
    import {msgApi} from "@/api/msgApi";
    import {myFn} from "@/utils/old/myFn";
    import RedCard from "@/components/chat/RedCard";

    export default {
        name: 'RedMessage',
        components: {RedCard},
        data() {
            return {}
        },
        props: {
            msg: {
                type: Object
            }
        },
        computed:{
            typeContent(){
                let type = this.msg.fileName;
                if(type==3){
                    return '口令红包';
                }else if (type==2){
                    return '普通红包';
                }else if (type==1){
                    return '手气红包';
                }
            },
        },
        methods: {
            openRed() {
                let redDetail = this.$refs.redDetail;
                let that = this;
                let packetId = this.msg.objectId;
                let userId = this.$root.userId
                msgApi.getRed(packetId).then(result => {
                    let redPacket = result.data.packet;//红包实体
                    let list = result.data.list;
                    if(result.resultCode!=1){
                        redDetail.show(redPacket, list);
                        this.$message.warning(result.resultMsg)
                    }else{
                        let num = 0;
                        let over;
                        //普通红包，自己发的
                        if (redPacket.type == 1 && redPacket.userId == userId && myFn.isNil(redPacket.roomJid)) {
                            // UI.createRedPacketDetailsHtml(redpacket, list);
                            redDetail.show(redPacket, list);
                        }
                        //非口令红包
                        else if (redPacket.type != 3) {
                            if (result.resultCode == 1) {
                                //收到红包的实体
                                msgApi.openRed(packetId).then(result=>{
                                    // count: 1
                                    // greetings: "财源滚滚，心想事成"
                                    // id: "61250af60dd4d60959737b44"
                                    // money: 0.1
                                    // outTime: 1629903990
                                    // over: 0
                                    // receiveCount: 0
                                    // roomJid: null
                                    // sendTime: 1629817590
                                    // status: 2
                                    // toUserId: 10000004
                                    // type: 1
                                    // userId: 10000002
                                    // userIds: [10000004]
                                    // userName: "1333"
                                    // yopRedPacketId: null

                                    //id: "61250d3c0dd4d60959737bdd"
                                    // money: 0.05
                                    // redId: "61250d130dd4d60959737bd5"
                                    // reply: null
                                    // sendId: 10000002
                                    // sendName: "1333"
                                    // time: 1629818172
                                    // userId: 10000004
                                    // userName: "34"

                                    if (result.resultCode == 1) {
                                        list = result.data.list;
                                        redPacket = result.data.packet;
                                        list.forEach(item=>{
                                            if(item.userId==userId){
                                                that.$message.success(`你领取了 ${item.sendName} 的红包 ${item.money}元`)
                                            }
                                        })
                                        redDetail.show(redPacket, list);
                                        // UI.createRedPacketDetailsHtml(redpacket, list);
                                        // this.$message.success(`你领取了 ${redPacket.userName} 的红包 ${redPacket.money}元`)
                                    }
                                })
                            } else if (result.resultCode == 0) {
                                list = result.data.list;
                                redDetail.show(redPacket, list);
                                // UI.createRedPacketDetailsHtml(redpacket, list);
                            }else{
                                redDetail.show(redPacket, list);
                                this.$message.warning(result.resultMsg)
                            }
                        }
                        //口令红包
                        else {
                            //个人
                            if(result.resultCode == 1){
                                //群消息 && 非自己发的
                                if (redPacket.userId != userId && !myFn.isNil(redPacket.roomJid)) {
                                    var command = prompt("请输入口令", "");
                                    if (redPacket.greetings == command) {
                                        msgApi.openRed(packetId).then(result=>{
                                            list = result.data.list;
                                            redPacket = result.data.packet;
                                            iredDetail.show(redPacket, list);
                                        });
                                    }else{
                                        this.$message.warning('口令有误!')
                                    }
                                }
                                //自己发的
                                else {
                                    // UI.createReadPacketDetailsHtml(redpacket, list);
                                    redDetail.show(redPacket, list);
                                }
                            }
                        }
                    }
                })
            }
        },
        created() {
        },
    }
</script>
<style lang="less" scoped>
    .red-msg {
        background-image: url(~@/assets/image/ic_chat_hongbao.png);
        width: 120px;
        background-size: cover;
        height: 140px;
    }


    .attach {
        padding: 10px 10px 0 10px;
        background-color: #fff;
        min-height: 75px;
        border-radius: 4px;
        -moz-border-radius: 4px;
        -webkit-border-radius: 4px;
        min-width: 250px;
        max-width: 300px;
        margin: 1px;
        position: relative;
    }

    .attach_bd .cover {
        display: table-cell;
        padding-right: 10px;
    }


    .attach_bd .cont {
        display: table-cell;
        vertical-align: top;
    }

    .attach_bd .cont .title {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-wrap: normal;
        max-width: 200px;
    }

    .attach_bd .cont .opr {
        margin-top: 25px;
    }

    .attach_bd .cont .opr a {
        color: #35ac2f;
        text-decoration: none;
    }


</style>
