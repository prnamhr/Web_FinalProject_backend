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
            SELECT * FROM posts
            WHERE post_id = ${postId}`;

        if (post.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
