<template>
  <div class="pay_window">
    <button ref="closeButton" class="close-button" @click="onCloseButtonClick">x</button>

    <div class="pay_banner_top"></div>
    <div class="pay_container">
      <div class="amount_text">支付金额: {{amount.toFixed(2)}}</div>
      <div class="other_text">订单内容: "{{ order_content }}"</div>

      <div class="order_container">
        <div class="other_text">订单编号:</div>
        <div class="order_id_text">"{{ orderId }}"</div>
      </div>

      <div class="time_container">
        <div class="other_text">付款时间: </div>
        <div class="time_text">"{{current_time}}"</div>
      </div>

      <div class="qrcode_and_text">
        <div v-if="show_qr_image && !pay_success">
          <QRCodeImage :value="qrUrl"></QRCodeImage>
          <div class="use_alipay_text">请用支付宝扫码支付</div>
        </div>
        <div v-if="show_pay_button">
          <button class="mobile_pay_button" @click="pay_click">支付</button>
        </div>
      </div>

      <div>
        <div class="pay_success" v-if="pay_success">
          <img class='pay_success_image' :src="$parent.tick_icon">
          <div class='pay_success_text'>支付成功</div>
        </div>
      </div>

    </div>
    <div class="pay_banner_buttom"></div>


  </div>
</template>

<script>
import QRCodeImage from "./qrcode.vue";
import axios from 'axios';
import {is_mobile_device} from '../utils';
// import {is_mobile_device, splitCodeAndText} from '../utils';

export default {
  name: 'InvokePayment',

  props: {
    vip_type: {
      type: String,
      default: '',
    },
  },

  components: {
    QRCodeImage,
  },

  data() {
    return {
      orderId: '',
      order_content: '',
      amount: 0,
      qrUrl: '',
      current_time: '',
      // show_qr_image:false,
      show_qr_image:false,
      show_pay_button:false,
      user_canceled:false,
      pay_success:false,
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.pay()
    })
  },

  methods:{
    onCloseButtonClick() {
      this.$parent.show_pay = false
      this.$parent.$refs.SystemSettingWindow.set_not_buying()
      this.user_canceled = true
      this.pay_success = false //关闭支付成功的显示

      console.log("用户关闭了支付窗口.")
    },
    pay_click() {
      window.location.href=this.qrUrl;
    },
    pay() {
      // 发起异步请求获取二维码URL
      const { v4: uuidv4 } = require('uuid');
      let start_pay_sd={
        "user_id":this.$parent.user_id,
        "order_id":uuidv4(),
        "subject":"VIP权限支付",
        "vip_type":this.vip_type,
        "invoke_payment":this.$parent.invoke_payment,
      }
      try {
        //============================发起异步支付============================
        console.log("start https://powerai.cc/pay() with data: ", start_pay_sd)
        axios.post('https://powerai.cc/pay', start_pay_sd).then(response => {
          let rtn = response.data
          let content = rtn.content
          if (rtn.success) {
            //============================AliPay已准备好，返回了支付链接，等待用户支付============================
            let rtn_amount = rtn.amount
            console.log("========已返回二维码========")
            // 这里应该返回 {
            // 'code': '10000',
            // 'msg': 'Success',
            // 'out_trade_no': 'in_order_id',
            // 'qr_code': 'https://qr.alipay.com/bax05832mvaotxhcpjeh6074'}
            console.log("AliPay returns: ", content)
            this.orderId = content.out_trade_no
            this.qrUrl = content.qr_code
            this.amount = rtn_amount
            this.order_content = this.$parent.vip_type_title[this.vip_type]

            let date = new Date()
            let time = date.getFullYear()+'年'+date.getMonth()+'月'+date.getDate()+'日'+date.getHours()+'时'+date.getMinutes()+'分'
            this.current_time = time

            const userAgent = navigator.userAgent.toLowerCase();
            console.log('navigator info:', navigator);
            console.log('userAgent info:', userAgent);

            console.log("order_id is: ", this.orderId)
            console.log("qrUrl is: ", this.qrUrl)
            console.log("amount is: ", this.amount)

            if (is_mobile_device()) {
              //============================手机端：直接打开支付宝等用户确认支付============================
              console.log("this is a mobile")
              this.show_pay_button = true
              // window.location.href=content.qr_code;
            }
            else {
              //============================PC端：显示二维码等用户扫码支付============================
              console.log("this is a PC")
              this.show_qr_image = true
            }
            //============================开始查询支付结果============================
            // let payment_success = false
            const startQuery = async () => {
              let counter = 0
              const intervalId = setInterval(async () => {
                if (this.user_canceled) {
                  console.log('用户取消了支付.')
                  clearInterval(intervalId)
                  this.$parent.$refs.SystemSettingWindow.set_not_buying()
                  this.user_canceled = false
                  return
                }

                let sd = {
                  "user_id":start_pay_sd.user_id,
                  "order_id":start_pay_sd.order_id,
                }
                axios.post('https://powerai.cc/pay_query', sd).then(response => {
                  let success = response.data.success
                  let type = response.data.type
                  if (success) {
                    // payment_success=true
                    console.log("paid successfully.")
                    clearInterval(intervalId)

                    // this.$parent.$refs.SystemSettingWindow.set_not_buying()
                    this.pay_success = true //显示成功
                    this.show_pay_button = false //关闭支付按钮
                    //============================支付确认成功============================
                    //======更新user等级信息======
                    console.log("payment success finally.")
                    let sd = {
                      "user_id": this.$parent.user_id,
                    }
                    axios.post('https://powerai.cc/db_get_user_and_roles', sd).then(response => {
                      var data = response.data
                      console.log(data)
                      this.$parent.db_user_data = data.content.user
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
                          console.log("=======current_vip roles[0] changed to roles["+i+"].")
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
                    })
                    //============================支付确认成功============================
                  }
                  else {
                    counter++
                    if (type=="ALIPAY_ERROR") {
                      console.log("api_alipay_trade_query() error. maybe network problem.")

                    }
                    if (type=="PAY_NOT_COMPLETED") {
                      // console.log("api_alipay_trade_query() returned not complete.")

                    }
                  }
                }).catch(error=> {
                  counter++
                  console.log("https://powerai.cc/pay_query error: ", error)
                })
                  // 在这里处理返回结果...
                if (counter < 200) {
                  // console.log(`第${counter}次查询失败`)
                } else {
                  console.log('超时错误！')
                  clearInterval(intervalId)
                  this.$parent.$refs.SystemSettingWindow.set_not_buying()
                  // 进行其他错误处理操作...
                }
              }, 200)            // 0.2s查询一次，40s超时
            }
            startQuery().then(()=>{
              console.log("startQuery() started.")
              // if (payment_success) {
              //
              // }
              // else {
              //   //============================支付确认失败============================
              //   console.log("payment failed finally.")
              //
              // }
            }).catch(error=>{
              //============================支付确认失败============================
              console.log("payment failed finally with error: ", error)
              this.$parent.$refs.SystemSettingWindow.set_not_buying()
            })
          }
        })
      }
      catch (e) {
        console.log("========user payment error========: ", e)
        this.$parent.$refs.SystemSettingWindow.set_not_buying()
      }
    }
  }
}
</script>

