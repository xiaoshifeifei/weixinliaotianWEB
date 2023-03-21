/**
 * 公共方法
 *
 * @type {number[]}
 */
let ivKey=[1,2,3,4,5,6,7,8];
let charArray = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
function getStrFromBytes (arr) {
    let r = "";
    for(let i=0;i<arr.length;i++){
        r += String.fromCharCode(arr[i]);
    }
    //console.log(r);
    return r;
}
let iv=getStrFromBytes(ivKey);

export function getCurrentSeconds(){
    return Math.round(new Date().getTime() / 1000);
}

export function getCurrentMilliSeconds(){
    return Math.round(new Date().getTime());
}

// 时间统一函数
//type  1 上午10:00  否则 10:00
export function getTimeText(argument, type, isSecond) {
    if(0==argument)
        return "";
    argument=new Number(argument);
    let timeDesc="";
    let timeSend =0;

    if(1==isSecond){
        timeSend=new Date(argument*1000);
    }else{
        timeSend=new Date(argument);
    }
    let nowTime=new Date();
    let delaySeconds=((nowTime.getTime())-timeSend.getTime())/1000;
    if(delaySeconds<65){
        if(type){
            timeDesc="刚刚";
        }else{
            timeDesc=timeSend.format("hh:mm");
        }
    }else if(delaySeconds<60*30){
        if(type){
            timeDesc=parseInt(delaySeconds/60)+" 分钟前";
        }else{
            timeDesc=timeSend.format("hh:mm");
        }
    }else if(delaySeconds<60*60*24){
        if(nowTime.getDay()-timeSend.getDay()==0){
            //今天
            if(type){
                timeDesc=(timeSend.getHours()<13 ? "上午":"下午")+timeSend.format("hh:mm");
            }else{
                timeDesc=timeSend.format("hh:mm");
            }
        }else{
            //昨天
            timeDesc="昨天"+timeSend.format("hh:mm");
            // if(type){
            // 	timeDesc=(timeSend.getHours()<13 ? "昨天上午":"昨天下午")+timeSend.format("hh:mm");
            // }else{
            // 	 timeDesc="昨天"+timeSend.format("hh:mm");
            // }
        }
    }else{
        if(type){
            timeDesc=timeSend.format("MM-dd hh:mm");
        }else{
            timeDesc=timeSend.format("MM-dd hh:mm");
        }
    }

    return timeDesc;
}

export function isContains(str, substr) {
    return str.indexOf(substr) >= 0;
}
export function isNil(s) {
    let isNull = undefined == s || null == s || NaN==s
    if(isNull) return true;
    s = s+''
    return s.trim() == "" || s.trim() == "null" || "undefined" == s.trim();
}
export function notNull(s) {
    return !this.isNil(s);
}
//截取指定长度的字符串 text:文本  length ：长度
export function getText(text,length){
    if(isNil(text))
        return  " ";
    text = text.replace(/<br\/>/g, '');
    if(!length)
        length=15;
    if (text.length<=length)
        return text;
    text = text.substring(0,length)+"...";
    return text;

}
export function randomId() {
    let chars = charArray, uuid = new Array(36), rnd = 0, r;
    for (let i = 0; i < 36; i++) {
        if (i == 8 || i == 13 || i == 18 || i == 23) {
            uuid[i] = '-';
        } else if (i == 14) {
            uuid[i] = '4';
        } else {
            if (rnd <= 0x02)
                rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
            r = rnd & 0xf;
            rnd = rnd >> 4;
            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
    }
    return uuid.join('').replace(/-/gm, '').toLowerCase();
}


export function sleep(numberMillis) {
    let now = new Date();
    let exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}


