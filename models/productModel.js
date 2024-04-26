const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    price: {
      type: Number,
      required: [true, 'Please add price'],
    },
    image: {
      type: String,
      required: [true, 'Please add image URL'],
    },
    fastDelivery: {
      type: Boolean,
      required: [true, 'Please add fast delivery option'],
    },
    inStock: {
      type: Number,
      required: [true, 'Please add stock'],
    },
    rating: {
      type: Number,
      required: [true, 'Please add rating'],
    },
    qty: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);