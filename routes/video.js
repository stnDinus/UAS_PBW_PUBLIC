const express = require("express");
const { db, checkAuth } = require("../server");

const router = express.Router();

router.use(express.json());

router.get("/", async (req, res) => {
  res.json(await db.all(`SELECT rowid, * FROM vkegiatan`));
});

router.post("/new", async (req, res) => {
  const id = req.query.id;
  if (id && (await checkAuth(req.headers.authorization)).admin === 1) {
    await db.run(`INSERT INTO vkegiatan VALUES (?)`, [id]);
    res.sendStatus(200);
  } else {
    res.sendStatus(403);
  }
});

router.delete("/", async (req, res) => {
  const id = req.query.id;
  if (id && (await checkAuth(req.headers.authorization)).admin === 1) {
    await db.run(`DELETE FROM vkegiatan WHERE rowid = ?`, [id]);
    res.sendStatus(200);
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;
