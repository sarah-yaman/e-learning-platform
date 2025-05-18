const express = require("express");
const router = express.Router();
const { createUser, login, signOut, isAuth, getAllUsers, getUserWithId } = require('../controllers/user.controller');

router.get("/all",getAllUsers)
router.get("/user-details/:id",getUserWithId)
router.post("/create",createUser );
router.post("/login", login);
router.get("/signout", signOut);
router.get("/isAuth", isAuth );


module.exports = router;