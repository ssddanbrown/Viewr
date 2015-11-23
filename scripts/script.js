(function() {

var imgurService = {

	//Set auth header for imgur
	setHeader: function(xhr) {
	    xhr.setRequestHeader('Authorization', 'Client-ID 312eab995957c5a');
	},
	
	// Build a request url
	createUrl: function(subreddit, pageCount) {
		var urlString = 'https://api.imgur.com/3/gallery/r/' + subreddit;
		if ($('#radio-sort-top').is(':checked')) {
		    urlString += '/top/' + $('input:radio[name=time]:checked').val();
		} else {
		    urlString += '/time';
		}
		return urlString + '/' + pageCount + '.json';
	},

	// Filter returned images
	imageFilter: function(images) {
		var filteredImages = images.filter(function(image) {

			if (image.bandwidth === 0) return false;

			return image.link.indexOf('http://imgur.com/a/') === -1;
		});
		for (var i = 0; i < filteredImages.length; i++) {
			var image = filteredImages[i];
			var ext = image.link.split('.').pop().toLowerCase();
			// Set thumb
			var thumb = image.link;
			if (ext === 'gif' && thumb.indexOf('h.gif') !== -1) {
				thumb = thumb.replace('h.gif', 'b.gif');
			} else {
				thumb = thumb.replace(image.id, image.id + 'b');
			}
			image.thumb = thumb;
			image.display = (ext === 'gif') ? image.link : image.link.replace(image.id, image.id + 'h');
		};
		return filteredImages;
	}

};

var app = new Vue({
	el: '#viewr',
	data: {
		page: 0,
		subreddit: '',
		isRequested: false,
		images: [],
		currentImage: false,
		slideshowSpeed: 3000,
		slideshow: false,
	},
	ready: function() {
		var element = this.$el;
		var _this = this;
		$(element).keydown(function(e) {
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
			// if (e.which == 13) {
			//     if (!appState.slideshow) {
			//         setTimeout(startSlideshow, appState.slideshowSpeed);
			//     } else {
			//         stopSlideshow();
			//     }
			// };
		});
	},
	methods: {

		// Load subreddit data into the current instance
		loadSubreddit: function(subreddit, force) {
			var _this = this;
			_this.subreddit = subreddit;
			if(_this.isRequested && !force) return;
			_this.isRequested = true;
			$.ajax({
				url: imgurService.createUrl(subreddit, _this.page),
				type: 'GET',
				dataType: 'json',
				beforeSend: imgurService.setHeader
			}).done(function(data) {
				var images = imgurService.imageFilter(data.data);
				_this.images = _this.images.concat(images);
			}).fail(function() {
				console.log('Imgur get failed');
			}).always(function() {
				_this.isRequested = false;
			});
		},
		// Submit handler for above subreddit loader
		loadSubredditSubmit: function(e) {
			e.preventDefault();
			this.loadSubreddit(this.subreddit);
			return false;
		},

		// Set the current image being featured
		setCurrentImage: function(image) {
			var _this = this;
			_this.currentImage = image;
		},

		// Hide the image display popup
		hideImageDisplay: function(e) {
			if(e.target === this.$els.imageDisplay) {
				this.currentImage = false;
				console.log('test');
			}
		},

		changeImage: function(relativeIndexChange) {
			var newIndex = this.images.indexOf(this.currentImage) + relativeIndexChange;
			// TODO - check if at the end of current imageDisplay
			this.currentImage = this.images[newIndex];
		}

	}
});



    $('input[name=sort]').change(function() {
        if ($('#radio-sort-top').is(':checked')) {
            $('#menu-group').css('display', 'inline-block');
        } else {
            $('#menu-group').css('display', 'none');
        };

    });

    $('#button-home').click(function() {
        location.reload();
    });

    $('#button-load').click(function() {
        if (!appState.currentSubreddit || appState.currentSubreddit == '') {
            setMessage('An Error Occured');
            return;
        } else {
            nextPage(true);
        };
    });

    // $(window).scroll(function() {
    //     if (isScrolledIntoView('#button-load') && appState.currentSubreddit) {
    //         nextPage();
    //     };
    // });


    function setMessage(message) {
        $('#message').text(message).slideDown().delay(1 * 1000).slideUp();
    }

    function isScrolledIntoView(elem) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    function nextPage(force) {
        if (!appState.isRequested || force) {
            appState.pageCount++;
            requestImages(appState.currentSubreddit, true);
            appState.isRequested = true;
        };
    }

    function startSlideshow() {
        appState.slideshow = true;
        cycleSlideshow();
    }

    function cycleSlideshow() {
        if (slideshow) {
            viewerNext();
            setTimeout(cycleSlideshow, appState.slideshowSpeed);
        };
    }

    function stopSlideshow() {
        appState.slideshow = false;
    }

})();
