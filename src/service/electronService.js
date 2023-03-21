

import tryRequire from 'try-require'
import {Message} from "element-ui";



let electron = tryRequire('electron')


export const electronService = {


    getCurrent(){
        if(electron){
            return electron.remote.getCurrentWindow();
        }
    },

    closeWin(){
        if(electron){
            this.getCurrent().closeWin();
        }
    },

    hideWin(){
        if(electron){
            this.getCurrent().hide();
        }
    },

    fullWin(){
        if(electron){
            let win = this.getCurrent();
            let html = document.getElementsByTagName('html')[0]
            let max = html.getAttribute('max')
            if (!max || max == '0') {
                html.setAttribute('max', '1')
                win.maximize()
                win.setMovable(false)
            } else {
                html.setAttribute('max', '0')
                win.unmaximize()
                win.setMovable(true)
            }
        }
    },

    minWin(){
        if(electron){
            let win = this.getCurrent();
            if (win.isMinimized()) {
                win.restore()
            } else {
                win.minimize()
            }
        }
    },
    topWin(){
        if(electron){
            let win = this.getCurrent();
            if (win.isAlwaysOnTop()) {
                win.setAlwaysOnTop(false);
            } else {
                win.setAlwaysOnTop(true);
            }
        }
    },
    downAndCopy(url){
        if(electron){
            electron.ipcRenderer.send('downloadAndCopy', {url: url})
        }else{
            Message.error('不支持复制图片');
        }
    }


}
