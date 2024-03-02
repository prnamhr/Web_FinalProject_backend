const express = require('express');
const router = express.Router();
const postgres = require('postgres');
//
const bcrypt = require('bcrypt'); // Import bcrypt
require('dotenv').config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
const saltRounds = 10;
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

router.post('/', async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        const username = email.split('@')[0];

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await sql`
            INSERT INTO users (email, username, password, first_name, last_name)
            VALUES (${email}, ${username}, ${hashedPassword}, ${first_name}, ${last_name})
              RETURNING *;
        `;
        console.log(result[0])
        console.log(result)
        res.json(result[0]);
        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/checkUniqueEmail', async (req, res) => {
    try {
        const {email} = req.query;

        const existingUser = await sql`
        SELECT email FROM users WHERE email = ${email}
      `;
        if (existingUser.length > 0) {
            res.json({isUnique: false});
        } else {
            res.json({isUnique: true});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;
