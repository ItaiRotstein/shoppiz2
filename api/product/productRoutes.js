const express = require('express')
const router = express.Router()
const {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductById,

} = require('./productController')

const { protect } = require('../../middleware/authMiddleware')

router.route('/').get(getProducts).post(protect, addProduct)
router.route('/:id').delete(protect, deleteProduct).put(protect, updateProduct).get(protect, getProductById)

module.exports = router
