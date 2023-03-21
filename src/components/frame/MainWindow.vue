<template>
    <main-frame>
      <mainHead slot="header"></mainHead>
      <!--<mainFooter slot="footer"></mainFooter>-->
    </main-frame>
</template>
<script>
import MainFrame from '@/components/frame/MainFrame.vue'
import mainHead from '@/components/frame/MainHead.vue'
export default {
  name: 'MainWindow',
  components: { MainFrame, mainHead}
}
</script>
<style>

.iconfont{
  cursor: pointer;
}
</style>
