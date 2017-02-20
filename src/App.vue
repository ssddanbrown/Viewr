<template>
    <div id="app">
        <header>
            <div class="logo" @click="loadSubreddit('', true)">Viewr</div>

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

        <div id="container">

            <h3 id="message"></h3>

            <div id="posts" v-show="subreddit">
                <div draggable="false" v-for="post in posts" @click="setCurrentPost(post)" class="post-item" :style="{backgroundImage: 'url(' + post.thumb + ')'}"></div>
            </div>

            <div id="button-load" class="button" @click="nextPage()" v-show="!isRequested && subreddit !== ''">Load More</div>

            <loading v-show="isRequested"/>

            <div id="suggestions" v-show="!subreddit">
                <p @click="loadSubreddit('aww')">Aww</p>
                <p @click="loadSubreddit('cats')">Cats</p>
                <p @click="loadSubreddit('puppies')">Puppies</p>
                <p @click="loadSubreddit('cute')">Cute</p>
                <p @click="loadSubreddit('redpandas')">RedPandas</p>
                <p @click="loadSubreddit('aww_gifs')">AwwGifs</p>
                <p @click="loadSubreddit('foxes')">Foxes</p>
                <p @click="loadSubreddit('hardcoreaww')">HardcoreAww</p>
                <p @click="loadSubreddit('rabbits')">Rabbits</p>
                <p @click="loadSubreddit('CatGifs')">CatGifs</p>
                <p @click="loadSubreddit('CatsStandingUp')">CatsStandingUp</p>
                <p @click="loadSubreddit('dogpictures')">DogPictures</p>
                <p @click="loadSubreddit('pics')">Pics</p>
                <p @click="loadSubreddit('photography')">Photography</p>
                <p @click="loadSubreddit('earthporn')">Earth</p>
                <p @click="loadSubreddit('spaceporn')">Space</p>
                <p @click="loadSubreddit('gifs')">GIFs</p>
                <p @click="loadSubreddit('hdr')">HDR</p>
                <p @click="loadSubreddit('AbandonedPorn')">Abandoned</p>
                <p @click="loadSubreddit('FuturePorn')">Future</p>
                <p @click="loadSubreddit('FoodPorn')">Food</p>
                <p @click="loadSubreddit('AnimalPorn')">Animals</p>
                <p @click="loadSubreddit('MapPorn')">Maps</p>
                <p @click="loadSubreddit('ArtPorn')">Art</p>
            </div>
        </div>

        <div id="viewer" v-if="currentPost">
            <div v-if="!isMobile" @click="changePost(-1)" class="viewer-control">
                <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/>
                    <path d="M0-.5h24v24H0z" fill="none"/>
                </svg>
            </div>
            <div id="viewer-post" @click="hidePostDisplay">
                <div class="content-wrap">
                    <div>
                        <img v-if="currentPost.type === 'image'" :src="currentPost.media" :alt="currentPost.title">
                        <video v-if="currentPost.type === 'video'" :src="currentPost.media" preload="auto" autoplay="autoplay" controls muted="muted" loop="loop" webkit-playsinline=""></video>
                        <iframe v-if="currentPost.type === 'iframe'" :style="{width: windowWidth+'px', height: (windowWidth*0.7) + 'px'}" :src="currentPost.media" frameborder="0"></iframe>
                        <div v-if="currentPost.type === 'html'" ref="content" v-html="currentPost.media"></div>
                    </div>
                </div>
                <div class="content-bar">
                    <div v-if="isMobile" @click.stop="changePost(-1)" class="viewer-control">
                        <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/>
                            <path d="M0-.5h24v24H0z" fill="none"/>
                        </svg>
                    </div>
                    <a :href="currentPost.data.url" target="_href">Direct Link</a>
                    <a :href="'https://reddit.com' + currentPost.data.permalink" target="_href">Reddit Permalink</a>
                    <span @click="hidePostDisplay">Close</span>
                    <div v-if="isMobile" @click.stop="changePost(1)" class="viewer-control">
                        <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/>
                            <path d="M0-.25h24v24H0z" fill="none"/>
                        </svg>
                    </div>
                </div>
            </div>
            <div v-if="!isMobile" @click="changePost(1)" class="viewer-control">
                <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/>
                    <path d="M0-.25h24v24H0z" fill="none"/>
                </svg>
            </div>
        </div>
    </div>
