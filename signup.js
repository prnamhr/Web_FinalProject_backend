const express = require('express');
const router = express.Router();
const postgres = require('postgres');

PGHOST='ep-cool-violet-a5nymoqn.us-east-2.aws.neon.tech'
PGDATABASE='Pinterest'
PGUSER='parnamehri'
PGPASSWORD='4Mtje8AfKsxZ'
ENDPOINT_ID='ep-cool-violet-a5nymoqn'

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
    const { first_name,last_name, email, password } = req.body;

    
    username = email.split('@')[0];
    const result = await sql`
      INSERT INTO users (email, username, password,first_name,last_name)
      VALUES ( ${email},${username}, ${password},${first_name},${last_name})`;
    res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/checkUniqueEmail', async (req, res) => {
    try {
      const { email } = req.query;
  
      const existingUser = await sql`
        SELECT email FROM users WHERE email = ${email}
      `;
      if (existingUser.length > 0) {
        res.json({ isUnique: false });
      } else {
        res.json({ isUnique: true });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;
