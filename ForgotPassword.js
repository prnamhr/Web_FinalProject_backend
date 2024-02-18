const express = require('express');
const router = express.Router();
const postgres = require('postgres');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


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
function generateUniqueToken() {
    return crypto.randomBytes(20).toString('hex');
  }

  async function sendResetPasswordEmail(email, token) {

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
        http://<frontend-url>/reset/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };
    
      await transporter.sendMail(mailOptions);
    }
    
    router.post('/', async (req, res) => {
        const { searchInput } = req.body;
       
    
        try {
            const users = await sql`
                SELECT * FROM users
                WHERE email = ${searchInput}
                   OR username = ${searchInput}
                   OR CONCAT(first_name, ' ', last_name) ILIKE ${`%${searchInput}%`}
            `;
    
            if (!users || users.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            const user = users[0];
    
            const resetToken = generateUniqueToken();
            await sql`
                UPDATE users
                SET password = ${resetToken}
                WHERE user_id = ${user.user_id}
            `;
           
            await sendResetPasswordEmail(user.email, resetToken);
            console.log(user.user_id);

            res.json({ message: 'Password reset email sent successfully' });
        } catch (error) {
          
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
module.exports = router;
