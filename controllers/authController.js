const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createUser = async (username, password, role) => {
    try {
        const [result] = await pool.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, password, role]
        );

        return result.insertId;
    } catch (error) {
        throw error;
    }
};

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

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        if (users.length === 0) return res.status(404).json({ success: false, message: 'Username tidak ditemukan!' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Password salah!' });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'KUNCI_RAHASIA_STREAMS',
            { expiresIn: '24h' }
        );

        res.status(200).json({ success: true, message: 'Login berhasil!', token, role: user.role });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { registerAdmin, registerUser, login };
