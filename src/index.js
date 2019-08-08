/**
 * Fallback function
 * @method noop
 * @returns {undefined}
 */
const noop = () => {}

/**
 * Method called when a stylesheet is loaded
 * @method __onload__
 * @param {Object} config
 */
function __onload__(media, storage, logger) {
  this.onload = null
  this.media = media || 'all'

  logger(null, `${this.href} loaded asynchronously`)

  if (storage) {
    try {
      const rules = this.sheet ? this.sheet.cssRules : this.styleSheet.rules
      let styles = rules.reduce((acc, rule) => {
        return (acc += rule.cssText)
      }, '')

      // wrap rules with @media statement if necessary
      if (media) styles = `@media ${media} {${styles}}`

      // save on web storage
      window[`${storage}Storage`].setItem(this.href, styles)
    } catch (e) {
      logger(e, 'Stylesheet could not be saved for future visits')
    }
  }
}

/**
 * Loads stylesheet asynchronously or retrieves it from web storage
 * @method css
 * @param {Object} config
 */
function css(config = {}) {
  const script = document.getElementsByTagName('script')[0]
  const ref = config.ref || script
  const logger = config.logger || noop
  const link = document.createElement('link')
  let storedStyles
  let el

  // create link element to extract correct href path
  link.rel = 'stylesheet'
  link.href = config.url

  /*
   * Detect stored stylesheet content only when storage option is present
   * and expose an error in console in case web storage is not supported
   */
  if (config.storage) {
    try {
      storedStyles = window[`${config.storage}Storage`].getItem(link.href)
    } catch (error) {
      logger(
        error,
        `${link.href} could not be retrieved from ${config.storage}Storage`
      )
    }
  }

  /*
   * if stylesheet is in web storage inject a style tag with its
   * content, else load it using the link tag
   */
  if (storedStyles) {
    el = document.createElement('style')

    el.textContent = storedStyles

    logger(null, `${link.href} retrieved from ${config.storage}Storage`)
  } else {
    /*
     * Filament Group approach to prevent stylesheet to block rendering
     * https://github.com/filamentgroup/loadCSS/blob/master/src/loadCSS.js#L26
     */
    link.media = 'only x'

    /*
     * Add crossOrigin attribute for external stylesheets, take in count this
     * attribute is not widely supported. In those cases CSS rules will not be
     * saved in web storage but stylesheet will be loaded
     */
    if (config.crossOrigin) link.crossOrigin = config.crossOrigin

    link.onload = __onload__.bind(link, config.media, config.storage, logger)
    el = link
  }

  /*
   * Node insert approach taken from Paul Irish's 'Surefire DOM Element Insertion'
   * http://www.paulirish.com/2011/surefire-dom-element-insertion/
   */
  ref.parentNode.insertBefore(el, ref)
}

export default { css }
