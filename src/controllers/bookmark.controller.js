import Book from "../models/books.model.js";
import Bookmark from "../models/bookmark.model.js";

export const toggleBookmark = async (req, res) => {
	try {

		const userId = req.user._id;
		const { postId } = req.params;
		console.log({
			"USER ID": userId,
			"POST ID": postId
		})

		if (!postId) {
			return res.status(400).json({ message: 'Post Id is required' })
		}

		//check if the post exists
		const postExists = await Book.findById(postId)

		if (!postExists) {
			return res.status(404).json({ message: 'Post not found' })
		}

		//check if this post has already been bookmarked

		const existingBookmark = await Bookmark.findOne({ user: userId, post: postId })

		if (existingBookmark) {
			//delete the existing bookmark from db
			await Bookmark.findOneAndDelete({ user: userId, post: postId })
			return res.status(200).json({ message: 'Bookmark removed successfully' })
		} else {
			//create new bookmark
			const newBookmark = new Bookmark({ user: userId, post: postId })
			await newBookmark.save()
			return res.status(201).json({
				isBookmarked: true,
				bookmark: newBookmark,
				message: 'Bookmark added successfully',
			})
		}
	} catch (error) {
		console.log("Error toggling bookmark:", error)
		res.status(500).json({ message: "Internal Server Error" })
	}
}

export const getUserBookmark = async (req, res) => {
	try {
		const userId = req.user._id

		const bookmarks = await Bookmark.find({ user: userId })
			.populate({
				path: "post",
				model: "Book",
				populate: {
					path: "user",
					model: "User",
					select: "username profileImage"
				}
			})
			.sort({ createdAt: -1 })

		const formattedResponse = bookmarks.map(bookmark => ({
			...bookmark.post.toObject(),
			user: bookmark.post.user.toObject()
		}));

		res.status(200).json(formattedResponse)

	} catch (error) {
		console.log("Error fetching user bookmarks:", error)
		res.status(500).json({ message: "Internal Server Error" })
	}
}

export const checkBookmarkStatus = async (req, res) => {
	try {
		const { postId } = req.params
		const userId = req.user._id

		// Validate book ID
		if (!postId) {
			return res.status(400).json({ message: "Post ID is required" })
		}

		// Check if bookmark exists
		const bookmark = await Bookmark.findOne({ user: userId, post: postId })

		res.status(200).json({
			isBookmarked: !!bookmark,
		})

	} catch (error) {
		console.log("Error checking bookmark status:", error)
		res.status(500).json({ message: "Internal Server Error" })
	}
}
