const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Mongoose models for Menu Items and Orders
const MenuItem = require("./models/MenuItem");
const Order = require("./models/Order");

app.get("/", (req, res) => res.send("MunchMate backend works"));

// Add a menu item route (Admin)
app.post("/menu/add", async (req, res) => {
  try {
    const { name, price, category } = req.body;
    console.log(name, price, category);
    const newItem = new MenuItem({ name, price, category });
    console.log(newItem);
    await newItem.save();

    res.status(200).json({
      success: true,
      message: "Menu item added successfully.",
      item: newItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the item.",
    });
  }
});

// Get all menu items
app.get("/menu", async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.status(200).json({ success: true, items: menuItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({
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

    res.status(200).json({
      success: true,
      message: "Menu item removed successfully.",
      item: deletedItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while removing the item.",
    });
  }
});

//order placing route
app.post("/order", async (req, res) => {
  try {
    const {
      items,
      totalPrice,
      deliveryTime,
      purchaseToken,
      productId,
      packageName,
    } = req.body;

    //const isPaymentValid = await verifyGooglePlayPurchase(purchaseToken, productId, packageName);

    //if (!isPaymentValid) {
    //    return res.status(400).json({ success: false, message: 'Payment verification failed.' });
    //}

    // Payment is successful, process the order with the selected delivery time
    const newOrder = new Order({
      items,
      totalPrice,
      deliveryTime: new Date(deliveryTime), // Store the user-selected delivery time
    });
    await newOrder.save();

    res.status(200).json({
      success: true,
      message: "Order placed successfully.",
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while placing the order.",
    });
  }
});

// Get all orders (Admin)
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().populate("items.itemId");
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching orders.",
    });
  }
});

const URI = process.env.MONGO_URI;

mongoose
  .connect(URI)
  .then(() => {
    console.log("Connected to database!");
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });
