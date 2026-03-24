import { get, post, put, destroy } from './helpers/ApiRequestsHelper'
function getUserOrders() {
  return get('orders')
}
function getDetail(id) {
  return get(`orders/${id}`)
}
function createOrder(cart) {
  return post('orders', cart)
}
function updateOrder(cart) {
  console.log(cart)
  return put('orders', cart)
}

function remove(id) {
  return destroy(`orders/${id}`)
}
export { getUserOrders, getDetail, createOrder, updateOrder, remove }
