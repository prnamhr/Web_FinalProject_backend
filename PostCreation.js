const firebase = require('firebase/app');
const { getStorage, ref, uploadBytes } = require('firebase/storage');

const express = require('express');
const postgres = require('postgres');
const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(), // Use memory storage or configure a destination folder
    limits: {
        fileSize: 1024 * 1024 * 20, // 20MB limit
    },
});

const config = require('./config'); //
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


const router = express.Router();
const app = firebase.initializeApp(firebaseConfig);
const storage = getStorage(app)
router.post('/', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { user_id, title, description, board_id } = req.body;
        const photoFileName = req.file.originalname;

        const storageRef = ref(storage, `uploads/${photoFileName}`);

        await uploadBytes(storageRef, req.file.buffer);

        const photoUrl = `uploads/${photoFileName}`;
        const newPost = await sql`
            INSERT INTO posts (user_id, photo_content, title, description)
            VALUES (${user_id}, ${photoUrl}, ${title || null}, ${description || null})
            RETURNING *;
        `;
        res.json(newPost[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/getUserId', async (req, res) => {
    try {
        const { username } = req.query;
        const userIdResult = await sql`
            SELECT user_id
            FROM users
            WHERE username = ${username};
        `;
        if (userIdResult.length > 0) {
            res.json({ user_id: userIdResult[0].user_id });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;