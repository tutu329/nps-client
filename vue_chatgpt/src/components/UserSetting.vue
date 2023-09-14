<template>
  <div class="user-setting">
<!--    <button @click="toggleRoleSetting" class="floating-button role-button">-->
<!--      个性-->
<!--    </button>-->
<!--    <button @click="toggleUserSetting" class="floating-button config-button">-->
<!--      角色-->
<!--    </button>-->

    <transition name="slide1">
      <div key="1" v-if="showRoleSetting" class="role-setting-window" @click.self="toggleRoleSetting" >
        <div class="content">
          <h2>角色提示</h2>
          <textarea :value="rolePrompt" @textarea="(e)=>$emit('update:rolePrompt', e.target.value)" class="textarea"/>
          <h2>角色主动发言提示</h2>
          <textarea :value="roleActivePrompt" @textarea="(e)=>$emit('update:roleActivePrompt', e.target.value)" class="textarea"/>
          <button class="clear-button" @click="clearChat">清空聊天记录</button>
        </div>
      </div>
    </transition>

    <transition name="slide2">
      <div key="2" v-if="showUserSetting" class="user-setting-window" @click.self="toggleUserSetting" >
        <div class="role-content">
          <h2>角色列表</h2>
          <ul class="role-list">
            <li v-for="(value, key) in roles" :key="key" :class="{ 'selected': selectedIndex === key }" @click="onSelected(key)" >
              {{ value.nickname }}
            </li>
          </ul>
          <div class="role-description">
            <h2>角色说明</h2>
            <p>{{ roles[selectedIndex].description }}</p>
            <button class="select-button" @click="selectRole">
              选择该角色
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    rolePrompt: {
      type: String,
      default: "",
    },
    roleActivePrompt: {
      type: String,
      default: "",
    },
    roles: Object,
    selectedRole: Object,
  },
  data() {
    return {
      showRoleSetting: false,
      showUserSetting: false,
      selectedIndex: "default_role",
    };
  },
  methods: {
    toggleRoleSetting() {
      this.showRoleSetting = !this.showRoleSetting;
      if (this.showUserSetting) this.showUserSetting = false;
    },
    toggleUserSetting() {
      this.showUserSetting = !this.showUserSetting;
      if (this.showRoleSetting) this.showRoleSetting = false;
    },
    clearChat() {
      // 清空聊天记录的逻辑
    },
    onSelected(key) {
      // 选择角色的逻辑
      this.selectedIndex = key
    },
  },
};
</script>

<style scoped>
/* 在这里添加CSS样式 */
.user-setting {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 100;
}

.floating-button {
  color: #ffffff;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.3);
  font-size: 16px;
  padding: 12px 20px;
  margin-right: 10px;
  cursor: pointer;

  background-color: #aaaaaa;
  font-size:10px;
  border-radius: 5%;
  border-style: solid;
  border:0px;
  padding: 4px;

  /*display: inline-block;*/
  /*position: absolute;*/
  right:20px;
  bottom:50px;
}

.slide1-enter-active,
.slide1-leave-active {
  transition: all 0.3s;
}

.slide1-enter-from,
.slide1-leave-to {
  transform: translateX(-100%);
}

.slide2-enter-active,
.slide2-leave-active {
  transition: all 0.3s;
}

.slide2-enter-from,
.slide2-leave-to {
  transform: translateX(-100%);
}

.role-setting-window {
  position: fixed;
  top: 10%;
  left: 30%;
  width:300px;
  height:500px;
  /*transform: translate(-50%, -50%);*/
  /*width: 80%;*/
  /*height: 80%;*/
  background-color: #2c2c2c;
  border-radius: 10px;
  z-index: 200;
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
}
.user-setting-window {
  position: fixed;
  top: 10%;
  left: 30%;
  width:300px;
  height:500px;

  /*transform: translate(-50%, -50%);*/
  /*width: 80%;*/
  /*height: 80%;*/
  background-color: #2c2c2c;
  border-radius: 10px;
  z-index: 200;
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
}

.role-content {
  height: 100%;
  display: flex;
  flex-direction: column;

  font-size:12px;
}

h2 {
  margin: 10px 0;
  color: #ffffff;
  font-size:12px;
}

.textarea {
  width: 80%;
  height: 40%;
  margin-bottom: 10px;
  background-color: #444;
  color: #ffffff;
  font-size: 16px;
  border-radius: 5px;
  border: none;
  resize: none;
  padding: 10px;

  font-size:12px;
  line-height: 1.5;
  text-indent: 2ch;
}

.clear-button {
  display: inline-block;
  background-color: #f44336;
  color: #ffffff;
  border-radius: 5px;
  font-size: 16px;
  padding: 10px 20px;
  cursor: pointer;
  margin-top: 10px;

  font-size:12px;
}

.role-list {
  width: 100px;
  font-size: 16px;
  list-style: none;
  padding: 0;
  margin: 0;

  font-size:12px;
  /*opacity: 0;*/
  color:#ffffff;
}

.role-list li {
  padding: 5px;
  cursor: pointer;
  background-color: #3f51b5;
  color: #ffffff;
  border-radius: 5px;
  margin-bottom: 5px;
}

.role-list .selected {
  background-color: #1e88e5;
}

.role-description {
  flex-grow: 1;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
}

.role-description p {
  color: #ffffff;
  flex-grow: 1;
}

.select-button {
  display: inline-block;
  background-color: #4caf50;
  color: #ffffff;
  border-radius: 5px;
  font-size: 16px;
  padding: 10px 20px;
  cursor: pointer;
  margin-top: 10px;

  font-size: 12px;
}

</style>
