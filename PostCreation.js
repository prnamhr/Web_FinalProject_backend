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

const createPostRouter = express.Router();

createPostRouter.post('/', async (req, res) => {
    try {
        const { user_id, photo_url, title, description, board_id } = req.body;

        const newPost = await sql`
      INSERT INTO posts (user_id, photo_url, title, description, board_id)
      VALUES (${user_id}, ${photo_url}, ${title}, ${description}, ${board_id})
      RETURNING *;
    `;

        res.json(newPost[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = createPostRouter;
