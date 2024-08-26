const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String, // Example: "Snacks", "Beverages"
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
