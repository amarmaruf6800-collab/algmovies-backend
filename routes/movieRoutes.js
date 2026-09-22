const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const movieController = require('../controllers/movieController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
var upload = multer({ storage: storage });

router.get('/', movieController.getAllMovies);
router.get('/search', movieController.searchMovies);
router.get('/:id', movieController.getMovieById);

router.post('/', verifyToken, verifyAdmin, upload.single('image'), movieController.createMovie);
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), movieController.updateMovie);
router.delete('/:id', verifyToken, verifyAdmin, movieController.deleteMovie);

module.exports = router;
