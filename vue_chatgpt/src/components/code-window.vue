<template>
  <div :class="['code-window', { 'dark-theme': isDarkTheme }]">
    <div class="title-bar">
      <div class="title">{{ language }}</div>
      <button class="copy-btn" :title="copyBtnTitle" @click="copyCodeToClipboard">
        {{ copyBtnText }}
      </button>
    </div>
    <pre class="code" ref="code" v-html="highlighted_and_indent_Code"></pre>
<!--    <pre class="code" ref="code">{{ code }}</pre>-->
  </div>
</template>

<script>
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';

export default {
  name: 'CodeWindow',
  props: {
    code: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'javascript',
      validator: (value) =>
          ['javascript', 'python', 'markup', 'css', 'typescript', 'cpp', 'java', 'c'].includes(value),
          // ['javascript', 'python', 'markup', 'css'].includes(value),
    },
    isDarkTheme: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      copyBtnText: 'Copy',
      copied: false,
    };
  },
  computed: {
    copyBtnTitle() {
      return this.copied ? 'Code copied!' : 'Copy code to clipboard';
    },
    noformattedCode() {
      return this.code
    },
    highlighted_and_indent_Code() {
      // var indentent_code = this.formattedCode(this.code)
      // return Prism.highlight(indentent_code, Prism.languages[this.language], this.language);
      return Prism.highlight(this.code, Prism.languages[this.language], this.language);
    },
  },
  methods: {
    copyCodeToClipboard() {
      const codeEl = this.$refs.code;
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(codeEl);
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      this.copyBtnText = 'Copied!';
      this.copied = true;
      setTimeout(() => {
        this.copyBtnText = 'Copy';
        this.copied = false;
      }, 3000);
    },
    formattedCode() {
      const codeLines = this.code.trim().split('\n');
      const indentLevel = /^\s*/.exec(codeLines[0])[0].length;
      const indentedCode = codeLines.map((line) => line.slice(indentLevel)).join('\n');
      return this.escapeHTML(indentedCode);
    },
    escapeHTML(text) {
      // return text.replace(/\n/g, '<br>');
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
  },
};
</script>

<style scoped>

.code-window {
  font-family: 'Helvetica Neue', sans-serif;
  font-size: 10px;
  background-color: #f8f8f8;
  border-radius: 8px;
  /*padding: 16px;*/
  padding-top: 5px;
  padding-bottom:  20px;
  padding-left:  20px;
  padding-right:  0px;
  position: relative;

  width:100%;
  /*white-space: pre;*/
  margin-left: 0px;
  margin-right: 0px;
  margin-top: 25px;
  margin-bottom: 25px;

  border:0px;
  border-style: solid;

}

.code-window.dark-theme {
  background-color: #333;
  color: #f8f8f8;
}

/*.code-window br {*/
/*  content: "\A";*/
/*  white-space: pre;*/
/*}*/

.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 16px 0;
  padding: 0;
}

.title {
  font-family: 'Helvetica Neue', sans-serif;
  font-size: 12px;
  font-weight: bold;
  margin: 0;
  text-transform: uppercase;
}

.copy-btn {
  border: none;
  background-color: transparent;
  color: #007acc;
  cursor: pointer;
  font-size: 12px;
  font-family: 'Helvetica Neue', sans-serif;
}

.copy-btn:hover {
  text-decoration: underline;
}

.copy-btn:active {
  outline: none;
}

.code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10px;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
}

.code::-moz-selection {
  background-color: #007acc;
  color: #f8f8f8;
}

.code::selection {
  background-color: #007acc;
  color: #f8f8f8;
}

</style>
