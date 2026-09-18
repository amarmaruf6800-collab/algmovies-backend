const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fungsi utama disederhanakan: Biarkan TiDB yang membuat ID otomatis!
const createUser = async (username, password, role) => {
    try {
        // KITA TIDAK LAGI MENGIRIMKAN 'id'. Database akan mengisinya otomatis.
        const [result] = await pool.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, password, role]
        );
        
        // result.insertId akan mengambil angka ID yang baru saja dibuat oleh TiDB
        return result.insertId;
    } catch (error) {
        throw error;
    }
};

// 1. Buat Akun Admin (Hanya untuk pengembang)
const registerAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const userId = await createUser(username, hashedPassword, 'admin');
        res.status(201).json({ success: true, userId, message: 'Akun Admin berhasil dibuat!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. Buat Akun Penonton (User Biasa)
const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const userId = await createUser(username, hashedPassword, 'user');
        res.status(201).json({ success: true, userId, message: 'Akun Penonton berhasil dibuat!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. Login Global (Bisa Admin, Bisa User)
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        if (users.length === 0) return res.status(404).json({ success: false, message: 'Username tidak ditemukan!' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Password salah!' });

        // Menggunakan process.env.JWT_SECRET jika ada, atau fallback ke kunci statis
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'KUNCI_RAHASIA_STREAMS',
            { expiresIn: '24h' }
        );

        // Kembalikan token dan role agar frontend tahu siapa yang sedang login
        res.status(200).json({ success: true, message: 'Login berhasil!', token, role: user.role });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { registerAdmin, registerUser, login };
