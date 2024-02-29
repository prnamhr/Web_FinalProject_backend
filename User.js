const express = require('express');
const router = express.Router();

const config = require('./config');
const postgres = require("postgres"); //
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


router.get('/:userId/followers', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get followers of a user
        const followers = await sql`SELECT * FROM followers WHERE user_id = ${userId}`;

        res.json(followers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:userId/following', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get users that a user is following
        const following = await sql`SELECT * FROM following WHERE user_id = ${userId}`;

        res.json(following);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
