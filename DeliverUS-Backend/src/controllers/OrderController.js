import { Order, Product, Restaurant, User, sequelizeSession } from '../models/models.js'
import moment from 'moment'
import { Op } from 'sequelize'
const generateFilterWhereClauses = function (req) {
  const filterWhereClauses = []
  if (req.query.status) {
    switch (req.query.status) {
      case 'pending':
        filterWhereClauses.push({
          startedAt: null
        })
        break
      case 'in process':
        filterWhereClauses.push({
          [Op.and]: [
            {
              startedAt: {
                [Op.ne]: null
              }
            },
            { sentAt: null },
            { deliveredAt: null }
          ]
        })
        break
      case 'sent':
        filterWhereClauses.push({
          [Op.and]: [
            {
              sentAt: {
                [Op.ne]: null
              }
            },
            { deliveredAt: null }
          ]
        })
        break
      case 'delivered':
        filterWhereClauses.push({
          sentAt: {
            [Op.ne]: null
          }
        })
        break
    }
  }
  if (req.query.from) {
    const date = moment(req.query.from, 'YYYY-MM-DD', true)
    filterWhereClauses.push({
      createdAt: {
        [Op.gte]: date
      }
    })
  }
  if (req.query.to) {
    const date = moment(req.query.to, 'YYYY-MM-DD', true)
    filterWhereClauses.push({
      createdAt: {
        [Op.lte]: date.add(1, 'days') // FIXME: se pasa al siguiente día a las 00:00
      }
    })
  }
  return filterWhereClauses
}

// Returns :restaurantId orders
const indexRestaurant = async function (req, res) {
  const whereClauses = generateFilterWhereClauses(req)
  whereClauses.push({
    restaurantId: req.params.restaurantId
  })
  try {
    const orders = await Order.findAll({
      where: whereClauses,
      include: {
        model: Product,
        as: 'products'
      }
    })
    res.json(orders)
  } catch (err) {
    res.status(500).send(err)
  }
}

const indexCustomer = async function (req, res) {
  try {
    const orders = await Order.findAll({
      where: {
        userId: req.user.id
      },
      include: [
        {
          model: Product,
          as: 'products'
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name', 'description', 'address', 'postalCode', 'url', 'shippingCosts', 'averageServiceMinutes', 'email', 'phone', 'logo', 'heroImage', 'status', 'restaurantCategoryId']
        }
      ],
      order: [
        ['createdAt', 'DESC']
      ]
    })

    const filteredOrders = orders.filter(order => order.status === 'pending')
    // TODO: Comprobar que se rescatan los pedidos en estado 'pending'
    res.status(200).json(filteredOrders)
  } catch (err) {
    res.status(500).send(err)
  }
}

// TODO: Implement the create function that receives a new order and stores it in the database.
// Take into account that:
// 1. If price is greater than 10€, shipping costs have to be 0.
// 2. If price is less or equals to 10€, shipping costs have to be restaurant default shipping costs and have to be added to the order total price
// 3. In order to save the order and related products, start a transaction, store the order, store each product line and commit the transaction
// 4. If an exception is raised, catch it and rollback the transaction

const obtenerProductosParaAñadirYPrecio = async (productosDePeticion, transaction) => {
  let precioTotal = 0
  // Array de IDs de productos
  const productosId = productosDePeticion.map(p => p.productId.toString())
  // Array con productos de la BBDD
  const productosBD = await Product.findAll({ where: { id: productosId } }, { transaction })
  // Guardamos los productos que tenemos que meter luego en OrderProducts
  const productosAñadir = productosDePeticion.map(p => {
    const productoBD = productosBD.find(pBD => pBD.id === p.productId)
    precioTotal += productoBD.price * p.quantity
    return { productId: productoBD.id, quantity: p.quantity, unityPrice: productoBD.price }
  })
  return { productosAñadir, precioTotal }
}

const calcularCostesDeEnvioYPrecioFinal = async (newOrder, precioProductos, restaurantId, transaction) => {
  let shippingCosts = 0
  let precioTotal = precioProductos
  if (precioProductos < 10) {
    const restaurante = await Restaurant.findByPk(restaurantId, { transaction })
    shippingCosts = restaurante.shippingCosts
    precioTotal += shippingCosts
  }
  newOrder.shippingCosts = shippingCosts
  newOrder.price = precioTotal
  await newOrder.save({ transaction })

  return { shippingCosts, precioTotal }
}
// La función guarda todos los productos nuevos en la tabla intermedia
const guardarTablaIntermediaProductos = async (newOrder, productosAñadir, transaction) => {
  const promesas = productosAñadir.map(p => {
    return newOrder.addProduct(p.productId, {
      through: { quantity: p.quantity, unityPrice: p.unityPrice },
      transaction
    })
  })
  await Promise.all(promesas)
}

