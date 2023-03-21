export const myUtils = {

    copy(data){
        return JSON.parse(JSON.stringify(data))
    },

    isMobile () {
        if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
            return true // 手机端
        } else {
            return false // alert('PC端')
        }
    }
}
