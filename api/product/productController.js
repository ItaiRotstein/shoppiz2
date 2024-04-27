const asyncHandler = require("express-async-handler");

const Product = require("../../models/productModel");
const User = require("../../models/userModel");

// @desc    Get products
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
  const {
    sort,
    byStock,
    byFastDelivery,
    byRating,
    itemsPerPage,
    pageNum,
    searchQuery
  } = req.query;
  
  const pipline = [
    {
      $facet: {
        metadata: [{ $count: 'totalCount' }],
        data: [{ $skip: +pageNum * +itemsPerPage }, { $limit: +itemsPerPage }],
      }
    },
  ];
  if (searchQuery) {
    pipline.unshift({ $match: { name: { $regex: '.*' + searchQuery + '.*', $options: 'i' } } });
  }
  if (sort) {
    const sortOrder = sort === 'lowtohigh' ? 1 : -1;
    pipline.unshift({ $sort: { price: sortOrder } });
  }
  if (byStock === 'false') {
    pipline.unshift({ $match: { inStock: { $gt: 0 } } });
  }
  if (byFastDelivery === 'true') {
    pipline.unshift({ $match: { fastDelivery: true } });
  }
  if (Number(byRating) > 0) {
    pipline.unshift({ $match: { rating: { $gte: Number(byRating) } } });
  }

  const products = await Product.aggregate(pipline);

  if (!products) {
    res.status(400);
    throw new Error("Product not found");
  }
  res.status(200).json({
    success: true,
    products: {
      metadata: { totalCount: products[0].metadata[0].totalCount },
      data: products[0].data,
    }
  });
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  console.log(product);
  if (!product) {
    res.status(400);
    throw new Error("Product not found");
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error("User not found");
  }

  // Make sure the logged in user matches the product user
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  res.status(200).json(product);
});

// @desc    Add product
// @route   POST /api/products
// @access  Private
const addProduct = asyncHandler(async (req, res) => {
  if (!req.body.text) {
    res.status(400);
    throw new Error("Please add a text field");
  }

  const product = await Product.create({
    text: req.body.text,
    user: req.user.id,
  });

  res.status(200).json(product);
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(400);
    throw new Error("Product not found");
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error("User not found");
  }

  // Make sure the logged in user matches the product user
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedProduct);
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(400);
    throw new Error("Product not found");
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error("User not found");
  }

  // Make sure the logged in user matches the product user
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  await product.deleteOne();

  res.status(200).json({ id: req.params.id });
});

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
