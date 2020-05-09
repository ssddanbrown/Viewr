const imageExtensions = [
    'jpg', 'jpeg', 'png', 'gif'
];

const videoExtensions = [
    'gifv', 'mp4'
];


export default {
    gifv: {
        match(link, extension) {
            return extension === 'gifv';
        },
        format(post, link, extension) {
            post.type = 'video';
            post.media = link.replace('gifv', 'mp4');
        }
    },
    image: {
        match(link, extension) {
            return imageExtensions.includes(extension);
        },
        format(post, link, extension) {
            post.type = 'image';
            post.media = link;
        }
    },
    reddit: {
        match(link, extension) {
            return link.includes('//i.reddituploads.com');
        },
        format(post, link, extension) {
            post.type = 'image';
            post.media = link.replace(/&amp;/g, '&');
        }
    },
    video: {
        match(link, extension) {
            return videoExtensions.includes(extension);
        },
        format(post, link, extension) {
            post.type = 'video';
            post.media = link;
        }
    },
    imgur: {
        match(link, extension) {
            return link.match(/imgur\.com\/[a-zA-Z1-9]{7}$/);
        },
        format(post, link, extension) {
            post.type = 'image';
            post.media = `${link}.jpg`;
        }
    },
    imgur_gallery: {
        match(link, extension) {
            const galleryMatch = link.match('imgur\.com\/(a|gallery)\/([a-zA-Z1-9]{4,6})$');
            return galleryMatch && galleryMatch.length > 2;
        },
        format(post, link, extension) {
            const id = imgurGalleryMatch[2];
            post.type = 'html';
            post.media = `<blockquote class="imgur-embed-pub" lang="en" data-id="a/${id}"></blockquote>`;
            post.scripts = ["https://s.imgur.com/min/embed.js"]
        }
    },
    gfycat: {
        match(link, extension) {
            return link.includes('//gfycat.com/');
        },
        format(post, link, extension) {
            post.type = 'iframe';
            post.media = link.replace('//gfycat.com/', '//gfycat.com/ifr/');
        }
    },
};