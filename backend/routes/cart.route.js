import express from 'express'
import { protectedRoute } from '../middlewares/auth.middleware.js'
import { addToCart, getCartProducts, removeAllFromCart, updateQuantity } from '../controllers/cart.controller.js'

const router=express.Router()

router.get('/', protectedRoute, getCartProducts) // get all products from cart
router.post('/', protectedRoute, addToCart) // add new product to cart
router.delete('/', protectedRoute, removeAllFromCart) // delete product from cart
router.put('/:id', protectedRoute, updateQuantity) // update quantity of product

export default router