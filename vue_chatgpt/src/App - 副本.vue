<template>
  <div class="chat-container">
<!--    <UserSetting ref="user_setting" :roles="roles" :selectedRole="selectedRole">-->
<!--    <LoginForm></LoginForm>-->
    <UserSetting ref="user_setting" :roles="roles" :selectedRole="selectedRole" v-model:rolePrompt="rolePrompt" v-model:roleActivePrompt="roleActivePrompt"/>
    <div class="chat-history" ref="chat_history_scroll">
      <div v-for="(message, index) in history_messages" :key="message.id">
        <!----------------------------user的信息---------------------------->
        <div v-if="message.from === 'user'" class="message user-message">
          <div class="user-message-bubble">
            <CodeIndent :code="message.content"/>
          </div>
          <div class="user-message-avatar"><img :src="userAvatar" alt="User Avatar" class="avatar-image"></div>
        </div>
        <!----------------------------user的信息---------------------------->

        <!----------------------------server的信息---------------------------->
        <div v-else-if="message.from === 'server'" class="message server-message">
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
                <CodeIndent :code="text_dict.value"/>
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
      <textarea id="user_input" type="text" v-model="inputMessage" placeholder="Type your message here..." class="user-send-textarea" ref="send_textarea" autofocus></textarea>
      <div class="all-buttons">
        <div class="cancel-and-reinput">
          <div class="cancel-button">
            <button id="cancel_button" v-bind:disabled="!invoking_server" @click="cancelMessage">取消</button>
          </div>
          <div class="reinput-button">
            <button id="reinpu_button"  @click="reinput">重填</button>
          </div>
        </div>
        <div class="send-button">
          <button id="user_send_button" v-bind:disabled="invoking_server" @click="sendMessage">发送</button>
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

var vue_life_cycle_debug = false

// var local_test = false
import axios from 'axios';

import {splitCodeAndText} from './utils';
import UserSetting from './components/UserSetting.vue';
// import LoginForm from './components/login-window.vue'

import { ref, reactive, onMounted } from 'vue'