</template>

<style lang="sass" src="sass/screen.scss"></style>

<script>

import axios from "axios";

// List of domains that are approved to show in listing.
const approvedContentDomains = [
    '//i.imgur.com',
    '//imgur.com',
    '//gfycat.com',
    '//i.redd.it',
    '//i.reddituploads.com'
];

const imageExtensions = [
    'jpg', 'jpeg', 'png', 'gif'
];

const videoExtensions = [
    'gifv', 'mp4'
];

// Check if element is scrolled into the viewport.
function isScrolledIntoView(elemId) {
    let elem = document.getElementById(elemId);
    let elemBoundingRect = elem.getBoundingClientRect();
    return ((elemBoundingRect.bottom <= window.innerHeight) && (elemBoundingRect.top >= 0));
}

// Create reddit JSON request url
function createRedditUrl(subreddit, after, sort, time) {
    let listing = (sort === 'top') ? `top` : 'hot';
    let afterParam = (after === false) ? '' : `&after=t3_${after}`;
    return `https://www.reddit.com/r/${subreddit}/${listing}/.json?limit=100&t=${time}&count=100${afterParam}`;
}

// Check reddit post url domain
function checkPostDomain(url) {
    for (let i = approvedContentDomains.length - 1; i >= 0; i--) {
        let domain = approvedContentDomains[i];
        if (url.indexOf(domain) !== -1) {
            return true;
        }
    }
    return false;
}

// Filter reddit posts and set custom properties for easier display
function filterRedditPosts(posts) {

    // Filter out posts from non-known domains
    // Also remove non-direct media for now
    let filteredPosts = posts.filter(post => {
        let url = post.data.url;

        if (url.indexOf('//gfycat.com') !== -1) return true;
        return checkPostDomain(post.data.url);
    });

    filteredPosts.forEach(post => {
        let link = post.data.url;
        let extension = link.split('.').pop().toLowerCase();
        let imgurGalleryMatch = link.match('imgur\.com\/(a|gallery)\/([a-zA-Z1-9]{4,6})$');

        // Handle imgur gifv
        if (extension === 'gifv') {
            post.type = 'video';
            post.media = link.replace('gifv', 'mp4');
        }

        // Handle images
        else if (imageExtensions.indexOf(extension) !== -1) {
            post.type = 'image';
            post.media = link;
        }

        else if (link.indexOf('//i.reddituploads.com') !== -1) {
            post.type = 'image';
            post.media = link.replace(/&amp;/g, '&');
        }

        // Handle videos
        else if (videoExtensions.indexOf(extension) !== -1) {
            post.type = 'video';
            post.media = link;
        }

        // Handle imgur page links
        else if (link.match(/imgur\.com\/[a-zA-Z1-9]{7}$/)) {
            post.type = 'image';
            post.media = `${link}.jpg`;
        }

        // Handle imgur galleries
         else if (imgurGalleryMatch && imgurGalleryMatch.length > 2) {
            let id = imgurGalleryMatch[2];
                post.type = 'html';
             post.media = `<blockquote class="imgur-embed-pub" lang="en" data-id="a/${id}"></blockquote>`;
             post.scripts = ["https://s.imgur.com/min/embed.js"]
         }

        // Handle gfycats
        // <iframe src='https://gfycat.com/ifr/DapperImpossibleAfricanharrierhawk'
        else if (link.indexOf('//gfycat.com/') !== -1) {
            post.type = 'iframe';
            post.media = link.replace('//gfycat.com/', '//gfycat.com/ifr/');
        } else {
            post.toDelete = true;
        }

        post.title = post.data.title;
        post.thumb = post.data.thumbnail.replace(/^http:/, 'https:');
        if (post.media && post.media.indexOf('http:') === 0) {
            post.media = post.media.replace('http:', 'https:');
        }
        if (post.thumb.indexOf('http') !== 0) {
            post.thumb = false;
        }
    });

    filteredPosts = filteredPosts.filter(x => {return x.toDelete !== true;});

        console.log(`Received ${posts.length} posts, Used ${filteredPosts.length}`);
    let links = posts.filter(x => {return filteredPosts.indexOf(x) < 0}).map((x) => {return x.data.url});
        console.log('Links not used:', links);

    return filteredPosts;
}

