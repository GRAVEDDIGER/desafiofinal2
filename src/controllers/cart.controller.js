const colors = require('colors')
const ItemClass = require('../services/jsonDAO').ItemClass
const uuid = require('uuid')
const DbManager = require('../services/dbPicker')
const cartDbManager = new DbManager('cart').database
function CartControllers () {
  const createCart = async (_req, res) => {
    try {
      const response = await cartDbManager.addItem({ id: 0, timeStamp: Date.now(), products: [] })
      res.status(201).send(response)
    } catch (err) { res.status(400).send({ status: 400, statusText: 'Didnt Create Resource (Cart)', err: 'Didnt Create Resource (Cart)', ok: false, data: [] }) }
  }

  const addProduct = async (req, res) => {
    console.log('addproduct', req.body)
    try {
      const data = { ...req.body, id: uuid.v4() }
      const id = req.params.id
      const transitionObject = await cartDbManager.getById(id)
      const cleanObject = transitionObject.data
      if (!Array.isArray(cleanObject.products)) cleanObject.products = []
      console.log(transitionObject, id, 'DATA:', data, colors.red(cleanObject))
      cleanObject.products.push(new ItemClass(data.id, data.name, data.description, data.code, data.image, data.price, data.stock))
      console.log(colors.red(cleanObject), 'CleanObj')
      const response = await cartDbManager.updateById(cleanObject, req.params.id)
      res.status(response.status).send(response)
    } catch (e) { res.status(400).send({ err: 'Unable to add item to the cart ', status: 400, ok: false, statusText: 'Error adding item to cart' }) }
  }
  const getCart = async (req, res) => {
    const id = parseInt(req.params.id) || req.params.id
    try {
      console.log('getcart', id)
      const data = await cartDbManager.getById(id)
      res.status(data.status).send(data)
    } catch (e) { res.status(400).send({ err: 'Unable to get cart' }) }
  }
  const deleteCart = async (req, res) => {
    const id = parseInt(req.params.id) || req.params.id
    let data
    const doc = await cartDbManager.getById(id)
    if (doc.ok) {
      data = await cartDbManager.deleteById(id)
    } else data = { status: 400, err: 'Cart doesnt exist', ok: false, statusText: 'Cart does not exist', data: id }
    res.status(data.status).send(data)
  }
  const deleteProduct = async (req, res) => {
    const { id, idProd } = req.params
    let response
    const { data, ok } = await cartDbManager.getById(id)
    if (ok) {
      const index = data.products.findIndex((product) => { return product.id === idProd })
      data.products.splice(index, 1)
      response = await cartDbManager.updateById(data, id)
    } else response = { status: 400, statusText: 'The cart doesnt exist', ok: false, err: 'Id doesnt exist', data: { id, idProd } }
    res.status(response.status).send(response)
  }
  return { createCart, addProduct, getCart, deleteCart, deleteProduct }
}

module.exports = CartControllers
