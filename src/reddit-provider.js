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


// Create reddit JSON request url
function createUrl(subreddit, after, sort, time) {
    let listing = (sort === 'top') ? `top` : 'hot';
    let afterParam = (after === false) ? '' : `&after=t3_${after}`;
    return `https://www.reddit.com/r/${subreddit}/${listing}/.json?limit=100&t=${time}&count=100${afterParam}`;
}

// Check reddit post url domain
function checkPostDomain(url) {
    for (let domain of approvedContentDomains) {
        if (url.indexOf(domain) !== -1) return true;
    }
    return false;
}

function setPostTypeAndMedia(post) {
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
}

// Filter reddit posts and set custom properties for easier display
function filterPosts(posts) {

    // Filter out posts from non-known domains
    // Also remove non-direct media for now
    let filteredPosts = posts.filter(post => checkPostDomain(post.data.url));

    for (let post of filteredPosts) {
        setPostTypeAndMedia(post);

        post.title = post.data.title;
        post.thumb = post.data.thumbnail.replace(/^http:/, 'https:');
        if (post.media && post.media.indexOf('http:') === 0) {
            post.media = post.media.replace('http:', 'https:');
        }
        if (post.thumb.indexOf('http') !== 0) {
            post.thumb = false;
        }
    }

    filteredPosts = filteredPosts.filter(x => (x.toDelete !== true));

    console.log(`Received ${posts.length} posts, Used ${filteredPosts.length}`);
    let links = posts.filter(x => (filteredPosts.indexOf(x) < 0)).map(x => x.data.url);
    console.log('Links not used:', links);

    return filteredPosts;
}

function fetch(subreddit, after, sort, time) {
    let url = createUrl(subreddit, after, sort, time);
    return axios(url).then(resp => filterPosts(resp.data.data.children)).catch(console.log);
}

export default {
    fetch
}