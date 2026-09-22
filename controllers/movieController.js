const pool = require('../config/database');

const getAllMovies = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const offset = (page - 1) * limit;

        const [countResult] = await pool.query('SELECT COUNT(*) AS total FROM film');
        const totalData = countResult[0].total;
        const totalPages = Math.ceil(totalData / limit);

        const querySql = `SELECT * FROM film ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
        const [rows] = await pool.query(querySql);

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                totalData: totalData,
                currentPage: page,
                totalPages: totalPages,
                hasNextPage: page < totalPages
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

const searchMovies = async (req, res) => {
    try {
        const keyword = req.query.q;

        if (!keyword) {
            return res.status(400).json({ success: false, message: 'Masukkan kata kunci pencarian!' });
        }

        const querySql = `
            SELECT * FROM film
            WHERE judul LIKE ? OR genre LIKE ?
            ORDER BY id DESC
        `;

        const searchQuery = `%${keyword}%`;
        const [rows] = await pool.query(querySql, [searchQuery, searchQuery]);

        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

const createMovie = async (req, res) => {
    try {
        const { judul, tahun, sutradara, deskripsi, genre, trailer_url, imageUrl } = req.body;

        let imgsrc = null;

        if (req.file) {
            imgsrc = 'http://localhost:5000/images/' + req.file.filename;
        } else if (imageUrl) {
            imgsrc = imageUrl;
        }

        const querySql = 'INSERT INTO film (judul, tahun, sutradara, foto, deskripsi, genre, trailer_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const values = [judul, tahun, sutradara, imgsrc, deskripsi, genre, trailer_url];

        await pool.query(querySql, values);
        res.status(201).json({ success: true, message: 'Film berhasil ditambahkan!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal menambahkan data', error: error.message });
    }
};

const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const { judul, tahun, sutradara, deskripsi, genre, trailer_url, imageUrl } = req.body;

        const [checkData] = await pool.query('SELECT * FROM film WHERE id = ?', [id]);
        if (checkData.length === 0) return res.status(404).json({ success: false, message: 'Film tidak ditemukan!' });

        let querySql;
        let values;

        if (req.file) {
            const imgsrc = 'http://localhost:5000/images/' + req.file.filename;
            querySql = `UPDATE film SET judul=?, tahun=?, sutradara=?, deskripsi=?, genre=?, trailer_url=?, foto=? WHERE id=?`;
            values = [judul, tahun, sutradara, deskripsi, genre, trailer_url, imgsrc, id];
        } else if (imageUrl) {
            querySql = `UPDATE film SET judul=?, tahun=?, sutradara=?, deskripsi=?, genre=?, trailer_url=?, foto=? WHERE id=?`;
            values = [judul, tahun, sutradara, deskripsi, genre, trailer_url, imageUrl, id];
        } else {
            querySql = `UPDATE film SET judul=?, tahun=?, sutradara=?, deskripsi=?, genre=?, trailer_url=? WHERE id=?`;
            values = [judul, tahun, sutradara, deskripsi, genre, trailer_url, id];
        }

        await pool.query(querySql, values);
        res.status(200).json({ success: true, message: 'Film berhasil diperbarui!' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal update data', error: error.message });
    }
};

const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;

        const [checkData] = await pool.query('SELECT * FROM film WHERE id = ?', [id]);
        if (checkData.length === 0) {
            return res.status(404).json({ success: false, message: 'Film tidak ditemukan!' });
        }

        await pool.query('DELETE FROM film WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: 'Film berhasil dihapus!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal hapus data', error: error.message });
    }
};

const getMovieById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM film WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Film tidak ditemukan!' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
module.exports = {
    getAllMovies,
    searchMovies,
    createMovie,
    updateMovie,
    deleteMovie,
    getMovieById
};