<style scoped>

.pay_window {
  position: relative;
  background-color: #ffffff;
  padding: 10px;

  border-radius: 10px;
  box-shadow:0px 2px 10px #666; /* 设置阴影属性 */

  z-index:12000;
}

.pay_container {
  padding: 20px;
}

.order_container {
  display: flex;
  justify-content: space-between;
  /*align-items:center;*/
  flex-direction: column;
}

.time_container {
  display: flex;
  justify-content: space-between;
  /*align-items:center;*/
  flex-direction: column;
}

.pay_banner_top {
  position: absolute;

  top:10px;
  left:0;
  right:0;
  height:20px;

  background-color: #007acc;
}

.amount_text {
  margin: 10px;
  margin-top: 30px;
  margin-bottom: 30px;
  font-size: 24px;
  color:red;
}

.order_id_text {
  text-align:right;
  font-size: 10px;
}

.time_text {
  text-align:right;
  font-size: 10px;

  margin-bottom: 30px;
}

.other_text {
  margin: 10px;
  font-size: 16px;
}

.mobile_pay_button {
  color:red;
  font-size: 16px;
  background-color: white;
  border-radius: 5px;
  border-width: 0;
  width:80px;
  height:30px;
  margin:20px;
  box-shadow:1px 1px 5px #b2b2b2; /* 设置阴影属性 */
  /*box-shadow:0px 2px 10px #666; !* 设置阴影属性 *!*/

}

.qrcode_and_text {
  display: flex;
  justify-content: center;
  align-items: center;
}

.use_alipay_text {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 16px;
  text-align: center;
}

.pay_banner_buttom {
  position: absolute;

  bottom:10px;
  left:0;
  right:0;
  height:20px;

  background-color: #007acc;
}

.close-button {
  position: absolute;
  top: 3px;
  right: 0px;
  padding: 5px 10px;
  background-color: rgba(0,0,0,0.0);
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor:pointer;

  font-size: 16px;

  z-index:4;
}

.pay_success {
  display: flex;
  flex-direction: column;
  align-items: center;
  /*width:100px;*/
  margin-bottom:10px;
}

.pay_success_image {
  width:80px;
}

.pay_success_text {
  color:red;
  font-size: 18px;
}

</style>