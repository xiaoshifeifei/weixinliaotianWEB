import { post, get} from '@/utils/request'
import {chatUtils} from "@/utils/my/chatUtils";
import {AppConfig} from "@/utils/old/appconfig";
import store from '@/store'

export const commonTextApi = {

  add(content){
    return post('/api/CustomerService/commonText/add', {
      companyId : "0",
      content : content,
      userId : store.state.user.userId
    })
  },

  del(id){
    return post('/api/CustomerService/commonText/delete', {
      companyId : AppConfig.companyId,
      commonTextId : id,
      userId : store.state.user.userId
    })
  },

  //result.data
  page(page){
    return get('/api/CustomerService/commonText/getByUserId', {
      companyId : AppConfig.companyId,
      pageIndex : page,
      pageSize : 15
    })
  },

}

