const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Buat Akun Admin (Hanya untuk pengembang)
const registerAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Default role di database sudah 'admin' dari tahap sebelumnya
        await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, "admin")', [username, hashedPassword]);
        res.status(201).json({ success: true, message: 'Akun Admin berhasil dibuat!' });
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
        // Secara eksplisit menetapkan role sebagai 'user'
        await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, "user")', [username, hashedPassword]);
        res.status(201).json({ success: true, message: 'Akun Penonton berhasil dibuat!' });
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

        // SISIPKAN ROLE KE DALAM TIKET JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            'KUNCI_RAHASIA_STREAMS',
            { expiresIn: '24h' }
        );

        // Kembalikan token dan role agar frontend tahu siapa yang sedang login
        res.status(200).json({ success: true, message: 'Login berhasil!', token, role: user.role });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { registerAdmin, registerUser, login };