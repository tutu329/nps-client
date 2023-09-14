<template>
  <div class="chat-container">
<!--    <UserSetting ref="user_setting" :roles="roles" :selectedRole="selectedRole">-->
<!--    <LoginForm></LoginForm>-->
<!--    <confirm-dialog></confirm-dialog>-->
    <confirm-dialog :show="show_confirm_dialog" :warning-message="confirm_dialog_text" @on-confirm="handleConfirmDeleteChat" @on-cancel="handleCancelDeleteChat"></confirm-dialog>
<!--    <UserSetting ref="user_setting" :roles="roles" :selectedRole="selectedRole" v-model:rolePrompt="rolePrompt" v-model:roleActivePrompt="roleActivePrompt"/>-->
    <LoginWindow></LoginWindow>
<!--    <LoginWindow v-model:show-modal="login_show_modal"></LoginWindow>-->
    <transition name="overlay_transition">
      <div v-if="login_show_modal" class="overlay" ></div>
    </transition>

    <transition class="attributes_window_transition" name="slide1">
      <RoleAttributesWindow v-if="showAttributesWindow" @outside-click="close_attributes_window" :role="get_db_role(db_roles_data, selected_data.role_id)" />
    </transition>

    <transition class="system_setting_transition" name="slide2">
      <SystemSettingWindow ref="SystemSettingWindow" v-if="showSystemSettingWindow" @outside-click="close_system_setting_window" :user="db_user_data" />
    </transition>


    <RoleGroup :server_role_config="db_role_config" :user_data="db_user_data" :user_id="user_id" :current_role="current_role" :parent_roles_data="db_roles_data" @child_select_role="handle_child_select_role"/>
    <VipGroup :current_vip="current_vip" :parent_vip_data="vip_data" @vip_click="handle_vip_group_click"/>
<!--    <VipGroup :current_vip="current_vip" :parent_roles_data="vip_data" @child_select_role="handle_child_select_vip"/>-->
    <FloatButtons :buttons="bubble_buttons" @clickButton="handleClickBubbleButton" />
    <div v-if="show_pay" ><InvokePayment :vip_type="vip_type"></InvokePayment></div>
    <video-player :video-url="demo_videos[demo_index].url" :subtitle="demo_videos[demo_index].subtitle" @skip="onVideoSkip" @ended="onVideoEnded"/>
    <div class="access_web_container">
      <input class="range_input_access_web" type="range" min="0" max="1" step="1" :value="access_web?1:0" @change="handle_access_web_change">
      <div class="text_access_web">联网</div>
    </div>
<!--    <video-player class="video_player" :video-url="demo_videos[demo_index].url" :subtitle="demo_videos[demo_index].subtitle" @skip="onVideoSkip" @ended="onVideoEnded"/>-->

<!--    <div class="overlay" v-if="login_show_modal" :style="{backgroundColor: set_overlay_color}"></div>-->
<!--    v-on:touchstart="handleTouchStart"-->
<!--    v-on:touchmove="handleTouchMove"-->
<!--    v-on:touchend="handleTouchEnd"-->
    <div class="chat-history"
         @dblclick="handleChatHistoryClick"
         ref="chat_history_scroll">
      <div v-for="(message, index) in history_messages" :key="message.id">
        <!----------------------------user的信息---------------------------->
        <div v-if="message.role === 'user'" class="message user-message">
          <div class="user-message-bubble">
            <CodeIndent :code="message.content" />
          </div>
          <div class="user-message-avatar"><img :src="userAvatar" alt="User Avatar" class="avatar-image"></div>
        </div>
        <!----------------------------user的信息---------------------------->

        <!----------------------------server的信息---------------------------->
        <div v-else-if="message.role === 'assistant'" class="message server-message">
          <div class="server-message-avatar"><img :src="serverAvatar" alt="Server Avatar" class="avatar-image"></div>
<!--            <div v-if="message.type === 'text_list'" class="server-message-bubble">-->
<!--              <CodeIndent :code="text_dict[0].value"/>-->
<!--              <img v-if="loading_gif_show&&(index==messages.length-1)" :src="loading_gif_url" alt="Server Loading" class="loading-gif">-->
<!--            </div>-->

          <!----------------------------server返回的text_list---------------------------->
          <div v-if="message.type === 'text_list'" class="server-message-bubble">
            <div v-for="(text_dict) in message.content" :key="text_dict.id" class="server-text-list">

              <!----------------------------server返回的normal_text---------------------------->
              <div v-if="text_dict.type === 'normal_text'" class="server-text-block">
                <CodeIndent :code="text_dict.value" />
<!--                <img v-if="loading_gif_show&&(index==messages.length-1)" :src="loading_gif_url" alt="Server Loading" class="loading-gif">-->
              </div>

              <!----------------------------server返回的源代码---------------------------->
              <div v-else class="server-text-block">
                <CodeWindow :code="text_dict.value" :language="text_dict.type"/>
<!--                <CodeWindow :code="text_dict.value" :language="text_dict.type" isDarkTheme/>-->
<!--                <img v-if="loading_gif_show&&(index==messages.length-1)" :src="loading_gif_url" alt="Server Loading" class="loading-gif">-->
              </div>

            </div>
            <img v-if="invoking_server&&(index==history_messages.length-1)" :src="loading_gif_url" alt="Server Loading" class="loading-gif">
          </div>
          <!---------------------------------------------------------------------------->

          <!----------------------------server返回的image_object_list---------------------------->
          <div v-else-if="message.type === 'image_object_list'" class="server-message-bubble">
            <div v-for="(image_base64_str) in message.content" :key="image_base64_str.id" class="server-image-object-list">
              <img :src="image_base64_str" style="width:100%; height:auto; borderRadius:5px; backgroundColor:rgba(0, 0, 0, 0.0)"/>
<!--              <img :src="one_Image_obj.src">-->
            </div>
          </div>

          <!----------------------------server返回的image_url---------------------------->
          <div v-else-if="message.type === 'image_url'" class="server-message-bubble">
            <div v-html="message.content"></div>
            <img v-if="invoking_server&&(index==history_messages.length-1)" :src="loading_gif_url" alt="Server Loading" class="loading-gif">
          </div>
          <div v-else class="server-message-bubble">
            <CodeIndent :code="message.content"/>
            <img v-if="invoking_server&&(index==history_messages.length-1)" :src="loading_gif_url" alt="Server Loading" class="loading-gif">
          </div>
        </div>
        <!----------------------------server的信息---------------------------->

      </div>
    </div>

    <!----------------------------send textarea、button和mem-checkbox---------------------------->
    <div class="chat-input">
      <textarea id="user_input" type="text" v-model="inputMessage" contenteditable="true" v-bind:placeholder="send_message_placeholder_dict[selected_data.role_id]" class="user-send-textarea" ref="send_textarea" autofocus></textarea>
      <div class="all-buttons">
        <div class="cancel-and-reinput">
          <div class="cancel-button">
            <button id="cancel_button" v-bind:disabled="!invoking_server" @click="cancelMessage">取消</button>
          </div>
          <div class="reinput-button">
            <button id="reinpu_button"  @click="reinput">重填</button>
          </div>
          <div class="delete-button">
            <button id="delete_button" v-bind:disabled="invoking_server" @click="deleteMessage">删除</button>
          </div>
        </div>
        <div class="send-button">
          <button id="user_send_button" v-bind:disabled="invoking_server||!has_invokes_left" @click="sendMessage">
            <div class="send-button-text">发送</div>
            <div class="send-button-invokes-text">{{get_db_invoke_num_left_today}}</div>
          </button>
        </div>
        <!-- 聊天记忆复选框 -->
