<template>
  <div class="floating-buttons">
    <button v-for="button in buttons" :key="button.label" @click="handleClickButton(button.text)">
      {{ button.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'FloatingButtons',
  props: {
    buttons: {
      type: Array,
      required: true
    }
  },
  methods: {
    handleClickButton(text) {
      this.$emit('clickButton', text)
    }
  }
}
</script>

<style scoped>
.floating-buttons {
  position: fixed;
  bottom: 100px;
  /*top: 80%;*/
  left: 60px;

  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;

  z-index: 901;
}

.floating-buttons button {
  margin: 3px;
  padding: 2px;
  background-color: #eeeeee;
  color: #000000;
  border: none;
  border-radius: 5px;
  font-size: 12px;
  cursor: pointer;
}

.floating-buttons button:hover {
  background-color: #cecece;
}
</style>