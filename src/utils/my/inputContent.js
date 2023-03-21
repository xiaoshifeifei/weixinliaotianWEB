

export function InputContent(el) {

    this.el =el;

    this.cursorMovesToEnd = () => {
        let el = this.el
        el.focus();
        if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
            let range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            let sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            let textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }

    this.delLastWord = ()=>{
        let originalText = this.getHtml();
        this.setHtml(originalText.substring(0, originalText.length - 1));
        this.el.focus();
        this.cursorMovesToEnd();
    },

    this.ait = (userId, nickName)=>{
        let aits = this.getAits();
        if(aits.indexOf(userId)==-1){
            if(this.getHtml()){
                this.appendMessage(`&nbsp;<span class='ait' userId='${userId}'>@${nickName}</span>&nbsp;`);
            }else{
                this.appendMessage(`<span class='ait' userId='${userId}'>@${nickName}</span>&nbsp;`);
            }
        }
    }

    this.appendMessage = (msg) => {
        msg = msg.split('\n').join('<br/>');
        let originalText = this.getHtml();
        this.setHtml(originalText + msg);
        this.el.focus();
        this.cursorMovesToEnd();
    }

    //获取并删除@
    this.getAndDelAits = () => {
        let aitList = [];
        let aitDoms = this.el.getElementsByClassName('ait');
        if(aitDoms && aitDoms.length!=0){
            aitList = this.getAits();
            //删除
            let size = aitDoms.length;
            for (let i = 0; i < size; i++) {
                aitDoms[0].remove();
            }
        }
        return aitList;
    }

    //获取并删除@
    this.getAits = () => {
        let aitList = [];
        let aitDoms = this.el.getElementsByClassName('ait');
        if(aitDoms && aitDoms.length!=0){
            aitDoms.forEach(function (ait) {
                let userId = ait.getAttribute('userId')
                if (userId) {
                    aitList.push(userId);
                }
                if (userId == '-1') {
                    aitList = [-1];
                    return;
                }
            })
        }
        return aitList;
    }

    this.getText = () => {
        let content = this.el.innerText || this.el.textContent;
        return content.trim()
    }

    this.getHtml = ()=>{
        return this.el.innerHTML
    }

    this.setHtml = (html)=>{
        this.el.innerHTML = html
    }

}




