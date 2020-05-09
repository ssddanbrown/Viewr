<template>
    <div id="app">
        <header>
            <div class="logo" @click="loadSubreddit('', true)">VIEWR</div>

            <input v-model="subredditInput" v-on:keypress.enter="loadSubredditSubmit" class="input-text" placeholder="Enter Subreddit" type="text">

            <div class="fancy-radio-container">
                <fancy-radio v-model="sort" new-value="time">Recent</fancy-radio>
                <fancy-radio v-model="sort" new-value="top">Top</fancy-radio>
            </div>

            <button class="button" type="button" v-on:click="loadSubredditSubmit">Show Posts</button>

        </header>

        <div id="menu-group" :class="{active: (sort === 'top')}">

            <fancy-radio v-model="time" new-value="day">This Day</fancy-radio>
            <fancy-radio v-model="time" new-value="week">This Week</fancy-radio>
            <fancy-radio v-model="time" new-value="month">This Month</fancy-radio>
            <fancy-radio v-model="time" new-value="year">This Year</fancy-radio>
            <fancy-radio v-model="time" new-value="all">All Time</fancy-radio>

        </div>

        <div id="container" :class="{background: currentPost}">

            <h3 id="message"></h3>

            <div id="posts" v-show="subreddit">
                <div v-for="post in posts"
                    draggable="false"
                    :key="post.data.id"
                    @click="setCurrentPost(post)"
                    class="post-item">
                    <img :src="post.thumb" loading="lazy" width="160" height="160" :alt="post.title">
                </div>
            </div>

            <div id="button-load" class="button" @click="nextPage" v-show="!isRequested && subreddit !== ''">Load More</div>

            <loading v-show="isRequested"></loading>

            <suggestions v-if="!subreddit" @select="loadSubreddit($event)"></suggestions>
        </div>

        <display
        v-if="currentPost"
        :post="currentPost"
        @next="changePost(1)"
        @prev="changePost(-1)"
        @close="hidePostDisplay"
        @load="preloadNext"
        ></display>

    </div>
</template>

<script>
    import Reddit from "./reddit-provider";
    import * as History from "./history";

    import fancyRadio from "./components/fancy-radio.vue";
    import loading from "./components/loading.vue";
    import suggestions from "./components/suggestions.vue";
    import display from "./components/display.vue";

    export default {
    name: 'app',
    components: {fancyRadio, loading, suggestions, display},
    data() {
        return {
          page: 0,
          subreddit: '',
          subredditInput: '',
          isRequested: false,
          posts: [],
          currentPost: false,
          sort: 'time',
          time: 'all',
        }
    },

    mounted() {
        // Autoload subreddit if in hash
        if (window.location.hash) {
            let sub = window.location.hash.substring(1);
            this.loadSubreddit(sub);
        }
    },

    methods: {

        // Load subreddit data into the current instance
        loadSubreddit(subreddit, force) {
            this.page = 0;
            if (this.subreddit !== subreddit) {
                this.posts = [];
            }

            this.subreddit = subreddit;
            this.subredditInput = subreddit;

            if (this.isRequested && !force) return;
            if (subreddit === '') return;

            History.add(subreddit);

            this.getPosts(subreddit).then(posts => {
                this.posts = posts;
            }).catch(console.error).then(() => {
                this.isRequested = false;
            });
        },

        async getPosts(subreddit) {
            this.isRequested = true;
            const after = (this.page === 0) ? false : this.posts[this.posts.length-1].data.id;
            return await Reddit.fetch(subreddit, after, this.sort, this.time);
        },

        nextPage() {
            if (this.isRequested) return false;
            this.page = this.page + 1;
            this.isRequested = true;
            return this.getPosts(this.subreddit).then(posts => {
                this.posts = this.posts.concat(posts);
                this.isRequested = false;
            }).catch(err => {this.isRequested = false;});
        },

        // Submit handler for above subreddit loader
        loadSubredditSubmit() {
            this.loadSubreddit(this.subredditInput);
            this.posts = [];
            return false;
        },

        // Set the current post being featured
        setCurrentPost(post) {
            this.currentPost = post;
            if (post.type === 'html' && post.scripts) {
                setTimeout(() => {
                    post.scripts.forEach(script => {
                        let e = document.createElement('script');
                        e.src = script;
                        window.document.querySelector('head').appendChild(e);
                    });
                }, 100)
            }
        },

        // Hide the post display popup
        hidePostDisplay() {
            this.currentPost = false;
        },

        changePost(relativeIndexChange) {
            if (this.isRequested) return;
            let newIndex = this.posts.indexOf(this.currentPost) + relativeIndexChange;
            if (newIndex === this.posts.length) {
                this.nextPage().then(() => {
                    this.setCurrentPost(this.posts[newIndex]);
                });
            } else {
                this.setCurrentPost(this.posts[newIndex]);
            }
        },
        preloadNext() {
            const nextPost = this.posts[this.posts.indexOf(this.currentPost) + 1];
            if (nextPost && nextPost.type === 'image') {
                const image = new Image();
                image.src = nextPost.media;
            }
        }
    },
    watch: {
        time(newTime) {
            this.sort = 'top';
            this.loadSubredditSubmit()
        },
        sort(newSort) {
            this.loadSubredditSubmit()
        }
    }

}
</script>
