const pool = require('../config/database');

// 1. GET: Ambil Semua Film (Dilengkapi Fitur Pagination / Load More)
const getAllMovies = async (req, res) => {
    try {
        // Tangkap permintaan halaman dari frontend. Default: Halaman 1, Tampilkan 8 film per halaman
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const offset = (page - 1) * limit;

        // Hitung total seluruh film di database untuk mengetahui sisa halaman
        const [countResult] = await pool.query('SELECT COUNT(*) AS total FROM film');
        const totalData = countResult[0].total;
        const totalPages = Math.ceil(totalData / limit);

        // Ambil data film dengan batasan LIMIT dan OFFSET
        // (Gunakan template literal agar angka limit & offset aman dibaca MySQL)
        const querySql = `SELECT * FROM film ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
        const [rows] = await pool.query(querySql);

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                totalData: totalData,
                currentPage: page,
                totalPages: totalPages,
                hasNextPage: page < totalPages // Bernilai true jika masih ada sisa film untuk di-load
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Fungsi Pencarian Film (Search)
const searchMovies = async (req, res) => {
    try {
        // Menangkap parameter 'q' dari URL, cth: ?q=action
        const keyword = req.query.q;

        if (!keyword) {
            return res.status(400).json({ success: false, message: 'Masukkan kata kunci pencarian!' });
        }

        // Gunakan klausa LIKE untuk mencari teks yang mengandung kata kunci
        const querySql = `
            SELECT * FROM film 
            WHERE judul LIKE ? OR genre LIKE ? 
            ORDER BY id DESC
        `;

        // Simbol % digunakan agar MySQL mencari kata di posisi depan, tengah, atau belakang teks
        const searchQuery = `%${keyword}%`;
        const [rows] = await pool.query(querySql, [searchQuery, searchQuery]);

        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// 2. POST: Tambah Film Baru (Support File Upload & URL Gambar Google)
const createMovie = async (req, res) => {
    try {
        const { judul, tahun, sutradara, deskripsi, genre, trailer_url, imageUrl } = req.body;

        let imgsrc = null;

        // Logika Gambar: Prioritaskan file upload, jika kosong gunakan URL
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

// 3. PUT: Update Film 
const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const { judul, tahun, sutradara, deskripsi, genre, trailer_url, imageUrl } = req.body;

        const [checkData] = await pool.query('SELECT * FROM film WHERE id = ?', [id]);
        if (checkData.length === 0) return res.status(404).json({ success: false, message: 'Film tidak ditemukan!' });

        let querySql;
        let values;

        // Cek darimana sumber gambar baru berasal
        if (req.file) {
            // Jika admin upload gambar dari laptop
            const imgsrc = 'http://localhost:5000/images/' + req.file.filename;
            querySql = `UPDATE film SET judul=?, tahun=?, sutradara=?, deskripsi=?, genre=?, trailer_url=?, foto=? WHERE id=?`;
            values = [judul, tahun, sutradara, deskripsi, genre, trailer_url, imgsrc, id];
        } else if (imageUrl) {
            // Jika admin paste URL gambar dari Google
            querySql = `UPDATE film SET judul=?, tahun=?, sutradara=?, deskripsi=?, genre=?, trailer_url=?, foto=? WHERE id=?`;
            values = [judul, tahun, sutradara, deskripsi, genre, trailer_url, imageUrl, id];
        } else {
            // Jika gambar tidak diubah sama sekali
            querySql = `UPDATE film SET judul=?, tahun=?, sutradara=?, deskripsi=?, genre=?, trailer_url=? WHERE id=?`;
            values = [judul, tahun, sutradara, deskripsi, genre, trailer_url, id];
        }

        await pool.query(querySql, values);
        res.status(200).json({ success: true, message: 'Film berhasil diperbarui!' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal update data', error: error.message });
    }
};
// 4. DELETE: Hapus Film
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

//fungsi untuk menambahkan satu film bedasarkan id
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