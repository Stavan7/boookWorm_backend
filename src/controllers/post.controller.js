import Post from "../models/post.model.js";
import cloudinary from "../lib/cloudinary.js";

export const createPost = async (req, res) => {
	try {
		const { title, caption, rating, image, genre } = req.body;
		console.log(genre, "GENRE");

		if (!title || !caption || !rating) {
			return res.status(400).json({ message: "Please provide all fields" });
		}

		//save these values to database
		let imageUrl = null;

		if (image) {
			const imageUploadResponse = await cloudinary.uploader.upload(image);
			imageUrl = imageUploadResponse.secure_url;
		}

		const newPost = new Post({
			title,
			caption,
			rating,
			genre,
			image: imageUrl,
			user: req.user._id,
		});

		await newPost.save();

		res.status(201).json(newPost);
	} catch (error) {
		console.log("error uploading post ", error); // corrected log message
		res.status(500).json({ message: "Internal Server Error" }); // corrected typo in 'message'
	}
};

export const getAllPost = async (req, res) => {
	try {
		//pagination logic
		const page = req.query.page || 1;
		const limit = req.query.limit || 5;
		const skip = (page - 1) * limit;

		const posts = await Post.find() // changed from Book to Post
			.sort({ createdAt: -1 }) // newest first
			.skip(skip)
			.limit(limit)
			.populate("user", "username profileImage");

		const totalPost = await Post.countDocuments(); // changed from Book to Post

		//default status is 200
		res.send({
			posts,
			currentPage: page,
			totalPost,
			totalPages: Math.ceil(totalPost / limit),
		});
	} catch (error) {
		console.log("error fetching Post ", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const getUserPost = async (req, res) => {
	try {
		const post = await Post.find({ user: req.user._id }).sort({
			createdAt: -1,
		});
		res.json(post);
	} catch (error) {
		console.log("error fetching user specific Post ", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};

export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ message: "Post not found" });
		}

		//check if user is creator of the post
		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		//delete image from cloudinary
		if (post.image && post.image.includes("cloudinary")) {
			try {
				const publicId = post.image.split("/").pop().split(".")[0];
				await cloudinary.uploader.destroy(publicId);
			} catch (error) {
				console.log("Error deleting image from cloudinary");
			}
		}

		await post.deleteOne();
		res.json({ message: "Post deleted successfully" });
	} catch (error) {
		console.log("error deleting books ", error);
		res.status(500).json({ mesage: "Internal Server Error" });
	}
};