const express = require('express');
const router = express.Router();
const firebase = require('firebase/app');
const { getAnalytics } = require('firebase/analytics');
const { getStorage, ref, uploadBytes } = require('firebase/storage');

const config = require('./config');
const postgres = require("postgres");
const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(), // Use memory storage or configure a destination folder
    limits: {
        fileSize: 1024 * 1024 * 20, // 20MB limit
    },
});
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

const firebaseConfig = {
    apiKey: "AIzaSyBNgseAE37k9VXeCGsyZO7KYTFH_rRkuYc",
    authDomain: "images-a532a.firebaseapp.com",
    projectId: "images-a532a",
    storageBucket: "images-a532a.appspot.com",
    messagingSenderId: "844992308687",
    appId: "1:844992308687:web:861be851fe615cc4091eba",
    measurementId: "G-WJ602T6V1X"
};
const app = firebase.initializeApp(firebaseConfig);
const storage = getStorage(app)


router.post('/:userId/photo', upload.single('photo'), async (req, res) => {
    try {
        const { userId } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const photoFileName = req.file.originalname;

        const storageRef = ref(storage, `uploads/${photoFileName}`);

        await uploadBytes(storageRef, req.file.buffer);

        const photoUrl = `uploads/${photoFileName}`;
        const updatedUser = await sql`
            UPDATE users
            SET profile_picture = ${photoUrl}
            WHERE user_id = ${userId}
        `;
        res.json(updatedUser[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/:userId/update', async (req, res) => {
    try {
        const { userId } = req.params;
        const { first_name, last_name, bio, username } = req.body;
        let updatedUser;
        if (first_name) {

            updatedUser = await sql`
                UPDATE users
                SET first_name = ${first_name}
                WHERE user_id = ${userId}
                RETURNING *
            `;
        }
        if (last_name) {

            updatedUser = await sql`
                UPDATE users
                SET last_name = ${last_name}
                WHERE user_id = ${userId}
                RETURNING *
            `;
        }
        if (bio) {
            updatedUser = await sql`
                UPDATE users
                SET bio = ${bio}
                WHERE user_id = ${userId}
                RETURNING *
            `;
        }
        if (username) {
            updatedUser = await sql`
                UPDATE users
                SET username = ${username}
                WHERE user_id = ${userId}
                RETURNING *
            `;
        }
        res.json({ success: true, message: 'Profile updated successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/:userId/account', async (req, res) => {
    try {
        const { userId } = req.params;
        const { email, password, gender } = req.body;
        let updatedUser;
        if (email) {

            updatedUser = await sql`
                UPDATE users
                SET email = ${email}
                WHERE user_id = ${userId}
                RETURNING *
            `;
        }
        if (password) {

            updatedUser = await sql`
                UPDATE users
                SET password = ${password}
                WHERE user_id = ${userId}
                RETURNING *
            `;
        }
        if (gender) {
            updatedUser = await sql`
                UPDATE users
                SET gender = ${gender}
                WHERE user_id = ${userId}
                RETURNING *
            `;
        }
        res.json({ success: true, message: 'Profile updated successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/:userId/followers', async (req, res) => {
    try {
        const { userId } = req.params;

        const followers = await sql`
            SELECT *
            FROM followers f inner join users u
            on f.follower_user_id=u.user_id
           WHERE f.user_id = ${userId}
        `;

        res.json(followers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:userId/following', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(userId)
        const following = await sql`
            SELECT *
            FROM following f inner join users u
            on f.following_user_id=u.user_id
           WHERE f.user_id = ${userId}
        `;

        res.json(following);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:userId/delete', async (req, res) => {
    try {
        const { userId } = req.params;


        await sql`DELETE FROM users WHERE user_id = ${userId}`;

        // You might want to delete associated data from other tables (e.g., followers, following)

        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
