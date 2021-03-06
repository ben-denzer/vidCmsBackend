const getAdminData = (connection, cb) => {

    const dbPromise = (query) => {
        return new Promise((resolve, reject) => {
            connection.query(query, (err, rows) => {
                if (err) reject();
                resolve(rows);
            });
        });
    };

    const getBlogs = 'SELECT b.blog_id, b.blog_title, b.blog_headline, b.blog_text, b.blog_text, '
        + 'b.blog_post_url, blog_date FROM blogs b';

    const getComments = 'SELECT c.comment_id, c.comment_text, c.user_fk, c.video_fk, c.blog_fk, '
        + 'c.comment_date FROM comments c';

    const getImages = 'SELECT i.image_id, i.blog_fk, i.image_url FROM images i';

    const getUsers = 'SELECT u.user_id, u.username, u.email, u.admin, u.premium, u.signup_date, '
        + 'u.premium_signup_date, u.premium_expiration_date, u.banned_user FROM users u';

    const getVideos = 'SELECT v.video_id, v.video_title, v.video_headline, v.premium, v.video_url, '
        + 'v.video_text, v.video_date FROM videos v';

    const allActions = [getBlogs, getComments, getImages, getUsers, getVideos].map(dbPromise);

    Promise.all(allActions)
        .then(data => {
            const [blogs, comments, images, users, videos] = data;
            cb(null, {blogs, comments, images, users, videos});
        }).catch(() => cb({error: 'db error'}));
};

module.exports = getAdminData;
