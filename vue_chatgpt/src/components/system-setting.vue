<template>
  <div class="system-setting-window" @click="handleOutsideClick">

    <div class="user_info_container">
      <h2 class="user_id">参数设置</h2>
<!--      <h2 class="user_id">{{ user.user_id }}</h2>-->
      <h3 class="title">用户设置</h3>
      <div class="user-container">
        <img :src="userAvatar" class="avatar-image">
        <div class="user-info">
          <div class="line">
            <label>UID ：</label>
            <h3 class="long-title">{{ user_id }}</h3>
          </div>
          <div class="line">
            <label>昵称：</label>
            <input v-model="nick_name" @change="handle_nickname_change">
<!--            <h3 class="title">普通用户</h3>-->
          </div>
          <div class="line">
            <label>性别：</label>
            <input type="range" min="0" max="1" step="1" :value="gender=='男'?1:0" @change="handle_gender_change">
            <h3 class="title">{{ gender }}</h3>
          </div>
        </div>
      </div>
<!--      <p class="description">{{ user.gender }}</p>-->
    </div>
    <div class="blank"></div>

    <div class="vip_containter" @click="handleOutsideClick">
      <h3 class="title">调用权限与VIP购买</h3>
      <div class="user-container">
        <table>
          <tr>
            <td> </td><td>GPT3.5</td><td>GPT4.0</td><td>费用(元)</td><td>备注</td><td> </td>
          </tr>
          <tr>
            <td>免费用户</td><td>5次/日</td><td>0次/日</td><td> </td><td>永久</td><td> </td>
          </tr>
          <tr>
            <td>试用用户</td><td>10次/日</td><td>1次/日</td><td> </td><td>3日</td><td> </td>
          </tr>
          <tr>
            <td>月度用户</td><td>20次/日</td><td>3次/日</td><td>30</td><td>30日</td><td><button class="buy-button" v-bind:disabled="buying" @click="handle_click('vip_monthly')">购买</button></td>
          </tr>
          <tr>
            <td>季度用户</td><td>25次/日</td><td>3次/日</td><td>88</td><td>90日</td><td><button class="buy-button" v-bind:disabled="buying" @click="handle_click('vip_quarterly')">购买</button></td>
          </tr>
          <tr>
            <td>年度用户</td><td>25次/日</td><td>5次/日</td><td>288</td><td>365日</td><td><button class="buy-button" v-bind:disabled="buying" @click="handle_click('vip_annual')">购买</button></td>
          </tr>
          <tr>
            <td>永久用户</td><td>30次/日</td><td>10次/日</td><td>1288</td><td>永久</td><td><button class="buy-button" v-bind:disabled="buying" @click="handle_click('vip_permanent')">购买</button></td>
          </tr>
          <tr>
            <td>次数购买1</td><td>30次</td><td> </td><td>5</td><td>带记忆</td><td><button class="buy-button" v-bind:disabled="buying" @click="handle_click('buy_invokes_1', true)">购买</button></td>
          </tr>
          <tr>
            <td>次数购买2</td><td> </td><td>10次</td><td>5</td><td>带记忆</td><td><button class="buy-button" v-bind:disabled="buying" @click="handle_click('buy_invokes_2', true)">购买</button></td>
          </tr>
          <tr>
            <td>次数购买3</td><td> </td><td>20次</td><td>10</td><td>带记忆</td><td><button class="buy-button" v-bind:disabled="buying" @click="handle_click('buy_invokes_3', true)">购买</button></td>
          </tr>
        </table>
      </div>
    </div>
    <div class="blank"></div>

    <div class="vip_containter" @click="handleOutsideClick">
      <h3 class="title">角色使用权限</h3>
      <div class="user-container">
        <table>
          <tr>
            <td> </td><td>程序</td><td>翻译</td><td>图文</td><td>图表</td><td>API</td>
          </tr>
          <tr>
            <td>免费用户</td><td>❎</td><td>❎</td><td>❎</td><td>❎</td><td>❎</td>
          </tr>
          <tr>
            <td>试用用户</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td>
          </tr>
          <tr>
            <td>月度用户</td><td>✅</td><td>✅</td><td>✅</td><td>❎</td><td>❎</td>
          </tr>
          <tr>
            <td>季度用户</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>❎</td>
          </tr>
          <tr>
            <td>年度用户</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td>
          </tr>
          <tr>
            <td>永久用户</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td>
          </tr>
        </table>
      </div>
    </div>
    <div class="blank"></div>

    <div class="openai_cost_containter" @click="handleOutsideClick">
      <h3 class="title">openAI定价与不控量每日成本估算</h3>
      <div class="user-container">
        <table>
          <tr>
            <td>模型</td><td>价格($)</td><td>价格(￥)</td><td>每日成本(￥)</td>
          </tr>
          <tr>
            <td>GPT4 08K context prompt</td><td>0.030 / 1K tokens</td><td>0.207</td><td>79</td>
          </tr>

          <tr>
            <td>GPT4 08K context completion</td><td>0.060 / 1K tokens</td><td>0.413</td><td>158</td>
          </tr>
          <tr>
            <td>GPT4 32K context prompt</td><td>0.060 / 1K tokens</td><td>0.413</td><td>158</td>
          </tr>
          <tr>
            <td>gpt-3.5-turbo</td><td>0.002 / 1K tokens</td><td>0.014</td><td>5</td>
          </tr>
          <tr>
            <td>DALL·E 1024×1024</td><td>0.020 / image</td><td>0.138</td><td>14</td>
          </tr>
          <tr>
            <td>DALL·E 512×512</td><td>0.018 / image</td><td>0.124</td><td>12</td>
          </tr>
          <tr>
            <td>DALL·E 256×256</td><td>0.016 / image</td><td>0.110</td><td>11</td>
          </tr>
          <tr>
            <td>Whisper</td><td>0.006 / minute</td><td>0.041</td><td>5</td>
          </tr>
        </table>
      </div>
    </div>
    <div class="blank"></div>

