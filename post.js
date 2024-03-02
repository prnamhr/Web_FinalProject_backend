const express = require('express');
const postgres = require('postgres');
const cors = require('cors');
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

const router = express.Router(); // Fixed typo here
router.use(cors());
router.get('/:postId', async (req, res) => {
    const {postId} = req.params;

    try {
        const post = await sql`
            SELECT * FROM 
            posts
            INNER JOIN users ON posts.user_Id = users.user_Id
            WHERE posts.post_Id = ${postId}`;

        if (post.length === 0) {
            return res.status(404).json({error: 'Post not found'});
        }

        res.json(post[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});
router.post('/:postId/update', async (req, res) => {
    try {
        const {postId} = req.params;
        const {title, description} = req.body;
        let updatedUser;
        if (title) {

            updatedUser = await sql`
                UPDATE posts
                SET title = ${title}
                WHERE post_id = ${postId}
                RETURNING *
            `;
        }
        if (description) {

            updatedUser = await sql`
                UPDATE users
                SET description = ${description}
                WHERE postId = ${postId}
                RETURNING *
            `;
        }
        res.json({success: true, message: 'Profile updated successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.post('/:username/:postId/comment', async (req, res) => {
    const {username, postId} = req.params;
    const {comment_text} = req.body;
    try {
        const result = await sql`
            INSERT INTO comments (post_id, user_id, comment_text)
            VALUES (${postId}, (SELECT user_id FROM users WHERE username = ${username}), ${comment_text})
            RETURNING *`;

        res.status(201).json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.get('/:postId/comments', async (req, res) => {
    const {postId} = req.params;

    try {
        const comments = await sql`
            SELECT * FROM comments
            INNER JOIN users ON comments.user_Id = users.user_Id
            WHERE post_id = ${postId}`;
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});
router.get('/:username/isFollowing/:targetUsername', async (req, res) => {
    const {username, targetUsername} = req.params;

    try {
        // Check if the user is following the target user
        const isFollowing = await sql`
            SELECT * FROM following
            WHERE user_id = (SELECT user_id FROM users WHERE username = ${username})
            AND following_user_id = (SELECT user_id FROM users WHERE username = ${targetUsername})`;

        res.json({isFollowing: isFollowing.length > 0});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.get('/:userId/:postId/isSaved/', async (req, res) => {
    const {userId, postId} = req.params;

    try {

        const isSaved = await sql`
            SELECT * FROM saved_posts
            WHERE user_id =  ${userId}
            AND post_Id =  ${postId}`;

        res.json({isSaved: isSaved.length > 0});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.post('/:username/follow', async (req, res) => {
    const {username} = req.params;
    console.log(username);

    const {user_id} = req.body;
    console.log(user_id);
    try {
        const isFollowing = await sql`
            SELECT * FROM following
            WHERE user_id = (SELECT user_id FROM users WHERE username = ${username})
            AND following_user_id = ${user_id}`;
        console.log('hiii');
        if (isFollowing.length > 0) {
            await sql`
                DELETE FROM following
                WHERE user_id = (SELECT user_id FROM users WHERE username = ${username})
                AND following_user_id = ${user_id}`;

            await sql`
                DELETE FROM followers
                WHERE user_id = ${user_id}
                AND follower_user_id = (SELECT user_id FROM users WHERE username = ${username})`;
            res.json({isFollowing: false});
        } else {

            const result = await sql`
                INSERT INTO following (user_id, following_user_id)
                VALUES (
                    (SELECT user_id FROM users WHERE username = ${username}),
                    ${user_id}
                )
                RETURNING *`;

            await sql`
                INSERT INTO followers (user_id, follower_user_id)
                VALUES (${user_id}, (SELECT user_id FROM users WHERE username = ${username}))`;

            res.json({isFollowing: true});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.post('/:postId/savePost', async (req, res) => {
    const {postId} = req.params;
    const {user_id} = req.body;

    try {
        const isSave = await sql`
            SELECT * FROM saved_posts 
            WHERE user_id =  ${user_id}
            AND post_id= ${postId}`;

        if (isSave.length > 0) {
            await sql`
                DELETE FROM saved_posts
                WHERE user_id =  ${user_id}
                AND post_id= ${postId}`;

            res.json({isFollowing: false});
        } else {
            const result = await sql`
                INSERT INTO saved_posts (user_id, post_id)
                VALUES (
                    ${user_id},
                    ${postId}  -- Fix the typo here
                )
                RETURNING *`;

            res.json({isFollowing: true});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.delete('/:postId/delete', async (req, res) => {
    try {
        const {postId} = req.params;

        await sql`DELETE FROM posts WHERE post_id = ${postId}`;

        // You might want to delete associated data from other tables (e.g., followers, following)

        res.json({success: true, message: 'Account deleted successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});
router.get('/:postId/likes', async (req, res) => {
    const {postId} = req.params;

    try {
        const likes = await sql`
            SELECT * FROM liked_posts
            WHERE post_id = ${postId}`;

        res.json(likes);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});
router.post('/:username/:postId/like', async (req, res) => {
    const {username, postId} = req.params;

    try {
        // Check if the user already liked the post
        const likedPost = await sql`
            SELECT * FROM liked_posts
            WHERE user_id = (SELECT user_id FROM users WHERE username = ${username})
            AND post_id = ${postId}`;

        if (likedPost.length > 0) {
            // User already liked the post, remove the like
            await sql`
                DELETE FROM liked_posts
                WHERE user_id = (SELECT user_id FROM users WHERE username = ${username})
                AND post_id = ${postId}`;

            res.json({isLiked: false});
        } else {
            // User hasn't liked the post, add the like
            const result = await sql`
                INSERT INTO liked_posts (user_id, post_id)
                VALUES (
                    (SELECT user_id FROM users WHERE username = ${username}),
                    ${postId}
                )
                RETURNING *`;

            res.json({isLiked: true});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});
router.get('/:username/:postId/like', async (req, res) => {
    const {username, postId} = req.params;

    try {
        // Check if the user liked the post
        const likedPost = await sql`
            SELECT * FROM liked_posts
            WHERE user_id = (SELECT user_id FROM users WHERE username = ${username})
            AND post_id = ${postId}`;

        res.json({isLiked: likedPost.length > 0});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.get('/:userId/saveList', async (req, res) => {
    try {
        const {userId} = req.params;

        const followers = await sql`
            SELECT *
            FROM saved_posts s inner join
            posts p on p.post_id=s.post_id inner join
            users u
            on s.user_id=u.user_id
            where u.user_id=${userId}
        `;

        res.json(followers);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;
