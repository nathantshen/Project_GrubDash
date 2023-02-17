const path = require("path");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//createDish
function createDish(req, res, next) {
  const { data: { name , description, price , image_url} } = req.body;
  if (name && description && price && image_url && Number.isInteger(price) && price > 0) {
    const newDish = {
    id: dishes.length +2 +"",
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
  } else {
    next({status: 400, message: "name, description, image_url, price missing"});
  }
}

function getOne(req, res, next){
 const { dishId } = req.params;
  const foundDish = dishes.find((dish)=>{
    if (dish.id == dishId){
      return true
    }
  });
  if (foundDish) {
   res.json({ data: foundDish });
  } else {
    next({
      status: 404,
      message: `id not found: ${req.params.dishId}`,
    });
  }
}

function updateDish(req, res, next) {
  const {dishId} = req.params;
  const { data: {id, name , description, price , image_url} } = req.body 
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (!foundDish){
    return next({
      status: 404,
      message: `Dish does not exist: ${req.params.dishId}`,
    });
  }
  
  if (Number.isInteger(price) == false || id && dishId != id || !name || !description || !price || !image_url || price < 0 ){
     return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}, name, description, image_url, price missing`,
    });
   }

      foundDish.name = name;
      foundDish.description = description;
      foundDish.price = price;
      foundDish.image_url = image_url;
      res.json({ data: foundDish }); 
}

function getAll(req,res){
  res.json({data: dishes})
}

module.exports ={
  createDish,
  getOne,
  updateDish,
  getAll
}