var pageCount = 0;
var currentSubreddit = '';
var isRequested = false;
var itemCount = 0;
var viewerCurrent = 0;
var slideshowSpeed = 3000;
var slideshow = false;

$(document).ready(function() {

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

	$('#button-load').click(function(){
		if (!currentSubreddit || currentSubreddit == '') {
			setMessage('An Error Occured');
			return;
		} else {
			nextPage(true);
		};
	});

	$(window).scroll(function() {
		if (isScrolledIntoView('#button-load') && currentSubreddit) {
			nextPage();
		};
	});

	$('#images').on('click', '.item' ,function() {
		viewerCurrent = $(this).data('index');
		viewerLoadImage($(this).attr('src'));
		viewerOpen();
	});

	$('#viewer').click(function(e) {
		if (e.target.id == 'viewer') {
			viewerClose();
		};
	});
	$('#viewer-image').click(function() {
		viewerNext();
	});
	$('#viewer-control-left').click(function() {
		viewerPrev();
	});
	$('#viewer-control-right').click(function() {
		viewerNext();
	});

	$('#viewer').keydown(function(event) {
		//'D' or right arrow
		if (event.which == 39 || event.which == 68) {
			viewerNext();
		};
		//'A' or left arrow
		if (event.which == 37 ||event.which == 65) {
			viewerPrev();
		};
		//escape
		if (event.which == 27) {
			viewerClose();
		};
		//Enter
		if (event.which == 13) {
			if(!slideshow){setTimeout(startSlideshow, slideshowSpeed);}
			else{ stopSlideshow();};
		};
	});

	$('#suggestions').on('click', 'p', function() {
		$('#input-subreddit').val($(this).data('sub'));
		submitSubreddit();
		$('#suggestions').css('display', 'none');
	});


});

//Form Actions
function submitSubreddit(){
	currentSubreddit = $('#input-subreddit').val();
	$('#images').html('');
	$('#suggestions').css('display', 'none');
	pageCount = 0;
	itemCount = 0;
	viewerCurrent = 0;
	$('#button-load').css('display', 'none');
	requestImages(currentSubreddit);
}

//Get images from Ajax
function requestImages(subreddit, force){
	var fullUrl = createUrl(subreddit);
	if (!isRequested || force) {
		loading(true);
		$.ajax({
			url: fullUrl,
			type: 'GET',
			dataType: 'json',
			beforeSend: setHeader
		})
		.done(function(data){
			if (data.data.length < 2) {
				setMessage('Subreddit not found')
			} else {
				displayImages(data);
			};
		})
		.fail(function() {
			console.log("error");
		})
		.always(function() {
			console.log("complete");
			loading(false);
			isRequested = false;
		});
	};
}

//Use Ajax response
function displayImages(json){
	var data = json.data;
	for (var i = 0; i < data.length; i++) {
		var link  = data[i].link;
		//Check link incase bad
		var bad = "http://imgur.com/a/"
		if (link.indexOf(bad) == 0) {
			continue;
		};

		//Change link to thumbnail link
		var thumbLink = link.replace(data[i].id, data[i].id + 'b');
		var image = "<img data-index='" + itemCount + "' class='item' src='" + thumbLink + "' >";
		$('#images').append(image);
		itemCount++;
	};
	$('#button-load').css('display', 'inline-block');
}

//Set auth header for imgur
function setHeader(xhr) {
xhr.setRequestHeader('Authorization', 'Client-ID 312eab995957c5a');
//xhr.setRequestHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:24681');
}
function setMessage(message){
	$('#message').text(message).slideDown().delay(1*1000).slideUp();
}
function createUrl(subreddit){
	var urlString = 'https://api.imgur.com/3/gallery/r/' + subreddit;
	if ($('#radio-sort-top').is(':checked')) {
		urlString += '/top/' + $('input:radio[name=time]:checked').val();
	} else {
		urlString += '/time';
	};
	console.log(urlString + '/' + pageCount + '.json');
	return urlString + '/' + pageCount + '.json';
}
function isScrolledIntoView(elem){
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}
function nextPage(force){
	if (!isRequested || force) {
		pageCount++;
		requestImages(currentSubreddit, true);
		isRequested = true;
	};
}
function viewerOpen(){
	$('#viewer').css({
		'display': 'block',
		'opacity': '1'
	});
	$('#container').css('opacity', '0.3');
	$("#viewer").attr("tabindex",-1).focus();
}
function viewerClose(){
	$('#viewer').css({
		'display': 'none',
		'opacity': '0'
	});
	$('#container').css('opacity', '1');
	stopSlideshow();
}
function viewerNext(){
	if (viewerCurrent+1 < itemCount) {
		viewerCurrent++;
		viewerLoadImage();
	} else {
		nextPage();
	};
}
function viewerPrev(){
	if (viewerCurrent > 0) {
		viewerCurrent--;
	};
	viewerLoadImage();
}
function viewerLoadImage(thumbnailLink){
	var original = "";
	if (thumbnailLink) {
		original = thumbnailLink;
	} else {
		original = $('.item[data-index="'+ viewerCurrent +'"]').attr('src');
	};
	if (original.indexOf('.gif') != -1) {
		$('#viewer-image').html(' <img src="' + original.replace('b.', '.')  +'" > ');
	} else {
		$('#viewer-image').html(' <img src="' + original.replace('b.', 'h.')  +'" > ');
	};
}
function startSlideshow(){
	slideshow = true;
	cycleSlideshow();
}
function cycleSlideshow(){
	if (slideshow) {
		viewerNext();
		setTimeout(cycleSlideshow, slideshowSpeed);
	};
}
function stopSlideshow(){
	slideshow = false;
}
function loading(visible){
	if (visible == true) {
		$('.loading').css('display', 'inline-block');
		$('#button-load').css('display', 'none');
	} else {
		$('.loading').css('display', 'none');
		$('#button-load').css('display', 'inline-block');
	};	
}