import Book from '../models/books.model.js'
import cloudinary from '../lib/cloudinary.js';

export const createPost = async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body

        if (!title || !caption || !rating || !image) {
            return res.status(400).json({ message: 'Please provide all fields' })
        }

        //upload image first to cloudinary
        const imageUploadResponse = await cloudinary.uploader.upload(image)
        console.log(imageUploadResponse, "image uploader response")
        const imageUrl = imageUploadResponse.secure_url

        //save these values to database

        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id
        })

        await newBook.save();

        res.status(201).json(newBook)

    } catch (error) {
        console.log("error uploading book ", error)
        res.status(500).json({ mesage: 'Internal Server Error' })
    }
}

export const getAllBooks = async (req, res) => {
    try {

        //pagination logic
        const page = req.query.page || 1;
        const limit = req.query.limit || 2;
        const skip = (page - 1) * limit

        const books = await Book.find()
            .sort({ createdAt: -1 }) // newest first
            .skip(skip)
            .limit(limit)
            .populate("user", "username profileImage");


        const totalBooks = await Book.countDocuments();

        //default status is 200
        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit)
        })
    } catch (error) {
        console.log("error fetching books ", error)
        res.status(500).json({ mesage: 'Internal Server Error' })
    }
}

export const getUserBooks = async (req, res) => {
    try {
        const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        console.log("error fetching user specific books ", error)
        res.status(500).json({ mesage: 'Internal Server Error' })
    }
}

export const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        //check if user is creator of the book post
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        //delete image from cloudinary
        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0]
                await cloudinary.uploader.destroy(publicId)
            } catch (error) {
                console.log('Error deleting image from cloudinary')
            }
        }

        await book.deleteOne();
        res.json({ message: 'Book deleted successfully' })
    } catch (error) {
        console.log("error deleting books ", error)
        res.status(500).json({ mesage: 'Internal Server Error' })
    }
}
