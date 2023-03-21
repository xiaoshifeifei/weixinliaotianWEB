export const command = {
    /*握手请求，含http的websocket握手请求*/
    COMMAND_HANDSHAKE_REQ: 1,
    /*握手响应，含http的websocket握手响应*/
    COMMAND_HANDSHAKE_RESP: 2,
    /*登录消息请求*/
    COMMAND_AUTH_REQ: 5,
    /*登录消息结果*/
    COMMAND_AUTH_RESP: 6,
    /*关闭请求*/
    COMMAND_CLOSE: 7,
    /*聊天请求*/
    COMMAND_CHAT: 10,
    /*消息回执*/
    MESSAGE_RECEIPT: 11,
    /*拉取 聊天历史记录 */
    PULL_MESSAGE_RECORD_REQ: 12,
    /*拉取 聊天历史记录 结果*/
    PULL_MESSAGE_RECORD_RESP: 13,
    /*批量拉取群组消息数量  请求*/
    PULL_BATCH_GROUP_MESSAGE_REQ: 14,
    /*批量拉取群组消息数量  结果*/
    PULL_BATCH_GROUP_MESSAGE_RESP: 15,
    /*失败错误*/
    ERROR: -1,
    /*登陆 被挤下线*/
    Login_Conflict: -3,
    /*加入群组*/
    JOINGROUP_REQ: 20,
    /*退出群组*/
    EXITGROUP_REQ: 21,
    /*群组请求结果协议*/
    GROUP_REQUEST_RESULT: 22,
    /*心跳消息*/
    Ping_REQ: 99,
    /*成功请求*/
    SUCCESS: 100,
}
