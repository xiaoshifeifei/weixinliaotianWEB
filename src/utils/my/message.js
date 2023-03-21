/**
 * 消息发送
 * @type {{}}
 */

import {chatUtils} from "@/utils/my/chatUtils";

export const messageUtils = {

    // scrollInfo:{
    //     direction: null,
    //     maximum: null,
    //     position: null
    // },
    //
    // //处理发送消息
    // processSendMsg: function (msg, toJid) {
    //     //先发送图片
    //     uploadImages();
    //     let isGroup = WEBIM.isGroup(ConversationManager.fromUserId)
    //     if (isGroup) {
    //         let ait = getAit()
    //         if (ait) {
    //             if (ait == '-1') {
    //                 ait = ConversationManager.fromUserId
    //             }
    //             msg.objectId = ait;
    //         }
    //     }
    //     //内容为空不再继续， 空消息bug
    //     //文本消息为空则不发生， 其他类型消息为空不发生bug
    //     let content = msg.content;
    //     if (!content && msg.type == 1) {
    //         return;
    //     }
    //
    //     console.log('send messaeg')
    //     ConversationManager.sendMsg(msg, function () {
    //         //接受方 为当前打开界面目标用户 才添加消息到界面
    //         if (ConversationManager.from == msg.toJid) {
    //             msg.content = content;
    //             //单聊
    //             if (chatUtils.isChat(msg)) {
    //                 emptyMessage()
    //             }
    //             //其他设备的处理 store.state.user.userId == msg.toUserId
    //             if (chatUtils.isChat(msg) && chatUtils.isReceive(msg) && 1 == myData.multipleDevices) {
    //                 DeviceManager.processShowMessage(msg, 1, 0);
    //             } else {
    //                 if (!(msg.type == 2 || msg.type == 9) || ((msg.type == 2 || msg.type == 9) && 1 == msg.forward)) {
    //                     //图片type=2、文件 type=9 消息上传前已做了UI预加载，这里不再次显示UI
    //                     //转发的图片需要显示
    //                     UI.showMsg(msg);
    //                 }
    //                 let isGroup = WEBIM.isGroupChat(ConversationManager.chatType) ? 1 : 0;
    //                 if (toJid) {
    //                     isGroup = WEBIM.isGroup(WEBIM.getUserIdFromJid(toJid)) ? 1 : 0;
    //                 }
    //
    //                 msg.isGroup = isGroup;
    //
    //                 //消息， 非被动通知
    //                 if (300 > msg.type)
    //                     UI.moveFriendToTop(msg, msg.toUserId, null, 0);
    //             }
    //         }
    //
    //     }, toJid);
    //     //清空输入框
    //     emptyMessage();
    // },
    //
    // //历史消息处理
    // handlerHistoryMessageResult:function(result){
    //     let msgList = result.messageList;
    //     messageUi.historyMessage(result.jid, msgList)
    // },
    //
    // sendImg: function () {
    //     let imgUrl = $("#myFileUrl").val();
    //     let arr = new Array();
    //     arr = imgUrl.split(",");
    //     for (let i = 0; i < arr.length; i++) {
    //         let msg = WEBIM.createMessage(2, arr[i]);
    //         UI.sendMsg(msg);
    //     }
    // },
    //
    // sendFile: function () {
    //     let content = $("#myFileUrl").val();
    //     let arr = new Array();
    //     arr = content.split(",");
    //     let arr2 = new Array();
    //     arr2 = $("#filePath").val().split(",");
    //     for (let i = 0; i < arr.length; i++) {
    //         let msg = WEBIM.createMessage(9, arr[i]);
    //         msg.fileName = arr2[i];
    //         msg.fileSize = $("#filePath").attr("size");
    //         UI.sendMsg(msg);
    //     }
    // },
    //
    // sendGif: function (gifName) {
    //     $("#emojl-panel #gifList").getNiceScroll().hide(); //隐藏滚动条
    //     $("#emojl-panel").hide();//隐藏表情面板
    //     let msg = WEBIM.createMessage(5, gifName);
    //     UI.sendMsg(msg);
    // },
    //
    // //设置管理头像， 初始未加载消息
    // setMessageItemIdIcon(chatId) {
    //
    // },
    //
    // pullHistoryMessage : function() {
    //     let jid=ConversationManager.from;
    //     //第一条消息的时间：即为结束时间
    //     let firstDom = $('#'+UI.getCurrentContainerId()+' .msgDiv:eq(0)')
    //     let endTime = 0
    //     if(firstDom){
    //         endTime = firstDom.attr('time')
    //     }
    //
    //     console.log('结束时间：' + endTime)
    //     WEBIM.pullHistoryMessage(ConversationManager.chatType, jid, 20, 0, Number(endTime));
    // },
    //
    // //拉取最新消息，
    // pullNewMessages : function(chatId) {
    //     if(!chatId){
    //         chatId = ConversationManager.fromUserId
    //     }
    //
    //     let isGroup = WEBIM.isGroup(chatId)
    //     // let jid=ConversationManager.from;
    //     // //第一条消息的时间：即为结束时间
    //     console.log('拉去数据：' + chatId)
    //     WEBIM.pullHistoryMessage(isGroup ? 2 : 1, chatId, 20, 0, 0);
    // },
    //
    // pullAfterOffline(){
    //     let currentChatId = ConversationManager.fromUserId
    //     //清空dom节点, 除当前节点为全部清除，重新加载当前节点
    //     let lastDom = $('#messageContainer_' + currentChatId + '>div:last');
    //     let startTime = 0
    //     if(lastDom){
    //         startTime = lastDom.attr('time')
    //     }
    //     mySdk.getHistoryMessageList(0, startTime, 0, function (code, data) {
    //         if(data && data.length!=0){
    //             data.pop()
    //             let list = [];
    //             data.forEach(function (item) {
    //                 let msg = JSON.parse(item.message)
    //                 list.push(SKIMSDK.convertToClientMsg(msg));
    //             })
    //             messageUi.historyMessage(currentChatId, list, true)
    //         }
    //     })
    //
    // },
    //
    // refreshMessage(){
    //     let container = UI.getCurrentContainer();
    //     if(container && container.length!=0){
    //         container.html('');
    //         messageUi.showLoadHistoryIcon(2 )
    //         messages.pullNewMessages();
    //     }
    // },
    //
    // setMessageRead(chatId, msgId){
    //     let isGroup = chatUtils.current.isGroup()
    //     let msg = DBUtils.getMessage(msgId)
    //     if(msg){
    //         let isSelf = chatUtils.isSelf(msg)
    //         let noRead = (1!=msg.isRead)
    //         //单聊， 未读， 接受的消息
    //         if(!isGroup && noRead && !isSelf){//单聊
    //             //是阅后即焚
    //             if(!myFn.isReadDelMsg(msg))
    //                 ConversationManager.sendReadReceipt(chatId, msg.messageId);
    //             //
    //             else if(1!=msg.type && 2!=msg.type && 3!==msg.type && 6!==msg.type)
    //                 ConversationManager.sendReadReceipt(chatId, msg.messageId); //发送已读回执
    //         }
    //         //群聊， 未读
    //         else if(isGroup && noRead){ //群聊
    //             // 发送已读回执到群内
    //             if(!isSelf && 100>msg.type){
    //                 // 判断是否开启了显示群组消息已读人数  若为@消息强制发送
    //                 if(myData.isShowGroupMsgReadNum){
    //                     GroupManager.sendRead(msg.messageId); //调用方法发送已读回执
    //                 }
    //             }
    //         }
    //     }
    // },
    //是否是@我的消息
    //'all': 为@所有人
    isAitMe(msg){
        let isGroup = chatUtils.isGroup(msg)
        let isSelf = chatUtils.isSelf(msg)
        let chatId = chatUtils.getChatId(msg)

        let isAit = null
        if(msg.objectId && msg.type=='1' && isGroup && !isSelf){
            isAit = msg.objectId==chatId
            if(!isAit){
                let aitIds = msg.objectId.split(',')
                isAit = (aitIds.indexOf('-1')!=-1)
                if(!isAit){
                    isAit = (aitIds.indexOf(store.state.user.userId)!=-1)
                    if(isAit) return 'me'
                }else{
                    return 'all'
                }
            }else{
                return 'all'
            }
        }
        return isAit;
    },

    // onScroll({position, maximum}){
    //     UI.getCurrentContainer().find('.ait-unread').each(function(index, item){
    //         let top = $(item).parents('.msgDiv')[0].offsetTop
    //         if(top >=position){
    //             $(item).removeClass('ait-unread')
    //             messages.jumpAit()
    //         }
    //     })
    // },
    //
    // //调到最近的一条@消息
    // jumpAit(){
    //     let chatId = ConversationManager.fromUserId
    //     let message = DBUtils.getAndDelAit(chatId);
    //     if(message){
    //         let msgId = message.messageId
    //         let originalDom = UI.getCurrentContainer().find('#msg_'+ msgId )
    //         if(originalDom && originalDom.length!=0){
    //             let top = originalDom[0].offsetTop
    //             $("#messagePanel").nanoScroller({scrollTop: top});
    //         }else{
    //             layui.layer.msg('当前没有找到此@消息，请翻页查找..');
    //         }
    //         //计算、显隐可@数
    //         let text = $('#msgContainers .ait-count').text()
    //         if(text){
    //             let count = parseInt(text)
    //             if(count<=1){
    //                 this.hideAit()
    //             }else{
    //                 let aits = DBUtils.getAit(chatId)
    //                 if(aits && aits.length!=0){
    //                     $('#tit_groups_ait_' + chatId).text(aits[aits.length-1].content)
    //                 }
    //                 $('#msgContainers .ait-count').text(count-1)
    //             }
    //         }else{
    //             this.hideAit()
    //         }
    //     }
    // },
    // //隐藏@后， 列表最后消息显示原消息， 样式还原
    // hideAit(){
    //     let chatId = ConversationManager.fromUserId
    //     $('#msgContainers .aits').hide()
    //     $('#tit_groups_ait_' + chatId).hide()
    // },
    //
    // nextAit(message){
    //
    // },

}
