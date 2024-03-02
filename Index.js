const express = require('express');
const postgres = require('postgres');
const app = express();
const signupRouter = require('./signup');
const forgotpassword = require('./ForgotPassword');
const postCreation = require('./PostCreation');
const bcrypt = require('bcrypt'); // Import bcrypt
const post = require('./post');
const user = require('./User');
require('dotenv').config()

app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use(function (_, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use('/signup', signupRouter);
app.use('/forgotpassword', forgotpassword);
app.use('/postCreation', postCreation);
app.use('/post', post);
app.use('/user', user);

const port = 3001;

require('dotenv').config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

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


app.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email,password)
        // Fetch the user by email
        const user = await sql`
            SELECT * FROM users WHERE email = ${email}
        `;


        if (user.length === 0) {
            // User not found
            return res.json(0);
        }

        // Compare the hashed password
        const match = await bcrypt.compare(password, user[0].password);

        if (match) {
            // Passwords match, authentication successful
            res.json(user[0]);
        } else {
            // Passwords do not match
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/:username/finduser', async (req, res) => {
    try {
        const {username} = req.params;
        const existingUser = await sql`
    SELECT * FROM users
    WHERE username LIKE '%' || ${username} || '%';
`;
        res.json(existingUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

app.get('/pins', async (req, res) => {
    try {
        const pins = await sql`
        SELECT *  FROM posts
      `;
        res.json(pins);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


app.listen(port, () => console.log(`My App listening at http://localhost:${port}`));