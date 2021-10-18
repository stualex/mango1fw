<template>
  <div>
    <p ref="timer">00:00:00</p>
  </div>
</template>

<script>
export default {
  props : {
    endDate : {  // pass date object till when you want to run the timer
      type : Date,
      default(){
        return new Date()
      }
    }
  },
  data() {
    return {
      now : new Date(),
      hour: null,
      min: null,
      sec: null,
    }
  },
  created: function () {
    this.showTime()
  },
  beforeDestroy(){
    cancelAnimationFrame(this.showTime)
  },
  methods: {
    // show time repeatedly
    showTime() {
      this.now = new Date()
      let h = Math.trunc((this.endDate - this.now) / 1000 / 3600);
      this.hour = h>9?h:'0'+h
      let m = Math.trunc((this.endDate - this.now) / 1000 / 60) % 60;
      this.min = m>9?m:'0'+m;
      let s = Math.trunc((this.endDate - this.now) / 1000) % 60
      this.sec = s>9?s:'0'+s;

      if (this.now > this.endDate) {
        this.$emit('endTime')
      }

      if(this.$refs.timer !== undefined) {
        this.$refs.timer.textContent = this.hour + ":" + this.min + ":" + this.sec
      }

      requestAnimationFrame(this.showTime);
    }
  }
}
</script>