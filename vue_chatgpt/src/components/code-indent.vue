<template>
  <pre className="code-indent" v-html="highlighted_and_indent_Code"></pre>
</template>

<script>
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';

export default {
  name: 'CodeIndent',
  props: {
    code: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      // default: 'markup',
      default: 'javascript',
      validator: (value) =>
          ['javascript', 'python', 'markup', 'css'].includes(value),
    },
  },
  computed: {
    highlighted_and_indent_Code() {
      if (this.$parent.selected_data.role_id=="painter_role11111") {
        // ==========存在问题：这样输出的图表长宽控制不住==========
        // 采用 <img src="">这种方式渲染，不专门处理
        // 出图：https://source.unsplash.com/640x480/?<"greenbird">  其中"greenbird"为搜索参数，必须是连续的英文单词
        // 图表：https://quickchart/?c={dict_data}                       其中{dict_data}为quickchart格式的dict，gpt懂得如何生成，但需要js下用encodeURIComponent转为url：https://quickchart/?c=转码
        // encodeURIComponent(JSON.stringify(chartData))
        return this.code
      }
      // if ((this.$parent.selected_data.role_id=="painter_role" || this.$parent.selected_data.role_id=="chart_role") && this.$parent.sending_task_status.finished) {
      if (this.$parent.selected_data.role_id=="chart_role" && !this.$parent.invoking_server) {
        // ========这里增加this.$parent.sending_task_status.finished检测，只在数据完整后进行渲染，可以大幅度降低调用image url次数=========

        // ===================================如果role_id是"painter_role"，不考虑code高亮显示（v-html可以直接动态渲染）===================================

        // 组件输入文本：this.code
        // 组件输出内容：highlighted_and_indent_Code（）

        // 通过正则表达式，找出网页链接，并将其改为<iframe>从而能够直接显示链接内容
        // const formattedText = this.code.replace(regex, `<iframe src="$1" width="100%" height="500px"></iframe>`)
        // 通过正则表达式，找出网页链接，并将其改为<iframe>从而能够直接显示链接内容
        console.log("=====================code-indent: highlighted_and_indent_Code()=====================")

        // 匹配 https://[任意非空格或制表字符]集合且至少一次，/g表示如果有多个匹配则输出list
        // const regex_url =  /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?/ig    //eslint-disable-line no-useless-escape
        // const regex_url =  /^https?:\/\/[\w\.-]+\/[^?]+\?(.*{.+}.*)?$/     //eslint-disable-line no-useless-escape
        // const regex_url =  /(https?:\/\/[^\s]+)/g     // 匹配 https://[任意非空格或制表字符]集合且至少一次，/g表示如果有多个匹配则输出list

        // let match
        let html = this.code

        // ================这里就去掉所有空格================
        console.log("original html is : ", html)
        // html = html.replace(/\s+/g, "")
        console.log("original html without space is : ", html)
        let my_replace_flag = "my_flag"
        let rtn = this.extract_dict_from_string(html, my_replace_flag)

        let dict_string = rtn.extracted_dict
        let replaced_html = rtn.newStr

        console.log("dict_string from html is : ", dict_string)
        console.log("replaced_html is : ", replaced_html)

        const img = document.createElement('img')
        let quickchart_url = ""
        quickchart_url = `https://quickchart.io/chart?c=` + encodeURIComponent(dict_string.replace(/\s+/g, ""))
        console.log("quickchart encodeURIComponent url is : ", quickchart_url)

        img.src = quickchart_url

        img.style.borderRadius = '5px'
        img.style.width = '100%'
        // iframe.style.width = '400px'
        img.style.height = 'auto'
        // iframe.style.height = '240px'
        img.style.borderWidth = '0'
        img.style.backgroundColor = 'rgba(0, 0, 0, 0.0)'
        html = replaced_html.replace(my_replace_flag, img.outerHTML)

        // while ((match = regex_url.exec(this.code)) !== null) {
        //   if ( match[0].includes("unsplash") || match[0].includes("quickchart")) {
        //     console.log("match[0] is : ", match[0])
        //
        //     // 获取 https://quickchart.io/chart?c={dict_data}的{dict_data}部分，然后转url
        //     // var dictData = quickchartUrl.substr(quickchartUrl.indexOf("?c=") + 3);
        //     // console.log(dictData); // 输出 {dict_data}
        //
        //     // v1================================渲染html中的match，并替换html中match原有文本================================
        //     // console.log("=====================match is : =====================", match)
        //     // let fullMatch = match[0]
        //     // let url = match[1]
        //     //
        //     // // ========================== https://quickchart.io/?c={dict_data} 的uri转码 ==========================
        //     // if (url.includes("quickchart")) {
        //     //   console.log("quickchart raw url is : ", url)
        //     //   let data_dict = url.substring(url.indexOf("?c=") + 3)
        //     //   console.log("quickchart raw data is : ", data_dict)
        //     //   url = url + encodeURIComponent(JSON.stringify(data_dict))
        //     //   console.log("quickchart encodeURIComponent url is : ", url)
        //     // }
        //     //
        //     // // 输出图片
        //     // let img_url = `<img src="${url}" style="borderRadius = '5px'; width = '100%'; height = 'auto'; borderWidth = '0'; backgroundColor = 'rgba(0, 0, 0, 0.0)';">`
        //     // html = html.replace(fullMatch, img_url)
        //     // console.log("=========unsplash or quickchart html is : =======", html)
        //
        //     // <img src=\"https://source.unsplash.com/640x360/?cat\" style=\"border-radius: 5px; width: 100%; height: auto; border-width: 0px; background-color: rgba(0, 0, 0, 0);\">
        //     // v2================================渲染html中的match，并替换html中match原有文本================================
        //     const [fullMatch, url] = match
        //     const img = document.createElement('img')
        //
        //     // =========================V0 =========================
        //     let quickchart_url = ""
        //     if (fullMatch.includes("quickchart")) {
        //       console.log("quickchart raw fullMatch is : ", fullMatch)
        //       console.log("quickchart raw url is : ", url)
        //       // let data_dict = url.substring(url.indexOf("?c=") + 3)
        //       // console.log("quickchart raw data is : ", data_dict)
        //       quickchart_url = `https://quickchart.io/chart?c=` + encodeURIComponent(dict_string)
        //       console.log("quickchart encodeURIComponent url is : ", quickchart_url)
        //
        //       // img.src = `https://quickchart.io/chart?c={"type":"bar","data":{"labels":["变电工程","线路工程"],"datasets":[{"label":"静态投资","data":[258,1015]},{"label":"动态投资","data":[259,1032]}]}}`   //注意这里是反引号，不是单引号也不是双引号。反引号可以用于${}
        //       // img.src = `https://quickchart.io/chart?c={"type":"bar","data":{"datasets":[{"data":[1]}]}}`   //注意这里是反引号，不是单引号也不是双引号。反引号可以用于${}
        //       img.src = quickchart_url
        //     }
        //     else {
        //       img.src = url
        //     }
        //         // https://quickchart.io/chart?c={%22%7B%5C%22type%5C%22%3A%5C%22bar%5C%22%2C%5C%22data%5C%22%3A%7B%5C%22labels%5C%22%3A%5B%5C%22长龙山抽水蓄能电站（6×35万千瓦）%5C%22%2C%5C%22浙能乐清电厂三期（2×100万千瓦）%5C%22%2C%5C%22国华舟山电厂三期（2×66万千瓦）%5C%22%2C%5C%22浙能六横电厂扩建（2×100万千瓦）%5C%22%2C%5C%22华润苍南电厂二期（1×100万千瓦）%5C%22%5D%2C%5C%22datasets%5C%22%3A%5B%7B%5C%22label%5C%22%3A%5C%22%5C%22%2C%5C%22backgroundColor%5C%22%3A%5B%5C%22%23FF6384%5C%22%2C%5C%22%2336A2EB%5C%22%2C%5C%22%23FFCE56%5C%22%2C%5C%22%23008000%5C%22%2C%5C%22%2387CEFA%5C%22%5D%2C%5C%22data%5C%22%3A%5B210%2C200%2C132%2C200%2C100%5D%7D%5D%7D%2C%5C%22options%5C%22%3A%7B%5C%22legend%5C%22%3A%7B%5C%22display%5C%22%3Afalse%7D%7D%7D%22}
        //         // https://quickchart.io/chart?c=%7B%22type%22%3A%22bar%22%2C%22data%22%3A%7B%22labels%22%3A%5B%22长龙山抽水蓄能电站（6×35万千瓦）%22%2C%22浙能乐清电厂三期（2×100万千瓦）%22%2C%22国华舟山电厂三期（2×66万千瓦）%22%2C%22浙能六横电厂扩建（2×100万千瓦）%22%2C%22华润苍南电厂二期（1×100万千瓦）%22%5D%2C%22datasets%22%3A%5B%7B%22label%22%3A%22%22%2C%22backgroundColor%22%3A%5B%22%23FF6384%22%2C%22%2336A2EB%22%2C%22%23FFCE56%22%2C%22%23008000%22%2C%22%2387CEFA%22%5D%2C%22data%22%3A%5B210%2C200%2C132%2C200%2C100%5D%7D%5D%7D%2C%22options%22%3A%7B%22legend%22%3A%7B%22display%22%3Afalse%7D%7D%7D
        //
        //         // 带缩进的编码
        //         // https://quickchart.io/chart?c=%7B%22type%22%3A%20%22bar%22%2C%0A%20%22data%22%3A%20%7B%0A%20%20%20%20%20%22labels%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%22长龙山抽水蓄能电站%22%2C%0A%20%20%20%20%20%20%20%20%20%22浙能乐清电厂三期%22%2C%0A%20%20%20%20%20%20%20%20%20%22国华舟山电厂三期%22%2C%0A%20%20%20%20%20%20%20%20%20%22浙能六横电厂扩建%22%2C%0A%20%20%20%20%20%20%20%20%20%22华润苍南电厂二期%22%0A%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%22datasets%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%22label%22%3A%20%22装机容量（万千瓦）%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%22data%22%3A%20%5B210%2C%20200%2C%20132%2C%20200%2C%20100%5D%0A%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%5D%0A%20%7D%2C%0A%20%22options%22%3A%20%7B%0A%20%20%20%20%20%22scales%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%22yAxes%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22ticks%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22beginAtZero%22%3A%20true%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%7D%0A%20%7D%2C%0A%20%22plugins%22%3A%20%7B%0A%20%20%20%20%20%22title%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%22display%22%3A%20true%2C%0A%20%20%20%20%20%20%20%20%20%22text%22%3A%20%22浙江省电力装机容量排名%22%0A%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%22annotation%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%22annotations%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22type%22%3A%20%22line%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22mode%22%3A%20%22horizontal%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22scaleID%22%3A%20%22y-axis-0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22value%22%3A%20200%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22borderColor%22%3A%20%22rgb(75%2C%20192%2C%20192)%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22borderWidth%22%3A%204%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22label%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22content%22%3A%20%22200万千瓦%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22enabled%22%3A%20true%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%7D%0A%20%7D%0A%7D
        //
        //     // =========================V1 ========================= 根据测试，可以不用转码uri，可能哪个环节已经以标准的方式转了，反而比自己转更可靠
        //     // img.src = url
        //
        //     // 以下为完全正确的输入链接
        //     // https://quickchart.io/chart?c={"type":"bar","data":{"labels":["变电工程","线路工程"],"datasets":[{"label":"静态投资","data":[258,1015]},{"label":"动态投资","data":[259,1032]}]}}
        //     // https://quickchart.io/chart?c={"type":"bar","data":{"labels":["静态投资","动态投资"],"datasets":[{"label":"","data":[258,259,1015,1032,1273,1291]}]}}
        //     // https://quickchart.io/chart?c={type:'bar',data:{labels:['Q1','Q2','Q3','Q4'], datasets:[{label:'Users',data:[50,60,70,180]},{label:'Revenue',data:[100,200,300,400]}]}}
        //
        //     img.style.borderRadius = '5px'
        //     img.style.width = '100%'
        //     // iframe.style.width = '400px'
        //     img.style.height = 'auto'
        //     // iframe.style.height = '240px'
        //     img.style.borderWidth = '0'
        //     img.style.backgroundColor = 'rgba(0, 0, 0, 0.0)'
        //     html = html.replace(fullMatch, img.outerHTML)
        //     // console.log("=========unsplash or quickchart html is : =======", html)
        //     // ================================渲染match并替代原有match文本================================
        //   }
        //   else {
        //     // 渲染其他普通网页
        //     // console.log("=====================match is : =====================", match)
        //
        //     // ================================渲染html中的match，并替换html中match原有文本================================
        //     const [fullMatch, url] = match
        //     const iframe = document.createElement('iframe')
        //     iframe.src = url
        //     iframe.style.borderRadius = '5px'
        //     iframe.style.width = '100%'
        //     // iframe.style.width = '400px'
        //     iframe.style.height = 'auto'
        //     // iframe.style.height = '240px'
        //     iframe.style.borderWidth = '0'
        //     iframe.style.backgroundColor = 'rgba(0, 0, 0, 0.0)'
        //     html = html.replace(fullMatch, iframe.outerHTML)
        //     // ================================渲染html中的match，并替换html中match原有文本================================
        //   }
        // }

        return html

        // console.log("=====================html is : =====================", html)
        // 第一行：https://source.unsplash.com/640x480/?<"greenbird">
        // 第二行：https://source.unsplash.com/640x480/?<"whitecat">
      }
      else if (this.$parent.selected_data.role_id=="painter_role" && !this.$parent.invoking_server) {
        // 这个正则只匹配普通url，不能匹配url?c={}这样后面含有{}这样的非法字符的
        // const regex_url =  /^https:\/\/[a-zA-Z0-9\-.]+(\.[a-zA-Z0-9\-_]+)*\.[a-zA-Z]{2,}(\/[\w\-\.~!@#$%^&*+?:\/=\[\]]*)?$/    //eslint-disable-line no-useless-escape
        // const regex_url =  /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?/ig    //eslint-disable-line no-useless-escape
        const regex_url =  /https?:\/\/[^\s]+/ig    //eslint-disable-line no-useless-escape

        let html = this.code
        console.log("original html is : ", html)
        let match
        while ((match = regex_url.exec(this.code)) !== null) {
          if ( match[0].includes("unsplash") ) {
            console.log("match[0] is : ", match[0])

            const [fullMatch, url] = match
            console.log("fullMatch : ", fullMatch)
            console.log("url : ", url)

            const img = document.createElement('img')

            img.src = fullMatch

            img.style.borderRadius = '5px'
            img.style.width = '100%'
            // iframe.style.width = '400px'
            img.style.height = 'auto'
            // iframe.style.height = '240px'
            img.style.borderWidth = '0'
            img.style.backgroundColor = 'rgba(0, 0, 0, 0.0)'
            html = html.replace(fullMatch, img.outerHTML)
            console.log("html : ", html)
          }
          // else {
          //   // 渲染其他普通网页
          //   // console.log("=====================match is : =====================", match)
          //
          //   // ================================渲染html中的match，并替换html中match原有文本================================
          //   const [fullMatch, url] = match
          //   const iframe = document.createElement('iframe')
          //   iframe.src = url
          //   iframe.style.borderRadius = '5px'
          //   iframe.style.width = '100%'
          //   // iframe.style.width = '400px'
          //   iframe.style.height = 'auto'
          //   // iframe.style.height = '240px'
          //   iframe.style.borderWidth = '0'
          //   iframe.style.backgroundColor = 'rgba(0, 0, 0, 0.0)'
          //   html = html.replace(fullMatch, iframe.outerHTML)
          //   // ================================渲染html中的match，并替换html中match原有文本================================
          // }
        }

        return html

      }
      else {
        // ===================================如果role_id是其他，则按code高亮显示处理（v-html就无法动态渲染）===================================

        // 组件输入文本：this.code
        // 组件输出内容：highlighted_and_indent_Code（）
        const codeLines = this.code.trim().split('\n');

        const indentLevel = /^\s*/.exec(codeLines[0])[0].length;
        const indentedCode = codeLines.map((line) => line.slice(indentLevel)).join('\n');

        let output = Prism.highlight(indentedCode, Prism.languages[this.language], this.language);
        return output
      }
    },
  },
  methods: {

    escapeHTML(text) {  //把含html格式的文本转义为可见而不是可被渲染，如<转义为&lt;
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    extractContent_old(str) { //把string里的最大{}抠出来
      var start = str.indexOf("{");
      if (start >= 0) {
        var count = 1;
        for (var i=start+1; i<str.length && count>0; i++) {
          if (str[i] == "{") count++;
          else if (str[i] == "}") count--;
        }
        return str.substring(start, i);
      } else {
        return "";
      }
    },
    extract_dict_from_string(str, replace_str) {
      // 这个函数把str里面的最大{}抠出来返回为content，且把原来的str中的{}替换为replace_str并返回为newStr
      var start = str.indexOf("{");
      if (start >= 0) {
        var count = 1;
        for (var i=start+1; i<str.length && count>0; i++) {
          if (str[i] == "{") count++;
          else if (str[i] == "}") count--;
        }
        // Extract the content of the curly braces
        var content = str.substring(start, i);

        // Replace the curly braces and their contents with "my_string"
        str = str.substring(0, start) + replace_str + str.substring(i);

        return {extracted_dict: content, newStr: str};
      } else {
        return {extracted_dict: "", newStr: str};
      }
    }

},
};
</script>

<style scoped>
.code-indent {
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  /*overflow-x: auto;*/
  /*overflow:auto;*/
}
</style>
