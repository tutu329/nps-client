<template>
  <div class="role-attributes-window" @click="handleOutsideClick">
    <div class="description_container">
      <h2 class="nickname">{{ role.nickname }}</h2>
      <h3 class="title">角色描述</h3>
      <p class="description">{{ role.description }}</p>
    </div>
    <div class="blank"></div>
    <div class="vip_containter" @click="handleOutsideClick">
      <h3 class="title">角色提示</h3>
      <textarea class="prompt" ref="promptInput" v-model="editablePrompt"></textarea>
    </div>
    <div class="blank"></div>
    <div class="active_prompt_containter" @click="handleOutsideClick">
      <h3 class="title">主动提示</h3>
      <textarea class="active_prompt" ref="active_promptInput" v-model="editableActivePrompt"></textarea>
    </div>
    <div class="blank"></div>
    <div class="parameters_containter" @click="handleOutsideClick">
      <h3 class="title">参数设置</h3>
      <div class="parameters">
        <div>
          <rangeInput ref="temperature" :label="'严谨程度'" :inputValue="role.temperature" :len="60" :max="1.0" :min="0.0"></rangeInput>
        </div>
        <div>
          <rangeInput ref="presence_penalty" :label="'主题数量'" :inputValue="role.presence_penalty" :len="60" :max="2.0" :min="0.0"></rangeInput>
        </div>
        <div>
          <rangeInput ref="frequency_penalty" :label="'避免重复'" :inputValue="role.frequency_penalty" :len="60" :max="2.0" :min="0.0"></rangeInput>
        </div>
      </div>
    </div>
    <div class="blank"></div>
    <div class="buttons">
      <div class="reset_button_container">
        <button class="reset_button" @click="db_reset_role_parameters">重置</button>
      </div>
      <div class="cancel_button_container">
        <button class="cancel_button" @click="cancel">取消</button>
      </div>
      <div class="update_button_container">
        <button class="update_button" @click="db_update_role_parameters">确认</button>
      </div>
    </div>

  </div>
</template>
<script>
// import { ref, onMounted } from "vue";
import {ref, watch, onMounted} from "vue";
// import {ref, watch, resolveRef, onMounted} from "vue";
// import {ref, watch, onMounted, getCurrentInstance} from "vue";
// import { ref, watch, onMounted } from "vue";
import rangeInput from "./range-input.vue";
import axios from "axios";

export default {
  components: {
    rangeInput,
  },
  props: {
    role: {
      type: Object,
      required: true,
    },
  },
  methods: {
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
    const editablePrompt = ref(props.role.prompt);
    const editableActivePrompt = ref(props.role.active_talk_prompt);
    // const promptInput = ref(null);

    // const temperature_ref = ref(null)
    // onMounted(()=>{
    //   resolveRef('temperature')
    // })

    watch(  //监听多个变量，要用数组[]，格式如下
        [
          () => props.role.prompt,
          () => props.role.active_talk_prompt,
          // () => props.role.temperature,
          // () => props.role.presence_penalty,
          // () => props.role.frequency_penalty,
        ],
        ([
           newPrompt,
           newActivePrompt,
           // new_temperature,
           // new_presence_penalty,
           // new_frequency_penalty,
         ]) => {
          editablePrompt.value = newPrompt;
          editableActivePrompt.value = newActivePrompt;


          // const instance = getCurrentInstance()
          // instance.$refs.temperature.inputValue = new_temperature
          // instance.$refs.presence_penalty.inputValue = new_presence_penalty
          // instance.$refs.frequency_penalty.inputValue = new_frequency_penalty
        },

    );

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
      editablePrompt,
      editableActivePrompt,
      // promptInput,
      handleOutsideClick,
      // temperature_ref,
    };
  },
};
</script>
<style scoped>
.role-attributes-window {
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

  z-index: 12800;
}
.description_container,
.vip_containter,
.parameters_containter,
.active_prompt_containter {
  /*border-radius: 2%;*/
  /*position: absolute;*/

  border-width: 0px;

  margin: 0;

  /*width:75%;*/
  width:235px;
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
.nickname,
.description,
.title {
  margin: 0;
}
.nickname {
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

.description,
.prompt,
.active_prompt,
.parameters {
  border-width: 0px;

  /*width: 95%;*/
  width:230px;
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

.description {
  color: #b4b4b4;
}

.prompt,
.active_prompt,
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

</style>