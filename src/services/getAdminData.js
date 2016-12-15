const getAdminData = (connection, cb) => {
    let allData = {};
    connection.query('SELECT u.user_id, u.username, u.email, u.admin, u.premium, u.signup_date,'
        + 'u.premium_signup_date, u.premium_expiration_date FROM users u',
        (err, rows) => {
            if (err) return cb({error: 'db error'});
            allData.users = rows;

            connection.query('SELECT v.video_id, v.video_title, v.video_headline, v.premium, v.video_url,'
                + 'v.video_text, v.video_date FROM videos v',
                (err, rows) => {
                    console.log('err2', err);
                    if (err) return cb({error: 'db error'});
                    allData.videos = rows;

                    connection.query('SELECT c.comment_id, c.comment_text, c.user_fk, c.video_fk, c.comment_date FROM comments c',
                        (err, rows) => {
                            console.log('err3', err);
                            if (err) return cb({error: 'db error'});
                            allData.comments = rows;
                            cb(null, allData);
                        }
                    )
                }
            )
        }
    )
};

module.exports = getAdminData;