/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/light");

var $root = ($protobuf.roots["default"] || ($protobuf.roots["default"] = new $protobuf.Root()))
.addJSON({
  Message: {
    nested: {
      MessageHead: {
        fields: {
          from: {
            type: "string",
            id: 1
          },
          to: {
            type: "string",
            id: 2
          },
          messageId: {
            type: "string",
            id: 3
          },
          chatType: {
            type: "int32",
            id: 4
          },
          offline: {
            type: "bool",
            id: 5
          }
        }
      },
      ChatMessage: {
        fields: {
          messageHead: {
            type: "MessageHead",
            id: 1
          },
          fromUserId: {
            type: "string",
            id: 2
          },
          fromUserName: {
            type: "string",
            id: 3
          },
          toUserId: {
            type: "string",
            id: 4
          },
          toUserName: {
            type: "string",
            id: 5
          },
          timeSend: {
            type: "int64",
            id: 6
          },
          type: {
            type: "int32",
            id: 7
          },
          content: {
            type: "string",
            id: 8
          },
          objectId: {
            type: "string",
            id: 9
          },
          fileName: {
            type: "string",
            id: 10
          },
          isEncrypt: {
            type: "bool",
            id: 11
          },
          deleteTime: {
            type: "int64",
            id: 12
          },
          isReadDel: {
            type: "bool",
            id: 13
          },
          fileSize: {
            type: "int64",
            id: 14
          },
          fileTime: {
            type: "int64",
            id: 15
          },
          locationX: {
            type: "double",
            id: 16
          },
          locationY: {
            type: "double",
            id: 17
          }
        }
      },
      AuthMessage: {
        fields: {
          messageHead: {
            type: "MessageHead",
            id: 1
          },
          token: {
            type: "string",
            id: 2
          },
          password: {
            type: "string",
            id: 3
          },
          deviceId: {
            type: "string",
            id: 4
          }
        }
      },
      AuthRespMessageProBuf: {
        fields: {
          messageHead: {
            type: "MessageHead",
            id: 1
          },
          status: {
            type: "int32",
            id: 2
          },
          arg: {
            type: "string",
            id: 3
          },
          token: {
            type: "string",
            id: 4
          },
          resources: {
            type: "string",
            id: 5
          }
        }
      },
      MessageReceiptStatusProBuf: {
        fields: {
          messageHead: {
            type: "MessageHead",
            id: 1
          },
          status: {
            type: "int32",
            id: 2
          },
          messageId: {
            type: "string",
            id: 3
          }
        }
      },
      JoinGroupMessageProBuf: {
        fields: {
          messageHead: {
            type: "MessageHead",
            id: 1
          },
          jid: {
            type: "string",
            id: 2
          },
          seconds: {
            type: "int64",
            id: 3
          }
        }
      },
      ExitGroupMessageProBuf: {
        fields: {
          messageHead: {
            type: "MessageHead",
            id: 1
          },
          jid: {
            type: "string",
            id: 2
          }
        }
      },
      GroupMessageRespProBuf: {
        fields: {
          messageHead: {
            type: "MessageHead",
            id: 1
          },
          jid: {
            type: "string",
            id: 2
          },
          status: {
            type: "int32",
            id: 3
          },
          isExit: {
            type: "bool",
            id: 4
          }
        }
      },
      PullMessageHistoryRecordReqProBuf: {
        fields: {
          messageHead: {
            type: "MessageHead",
            id: 1
          },
          jid: {
            type: "string",
            id: 2
          },
          size: {
            type: "int32",
            id: 3
          },
          startTime: {
            type: "int64",
            id: 4
          },
          endTime: {
            type: "int64",
            id: 5
          }
        }
      },
      PullMessageHistoryRecordRespProBuf: {
        fields: {
          messageId: {
            type: "string",
            id: 1
          },
          jid: {
            type: "string",
            id: 2
          },
          chatType: {
            type: "int32",
            id: 3
          },
          messageList: {
            rule: "repeated",
            type: "ChatMessage",
            id: 4
          },
          count: {
            type: "int32",
            id: 5
          }
        }
      },
      PullBatchGroupMessageReqProBuf: {
        fields: {
          messageHead: {
            type: "MessageHead",
            id: 1
          },
          jidList: {
            rule: "repeated",
            type: "string",
            id: 2
          },
          endTime: {
            type: "int64",
            id: 3
          }
        }
      },
      PullGroupMessageRespProBuf: {
        fields: {
          messageId: {
            type: "string",
            id: 1
          },
          jid: {
            type: "string",
            id: 2
          },
          count: {
            type: "int64",
            id: 3
          },
          messageList: {
            rule: "repeated",
            type: "ChatMessage",
            id: 4
          }
        }
      },
      PingMessageProBuf: {
        fields: {
          messageHead: {
            type: "MessageHead",
            id: 1
          }
        }
      },
      CommonSuccessProBuf: {
        fields: {
          messageHead: {
            type: "MessageHead",
            id: 1
          }
        }
      },
      CommonErrorProBuf: {
        fields: {
          messageHead: {
            type: "MessageHead",
            id: 1
          },
          code: {
            type: "int32",
            id: 2
          },
          arg: {
            type: "string",
            id: 3
          }
        }
      }
    }
  }
});

module.exports = $root;
