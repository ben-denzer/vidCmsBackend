const getAdminData = (connection, cb) => {

    const dbPromise = (query) => {
        return new Promise((resolve, reject) => {
            connection.query(query, (err, rows) => {
                if (err) reject({error: 'db error'});
                resolve(rows);
            });
        });
    };

    const users = dbPromise('SELECT u.user_id, u.username, u.email, u.admin, u.premium, u.signup_date, u.premium_signup_date, u.premium_expiration_date FROM users u');

    const videos = dbPromise('SELECT v.video_id, v.video_title, v.video_headline, v.premium, v.video_url, v.video_text, v.video_date FROM videos v');

    const comments = dbPromise('SELECT c.comment_id, c.comment_text, c.user_fk, c.video_fk, c.comment_date FROM comments c');

    const blogs = dbPromise('SELECT b.blog_id, b.blog_title, b.blog_headline, b.blog_text, b.blog_text, b.blog_post_url FROM blogs b');

    const images = dbPromise('SELECT i.image_id, i.blog_fk, i.image_url FROM images i');

    Promise.all([users, videos, comments, blogs, images])
        .then(data => cb(null, Object.assign(
            {},
            {users      : data[0]},
            {videos     : data[1]},
            {comments   : data[2]},
            {blogs      : data[3]},
            {images     : data[4]}
        ))).catch(() => cb({error: 'db error'}));
};

module.exports = getAdminData;