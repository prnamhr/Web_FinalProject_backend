const express = require('express');
const postgres = require('postgres');
const app = express();
const signupRouter = require('./signup');
const forgotpassword = require('./ForgotPassword');
const postCreation = require('./PostCreation');
const post = require('./post');
const user=require('./User');
const cors = require('cors');

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
app.use(cors());
const port = 3000;

const config = require('./config'); //
const {PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID} = config;

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
        const {email, password} = req.query;
        const existingUser = await sql`
        SELECT *  FROM users WHERE email = ${email} and password = ${password}
      `;
        res.json(existingUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
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