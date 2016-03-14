# store-css

Script that loads stylesheets asynchronously and stores them for future visits.

You can try it out in this test page <a href="https://jeremenichelli.github.io/store-css/test">https://jeremenichelli.github.io/store-css/test</a>. First open a new tab and your development tools, go to the **Network** tab and reload the page to see how many requests are saved. Also you can checkout the console to see what's going on.


## Install

Download and include the `index.js` file inside this repository or install through **npm**.

```sh
npm install store-css --save
```

## How it works

The script loads a stylesheet asynchronously passing its url as a first argument and later a configuration object that will allow you to store it when users navigate through your site or visit it in the future.

When the `store.css()` method is called it will first create a `<link>` tag to load the styles correctly, but after the stylsheet is loaded all the rules will be gathered and saved in the web storage and next time the user comes a `<style>` tag will be inserted in the **head** of the site containing all the CSS rules from it instead of doing a network request!

```js
var store = require('store-css');

store.css('/assets/styles.css');
```

If you don't pass any option the script will not store the stylesheet it will just load it without locking the rendering action of the browser.


### storage

To actually do some magic with it, you need a `storage` option and pass `'session'` or `'local'` as values. In the first case, the CSS rules present in the stylesheet will be stored using `sessionStorage` so they will be retrieved during the navigation but will be lost when the user closes the browser tab.

```js
store.css('/assets/styles.css', {
    storage: 'session'
});
```

What happens if the browser doesn't support web storage or the user is navigating in private mode? In this case, the script will just load the stylesheet every time the page is loaded. The user won't get the benefit from loading the CSS rules faster, but your page will still work and not block the rendering process.

_**Suggestion:** Build the script that loads your stylesheets, minify it and insert it inside a script tag in the ehad of your site. You will prevent Flash of Unstyled Content and your page will save some network requests._

_**NOTE:** Beware that the script won't detect updates on your stylesheet, that's why I personally recommend to use the `'session'` value to speed up navigation through your site, but load the styles every time the user enters to the site again._


### media

`<link>` tags support a `media` attribute containing a query to hit special end points in the viewport. You can pass this as an option to alter the reach of the styles you're loading.

```js
store.css('/assets/styles.css', {
    media: '(max-width: 769px)',
    storage: 'session'
});
```

When the styles are retrieved via web storage they will be wrapped inside a `@media` statement to maintain coherence.


### ref

As you might know the order of the CSS rules is important, so in case you need the stylesheet to load before a certain element present in the document you can specify it using the `ref` option.

```js
store.css('/assets/styles.css', {
    ref: document.getElementsByTagName('script')[0],
    storage: 'session'
});


### crossOrigin

You might need to load a styleshet from a different domain. When this happens CSS rules won't be reachable through JavaScript. Some modern browsers support a `crossorigin` attribute on link tags that will give you access to them. If that's your case you need to add this option.

```js
store.css('/assets/styles.css', {
    crossOrigin: 'anonymous',
    storage: 'session'
});
```

_**NOTE:** When this attribute is not supported by the browser the script won't be able to store the rules for later application._


### store.verbose()

If you need to know what's happening with your styles, when they are load asynchronously and when they are recovered from web storage you can call `store.verbose()` before using this library and open the console in your browser. You will receive notifications when your styles are loaded, from where and if there was an issue you'll get a report too.


## Browser support

This script was tested in the latest versions of Chrome, Firefox, Safari, Microsoft Edge, and legacy browsers like Internet Explorer 9 and 10. Though errors weren't present in legacy browsers, extensive testing is in need to check edge cases of this approach. So consider this experimental.


## Contribution

If you're planning or have used this library feel free to contact me about how it was and feel free to open an issue or suggest something through a pull request.


## References

To understand better how this approach works you should read about:

- The `<link>` element: [https://developer.mozilla.org/en/docs/Web/HTML/Element/link]
- and Web Storage API: [https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API]

