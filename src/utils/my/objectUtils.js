export const objectUtils = {

  clone(obj) {

    return JSON.parse(JSON.stringify(obj))

  },

  isEmpty(obj) {
    return obj == null || Object.keys(obj).length === 0
  },

  allEmpty(obj) {
    return obj == null || Object.keys(obj).length === 0 || Object.keys(obj).every(function(item) {
      return !obj[item]
    })
  },

  getEmpty(domain, emptyValue) {
    emptyValue ? emptyValue : null
    let res = {}
    let names = Object.keys(domain)
    names.forEach(function(name) {
      res[name] = emptyValue
    })
    return res
  },

  copy(res, source) {
    let newObj = {}
    if (res) {
      newObj = objectUtils.clone(res)
    }

    for (let key in source) {
      let val = source[key]
      if (val!=null) {
        newObj[key] = val
      }
    }
    return newObj
  },

  /**
   * 根据路径获取值
   * @param data 原始对象
   * @param url  属性路径， 如'field.name'
   * @returns {*}
   */
  getByUrl(data, url) {
    if(url){
      try {
        return eval('data.' + url)
      }catch (e) {
        return null;
      }
    }else{
      return data;
    }
  },

  /**
   * 根据对象路径设置值
   * @param data  可为空
   * @param url   属性路径， 如'field.name'
   * @param value 末尾属性的值 如'ws'
   */
  setByUrl(data, url, value) {
    let _this = this
    if(url){
      if(!data){
        data = {};
      }
      let names = url.split('.');
      let _thisName = '';
      names.forEach(function(name, index){
        if(!_thisName){
          _thisName = name;
        }else{
          _thisName += ('.' + name)
        }
        //最后一个属性， 直接设置值
        if(index == names.length - 1){
          if(typeof(value) == 'string'){
            value = '"' + value + '"';
          }
          eval('data.' + _thisName + '=value')
        }else{
          //不是最后一个属性， 获取值， 如果为空设置为{}
          let val = _this.getByUrl(data, _thisName);
          if(!val){
            eval('data.' + _thisName + '={}')
          }
        }
      })
    }
    return data;
  }

}
