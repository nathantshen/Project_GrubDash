const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));


const nextId = require("../utils/nextId");

// Validation Functions
function hasDeliver(req, res, next) {
  const { data = {} } = req.body;

  if (!data.deliverTo) {
    next({
      status: 400,
      message: "Order must include a deliverTo property.",
    });
  }
  // Passing the reqest body data to the next middleware/handler functions using "response.locals"
  res.locals.reqBody = data;
  return next();
}

function hasNumber(req, res, next) {
  const reqBody = res.locals.reqBody;

  if (!reqBody.mobileNumber) {
    next({
      status: 400,
      message: "Order must include a mobileNumber property.",
    });
  }

  return next();
}

function hasDishes(req, res, next) {
  const reqBody = res.locals.reqBody;

  if (!reqBody.dishes || !reqBody.dishes.length || !Array.isArray(reqBody.dishes)) {
    next({
      status: 400,
      message: "Order must include at least one dish.",
    });
  }

  return next();
}

function hasDishQuanity(req, res, next) {
  const dishes = res.locals.reqBody.dishes;

  const withoutQuantity = dishes.reduce(
    (acc, dish, index) => {
      if (
        !dish.quantity ||
        !dish.quantity > 0 ||
        typeof dish.quantity !== "number"
      ) {
        acc.push(index);
        return acc;
      }
      return acc;
    },
    []
  );

  if (!withoutQuantity.length) {
    return next();
  }
  if (withoutQuantity.length > 1) {
    const Index = withoutQuantity.join(", ");

    next({
      status: 400,
      message: `Dishes ${Index} must have a quantity that is an integer greater than 0.`,
    });
  }

  next({
    status: 400,
    message: `Dish ${withoutQuantity} must have a quantity that is an integer greater than 0.`,
  });
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    res.locals.order = foundOrder;
    res.locals.orderId = orderId;
    return next();
  }

  next({
    status: 404,
    message: `No matching order is found for orderId ${orderId}.`,
  });
}


function MatchId(req, res, next) {
  const orderId = res.locals.orderId;
  const reqBody = res.locals.reqBody;

  if (reqBody.id) {
    if (reqBody.id === orderId) {
      return next();
    }
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${reqBody.id}, Route: ${orderId}`,
    });
  }

  return next();
}

function hasStatus(req, res, next) {
  const reqBody = res.locals.reqBody;

  if (!reqBody.status || reqBody.status === "invalid") {
    next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, or delivered.",
    });
  }

  if (reqBody.status === "delivered") {
    next({
      status: 400,
      message: "A delivered order cannot be changed.",
    });
  }

  return next();
}

function orderPending(req, res, next) {
  const order = res.locals.order;

  if (order.status !== "pending") {
    next({
      status: 400,
      message: "An order cannot be deleted unless it is pending.",
    });
  }

  return next();
}

// Route Handlers
function destroy(req, res) {
  const orderId = res.locals.orderId;
  const orderIndex = orders.findIndex((order) => order.id === orderId);
  orders.splice(orderIndex, 1);
  res.sendStatus(204);
}

function update(req, res) {
  const reqBody = res.locals.reqBody;
  const order = res.locals.order;

  
  const existingOrder = Object.getOwnPropertyNames(order);

  for (let i = 0; i < existingOrder.length; i++) {
    // Updating each value if there is a difference between the existing order and the req body order
    if (existingOrder[i] !== "id" && order[existingOrder[i]] !== reqBody[existingOrder[i]]) {
      order[existingOrder[i]] = reqBody[existingOrder[i]];
    }
  }
  res.json({ data: order });
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

function create(req, res) {
  const reqBody = res.locals.reqBody;
  const newOrder = {
    ...reqBody,
    id: nextId(),
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function list(req, res) {
  res.json({ data: orders });
}

module.exports = {
  create: [
    hasDeliver,
    hasNumber,
    hasDishes,
    hasDishQuanity,
    create,
  ],
  getOne: [orderExists, read],
  update: [
    orderExists,
    hasDeliver,
    hasNumber,
    hasDishes,
    hasDishQuanity,
    MatchId,
    hasStatus,
    update,
  ],
  delete: [orderExists, orderPending, destroy],
  getAll : list
};
