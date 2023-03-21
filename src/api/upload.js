import { post, get, upload } from '@/utils/request'
import {AppConfig} from "@/utils/old/appconfig";
import {chatUtils} from "@/utils/my/chatUtils";
import {WEBIM} from "@/utils/old/webim";


export const fileApi = {
  // 上传头像裁剪图片服务接口
  uploadAvatar(file, chatId){
    let url = AppConfig.uploadGroupAvatarUrl
    let formData = new FormData()
    if(!chatUtils.isGroupId(chatId)){
      formData.append('userId', chatId)
      url = AppConfig.uploadAvatarUrl
    }else{
      formData.append('jid', chatId)
    }
    formData.append('file', file)
    return upload(url, formData)
  },

  amr2mp3(voiceUrl){
      let url = AppConfig.uploadUrl.substr(0, AppConfig.uploadUrl.lastIndexOf('/')) + "/amrToMp3";
      let data = WEBIM.createOpenApiSecret();
      data.paths = voiceUrl;
      return post(url, data)
  }

}

// // 上传头像裁剪图片服务接口
// export const ServeUploadFileStream = data => {
//   return post(AppConfig.uploadAvatarUrl, data)
// }

// 查询大文件拆分信息服务接口
export const ServeFindFileSplitInfo = (data = {}) => {
  return get('/api/v1/upload/get-file-split-info', data)
}

// 文件拆分上传服务接口
export const ServeFileSubareaUpload = (data = {}, options = {}) => {
  return upload('/v1/upload/file-subarea-upload', data, options)
}
