# store-css

[![Build Status](https://travis-ci.org/jeremenichelli/store-css.svg)](https://travis-ci.org/jeremenichelli/store-css)

🎒 Load stylesheets asynchronously and store them in web storage.

_Loads your styles without block rendering your site, and retrieves the result from web storage on future visits. Backwards compatibility with old browsers, safe implementation in case web storage fails, avoids flash of unstyled content and it can be inlined in the head of your project since it's less than 1KB in size._

## Install

```sh
# npm
npm i store-css --save

# yarn
yarn add store-css
```

Or include it as a script with `//unpkg.com/store-css/dist/store-css.umd.js` as source.

## Usage

Import the `css` method and pass the `url` where your stylesheet is located.

```js
import { css } from 'store-css'

const url = '//path.to/my/styles.css'
css({ url })
```

The package will unsure the stylesheet is loaded without render blocking the page.

But the magic happens when you use the `storage` option.

### `storage`

When you pass a `storage`, the script will save the content of the stylesheet in web storage. In future visits the styles will be retrieved from there instead of making a network call! 

```js
import { css } from 'store-css'

const url = '//path.to/my/styles.css'
const storage = 'session'
css({ url, storage })
```

👉 `storage` option can be both `'session'` or `'local'`

What happens if the web storage space is full? What happens if a browser has a buggy web storage implementation? No worries, the script will fallback to normally loading a `link` element. It **always** works.

This is great to avoid _flicks_ unstyled content in repeated views, and as the script is really small it's a really good option for head inlining in static sites.

### `crossOrigin`

If you are calling a stylesheet from a different origin you will need this.

```js
import { css } from 'store-css'

const url = '//external.source.to/my/styles.css'
const storage = 'session'
const crossOrigin = 'anonymous'
css({ url, storage, crossOrigin })
```

🌎 Make sure to test which string or identifier works better for the provider

### `media`

If you want styles to be aplied for a specific `media` environment, pass the query as an option.

```js
import { css } from 'store-css'

const url = '//path.to/my/styles.css'
const storage = 'session'
const media = '(max-width: 739px)'
css({ url, storage, media })
```

_On the first round the media attribute will be passed to the `link` element, on future visits the stylesheet content will be wrapped before injecting a `style` tag._

### `ref`

By default the styles will be injected before the first `script` present in the page, but you can change this if you need some specific position for them to not affect the cascade effect of the styles.

```js
import { css } from 'store-css'

const url = '//path.to/my/styles.css'
const storage = 'session'
const ref = document.getElementById('#main-styles')
css({ url, storage, ref })
```

Styles will be place **before** the `ref` element.

### `logger`

If you need to debug the package behavior you can pass a `logger` method. This function will receive an error as a first argument and a message as a second one.

```js
import { css } from 'store-css'

const url = '//path.to/my/styles.css'
const storage = 'session'
const logger = console.log
css({ url, storage, logger })
```

This approach is really good for both custom logic on logging and to avoid unnecessary code in production.

```js
import { css } from 'store-css'

const url = '//path.to/my/styles.css'
const storage = 'session'
const config = { url, storage }

if (process.env.NODE_ENV ==! 'production') {
  config.logger = (error, message) => {
    if (error) console.error(message, error)
    else console.log(message)
  }
}

css(config)
```

In production the logger method won't be added and code will be eliminated by minifiers.

## Browser support

This package works all the way from modern browsers to Internet Explorer 9.

## Contributing

To contribute [Node.js](//nodejs.org) and [yarn](//yarnpkg.com) are required.

Before commit make sure to follow [conventional commits](//www.conventionalcommits.org) specification and check all tests pass by running `yarn test`.
