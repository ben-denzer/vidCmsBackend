const getPlaceholderUrl = (fullEmbedUrl, cb) => {
    if (!fullEmbedUrl[0]) return cb({error: 'no youtube url'});

    const youtubeId = fullEmbedUrl[0].slice(fullEmbedUrl[0].lastIndexOf('/') + 1);
    cb(null, `https://img.youtube.com/vi/${youtubeId}/0.jpg`);
};

module.exports = getPlaceholderUrl;