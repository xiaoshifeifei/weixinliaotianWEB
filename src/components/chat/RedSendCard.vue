<template>
    <div v-show="visible" class="lum-dialog-mask animated fadeIn red">
        <el-container class="container" v-outside="close">
            <el-header class="no-padding header" height="80px">
                <i class="close el-icon-error pointer" @click="close" />
                <div class="f-row red-types">
                    <div class="f-item pointer" :class="domain.type == 2 ? 'active' : ''" @click="domain.type = 2">手气红包</div>
                    <div class="f-item pointer" :class="domain.type == 1 ? 'active' : ''" @click="domain.type = 1">普通红包</div>
                    <div class="f-item pointer" :class="domain.type == 3 ? 'active' : ''" @click="domain.type = 3">口令红包</div>
                </div>
            </el-header>

            <el-main class="red-main">
                <el-form ref="form" :model="domain" label-width="80px">
                    <el-form-item label="红包个数">
                        <el-input class="m-input" v-model="domain.count">
                            <template slot="append">个</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="总金额">
                        <el-input class="m-input" v-model="domain.money">
                            <template slot="append">元</template>
                        </el-input>
                    </el-form-item>
                    <div class="tip">小伙伴们领取的金额随机</div>
                    <el-button type="primary" @click="sendRed">塞钱进红包</el-button>
                </el-form>

            </el-main>
        </el-container>
    </div>
</template>
<script>

import { parseTime } from "@/utils/functions";
import { msgApi } from "@/api/msgApi";
import { WEBIM } from "@/utils/old/webim";
import { chatUtils } from "@/utils/my/chatUtils";
import { msgConst } from "@/utils/my/const/msgConst";
import { userApi } from "@/api/user";
import { EncryptUtils } from "@/utils/encryptUtils";
import { getCurrentMilliSeconds } from "@/utils/utils";
import { AppConfig } from "@/utils/old/appconfig";
import { getToken } from "@/utils/auth";
import CryptoJS from "crypto-js";

export default {
    name: 'RedSendCard',
    computed: {},
    data() {
        return {
            visible: false,
            //type moneyStr count greetings （roomJid 或toUserId ）     code ，time（当前时间戳+服务器时间与本地时间的时间差），
            // payPassword
            domain: {
                type: 2,
                count: null,
                money: null,
                password: null,
                des: '财源滚滚，心想事成',
                roomJid: null,
                codeId: null,
                code: null,
            }
        }
    },
    created() {

    },
    methods: {
        parseTime,
        sendRed() {
            let userId = this.$root.userId;
            userApi.getTmpCode().then(codeRes => {
                console.log(codeRes);
                let codeId = codeRes.data.codeId;
                let tmpCode = codeRes.data.code;

                console.log(`codeId ${codeId}`)
                let payPassword = '123456'
                let md5pwd = CryptoJS.MD5(payPassword);
                let encryptAES = EncryptUtils.encryptAES(userId + '', md5pwd);
                let md5Aes = CryptoJS.MD5(encryptAES.ciphertext);
                md5pwd = CryptoJS.enc.Hex.stringify(md5Aes);
                console.log('5011');
                userApi.getPrivateKey().then(res => {
                    let privateKey = res.data.privateKey;
                    privateKey = forge.util.decode64(privateKey);
                    privateKey = EncryptUtils.decryptAES(privateKey, md5Aes);
                    // let code = EncryptUtils.rsaDecrypt(tmpCode, privateKey);
                    tmpCode = forge.util.decode64(tmpCode);
                    let code = EncryptUtils.fromPrivateKeyData(privateKey).decrypt(tmpCode)
                    // let payPasswordMd5 = EncryptUtils.encryptAES(userId + '', md5pwd);

                    let time = getCurrentMilliSeconds()
                    let params = {
                        type: this.domain.type,
                        count: this.domain.count,
                        moneyStr: this.domain.money + '',
                        greetings: '财源滚滚，心想事成',
                        roomJid: this.domain.roomJid
                    }

                    let valStr = this.domain.type + this.domain.money + this.domain.count + this.domain.greetings + this.domain.roomJid;
                    let macVal = AppConfig.apiKey + userId + getToken() + valStr + time + md5pwd;

                    let mac = EncryptUtils.encryptByRSA(macVal, privateKey);
                    let json = JSON.parse(JSON.stringify(params));
                    json.mac = mac;
                    json.time = time;
                    let data = CryptoJS.enc.Base64.parse(EncryptUtils.encryptAES(JSON.stringify(json), code));

                    msgApi.sendRed({
                        data: data,
                        codeId: codeId
                    }).then(sendRes => {
                        if (sendRes.resultCode == 1) {
                            let data = sendRes.data;
                            let msg = WEBIM.createMessage(msgConst.red, this.domain.des, chatId);
                            //红包类型
                            msg.fileName = data.type;
                            msg.fileSize = data.status;
                            //红包ID
                            msg.objectId = data.id;
                            WEBIM.sendMessage(msg);
                        } else {
                            this.$message.error(sendRes.resultMsg);
                        }
                    });
                })
                // let command = prompt("请输入口令", "");
                // if (command) {
                //     this.domain.password  = command;
                //     this.domain.codeId  = codeId;
                //     this.domain.code  = code;
                //     let chatId = this.$root.chatId;
                //     if(chatId){
                //         if(chatUtils.isGroupId(chatId)){
                //             this.domain.roomJid = chatId;
                //         }
                //         //
                //
                //     }
                // }else{
                //     this.$message.warning('口令有误!')
                // }
            })

        },
        show() {
            this.visible = true;
        },
        close() {
            this.visible = false;
        }
    },
}
</script>
<style lang="less" scoped>
.red-types {
    margin-top: 50px;
    color: #f9c6be;
    font-weight: 200;

    .active {
        color: white;
    }
}

.red-main {
    padding: 20px 10px;

    .tip {
        text-align: center;
        font-size: 12px;
        padding: 10px;
    }

    button {
        margin-top: 20px;
        width: 100%;
        background: #FF706F;
        border-radius: 10px;
        border: 0px;
    }
}

.m-input {
    text-align: right;
}

.f-row {
    display: flex;
    flex-direction: row;
    justify-content: center
}

.f-item {
    flex: 1;
    text-align: center;
}


.container {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 350px;
    height: 90%;
    max-height: 600px;
    overflow: hidden;
    border-radius: 3px;
    background: #F2F2F2;

    .header {
        position: relative;
        background: #FF706F;

        .close {
            position: absolute;
            right: 10px;
            top: 10px;
            color: white;
            transition: all 1s;
            z-index: 1;
            font-size: 20px;
        }
    }

    .main {
        background-color: white;
        padding: 45px 16px 0;
    }

    .footer {
        display: flex;
        justify-content: center;
        align-items: center;
        border-top: 1px solid #f5eeee;

        button {
            width: 90%;
        }
    }
}

.avatar-box {
    width: 80px;
    height: 80px;
    background-color: white;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
        height: 70px;
        width: 70px;
        border-radius: 50%;
    }
}</style>
