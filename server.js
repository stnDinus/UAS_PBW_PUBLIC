const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const jwt = require("jsonwebtoken");
require("dotenv").config();

(async () => {
  const db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  db.run("PRAGMA foreign_keys = ON");
  //tabel user
  db.run(`
  CREATE TABLE IF NOT EXISTS user (
    username TEXT PRIMARY KEY NOT NULL,
    password TEXT NOT NULL,
    admin INTEGER
  )
`);
  //tabel kategori
  db.run(`
  CREATE TABLE IF NOT EXISTS kategori (
    kategori TEXT PRIMARY KEY
  )
`);
  //tabel berita
  db.run(`
  CREATE TABLE IF NOT EXISTS berita (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    judul TEXT,
    kategori TEXT,
    isi TEXT,
    FOREIGN KEY(kategori) REFERENCES kategori(kategori) ON DELETE CASCADE ON UPDATE CASCADE
  )
`);
  //tabel vkegiatan
  db.run(`
  CREATE TABLE IF NOT EXISTS vkegiatan (
    id TEXT
  )
`);
  //tabel galeri
  db.run(`
  CREATE TABLE IF NOT EXISTS galeri (
    nama TEXT,
    image BLOB,
    thumbnail BLOB,
    deskripsi TEXT
  )
`);
  //tabel aduan
  db.run(`
  CREATE TABLE IF NOT EXISTS aduan (
    judul TEXT,
    isi TEXT
  )
`);
  //tabel komentar
  db.run(`
  CREATE TABLE IF NOT EXISTS komentar (
    oleh TEXT NOT NULL,
    beritaId INTEGER,
    isi TEXT NOT NULL,
    waktu TEXT,
    FOREIGN KEY(oleh) REFERENCES user(username) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(beritaId) REFERENCES berita(id) ON DELETE CASCADE ON UPDATE CASCADE
  )
`);
  //tabel pengaduan
  db.run(`
  CREATE TABLE IF NOT EXISTS pengaduan (
    oleh TEXT NOT NULL,
    judul TEXT NOT NULL,
    isi TEXT NOT NULL,
    tanggal TEXT NOT NULL,
    kategori TEXT NOT NULL
  )
  `);

  checkAuth = async (token) => {
    try {
      const status = jwt.verify(token, process.env["ACCESS_TOKEN_SECRET"]);
      const isAdmin = await db.get(
        `SELECT admin FROM user WHERE username = '${status.username}'`
      );
      return { username: status.username, admin: isAdmin.admin };
    } catch (error) {
      return 0;
    }
  };

  module.exports = { db, checkAuth };

  const app = express();

  //konten static
  app.use(express.static("static"));

  //routing /uesr/*
  app.use("/user", require("./routes/user"));

  //routing /berita/*
  app.use("/berita", require("./routes/berita"));

  //routing /komentar/*
  app.use("/komentar", require("./routes/komentar"));

  //routing /galeri/*
  app.use("/galeri", require("./routes/galeri"));

  //routing /video/*
  app.use("/video", require("./routes/video"));

  //routing /pengaduan/*
  app.use("/pengaduan", require("./routes/pengaduan"));

  //TLS certs
  const fs = require("node:fs")
  const https = require("node:https");
  const fullchain = fs.readFileSync(process.env["FULLCHAIN"])
  const privkey = fs.readFileSync(process.env["PRIVKEY"])

  const port = 443;
  https.createServer({
    key: privkey,
    cert: fullchain
  }, app).listen(port, () => {
    console.clear();
    console.log("Server Berjalan pada port: ", port);
  })
})();
