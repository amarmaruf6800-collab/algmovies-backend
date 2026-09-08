const pool = require('../config/database');

// 1. Tambah ke Watchlist
const addWatchlist = async (req, res) => {
    try {
        const userId = req.user.id; // Didapat dari token JWT
        const { movieId } = req.body;

        // Cek apakah film sudah ada di watchlist user ini agar tidak dobel
        const [checkData] = await pool.query('SELECT * FROM watchlist WHERE user_id = ? AND movie_id = ?', [userId, movieId]);
        if (checkData.length > 0) {
            return res.status(400).json({ success: false, message: 'Film sudah ada di Daftar Anda!' });
        }

        await pool.query('INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)', [userId, movieId]);
        res.status(201).json({ success: true, message: 'Berhasil ditambahkan ke Watchlist!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// 2. Lihat isi Watchlist milik user yang sedang login
const getMyWatchlist = async (req, res) => {
    try {
        const userId = req.user.id;
        // Gabungkan tabel watchlist dan film menggunakan JOIN
        const querySql = `
            SELECT film.*, watchlist.id AS watchlist_id 
            FROM watchlist 
            JOIN film ON watchlist.movie_id = film.id 
            WHERE watchlist.user_id = ?
            ORDER BY watchlist.id DESC
        `;
        const [rows] = await pool.query(querySql, [userId]);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// 3. Hapus dari Watchlist
const removeWatchlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params; // ini ID dari tabel watchlist

        await pool.query('DELETE FROM watchlist WHERE id = ? AND user_id = ?', [id, userId]);
        res.status(200).json({ success: true, message: 'Dihapus dari Watchlist!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = { addWatchlist, getMyWatchlist, removeWatchlist };