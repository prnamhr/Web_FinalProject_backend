const express = require('express');
const postgres = require('postgres');

const PGHOST = 'ep-cool-violet-a5nymoqn.us-east-2.aws.neon.tech';
const PGDATABASE = 'Pinterest';
const PGUSER = 'parnamehri';
const PGPASSWORD = '4Mtje8AfKsxZ';
const ENDPOINT_ID = 'ep-cool-violet-a5nymoqn';

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
    console.log(comment_text,postId,username)

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
        console.log(comments)
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




module.exports = router;
