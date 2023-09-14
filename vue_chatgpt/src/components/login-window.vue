<template>
  <transition name="fly">
<!--    <div class="login-window">-->
    <div v-if="showLoginWindow" class="login-window">
        <div class="email-group">
          <label for="email">邮箱</label>
          <input type="email" id="email" ref="emailInput" v-model="email" @change="on_input_change" required />
<!--          <input type="email" id="email" v-model="email" ref="emailInput" required />-->
        </div>

        <div class="input-group">
          <label for="password">密码</label>
          <input type="password" id="password" v-model="password" required />
        </div>

        <button id="button" @click="on_login_click" v-bind:disabled="is_logining">登录/注册</button>
<!--        <button type="submit">登录/注册</button>-->
<!--      </form>-->

        <div class="login-info">
          <p>{{login_info}}</p>
        </div>

      <transition name="fly">
        <div v-if="showEmailVerification" class="email-verification">
          <label for="verification-code">验证码</label>
          <input type="text" id="verification-code" v-model="verificationCode" maxlength="6" required />
          <button @click="verifyEmail">验证</button>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
import axios from "axios";
import {splitCodeAndText} from "@/utils";

export default {
  name: "LoginWindow",
  data() {
    return {
      email: "",
      password: "",
      verificationCode: "",
      showLoginWindow: false,
      showEmailVerification: false,
      login_info: "",
      is_logining: false,
    };
  },
  mounted() {
    var sd = {
      "user_id": this.email,
      "password": this.password,
    }
    axios.post('https://powerai.cc/db_user_has_logined', sd).then(response => {
      var user_id = response.data.content
      var success = response.data.success
      console.log("===========db_user_has_logined()===========: ", user_id)
      // console.log("showLoginWindow(): ", this.showLoginWindow)
      if (!success) {
        setTimeout(() => {
          this.showLoginWindow = true;
          this.$parent.login_show_modal = true;

          // ============================监听键盘事件: enter============================
          // 在这里添加需要执行的代码
          // var button = document.getElementById("button")
          // button.addEventListener("keydown", function(event) {
          //   // 检查是否按下了Ctrl+Enter组合键
          //   if (event.key === 'Enter') {
          //     // 模拟点击按钮
          //     button.click();
          //   }
          // })
          // console.log('addEventListener() invoked.')

          // this.$refs.emailInput.focus();
        }, 300);
      }
      else {
        // 用户已经成功登录，处于会话状态中================
        this.$parent.user_id = user_id
        // console.log("logined username is: ", user_id)

        // console.log("user_id try to login is: ", user_id)
        var sender_data = {
          "user_id": user_id
        }
        try {
          axios.post('https://powerai.cc/user_login', sender_data).then(response => {
            this.$parent.roles = response.data.content
            console.log("===========user_login()===========: ", user_id)
            // console.log("this.roles get from server is : ", this.$parent.roles)

            // console.log("start get user chat_list.")
            try {

              // 获取user及其所含role数据
              var sd = {
                "user_id": user_id,
              }
              axios.post('https://powerai.cc/db_get_server_user_config', sd).then(response => {
                this.$parent.db_user_config = response.data.content
                console.log("===========db_get_server_user_config()===========: ",response.data.content)
              }).catch(error => {
                console.log("===============db_get_server_user_config error: ===============", error)
              })

              axios.post('https://powerai.cc/db_get_server_role_config', sd).then(response => {
                this.$parent.db_role_config = response.data.content
                console.log("===========db_get_server_role_config()===========: ",response.data.content)
              }).catch(error => {
                console.log("===============db_get_server_role_config error: ===============", error)
              })

              axios.post('https://powerai.cc/db_get_user_and_roles', sd).then(response => {
                var data = response.data
                // var content = data.content
                console.log("===========db_get_user_and_roles() returned with data===========: ", data.content)
                // console.log(`${this.$parent.user_id}'s db_get_user_and_roles() returned with data: ${data}`)
                this.$parent.db_user_data = data.content.user
                this.update_avatar_with_gender(this.$parent.db_user_data.gender)

                this.$parent.db_roles_data = data.content.roles
                this.$parent.db_roles_data.unshift({role_id: "foo_button", nickname: "默认" , description:"n/a", prompt:"n/a"})
                // 将user的api_key放入API_role的prompt
                for (let i=0; i<this.$parent.db_roles_data.length; i++) {
                  if (this.$parent.db_roles_data[i].role_id=="API_role") {
                    this.$parent.db_roles_data[i].prompt = "api_key: "+"'"+this.$parent.db_user_data.user_api_key+"'"
                  }
                }

                this.$parent.current_vip = data.content.user.current_vip_type
                this.$parent.current_role = data.content.user.current_role_id
                // 主按钮显示user当下的vip_type
                for (let i = 0; i < this.$parent.vip_data.length; i++) {
                  if (this.$parent.vip_data[i].role_id==this.$parent.current_vip) {
                    this.$parent.vip_data[0] = this.$parent.vip_data[i]
                    // console.log("=======current_vip roles[0] changed to roles["+i+"].")
                  }
                }
                // 主按钮显示user当下的role
                for (let i = 0; i < this.$parent.db_roles_data.length; i++) {
                  if (this.$parent.db_roles_data[i].role_id==this.$parent.current_role) {
                    this.$parent.db_roles_data[0] = this.$parent.db_roles_data[i]
                    // console.log("=======current_role roles[0] changed to roles["+i+"].")
                  }
                }
                console.log("=========current vip type is:=========", this.$parent.current_vip)
                console.log("=========current role is:=========", this.$parent.current_role)
                this.$parent.selected_data.role_id = this.$parent.current_role

                // 获取历史user_chat_list
                sd = {
                  "user_id": user_id,
                  "role_id": this.$parent.current_role,
                  // "role_id": this.$parent.selected_data.role_id,
                }
                axios.post('https://powerai.cc/user_get_chat_list', sd).then(response => {
                  this.$parent.user_check_invoke_times()

                  // 获取数据
                  this.$parent.history_messages = response.data
                  // console.log("this.history_messages get from server is : ", this.$parent.history_messages)
                  // 格式化（将代码区分出来）
                  for(let i = 0; i < this.$parent.history_messages.length; i++){
                    var chat = this.$parent.history_messages[i]
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
                  // console.log("this.history_messages formated is : ", this.$parent.history_messages)
                  // console.log(proxy)
                  // 这里让this.history_messages刷新，通过proxy调用
                  // proxy.history_messages = my_data.history_messages
                  this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新滚动条*/
                    this.$parent.$refs.chat_history_scroll.scrollTo({top: this.$parent.$refs.chat_history_scroll.scrollHeight,behavior: 'smooth'})
                  });
                })

              })

              //   // 获取历史user_chat_list
              // sd = {
              //   "user_id": user_id,
              //   "role_id": this.$parent.current_role,
              //   // "role_id": this.$parent.selected_data.role_id,
              // }
              // axios.post('https://powerai.cc/user_get_chat_list', sd).then(response => {
              //   // 获取数据
              //   this.$parent.history_messages = response.data
              //   console.log("this.history_messages get from server is : ", this.$parent.history_messages)
              //   // 格式化（将代码区分出来）
              //   for(let i = 0; i < this.$parent.history_messages.length; i++){
              //     var chat = this.$parent.history_messages[i]
              //     var text_list = splitCodeAndText(chat["content"])
              //     // 如果文本包含代码块，则改为list，类型变为text_list
              //     if (text_list.length>1) {
              //       chat["content"]=text_list
              //       chat["type"]="text_list"
              //     }
              //     else {
              //       chat["content"]=text_list[0].value
              //       chat["type"]="normal_text"
              //     }
              //   }
              //   console.log("this.history_messages formated is : ", this.$parent.history_messages)
              //   // console.log(proxy)
              //   // 这里让this.history_messages刷新，通过proxy调用
              //   // proxy.history_messages = my_data.history_messages
              //   this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新滚动条*/
              //     this.$parent.$refs.chat_history_scroll.scrollTo({top: this.$parent.$refs.chat_history_scroll.scrollHeight,behavior: 'smooth'})
              //   });
              // })
            }
            catch (e) {
              console.log("user login error: ", e)
            }

          })
        }
        catch (e) {
          console.log("user login error: ", e)
        }

      }
    })
  },
  props:{
    // email_string:{
    //   type: String,
    //   default: "",
    // },
    // showModal:{
    //   type: Boolean,
    //   default: false,
    // },
  },
  methods: {
    update_avatar_with_gender(in_gender) {
      var role_id = this.$parent.db_user_data.current_role_id
      if (in_gender=="男") {
        // console.log("user is a male.")
        this.$parent.userAvatar = this.$parent.avatar_male
        this.$parent.serverAvatar = this.$parent.avatar_females[role_id]
      } else {
        // console.log("user is a female.")
        this.$parent.userAvatar = this.$parent.avatar_female
        this.$parent.serverAvatar = this.$parent.avatar_males[role_id]
      }
    },
    on_input_change(event) {
      var value = event.target.value
      // this.$parent.user_id = value
      console.log("changed value :", value)
      // console.log("email is :", this.email_string)
      // console.log("user_id is :", this.$parent.user_id)
    },
    on_login_click() {
      // this.$parent.user_id =

      //=============================该函数专门用于测试服务器的调用=============================
      // var sd = {
      //   "user_id": this.email,
      //   "password": this.password,
      // }
      // axios.post('https://powerai.cc/db_user_login', sd).then(response => {
      //   // var content = response.data.content
      //   var rtn_type = response.data.type
      //   var success = response.data.success
      //   console.log("db_user_login(): ", response.data)
      //   if (success) {
      //     this.showLoginWindow = false;
      //     this.$parent.login_show_modal = false;
      //     this.$parent.user_id = this.email
      //     this.is_logining = false
      //   //===========================legacy===========================
      //
      //     var sd = {
      //       "user_id": this.email,
      //     }
      //     axios.post('https://powerai.cc/db_get_server_user_config', sd).then(response => {
      //       this.$parent.db_user_config = response.data.content
      //       console.log("db_get_server_user_config(): ",response.data.content)
      //     }).catch(error => {
      //       console.log("===============db_get_server_user_config error: ===============", error)
      //     })
      //
      //     axios.post('https://powerai.cc/db_get_server_role_config', sd).then(response => {
      //       this.$parent.db_role_config = response.data.content
      //       console.log("db_get_server_role_config(): ",response.data.content)
      //     }).catch(error => {
      //       console.log("===============db_get_server_role_config error: ===============", error)
      //     })
      //
      //     axios.post('https://powerai.cc/db_get_user_and_roles', sd).then(response => {
      //       var data = response.data
      //       // var content = data.content
      //       console.log("db_get_user_and_roles() returned with data: ", data.content)
      //       // console.log(`${this.$parent.user_id}'s db_get_user_and_roles() returned with data: ${data}`)
      //       this.$parent.db_user_data = data.content.user
      //       this.update_avatar_with_gender(this.$parent.db_user_data.gender)
      //
      //       this.$parent.db_roles_data = data.content.roles
      //
      //       this.$parent.db_roles_data.unshift({role_id: "foo_button", nickname: "默认" , description:"n/a", prompt:"n/a"})
      //       // 将user的api_key放入API_role的prompt
      //       for (let i=0; i<this.$parent.db_roles_data.length; i++) {
      //         if (this.$parent.db_roles_data[i].role_id=="API_role") {
      //           this.$parent.db_roles_data[i].prompt = "api_key: "+"'"+this.$parent.db_user_data.user_api_key+"'"
      //         }
      //       }
      //
      //       this.$parent.current_vip = data.content.user.current_vip_type
      //       this.$parent.current_role = data.content.user.current_role_id
      //       // 主按钮显示user当下的vip_type
      //       for (let i = 0; i < this.$parent.vip_data.length; i++) {
      //         if (this.$parent.vip_data[i].role_id==this.$parent.current_vip) {
      //           this.$parent.vip_data[0] = this.$parent.vip_data[i]
      //           // console.log("=======current_vip roles[0] changed to roles["+i+"].")
      //         }
      //       }
      //       // 主按钮显示user当下的role
      //       for (let i = 0; i < this.$parent.db_roles_data.length; i++) {
      //         if (this.$parent.db_roles_data[i].role_id==this.$parent.current_role) {
      //           this.$parent.db_roles_data[0] = this.$parent.db_roles_data[i]
      //           console.log("=======current_role roles[0] changed to roles["+i+"].")
      //         }
      //       }
      //       console.log("=========current vip type is:=========", this.$parent.current_vip)
      //       console.log("=========current role is:=========", this.$parent.current_role)
      //       this.$parent.selected_data.role_id = this.$parent.current_role
      //
      //       var sender_data = {
      //         "user_id": this.email
      //       }
      //       try {
      //         axios.post('https://powerai.cc/user_login', sender_data).then(() => {
      //           // this.$parent.roles = response.data.content
      //           // console.log("this.roles get from server is : ", this.$parent.roles)
      //
      //           // console.log("start get user chat_list.")
      //           try {
      //             var sd = {
      //               "user_id": this.email,
      //               "role_id": this.$parent.current_role,
      //               // "role_id": this.$parent.selected_data.role_id,
      //             }
      //             // 获取历史user_chat_list
      //             axios.post('https://powerai.cc/user_get_chat_list', sd).then(response => {
      //               // 获取数据
      //               this.$parent.history_messages = response.data
      //               // console.log("this.history_messages get from server is : ", this.$parent.history_messages)
      //               // 格式化（将代码区分出来）
      //               for(let i = 0; i < this.$parent.history_messages.length; i++){
      //                 var chat = this.$parent.history_messages[i]
      //                 var text_list = splitCodeAndText(chat["content"])
      //                 // 如果文本包含代码块，则改为list，类型变为text_list
      //                 if (text_list.length>1) {
      //                   chat["content"]=text_list
      //                   chat["type"]="text_list"
      //                 }
      //                 else {
      //                   chat["content"]=text_list[0].value
      //                   chat["type"]="normal_text"
      //                 }
      //               }
      //               // console.log("this.history_messages formated is : ", this.$parent.history_messages)
      //               // console.log(proxy)
      //               // 这里让this.history_messages刷新，通过proxy调用
      //               // proxy.history_messages = my_data.history_messages
      //               this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新滚动条*/
      //                 this.$parent.$refs.chat_history_scroll.scrollTo({top: this.$parent.$refs.chat_history_scroll.scrollHeight,behavior: 'smooth'})
      //               });
      //             })
      //           }
      //           catch (e) {
      //             console.log("user login error: ", e)
      //           }
      //
      //         })
      //       }
      //       catch (e) {
      //         console.log("user login error: ", e)
      //       }
      //
      //     })
      //
      //     // var sender_data = {
      //     //   "user_id": this.email
      //     // }
      //     // try {
      //     //   axios.post('https://powerai.cc/user_login', sender_data).then(response => {
      //     //     this.$parent.roles = response.data.content
      //     //     console.log("this.roles get from server is : ", this.$parent.roles)
      //     //
      //     //     // console.log("start get user chat_list.")
      //     //     try {
      //     //       var sd = {
      //     //         "user_id": this.email,
      //     //         "role_id": this.$parent.current_role,
      //     //         // "role_id": this.$parent.selected_data.role_id,
      //     //       }
      //     //       // 获取历史user_chat_list
      //     //       axios.post('https://powerai.cc/user_get_chat_list', sd).then(response => {
      //     //         // 获取数据
      //     //         this.$parent.history_messages = response.data
      //     //         console.log("this.history_messages get from server is : ", this.$parent.history_messages)
      //     //         // 格式化（将代码区分出来）
      //     //         for(let i = 0; i < this.$parent.history_messages.length; i++){
      //     //           var chat = this.$parent.history_messages[i]
      //     //           var text_list = splitCodeAndText(chat["content"])
      //     //           // 如果文本包含代码块，则改为list，类型变为text_list
      //     //           if (text_list.length>1) {
      //     //             chat["content"]=text_list
      //     //             chat["type"]="text_list"
      //     //           }
      //     //           else {
      //     //             chat["content"]=text_list[0].value
      //     //             chat["type"]="normal_text"
      //     //           }
      //     //         }
      //     //         console.log("this.history_messages formated is : ", this.$parent.history_messages)
      //     //         // console.log(proxy)
      //     //         // 这里让this.history_messages刷新，通过proxy调用
      //     //         // proxy.history_messages = my_data.history_messages
      //     //         this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新滚动条*/
      //     //           this.$parent.$refs.chat_history_scroll.scrollTo({top: this.$parent.$refs.chat_history_scroll.scrollHeight,behavior: 'smooth'})
      //     //         });
      //     //       })
      //     //     }
      //     //     catch (e) {
      //     //       console.log("user login error: ", e)
      //     //     }
      //     //
      //     //   })
      //     // }
      //     // catch (e) {
      //     //   console.log("user login error: ", e)
      //     // }
      //     //===========================legacy===========================
      //   }
      //   else if (rtn_type=="PASSWORD_WRONG") {
      //     this.is_logining = false
      //     let error = "密码错误，请重新输入。"
      //     this.login_info = error
      //     console.log(error)
      //   }
      //   else if (rtn_type=="VERIFY_EMAIL_SUCCEESS") {
      //     let error = "已发送验证邮件，请点击邮件中验证链接已完成注册。"
      //     this.login_info = error
      //     console.log(error)
      //   }
      //   else if (rtn_type=="VERIFY_EMAIL_ALREADY_SENT") {
      //     let error = "验证邮件已发送，请勿重复发送，可点击邮件中验证链接已完成注册。"
      //     this.login_info = error
      //     console.log(error)
      //   }
      //   else if (rtn_type=="VERIFY_EMAIL_FAILED") {
      //     this.is_logining = false
      //     let error = "发送验证邮件失败，请输入有效的用户名（邮箱）。"
      //     this.login_info = error
      //     console.log(error)
      //   }
      //   else {
      //     this.is_logining = false
      //     let error = "db_user_login()其他错误。"
      //     this.login_info = error
      //     console.log(error)
      //   }
      // })
      this.is_logining = true
      this.automatic_login()

      //=============================该函数专门用于测试服务器的调用=============================
    },
    async automatic_login(){
      let login_completed = false
      let first_login_info = false
      const start_check_login = async () => {
        let counter = 0
        let counter_max = 999999999 //次数。这里直接死循环，直到clearInterval(intervalId)
        let counter_interval = 200  //ms
        const intervalId = setInterval(async () => {
          console.log("login_completed is : ", login_completed)
          if (login_completed) {
            console.log("automatic_login()->setInterval() just quit.")
            // 设置标志，避免多次尝试登录、多次刷新用户界面的info信息
            return
          }

          let sd = {
            "user_id": this.email,
            "password": this.password,
          }
          axios.post('https://powerai.cc/db_user_login', sd).then(response => {
            // var content = response.data.content
            var rtn_type = response.data.type
            var success = response.data.success

            // console.log("db_user_login(): ", response.data)
            if (login_completed) {
              return
            }
            if (success) {
              login_completed = true    //这行必须放最前面，如果放在this.showLoginWindow后面，中间就有一个页面刷新时间差，会多次user_login

              // ===================== automatic_login()循环结束 =====================
              clearInterval(intervalId)
              // ===================== automatic_login()循环结束 =====================

              this.showLoginWindow = false;
              this.$parent.login_show_modal = false;
              this.$parent.user_id = this.email
              this.is_logining = false
              //===========================legacy===========================

              var sd = {
                "user_id": this.email,
              }
              axios.post('https://powerai.cc/db_get_server_user_config', sd).then(response => {
                this.$parent.db_user_config = response.data.content
                console.log("db_get_server_user_config(): ",response.data.content)
              }).catch(error => {
                console.log("===============db_get_server_user_config error: ===============", error)
              })

              axios.post('https://powerai.cc/db_get_server_role_config', sd).then(response => {
                this.$parent.db_role_config = response.data.content
                console.log("db_get_server_role_config(): ",response.data.content)
              }).catch(error => {
                console.log("===============db_get_server_role_config error: ===============", error)
              })

              axios.post('https://powerai.cc/db_get_user_and_roles', sd).then(response => {
                var data = response.data
                // var content = data.content
                console.log("db_get_user_and_roles() returned with data: ", data.content)
                // console.log(`${this.$parent.user_id}'s db_get_user_and_roles() returned with data: ${data}`)
                this.$parent.db_user_data = data.content.user
                this.update_avatar_with_gender(this.$parent.db_user_data.gender)

                this.$parent.db_roles_data = data.content.roles

                this.$parent.db_roles_data.unshift({role_id: "foo_button", nickname: "默认" , description:"n/a", prompt:"n/a"})
                // 将user的api_key放入API_role的prompt
                for (let i=0; i<this.$parent.db_roles_data.length; i++) {
                  if (this.$parent.db_roles_data[i].role_id=="API_role") {
                    this.$parent.db_roles_data[i].prompt = "api_key: "+"'"+this.$parent.db_user_data.user_api_key+"'"
                  }
                }

                this.$parent.current_vip = data.content.user.current_vip_type
                this.$parent.current_role = data.content.user.current_role_id
                // 主按钮显示user当下的vip_type
                for (let i = 0; i < this.$parent.vip_data.length; i++) {
                  if (this.$parent.vip_data[i].role_id==this.$parent.current_vip) {
                    this.$parent.vip_data[0] = this.$parent.vip_data[i]
                    // console.log("=======current_vip roles[0] changed to roles["+i+"].")
                  }
                }
                // 主按钮显示user当下的role
                for (let i = 0; i < this.$parent.db_roles_data.length; i++) {
                  if (this.$parent.db_roles_data[i].role_id==this.$parent.current_role) {
                    this.$parent.db_roles_data[0] = this.$parent.db_roles_data[i]
                    console.log("=======current_role roles[0] changed to roles["+i+"].")
                  }
                }
                console.log("=========current vip type is:=========", this.$parent.current_vip)
                console.log("=========current role is:=========", this.$parent.current_role)
                this.$parent.selected_data.role_id = this.$parent.current_role

                var sender_data = {
                  "user_id": this.email
                }
                try {
                  axios.post('https://powerai.cc/user_login', sender_data).then(() => {
                    // this.$parent.roles = response.data.content
                    // console.log("this.roles get from server is : ", this.$parent.roles)

                    // console.log("start get user chat_list.")
                    try {
                      var sd = {
                        "user_id": this.email,
                        "role_id": this.$parent.current_role,
                        // "role_id": this.$parent.selected_data.role_id,
                      }
                      // 获取历史user_chat_list
                      axios.post('https://powerai.cc/user_get_chat_list', sd).then(response => {
                        this.$parent.user_check_invoke_times()
                        // 获取数据
                        this.$parent.history_messages = response.data
                        // console.log("this.history_messages get from server is : ", this.$parent.history_messages)
                        // 格式化（将代码区分出来）
                        for(let i = 0; i < this.$parent.history_messages.length; i++){
                          var chat = this.$parent.history_messages[i]
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
                        // console.log("this.history_messages formated is : ", this.$parent.history_messages)
                        // console.log(proxy)
                        // 这里让this.history_messages刷新，通过proxy调用
                        // proxy.history_messages = my_data.history_messages
                        this.$nextTick(() => {    /*延迟到messages数据对应的dom刷新后，再刷新滚动条*/
                          this.$parent.$refs.chat_history_scroll.scrollTo({top: this.$parent.$refs.chat_history_scroll.scrollHeight,behavior: 'smooth'})
                        });
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

              })

            }
            else if (rtn_type=="PASSWORD_WRONG") {
              // this.is_logining = false
              this.login_info = "密码错误，请重新输入。"
              // console.log(error)
            }
            else if (rtn_type=="VERIFY_EMAIL_SUCCEESS") {
              this.login_info = "验证邮件已发送，请点击邮箱验证链接完成注册。"
              // console.log(error)
            }
            else if (rtn_type=="VERIFY_EMAIL_ALREADY_SENT") {
              // this.login_info = "验证邮件发送中，请稍后。"
              // console.log(error)
            }
            else if (rtn_type=="VERIFY_EMAIL_FAILED") {
              // ===================== automatic_login()循环结束 =====================
              clearInterval(intervalId)
              // ===================== automatic_login()循环结束 =====================
              this.is_logining = false

              // this.is_logining = false
              this.login_info = "发送验证邮件失败，请输入有效的用户名（邮箱）。"
              // console.log(error)
            }
            else {
              // ===================== automatic_login()循环结束 =====================
              clearInterval(intervalId)
              // ===================== automatic_login()循环结束 =====================
              this.is_logining = false
              this.login_info = "db_user_login()其他错误。"
              // console.log(error)
            }
          }).catch(error=>{
            this.login_info = "网络不通畅，请稍后再登录。"
            this.is_logining = false
            login_completed = true
            console.log("automatic_login() (in db_user_login()) with error: ", error)
            // ===================== automatic_login()循环结束 =====================
            clearInterval(intervalId)
            // ===================== automatic_login()循环结束 =====================
          })

          if (!first_login_info) {
            this.login_info = "正在连接服务器中。"
            first_login_info = true
          }

          // 在这里处理返回结果...
          if (counter < counter_max) {
            // console.log(`第${counter}次查询失败`)
          } else {
            console.log('automatic_login() 超时错误！')
            // ===================== automatic_login()循环结束 =====================
            clearInterval(intervalId)
            // ===================== automatic_login()循环结束 =====================
            // 进行其他错误处理操作...
          }
        }, counter_interval)            // 0.2s查询一次，40s超时
      }
      start_check_login().then(()=>{
        console.log("automatic_login() completed.")
      }).catch(error=>{
        //============================支付确认失败============================
        console.log("automatic_login with error: ", error)
      })
      console.log("automatic_login() started.")

    }
    // async loginOrSignup() {
    //   // 向后台发送登录/注册请求
    //   const response = await fetch("https://your-backend-url/login_or_signup", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ email: this.email, password: this.password }),
    //   });
    //
    //   const data = await response.json();
    //
    //   if (data.status === "unregistered") {
    //     this.showEmailVerification = true;
    //   } else if (data.status === "success") {
    //     this.showLoginWindow = false;
    //     // 在此处处理登录成功后的操作
    //   } else {
    //     // 处理错误
    //   }
    // },
    // async verifyEmail() {
    //   // 在此处验证邮箱
    //   // 若验证成功
    //   this.showLoginWindow = false;
    //   this.showEmailVerification = false;
    // },
  },
};
</script>

<style scoped>
body {
  font-family: Arial, sans-serif;
}

.login-window {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  position: fixed;
  /*position: relative; !* 新增此属性 *!*/

  /*top:100px;*/
  /*width: 200px;*/
  top:10%;
  bottom:30%;
  height:250px;
  width: 250px;
  /*max-width: 400px;*/
  padding: 20px;
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  margin: 50px auto;
  z-index: 10001; /* 新增此属性 */

  /*pointer-events: none;   !*登录窗口未激活时，可以点击下面*!*/
}

/*.login-window.is-active {*/
/*  pointer-events: all;    !*登录窗口激活时，点击不了下面*!*/
/*}*/

.email-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 25px;
}

.input-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 25px;
}

label {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

input[type="email"],
input[type="password"],
input[type="text"] {
  font-size: 14px;
  padding: 10px;
  border: 1px solid #cccccc;
  border-radius: 3px;
  outline: none;
}

button {
  font-size: 14px;
  padding: 10px;
  background-color: #0076ff;
  color: #ffffff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button[disabled] {
  background-color: grey;
  color: white;
}

button:hover {
  background-color: #0051cb;
}

.email-verification {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 300px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
  position: relative; /* 将此行修改为 position: relative; */
  top: 0;
  left: 0;
}

.fly-enter-active,
.fly-leave-active {
  transition: transform 0.5s;
}

.fly-enter-from,
.fly-leave-to {
  transform: translateX(-100%);
}

.login-info {
  color: red;
  font-size: 10px;
}
</style>