<!--        <div class="send-checkbox">-->
<!--          <label for="memory-checkbox">聊天记忆</label>-->
<!--          <input type="checkbox" id="memory-checkbox" v-model="chat_has_memory"/>-->
<!--        </div>-->
      </div>
    </div>

  </div>
</template>

<script>
import CodeIndent from "@/components/code-indent.vue";
import CodeWindow from './components/code-window.vue';
import ConfirmDialog from './components/confirm-dialog.vue'
import RoleAttributesWindow from "./components/RoleAttributesWindow.vue";
import SystemSettingWindow from "./components/system-setting.vue";

var vue_life_cycle_debug = false

// var local_test = false
import axios from 'axios';

import {splitCodeAndText} from './utils';
// import {splitCodeAndText, test_test} from './utils';
// import UserSetting from './components/UserSetting.vue';
import LoginWindow from './components/login-window.vue'
import RoleGroup from "./components/RoleGroup.vue";
import VipGroup from "./components/VipGroup.vue";
import InvokePayment from "./components/pay.vue";
import FloatButtons from "./components/floating-buttons.vue";
import VideoPlayer from "./components/video-player.vue";

import { ref } from 'vue'
// import { ref, getCurrentInstance } from 'vue'
// import RangeInput from "@/components/range-input.vue";
// import { ref, reactive, onMounted, getCurrentInstance } from 'vue'

