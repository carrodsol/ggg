// TODO: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available

import { Product, Order } from '#root/src/models/models.js'
import { check } from 'express-validator'

const checkProductsAvailable = async (value, { req }) => {
  try {
    const productos = await getProductosId(value)
    for (const producto of productos) {
      if (producto.availability === false || productos.length !== value.length) {
        return Promise.reject(new Error('Product is not available'))
      }
    }
    return Promise.resolve('Ok')
  } catch (err) {
    return Promise.reject(err)
  }
}

// Consigue todos los productos por ID
const getProductosId = async value => {
  const productosId = value.map(p => p.productId.toString())
  const productos = await Product.findAll({ where: { id: productosId } })
  return productos
}

const checkProductsSameRestaurantCreate = async (value, { req }) => {
  try {
    const productos = await getProductosId(value)
    for (const producto of productos) {
      if (producto.restaurantId !== req.body.restaurantId || productos.length !== value.length) {
        return Promise.reject(new Error('Products are not from the same restaurant'))
      }
    }
    return Promise.resolve('Ok')
  } catch (err) {
    return Promise.reject(err)
  }
}

const checkProductsSameRestaurantUpdate = async (value, { req }) => {
  try {
    const productos = await getProductosId(value)
    if (check(req.body.restaurantId).not().exists) {
      const order = await Order.findByPk(req.params.orderId)
      const restaurantId = order.restaurantId
      for (const producto of productos) {
        if (producto.restaurantId !== restaurantId || productos.length !== value.length) {
          return Promise.reject(new Error('Products are not from the same restaurant'))
        }
      }
      return Promise.resolve('Ok')
    } else {
      for (const producto of productos) {
        if (producto.restaurantId !== req.body.restaurantId || productos.length !== value.length) {
          return Promise.reject(new Error('Products are not from the same restaurant'))
        }
      }
      return Promise.resolve('Ok')
    }
  } catch (err) {
    return Promise.reject(err)
  }
}

const validacionesComunes = [
  check('products').exists().isArray({ min: 1 }).bail(),
  check('products.*.productId').exists().isInt({ min: 1 }),
  check('products.*.quantity').exists().isInt({ min: 1 }),
  check('products').custom(checkProductsAvailable),
  check('sentAt').not().exists(),
  check('deliveredAt').not().exists(),
  check('startedAt').not().exists(),
  check('userId').not().exists(),
  check('price').not().exists(),
  check('shippingCosts').not().exists()
]

const create = [
  check('address').exists({ checkFalsy: true }),
  check('restaurantId').exists().isInt(),
  ...validacionesComunes,
  check('products').custom(checkProductsSameRestaurantCreate)
]

// TODO: Include validation rules for update that should:
// 1. Check that restaurantId is NOT present in the body.
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
// 5. Check that the order is in the 'pending' state.
const update = [
  check('restaurantId').not().exists(),
  check('address').exists({ checkFalsy: true }),
  ...validacionesComunes,
  check('products').custom(checkProductsSameRestaurantUpdate)

  // en validacionesComunes ya verificamos que está en estado pediente porque startedAt no existe
]

export { create, update }
