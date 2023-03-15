const express = require("express");
const { db } = require("../server");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.use(express.json());

checkUsername = async (username) => {
  return await db.get(`SELECT username FROM user WHERE username = ?`, [
    username,
  ]);
};

router.post("/new", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const usernameStatus =
    username.length && username.length < 12 && !(await checkUsername(username));
  const passwordStatus =
    password.length > 6 &&
    password.length < 20 &&
    password.match(/[A-Z]/g) &&
    password.match(/[a-z]/g) &&
    password.match(/[0-9]/g);

  if (usernameStatus && passwordStatus) {
    //hash password
    const hash = await bcrypt.hash(password, 10);
    await db.run(`INSERT INTO user VALUES (?, ?, null)`, [username, hash]);
    res.sendStatus(200);
  } else {
    res.sendStatus(406);
  }
});

router.post("/login", async (req, res) => {
  const inputUsername = req.body.username;
  const inputPassword = req.body.password;

  const user = await db.get(
    `SELECT admin, password FROM user WHERE username = ?`,
    [inputUsername]
  );

  if (user && (await bcrypt.compare(inputPassword, user.password))) {
    const accessToken = jwt.sign(
      { username: inputUsername },
      process.env["ACCESS_TOKEN_SECRET"]
    );
    res.json({ accessToken: accessToken, admin: user.admin });
  } else {
    res.sendStatus(406);
  }
});

//cek username terpakai
router.post("/:user", async (req, res) => {
  (await checkUsername(req.params.user))
    ? res.sendStatus(200)
    : res.sendStatus(406);
});

module.exports = router;
