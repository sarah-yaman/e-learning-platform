const express = require("express");
const {auth} = require("../auth/auth");
const router = express.Router();
const orderController = require("../controllers/order.controller");

router.route("/new").post( orderController.newOrder);
router.route("/all").get(auth,orderController.getAll);
router.route("/get/:id").get(orderController.getOrderByUser)

module.exports = router;