<!--    <div class="buttons">-->
<!--      <div class="reset_button_container">-->
<!--        <button class="reset_button" @click="db_reset_role_parameters">重置</button>-->
<!--      </div>-->
<!--      <div class="cancel_button_container">-->
<!--        <button class="cancel_button" @click="cancel">取消</button>-->
<!--      </div>-->
<!--      <div class="update_button_container">-->
<!--        <button class="update_button" @click="db_update_role_parameters">确认</button>-->
<!--      </div>-->
<!--    </div>-->

  </div>
</template>
<script>
import {onMounted} from "vue";
// import {ref, watch, onMounted} from "vue";
// import rangeInput from "./range-input.vue";
import axios from "axios";

export default {
  data() {
    return {
      userAvatar:this.$parent.$parent.userAvatar,
      buying:false,
      nick_name:this.$parent.$parent.db_user_data.nickname,
      user_id:this.$parent.$parent.user_id,
      gender:this.$parent.$parent.db_user_data.gender,
    }
  },
  mounted() {
    // console.log("userAvatar is : ", this.userAvatar)
    // console.log("parent is : ", this.$parent)
  },
  components: {
    // rangeInput,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  methods: {
    db_update_user_info(gender, nickname) {
      this.$parent.$parent.db_user_data.gender = gender
      this.$parent.$parent.db_user_data.nickname = nickname
      var sd = {
        user_id:this.$parent.$parent.user_id,     // 因为本组件外面有一层transform，所以要2个parent
        user_info: {
          "nickname":this.$parent.$parent.db_user_data.nickname,
          "gender":this.$parent.$parent.db_user_data.gender,
        },
      }
      console.log("db_update_user_info() with parameters: ", sd)

      axios.post('https://powerai.cc/db_update_user_info', sd).then(response => {
        var rtn = response
        console.log("db_update_user_info() rtn is : ", rtn)

      }).catch(error => {
        console.log("===============db_update_user_info() error: ===============", error)
      })

    },
    handle_nickname_change() {
      this.db_update_user_info(this.gender, this.nick_name )
    },
    handle_gender_change() {
      console.log("before handle_gender_change(), gender is:",this.gender)
      if (this.gender=='男') {
        this.gender = '女'
      }
      else {
        this.gender = '男'
      }
      console.log("after handle_gender_change(), gender is:",this.gender)
      this.db_update_user_info(this.gender, this.nick_name )
    },
    set_buying(){
      this.buying = true
      console.log("this.buying is : ", this.buying)
    },
    set_not_buying(){
      this.buying = false
      console.log("this.buying is : ", this.buying)
    },
    handle_click(vip_type, invoke_payment=false) {
      this.buying = true
      if (invoke_payment) {
        // 购买次数
        this.$parent.$parent.invoke_payment = true
        // this.$parent.$parent.handle_child_select_vip(vip_id)
      }
      else {
        this.$parent.$parent.invoke_payment = false
      }
      this.$parent.$parent.vip_type = vip_type
      this.$parent.$parent.show_pay = true
    },
    // set_user_avatar(avatar) {
    //   this.userAvatar = avatar
    // },
    refresh_app_dom_parameters(in_parameters) {
      // 由于watch()无法监听没有变化的数据，如prompt在控件里已经修改，此时按"重置"时watch没有发现role_data的变化，因此watch不会回调update
      console.log("refresh_app_dom_parameters() with parameters: ", in_parameters)
      // this.$forceUpdate()
      this.editablePrompt = in_parameters.prompt;
      this.editableActivePrompt = in_parameters.active_talk_prompt;

      this.$refs.temperature.force_update(in_parameters.temperature)
      this.$refs.presence_penalty.force_update(in_parameters.presence_penalty)
      this.$refs.frequency_penalty.force_update(in_parameters.frequency_penalty)
    },
    set_app_parameters(in_parameters) {
      var role = this.$parent.$parent.get_db_role(this.$parent.$parent.db_roles_data, this.$parent.$parent.selected_data.role_id)
      console.log("set_app_parameters() old role: ", role)
      role.temperature = in_parameters.temperature
      role.presence_penalty = in_parameters.presence_penalty
      role.frequency_penalty = in_parameters.frequency_penalty
      role.prompt = in_parameters.prompt
      role.active_talk_prompt = in_parameters.active_talk_prompt
      console.log("set_app_parameters() new role: ", role)
    },
    // set_attributes_window_parameters(in_parameters) {
    //   role.temperature = in_parameters.temperature
    //   role.presence_penalty = in_parameters.presence_penalty
    //   role.frequency_penalty = in_parameters.frequency_penalty
    //   role.prompt = in_parameters.prompt
    //   role.active_talk_prompt = in_parameters.active_talk_prompt
    // },
    db_update_role_parameters() {
      var parameter = {}
      parameter.temperature = this.$refs.temperature.get_value()
      parameter.presence_penalty = this.$refs.presence_penalty.get_value()
      parameter.frequency_penalty = this.$refs.frequency_penalty.get_value()
      parameter.prompt = this.editablePrompt
      parameter.active_talk_prompt = this.editableActivePrompt
      console.log("temperature is : ", parameter.temperature)
      console.log("presence_penalty is : ", parameter.presence_penalty)
      console.log("frequency_penalty is : ", parameter.frequency_penalty)
      console.log("prompt is : ", this.editablePrompt)
      console.log("active_talk_prompt is : ", this.editableActivePrompt)

      var sd = {
        user_id:this.$parent.$parent.user_id,     // 因为本组件外面有一层transform，所以要2个parent
        role_id:this.$parent.$parent.selected_data.role_id,
        role_parameter:parameter,
      }
      console.log(sd.user_id, sd.role_id)
      console.log("db_update_role_parameters() with parameters: ", sd.role_parameter)

      axios.post('https://powerai.cc/db_update_role_parameters', sd).then(response => {
        var rtn = response.data;
        if (rtn.success) {
          console.log("===============db_update_role_parameters() success===============")
          this.set_app_parameters(parameter)
        }
      }).catch(error => {
        console.log("===============db_update_role_parameters() error: ===============", error)
      })

    },

    db_reset_role_parameters() {
      var sd = {
        user_id:this.$parent.$parent.user_id,     // 因为本组件外面有一层transform，所以要2个parent
        role_id:this.$parent.$parent.selected_data.role_id,
      }
      console.log(sd.user_id, sd.role_id)
      console.log("db_reset_role_parameters() starts.")
      axios.post('https://powerai.cc/db_reset_role_parameters', sd).then(response => {
        var rtn = response.data;
        if (rtn.success) {
          var data = rtn.content
          console.log("===============db_reset_role_parameters() success with data: ===============", data)
          this.set_app_parameters(data)
          this.refresh_app_dom_parameters(data)
        }
      }).catch(error => {
        console.log("===============db_reset_role_parameters() error: ===============", error)
      })

    },

    cancel() {

    },
  },
  emits: ["outside-click"],
  setup(props, { emit }) {
    // const editablePrompt = ref(props.role.prompt);
    // const editableActivePrompt = ref(props.role.active_talk_prompt);
    // // const promptInput = ref(null);
    //
    // // const temperature_ref = ref(null)
    // // onMounted(()=>{
    // //   resolveRef('temperature')
    // // })
    //
    // watch(  //监听多个变量，要用数组[]，格式如下
    //     [
    //       () => props.role.prompt,
    //       () => props.role.active_talk_prompt,
    //       // () => props.role.temperature,
    //       // () => props.role.presence_penalty,
    //       // () => props.role.frequency_penalty,
    //     ],
    //     ([
    //        newPrompt,
    //        newActivePrompt,
    //        // new_temperature,
    //        // new_presence_penalty,
    //        // new_frequency_penalty,
    //      ]) => {
    //       editablePrompt.value = newPrompt;
    //       editableActivePrompt.value = newActivePrompt;
    //
    //
    //       // const instance = getCurrentInstance()
    //       // instance.$refs.temperature.inputValue = new_temperature
    //       // instance.$refs.presence_penalty.inputValue = new_presence_penalty
    //       // instance.$refs.frequency_penalty.inputValue = new_frequency_penalty
    //     },
    //
    // );

    const handleOutsideClick = (event) => {
      console.log("handleOutsideClick() invoked.")
      if (event.target === event.currentTarget) {
        emit("outside-click");
      }
    };

    onMounted(() => {
      // promptInput.value.focus();
    });

    return {
      // editablePrompt,
      // editableActivePrompt,
      // promptInput,
      handleOutsideClick,
      // temperature_ref,
    };
  },
};
</script>
<style scoped>
.system-setting-window {
  overflow-y: auto;
  overflow-x: hidden;

  display: grid;    /*用flex时，最上面一部分看不见*/
  /*display: flex;*/
  flex-direction: column;
  justify-content: center;
  align-items: center;

  /*position: fixed;*/
  position:fixed;
  top:10px;
  bottom:140px;

  /*left:0px;*/
  right:20px;

  border-radius: 1%;
  padding-left: 0;
  padding-right: 10px;

  /*top: 0;*/
  /*right: 0;*/
  /*bottom: 0;*/
  /*left: 0;*/
  /*top:10%;*/
  /*bottom:30%;*/
  /*width:55%;*/
  /*width:360px;*/
  /*height:100%;*/
  /*height:80%;*/

  background-color: white;
  /*background-color: rgba(0, 0, 0, 0.3);*/

  z-index: 11800;
}
.user_info_container,
.vip_containter,
.openai_cost_containter,
.parameters_containter {
  /*border-radius: 2%;*/
  /*position: absolute;*/

  border-width: 0px;

  margin: 0;

  /*width:75%;*/
  width:285px;
  /*width:235px;*/
  background-color: rgba(0, 0, 0, 0.0);

  /*background-color: #f5f5f5;*/
  padding: 20px;
  padding-top: 10px;
  padding-bottom: 10px;

  border-radius: 5px;
  /*background: white;*/
  background: linear-gradient(145deg, #ffffff, #f3f3f3);
  /*background: linear-gradient(145deg, #f3f3f3, #ffffff);*/
  /*background: linear-gradient(145deg, #e6e6e6, #ffffff);*/
  box-shadow:  4px 4px 9px #e0e0e0,
  -4px -4px 9px #ffffff;

}
.user_id,
.user-container,
.title {
  margin: 0;
}

.user-containter {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, minmax(100px, auto));
}

