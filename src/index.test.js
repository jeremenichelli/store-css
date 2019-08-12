import { css } from '.'
import { serial as test } from 'ava'
import sinon from 'sinon'
import clone from 'lodash.clonedeep'

// mock elements to track DOM insertion and styles creation
const firstRule = '.first--test { color: red; }'
const secondRule = '.second--test { border: solid 1px gainsboro; }'
const mockedElements = {
  script: { parentNode: { insertBefore: () => {} } },
  link: {
    sheet: {
      cssRules: [{ cssText: firstRule }, { cssText: secondRule }]
    }
  }
}

// mock window object
const mockedWindow = {
  addEventListener() {},
  removeEventListener() {},
  localStorage: {
    getItem: (key) => window.localStorage[key],
    setItem: (key, content) => (window.localStorage[key] = content)
  },
  sessionStorage: {
    getItem: (key) => window.sessionStorage[key],
    setItem: (key, content) => (window.sessionStorage[key] = content)
  }
}

// mocked document object for testing
const mockedDocument = {
  getElementsByTagName: (tag) => {
    if (tag === 'script') return [ELEMENTS.script]
    return []
  },
  createElement(el) {
    if (el === 'link') return ELEMENTS.link
    if (el === 'script') return ELEMENTS.script
    ELEMENTS[el] = {}
    return ELEMENTS[el]
  }
}

test.beforeEach(() => {
  // mocked globals
  global.window = clone(mockedWindow)
  global.document = clone(mockedDocument)

  // wrap storage methods with spies
  sinon.spy(window.localStorage, 'getItem')
  sinon.spy(window.localStorage, 'setItem')
  sinon.spy(window.sessionStorage, 'getItem')
  sinon.spy(window.sessionStorage, 'setItem')

  // mocked elements with spies and properties
  global.ELEMENTS = clone(mockedElements)
  sinon.spy(ELEMENTS.script.parentNode, 'insertBefore')
})

test.afterEach(() => {
  sinon.restore()

  delete global.window
  delete global.document
  delete global.ELEMENTS
})

test('loads stylesheet', (t) => {
  const url = 'https://path.to/stylesheet.css'
  css({ url })

  // assigned link properties correctly
  t.is(ELEMENTS.link.href, url)
  t.is(ELEMENTS.link.media, 'only x')
  t.is(ELEMENTS.link.rel, 'stylesheet')

  // test element injection in DOM
  t.is(
    ELEMENTS.script.parentNode.insertBefore.getCall(0).args[0],
    ELEMENTS.link
  )
  t.is(
    ELEMENTS.script.parentNode.insertBefore.getCall(0).args[1],
    ELEMENTS.script
  )

  // switched media to all on load
  ELEMENTS.link.onload()
  t.is(ELEMENTS.link.media, 'all')
})

test('accepts media in config object', (t) => {
  const url = 'https://path.to/stylesheet.css'
  const media = '(max-width: 739px'
  css({ url, media })

  ELEMENTS.link.onload()
  t.is(ELEMENTS.link.media, media)
})

test('accepts cross origin attribute', (t) => {
  const url = 'https://path.to/stylesheet.css'
  const crossOrigin = 'anonymous'
  css({ url, crossOrigin })

  t.is(ELEMENTS.link.crossOrigin, crossOrigin)
})

test('accepts a reference element for link injection', (t) => {
  const url = 'https://path.to/stylesheet.css'
  const ref = { parentNode: { insertBefore: sinon.spy() } }
  css({ url, ref })

  t.is(ref.parentNode.insertBefore.getCall(0).args[0], ELEMENTS.link)
  t.is(ref.parentNode.insertBefore.getCall(0).args[1], ref)
})

test('stores result in localStorage', (t) => {
  const url = 'https://path.to/stylesheet.css'
  const storage = 'local'
  css({ url, storage })

  // styles gets to local storage
  ELEMENTS.link.onload()
  const result = `${firstRule}${secondRule}`
  t.is(window.localStorage.setItem.getCall(0).args[0], url)
  t.is(window.localStorage.setItem.getCall(0).args[1], result)
})

test('stores result in sessionStorage', (t) => {
  const url = 'https://path.to/stylesheet.css'
  const storage = 'session'
  css({ url, storage })

  // styles gets to session storage
  ELEMENTS.link.onload()
  const result = `${firstRule}${secondRule}`
  t.is(window.sessionStorage.setItem.getCall(0).args[0], url)
  t.is(window.sessionStorage.setItem.getCall(0).args[1], result)
})

test('retrieves already saved styles from localStorage', (t) => {
  const url = 'https://path.to/stylesheet.css'
  const storage = 'local'
  const styles = `${firstRule}${secondRule}`
  window.localStorage[url] = styles
  css({ url, storage })

  t.is(window.localStorage.getItem.getCall(0).args[0], url)
  t.is(ELEMENTS.style.textContent, styles)
})

test('retrieves already saved styles from sessionStorage', (t) => {
  const url = 'https://path.to/stylesheet.css'
  const storage = 'session'
  const styles = `${firstRule}${secondRule}`
  window.sessionStorage[url] = styles
  css({ url, storage })

  t.is(window.sessionStorage.getItem.getCall(0).args[0], url)
  t.is(ELEMENTS.style.textContent, styles)
})

test('wraps styles in media when storing', (t) => {
  const url = 'https://path.to/stylesheet.css'
  const media = '(max-width: 739px)'
  const storage = 'session'
  const styles = `${firstRule}${secondRule}`
  css({ url, media, storage })

  ELEMENTS.link.onload()
  t.is(
    window.sessionStorage.setItem.getCall(0).args[1],
    `@media ${media} {${styles}}`
  )
})

test('accepts logger method', (t) => {
  const url = 'https://path.to/stylesheet.css'
  const storage = 'session'
  const logger = sinon.spy()
  css({ url, storage, logger })

  ELEMENTS.link.onload()
  t.is(logger.getCall(0).args[0], null)
  t.is(logger.getCall(0).args[1], `${url} loaded asynchronously`)
})
