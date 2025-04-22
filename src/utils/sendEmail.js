import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
	//CREATE A TRANSPORTER
	const transporter = nodemailer.createTransport({
		service: "gmail",
		host: "smtp.gmail.com",
		port: 465,
		secure: true,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	await transporter.sendMail({
		from: process.env.EMAIL_USER,
		to,
		subject,
		html,
	});
};

export default sendEmail;
