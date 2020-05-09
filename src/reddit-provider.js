
import PostFormatters from "./post-formatters";

// List of domains that are approved to show in listing.
const approvedContentDomains = [
    '//i.imgur.com',
    '//imgur.com',
    '//gfycat.com',
    '//i.redd.it',
    '//i.reddituploads.com'
];


// Create reddit JSON request url
function createUrl(subreddit, after, sort, time) {
    const listing = (sort === 'top') ? 'top' : 'hot';
    const afterParam = (after === false) ? '' : `&after=t3_${after}`;
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
    const link = post.data.url;
    const extension = link.split('.').pop().toLowerCase();
  
    for (const {match, format} of Object.values(PostFormatters)) {
        if (match(link, extension)) {
            format(post, link, extension);
            return;
        }
    }

    post.toDelete = true;
}

// Filter reddit posts and set custom properties for easier display
function filterPosts(posts) {

    // Filter out posts from non-known domains
    // Also remove non-direct media for now
    const filteredPosts = posts.filter(post => checkPostDomain(post.data.url));

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

    return filteredPosts.filter(x => x.toDelete !== true);
}

/**
 * Fetch data from Reddit and return an array of posts.
 * @param  {String} subreddit
 * @param  {String} after
 * @param  {String} sort
 * @param  {String} time
 * @return {Array}    
 */
async function fetch(subreddit, after, sort, time) {
    const url = createUrl(subreddit, after, sort, time);
    const resp = await window.fetch(url);
    const data = await resp.json();

    return filterPosts(data.data.children);
}

export default {
    fetch
}