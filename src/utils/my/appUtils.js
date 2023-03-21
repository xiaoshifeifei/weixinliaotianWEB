import {AppConfig} from "@/utils/old/appconfig";

export const appUtils = {

    //
    getEnv(){
        let env = process.env.VUE_APP_ENV;
        return env?env:'web';
    },
    isPc(){
        return this.getEnv()=='pc';
    },
    isDev(){
        return process.env.NODE_ENV=='development';
    },
    getApiUrl(url){
        //如果是electron
        if(this.isPc() && process.env.NODE_ENV != 'development'){
            url = url.replace('/api/', '')
            url = AppConfig.apiUrl + url
        }
        //如果是web
        else{
            // //如果不是开发环境， 则使用动态地址
            // if(!this.isDev()){
            //     url = AppConfig.apiUrl + url
            // }
        }
        return url;
    },
    getFileUrl(url){
        //如果是electron
        if(this.isPc()){
            url = url.replace('/file/', '')
            url = AppConfig.uploadServer + url
        }
        //如果是web
        else{
            // //如果不是开发环境， 则使用动态地址
            // if(!this.isDev()){
            //     url = AppConfig.uploadServer + url
            // }
        }
        return url;
    },


}
