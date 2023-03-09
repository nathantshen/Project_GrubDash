const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));

const nextId = require("../utils/nextId");

// Validation Functions 
function hasName(req, res, next) {
  const { data = {} } = req.body;

  if (!data.name) {
    next({
      status: 400,
      message: "Dish must include a name.",
    });
  }
  // Passing the reqest body data to the next middleware/handler functions using "response.locals"
  res.locals.reqBody = data;
  return next();
}

function hasDescription(req, res, next) {
  const reqBody = res.locals.reqBody;

  if (!reqBody.description) {
    next({
      status: 400,
      message: "Dish must include a description.",
    });
  }

  return next();
}

function hasPrice(req, res, next) {
  const reqBody = res.locals.reqBody;

  if (!reqBody.price || reqBody.price < 0 || typeof reqBody.price !== "number") {
    next({
      status: 400,
      message:
        "Dish must include a price and it must be an integer greater than 0.",
    });
  }

  return next();
}

function hasImageUrl(req, res, next) {
  const reqBody = res.locals.reqBody;

  if (!reqBody["image_url"]) {
    next({
      status: 400,
      message: "Dish must include a image_url",
    });
  }

  return next();
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (foundDish) {
    res.locals.dish = foundDish;
    res.locals.dishId = dishId;
    return next();
  }

  next({
    status: 404,
    message: `Dish does not exist: ${dishId}.`,
  });
}

function MatchId(req, res, next) {
  const dishId = res.locals.dishId;
  const reqBody = res.locals.reqBody;

  if (reqBody.id) {
    if (reqBody.id === dishId) {
      return next();
    }

    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${reqBody.id}, Route: ${dishId}`,
    });
  }

  return next();
}

// Route Handlers

function update(req, res) {
  const dish = res.locals.dish;
  const reqBody = res.locals.reqBody;
  const existingDishProperties = Object.getOwnPropertyNames(dish);

  for (let i = 0; i < existingDishProperties.length; i++) {
    let propName = existingDishProperties[i];
    if (dish[propName] !== reqBody[propName]) {
      dish[propName] = reqBody[propName];
    }
  }
  res.json({ data: dish });
}

function create(req, res) {
  const reqBody = res.locals.reqBody;
  const newDish = {
    ...reqBody,
    id: nextId(),
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function list(req, res) {
  res.json({ data: dishes });
}

module.exports = {
  createDish: [
    hasName,
    hasDescription,
    hasPrice,
    hasImageUrl,
    create,
  ],
  getOne: [dishExists, read],
  updateDish: [
    dishExists,
    hasName,
    hasDescription,
    hasPrice,
    hasImageUrl,
    MatchId,
    update,
  ],
  getAll: list
};
