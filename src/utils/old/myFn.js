export const myFn = {
    isNil : function(s) {
        return !s || "undefined"==s || s == "null" ||NaN==s;
    }
}
