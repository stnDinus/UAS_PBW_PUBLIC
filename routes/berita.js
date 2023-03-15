const express = require("express");
const { db, checkAuth } = require("../server");
const router = express.Router();

router.use(express.json());
router.use(express.text());

//lihat kategori
router.get("/kategori", async (req, res) => {
  const kategori = await db.all("SELECT * FROM kategori");
  res.json(kategori);
});

//lihat semua berita
router.get("/", async (req, res) => {
  res.json(
    await db.all(
      `SELECT id, judul, kategori, substr(isi, 1, 50) AS isi FROM berita`
    )
  );
});

//berita baru
router.post("/", async (req, res) => {
  const token = req.headers["authorization"];
  const judul = req.body.judul;
  const kategori = req.body.kategori;
  const isi = req.body.isi;

  //cek judul kategori dan isi
  if (!(judul && kategori && isi)) {
    res.sendStatus(400);
    return;
  }
  //cek admin
  if ((await checkAuth(token)).admin === 1) {
    try {
      await db.run(
        `INSERT INTO berita (judul, kategori, isi) VALUES (?, ?, ?)`,
        [judul, kategori, isi]
      );
    } catch (error) {
      switch (error.errno) {
        case 19:
          res.sendStatus(400);
          return;
      }
    }
    res.sendStatus(200);
    return;
  }

  res.sendStatus(403);
});

//hapus berita
router.delete("/", async (req, res) => {
  const token = req.headers.authorization;
  if ((await checkAuth(token)).admin === 1) {
    const id = req.body;
    try {
      await db.run(`DELETE FROM berita WHERE id = ?`, [id]);
    } catch {
      res.sendStatus(400);
      return;
    }
    res.sendStatus(200);
    return;
  }
  res.sendStatus(401);
});

//lihat berita
router.get("/:id", async (req, res) => {
  const berita = await db.get(`SELECT * FROM berita WHERE id = ?`, [
    req.params.id,
  ]);
  res.json(berita);
});

//update berita
router.put("/:id", async (req, res) => {
  if ((await checkAuth(req.headers.authorization)).admin === 1) {
    const id = req.params.id;
    const judul = req.body.judul;
    const kategori = req.body.kategori;
    const isi = req.body.isi;

    db.run(
      `
    UPDATE berita
    SET judul = ?, kategori = ?, isi = ?
    WHERE id = ?`,
      [judul, kategori, isi, id]
    );
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

module.exports = router;
