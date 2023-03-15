const express = require("express");
const { db, checkAuth } = require("../server");
const router = express.Router();

router.use(express.json());

router.get("/", async (req, res) => {
  const beritaId = req.query.beritaId;
  if (beritaId) {
    const komentar = await db.all(
      `SELECT rowid, * FROM komentar WHERE beritaId = ?`,
      [beritaId]
    );
    res.json(komentar);
  } else {
    const komentar = await db.all(`SELECT rowid, * FROM komentar`);
    res.json(komentar);
  }
});

router.post("/new", async (req, res) => {
  const oleh = (await checkAuth(req.headers.authorization)).username;
  if (oleh) {
    const beritaId = req.body.beritaId;
    const isi = req.body.isi;

    isi &&
      (await db.run(`INSERT INTO komentar VALUES (?, ?, ?, datetime('now'))`, [
        oleh,
        beritaId,
        isi,
      ]));
    res.end();
  } else {
    res.sendStatus(403);
  }
});

router.delete("/:id", async (req, res) => {
  const rowid = req.params.id;
  if (rowid && (await checkAuth(req.headers.authorization)).admin === 1) {
    await db.run(`DELETE FROM komentar WHERE rowid = ?`, [rowid]);
    res.end();
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;
