import {chatData} from "@/utils/data/chatData";
import {messageService} from "@/service/messageService";

export default {
  state: {
    // 接收者ID
    chatId: null,

    // 聊天记录
    records: [],
  },
  mutations: {
    // 更新对话
    update_current_chatId(state, chatId) {
      state.records = [];
      state.chatId = chatId;
      //发送已读
      chatData.unreadMsgIdGet(chatId).forEach(msgId=>{
        messageService.sendMessageReadReceipt(chatId, msgId);
      })
    },

    // 数组头部压入对话记录
    UNSHIFT_MSG(state, {records, push}) {
      let msgIds = state.records.map(msg=>msg.messageId);

      let obj = {};

      let peon = records.reduce((cur,next) => {
        obj[next.messageId] ? "" : obj[next.messageId] = true && cur.push(next);
      return cur;
      },[]) //增加数组去重

      let res=[];
      // records.forEach(msg=>{
      //   if(msgIds.indexOf(msg.messageId)==-1) res.push(msg);
      // })
      peon.forEach(msg=>{
        if(msgIds.indexOf(msg.messageId)==-1) res.push(msg);
      })
      if(!push)state.records.unshift(...res);
      else state.records.push(...res);
    },

    // 推送对话记录
    PUSH_MSG(state, record) {
      state.records.push(record)
    },

    // 更新对话记录
    UPDATE_DIALOGUE(state, resource) {
      Object.assign(state.records[resource.index], resource.item)
    },

    // 删除对话记录
    DELETE_DIALOGUE(state, index) {
      state.records.splice(index, 1)
    },

    del_msg(state, ids) {
      if(!Array.isArray(ids)){
        ids = [ids];
      }
      ids.forEach(msgId => {
        let index = state.records.findIndex(item => item.id == msgId)
        if (index >= 0) state.records.splice(index, 1)
      })
    },

    // 数组头部压入对话记录
    SET_MSG(state, records) {
      state.records = records
    },
  },
}
