<template>
    <div id="viewer">
        <div v-if="!isMobile" @click="prevPost" class="viewer-control">
            <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/>
                <path d="M0-.5h24v24H0z" fill="none"/>
            </svg>
        </div>
        <div id="viewer-post" @click="close">
            <div class="content-wrap">
                <div>
                    <swipe-image v-if="post.type === 'image'"
                                 @next="nextPost"
                                 :src="post.media" :alt="post.title"></swipe-image>
                    <iframe v-if="post.type === 'iframe'" :style="{width: windowWidth+'px', height: (windowWidth*0.7) + 'px'}" :src="post.media" frameborder="0"></iframe>
                    <video v-if="post.type === 'video'" :src="post.media" preload="auto" autoplay="autoplay" controls muted="muted" loop="loop" webkit-playsinline=""></video>
                    <div v-if="post.type === 'html'" ref="content" v-html="post.media"></div>
                </div>
            </div>
            <div class="content-bar">
                <div v-if="isMobile" @click.stop="prevPost" class="viewer-control">
                    <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/>
                        <path d="M0-.5h24v24H0z" fill="none"/>
                    </svg>
                </div>
                <a :href="post.data.url" target="_href">Direct Link</a>
                <a :href="'https://reddit.com' + post.data.permalink" target="_href">Reddit Permalink</a>
                <span @click="close">Close</span>
                <div v-if="isMobile" @click.stop="nextPost" class="viewer-control">
                    <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/>
                        <path d="M0-.25h24v24H0z" fill="none"/>
                    </svg>
                </div>
            </div>
        </div>
        <div v-if="!isMobile" @click="nextPost" class="viewer-control">
            <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/>
                <path d="M0-.25h24v24H0z" fill="none"/>
            </svg>
        </div>
    </div>
</template>
<script>

    import swipeImage from "./swipe-image.vue";

export default {
    components: { swipeImage },
    props: {
        post: {
            required: true,
            type: Object
        }
    },
    data() {
        return {
            windowWidth: 0,
            slideshow: false,
            slideshowSpeed: 3000,
        }
    },
    created() {
        this.windowWidth = window.innerWidth - 200;
        window.addEventListener('resize', event => {
            this.windowWidth = window.innerWidth - 200;
        });

        window.addEventListener('keydown', this.keyDown);
    },
    destroyed() {
        window.removeEventListener('keydown', this.keyDown);
    },
    methods: {

        keyDown(event) {
            const keyCode = Number(event.which);

            //'D' or right arrow
            if (keyCode === 39 || keyCode === 68) {
                this.nextPost();
            }
            //'A' or left arrow
            if (keyCode === 37 || keyCode === 65) {
                this.prevPost();
            }
            //escape
            if (keyCode === 27) {
                this.close();
            }
            //Enter
            if (keyCode === 13) {
                this.toggleSlideshow()
            }
        },

        nextPost() {
            this.$emit('next');
        },

        prevPost() {
            this.$emit('prev');
        },

        close(e) {
            if (e.target.tagName === 'VIDEO' || e.target.tagName === 'A') return;
            this.slideshow = false;
            this.$emit('close');
        },

        startSlideshow() {
            this.slideshow = true;
            this.cycleSlideshow();
        },

        cycleSlideshow() {
            if (this.slideshow) {
                this.nextPost();
                setTimeout(this.cycleSlideshow, this.slideshowSpeed)
            }
        },

        toggleSlideshow() {
            if (!this.slideshow) {
                this.startSlideshow();
            } else {
                this.stopSlideshow();
            }
        },

        stopSlideshow() {
            this.slideshow = false;
        }
    },
    computed: {
        isMobile() {
            return this.windowWidth < 760;
        }
    }
}
</script>

