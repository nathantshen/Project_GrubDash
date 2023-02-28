const router = require("express").Router();
const controller = require("./orders.controller")
const methodNotAllowed = require("../errors/methodNotAllowed");

// TODO: Implement the /orders routes needed to make the tests pass
router
  .route("/:orderId")
  .get(controller.getOrder)
  .put(controller.updateOrder)
  .delete(controller.deleteOrder)
  .all(methodNotAllowed)
router
  .route("/")
  .get(controller.getAll)
  .post(controller.createOrder)
  .all(methodNotAllowed)

module.exports = router;
