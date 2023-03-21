

//测试ok，直接使用str.endsWith("abc")方式调用即可
String.prototype.endsWith = function(str) {
    var reg = new RegExp(str + "$");
    return reg.test(this);
}
String.prototype.in = function(...array) {
    let isIn = false;
    if(array){
        let _this = this;
        array.forEach(function(item) {
            if(_this==item){
                isIn = true
            }
        })
    }
    return isIn;
}
String.prototype.inArray = function(array) {
    let isIn = false;
    if(array){
        let _this = this;
        array.forEach(function(item) {
            if(_this==item){
                isIn = true
            }
        })
    }
    return isIn;
}

String.prototype.charLength = function() {
    return this.replace(/[\u0391-\uFFE5]/g,"aa").length
}

//array
Array.prototype.pushAll = function(array) {
    let _this = this;
    array.forEach(function(item) {
        _this.push(item)
    })
}
Array.prototype.pushAllFilter = function(array, fieldName) {
    let _this = this;
    array.forEach(function(item) {
        let has = _this.some(function (sourceItem) {
            return sourceItem[fieldName]==item[fieldName]
        })
        if(!has){
            _this.push(item)
        }
    })
}
Array.prototype.remove = function(val) {
    let index = this.indexOf(val)
    if(index!=-1){
        this.splice(index, 1)
    }
}
Array.prototype.del = function(val) {
    this.remove(val)
}

Array.prototype.delByIndex = function(index) {
    if(index!=null && index!=-1){
        this.splice(index, 1)
    }
}

Array.prototype.delByFields = function(fields, vals) {
    let index = null;
    Array.isArray(fields) || (fields = [fields])
    Array.isArray(vals) || (vals = [vals])

    this.forEach(function (item, i) {
        let isThis = fields.every(function (field, j) {
            let val = vals[j];
            return item[field]==val;
        })
        if(isThis){
            index = i
        }
    })
    this.delByIndex(index)
}

Array.prototype.delByValues = function(vals, fieldName) {
    Array.isArray(vals) || (vals = [vals])

    let delIndexes = [];
    this.forEach(function (item, i) {
        let value = item[fieldName];
        let has = vals.some(val=>{
            if(val==value){
                return true
            }
        })
        if(has){
            delIndexes.push(i)
        }
    })
    console.log('待删除的下标：' + delIndexes);
    let that = this
    delIndexes.forEach(index=>{
        that.delByIndex(index)
    })

}
