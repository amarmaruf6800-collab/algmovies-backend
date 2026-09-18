USE db_movies;

-- Isi ID untuk akun lama yang masih NULL.
SET @next_id = (SELECT COALESCE(MAX(id), 0) FROM users);

UPDATE users
SET id = (@next_id := @next_id + 1)
WHERE id IS NULL
ORDER BY username;

-- Jadikan ID sebagai kunci unik yang dibuat otomatis oleh database.
ALTER TABLE users
    MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (id);