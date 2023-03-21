import Vue from 'vue'

export const busService = {

  bus: new Vue(),

  emit(event, data){
    this.bus.$emit(event, data);
  },

  on(event, callback){
    this.bus.$on(event, callback);
  }

}
