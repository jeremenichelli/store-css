import test from 'ava'
import store from '.'
import clone from 'lodash.clone'

// mock window object
const window = {
  innerHeight: 0,
  addEventListener() {},
  removeEventListener() {}
}

const document = {
  getElementByTagName: () => {}
}

test.beforeEach(() => {
  global.window = clone(window)
  global.document = clone(document)
})

test('exports css function', (t) => {
  t.is(typeof store.css, 'function')
})
