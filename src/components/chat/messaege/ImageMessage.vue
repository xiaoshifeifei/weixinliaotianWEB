<template>
  <div class="image-message no-select">
    <el-image
      fit="cover"
      :src="url"
      :lazy="true"
      :style="getImgStyle(src)"
      :preview-src-list="[src]"
    >
      <div slot="error" @click="reloadImg" class="image-slot">图片加载失败...</div>
      <div slot="placeholder" class="image-slot">图片加载中...</div>
    </el-image>
  </div>
</template>
<script>
import { imgZoom } from '@/utils/functions'
export default {
  name: 'ImageMessage',
  props: {
    src: {
      type: String,
      default: '',
    },
  },
  data(){
    return {
      times: 0,
    }
  },
  computed:{
    url(){
      return this.src + '?time=' + this.times;
    }
  },
  methods: {
    getImgStyle(url) {
      return imgZoom(url, 200)
    },
    reloadImg(){
      this.times++;
    },
  },
}
</script>
<style lang="less" scoped>
.image-message {
  /deep/.el-image {
    border-radius: 5px;
    cursor: pointer;
    background: #f1efef;

    .image-slot {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      font-size: 13px;
      color: #908686;
      background: #efeaea;
    }
  }
}
</style>