table {
  display: table;
  width: 100%;  /*该参数让table宽度直接最大，且各列均匀*/
}

table tr, th, td {
  border: solid #d5d5d5 1px;
  height:30px;
  vertical-align: middle;
  color: #5e5353;
  /*text-align: center;*/
}

.buy-button {
  color:red;
}

.title {
  color: #232222;
}
.long-title {
  fon-size:12px;
}

.user-container {
  display: flex;
  flex-direction: row;
}

.avatar-image {
  max-width:64px;
  /*width:expression(this.width>50?"50px":this.width);*/
  max-height:96px;
  /*height:expression(this.height>80?"80px":this.height);*/
  /*width:auto;*/
  /*height:200px;*/
  border-radius: 3px;
  margin: 5px;
}

.line {
  display: flex;
  align-items: center;
  height:30px;
}

label {
  width: 40px; /* 设置标签宽度 */
}


.user-info {
  /*display: flex;*/
  /*flex-direction: column;*/

}

input {
  border: 1px solid #b9b9b9;
  font-size:12px;
  width:150px;
}

input[type=range] {
  /*-webkit-appearance: none;*/
  margin: 10px auto; /* 调整margin值来控制组件整体高度 */
  width: calc(100% - 150px); /* 计算滑动开关的宽度（减去标签和文本的总宽度）*/
}

