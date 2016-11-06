<template>
<header>
    <form @submit.prevent="setSubreddit(subredditInput)">
    <span class="logo" @click="setSubreddit('')">
      Viewr
    </span>
    <input v-model="subredditInput" class="input-text" placeholder="Enter Subreddit" type="text">

    &nbsp;&nbsp;&nbsp;

    <button class="button" type="submit">Show Posts</button>

    &nbsp;&nbsp;&nbsp;

    <div class="fancy-radio">
      <input id="radio-sort-time" type="radio" v-model="sort" value="time">
      <label for="radio-sort-time">Recent</label>
    </div>

    <div class="fancy-radio">
      <input id="radio-sort-top" type="radio" v-model="sort" value="top">
      <label for="radio-sort-top">Top</label>
    </div>

    <div id="menu-group" v-if="sort == 'top'">
      
      <div class="fancy-radio">
        <input type="radio" id="radio-time-day" v-model="time" value="day">
        <label for="radio-time-day">This Day</label>
      </div>

      <div class="fancy-radio">
        <input type="radio" id="radio-time-week" v-model="time" value="week">
        <label for="radio-time-week">This Week</label>
      </div>

      <div class="fancy-radio">
        <input type="radio" id="radio-time-month" v-model="time" value="month">
        <label for="radio-time-month">This Month</label>
      </div>

      <div class="fancy-radio">
        <input type="radio" id="radio-time-year" v-model="time" value="year">
        <label for="radio-time-year">This Year</label>
      </div>

      <div class="fancy-radio">
        <input type="radio" id="radio-time-all" v-model="time" value="all">
        <label for="radio-time-all">All Time</label>
      </div>
    </div>
  </form>
</header>
</template>

<script>

import Bus from '../Bus';

export default {
  name: 'header-bar',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      subredditInput: '',
      sort: 'time',
      time: 'all'
    }
  },
  created: function() {
    Bus.$on('subreddit-change', subData => {
      this.subredditInput = subData.sub;
      this.sort = subData.sort;
      this.time = subData.time;
    });
  },
  methods: {
    setSubreddit: function(sub) {
      Bus.$emit('subreddit-change', {
        sub: sub,
        sort: this.sort,
        time: this.time
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '../sass/variables';

header {
  background-color: rgba(#000, 0.8);
  color: #EEE;
  width: 100%;
  flex: 1;
  flex-grow: 0;
  top: 0;
  background-color: $primary;
  svg {
    fill: #EEE;
  }
  .logo {
    cursor: pointer;
    padding: 0 $-m;
  }
}

form {
  display: block;
}

input, option, select {
  font-size: 14px;
  background-color: transparent;
  color: #EEE;
  border: 0;
  border-bottom: 1px solid #FFF;
  border-radius: 0;
  &:focus, &:active {
    outline: 0;
  }
}

label {
  font-size: 16px;
  margin: 0 $-xxs;
}

#menu-group {
  display: block;
  background-color: darken($primary, 10%);
  margin: 0;
  display: flex;
  .fancy-radio {
    display: flex;
    flex-direction: column;
    margin: 0;
    flex: 1;
  }
  .fancy-radio label {
    flex: 1;
    text-align: center;
    padding: $-s $-m;
    font-size: 14px;
    margin: 0;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom-color: darken($primary, 10%);
  }
  input:checked + label {
    border-bottom-color: #FFF;
  }
}
</style>