// /**
//  * 输入框相关操作
//  * @type {Element}
//  */
//
// var inputContent = document.querySelector('#inputContent')
//
// /**
//  * 新增复制粘贴发送
//  * 云天道长
//  * addEventListener('paste', function
//  */
// inputContent.onpaste = function (event) {
//     if (event.clipboardData || event.originalEvent) {
//         //not for ie11 某些chrome版本使用的是event.originalEvent
//         var clipboardData = (event.clipboardData || event.originalEvent.clipboardData);
//         if (clipboardData.items) {
//             // for chrome
//             var items = clipboardData.items,
//                 len = items.length,
//                 file = null;
//             for (var i = 0; i < len; i++) {
//                 if (items[i].type.indexOf("image") !== -1) {
//                     file = items[i].getAsFile();
//                 }
//             }
//             if (file !== null) {
//                 //阻止默认行为即不让剪贴板内容在编辑框中显示出来
//                 event.preventDefault();
//                 var reader = new FileReader();
//                 reader.onload = function (event) {
//                     //模拟选择
//                     var base64 = event.target.result;
//                     appendMessage(`<img style="width: 100px;height: 100px;" onclick="showImage('${base64}')" src="${base64}" fileName="${file.name}"/>`);
//                 }
//                 reader.readAsDataURL(file);
//             }
//         }
//     }
// }
// );
//
// function removeCurrentAnswer(){
//     var currentAnswer = UI.getCurrentContainer().find('.current-answer');
//     if(currentAnswer.length!=0){
//         currentAnswer.remove()
//     }
// }
//
// function getAnswerMsgId(){
//     var answerDom = UI.getCurrentContainer().find('.current-answer')
//     if(answerDom && answerDom.length!=0){
//         return answerDom.attr('msgId')
//     }
// }
//
// $('#btnSend').on('click', function (e) {
//     mySend()
// })
//
// inputContent.onkeydown = function (e) {
//     e = e || window.event;
//     if (e.ctrlKey && e.keyCode == 13) {
//         var $inputContent = $(inputContent);
//         $inputContent.html($inputContent.html() + "<br/><br/>");
//         cursorMovesToEnd($inputContent.get(0));
//         return
//     }
//     if (e.keyCode === 13) {
//         event.preventDefault();
//         mySend()
//     }
//
// };
//
//
// dropFiles();
//
// function dropFiles() {
//     document.addEventListener("dragenter", function (e) {
//         e.preventDefault();
//     }, false);
//     document.addEventListener('drop', function (e) {
//         e.preventDefault()
//     }, false)
//     document.addEventListener('dragover', function (e) {
//         e.preventDefault()
//     }, false)
//     var timer = null;
//     document.ondragover = function () {
//         clearTimeout(timer);
//         timer = setTimeout(function () {
//             // oBox.style.display = 'none';
//         }, 200);
//         inputContent.style.display = 'block';
//     };
//     inputContent.addEventListener("dragenter", function (e) {
//         e.preventDefault()
//         e.stopPropagation();
//     }, false);
//     inputContent.addEventListener('dragover', function (e) {
//         e.preventDefault()
//         e.stopPropagation();
//     }, false)
//     inputContent.ondrop = function (ev) {
//         ev.preventDefault()
//         ev.stopPropagation();
//         var files = ev.dataTransfer.files;
//
//         var images = [];
//         var videos = [];
//         var _files = [];
//
//         for (let i = 0; i < files.length; i++) {
//             let file = files[i];
//             let fileName = file.name
//             let reader = new FileReader();
//             reader.onload = function (e) {
//                 let base64 = event.target.result
//                 appendMessage(`<img style="width: 100px;height: 100px;" onclick="showImage('${base64}')" src="${base64}" fileName="${fileName}"/>`);
//             };
//             reader.readAsDataURL(file);
//         }
//
//         clearTimeout(timer);
//         return false;
//     };
// }
//
//光标定位到div文本末尾处
//
//
//
// function existImg() {
//     return $("#inputContent img").length != 0
// }
//
// function sendMessage(msg, toJid) {
//     UI.sendMsg(msg, toJid);
//     setTimeout(function () {
//         emptyMessage();
//     }, 200);
// }
//
// function appendMessage(msg) {
//     var $inputContent = $(inputContent);
//     var originalText = $inputContent.html();
//     $inputContent.html(originalText + msg);
//     $inputContent.focus();
//     cursorMovesToEnd($inputContent[0]);
// }
//
// function setMessage(msg) {
//     var $inputContent = $(inputContent);
//     $inputContent.html(msg);
//     $inputContent.focus();
//     cursorMovesToEnd($inputContent[0]);
// }
//
// function emptyMessage() {
//     var $inputContent = $(inputContent);
//     $inputContent.html("");
// }
//
// function uploadImages() {
//     $("#inputContent img").each(function (index, item) {
//         var fileId = $(item).attr('id');
//         var base64 = $(item).attr('src');
//         var fileName = $(item).attr('fileName');
//
//         var imgMsg = WEBIM.createMessage(2, " ");
//         // var dataId = imgMsg.messageId;
//         var blob = dataURLtoFile(base64, fileName);
//         imgMsg.content = base64
//
//         submitImageFile(blob, imgMsg);
//
//     })
//
//     $("#inputContent img").remove();
// }
//
// function dataURLtoFile(dataurl, filename) {//将base64转换为文件
//     var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
//         bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
//     while (n--) {
//         u8arr[n] = bstr.charCodeAt(n);
//     }
//     return new File([u8arr], filename, {type: mime});
// }
//
// function dataURLtoBlob(dataurl) {
//     var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
//         bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
//     while (n--) {
//         u8arr[n] = bstr.charCodeAt(n);
//     }
//     return new Blob([u8arr], {type: mime});
// }
//
// function submitImageFile(blob, imgMsg) {
//     var formData = new FormData()
//     formData.append('file', blob)
//     $.ajax({
//         url: AppConfig.uploadUrl + '',    // 后台接口
//         // url:  'http://localhost:8888/file/ignore/upload',    // 后台接口
//         type: 'POST',
//         processData: false, // processData和contentType必须指定为false
//         contentType: false,
//         cache: false,
//         data: formData,
//         success: function (res) {
//             imgMsg.content = eval("(" + res + ")").url;
//             UI.sendMsg(imgMsg);
//             //模拟选择
//             UI.showMsg(imgMsg, 1, "newMsg");
//             DataUtils.saveMessage(imgMsg);//储存消息
//         }
//     });
// }
//
//
// function getInputContentHtml() {
//     return $(inputContent).html();
// }
//
// function setInputContentHtml(html) {
//     $(inputContent).html(html);
// }