export default {
  //vue生命周期
  beforeCreate () {
    if (vue_life_cycle_debug) {
      console.log('beforeCreate ()在实例初始化之前调用')
    }
  },
  setup() {
    // const {proxy} = getCurrentInstance()  //用于获取this.data
    // console.log(proxy)

    return {
      // my_data,
    }
  },
  data() {
    // console.log('data() invoked.')
    // test_test()

    return {
       send_message_placeholder_dict:{
         "default_role":"背景情况是{背景}，你是{领域}的资深专家，我希望实现{目标}，我的要求包括{关键结果}",
         "coder_role":"你是精通python、js、java、php、c、c++等前后端语言的资深程序员，请编写一个...",
         "translator_role":"Avez-vous bien mangé et bu aujourd'hui?",
         "painter_role":"小猫图",
         "chart_role":"将包含数据的文本复制到这里...",
         "GPT4_role":"背景情况是{背景}，你是{领域}的资深专家，我希望实现{目标}，我的要求包括{关键结果}",
       },
       has_invokes_left:true,
       access_web:false,
       history_messages : [], //进行一次深copy
       user_id : "some_user_id",
       showAttributesWindow: false,
       showSystemSettingWindow:false,
       db_user_config:{}, //server的user配置信息
       db_role_config:{}, //server的role配置信息
       db_user_data : {},
       db_roles_data : [
         {role_id: "foo_button", nickname: "默认" , description:"n/a", prompt:"n/a"},
         {role_id: "default_role", nickname: "默认" , description:"常用的AI助手，提供问答服务，不具备聊天记忆，适用于回复较为明确、逻辑线索较为清晰的对话，但已经具备chatGPT完整的分析能力，思路活络而不拘泥，上知天文、下知地理，可作诗、可评论，是生活和工作的万宝箱。", prompt:"你是无所不知的全领域专家，不管问什么问题，直接回答，不要提及你是AI助手或虚拟助手等，那样显得很啰嗦，现在我就开始提问了。"},
         {role_id: "coder_role", nickname: "程序" , description:"description2", prompt:"prompt2"},
         {role_id: "translator_role", nickname: "翻译" , description:"description3", prompt:"prompt3"},
         {role_id: "painter_role", nickname: "图文" , description:"description4", prompt:"prompt4"},
         {role_id: "chart_role", nickname: "图表" , description:"description5", prompt:"prompt5"},
         {role_id: "GPT4_role", nickname: "GPT4" , description:"description5", prompt:"prompt5"},
         {role_id: "API_role", nickname: "API" , description:"description6", prompt:"prompt6"},
      ],

      vip_data : [
         {role_id: "foo_button", nickname: "免费" , description:"n/a", prompt:"n/a"},
         // {role_id: "vip_free", nickname: "免费" , description:"description1", prompt:"prompt1"},
         {role_id: "evaluate_user", nickname: "试用" , description:"description2", prompt:"prompt2"},
         {role_id: "vip_monthly", nickname: "月度" , description:"description2", prompt:"prompt2"},
         {role_id: "vip_quarterly", nickname: "季度" , description:"description2", prompt:"prompt2"},
         {role_id: "vip_annual", nickname: "年度" , description:"description3", prompt:"prompt3"},
         {role_id: "vip_permanent", nickname: "永久" , description:"description4", prompt:"prompt4"},
      ],
      current_vip:"vip_free",

      selected_data:{
         role_id:"default_role",
      },
      current_role:"default_role",

      vip_type:"vip_free",
      // selected_vip:{
      //    vip_id:"vip_free",
      // },
      vip_type_title : {
         "vip_monthly":"月度VIP",
         "vip_quarterly":"季度VIP",
         "vip_annual":"年度VIP",
         "vip_permanent":"永久VIP",
         "buy_invokes_1":"GPT3.5 30次",
         "buy_invokes_2":"GPT4 10次",
         "buy_invokes_3":"GPT4 20次",
      },

      show_pay:false,
      invoke_payment:false,

       user_gender: "男",

       inputMessage : ref(''),
       // userAvatar : ref(require('./assets/images/user-s.jpg')),  //必须这样引用，才能被正确打包到dist中
       // serverAvatar : ref(require('./assets/images/server-s.jpg')),

       tick_icon:ref(require('./assets/images/tick_icon.jpg')),
       userAvatar : ref(require('./assets/images/ss05.jpg')),
       serverAvatar : ref(require('./assets/images/ss10.jpg')),

       avatar_female: ref(require('./assets/images/ss10.jpg')),
       avatar_male:   ref(require('./assets/images/ss05.jpg')),

       avatar_females: {
         "default_role":    ref(require('./assets/images/ss10.jpg')),
         "coder_role":      ref(require('./assets/images/ss19.jpg')),
         "translator_role": ref(require('./assets/images/ss11.jpg')),
         "painter_role":    ref(require('./assets/images/ss14.jpg')),
         "chart_role":      ref(require('./assets/images/ss15.jpg')),
         "GPT4_role":      ref(require('./assets/images/ss17.jpg')),
         // ref(require('./assets/images/ss12.jpg')),
         // ref(require('./assets/images/ss13.jpg')),
         // ref(require('./assets/images/ss15.jpg')),
         // ref(require('./assets/images/ss16.jpg')),
         // ref(require('./assets/images/ss18.jpg')),
       },
       avatar_males:{
         "default_role":    ref(require('./assets/images/ss04.jpg')),
         "coder_role":      ref(require('./assets/images/ss05.jpg')),
         "translator_role": ref(require('./assets/images/ss06.jpg')),
         "painter_role":    ref(require('./assets/images/ss02.jpg')),
         "chart_role":      ref(require('./assets/images/ss01.jpg')),
         "GPT4_role":      ref(require('./assets/images/ss34.jpg')),
         // ref(require('./assets/images/ss03.jpg')),
         // ref(require('./assets/images/ss07.jpg')),
         // ref(require('./assets/images/ss31.jpg')),
         // ref(require('./assets/images/ss32.jpg')),
         // ref(require('./assets/images/ss33.jpg')),
         // ref(require('./assets/images/ss34.jpg')),
         // ref(require('./assets/images/ss35.jpg')),
         // ref(require('./assets/images/ss36.jpg')),
       },

       invoking_server : false,
       send_button_disabled : false,
       loading_gif_show : true,
       loading_gif_url : ref(require('./assets/images/loading6-s.gif')),

       chat_has_memory : false,


       // selectedRole : "default_role",
       rolePrompt : ref(""),
       roleActivePrompt : ref(""),

       login_show_modal:false,

       sending_task_status:{
        "finished":false,
        "time_out":false,
        "req_err":false,
         "queue_started":false,
         "queue_err":false,
         "queue_timeout":false,
         "queue_request_id":"some_request_id",
         "queue_request_len":0,
       },

       show_confirm_dialog:false,
       confirm_dialog_text:"确定要删除吗？",

      bubble_buttons: [
        { label: '强化', text: "let's think step by step." },
        // { label: '检查', text: '回复之前检查结果是否正确。' },
        // { label: '略释', text: '直接回复不解释。' },
        // { label: '详释', text: '每一步都解释清楚。' },
        // { label: '注释', text: '写清楚代码的注释。' },
        { label: '翻英', text: '翻译成英语。' },
        // { label: '翻法', text: '翻译成法语。' },
        { label: '穿搭', text: '你现在是我的时尚穿搭顾问，请根据以下条件为我设计一套穿搭方案，角色：我是一个女生，30岁；季节：夏天、炎热；身材：165cm、100斤、偏瘦；个性：活泼、外向；场景：重要约会、较为正式；其他要求：我是短发。' },
        // { label: '翻德', text: '翻译成德语。' },
        // { label: '翻俄', text: '翻译成俄语。' },
        // { label: '翻意', text: '翻译成意大利语。' },
        // { label: '翻为', text: '翻译成' },
      ],

      demo_videos:[
          {
          url:'https://powerai.cc/static/1.mp4',
          subtitle:"今日提示：可通过点击\"逻辑\"按钮附加要求，让GPT \"think step by step\"，从而有效提升回复质量。"
          },
          {
          url:'https://powerai.cc/static/2.mp4',
          subtitle:"今日提示：可通过\"翻译\"角色让GPT直接翻译为英文而非回答问题，或在任意角色下通过点击\"翻X\"按钮让GPT直接翻译为该国语言。"
          },
          {
          url:'https://powerai.cc/static/3.mp4',
          subtitle:"今日提示：可通过\"图文\"角色让GPT访问网络获取插图（并非调用OpenAI的Dall.E绘制图片）"
          },
          {
          url:'https://powerai.cc/static/4.mp4',
          subtitle:"今日提示：可通过输入提示，让GPT分饰两角，自行讨论领域话题，仅需输入\"继续\"使其不断深入。"
          },
          {
          url:'https://powerai.cc/static/5.mp4',
          subtitle:"今日提示：可通过输入提示，让GPT扮演多个角色，灵感、头脑风暴，近乎探囊取物。"
          },
          {
          url:'https://powerai.cc/static/6.mp4',
          subtitle:"今日提示：可通过点击\"详释\"按钮附加要求，让GPT在分析时更加谨慎和深入，从而有效提升回复质量。"
          },
          {
          url:'https://powerai.cc/static/7.mp4',
          subtitle:"今日提示：可通过\"图表\"角色，让GPT分析含数据的文本，并直接输出图表，真正解决非表格数据的可视化问题。"
          },
      ],
    }
  },
  components: {
    // RangeInput,
    CodeIndent,
    CodeWindow,
    ConfirmDialog,
    // UserSetting,
    LoginWindow,
    RoleGroup,
    VipGroup,
    FloatButtons,
    VideoPlayer,
    InvokePayment,
    RoleAttributesWindow,
    SystemSettingWindow,
    // RoleTemplate,
  },
  computed: {
    get_db_invoke_num_left_today() {
      // console.log("get_db_invoke_num_left_today(), db_user_data is : ", this.db_user_data)
      if (this.selected_data.role_id=="GPT4_role") {
        return "(" + this.db_user_data.gpt4_invoke_num_left_today + ")"
      } else {
        return "(" + this.db_user_data.gpt3_invoke_num_left_today + ")"
      }
    },
    demo_index() {
      return Math.floor(Math.random() * this.demo_videos.length)
    },
  },
  // emits:['child_select_role'],
  methods: {
    handle_access_web_change() {
      console.log("handle_access_web_change() invoked.")
      this.access_web = !this.access_web
      console.log("access_web is : ", this.access_web)
    },
    user_check_invoke_times() {
      var sd = {
        "user_id": this.user_id,
      }
      // console.log("user_check_invoke_times() user_id:", sd.user_id)
      axios.post('https://powerai.cc/db_get_user_data', sd).then(response => {
        var data = response.data
        this.db_user_data = data.content.user

        let can_invoke = false
        if (this.selected_data.role_id=="GPT4_role") {
          can_invoke = this.db_user_data.gpt4_invoke_num_left_today>0
        } else {
          can_invoke = this.db_user_data.gpt3_invoke_num_left_today>0
        }
        if (!can_invoke) {
          this.has_invokes_left = false
        }
        else {
          this.has_invokes_left = true
        }
        // console.log("user can invoke: ", can_invoke)

      }).catch(error => {
        console.log("===============db_get_user_data error: ===============", error)
      })
    },
    handleTouchStart(event) {
      // console.log(111);
      // 获得起点X坐标，初始化distance为0
      this.touchStartPointX = event.targetTouches[0].pageX;
      this.touchStartPointY = event.targetTouches[0].pageY;
      // console.log(this.touchStartPoint);
      this.distanceX = 0;
      this.distanceY = 0;
    },
    handleTouchMove(event) {
      if (this.touchStartPointX < this.touchLeft) {
        // 只监听单指划动，多指划动不作响应
        if (event.targetTouches.length > 1) {
          return;
        }
        // console.log(event.targetTouches[0].pageX);
        // 实时计算distance
        this.distanceX = event.targetTouches[0].pageX - this.touchStartPointX;
        this.distanceY = event.targetTouches[0].pageY - this.touchStartPointY;
        // 根据distance在页面上做出反馈。这里演示通过返回按钮的背景变化作出反馈
      }
    },
    handleTouchEnd() {
      if (this.touchStartPointX < this.touchLeft) {
        // 划动结束，重置数据
        this.touchStartPointX = 0;
        this.touchStartPointY = 0;
        // 当划动距离超过100px时，触发返回事件
        // if (this.distanceX > 100) {
        let temp = this.distanceY / this.distanceX;
        // console.log(this.distanceY, this.distanceX, temp);
        if (this.distanceX > 10 && temp < 0.176 && temp > -0.176) {
          this.handleChatHistoryClick()
          // 返回前修改样式，让过渡动画看起来更快
          this.$router.go(-1);
        }
      }
    },
    close_attributes_window() {
      this.showAttributesWindow = false
    },
    close_system_setting_window() {
      this.showSystemSettingWindow = false
    },
    get_db_role(in_db_roles_data, in_role_id) {
      for(let i = 0; i < in_db_roles_data.length; i++) {
        if (in_db_roles_data[i].role_id==in_role_id) {
          return in_db_roles_data[i]
        }
      }
      return null
    },
    handleChatHistoryClick() {
      console.log("chat_history_container clicked().")
      console.log("selected role is :", this.selected_data.role_id)
      console.log("db_roles_data is :", this.db_roles_data)
      console.log("selected_role_data is :", this.get_db_role(this.db_roles_data, this.selected_data.role_id))

      this.showAttributesWindow = !this.showAttributesWindow;
      if (this.showSystemSettingWindow) {
        this.showSystemSettingWindow = false;
      }
    },
    onVideoSkip() {
      // 用户跳过了视频
      // 在这里可以做一些处理，比如记录用户已经跳过了视频
    },
    onVideoEnded() {
      // 视频播放结束
      // 在这里可以做一些处理，比如显示下一步操作的按钮
    },
    handleClickBubbleButton(text) {
      // 在输入末尾增加强化提示语，如"think step by step"
      this.inputMessage = this.inputMessage + text
      this.$refs.send_textarea.focus()
    },
    handleConfirmDeleteChat(){
      console.log('处理删除逻辑...')

      var sd = {
        user_id: this.user_id,
        role_id: this.selected_data.role_id,
      }
      axios.post('https://powerai.cc/user_clear_chat_list', sd).then(response => {
        var rtn_dict = response.data
        console.log("delete chat_list with response: ", rtn_dict)
        this.invoking_server = false

        // 同时删除页面的message_list
        this.history_messages = []
      })

      this.show_confirm_dialog = false;
    },
    handleCancelDeleteChat() {
      this.invoking_server = false
      this.show_confirm_dialog = false;
    },
    handle_vip_group_click() {
      console.log("handle_vip_group_click() invoked.")
      this.showSystemSettingWindow = !this.showSystemSettingWindow
      console.log("show showSystemSettingWindow is: ",this.showSystemSettingWindow)
    },
    handle_child_select_role(role_id) {
      // 某个role被点中时

      // ========================如果不可用，直接不执行========================
      let can_use = false

      // console.log("=============buttonColor() invoked==================")
      let roles_config = this.db_role_config
      // let user_data = this.db_user_data
      let user_level = this.db_user_data.user_level
      // console.log("=============roles_config:==================", roles_config)
      // console.log("=============user_data:==================", user_data)
      // console.log("=============user_level:==================", user_level)
      // console.log("=============role_id:==================", role_id)
      if (user_level) {
        can_use = roles_config[role_id]["can_use"][user_level]
      }
      if (!can_use) {
        return
      }
      // ========================如果不可用，直接不执行========================

      // =========根据user性别换gpt头像==========
      if (this.db_user_data.gender=="男") {
        this.serverAvatar = this.avatar_females[role_id]
      } else {
        this.serverAvatar = this.avatar_males[role_id]
      }

      this.selected_data.role_id = role_id
      console.log("this.selected_data.role_id is : ", this.selected_data.role_id)
      try {
        var sd = {
          "user_id": this.user_id,
          "role_id": this.selected_data.role_id,
        }
        // 获取历史user_chat_list
        axios.post('https://powerai.cc/user_get_chat_list', sd).then(response => {
          // 获取数据
          this.history_messages = response.data
          console.log("this.history_messages get from server is : ", this.history_messages)
          // 格式化（将代码区分出来）
          for(let i = 0; i < this.history_messages.length; i++){
            var chat = this.history_messages[i]
            var text_list = splitCodeAndText(chat["content"])
            // 如果文本包含代码块，则改为list，类型变为text_list
            if (text_list.length>1) {
              chat["content"]=text_list
              chat["type"]="text_list"
            }
            else {
              chat["content"]=text_list[0].value
              chat["type"]="normal_text"
            }
          }
          console.log("this.history_messages formated is : ", this.history_messages)
          // console.log(proxy)
          // 这里让this.history_messages刷新，通过proxy调用
          // proxy.history_messages = my_data.history_messages
          this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新滚动条*/
            this.$refs.chat_history_scroll.scrollTo({top: this.$refs.chat_history_scroll.scrollHeight,behavior: 'smooth'})
            this.user_check_invoke_times()
          });
        })
      }
      catch (e) {
        console.log("user login error: ", e)
      }
    },
    reinput() {
      this.inputMessage = ""
      this.$refs.send_textarea.focus()
    },
    cancelMessage() {
      var sd = {
        user_id: this.user_id,
        role_id: this.selected_data.role_id,
      }
      axios.post('https://powerai.cc/user_cancel_current_response', sd).then(response => {
        var rtn_dict = response.data
        console.log("current response canceled with response: ", rtn_dict)
        this.invoking_server = false
        this.sending_task_status["finished"] = true
      })
    },
    deleteMessage() {
      this.invoking_server = true
      this.confirm_dialog_text =  "您将删除该角色聊天记录。"
      this.show_confirm_dialog = true
      // if (this.confirm_dialog_result == true) {
      //   axios.post('https://powerai.cc/user_clear_chat_list', sd).then(response => {
      //     var rtn_dict = response.data
      //     console.log("delete chat_list with response: ", rtn_dict)
      //     this.invoking_server = false
      //     this.confirm_dialog_result == false
      //
      //     // 同时删除页面的message_list
      //     this.history_messages = []
      //   })
      // }
    },
    sendMessage() {
      // console.log("user selecting is : ", this.$refs.user_setting.selectedIndex)
      // heihei
      // console.log("selected role is: ", this.selectedIndex )

      // 马上disable这个按钮
      this.invoking_server = true
      this.send_button_disabled = true
      // 马上disable这个按钮

      //=============================显示user发送信息=============================
      const message = {
        // id: new Date().getTime(),
        role: 'user',
        content: this.inputMessage.trim(),
        // content: this.inputMessage.trim().replace(/\n/g, '<br>')    //必须先trim后替换回车，否则末尾回车去不掉
        type:'normal_text',
      }
      this.history_messages.push(message)
      this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新滚动条*/
        this.$refs.chat_history_scroll.scrollTo({top:this.$refs.chat_history_scroll.scrollHeight, behavior:'smooth'})
      });

      // =============================预先显示server信息框（等待获取数据填充）=============================
      var server_pre_message = {
        // id: new Date().getTime(),
        role: 'assistant',
        content: "",
        type:'normal_text',
      }
      this.history_messages.push(server_pre_message)
      this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新滚动条*/
        this.$refs.chat_history_scroll.scrollTo({top:this.$refs.chat_history_scroll.scrollHeight, behavior:'smooth'})
        // 请求期间，显示loading_gif
        this.loading_gif_show = true
      });

      // console.log('start requesting django server.')
      var send_data = {
        data: this.inputMessage.trim(),
        user_id: this.user_id,
        role_id: this.selected_data.role_id,
      }

      // var request_id = 0
      // var server_queue_len = 0
      console.log("==============send_data is : ==============",send_data)
      axios.post('https://powerai.cc/user_start_chatgpt_stream', send_data).then(response => {
        // django server返回
        var rtn_dict = response.data;
        // console.log(rtn_dict)
        // console.log(rtn_dict)

        // 调用local gpu的stable diffusion
        console.log("rtn_dict.type: ", rtn_dict.type)
        console.log("rtn_dict.message: ", rtn_dict.message)
        console.log("rtn_dict.content: ", rtn_dict.content)
        if (rtn_dict.type === "pic_string_list") {
          // this.history_messages[this.history_messages.length - 1] = message
          console.log("stable diffsion return: ", rtn_dict.content)
          let content_list = []
          for (let i=0; i<rtn_dict.content.length; i++) {
            // 处理图片
            // 假设img_string已经被正确地处理，即去除了"data:image/png;base64,"
            // var processed_img_str = rtn_dict.content[i].split(",")[1];
            // 创建新图像对象
            // var image = new Image();
            // 设置图像数据源为base64编码后的字符串
            var image_base64string = rtn_dict.content[i];
            image_base64string = 'data:image/png;base64,' + image_base64string;
            // 添加图片
            content_list.push(image_base64string)
            console.log("image[",i,"] string is : ", image_base64string )
          }
          let msg = {
            'role':'assistant',
            'type':'image_object_list',
            'content':content_list,
          }
          // 向界面发送图片string("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIA...")的list
          this.history_messages[this.history_messages.length - 1] = msg
          this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新滚动条*/
            this.$refs.chat_history_scroll.scrollTo({
              top: this.$refs.chat_history_scroll.scrollHeight,
              behavior: 'smooth'
            })
            this.invoking_server = false
          });
        }
        // 调用LLM
        else if (rtn_dict.type === "string") {
          //chatGPT stream started.
          // console.log("stream已经启动.")
          this.sending_task_status["queue_request_id"] = rtn_dict.request_id
          console.log("=======client get request id: =======", rtn_dict.request_id)
          this.sending_task_status["queue_request_len"] = rtn_dict.gpt_queue_len
          // console.log("user requesting with id: ", this.sending_task_status["queue_request_id"], ", server queue len is: ",this.sending_task_status["queue_request_len"])

          // var timer
          //==================================================sleep()函数==================================================
          const sleep=(time)=>{ //模仿python的sleep()函数。（这种实现几乎不占用cpu资源。）
            return new Promise((resolve) => setTimeout(resolve, time));
          }

          //==================================================获取GPT_Queue的申请请求直到完成==================================================
          // this.sending_task_status["queue_started"] = false
          // this.sending_task_status["queue_err"] = false
          // this.sending_task_status["queue_timeout"] = false

          this.sending_task_status = {
            "queue_started":false,
            "queue_err":false,
            "queue_timeout":false,
            "queue_request_id":this.sending_task_status["queue_request_id"],
            "queue_request_len":this.sending_task_status["queue_request_len"],
          }

          const get_gpt_queue = async() => {
          // const get_gpt_queue = async () => {

            // 设置10s的超时
            function time_out_func(ts) {   //闭包函数
              // ts["finished"] = true
              if (ts && "queue_timeout" in ts) {
                ts["queue_timeout"] = true
              }
              // throw new Error('Function timed out after 60 seconds');
            }
            var queue_timer = setTimeout(function () {
              time_out_func(this.sending_task_status)
            }, 10000); // 10秒钟

            // 初始化gpt_queue_timeout
            for (; ;) {
              // 如果gpt_queue_timeout超时，则break
              if (this.sending_task_status["queue_timeout"]) {
                console.log("===============GPT Queue 请求timeout退出.===============");
                const message = {
                  // id: new Date().getTime(),
                  role: 'assistant',
                  content: "GPT请求队列超时，可能目前网络不畅。",
                  type: 'normal_text',
                }
                this.history_messages.push(message)
                this.sending_task_status["queue_err"]=true
                this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新invoking_server*/
                  this.invoking_server = false
                })
                break;
              }

              // 获取gpt_queue的request状态
              let sd = {
                "request_id":this.sending_task_status["queue_request_id"],
              }
              // console.log("============ pulling1 user request status with id: ============", sd.request_id)
              // console.log("============ pulling1 user request status with sending_task_status: ============", this.sending_task_status)
              if ("queue_request_id" in this.sending_task_status) {
                axios.post('https://powerai.cc/user_request_started', sd).then(response => {
                  var rtn_dict = response.data;
                  var request_started = rtn_dict.request_started
                  // console.log("user_request_started returned: ",rtn_dict)
                  if (rtn_dict.type == "error") {
                    console.log("server: user_request_started() returned: ", rtn_dict.content)
                    console.log("client: request_id sent is :", sd.request_id)
                  } else if (request_started) {
                    this.user_check_invoke_times() //调用次数更新

                    this.sending_task_status["queue_started"] = true
                    // console.log("user request(id: '{",this.sending_task_status["queue_request_id"],"}') started.")
                    if (rtn_dict.result.success && (rtn_dict.result.content == "regroup")) {
                      // ===============对话内容tokens数量>4096，已清空记忆、重启话题===============
                      const message = {
                        role: 'assistant',
                        content: "====== 聊天内容>4096 tokens，已清空记忆、重启话题 ======",
                        type: 'normal_text',
                      }
                      this.history_messages[this.history_messages.length - 1] = message
                    } else if (!rtn_dict.result.success && (rtn_dict.result.content == "regroup")) {
                      // ===============对话内容tokens数量>4096，已清空记忆、重启话题===============
                      const message = {
                        role: 'assistant',
                        content: "====== 输入内容>4096，请合理输入 ======",
                        type: 'normal_text',
                      }
                      this.history_messages[this.history_messages.length - 1] = message
                      this.sending_task_status["finished"] = true
                    } else if (!rtn_dict.result.success && (rtn_dict.result.type == "ROLE_NO_AUTHENTICATION")) {
                      const message = {
                        role: 'assistant',
                        content: "用户未开通该角色权限",
                        type: 'normal_text',
                      }
                      this.history_messages[this.history_messages.length - 1] = message
                      this.sending_task_status["finished"] = true
                    } else if (!rtn_dict.result.success && (rtn_dict.result.type == "OPENAI_ERROR")) {
                      const message = {
                        role: 'assistant',
                        content: "openAI服务器错误: \"" + rtn_dict.result.content + "\"",
                        type: 'normal_text',
                      }
                      this.history_messages[this.history_messages.length - 1] = message
                      this.sending_task_status["finished"] = true
                    }
                  }
                }).catch(error => {
                  console.log("===============user_request_started error: ===============", error)
                  const message = {
                    role: 'assistant',
                    content: "网络或服务器错误: \"" + error + "\"",
                    type: 'normal_text',
                  }
                  this.history_messages[this.history_messages.length - 1] = message
                  this.sending_task_status["finished"] = true
                })
              }
              // console.log("pulling2 user request status with id: ", this.sending_task_status["queue_request_id"])

              //=================================================================================================
              // console.log("=======================get_gpt_queue（） finished=======================")

              // 如果gpt_queue的request完成
              if (this.sending_task_status["queue_started"]) {
                // 因为错误或权限问题，之间完成任务
                if (this.sending_task_status["finished"]) {
                  this.invoking_server = false
                  break
                }

                clearTimeout(queue_timer)
                //=========================循环获取stream chunk（每个chunk超时时间20s）=================================
                // const sleep=(time)=>{
                //   return new Promise((resolve) => setTimeout(resolve, time));
                // }
                var stream_text = ""
                var chunck_finished = true
                // var task_finished = false

                // this.sending_task_status["finished"] = false
                // this.sending_task_status["time_out"] = false
                // this.sending_task_status["req_err"] = false
                // this.sending_task_status["queue_request_id"] = null
                this.sending_task_status = {
                  "finished": false,
                  "time_out": false,
                  "req_err": false,
                }

                const get_chunk = async () => {

                  // 设置10s的超时
                  function time_out_func(ts) {   //闭包函数
                    // ts["finished"] = true
                    if (ts && "time_out" in ts) {
                      ts["time_out"] = true
                    }
                    // throw new Error('Function timed out after 60 seconds');
                  }

                  for (; ;) {
                    // ===========每次取chunk都要设置timeout===============
                    var chunk_timer = setTimeout(function () {
                      time_out_func(this.sending_task_status)
                    }, 10000); // 10秒钟
                    // ==================================================
                    var send_data_get_chunk = {
                      user_id: this.user_id,
                      role_id: this.selected_data.role_id,
                    }
                    if (chunck_finished) {
                      chunck_finished = false   //这个变量很关键，防止前一个chunk还没好，又发起新的chunk查询
                      axios.post('https://powerai.cc/user_get_chatgpt_stream_chunk', send_data_get_chunk).then(response => {
                        if (this.sending_task_status["time_out"] || this.sending_task_status["finished"]) {
                          clearTimeout(chunk_timer)   //本次chunk成功获得，取消这个chunk的超时计
                          return
                        }
                        var rtn_dict = response.data;
                        if (rtn_dict.type === "string") {
                          // console.log("stream chunk: ", rtn_dict.message)
                          // console.log("stream dict: ", rtn_dict)
                          stream_text = stream_text + rtn_dict.message
                          const message = {
                            // id: new Date().getTime(),
                            role: 'assistant',
                            content: splitCodeAndText(stream_text),
                            type: 'text_list',
                          }

                          // history_messages.pop()
                          // history_messages.push(message)
                          this.history_messages[this.history_messages.length - 1] = message

                          this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新滚动条*/
                            this.$refs.chat_history_scroll.scrollTo({
                              top: this.$refs.chat_history_scroll.scrollHeight,
                              behavior: 'smooth'
                            })
                          });

                          chunck_finished = true
                          clearTimeout(chunk_timer)   //本次chunk成功获得，取消这个chunk的超时计

                          if (rtn_dict.finish_reason === "stop") {
                            // console.log("stream正常完成.");
                            this.sending_task_status["finished"] = true;
                          }

                        }
                      }).catch(error => {
                        const message = {
                          // id: new Date().getTime(),
                          role: 'assistant',
                          content: error,
                          type: 'normal_text',
                        }

                        // history_messages.pop()
                        this.history_messages.push(message)
                        // history_messages[history_messages.length-1] = message
                        console.log(error)
                        this.sending_task_status["req_err"] = true
                      })
                    }

                    if (this.sending_task_status["time_out"]) {
                      console.log("stream for循环timeout退出.");
                      const message = {
                        // id: new Date().getTime(),
                        role: 'assistant',
                        content: "GPT回复数据流返回超时，可能目前网络不畅。",
                        type: 'normal_text',
                      }
                      this.history_messages.push(message)
                      this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新invoking_server*/
                        this.invoking_server = false
                      })
                      break;
                    }

                    if (this.sending_task_status["finished"]) {
                      // console.log("stream for循环正常退出.");
                      this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新invoking_server*/
                        this.invoking_server = false
                        //============================= web search =============================
                        if (this.access_web) {
                          var sd = {
                            "search_string":this.inputMessage,
                            "results_num":10,
                            "time":"m",   //d w m y，即一天内、一周内、一月内、一年内
                          }
                          console.log("========get_web_search_dict() with para==========:", sd)
                          axios.post('https://powerai.cc/web_search', sd).then(response => {
                            let rtn = response.data
                            if (rtn.success) {
                              let rtn_list = response.data.content
                              // console.log("========web_search_results is============= : ", rtn_list)
                              const message = {
                                // id: new Date().getTime(),
                                role: 'assistant',
                                content: "",
                                type: 'normal_text',
                              }
                              for (let i=0; i<rtn_list.length; i++) {
                                message["content"] += "【"+(i+1).toString() + "】"+ rtn_list[i].title + "\n"
                                message["content"] += rtn_list[i].href + "\n"
                                message["content"] += rtn_list[i].body + "\n"
                              }
                              this.history_messages.push(message)
                              this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新滚动条*/
                                this.$refs.chat_history_scroll.scrollTo({
                                  top: this.$refs.chat_history_scroll.scrollHeight,
                                  behavior: 'smooth'
                                })
                              });

                            }
                          }).catch(error => {
                            console.log("===============web_search() error: ===============", error)
                          })

                          //============================= web search =============================
                        }
                      })
                      break;
                    }

                    // 用于让chunk获取工作继续执行完成（外面的线程会先行完成并退出了），即await chunk任务
                    while (!this.sending_task_status["time_out"] && !chunck_finished && !this.sending_task_status["req_err"]) {
                      await sleep(200)  //sleep 0.2秒 , chatGPT非订阅版，差不多1秒4个字
                    }
                  }
                }
                //=========================循环获取stream chunk（超时20s）=============================================
                get_chunk()
                break
              }

              await sleep(200)  //sleep 0.2秒
            }
          }
          try {
            get_gpt_queue()
          }
          catch (e) {
            console.log("get_gpt_queue() error: ", e)
          }
          if (this.sending_task_status["queue_err"]==true) {  //如果前面GPT_Queue申请失败，这里直接返回
            console.log("gpt_queue_request error.")
            return
          }


        }
        else if (rtn_dict.type==="error") {
          const message = {
            // id: new Date().getTime(),
            role: 'assistant',
            content: "服务器错误: \""+rtn_dict.message+"\"",
            type:'normal_text',
          }

          // this.history_messages.pop()
          // this.history_messages.push(message)
          this.history_messages[this.history_messages.length-1]=message
          // this.messages.push(message)
          this.sending_task_status["finished"] = true

        }
        else {
          const message = {
            // id: new Date().getTime(),
            role: 'assistant',
            content: "未知数据类型。",
            type:'normal_text',
          }

          // this.history_messages.pop()
          this.history_messages[this.history_messages.length-1]=message
          // this.messages.push(message)
          this.sending_task_status["finished"] = true
        }
        //显示server发送信息

      }).catch(error => {
        console.log(error)
      })

      // console.log('django server requested.')
    },
  },
  created () {
    if (vue_life_cycle_debug) {
      console.log('created ()在实例初始化之后调用，经常用于操作数据，发起ajax请求')
    }
  },
  beforeMount () {
    if (vue_life_cycle_debug) {
      console.log('beforeMount ()在挂载开始之前被调用，如果是在服务器端渲染时不被调用；在这个函数里，无法获取元素')
    }
  },
  mounted () {
    // console.log("app.userAvatar is : ", this.userAvatar)
    // this.$refs.SystemSettingWindow.set_user_avatar(this.userAvatar)

    if (vue_life_cycle_debug) {
      console.log('mounted ()在挂载后被调用，也不能在服务器端渲染时被调用；这个函数里，是可以获取元素，并进行操作的')
    }
    // user登录
    console.log("==============Mounted() invoked.==============")
    // 获取到server数据前
    // this.roles = {
    //   "role1": {
    //     nickname: "角色1",
    //     description: "角色1的描述",
    //     role_prompt: "角色1的提示",
    //     active_talk_prompt: "角色1的主动发言提示",
    //   },
    // "role2": {
    //     nickname: "角色2",
    //     description: "角色2的描述",
    //     role_prompt: "角色2的提示",
    //     active_talk_prompt: "角色2的主动发言提示",
    //   },
    //     "role3": {
    //     nickname: "角色3",
    //     description: "角色3的描述",
    //     role_prompt: "角色3的提示",
    //     active_talk_prompt: "角色3的主动发言提示",
    //   },
    //     "role4":{
    //     nickname: "角色4",
    //     description: "角色4的描述",
    //     role_prompt: "角色4的提示",
    //     active_talk_prompt: "角色4的主动发言提示",
    //   },
    //     "role5": {
    //     nickname: "角色5",
    //     description: "角色5的描述",
    //     role_prompt: "角色5的提示",
    //     active_talk_prompt: "角色5的主动发言提示",
    //   },
    // }
    // console.log("before this.roles is : ", this.$refs.user_setting.roles)
    // this.$refs.user_setting.roles = this.roles
    // console.log("before user_setting.roles is : ", this.$refs.user_setting.roles)

    // var sd={}
    // axios.post('https://powerai.cc/get_role_template_list', sd).then(response => {
    //   this.roles = response.data.content
    //   // this.update_role_template_list(response.data)
    //   console.log("roles is : ")
    //   console.log(this.roles)
    // })

    // ============================监听键盘事件: ctrl+enter============================
    // 在这里添加需要执行的代码
    var user_input = document.getElementById("user_input")
    var user_send_button = document.getElementById("user_send_button")
    user_input.addEventListener("keydown", function(event) {
      // 检查是否按下了Ctrl+Enter组合键
      if (event.key === 'Enter' && event.ctrlKey) {
        // 模拟点击按钮
        if (!this.invoking_server) {
          user_send_button.click();
        }
      }
    })
    // console.log('addEventListener() invoked.')
  },
  beforeUpdate () {
    if (vue_life_cycle_debug) {
      console.log('beforeUpdate ()视图层数据更新前调用，发生在虚拟 DOM 打补丁之前。这里适合在更新之前访问现有的 DOM')
    }
  },
  updated () {
    if (vue_life_cycle_debug) {
      console.log('updated ()视图层数据更新后调用')
    }
  },
  beforeUnmount () {
    if (vue_life_cycle_debug) {
      console.log('beforeUnmount ()实例销毁之前调用，在被销毁的组件中进行调用;有一些操作，会在实例已经销毁的时候还在运行，这时候为了性能考虑，就在这里结束哪些操作')
    }
  },
  unmounted () {
    if (vue_life_cycle_debug) {
      console.log('unmounted ()实例销毁后调用。')
    }
  },
