<template>
  <div class="role-group">
    <div class="role-btns">
      <button
          v-for="(role, index) in parent_roles_data"
          :key="role.role_id"
          :class="['role-btn', role.role_id, { expanded: isExpanded }]"
          :style="{...buttonPosition(index), ...backgroundColor(role)}"
          @click="()=>{this.handleRoleClick(role, index)}"
      >
<!--      <button-->
<!--          v-for="(role, index) in roles"-->
<!--          :key="role.role_id"-->
<!--          :class="['role-btn', role.role_id, { expanded: isExpanded }]"-->
<!--          :style="buttonPosition(index)"-->
<!--          @click="handleRoleClick(index)"-->
<!--      >-->
        {{ role.nickname }}
      </button>
    </div>

  </div>
</template>

<script>
import { ref } from "vue";
// import { ref, computed } from "vue";
// import RoleAttributesWindow from "./RoleAttributesWindow.vue";
import axios from "axios";
// import axios from "axios";
// import {splitCodeAndText} from "@/utils";

export default {
  components: {
    // RoleAttributesWindow,
  },
  props:[
    'server_role_config',
    'user_data',
    'user_id',
    'current_role',
    'parent_roles_data',
    'parent_selected_data'
  ],
  setup(props, context) {
    const roles = ref([
      {role_id: "foo_button", nickname: "默认" , description:"n/a", prompt:"n/a"},
      {role_id: "default_role", nickname: "默认" , description:"description1", prompt:"prompt1"},
      {role_id: "coder_role", nickname: "程序" , description:"description2", prompt:"prompt2"},
      {role_id: "translator_role", nickname: "翻译" , description:"description3", prompt:"prompt3"},
      {role_id: "painter_role", nickname: "图文" , description:"description4", prompt:"prompt4"},
      {role_id: "chart_role", nickname: "图表" , description:"description5", prompt:"prompt5"},
      {role_id: "API_role", nickname: "API" , description:"description6", prompt:"prompt6"},
    ]);


    // const showAttributesWindow = ref(false);
    const selectedRole = ref(roles.value[1]);
    const inited = ref(false)

    // const closeAttributesWindow = () => {
    //   showAttributesWindow.value = false;
    //   selectedRole.value = null;
    // };

    const isExpanded = ref(false);

    const buttonPosition = (index) => {
      // console.log("=============buttonPosition() invoked==================")
      // if (!isExpanded.value)
      //   return {
      //     zIndex: -index,
      //   };
      if (index === 0 || !isExpanded.value)
        return {
          zIndex: -index,
        };

      // const angle = ((index - 1) * Math.PI) / 8;
      // 横向展开
      // const x = index*60;
      // const y = 0;
      // 纵向展开
      const x = 5;
      const y = -index*60;

      // const angle = ((index - 1) * Math.PI) / 8;
      // const x = 150 * Math.cos(angle);
      // const y = -150 * Math.sin(angle);
      //
      const scale_value = '1.2';
      // const scale_value = index<2?'1.5':'1';
      return {
        transform: `translate(${x}px, ${y}px) scale(${scale_value})`,
        zIndex: -index,
      };
    };
    const backgroundColor = (role)=>{
      // console.log("=============buttonColor() invoked==================")
      let roles_config = props.server_role_config
      let button_color = ""

      if (roles_config) {
        // let user_data = props.user_data
        let user_level = props.user_data.user_level
        // console.log("=============roles_config:==================", roles_config)
        // console.log("=============user_data:==================", user_data)
        // console.log("=============user_level:==================", user_level)
        // console.log("=============role:==================", role)

        let can_use = false

        // if (role.role_id in roles_config && user_level) {
        if (role.role_id in roles_config) {
          can_use = roles_config[role.role_id]["can_use"][user_level]
        }

        if (!can_use) {
          button_color = "#bebebe"
        }

        // console.log("=============can_use:==================", can_use)
        // console.log("=============button_color:==================", button_color)
      }

      return {
        backgroundColor:button_color,
      }
    };

    const handleRoleClick = (role, index) => {

      // ========================如果不可用，直接不执行========================
      // console.log("=============buttonColor() invoked==================")
      let roles_config = props.server_role_config
      // let user_data = props.user_data
      let user_level = props.user_data.user_level
      // console.log("=============roles_config:==================", roles_config)
      // console.log("=============user_data:==================", user_data)
      // console.log("=============user_level:==================", user_level)
      // console.log("=============role:==================", role)

      let can_use = false

      if (user_level) {
        can_use = roles_config[role.role_id]["can_use"][user_level]
      }

      if (!can_use) {
        return
      }
      // ========================如果不可用，直接不执行========================

      // let temp_id = index+1
      // function swap_button_index(index1, index2){
      //   const temp = roles.value[index1]
      //   console.log("temp:",temp)
      //
      //   roles.value[index1] = roles.value[index2]
      //   roles.value[index2] = temp
      // }
      if (index==0) {
        //点中主按钮，读取APP.vue的user和roles数据
        roles.value = props.parent_roles_data

        if (inited.value==false) {
          // 如果第一次按主按钮，则属性窗口显示内容为default_role
          inited.value=true
          selectedRole.value = roles.value[1];
        }

        isExpanded.value = !isExpanded.value;
        // showAttributesWindow.value = !showAttributesWindow.value;
        return
      }
      else if (roles.value[index].role_id=="API_role") {
        // api_role不是角色，只是方便用户查看api_key。这里只显示description和prompt(key)，不传prompt给父组件
        selectedRole.value = roles.value[index];

      }else {
        //点中角色按钮，主按钮变成所选按钮
        // console.log("before:",roles)
        // swap_button_index(0, index)
        // console.log("after:",roles)
        // showAttributesWindow.value = true;
        selectedRole.value = roles.value[index];
        console.log("selected role id is : ", selectedRole.value.role_id)

        // 注意，子传父，必须用context.emit而不是this.$emit()，context在setup(props, context)里注册
        context.emit('child_select_role', selectedRole.value.role_id);

        // props.parent_selected_data.role_id = selectedRole.value.role_id
        // isExpanded.value = false;

        roles.value[0] = roles.value[index]
        console.log("child_select_role success.")

        // 更新server的current_role
        let sd={
          user_id:props.user_id,
          role_id:roles.value[index]["role_id"],
        }
        axios.post('https://powerai.cc/user_update_current_role', sd).then(response => {
          let rtn = response.data
          if (rtn.success) {
            console.log("server: user's current_role changed to \""+roles.value[index]["role_id"]+"\"successfully.")
          }
        }).catch(error => {
          console.log("===============user_update_current_role error: ===============", error)
        })

        isExpanded.value = !isExpanded.value;
      }
    };

    return {
      roles,
      isExpanded,
      // showAttributesWindow,
      selectedRole,
      buttonPosition,
      backgroundColor,
      handleRoleClick,
      // closeAttributesWindow,
    };
  },
  // computed(){
  //
  // },

  // mounted() {
  //   // 主按钮显示user当下的vip类型
  //   console.log("=======parent's current_role is:=========", this.$parent.current_role)
  //   for (let i = 0; i < this.roles.length; i++) {
  //     if (this.roles[i].role_id==this.$parent.current_role) {
  //       this.roles[0] = this.roles[i]
  //       console.log("=======current_role roles[0] changed to roles["+i+"].")
  //     }
  //   }
  //
  // }
};
</script>

<style scoped>
.role-group {
  position: fixed;
  bottom:140px;
  /*top: 78%;*/
  left: 10px;

  z-index: 900;

}
.role-btns {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.fly-enter-active,
.fly-leave-active {
  transition: all 0.3s ease;
}
.fly-enter-from,
.fly-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
.role-btn {
  border-radius: 0.3rem;
  padding: 0.2rem;
  /*border-radius: 50%;*/
  border-width: 0px;
  width: 40px;
  height: 30px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #fff;

  position:absolute;  /*让每个按钮位置固定*/
  top:10px;
  left:5px;


}
.foo_button {
  background-color: #51a1d9;
}
.default_role {
  background-color: #51a1d9;
}
.coder_role {
  background-color: #55a34f;
}
.translator_role {
  background-color: #f19c3f;
}
.painter_role {
  background-color: #f26a74;
}
.chart_role {
  background-color: #0085ff;
}
.GPT4_role {
  background-color: #000000;
}
.API_role {
  background-color: #8e4f9e;
}

.role-btn.expanded {
  transition: all 0.3s ease;
}

</style>
