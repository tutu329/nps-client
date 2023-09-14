<template>
  <div class="modal-mask" v-if="show">
    <div class="pay_banner_top">
      <p class="title_text">确认</p>
    </div>

    <div class="modal-container">
      <!-- 警告提示 -->
      <div class="warning_content">
<!--        <div>-->
<!--          <img class="warning_img" src="https://powerai.cc/static/warning.jpg">-->
<!--        </div>-->
        <div class="warning_text_container">
          <p class="warning_text">{{ warningMessage }}</p>
          <p class="continue_text">您确定继续操作？</p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="btns">
        <button @click="$emit('on-cancel')" class="cancel-btn">取消</button>
        <div class="btn_padding"></div>
        <button @click="$emit('on-confirm')" class="confirm-btn">确认</button>
      </div>
    </div>

    <div class="pay_banner_buttom"></div>
  </div>
</template>

<script>
export default {
  props: {
    show: Boolean, // 控制弹窗显示/隐藏
    warningMessage: String // 警告提示信息
  }
}
</script>

<style scoped>
.modal-mask { /* 弹窗遮罩层样式 */
  /*position: fixed;*/
  /*top:0;*/
  /*left:0;*/
  /*z-index :12000;*/
  /*width :100%;*/
  /*height :100%;*/
  position: relative;
  background-color: #ffffff;
  padding: 10px;

  border-radius: 5px;
  box-shadow:0px 2px 10px #666; /* 设置阴影属性 */

  z-index:12000;

  width:250px;

  /*position: fixed;*/
  /*top:10%;*/
  /*bottom:30%;*/
  /*height:250px;*/
  /*width: 250px;*/
  /*!*max-width: 400px;*!*/
  /*padding: 20px;*/
  /*border-radius: 5px;*/
  /*!*box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);*!*/
  /*margin: 50px auto;*/
  /*z-index: 12000; !* 新增此属性 *!*/

  /*background-color: rgba(0,0,0,0.0);*/
  /*background-color: white;*/


}

.modal-wrapper { /* 弹窗外部容器样式 */
  display:flex;
  justify-content:center;
  align-items:center;
  background-color: rgba(0,0,0,0.0);

}

.modal-container { /* 弹窗内部容器样式 */
  padding-top: 20px;
  padding-bottom: 20px;
  margin: 10px;

  display:flex;
  flex-direction: column;
  justify-content:center;

}

.btns {
  display:flex;
  flex-direction: row;
  justify-content:center;

  margin-bottom: 5px;
}

.cancel-btn{
  color:#fff ;
  background-color:gray ;
  border-radius: 5px;
  border-width: 0;

  margin-right: 10px;


  color:black;

  border-radius: 5px;
  background: linear-gradient(145deg, #e6e6e6, #ffffff);
  box-shadow:  4px 4px 9px #e0e0e0,
  -4px -4px 9px #ffffff;

  font-size: 14px;
  padding:4px;
  padding-left:13px;
  padding-right:13px;
}

.confirm-btn{
  color:#fff ;
  background-color:green ;
  border-radius: 5px;
  border-width: 0;

  margin-left: 10px;


  color:black;

  border-radius: 5px;
  background: linear-gradient(145deg, #e6e6e6, #ffffff);
  box-shadow:  4px 4px 9px #e0e0e0,
  -4px -4px 9px #ffffff;

  font-size: 14px;
  padding:4px;
  padding-left:13px;
  padding-right:13px;

}

.title_text {
  font-size: 12px;
  margin:1px;
  margin-left:10px;
  /*margin-bottom:50px;*/
  color: white;
}

.warning_text_container {
  display: flex;
  flex-direction: column;
  /*align-items: flex-start;*/
}

.warning_text{
  /*text-align:center;*/
  /*text-align:left;*/
  font-size: 16px;
  margin:10px;
  margin-bottom:0px;
  color: red;

  text-align: left;
}

.continue_text{
  /*text-align:center;*/
  /*text-align:left;*/
  font-size: 12px;
  margin:10px;
  margin-bottom:20px;
  color: #8a8a8a;

  text-align: left;

}

.pay_banner_top {
  position: absolute;

  top:10px;
  left:0;
  right:0;
  height:20px;

  background-color: #b2b2b2;
  /*background-color: #007acc;*/
}

.pay_banner_buttom {
  position: absolute;

  bottom:10px;
  left:0;
  right:0;
  height:20px;

  background-color: #b2b2b2;
  /*background-color: #007acc;*/
}

.warning_content {
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content:center;
  align-items: center;

}

.btn_padding {
  width:50px;
}

.warning_img {
  padding: 0;
  width:80px;
  margin-left:0;
  margin-top: 10px;
  margin-right: 10px;
}

</style>