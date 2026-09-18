const jwt = require('jsonwebtoken');

// Satpam 1: Cek apakah dia punya tiket masuk (Login)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ success: false, message: 'Harap login terlebih dahulu.' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, 'KUNCI_RAHASIA_STREAMS', (err, decoded) => {
        if (err) return res.status(401).json({ success: false, message: 'Token kadaluarsa atau tidak valid.' });

        req.user = decoded; // Menyimpan data user (termasuk role)
        next();
    });
};

// Satpam 2: Cek apakah jabatan dia adalah Admin
const verifyAdmin = (req, res, next) => {
    // req.user didapat dari verifyToken sebelumnya
    if (req.user && req.user.role === 'admin') {
        next(); // Lolos
    } else {
        res.status(403).json({ success: false, message: 'Akses Ditolak! Anda bukan Admin.' });
    }
};

module.exports = { verifyToken, verifyAdmin };