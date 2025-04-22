import mongoose from "mongoose";
import User from "./user.model.js";
import genres from "../utils/genres.js";

const postSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		caption: {
			type: String,
			required: true,
		},
		image: {
			type: String,
		},
		genre: {
			type: String,
			enum: genres,
			// required: true,
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: User,
			required: true,
		},
	},
	{ timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;