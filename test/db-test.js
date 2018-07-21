'use strict'

const test = require('ava')
const r = require('rethinkdb')
const uuid = require('uuid-base62')
const Database = require('../db/database')
const fixtures = require('./fixtures')

const dbName = `academy_db_${uuid.v4()}`
const db = new Database({ db: dbName })

test.before('setup database', async t => {
  await db.connect()
  t.true(db.connected, 'should be connected in database')
})

test('save image', async t => {
  t.is(typeof db.saveImage, 'function', 'saveImage is function')

  let image = fixtures.getImage()
  let created = await db.saveImage(image)

  t.is(created.url, image.url)
  t.is(created.description, image.description)
  t.is(created.likes, image.likes)
  t.is(created.liked, image.liked)
  t.deepEqual(created.tags, [
    'awesome',
    '123store'
  ])
  t.is(created.user_id, image.user_id)
  t.is(typeof created.id, 'string')

  t.is(created.public_id, uuid.encode(created.id))
  t.truthy(created.createdAt)
})

test('like to image', async t => {
  t.is(typeof db.likeImage, 'function', 'likeImage is function')
  let image = fixtures.getImage()
  let created = await db.saveImage(image)
  let result = await db.likeImage(created.public_id)

  t.true(result.liked)
  t.is(result.likes, image.likes + 1)
})

test('get image', async t => {
  t.is(typeof db.getImage, 'function', 'getImage is function')

  let image = fixtures.getImage()
  let created = await db.saveImage(image)
  let result = await db.getImage(created.public_id)

  t.deepEqual(created, result)
})

test.after('setup database', async t => {
  await db.disconnect()
  t.false(db.connected, 'should be disconnected in database')
})

test.after.always('clean up database', async t => {
  let connection = await r.connect({ })
  await r.dbDrop(dbName).run(connection)
})