//解决思路
//activated和deactivated配合keep-alive标签使用!
  activated () {
    if (vue_life_cycle_debug) {
      console.log('activated ()实例被激活时使用，用于重复激活一个实例的时候')
    }
  },
  deactivated () {
    if (vue_life_cycle_debug) {
      console.log('deactivated ()实例没有被激活时')
    }
  },
//总结：
//keep-alive是Vue的内置组件，能在组件切换过程中将状态保留在内存中，防止重复渲染DOM；导致在组件mounted钩子中调用的刷新页面内容时，这个钩子没有被调用。
//故：使用Vue组件切换过程，执行钩子activated(keep-alive组件激活时调用)，而不是挂载钩子mounted。
}

</script>

<style>
* {                          /*全局设置*/
  /*box-sizing:content-box;    !*总宽度包含内部宽度*!*/
  /*padding-left: 0px;*/
}
/* ========================================= reset.css ========================================= */
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
  /*-webkit-text-size-adjust: 100%;*/
  -webkit-text-size-adjust: none;
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure,
footer, header, hgroup, menu, nav, section {
  display: block;
}
body {
  line-height: 1.5;
}
ol, ul {
  list-style: none;
}
blockquote, q {
  quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
  content: '';
  content: none;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
}
/* ========================================= reset.css ========================================= */