.user_id {
  font-size: 22px;
  font-weight: bold;
  color: #000000;
  text-align: right;
}
.title {
  font-size: 16px;
  color: #000000;
  /*color: #c4e7ff;*/
}

.user-container,
.prompt,
.parameters {
  border-width: 0px;

  /*width: 95%;*/
  width:280px;
  min-height: 100px;
  font-size: 12px;
  color: #808080;
  /*color: #ffffff;*/
  /*color: #333;*/
  resize: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px;

  background-color: rgba(0, 0, 0, 0.0);

}

.user-container {
  color: #b4b4b4;
}

.prompt,
.parameters {
  border: 1px solid #4f4f4f;

}


.blank {
  /*display: block;*/
  /*box-sizing: border-box;*/
  min-height:10px;
  width:100px;
  /*width:100%;*/
  /*box-sizing: border-box;*/
  /*border-width: 1px;*/
}

.buttons {
  display: flex;
  flex-direction: row;
  /*justify-content: space-between;*/

  margin: 0px;
  padding:10px;
  border-width: 0px;

}

.reset_button_container {
  margin-right:auto;

  border-radius: 3px;
  background: linear-gradient(145deg, #e6e6e6, #ffffff);
  box-shadow:  4px 4px 9px #e0e0e0,
  -4px -4px 9px #ffffff;

}

.cancel_button_container {
  /*justify-content: flex-end;*/
  margin-right:10px;

  border-radius: 3px;
  background: linear-gradient(145deg, #e6e6e6, #ffffff);
  box-shadow:  4px 4px 9px #e0e0e0,
  -4px -4px 9px #ffffff;
}

.update_button_container {
  /*justify-content: flex-end;*/
  margin-right:0px;

  border-radius: 3px;
  background: linear-gradient(145deg, #e6e6e6, #ffffff);
  box-shadow:  4px 4px 9px #e0e0e0,
  -4px -4px 9px #ffffff;

}

.reset_button,
.cancel_button,
.update_button {
  border-width: 0;
  background-color: rgba(0,0,0,0.0);

}

.reset_button {
  color:red;
}

.user-message-avatar {
  margin-right: 20px;
  width: 40px;
  height: 40px;
}

button[disabled] {
  opacity: 0.5; /* 或者其他小于1但大于0的值 */
}


</style>