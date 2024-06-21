const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Community = require('../models/community.model');
const Post = require('../models/post.model');
const ensureAuthenticated = require('../middleware/authMiddleware');

// Create a new post
router.get('/create', ensureAuthenticated, async (req, res) => {
    try {
        const userCommunities = await Community.find({ 
            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ] 
        });
        res.render('post-create', { communities: userCommunities });
    } catch (error) {
        console.error('Error fetching user communities:', error);
        res.status(500).send('Error fetching user communities');
    }
});

router.post('/create', ensureAuthenticated, async (req, res) => {
    const { title, content, community } = req.body;

    if (!title || !content || !community) {
        return res.status(400).send('Missing required fields');
    }

    try {
        const newPost = new Post({ title, content, author: req.user._id, community });
        await newPost.save();
        res.redirect(`/post/view/${newPost._id}`);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).send(`Error creating post: ${error.message}`);
    }
});

// View a post
router.get('/view/:id', ensureAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
                               .populate('author', 'username')
                               .populate('community', 'name owner')
                               .populate('comments.author', 'username') // Populate author of comments
                               .exec(); // Make sure to execute the query
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.render('post-view', { post, currentUser: req.user }); // Pass currentUser to the view
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).send('Error fetching post');
    }
});

// Route to delete a post
router.post('/delete/:id', ensureAuthenticated, async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        
        // Check if the current user is authorized to delete the post
        if (!post) {
            return res.status(404).send('Post not found');
        }

        if (req.user._id.toString() !== post.author.toString() && req.user._id.toString() !== post.community.owner.toString()) {
            return res.status(403).send('Unauthorized to delete this post');
        }

        // If authorized, delete the post
        await Post.deleteOne({ _id: postId });

        // Optionally, remove the post from the community's posts array if such an array exists
        // Uncomment the following lines if your Community model has an array of posts
        /*
        await Community.updateOne(
            { _id: post.community },
            { $pull: { posts: postId } }
        );
        */

        // Redirect or send a success message
        res.redirect('/home'); // or you can render a success page or JSON response
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send('Error deleting post');
    }
});


// Route for liking a post
router.post('/like/:postId', ensureAuthenticated, async (req, res) => {
    try {
      const postId = req.params.postId;
      const userId = req.user._id;
  
      // Check if the user has already liked the post
      const post = await Post.findById(postId);
      if (post.likes.includes(userId)) {
        return res.status(400).send('You have already liked this post.');
      }
  
      // Add user's like to the post and save it
      post.likes.push(userId);
      await post.save();
  
      // Add post's like to the user and save it
      req.user.likedPosts.push(postId);
      await req.user.save();
  
      res.render('post-view', { post });
    } catch (error) {
      console.error('Error liking post:', error);
      res.status(500).send('Error liking post.');
    }
});

// Route for commenting on a post
router.post('/comment/:postId', ensureAuthenticated, async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user._id;
        const { content } = req.body; // Extract content from the request body

        // Find the post to comment on
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found.');
        }

        // Add the comment to the post
        post.comments.push({ content, author: userId }); // Push an object containing content and author
        await post.save();

        // Respond with success message
        res.status(200).send('Comment posted successfully.');
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).send('Error posting comment.');
    }
});

  


module.exports = router;
