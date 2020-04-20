'use strict'

const asciidoctor = require('asciidoctor.js')()
const path = require('path')

const fontAwesome = 'https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css'

const opts = { 
  safe: 'safe',
  attributes: {
    doctype: 'article',
    showtitle: false,
    icons: 'font', 
    idprefix: '',
    idseparator: '-',
    sectids: false
  }
}

function render (data) {
  if (data.path) {
    const entry = path.parse(data.path)
    const assetDir = path.join(entry.dir, entry.name)
    opts.attributes.docdir = assetDir 
  }

  return asciidoctor.convert(data.text, opts) +
    '<link href="' + fontAwesome + '" rel="stylesheet">' 
}

module.exports = render