<template>
  <div class="qr-code">
    <vue-qr :text="value"></vue-qr>
  </div>
</template>

<script>
// import QRCode from 'qrcode'
import vueQr from 'vue-qr/src/packages/vue-qr.vue'  //vue3必须这样导入

export default {
  name: 'QRCodeImage',

  props: {
    value: {
      type: String,
      default: '',
    },
  },

  components: {
    vueQr,
  },

  mounted() {
  },

}
</script>

<style scoped>
/*.qr-code canvas{*/
/*  width:300px;*/
/*  height:300px;*/
/*}*/
</style>