/*@media screen and (-webkit-min-device-pixel-ratio:0) {  !*解决高分辨率屏幕下字体过小的问题。*!*/
/*  html{font-size:17.33px !important;}*/
/*}*/

/*body {*/
/*  margin: 0px;        !*这个很关键，否则这个div右边超出屏幕宽度*!*/
/*  padding:0px;*/
/*  !*background-color: white;*!*/
/*  !*border: 0px;*!*/
/*}*/
.chat-container {
  display: flex;
  justify-content: center;
  align-items: center;
  /*flex-direction: column-reverse;     !*容器内部对象的排列方向：纵向、从下往上*!*/
  position:fixed;

  margin: 0px;        /*这个很关键，否则这个div右边超出屏幕宽度*/
  padding:0px;
  border: 0px;
  width: 100%;

  height: 100%;

  font-size:10px;
}
.chat-history {
  /*flex: 1;    !*flex：1即为flex-grow：1，经常用作自适应布局，将父容器的display：flex，侧边栏大小固定后，将内容区flex：1，内容区则会自动放大占满剩余空间。*!*/
  overflow-y: auto;   /*y轴滚动，且自动隐藏滚动条*/

  margin-top: 0px;

  margin-left: 0px;
  padding-left: 0px;
  width:100%;
  padding-right: 0px;
  margin-right: 0px;

  margin-bottom: 0px;

  padding-top: 0px;
  padding-bottom: 0px;

  /*background-color: #007acc;*/

  border-style: solid;      /*这个很关键，否则这个div右边超出屏幕宽度*/
  border: 0px;               /*这个很关键，否则这个div右边超出屏幕宽度*/
  border-radius: 0px;
  border-color: #42b983;

  position:fixed;           /*这个很关键，用于支撑固定大小、位置*/
  top:10px;
  bottom: 140px;

}
.chat-input {
  display: flex;
  align-items: center;
  margin: 0px;

  padding-left: 10px;
  padding-bottom: 0px;
  /*background-color:#42b983;*/
  bottom:0px;  /*让输入区底部贴边*/
  left:0;     /*让输入区左边贴边*/
  right:0;    /*让输入区右边贴边*/

  border-style: solid;      /*这个很关键，否则这个div右边超出屏幕宽度*/
  border: 0px;               /*这个很关键，否则这个div右边超出屏幕宽度*/
  border-radius: 0px;
  border-color: #42b983;

  background-color: #ffffff;
  /*background-color: rgba(ff,ff,ff,0.0);*/
  /*opacity: 0.5;*/

  position:fixed;            /*这个很关键，用于支撑固定大小、位置*/
  height: 100px;
  /*width: 100%;*/
}
.chat-input input {
  /*flex: 1;*/
  /*padding: 10px;*/
  /*border: 5px;*/
  /*border-radius: 5px;*/
  /*margin-left: 20px;*/
  /*margin-right: 10px;*/
}
.chat-input button {
  background-color: #007acc;
  color: #fff;
  border: none;
  border-radius: 5px;
  margin: 15px;
  padding: 5px;
  cursor: pointer;
  width:80px;
}

