<template>
  <div class="video-message">
    <div class="content">
      <video controls>
        <source :src="src">
      </video>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoMessage',
  components: {},
  data() {
    return {}
  },
  props:{
    src:{
      type: String
    }
  },
  methods: {},
  created() {},
}
</script>
<style lang="less" scoped>
  .content video {
    width: 200px;
    height: auto;
    object-fit: fill;
  }
</style>
