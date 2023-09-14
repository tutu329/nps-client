<template>
  <div class="main_container">

    <div class="label_text">
      {{label}}
    </div>

    <div class="this_container">

      <input name="points" ref="this_original_range_input" type="range" data-show-value="true" @input="onRangeChange"
       :max="max" :min ="min" :step="0.1"
      :style="{
        marginBottom:'3px',
        width: len+'px',
        background: `-webkit-linear-gradient(top, ${inputBgc_A}, ${inputBgc_B}) 0% 0% / `+ leftbgc  +'% 100% no-repeat'
      }" >

      <span ref="this_span" class="schedule_span" style="pointer-events: none"></span>

    </div>

    <div class="value_text">
      {{showvalue}}
    </div>

  </div>

</template>

<script>
import {watch, getCurrentInstance} from "vue";
// import {ref, watch} from "vue";
// import {ref, watch, onMounted} from "vue";

export default {
  props: {
    label:{
      type:String,
      default:"属性1"
    },
    len:{
      type:Number,
      default:100,
    },
    inputValue:{
      type:Number,
      default:0.0,
    },
    min:{
      type:Number,
      default:0.0,
    },
    max:{
      type:Number,
      default:1.0,
    },


    inputBgc_A:{
      type:String
    },
    inputBgc_B:{
      type:String
    },
  },
  setup(props) {
    // const prop_inputvalue = ref(props.inputValue);
    const instance = getCurrentInstance()
    const that = instance.ctx

    watch(  //监听props，实时刷新组件内部变量
        () => props.inputValue,
        (new_input_value) => {

          that.force_update(new_input_value)

        },
    )

    // return {
    //   prop_value: prop_inputvalue
    // }
  },
  data () {
    return {
      duration:'100', // 最大值
      original_range_input: null,
      span:null,
      leftbgc:0,
      showvalue:0,
      local_value:this.inputValue,
    }
  },
  methods: {
    force_update(val) {
      // 这里手动刷新span的位置和显示数值
      console.log("watching props.inputValue. changed to new value: ", val)
      let event = { target: { value: val } }

      this.onRangeChange(event)

      this.set_original_position(val)
    },
    set_original_position(val) {  // 设置原始range input的位置
      this.original_range_input.value = val
    },
    get_value(){
      return this.showvalue
    },
    set_value(val){
      this.local_value = val
    },
    get_left(in_value) {
      let left = 0
      let pointer_width = 18
      let pointer_delta = -pointer_width/(this.max-this.min)*(in_value-this.min)+pointer_width/2
      let percent_position = (in_value-this.min) / (this.max-this.min)

      // 读取width用span.offsetWidth而不是span.style.width
      left = percent_position*this.len-this.span.offsetWidth/2+pointer_delta+'px'
      return left
    },
    onRangeChange(event) {
      let val = event.target.value
      // this.position = this.get_left(val)
      this.span.style.left = this.get_left(val)
      // console.log("position is : ", val)
      // console.log("bar len is : ", this.len)

      // console.log("original value is : ", this.original_range_input.value)

      this.showvalue = val
    }
  },
  mounted () {
    this.original_range_input = this.$refs.this_original_range_input;
    this.span = this.$refs.this_span;

    //   这里根据自己的实际情况计算
    this.leftbgc = Math.ceil((this.inputValue * this.len/10 * 0.1 - 50) / this.len * 100 + 7)

    // this.position =  this.get_left(this.inputValue)
    this.span.style.left =  this.get_left(this.inputValue)

    this.force_update(this.inputValue)
    // 这里要手动刷新下，否则页面进入时，span位置不对
    // console.log("mannually showvalue is : ", this.inputValue)
    // let event = { target: { value: this.inputValue } }
    // this.onRangeChange(event)
    //
    // this.original_range_input.value = this.inputValue

  },

  watch: {
    // inputValue(val) {
    //   console.log("span left is : ", this.span.style.left)
    //   if (val > 100) {
    //     return
    //   } else {
    //
    //     //   这里根据自己的实际情况计算
    //     this.leftbgc = Math.ceil((val * this.len/10 * 0.1 - 50) / this.len * 100 + 7)
    //     this.span.style.left = (this.inputValue/100*this.len ) + 'px'
    //   }
    // }
  }
}
</script>

<style scoped>
/* 这里如果需要引用组件实例上某个方法或属性，请确保该方法或属性已经被定义并可访问 */
/*.container .child-element {*/
/*  height:100%;*/
/*  width: {{ getContainerWidth }}; !* 使用插值符号和组件内部的计算函数 *!*/
/*}*/

.main_container {
  display: grid;
  /*display: flex;*/
  flex-direction: row;
  align-items: center;

  /* 行间隔 */
  grid-template-rows:3px 3px 3px;
  /* 列间隔 */
  grid-template-columns: 80px 60px 60px;

  margin: 15px;
  margin-top: 20px;
}

.this_container {
  display: flex;
  align-items: center;
  position: relative;

  margin: 0px;
}

input[type=range] {/*轨道*/
  -webkit-appearance: none;
  border-radius: 10px 10px 10px 10px;
  height: 4px;
  z-index: 10;

}

input[type=range]::-webkit-slider-runnable-track {/*原有组件的轨道*/
  background: rgba(0,0,0,0.0);
  border-radius: 10px 0 0 10px;
}

/*input[type=range]::-webkit-slider-thumb {!*滑块*!*/
/*     -webkit-appearance: none;  // 取消所有的滑块样式（印象里是，可以试试）*/
/*  }*/

.div_slot{
  width: 151px;
  height: 46px;
  border-radius: 23px;
  background-color: #FFFFFF;
  text-align: center; line-height: 46px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px;
}

.schedule_span{/*抓手*/
  /*position: relative;*/
  position: absolute;

  display: block;
  z-index: 9999;
  width: 20px;

  /*top:-5px;*/
  height: 20px;
  line-height: 20px;
  text-align: center;

  border-radius: 12px 12px 12px 12px;
  background: rgba(255,255,255,1.0);
  padding:0;
}

.label_text {
  color: #808080;
  text-align: left;
  font-size: 12px;
  top:10px;
  margin: 0px;
}

.value_text {
  color: #808080;
  text-align: right;
  font-size: 12px;
  top:10px;
  margin: 0px;
}
</style>

