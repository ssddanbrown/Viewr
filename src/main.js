import Vue from 'vue'
import Sass from './sass/screen.scss';

import HeaderBar from './components/HeaderBar';
import Bus from './Bus';

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

const validExtensions = imageExtensions.concat(videoExtensions);

// Check if element is scrolled into the viewport.
function isScrolledIntoView(elemId) {
    let elem = document.getElementById(elemId);
    if (elem === null) return false;
    let docViewBottom = window.innerHeight;
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
        let domain = approvedContentDomains[i]
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
    let filteredPosts = posts.filter((post) => {
        let url = post.data.url;

        if (url.indexOf('//gfycat.com') !== -1) return true;

        if (!checkPostDomain(post.data.url)) return false;
        return true;

    });
    

    filteredPosts.forEach(post => {
        let link = post.data.url;
        let extension = link.split('.').pop().toLowerCase();


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

        // Handle gfycats 
        // <iframe src='https://gfycat.com/ifr/DapperImpossibleAfricanharrierhawk' 
        else if (link.indexOf('//gfycat.com/') !== -1) {
            post.type = 'iframe';
            post.media = link.replace('//gfycat.com/', '//gfycat.com/ifr/');
        } else {
            post.delete=true;
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

    filteredPosts = filteredPosts.filter(x => {return x.delete !== true;});

    // console.log(`Recieved ${posts.length} posts, Used ${filteredPosts.length}`);
    let links = posts.filter(x => {return filteredPosts.indexOf(x) < 0}).map((x) => {return x.data.url});
    // console.log('Links not used:', links);

    return filteredPosts;
}

function makeRedditRequest(subreddit, after, sort, time) {
    var url = createRedditUrl(subreddit, after, sort, time);
    return fetch(url).then(resp => {
        return resp.json();
    }).then(data => {
        return filterRedditPosts(data.data.children);
    }).catch(console.log.bind(console));
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { HeaderBar },
  data: {
      page: 0,
      subreddit: '',
      isRequested: false,
      posts: [],
      currentPost: false,
      slideshowSpeed: 3000,
      slideshow: false,
      sort: 'time',
      time: 'all',
      windowWidth: 0
  },

  created: function() {
  	Bus.$on('subreddit-change', this.loadSubreddit);

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

  	this.windowWidth = window.innerWidth - 200;
  	window.addEventListener('resize', event => {
  	    this.windowWidth = window.innerWidth - 200;
  	}) 

  	// Autoload subreddit if in hash
  	if (window.location.hash && window.location.hash !== '') {
  	    var sub = window.location.hash.substring(1);
  	    this.loadSubreddit(sub);
  	};
  },

  methods: {

      // Load subreddit data into the current instance
      loadSubreddit: function(subData) {
          this.page = 0;
          this.posts = [];
          this.subreddit = subData.sub;
          if (this.isRequested && subData.sub !== '') return;
          if (subData.sub === '') return;
          this.getPosts(subData.sub, this.page, subData.sort, subData.time)
              .then(posts => {
                  this.posts = posts;
                  this.isRequested = false;
              }, () => {
                  this.isRequested = false;
              });
      },

      loadHomeSub: function(subName) {
      	Bus.$emit('subreddit-change', {
      		sub: subName,
      		sort: 'time',
      		time: 'all'
      	});
      },

      getPosts: function(subreddit, page, sort, time) {
          this.isRequested = true;
          let after = (page === 0) ? false : this.posts[this.posts.length-1].data.id;
          let posts = makeRedditRequest(subreddit, after, sort, time);
          return posts;
      },

      nextPage: function() {
          if (this.isRequested) return false;
          this.page = this.page + 1;
          this.isRequested = true;
          var postsPromise = this.getPosts(this.subreddit, this.page, this.sort, this.time);
          return postsPromise.then((posts) => {
              this.posts = this.posts.concat(posts);
              this.isRequested = false;
          }, () => {this.isRequested = false;});
      },

      // Set the current post being featured
      setCurrentPost: function(post) {
          this.currentPost = post;
      },

      // Hide the post display popup
      hidePostDisplay: function(e) {
          if (e.target.tagName === 'VIDEO' || e.target.tagName === 'A') return;
          this.currentPost = false;
          this.slideshow = false;
      },

      changePost: function(relativeIndexChange) {
          if (this.isRequested) return;
          var newIndex = this.posts.indexOf(this.currentPost) + relativeIndexChange;
          if (newIndex === this.posts.length) {
              this.nextPage().then(() => {
                  this.currentPost = this.posts[newIndex];
              });
          } else {
              this.currentPost = this.posts[newIndex];
          }
      },

      startSlideshow: function() {
          this.slideshow = true;
          this.cycleSlideshow();
      },

      cycleSlideshow: function() {
          if (this.slideshow) {
              this.changePost(1);
              setTimeout(this.cycleSlideshow, this.slideshowSpeed)
          }
      },

      stopSlideshow: function() {
          this.slideshow = false;
      },

      checkNextPage: function() {
  	    if (isScrolledIntoView('button-load') && this.subreddit !== '') {
  	        this.nextPage();
  	    }
      }
  }
})