.chat-input button[disabled] {
  opacity: 0.5; /* 或者其他小于1但大于0的值 */
}

.message {
  display: flex;
  align-items: flex-end;
  margin-bottom: 20px;
}
.server-message-avatar {
  margin-left: 20px;
  width: 40px;
  height: 40px;
}
.user-message-avatar {
  margin-right: 20px;
  width: 40px;
  height: 40px;
}
.avatar-image {
  max-width:32px;
  /*width:expression(this.width>50?"50px":this.width);*/
  max-height:48px;
  /*height:expression(this.height>80?"80px":this.height);*/
  border-radius: 3px;
}
.server-message-bubble {
  background-color: #ffffff;
  /*background-color: #eee;*/
  box-shadow: 25px 15px 60px 0px #e8e8e8;

  /*box-shadow: 2px;*/
  padding: 10px;
  border-radius: 10px;
  max-width: 70%;
  white-space: normal;    /*正常的中文、英文句子自动换行*/
  word-break: break-all;  /*连续数字、英文都自动换行*/

  display: flex;
  flex-direction: column; /*=============这是不让子元素横过来的关键==============*/
  flex-wrap: wrap;        /*防止文字溢出div*/

  text-align: left;

  /*padding:0px;*/
  /*border: 0px;*/

}

.user-message-bubble {
  background-color: #f0fff0;
  box-shadow: 25px 15px 60px 0px #e8e8e8;

  padding: 10px;
  border-radius: 10px;
  max-width: 70%;
  white-space: normal;    /*正常的中文、英文句子自动换行*/
  word-break: break-all;  /*连续数字、英文都自动换行*/

  display: flex;
  flex-wrap: wrap;        /*防止文字溢出div*/

  text-align: left;
}
.user-message {
  justify-content: flex-end;
  text-align: right;
}
.server-message {
  justify-content: flex-start;
  text-align: left;
}
.user-send-textarea {
  width:100%;     /*自动占满所属的div*/
  height:80px;
  resize:none;    /*textarea禁止调整大小*/

  border-style:solid;      /*这个很关键，否则这个div右边超出屏幕宽度*/
  border: 0px;
  border-radius: 5px;
  padding: 0px;

  background-color: #f4f4f4;
  font-size:16px;
}
.loading-gif {
  position: relative;
  width:20px;
  height:36%;
}

