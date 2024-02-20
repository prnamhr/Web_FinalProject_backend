const express = require('express');
const postgres = require('postgres');
const multer = require('multer');
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 1024 * 1024 * 20, // 20MB limit
    },
});

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

const router = express.Router();

router.post('/', upload.single('photo'), async (req, res) => {
    try {
        const { user_id, title, description, board_id } = req.body;
        const photoPath = req.file.path;

        const newPost = await sql`
            INSERT INTO posts (user_id, photo_content, title, description, board_id)
            VALUES (${user_id}, ${photoPath}, ${title || null}, ${description || null}, ${board_id || null})
            RETURNING *;
        `;

        console.log(newPost[0]);
        res.json(newPost[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/getUserId', async (req, res) => {
    try {
        const { username } = req.query;
        const userIdResult = await sql`
            SELECT user_id
            FROM users
            WHERE username = ${username};
        `;
        console.log( userIdResult[0].user_id )
        if (userIdResult.length > 0) {
            res.json({ user_id: userIdResult[0].user_id });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
