const express = require('express');
const postgres = require('postgres');
const bcrypt = require('bcrypt');
const app = express();
const signupRouter = require('./signup');
const forgotpassword = require('./ForgotPassword');
const router = require('./ForgotPassword');


app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(function (_, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use('/signup', signupRouter);
app.use('/forgotpassword', forgotpassword);
const port = 3000;
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


app.get('/', async (req, res) => {
    try {
      const { email, password } = req.query;
      const existingUser = await sql`
        SELECT *  FROM users WHERE email = ${email} and password = ${password}
      `;
        res.json(existingUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



app.listen(port, () => console.log(`My App listening at http://localhost:${port}`));