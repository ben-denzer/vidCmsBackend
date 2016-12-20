const removeComments = (connection, trash, cb) => {
    const sendToDB = (id) => {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM comments WHERE comment_id= ? ',
                [ id ],
                (err, sql) => {
                    err ? reject(err) : resolve();
                }
            );
        });
    };
    Promise.all(trash.map(a => sendToDB(a))).then(
        () => cb(null, JSON.stringify({ success: 'removed item' })),
        (err) => cb(err)
    );
};

module.exports = removeComments;