const create = async (req, res) => {
  // Use sequelizeSession to start a transaction
  const newOrder = Order.build(req.body)
  newOrder.userId = req.user.id
  const transaction = await sequelizeSession.transaction()
  try {
    // Busca los productos de la BBDD y la suma de sus precio por su cantidad.
    const { productosAñadir, precioTotal } = await obtenerProductosParaAñadirYPrecio(req.body.products, transaction)
    // Calcula costes de envio y el precio final del pedido
    await calcularCostesDeEnvioYPrecioFinal(newOrder, precioTotal, req.body.restaurantId, transaction)
    // Añadimos todos los productos a OrderProducts con la mixin function de addProduct
    // https://sequelize.org/docs/v6/core-concepts/assocs/#foohasmanybar
    await guardarTablaIntermediaProductos(newOrder, productosAñadir, transaction)
    await transaction.commit()
    // Devolvemos la nueva order
    const returnOrder = await Order.findByPk(newOrder.id, {
      include: {
        model: Product,
        as: 'products'
      }
    })
    res.json(returnOrder)
  } catch (err) {
    await transaction.rollback()
    res.status(500).send(err)
  }
}

// TODO: Implement the update function that receives a modified order and persists it in the database.
// Take into account that:
// 1. If price is greater than 10€, shipping costs have to be 0.
// 2. If price is less or equals to 10€, shipping costs have to be restaurant default shipping costs and have to be added to the order total price
// 3. In order to save the updated order and updated products, start a transaction, update the order, remove the old related OrderProducts and store the new product lines, and commit the transaction
// 4. If an exception is raised, catch it and rollback the transaction
const update = async function (req, res) {
  // Use sequelizeSession to start a transaction
  const transaction = await sequelizeSession.transaction()
  try {
    await Order.update(req.body, { where: { id: req.params.orderId }, transaction })
    const updatedOrder = await Order.findByPk(req.params.orderId)
    await updatedOrder.setProducts([], { transaction })
    const { productosAñadir, precioTotal } = await obtenerProductosParaAñadirYPrecio(req.body.products, transaction)
    await calcularCostesDeEnvioYPrecioFinal(updatedOrder, precioTotal, updatedOrder.restaurantId, transaction)
    await guardarTablaIntermediaProductos(updatedOrder, productosAñadir, transaction)
    await transaction.commit()
    const returnOrder = await Order.findByPk(updatedOrder.id, {
      include: {
        model: Product,
        as: 'products'
      }
    })
    res.json(returnOrder)
  } catch (err) {
    await transaction.rollback()
    res.status(500).send(err)
  }
}

// TODO: Implement the destroy function that receives an orderId as path param and removes the associated order from the database.
// Take into account that:
// 1. The migration include the "ON DELETE CASCADE" directive so OrderProducts related to this order will be automatically removed.
const destroy = async function (req, res) {
  try {
    const result = await Order.destroy({ where: { id: req.params.orderId } })
    let message = ''
    if (result === 1) {
      message = 'Sucessfuly deleted order id.' + req.params.orderId
    } else {
      message = 'Could not delete order.'
    }
    res.json(message)
  } catch (err) {
    res.status(500).send(err)
  }
}

const confirm = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId)
    order.startedAt = new Date()
    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (err) {
    res.status(500).send(err)
  }
}

const send = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId)
    order.sentAt = new Date()
    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (err) {
    res.status(500).send(err)
  }
}

const deliver = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId)
    order.deliveredAt = new Date()
    const updatedOrder = await order.save()
    const restaurant = await Restaurant.findByPk(order.restaurantId)
    const averageServiceTime = await restaurant.getAverageServiceTime()
    await Restaurant.update({ averageServiceMinutes: averageServiceTime }, { where: { id: order.restaurantId } })
    res.json(updatedOrder)
  } catch (err) {
    res.status(500).send(err)
  }
}

const show = async function (req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId, {
      include: [{
        model: Restaurant,
        as: 'restaurant',
        attributes: ['name', 'description', 'address', 'postalCode', 'url', 'shippingCosts', 'averageServiceMinutes', 'email', 'phone', 'logo', 'heroImage', 'status', 'restaurantCategoryId']
      },
      {
        model: User,
        as: 'user',
        attributes: ['firstName', 'email', 'avatar', 'userType']
      },
      {
        model: Product,
        as: 'products'
      }]
    })
    res.json(order)
  } catch (err) {
    res.status(500).send(err)
  }
}

const analytics = async function (req, res) {
  const yesterdayZeroHours = moment().subtract(1, 'days').set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  const todayZeroHours = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  try {
    const numYesterdayOrders = await Order.count({
      where:
      {
        createdAt: {
          [Op.lt]: todayZeroHours,
          [Op.gte]: yesterdayZeroHours
        },
        restaurantId: req.params.restaurantId
      }
    })
    const numPendingOrders = await Order.count({
      where:
      {
        startedAt: null,
        restaurantId: req.params.restaurantId
      }
    })
    const numDeliveredTodayOrders = await Order.count({
      where:
      {
        deliveredAt: { [Op.gte]: todayZeroHours },
        restaurantId: req.params.restaurantId
      }
    })

    const invoicedToday = await Order.sum(
      'price',
      {
        where:
        {
          createdAt: { [Op.gte]: todayZeroHours }, // FIXME: Created or confirmed?
          restaurantId: req.params.restaurantId
        }
      })
    res.json({
      restaurantId: req.params.restaurantId,
      numYesterdayOrders,
      numPendingOrders,
      numDeliveredTodayOrders,
      invoicedToday
    })
  } catch (err) {
    res.status(500).send(err)
  }
}

const OrderController = {
  indexRestaurant,
  indexCustomer,
  create,
  update,
  destroy,
  confirm,
  send,
  deliver,
  show,
  analytics
}
export default OrderController