function makeRedditRequest(subreddit, after, sort, time) {
    let url = createRedditUrl(subreddit, after, sort, time);
    return axios(url).then(resp => {
        return filterRedditPosts(resp.data.data.children);
    }).catch(console.log.bind(console));
}

import fancyRadio from "./components/fancy-radio.vue";
import loading from "./components/loading.vue";

export default {
    name: 'app',
    components: {fancyRadio, loading},
    data: function() {
        return {
          page: 0,
          subreddit: '',
          subredditInput: '',
          isRequested: false,
          posts: [],
          currentPost: false,
          slideshowSpeed: 3000,
          slideshow: false,
          sort: 'time',
          time: 'all',
          windowWidth: 0
        }
    },

    mounted: function() {
        // Listen to keypresses
        window.addEventListener('keydown', (event) => {
            if (!this.currentPost) return;
            //'D' or right arrow
            if (event.which == 39 || event.which == 68) {
                this.changePost(1);
            }
            //'A' or left arrow
            if (event.which == 37 || event.which == 65) {
                this.changePost(-1);
            }
            //escape
            if (event.which == 27) {
                this.currentPost = false;
            }
            //Enter
            if (event.which == 13) {
                if (!this.slideshow) {
                    this.startSlideshow();
                } else {
                    this.stopSlideshow();
                }
            }
        });

        // 'Infinite scroll', Auto-loads next page
        window.addEventListener('scroll', (event) => {
            if (isScrolledIntoView('button-load') && this.subreddit !== '') {
                this.nextPage();
            }
        });

        this.windowWidth = window.innerWidth - 200;
        window.addEventListener('resize', event => {
            this.windowWidth = window.innerWidth - 200;
        });

        // Autoload subreddit if in hash
        if (window.location.hash && window.location.hash !== '') {
            let sub = window.location.hash.substring(1);
            this.loadSubreddit(sub);
        }
    },

    methods: {

        // Load subreddit data into the current instance
        loadSubreddit(subreddit, force) {
            this.page = 0;
            if (this.subreddit !== subreddit) this.posts = [];
            this.subreddit = subreddit;
            this.subredditInput = subreddit;
            if (this.isRequested && !force) return;
            if (subreddit === '') return;
            this.getPosts(subreddit).then(posts => {
                    this.posts = posts;
                    this.isRequested = false;
            }).catch(err => {this.isRequested = false;});
        },

        getPosts(subreddit) {
            this.isRequested = true;
            let after = (this.page === 0) ? false : this.posts[this.posts.length-1].data.id;
            return makeRedditRequest(subreddit, after, this.sort, this.time);
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
        hidePostDisplay(e) {
            if (e.target.tagName === 'VIDEO' || e.target.tagName === 'A') return;
            this.currentPost = false;
            this.slideshow = false;
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

        startSlideshow() {
            this.slideshow = true;
            this.cycleSlideshow();
        },

        cycleSlideshow() {
            if (this.slideshow) {
                this.changePost(1);
                setTimeout(this.cycleSlideshow, this.slideshowSpeed)
            }
        },

        stopSlideshow() {
            this.slideshow = false;
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
    },
    computed: {
        isMobile() {
            return window.innerWidth < 760;
        }
    }
}
</script>
