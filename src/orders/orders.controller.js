const path = require("path");


// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
const dishes = require(path.resolve("src/data/dishes-data"))
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function getAll(req, res, next){
  res.json({data: orders})
}

function createOrder(req, res, next) {
  const { data: { deliverTo , mobileNumber, status , dishes } } = req.body;
  if (Array.isArray(dishes)){
      var validDishes = dishes.every((dish)=>{
    if (dish.quantity && Number.isInteger(dish.quantity) && dish.quantity > 0){
      return true
    } else {
      return false
    }
  })
}
  if (dishes && Array.isArray(dishes) && deliverTo && mobileNumber && validDishes && dishes.length > 0) {
    const newOrder = {
    id: orders.length +2 +"",
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
  } else {
    next({status: 400, message: "quantity, 1, 0, 2, deliverTo, mobileNumber, dishes missing"});
  }
}


function getOrder(req, res, next){
   const { orderId } = req.params;
  const foundOrder = orders.find((order)=>{
    if (order.id == Number(orderId)){
      return true
    }
  });
  if (foundOrder) {
   res.json({ data: foundOrder });
  } else {
    next({
      status: 404,
      message: `id not found: ${req.params.orderId}`,
    });
  }
}

function updateOrder(req, res, next) {
  const { orderId } = req.params;
  const { data: {id , deliverTo , mobileNumber, status, dishes} } = req.body 
  const foundOrder = orders.find((order) => order.id === orderId);
    if (!foundOrder){
    return next({
      status: 404,
      message: `Order does not exist: ${req.params.orderId}`,
    });
  }
  
   if (Array.isArray(dishes)){
      var validDishes = dishes.every((dish)=>{
    if (dish.quantity && Number.isInteger(dish.quantity) && dish.quantity > 0){
      return true
    } else {
      return false
    }
  })
}

  if (id && orderId != id || !deliverTo || !mobileNumber || !status || !dishes || !Array.isArray(dishes) || foundOrder.status === "delivered" || (status != "pending" && status != "preparing" && status != "out-for-delivery") || !validDishes || !dishes.length){
     return next({
      status: 400,
      message: `1, 0, 2, quantity, A delivered order cannot be changed, Order must have a status of pending, preparing, out-for-delivery, delivered, Order id does not match route id. Order: ${id}, Route: ${orderId}, id, deliverTo, mobileNumber, dishes missing`,
    });
   }

      foundOrder.deliverTo = deliverTo;
      foundOrder.mobileNumber = mobileNumber;
      foundOrder.status = status;
      foundOrder.dishes = dishes;
      res.json({ data: foundOrder }); 
}
  
function deleteOrder(req, res, next){
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  
  if (index == -1){
    return next ({status:404, message: `${orderId} not found`})
  } 
  if (orders[index].status !== "pending"){
     return next ({ status: 400, message: "An order cannot be deleted unless it is pending."});
  }
    const deleteOrder = orders.splice(index, 1);
    next ({ status: 204, message: "DELETE"});
}

module.exports = {
  getAll,
  getOrder,
  createOrder,
  getOrder,
  updateOrder,
  deleteOrder
}