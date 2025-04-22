import mongoose from 'mongoose'
import User from './user.model.js';
import Post from './post.model.js';

const bookmarkSchema = new mongoose.Schema({
	user: {
		ref: User,
		required: true,
		type: mongoose.Schema.Types.ObjectId
	},
	post: {
		ref: Post,
		required: true,
		type: mongoose.Schema.Types.ObjectId
	}
}, { timestamps: true })


// Compound index to ensure a user can only bookmark a book once
bookmarkSchema.index({ user: 1, post: 1 }, { unique: true })

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

export default Bookmark;
