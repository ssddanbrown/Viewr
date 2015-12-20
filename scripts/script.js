(function() {
    "use strict";

    function isScrolledIntoView(elem) {
        var $elem = $(elem);
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $elem.offset().top;
        var elemBottom = elemTop + $elem.height();

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    var imgurService = {

        //Set auth header for imgur
        setHeader: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Client-ID 312eab995957c5a');
        },

        // Build a request url
        createUrl: function(subreddit, pageCount, sort, time) {
            var urlString = 'https://api.imgur.com/3/gallery/r/' + subreddit;
            urlString += (sort === 'top') ? '/top/' + time : '/time';
            return urlString + '/' + pageCount + '.json';
        },

        // Filter returned images
        imageFilter: function(images) {

            var filteredImages = images.filter(function(image) {
                // Filter out missing images
                if (image.bandwidth === 0) return false;
                // Filter out galleries
                return image.link.indexOf('//imgur.com/a/') === -1;
            });

            // Standardise display and thumbnail images
            for (var i = 0; i < filteredImages.length; i++) {
                var image = filteredImages[i];
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
            };

            return filteredImages;
        }

    };

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
            $(this.$el).keydown((e) => {
                if (!this.currentImage) return;
                //'D' or right arrow
                if (e.which == 39 || e.which == 68) {
                    this.changeImage(1);
                }
                //'A' or left arrow
                if (e.which == 37 || e.which == 65) {
                    this.changeImage(-1);
                }
                //escape
                if (e.which == 27) {
                    this.currentImage = false;
                }
                //Enter
                if (e.which == 13) {
                    if (!this.slideshow) {
                        this.startSlideshow();
                    } else {
                        this.stopSlideshow();
                    }
                }
            });

            // 'Infinate scroll', Auto-loads next page
            $(window).scroll((e) => {
                if (isScrolledIntoView('#button-load') && this.subreddit !== '') {
                    this.nextPage();
                };
            });

            // Autoload subreddit if in hash
            if (window.location.hash && window.location.hash !== '') {
                var sub  = window.location.hash.substring(1);
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
                    });
            },

            getImages: function(subreddit, page, sort, time) {
                this.isRequested = true;
                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: imgurService.createUrl(subreddit, page, sort, time),
                        type: 'GET',
                        dataType: 'json',
                        beforeSend: imgurService.setHeader
                    }).done((data) => {
                        var images = imgurService.imageFilter(data.data);
                        resolve(images);
                    }).fail(() => {
                        reject(Error('Imgur request failed'));
                    }).always(() => {
                        this.isRequested = false;
                    });
                });
            },

            nextPage: function() {
                this.page = this.page + 1;
                var imagesPromise = this.getImages(this.subreddit, this.page, this.sort, this.time);
                return imagesPromise.then((images) => {
                    this.images = this.images.concat(images);
                });
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
