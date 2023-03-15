const express = require("express");
const { db, checkAuth } = require("../server");

const router = express.Router();

router.use(express.json({ limit: "1gb" }));

//gambar baru
router.post("/new", async (req, res) => {
  const token = req.headers.authorization;
  const nama = req.body.nama;
  const image = req.body.image;
  const thumbnail = req.body.thumbnail;
  const deskripsi = req.body.deskripsi;

  if (
    nama &&
    image &&
    thumbnail &&
    deskripsi &&
    (await checkAuth(token)).admin === 1
  ) {
    await db.run(`INSERT INTO galeri VALUES (?, ?, ?, ?)`, [
      nama,
      image,
      thumbnail,
      deskripsi,
    ]);
    res.sendStatus(200);
    return;
  }

  res.sendStatus(401);
});

//lihat semua thumbnail
router.get("/", async (req, res) => {
  const thumbnails = await db.all(
    `SELECT rowid, nama, deskripsi, thumbnail FROM galeri`
  );
  res.json(thumbnails);
});

//delete gambar
router.delete("/:id", async (req, res) => {
  if ((await checkAuth(req.headers.authorization)).admin === 1) {
    res.json(
      await db.get(`DELETE FROM galeri WHERE rowid = ?`, [req.params.id])
    );
  } else {
    res.sendStatus(403);
  }
});

//edit gambar
router.put("/:id", async (req, res) => {
  if ((await checkAuth(req.headers.authorization)).admin === 1) {
    db.run(`UPDATE galeri SET nama = ?, deskripsi = ? WHERE rowid = ?`, [
      req.body.nama,
      req.body.deskripsi,
      req.params.id,
    ]);
    res.end();
  } else {
    res.sendStatus(403);
  }
});

//lihat gambar
router.get("/:id", async (req, res) => {
  try {
    res.json(
      await db.get(`SELECT rowid, * FROM galeri WHERE rowid = ?`, [
        req.params.id,
      ])
    );
  } catch {
    res.sendStatus(404);
  }
});

module.exports = router;