export default {
  //vue生命周期
  beforeCreate () {
    if (vue_life_cycle_debug) {
      console.log('beforeCreate ()在实例初始化之前调用')
    }
  },
  setup() {
    const my_data = reactive({
      history_messages:[],
      roles : ref({
        "default_role": {
          nickname: "角色1",
          description: "角色1的描述",
          role_prompt: "角色1的提示",
          active_talk_prompt: "角色1的主动发言提示",
        },
        "role2": {
          nickname: "角色2",
          description: "角色2的描述",
          role_prompt: "角色2的提示",
          active_talk_prompt: "角色2的主动发言提示",
        },
        "role3": {
          nickname: "角色3",
          description: "角色3的描述",
          role_prompt: "角色3的提示",
          active_talk_prompt: "角色3的主动发言提示",
        },
        "role4": {
          nickname: "角色4",
          description: "角色4的描述",
          role_prompt: "角色4的提示",
          active_talk_prompt: "角色4的主动发言提示",
        },
        "role5": {
          nickname: "角色5",
          description: "角色5的描述",
          role_prompt: "角色5的提示",
          active_talk_prompt: "角色5的主动发言提示",
        },
      }),
      user_id : "jack.seaver@163.com",
      role_id : "DAN",
    })
    onMounted(() => {
      // user登录
      console.log("onMounted() invoked.")
      console.log("user_id is: ", my_data.user_id)
      var sender_data = {
        "user_id": my_data.user_id
      }
      console.log("start user login.")
      try {
        axios.post('https://powerai.cc/user_login', sender_data).then(response => {
          my_data.roles = response.data.content
          console.log("this.roles get from server is : ", my_data.roles)

          console.log("start get user chat_list.")
          try {
            var sd = {
              "user_id": my_data.user_id,
              "role_id": my_data.role_id,
            }
            axios.post('https://powerai.cc/user_get_chat_list', sd).then(response => {
              my_data.history_messages = response.data
              console.log("this.history_messages get from server is : ", my_data.history_messages)
            })
          }
          catch (e) {
            console.log("user login error: ", e)
          }

        })
      }
      catch (e) {
        console.log("user login error: ", e)
      }
    });

    return {
      my_data,
    }
  },
  data() {
    console.log('data() invoked.')
    return {
       history_messages : this.my_data.history_messages,
       user_id : this.my_data.user_id,
       role_id : this.my_data.role_id,
       roles : this.my_data.roles,

       inputMessage : ref(''),
       userAvatar : ref(require('./assets/images/user-s.jpg')),  //必须这样引用，才能被正确打包到dist中
       serverAvatar : ref(require('./assets/images/server-s.jpg')),

       invoking_server : false,
       send_button_disabled : false,
       loading_gif_show : true,
       loading_gif_url : ref(require('./assets/images/loading6-s.gif')),

       chat_has_memory : false,


       selectedRole : ref("default_role"),
       rolePrompt : ref(""),
       roleActivePrompt : ref(""),
     }
  },
  components: {
    CodeIndent,
    CodeWindow,
    UserSetting,
    // LoginForm,
    // RoleTemplate,
  },
  computed: {
  },
  methods: {
    reinput() {
      this.inputMessage = ""
      this.$refs.send_textarea.focus()
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
        id: new Date().getTime(),
        from: 'user',
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
        id: new Date().getTime(),
        from: 'server',
        content: "",
        type:'normal_text',
      }
      this.history_messages.push(server_pre_message)
      this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新滚动条*/
        this.$refs.chat_history_scroll.scrollTo({top:this.$refs.chat_history_scroll.scrollHeight, behavior:'smooth'})
        // 请求期间，显示loading_gif
        this.loading_gif_show = true
      });

      console.log('start requesting django server.')
      var send_data = {
        data: this.inputMessage.trim(),
        user_id: this.user_id,
        role_id: this.role_id,
      }


      axios.post('https://powerai.cc/user_start_chatgpt_stream', send_data).then(response => {
        // django server返回
        var rtn_dict = response.data;
        // console.log(rtn_dict)
        console.log(rtn_dict)
        if (rtn_dict.type === "string") {
          //chatGPT stream started.
          console.log("stream已经启动.")

          var stream_text = ""
          var chunck_finished = true
          // var task_finished = false
          var task_status = {
            "finished":false,
            "time_out":false,
            "req_err":false,
          }
          var timer

          const sleep=(time)=>{
            return new Promise((resolve) => setTimeout(resolve, time));
          }

          //==================================================循环获取stream chunk（每个chunk超时时间20s）==================================================
          const get_chunk = async () =>{
            function time_out_func(ts) {   //闭包函数
              // ts["finished"] = true
              ts["time_out"] = true
              // throw new Error('Function timed out after 60 seconds');
            }
            for(;;) {
              // ===========每次取chunk都要设置timeout===============
              timer = setTimeout(function() {
                time_out_func(task_status)
              }, 10000); // 20秒钟
              // ==================================================
              var send_data_get_chunk={
                user_id: this.user_id,
                role_id: this.role_id,
              }
              if (chunck_finished) {
                chunck_finished = false   //这个变量很关键，防止前一个chunk还没好，又发起新的chunk查询
                axios.post('https://powerai.cc/user_get_chatgpt_stream_chunk', send_data_get_chunk).then(response => {
                  if (task_status["time_out"] || task_status["finished"] ) {
                    return
                  }
                  var rtn_dict = response.data;
                  if (rtn_dict.type === "string") {
                    console.log("stream chunk: ", rtn_dict.message)
                    console.log("stream dict: ", rtn_dict)
                    stream_text = stream_text + rtn_dict.message
                    const message = {
                      id: new Date().getTime(),
                      from: 'server',
                      content: splitCodeAndText(stream_text),
                      type: 'text_list',
                    }

                    // history_messages.pop()
                    // history_messages.push(message)
                    this.history_messages[this.history_messages.length - 1] = message

                    this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新滚动条*/
                      this.$refs.chat_history_scroll.scrollTo({top: this.$refs.chat_history_scroll.scrollHeight,behavior: 'smooth'})
                    });

                    chunck_finished = true
                    clearTimeout(timer)   //本次chunk成功获得，取消这个chunk的超时计

                    if (rtn_dict.finish_reason === "stop") {
                      console.log("stream正常完成.");
                      task_status["finished"] = true;
                    }

                  }
                }).catch(error => {
                  const message = {
                    id: new Date().getTime(),
                    from: 'server',
                    content: error,
                    type: 'normal_text',
                  }

                  // history_messages.pop()
                  this.history_messages.push(message)
                  // history_messages[history_messages.length-1] = message
                  console.log(error)
                  task_status["req_err"] = true
                })
              }

              if (task_status["time_out"]) {
                console.log("stream for循环timeout退出.");
                const message = {
                  id: new Date().getTime(),
                  from: 'server',
                  content: "请求超时。",
                  type: 'normal_text',
                }
                this.history_messages.push(message)
                this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新invoking_server*/
                  this.invoking_server = false
                })
                break;
              }

              if (task_status["finished"]) {
                console.log("stream for循环正常退出.");
                this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新invoking_server*/
                  this.invoking_server = false
                })
                break;
              }

              while(!task_status["time_out"] && !chunck_finished && !task_status["req_err"]) {
                await sleep(200)  //sleep 0.2秒 , chatGPT非订阅版，差不多1秒4个字
              }
            }
          }
          //==================================================循环获取stream chunk（超时20s）==================================================
          get_chunk()


        }
        else if (rtn_dict.type==="error") {
          const message = {
            id: new Date().getTime(),
            from: 'server',
            content: "出错啦("+rtn_dict.message+")。",
            type:'normal_text',
          }

          // this.history_messages.pop()
          this.history_messages.push(message)
          // this.history_messages[this.history_messages.length-1]=message
          // this.messages.push(message)
        }
        else {
          const message = {
            id: new Date().getTime(),
            from: 'server',
            content: "未知数据类型。",
            type:'normal_text',
          }

          // this.history_messages.pop()
          this.history_messages.push(message)
          // this.history_messages[this.history_messages.length-1]=message
        }
        //显示server发送信息

      }).catch(error => {
        console.log(error)
      })

      console.log('django server requested.')
    },

    // sendMessage1() {
    //   // 马上disable这个按钮
    //   this.send_button_disabled = true
    //   // 马上disable这个按钮
    //
    //   //=============================显示user发送信息=============================
    //   const message = {
    //     id: new Date().getTime(),
    //     from: 'user',
    //     content: this.inputMessage.trim(),
    //     // content: this.inputMessage.trim().replace(/\n/g, '<br>')    //必须先trim后替换回车，否则末尾回车去不掉
    //     type:'normal_text',
    //   }
    //   this.history_messages.push(message)
    //   this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新滚动条*/
    //     this.$refs.chat_history_scroll.scrollTo({top:this.$refs.chat_history_scroll.scrollHeight, behavior:'smooth'})
    //   });
    //
    //
    //   // ========================================================远程调用================================================
    //   if (!local_test) {
    //     //=============================预先显示server信息框（等待获取数据填充）=============================
    //     var server_pre_message = {
    //       id: new Date().getTime(),
    //       from: 'server',
    //       content: "",
    //       type:'normal_text',
    //     }
    //     this.history_messages.push(server_pre_message)
    //     this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新滚动条*/
    //       this.$refs.chat_history_scroll.scrollTo({top:this.$refs.chat_history_scroll.scrollHeight, behavior:'smooth'})
    //       // 请求期间，显示loading_gif
    //       this.loading_gif_show = true
    //     });
    //
    //     console.log('start requesting django server.')
    //     // var instance = axios.create({ headers: {'content-type': 'application/json'} });
    //     // 发送到django server
    //     var send_data = {data: this.inputMessage.trim()}
    //     console.log(send_data)
    //
    //
    //     axios.post('https://powerai.cc/chatgpt_sync', send_data).then(response => {
    //       // django server返回
    //       var rtn_dict = response.data;
    //       // console.log(rtn_dict)
    //       console.log(rtn_dict)
    //       if (rtn_dict.type==="string") {
    //         const message = {
    //           id: new Date().getTime(),
    //           from: 'server',
    //           content: splitCodeAndText(rtn_dict.message),    //将server答复中的代码切开，返回dict的list:[{"type":"normal_text","value":" this is the code i give you:"},{"type":"python","value":"def print_f():// return"}]
    //           // content: rtn_dict.message,    //必须先trim后替换回车，否则末尾回车去不掉
    //           type:'text_list',
    //         }
    //         this.history_messages[this.history_messages.length-1]=message
    //       }
    //       else if (rtn_dict.type==="image_url_list") {
    //         var img_content=""
    //         for (var i=0; i<rtn_dict.message.length; i++){
    //           img_content = img_content + "<img src=\"" + rtn_dict.message[i] + "\" style=\"width:50%;\"/>"
    //         }
    //         const message = {
    //           id: new Date().getTime(),
    //           from: 'server',
    //           content: img_content,   //必须先trim后替换回车，否则末尾回车去不掉
    //           type:'image_url',
    //         }
    //         // this.messages.push(message)
    //         this.history_messages[this.history_messages.length-1]=message
    //       }
    //       else if (rtn_dict.type==="error") {
    //         const message = {
    //           id: new Date().getTime(),
    //           from: 'server',
    //           content: "出错啦("+rtn_dict.message+")。",
    //           type:'normal_text',
    //         }
    //         this.history_messages[this.history_messages.length-1]=message
    //         // this.messages.push(message)
    //       }
    //       else {
    //         const message = {
    //           id: new Date().getTime(),
    //           from: 'server',
    //           content: "未知数据类型。",
    //           type:'normal_text',
    //         }
    //         this.history_messages[this.history_messages.length-1]=message
    //       }
    //       //显示server发送信息
    //
    //       this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新滚动条*/
    //         this.$refs.chat_history_scroll.scrollTo({top: this.$refs.chat_history_scroll.scrollHeight,behavior: 'smooth'})
    //         //成功收到信息，才激活button
    //         this.send_button_disabled = false
    //         // 关闭loading_gif
    //         this.loading_gif_show = false
    //       });
    //
    //     }).catch(error => {
    //       console.log(error)
    //     })
    //   }
    //   console.log('django server requested.')
    //   // ========================================================远程调用================================================
    //
    //   // ========================================================本地测试================================================
    //   if (local_test) {
    //     console.log("text_list is : ", splitCodeAndText(this.inputMessage.trim()))
    //     const message1 = {
    //       id: new Date().getTime(),
    //       from: 'server',
    //       // content: "    formattedCode() {\n" +
    //       //     "      const codeLines = this.code.trim().split('\\n');\n" +
    //       //     "      const indentLevel = /^\\s*/.exec(codeLines[0])[0].length;\n" +
    //       //     "      const indentedCode = codeLines.map((line) => line.slice(indentLevel)).join('\\n');\n" +
    //       //     "      return this.escapeHTML(indentedCode);\n" +
    //       //     "    },",
    //       content: splitCodeAndText(this.inputMessage.trim()),
    //       // content: this.inputMessage.trim(),
    //       // content: this.inputMessage.trim().replace(/\n/g, '<br>')    //必须先trim后替换回车，否则末尾回车去不掉
    //       // type:'code',
    //       type:'text_list',
    //     }
    //     this.history_messages.push(message1)
    //
    //     // =======调用codemirror=======
    //     // this.codemirror()
    //     // =======调用codemirror=======
    //
    //     this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新滚动条*/
    //       // var container = this.$refs.chat_history_scroll;
    //       this.$refs.chat_history_scroll.scrollTo({
    //         top: this.$refs.chat_history_scroll.scrollHeight,
    //         behavior: 'smooth'
    //       })
    //     });
    //     // this.$refs.chat_history_scroll.scrollTo({top:this.$refs.chat_history_scroll.scrollHeight, behavior:'smooth'})
    //     this.send_button_disabled = false
    //   }
    //   // ========================================================本地测试================================================
    // },
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
    if (vue_life_cycle_debug) {
      console.log('mounted ()在挂载后被调用，也不能在服务器端渲染时被调用；这个函数里，是可以获取元素，并进行操作的')
    }

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
        user_send_button.click();
      }
    })
    console.log('addEventListener() invoked.')
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
body {
  margin: 0px;        /*这个很关键，否则这个div右边超出屏幕宽度*/
  padding:0px;
  /*border: 0px;*/
}
.chat-container {
  /*display: flex;*/
  /*flex-direction: column-reverse;     !*容器内部对象的排列方向：纵向、从下往上*!*/
  position:fixed;

  margin: 0px;        /*这个很关键，否则这个div右边超出屏幕宽度*/
  padding:0px;
  border: 0px;
  width: 100%;

  height: 100%;
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
  bottom: 130px;

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
  background-color: grey;
  color: white;
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
  font-size: 8px;
}

.reinput-button button {
  margin: 5px;
  padding: 2px;
  width:30px;
  font-size: 8px;
  /*justify-content: center;*/
}

.send-button button {
  margin: 5px;
  padding: 0px;
  width:50px;
  height:80px;
  font-size:16px;
  /*justify-content: center;*/
}

.send-checkbox {
  font-family: 'Courier New', Courier, monospace;
  font-size:8px;
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

</style>

<!--用vue3 写一个和上面你回复我代码窗口完全一样的窗口的组件（组件名叫code-window），要支持js、python、html、css这几种代码的高亮显示，窗口内的文本要能被鼠标选中并高亮显示，窗口右上角也有可以复制代码的按钮，鼠标悬浮在按钮上时光标要变成手指指向的光标，点击本按钮后窗口内文本被复制到剪贴板且按钮文本显示为”copyed!“持续3秒后变回原有文本，按钮是平的没有突起且按钮文字的字体和大小和你一样，左上角有代码类型且字体和你一样，窗口要有暗色和明亮2种风格主题且为和你窗口一样的圆角。-->