(function() {


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
            var element = this.$el;
            var _this = this;
            $(element).keydown(function(e) {
            	if(!_this.currentImage) return;
                //'D' or right arrow
                if (e.which == 39 || e.which == 68) {
                    _this.changeImage(1);
                };
                //'A' or left arrow
                if (e.which == 37 || e.which == 65) {
                    _this.changeImage(-1);
                };
                //escape
                if (e.which == 27) {
                    _this.currentImage = false;
                };
                //Enter
                if (e.which == 13) {
                    if (!_this.slideshow) {
                        _this.startSlideshow();
                    } else {
                        _this.stopSlideshow();
                    }
                };
            });

            $(window).scroll(function() {
                if (isScrolledIntoView('#button-load') && _this.subreddit !== '') {
                    _this.nextPage();
                };
            });
        },
        methods: {

            // Load subreddit data into the current instance
            loadSubreddit: function(subreddit, force) {
                var _this = this;
                _this.page = 0;
                _this.subreddit = subreddit;
                _this.subredditInput = subreddit;
                if (_this.isRequested && !force) return;
                if (subreddit === '') return;
                _this.getImages(subreddit, _this.page, _this.sort, _this.time, function(images) {
                    _this.images = images;
                });
            },

            getImages: function(subreddit, page, sort, time, callback) {
                var _this = this;
                _this.isRequested = true;
                $.ajax({
                    url: imgurService.createUrl(subreddit, page, sort, time),
                    type: 'GET',
                    dataType: 'json',
                    beforeSend: imgurService.setHeader
                }).done(function(data) {
                    var images = imgurService.imageFilter(data.data);
                    callback(images);
                }).fail(function() {
                    console.log('Imgur get failed');
                }).always(function() {
                    _this.isRequested = false;
                });
            },

            nextPage: function(callback) {
                var _this = this;
                if (_this.isRequested) return;
                _this.page = _this.page + 1;
                _this.getImages(_this.subreddit, _this.page, _this.sort, _this.time, function(images) {
                    _this.images = _this.images.concat(images);
                    if (callback) callback();
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
                var _this = this;
                _this.currentImage = image;
            },

            // Hide the image display popup
            hideImageDisplay: function(e) {
                if (e.target === this.$els.imageDisplay) {
                    this.currentImage = false;
                }
            },

            changeImage: function(relativeIndexChange) {
                var _this = this;
                var newIndex = _this.images.indexOf(_this.currentImage) + relativeIndexChange;
                if (newIndex === _this.images.length) {
                    _this.nextPage(function() {
                        _this.currentImage = this.images[newIndex];
                    });
                } else {
                    _this.currentImage = _this.images[newIndex];
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
