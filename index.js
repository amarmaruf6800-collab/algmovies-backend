require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const movieRoutes = require('./routes/movieRoutes');
const authRoutes = require('./routes/authRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const app = express();
const multer = require('multer');
const path = require('path');
const PORT = process.env.PORT || 3306;


app.use(cors());
app.use(express.json());
app.use('/images', express.static('public/images'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/watchlist', watchlistRoutes);


app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));