<template>
  <transition name="slide">
    <RoleAttributesWindow
        v-if="showAttributesWindow"
        :role="selectedRole"
    />
    <!--    <RoleAttributesWindow-->
    <!--        v-if="showAttributesWindow"-->
    <!--        :role="selectedRole"-->
    <!--        @outside-click="closeAttributesWindow"-->
    <!--    />-->
  </transition>
  <div class="role-group">
    <div class="role-btns">
      <button
          v-for="(role, index) in roles"
          :key="role.role_id"
          :class="['role-btn', role.role_id, { expanded: isExpanded }]"
          :style="buttonPosition(index)"
          @click="()=>{this.handleRoleClick(index)}"
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
import {ref} from "vue";
// import { ref, computed } from "vue";
import RoleAttributesWindow from "./RoleAttributesWindow.vue";
// import axios from "axios";
// import {splitCodeAndText} from "@/utils";

export default {
  components: {
    RoleAttributesWindow,
  },
  props:[
    'current_vip',
    'parent_roles_data',
    'parent_selected_data'
  ],
  setup(props, context) {
    const roles = ref([
      {role_id: "foo_button", nickname: "免费" , description:"n/a", prompt:"n/a"},
      {role_id: "vip_free", nickname: "免费" , description:"description1", prompt:"prompt1"},
      {role_id: "vip_monthly", nickname: "包月" , description:"description2", prompt:"prompt2"},
      {role_id: "vip_annual", nickname: "包年" , description:"description3", prompt:"prompt3"},
      {role_id: "vip_permanent", nickname: "永久" , description:"description4", prompt:"prompt4"},
    ]);

    const showAttributesWindow = ref(false);
    const selectedRole = ref(roles.value[1]);


    // console.log("=========current vip type is:=========", props.current_vip)

    const inited = ref(false)

    // const closeAttributesWindow = () => {
    //   showAttributesWindow.value = false;
    //   selectedRole.value = null;
    // };

    const isExpanded = ref(false);

    const buttonPosition = (index) => {
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
      const x = 0;
      const y = -index*60;

      // const angle = ((index - 1) * Math.PI) / 8;
      // const x = 150 * Math.cos(angle);
      // const y = -150 * Math.sin(angle);
      //
      const scale_value = '1.5';
      // const scale_value = index<2?'1.5':'1';
      return {
        transform: `translate(${x}px, ${y}px) scale(${scale_value})`,
        zIndex: -index,
      };
    };

    const handleRoleClick = (index) => {
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
      else if (roles.value[index].role_id=="vip_free") {
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

        // 这里无法通过点选改变vip状态，只有server可以改状态
        // roles.value[0] = roles.value[index]

        console.log("child_select_role success.")

      }
    };

    // const {proxy} = getCurrentInstance()  //用于获取this.data

    return {
      roles,
      isExpanded,
      showAttributesWindow,
      selectedRole,
      buttonPosition,
      handleRoleClick,
      // closeAttributesWindow,
    };
  },
  // mounted() {
  //   console.log("=======parent's current_vip is:=========", this.$parent.current_vip)
  //   // console.log("proxy.roles: ", proxy.roles)
  //   // 主按钮显示user当下的vip类型
  //   for (let i = 0; i < this.roles.length; i++) {
  //     if (this.roles[i].role_id==this.$parent.current_vip) {
  //       this.roles[0] = this.roles[i]
  //       console.log("=======current_vip roles[0] changed to roles["+i+"].")
  //     }
  //   }
  //
  // }
};
</script>

<style scoped>
.role-group {
  position: fixed;
  top: 78%;
  left: 40px;

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
  border-radius: 50%;
  border-width: 0px;
  width: 25px;
  height: 25px;
  margin-bottom: 10px;
  font-size: 8px;
  color: #fff;

  position:absolute;  /*让每个按钮位置固定*/
  top:10px;
  left:10px;


}
.foo_button {
  background-color: #bebebe;
}
.vip_free {
  background-color: #bebebe;
}
.vip_monthly {
  background-color: #55a34f;
}
.vip_annual {
  background-color: #f19c3f;
}
.vip_permanent {
  background-color: #f26a74;
}

.role-btn.expanded {
  transition: all 0.3s ease;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
