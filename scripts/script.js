(function() {
    "use strict";

    function isScrolledIntoView(elemId) {
        var elem = document.getElementById(elemId);
        var docViewBottom = window.innerHeight;
        var elemBoundingRect = elem.getBoundingClientRect();

        return ((elemBoundingRect.bottom <= window.innerHeight) && (elemBoundingRect.top >= 0));
    }

    function createImgurUrl(subreddit, pageCount, sort, time) {
        var urlString = 'https://api.imgur.com/3/gallery/r/' + subreddit;
        urlString += (sort === 'top') ? '/top/' + time : '/time';
        return urlString + '/' + pageCount + '.json';
    }

    function filterImgurImages(images) {

        var filteredImages = images.filter((image) => {
            // Filter out missing images
            if (image.bandwidth === 0) return false;
            // Filter out galleries
            return image.link.indexOf('//imgur.com/a/') === -1;
        });

        filteredImages.forEach((image) => {
            var isGif = image.type === 'image/gif';
            // Set thumb
            var thumb = image.link;
            if (isGif && thumb.indexOf('h.gif') !== -1) {
                thumb = thumb.replace('h.gif', 'b.gif');
            } else {
                thumb = thumb.replace(image.id, image.id + 'b');
            }
            image.thumb = thumb;
            // Set thumbnail
            image.display = image.link.replace(image.id, image.id + 'h')
            image.isGif = isGif;
        });

        return filteredImages;
    }

    function makeImgurRequest(subreddit, page, sort, time) {
        return new Promise((resolve, reject) => {
            var request = new XMLHttpRequest();
            var url = createImgurUrl(subreddit, page, sort, time);
            request.open('GET', url, true);
            request.setRequestHeader('Authorization', 'Client-ID 312eab995957c5a');

            request.onload = () => {
                if (request.status >= 200 && request.status < 400) {
                    // Success!
                    var data = JSON.parse(request.response);
                    var images = filterImgurImages(data.data);
                    resolve(images);
                } else {
                    reject(Error('Imgur request failed'));
                }
            };

            request.onerror = () => {
                reject(Error('Imgur request failed'));
            };

            request.send();
        });
    }


    var app = new Vue({

        el: '#viewr',

        data: {
            page: 0,
            subreddit: '',
            subredditInput: '',
            isRequested: false,
            images: [],
            currentImage: false,
            slideshowSpeed: 3000,
            slideshow: false,
            sort: 'time',
            time: 'all'
        },

        ready: function() {
            // Listen to keypresses
            this.$el.addEventListener('keydown', (event) => {
                if (!this.currentImage) return;
                //'D' or right arrow
                if (event.which == 39 || event.which == 68) {
                    this.changeImage(1);
                }
                //'A' or left arrow
                if (event.which == 37 || event.which == 65) {
                    this.changeImage(-1);
                }
                //escape
                if (event.which == 27) {
                    this.currentImage = false;
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

            // 'Infinate scroll', Auto-loads next page
            window.addEventListener('scroll', (event) => {
                if (isScrolledIntoView('button-load') && this.subreddit !== '') {
                    this.nextPage();
                };
            });

            // Autoload subreddit if in hash
            if (window.location.hash && window.location.hash !== '') {
                var sub = window.location.hash.substring(1);
                this.loadSubreddit(sub);
            };
        },

        methods: {

            // Load subreddit data into the current instance
            loadSubreddit: function(subreddit, force) {
                this.page = 0;
                this.subreddit = subreddit;
                this.subredditInput = subreddit;
                if (this.isRequested && !force) return;
                if (subreddit === '') return;
                this.getImages(subreddit, this.page, this.sort, this.time)
                    .then((images) => {
                        this.images = images;
                        this.isRequested = false;
                    }, () => {
                        this.isRequested = false;
                    });
            },

            getImages: function(subreddit, page, sort, time) {
                this.isRequested = true;
                return makeImgurRequest(subreddit, page, sort, time);
            },

            nextPage: function() {
                if (this.isRequested) return false;
                this.page = this.page + 1;
                this.isRequested = true;
                var imagesPromise = this.getImages(this.subreddit, this.page, this.sort, this.time);
                return imagesPromise.then((images) => {
                    this.images = this.images.concat(images);
                    this.isRequested = false;
                }, () => {this.isRequested = false;});
            },

            // Submit handler for above subreddit loader
            loadSubredditSubmit: function(e) {
                e.preventDefault();
                this.loadSubreddit(this.subredditInput);
                this.images = [];
                return false;
            },

            // Set the current image being featured
            setCurrentImage: function(image) {
                this.currentImage = image;
            },

            // Hide the image display popup
            hideImageDisplay: function(e) {
                if (e.target === this.$els.imageDisplay) {
                    this.currentImage = false;
                    this.slideshow = false;
                }
            },

            changeImage: function(relativeIndexChange) {
                if (this.isRequested) return;
                var newIndex = this.images.indexOf(this.currentImage) + relativeIndexChange;
                if (newIndex === this.images.length) {
                    this.nextPage().then(() => {
                        this.currentImage = this.images[newIndex];
                    });
                } else {
                    this.currentImage = this.images[newIndex];
                }
            },

            startSlideshow: function() {
                this.slideshow = true;
                this.cycleSlideshow();
            },

            cycleSlideshow: function() {
                if (this.slideshow) {
                    this.changeImage(1);
                    setTimeout(this.cycleSlideshow, this.slideshowSpeed)
                }
            },

            stopSlideshow: function() {
                this.slideshow = false;
            }
        }
    });

})();
