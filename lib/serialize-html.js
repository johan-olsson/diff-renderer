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

var ignoreTags = [
  'style',
  'script'
]

function extractAttributes(tagString, attributes = {}) {

  var firstEqualsSign = tagString.indexOf('=')
  var firstSpace = tagString.indexOf(' ')
  var length = tagString.length

  firstSpace = (firstSpace > -1) ? firstSpace : length

  if (firstEqualsSign > -1) {

  	var key = tagString.substring(0, firstEqualsSign)
  	var value = tagString.substring(firstEqualsSign + 2, firstSpace - 1)

    attributes[key] = value

    if (firstSpace !== length) {
    	extractAttributes(tagString.substring(firstSpace + 1), attributes)
    }
  }

  return attributes
}

module.exports = function serialize(string) {

  var rootNode = {
    name: 'root',
    children: []
  }
  var node = rootNode

  function loop(html) {

    var tagStart = html.indexOf('<')
    var tagEnd = html.indexOf('>')

    var text = html.substring(0, tagStart)
    var tag = html.substring(tagStart, tagEnd + 1)

    if (text) {
      node.children.push({
        name: '#text',
        parent: node,
        text: text
      })
    }
    if (tag) {
      var tagString = tag.substring(1, tag.length - 1)

      if (tagString[0] === '/') {
        node = node.parent
        return loop(html.substring(tagEnd + 1))
      }

			var firstSpace = tagString.indexOf(' ')
      var name = (firstSpace > -1) ? tagString.substring(0, firstSpace) : tagString
      var ignoreIndex = ignoreTags.indexOf(name)

      var child = {
        name: name,
        parent: node,
        children: []
      }

			child.attributes = extractAttributes(tagString.substring(name.length + 1))
      node.children.push(child)

      if (ignoreIndex > -1) {

        const endTag = `</${name}>`
        const endIndex = html.indexOf(endTag)
        child.children.push({
          name: '#text',
          parent: child,
          text: html.substring(tagEnd + 1, endIndex)
        })

        tagEnd = endIndex + endTag.length

      } else if (selfClosingTags.indexOf(name) === -1) {


        node = child
      }
    }

    if (tagStart + tagEnd === -2) {
      var child = {
        name: '#text',
        parent: node,
        text: text
      }
      node.children.push(child)
    } else {
      loop(html.substring(tagEnd + 1))
    }

    return rootNode
  }

  return loop(string)
}
