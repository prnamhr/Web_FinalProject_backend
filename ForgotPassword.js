const express = require('express');
const router = express.Router();
const postgres = require('postgres');
const nodemailer = require('nodemailer');
require('dotenv').config();

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

async function sendResetPasswordEmail(email, username) {

    const transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
            user: 'webProject46@outlook.com',
            pass: 'p0137282',
        },
    });
    const mailOptions = {
        from: 'webProject46@outlook.com',
        to: email,
        subject: 'Password Reset',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://localhost:5173/${username}/findUser\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);
}

router.post('/', async (req, res) => {
    const {searchInput} = req.body;


    try {
        const users = await sql`
                SELECT * FROM users
                WHERE email = ${searchInput}
                   OR username = ${searchInput}
                   OR CONCAT(first_name, ' ', last_name) ILIKE ${`%${searchInput}%`}
            `;

        if (!users || users.length === 0) {
            return res.status(404).json({error: 'User not found'});
        }
        const user = users[0];

        await sendResetPasswordEmail(user.email, user.username);

        res.json({message: 'Password reset email sent successfully'});
    } catch (error) {

        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


router.get('/:username/finduser', async (req, res) => {
    try {
        const {username} = req.params;
        const existingUser = await sql`
    SELECT * FROM users
    WHERE username LIKE '%' || ${username} || '%' OR email = ${username};
`;

        res.json(existingUser[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});
module.exports = router;
