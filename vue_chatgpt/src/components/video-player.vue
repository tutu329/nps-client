<template>
  <div ref="subtitle_container" class="video-player">
<!--    注意：设置autoplay后，必须设置muted才能自动播放-->
<!--    注意：要倍速播放，就要关掉autoplay，然后调用this.$refs.video.playbackRate-->
<!--    注意：iphone上要自动播放的话，不仅要muted，还需要playsinline！-->
    <video
        class="video"
        ref="video"
        muted
        playsinline
        @ended="onVideoEnded" >
      您的浏览器不支持MP4视频格式。
      <source :src="videoUrl" type="video/mp4">
    </video>
<!--    <video-->
<!--        class="video"-->
<!--        ref="video"-->
<!--        autoplay="autoplay"-->
<!--        muted="muted"-->
<!--        @ended="onVideoEnded" >-->
<!--      您的浏览器不支持MP4视频格式。-->
<!--      <source :src="videoUrl" type="video/mp4">-->
<!--    </video>-->
    <button ref="skipButton" class="skip-button" @click="onSkipButtonClick">Skip</button>
    <div ref="subtitle" class="subtitle">{{ subtitle }}</div>
    <div ref="subtitle_bg" class="subtitle-bg"/>
    <div ref="video_bg" class="video-bg"/>
  </div>
</template>

<script>
// import axios from 'axios';

export default {
  props: {
    videoUrl: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.loadVideo();
    })
  },
  methods: {
    loadVideo() {
      this.$refs.video.playbackRate = 2
      // console.log("start play video")
      // this.$refs.video.load()
      this.$refs.video.play()
      // console.log("video played successfully.")
    },
    onSkipButtonClick() {
      this.$refs.video.pause();
      this.$nextTick(() => {
        // 在下一个tick中执行，等待Vue更新DOM
        this.$refs.video.remove(); // 从DOM中移除<video>元素
      });
      this.$refs.skipButton.style.display = 'none'; // 隐藏Skip按钮
      this.$refs.subtitle.style.display = 'none'; // 隐藏Skip按钮
      this.$refs.subtitle_bg.style.display = 'none'; // 隐藏Skip按钮
      this.$refs.video_bg.style.display = 'none'; // 隐藏Skip按钮
      // 触发父组件的事件，让父组件知道视频已经结束
      this.$emit('skip');
    },
    onVideoEnded() {
      // 视频播放结束时触发
      this.$nextTick(() => {
        // 在下一个tick中执行，等待Vue更新DOM
        this.$refs.video.remove(); // 从DOM中移除<video>元素
      });
      this.$refs.skipButton.style.display = 'none'; // 隐藏Skip按钮
      this.$refs.subtitle.style.display = 'none'; // 隐藏Skip按钮
      this.$refs.subtitle_bg.style.display = 'none'; // 隐藏Skip按钮
      this.$refs.video_bg.style.display = 'none'; // 隐藏Skip按钮
      // this.$refs.video_bg.style.display = 'none'; // 隐藏Skip按钮
      // 触发父组件的事件，让父组件知道视频已经结束
      this.$emit('ended');
    },
  },
};
</script>

<style scoped>
.video-player {
  display: flex;
  justify-content: center;
  align-items:center;

  /*position: fixed;*/
  border-radius: 5px;
  overflow: hidden;
  /*left:0;*/
  /*right:0;*/

  z-index:902;
}

.skip-button {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  background-color: #333;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  z-index:4;
}

.video {
  box-shadow: #444444;
  /*padding: 50px;*/
  /*border: 1px solid #ccc;*/
  border-radius: 10px;
  width: 90%;
  /*height: 90%;*/
  /*width: 80%;*/
  /*height: 80%;*/
  z-index:3;

  position:relative;
  /*box-shadow:0px 2px 10px #666; !* 设置阴影属性 *!*/

}

/*.video::after{*/
/*  content:" ";*/
/*  display:block;*/
/*  position:absolute;*/
/*  top:-1px; right:-1px; bottom:-1px;left:-1px;*/

/*  background-color:#000;*/
/*  opacity:.5;*/
/*  z-index: -1;*/
/*}*/

.video-bg {
  position:fixed;
  background-color: rgba(0,0,0,0.5);
  width: 100%;
  height: 100%;
  z-index:2;
  top: 1px;  /*防止iphone刘海位置变灰色后，无法变回白色*/
}

.subtitle {
  position: fixed; /* 将其固定在页面顶部 */
  color: #fff;
  padding-bottom: 20px;
  bottom: 0;
  right: 0; /* 将初始位置设于页面右侧 */
  white-space: nowrap;  /*文本不换行*/

  animation: move-left 20s linear infinite;
  z-index: 5;
}

.subtitle-bg {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.5);

  z-index: 4;
}

@keyframes move-left {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(-150%);
  }
}

</style>
