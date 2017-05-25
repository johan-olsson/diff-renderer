'use strict'

var selfClosingTags = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]

/**
 * Simplified html parser. The fastest one written in javascript.
 * It is naive and requires valid html.
 * You might want to validate your html before to pass it here.
 *
 * @param {String} html
 * @param {Object} [parent]
 * @return {Object}
 * @api private
 */
module.exports = function serialize(str, parent) {
  parent = parent || {
    children: [],
    name: 'root'
  }

  var extractTag = (/^<(\/)?([a-z-]+)((?: [a-z:-]+="[^"]*")*)>$/)
  var extractAttributes = (/[a-z]+="[^"]+"/g)
  var string = ''
  var node = parent

  str.split('').forEach(function (char) {

    switch (char) {
      case '<': {

        if (string) {
          node.children.push({
            name: '#text',
            text: string,
            parent: node
          })

          string = ''
        }

        string += char
        break
      }
      case '>': {

        string += char
        string.replace(extractTag, function (m, closeTag, name, attr) {

          if (closeTag) node = node.parent
          else {

            var child = {
              name: name,
              children: [],
              attributes: {},
              parent: node
            }

            attr.replace(extractAttributes, function (attribute) {
              var part = attribute.split('=')
              var name = (part[0] === 'class') ? 'classname' : part[0]
              child.attributes[name] = part[1].substring(1, part[1].length - 1)
            })

            node.children.push(child)

            if (selfClosingTags.indexOf(name) === -1) {
              node = child
            }
          }

          string = ''
        })
        break
      }
      default: string += char
    }
  })

  if (string) {
    node.children.push({
      name: '#text',
      text: string,
      parent: node
    })
  }

  return parent
}
