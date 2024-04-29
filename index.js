const express = require('express');
const { connectToMongoDB } = require('./connect');
const urlRoute = require('./routes/url');
const URL = require('./models/url');
const path = require('path');
const staticRoute = require('./routes/staticRouter');

const app = express();
// Set the view engine to ejs
app.set('view engine', 'ejs');

// Point to the views folder
app.set('views', path.resolve('./views'));

const PORT = 8003;

// Connect to MongoDB
connectToMongoDB(
	'mongodb+srv://ahsansatti402:ahsan2233@cluster0.vjrkif1.mongodb.net/short-url'
).then(() => console.log('Mongodb connected'));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define routes
app.use('/url', urlRoute);
app.use('/', staticRoute);

// Endpoint to handle redirection based on shortId
app.get('/:shortId', async (req, res) => {
	try {
		const { shortId } = req.params;
		const entry = await URL.findOneAndUpdate(
			{ shortId },
			{
				$push: { visitHistory: { timestamp: Date.now() } },
			},
			{ new: true } // Return the updated document
		);

		if (!entry) {
			// If the shortId doesn't exist, return a 404 error
			return res.status(404).json({ error: 'Short URL not found' });
		}

		// If entry is found, redirect to the associated URL
		res.redirect(entry.redirectURL);
	} catch (error) {
		console.error('Error during redirection:', error);
		res.status(500).json({ error: 'An error occurred while redirecting' });
	}
});

// Start the server
app.listen(PORT, () => console.log(`Server started at PORT:${PORT}`));
