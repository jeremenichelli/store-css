const noop = () => {}

/**
 * Method called when a stylesheet is loaded
 * @method __onload__
 * @param {Object} config
 */
function __onload__(config) {
  const logger = config.logger ? config.logger : noop
  this.onload = null
  this.media = config.media ? config.media : 'all'

  logger(null, `${this.href} loaded asynchronously`)

  if (config.storage) {
    try {
      const rules = this.sheet ? this.sheet.cssRules : this.styleSheet.rules
      let styles = rules.reduce((acc, rule) => {
        return (acc += rule.cssText)
      }, '')

      // wrap rules with @media statement if necessary
      if (config.media) styles = '@media ' + config.media + '{' + styles + '}'

      // save on web storage
      window[config.storage + 'Storage'].setItem(this.href, styles)
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
  const ref = config.ref ? config.ref : script
  const logger = config.logger ? config.logger : noop
  const link = document.createElement('link')
  let stored

  // create link element to extract correct href path
  link.rel = 'stylesheet'
  link.href = config.url

  /*
   * Detect stored stylesheet content only when storage option is present
   * and expose an error in console in case web storage is not supported
   */
  if (config.storage) {
    try {
      stored = window[`${config.storage}Storage`].getItem(link.href)
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
  if (stored) {
    const styleTag = document.createElement('style')

    styleTag.textContent = stored
    ref.parentNode.insertBefore(styleTag, ref)

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

    link.onload = __onload__.bind(link, config)

    /*
     * Node insert approach taken from Paul Irish's 'Surefire DOM Element Insertion'
     * http://www.paulirish.com/2011/surefire-dom-element-insertion/
     */
    ref.parentNode.insertBefore(link, ref)
  }
}

export default { css }
