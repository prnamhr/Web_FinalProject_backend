const express = require('express');
const postgres = require('postgres');

const config = require('./config'); //
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = config;

const sql = postgres({
    host: PGHOST,
    database: PGDATABASE,
    username: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: 'require',
    connection: {
        options: `project=${ENDPOINT_ID}`,
    },
});

const router = express.Router(); // Fixed typo here

router.get('/:postId', async (req, res) => {
    const { postId } = req.params;

    try {
        const post = await sql`
            SELECT * FROM 
            posts
            INNER JOIN users ON posts.user_Id = users.user_Id
            WHERE posts.post_Id = ${postId}`;

        if (post.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/:username/:postId/comment', async (req, res) => {
    const { username,postId } = req.params;
    const { comment_text } = req.body;
    try {
        const result = await sql`
            INSERT INTO comments (post_id, user_id, comment_text)
            VALUES (${postId}, (SELECT user_id FROM users WHERE username = ${username}), ${comment_text})
            RETURNING *`;

        res.status(201).json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:postId/comments', async (req, res) => {
    const { postId } = req.params;

    try {
        const comments = await sql`
            SELECT * FROM comments
            INNER JOIN users ON comments.user_Id = users.user_Id
            WHERE post_id = ${postId}`;
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:postId/likes', async (req, res) => {
    const { postId } = req.params;

    try {
        const likes = await sql`
            SELECT * FROM liked_posts
            WHERE post_id = ${postId}`;

        res.json(likes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/:username/:postId/like', async (req, res) => {
    const { username, postId } = req.params;

    try {
        // Check if the user already liked the post
        const likedPost = await sql`
            SELECT * FROM liked_posts
            WHERE user_id = (SELECT user_id FROM users WHERE username = ${username})
            AND post_id = ${postId}`;

        if (likedPost.length > 0) {
            // User already liked the post, remove the like
            await sql`
                DELETE FROM liked_posts
                WHERE user_id = (SELECT user_id FROM users WHERE username = ${username})
                AND post_id = ${postId}`;

            res.json({ isLiked: false });
        } else {
            // User hasn't liked the post, add the like
            const result = await sql`
                INSERT INTO liked_posts (user_id, post_id)
                VALUES (
                    (SELECT user_id FROM users WHERE username = ${username}),
                    ${postId}
                )
                RETURNING *`;

            res.json({ isLiked: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/:username/:postId/like', async (req, res) => {
    const { username,postId } = req.params;

    try {
        // Check if the user liked the post
        const likedPost = await sql`
            SELECT * FROM liked_posts
            WHERE user_id = (SELECT user_id FROM users WHERE username = ${username})
            AND post_id = ${postId}`;

        res.json({ isLiked: likedPost.length > 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
