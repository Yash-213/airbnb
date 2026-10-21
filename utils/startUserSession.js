module.exports = async (req, userId) => {
    await new Promise((resolve, reject) => {
        req.session.regenerate(error => error ? reject(error) : resolve());
    });

    req.session.userId = userId;
    await new Promise((resolve, reject) => {
        req.session.save(error => error ? reject(error) : resolve());
    });
};
