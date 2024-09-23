const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");

app.get("/api/images/:filename", (req, res) => {
  const { filename } = req.params;

  const imagePath = path.join(__dirname, "../public/images", filename);

  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error("Error serving the image:", err);
      res.status(404).json({ success: false, message: "Image not found." });
    }
  });
});
// Add a menu item route (Admin)
app.post("/menu/add", async (req, res) => {
  try {
    const { name, price, category, imageId } = req.body;
    const newItem = new MenuItem({ name, price, category, imageId });
    await newItem.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Menu item added successfully.",
        item: newItem,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while adding the item.",
      });
  }
});

app.post("/orders/search", async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res
      .status(400)
      .json({ success: false, message: "orderId is required." });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error searching for the order." });
  }
});

// Get all menu items
app.get("/menu", async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.status(200).json({ success: true, items: menuItems });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while fetching the menu.",
      });
  }
});

// Delete menu item using id
app.delete("/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedItem) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found." });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Menu item removed successfully.",
        item: deletedItem,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while removing the item.",
      });
  }
});

// Update order status
app.patch("/orders/update-status", async (req, res) => {
  const { orderNumber, status } = req.body;

  if (!orderNumber || !status) {
    return res
      .status(400)
      .json({
        success: false,
        message: "orderNumber and status are required.",
      });
  }

  const validStatuses = ["Pending", "Completed", "Cancelled"];

  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid status value." });
  }

  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { orderNumber },
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Order status updated.",
        order: updatedOrder,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error updating order status." });
  }
});

// Place a new order
app.post("/order", async (req, res) => {
  try {
    const { name, items, totalPrice, deliveryTime } = req.body;

    // Find the last order in the database and handle the case where there are no previous orders
    const lastOrder = await Order.findOne().sort({ orderNumber: -1 });

    // Calculate the next order number, ensuring it is a valid number
    let nextOrderNumber = 1; // Default to 1 if there are no previous orders
    if (lastOrder && lastOrder.orderNumber && !isNaN(lastOrder.orderNumber)) {
      nextOrderNumber = lastOrder.orderNumber + 1;
    }

    // Create a new order
    const newOrder = new Order({
      orderNumber: nextOrderNumber,
      name,
      items,
      totalPrice,
      deliveryTime: new Date(deliveryTime),
    });

    // Save the order
    await newOrder.save();

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Order placed successfully.",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res
      .status(500)
      .json({ success: false, message: "Error placing the order." });
  }
});

// Get all orders (Admin)
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().populate("items.itemId");
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching orders." });
  }
});

// Database connection (no need for app.listen)
mongoose
  .connect(
    "mongodb+srv://karivarkey:0pvHwa1cJyWmoIVJ@cluster0.ozwta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("Connected to database"))
  .catch((error) => console.error("Database connection error:", error));

// Export the Express app (for Vercel)
module.exports = app;
