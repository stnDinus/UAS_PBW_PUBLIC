const express = require("express");
const { db, checkAuth } = require("../server");

const router = express.Router();

router.use(express.json());

router.post("/new", async (req, res) => {
  const oleh = await checkAuth(req.headers.authorization);
  const judul = req.body.judul;
  const isi = req.body.isi;
  const tanggal = req.body.tanggal;
  const kategori = req.body.kategori;
  const anonim = req.body.anonim;

  //cek null/undefined
  if (oleh && judul && isi && kategori && tanggal) {
    await db.run(`INSERT INTO pengaduan VALUES (?, ?, ?, ?, ?)`, [
      anonim ? "Anonim" : oleh.username,
      judul,
      isi,
      tanggal,
      kategori,
    ]);
    res.sendStatus(200);
  } else {
    res.sendStatus(403);
  }
});

router.get("/", async (req, res) => {
  if ((await checkAuth(req.headers.authorization)).admin === 1) {
    res.json(await db.all(`SELECT rowid, * FROM pengaduan;`));
  } else {
    res.sendStatus(403);
  }
});

router.delete("/:id", async (req, res) => {
  if ((await checkAuth(req.headers.authorization)).admin === 1) {
    await db.run(`DELETE FROM pengaduan WHERE rowid = ?`, [req.params.id]);
    res.sendStatus(200);
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;