.all-buttons {
  margin-left: 10px;
  margin-right: 10px;
  margin-top: 0px;
  margin-bottom: 0px;

  /*justify-content: center;*/
  /*background-color: #ff5454;*/
  display: flex;
  flex-direction: row;
  /*justify-content: center;*/
  /*width:100px;*/
}

.cancel-and-reinput {
  display: flex;
  flex-direction: column;
}

.cancel-button button {
  margin: 5px;
  padding: 2px;
  width:30px;
  /*justify-content: center;*/
  font-size: 12px;

  color:black;

  border-radius: 3px;
  background: linear-gradient(145deg, #e6e6e6, #ffffff);
  box-shadow:  4px 4px 9px #e0e0e0,
  -4px -4px 9px #ffffff;

}

.delete-button button {
  margin: 5px;
  padding: 2px;
  width:30px;
  /*justify-content: center;*/
  font-size: 12px;

  color:black;

  border-radius: 3px;
  background: linear-gradient(145deg, #e6e6e6, #ffffff);
  box-shadow:  4px 4px 9px #e0e0e0,
  -4px -4px 9px #ffffff;

}

.reinput-button button {
  margin: 5px;
  padding: 2px;
  width:30px;
  font-size: 12px;
  /*justify-content: center;*/

  color:black;

  border-radius: 3px;
  background: linear-gradient(145deg, #e6e6e6, #ffffff);
  box-shadow:  4px 4px 9px #e0e0e0,
  -4px -4px 9px #ffffff;

}

.send-button button {
  margin: 5px;
  padding: 0px;
  width:50px;
  height:80px;
  font-size:16px;

  color:black;

  border-radius: 5px;
  background: linear-gradient(145deg, #e6e6e6, #ffffff);
  box-shadow:  4px 4px 9px #e0e0e0,
  -4px -4px 9px #ffffff;
  /*justify-content: center;*/
}

.send-button-invokes-text {
  font-size:12px;
  color: #777777;
}

.send-checkbox {
  font-family: 'Courier New', Courier, monospace;
  font-size:12px;
  display: flex;
  justify-content: center;
}

。server-text-list{  /*div v-for增加css好像没用，必须纯div才有用*/
  /*display: flex;*/
  /*flex-direction: column;*/
  /*justify-content: left;*/
  /*width:100%;*/
}
.server-text-block{
  /*width:100%;*/
}

/*用于帮login窗口盖住下面的遮罩*/
.overlay {
  position: fixed;
  left: 0;
  right: 0;
  /*width: 100%;*/
  /*height: 100%;*/
  top: 1px;  /*防止iphone刘海位置变灰色后，无法变回白色*/
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  /*background-color: rgba(0, 128, 0, 0.5);*/
  z-index: 10000;
}
.overlay_transition-enter-active,
.overlay_transition-leave-active {
  transition: transform 0.3s;
}

.overlay_transition-enter-from,
.overlay_transition-leave-to {
  transform: translateX(-100%);
}

/*.video_player {*/
/*  !*position: fixed;*!*/
/*  !*left:0;*!*/
/*  !*top:0;*!*/
/*  !*margin: auto;*!*/
/*}*/

.slide1-enter-active,
.slide1-leave-active {
  transition: all 0.3s ease;
}
.slide1-enter-from,
.slide1-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.slide2-enter-active,
.slide2-leave-active {
  transition: all 0.3s ease;
}
.slide2-enter-from,
.slide2-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.attributes_window_transition {
  padding:0;
  margin:0;
}

.access_web_container {
  display: flex;
  flex-direction: row;

  position: fixed;
  bottom: 105px;
  right:78px;
  z-index:900;
}

input[type="range"].range_input_access_web {
  width:30px;
  /*margin:5px;*/
  margin-right: 3px;
  align-items: center
}

.text_access_web {
  /*color:red;*/
  font-size: 12px;
  align-items: center
  /*padding:5px;*/
}

</style>

<!--用vue3 写一个和上面你回复我代码窗口完全一样的窗口的组件（组件名叫code-window），要支持js、python、html、css这几种代码的高亮显示，窗口内的文本要能被鼠标选中并高亮显示，窗口右上角也有可以复制代码的按钮，鼠标悬浮在按钮上时光标要变成手指指向的光标，点击本按钮后窗口内文本被复制到剪贴板且按钮文本显示为”copyed!“持续3秒后变回原有文本，按钮是平的没有突起且按钮文字的字体和大小和你一样，左上角有代码类型且字体和你一样，窗口要有暗色和明亮2种风格主题且为和你窗口一样的圆角。-->