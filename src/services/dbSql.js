// const Database = require('../config/knex.js')
// const colors = require('colors')
class Products {
  constructor (name, description, code, image, price, stock) {
    this.name = name
    this.description = description
    this.code = code
    this.image = image
    this.price = price
    this.stock = stock
  }
}
class DatabaseHandlder {
  constructor (database, table) {
    this.database = database.database
    this.table = table
    this.products = new Products('string', 'string', 'string', 'string', 'integer', 'integer')
  }

  async isTable () {
    return this.database.schema.hasTable(this.products).then(() => true).catch(() => false)
  }

  async createTable (tableObject) {
    return this.database.schema.createTable(this.table, function (table) {
      const keys = Object.keys(tableObject)
      table.increments('id')
      for (const field of keys) {
        table[tableObject[field]](field)
      }
    }).then(res => { return { status: 201, ok: true, statusText: 'Table created successfully' } }).catch(err => { return { status: 400, ok: false, statusText: 'Failed to create Table', err } })
  }

  async addItem (item) {
    const condicion = await this.isTable()
    if (!condicion) {
      console.log('creatinG table')
      await this.createTable(this.products)
    }
    try {
      await this.database(this.table).insert(item)
      console.log(this.table)
      return {
        data: [item],
        ok: true,
        err: '',
        status: 200,
        textStatus: 'Item added successfully'
      }
    } catch (e) {
      return {
        data: [],
        ok: false,
        err: e,
        status: 400,
        textStatus: 'Unable to add item in the DB'
      }
    }
  }

  async getByID (id) {
    const condicion = await this.isTable()
    if (!condicion) {
      await this.createTable(this.products)
    }
    return this.database(this.table).where({ id }).then(response => {
      return {
        data: JSON.parse(JSON.stringify(response)),
        ok: true,
        err: '',
        status: 200,
        textStatus: 'Element retrived'
      }
    }).catch(e => {
      return {
        data: [],
        ok: false,
        err: '',
        status: 400,
        textStatus: 'Id not found'
      }
    })
  }

  async getAll () {
    const condicion = await this.isTable()
    if (!condicion) {
      await this.createTable(this.products)
    }
    return this.database.select('*').from(this.table).then(response => {
      return {
        data: JSON.parse(JSON.stringify(response)),
        ok: true,
        err: '',
        status: 200,
        textStatus: 'Data retrived'
      }
    }).catch(e => {
      return {
        data: [],
        ok: false,
        err: e,
        status: 400,
        textStatus: 'Couldnt connect to database'
      }
    })
  }

  async updateById (item, id) {
    const condicion = await this.isTable()
    if (!condicion) {
      await this.createTable(this.products)
    }

    this.database(this.table).where({ id }).update(item).then(res => {
      return {
        data: JSON.parse(JSON.stringify(item)),
        ok: true,
        err: '',
        status: 200,
        textStatus: 'Item updated successfully'
      }
    }).catch(err => {
      console.error(err)
      return {
        data: [],
        ok: false,
        err,
        status: 400,
        textStatus: 'Unable to update item in the DB'
      }
    })
  }

  async deleteById (id) {
    const condicion = await this.isTable()
    if (!condicion) {
      await this.createTable(this.products)
    }
    return this.database(this.table).where({ id }).delete().then(res => {
      return {
        data: [],
        ok: true,
        err: '',
        status: 200,
        textStatus: 'Item deleted successfully'
      }
    }).catch(err => {
      return {
        data: [],
        ok: false,
        err,
        status: 400,
        textStatus: 'Unable to update item in the DB'
      }
    })
  }
}

// const db = new Database('products', 'sqlite')
// const dbMan = new DatabaseHandlder(db, 'products')
// dbMan.getAll().then(res => console.log(res))
// dbMan.addItem(new Products('ada', 'dada', 'nnn', 'nnn', 12, 16)).then(res => console.log(res))
// dbMan.updateById(new Products('Adrian', 'daniel', 'abadin', 'fffrr', 12, 44), 2).then(res => console.log(res))
// dbMan.getByID(2).then(res => console.log(res))
module.exports = DatabaseHandlder
