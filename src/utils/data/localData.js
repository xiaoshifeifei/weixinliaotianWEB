import { objectUtils } from '@/utils/my/objectUtils'
import store from '@/store'
import {AppConfig} from "@/utils/old/appconfig";

function getKey(key) {
  let account = store.state.user.account;
  let pre = location.host
  // let pre = AppConfig.apiUrl
  return pre + '_' + account + '_' + key;
}


export const localCache = {

  List:{
    add(key, val){
      let list = localCache.getObj(key);
      if(!list){
        list = []
      }
      list.push(val);
      localCache.saveObj(key, list)
      // console.log('list 添加:' + JSON.stringify(list))
    },

    del(key, val, idName){
      let list = localCache.getObj(key);
      if(list){
        if(idName){
          list.delByFields(idName, val)
        }else{
          list.remove(val)
        }
        localCache.saveObj(key, list)
        console.log('list 删除:' + JSON.stringify(list))
      }
    },

    get(key, value, name){
      let list = localCache.getObj(key);
      if(list){
        if(value){
          list.forEach(function (item) {
            if(name){
              if(item[name] == value){
                console.log('list 获取：' + value)
                return item;
              }
            }else{
              if(value == item){
                return item
              }
            }
          })
        }else{
          return list;
        }
      }else{
        return [];
      }
    },

    has(key, value, name){
      let list = localCache.getObj(key);
      if(list){
        return list.some(function (item) {
          if(name){
            if(item[name] == value){
              console.log('list 获取：' + value)
              return true;
            }
          }else{
            if(value == item){
              return true
            }
          }
        })
      }
      return false;
    }

  },

  saveObj: function(key, value) {
    localStorage.setItem(getKey(key), JSON.stringify(value))
  },

  getObj: function(key) {
    key = getKey(key);
    console.error(key)
    let res = localStorage.getItem(key);
    if (res == null) {
      return null
    }
    return JSON.parse(res)
  },

  getByUrl(url){
    if(url){
      let items = url.split('.');
      let key = items[0];
      let data = this.getObj(key);
      url = items.slice(1).join('.');
      return objectUtils.getByUrl(data, url)
    }
  },

  setByUrl(url, value){
    let _this = this;
    if(url){
      let items = url.split('.');
      let key = items[0];
      let data = this.getObj(key);
      if(!data){
        data = {}
      }
      url = items.slice(1).join('.');
      objectUtils.setByUrl(data, url, value)

      this.saveObj(key, data)
    }
  },

  remove: function(key) {
    localStorage.removeItem(getKey(key))
  },
  set(key, val){
    localStorage.setItem(getKey(key), val)
  },
  get(key){
    return localStorage.getItem(getKey(key))
  }


}
