const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const { verifyToken } = require('../middleware/auth'); // Hanya butuh login, tidak perlu admin

router.post('/', verifyToken, watchlistController.addWatchlist);
router.get('/', verifyToken, watchlistController.getMyWatchlist);
router.delete('/:id', verifyToken, watchlistController.removeWatchlist);

module.exports = router;