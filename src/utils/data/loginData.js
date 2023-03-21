/**
 * 登录过的用户 账号数据
 * @type {{}}
 */
import {localCache} from "@/utils/data/localData";
import {keyConst} from "@/utils/my/const/keyConst";

export const loginCacheData = {

    addNew({account, password}){
        if(account && password) {
            if(!localCache.List.has(keyConst.loginAccounts, account, 'account')){
                localCache.List.add(keyConst.loginAccounts, {
                    account: account,
                    password: password
                })
            }
        }
    },
    delNew(account){
        localCache.List.del(keyConst.loginAccounts, account, 'account')
    },
    list(){
        return localCache.List.get(keyConst.loginAccounts)
    },

}
