const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const multer = require('multer');
const path = require('path');
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({ storage: storage });

app.post('/api/movies', upload.single('image'), (req, res) => {
    const judul = req.body.judul;
    const tahun = req.body.tahun;
    const sutradara = req.body.sutradara;

    if (!req.file) {
        console.log("No file upload");
        const querySql = 'INSERT INTO film (judul, tahun, sutradara) values (?,?,?);';
        
        koneksi.query(querySql, [judul, tahun, sutradara], (err, rows, field) => {
            if (err) {
                return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }
            res.status(201).json({ success: true, message: 'Berhasil insert data!' });
        });
    } else {
        console.log(req.file.filename);
        var imgsrc = 'http://localhost:5000/images/' + req.file.filename;
        const foto = imgsrc;
        
        const querySql = 'INSERT INTO film (judul, tahun, sutradara, foto) values (?,?,?,?);';
        
        koneksi.query(querySql, [judul, tahun, sutradara, foto], (err, rows, field) => {
            if (err) {
                return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }
            res.status(201).json({ success: true, message: 'Berhasil insert data!' });
        });
    }
});

app.get('/api/movies', (req, res) => {
    const querySql = 'SELECT * FROM film;';
    koneksi.query(querySql, (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Gagal mengambil data!', error: err });
        }
        res.status(200).json({ success: true, data: rows });
    });
});

app.put('/api/movies/:id', upload.single('image'), (req, res) => {
    const id = req.params.id;
    const judul = req.body.judul;
    const tahun = req.body.tahun;
    const sutradara = req.body.sutradara;
    let foto = null;

    if (req.file) {
        foto = 'http://localhost:5000/images/' + req.file.filename;
    }

    const querySearch = 'SELECT * FROM film WHERE id = ?;';
    const queryUpdate = 'UPDATE film SET judul = ?, tahun = ?, sutradara = ?, foto = ? WHERE id = ?;';

    koneksi.query(querySearch, req.params.id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }
        
        if (rows.length) {
            koneksi.query(queryUpdate, [judul, tahun, sutradara, foto, req.params.id], (err, rows, field) => {
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

app.put('/api/movies/update/:id', (req, res) => {
    const judul = req.body.judul;
    const sutradara = req.body.sutradara;
    const tahun = req.body.tahun;
    
    const querySearch = 'SELECT * FROM film WHERE id=?';
    const queryUpdate = 'UPDATE film SET judul=?, tahun=?, sutradara=? WHERE id=?';
    
    koneksi.query(querySearch, req.params.id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }
        
        if (rows.length) {
            koneksi.query(queryUpdate, [judul, tahun, sutradara, req.params.id], (err, rows, field) => {
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

app.delete('/api/movies/:id', (req, res) => {
    const querySearch = 'SELECT * FROM film WHERE id=?';
    const queryDelete = 'DELETE FROM film WHERE id=?';
    
    koneksi.query(querySearch, req.params.id, (err, rows, field) => {
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }
        
        if (rows.length) {
            koneksi.query(queryDelete, req.params.id, (err, rows, field) => {
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));