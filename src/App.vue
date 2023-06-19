<template>

  <router-link to="/InitDeal">
<!--    <el-button v-if="isPlay" type="primary" @click="checkPlay">开始</el-button>-->
  </router-link>

  <router-view/>

</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  data () {
    return {
      isPlay: true
    }
  },
  methods: {
    checkPlay() {
      this.isPlay = false;
    }
  },
  components: {
    //HelloWorld
  }
}
</script>


<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
