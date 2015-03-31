class Dotdotdot
  defaults: {
    'ellipsis': '... ',
    'wrap': 'word',
    'fallbackToLetter': true,
    'lastCharacter': {},
    'tolerance': 0,
    'callback': null,
    'after': null,
    'height': null,
    'watch': false,
    'windowResizeFix': true
  }

  defaultArrays: {
    'lastCharacter': {
      'remove': [' ', '\u3000', ',', ';', '.', '!', '?'],
      'noEllipsis': []
    }
  }

  restrict :'A'
  scope:
    dotOptions: '=?dotdotdot'

  constructor: (@$window)->
    @setStringTrim()

  setStringTrim: ->
    # Set trim
    if !String::trim
      do ->
        String::trim = ->
          @replace /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ''

  compile: =>
    post: @post()

  # Directive execution
  post: =>
    (@$scope, elm, @$attrs)=>
      @dot = elm[0]
      @loadDot()

  update: (e, c) ->
    e.preventDefault()
    e.stopPropagation()
    @opts.maxHeight =
      if typeof @opts.height == 'number' then @opts.height else getTrueInnerHeight(@)
    @opts.maxHeight += @opts.tolerance
    if typeof c != 'undefined'
      if typeof c == 'string' or 'nodeType' in c and c.nodeType == 1
        c = angular.element('<div />').append(c).contents()
      if c instanceof $
        @.orgContent = c

    @$inr = angular.element(wrapAll(@, angular.element('<div class="dotdotdot" />'))).children()
    @$inr.contents().remove()
    @$inr.append(@.orgContent.clone(true))
    .find('br')
    .replaceWith('  <br />  ').css
      'height': 'auto'
      'width': 'auto'
      'border': 'none'
      'padding': 0
      'margin': 0
    after = false
    trunc = false
    if @conf.afterElement
      after = @conf.afterElement.clone(true)
      @conf.afterElement.remove()
    if test(@$inr, @opts)
      if @opts.wrap == 'children'
        trunc = children(@$inr, @opts, after)
      else
        trunc = ellipsis(@$inr, @, @$inr, @opts, after)
    @$inr.replaceWith @$inr.contents()
    @$inr = null
    if angular.isFunction(@opts.callback)
      @opts.callback.call @, trunc, @orgContent
    @conf.isTruncated = trunc
    trunc

  truncated: (e, fn) ->
    e.preventDefault()
    e.stopPropagation()
    if typeof fn == 'function'
      fn.call @, @conf.isTruncated
    @conf.isTruncated

  getOriginalContent:(e, fn) ->
    e.preventDefault()
    e.stopPropagation()
    if typeof fn == 'function'
      fn.call @, @orgContent
    @orgContent

  destroyDot:(e) ->
    e.preventDefault()
    e.stopPropagation()
    @unbind_events().contents().remove()
    @append(@orgContent).attr('style', @data('dotdotdot-style') or '').data 'dotdotdot', false
    return

  windowWatcher: =>
    if @dot.opts.watch == 'window'
      dot = angular.element(@dot)
      @$scope.$watch(@getWindowDimensions, ->
        dot.triggerHandler 'update.dot'
      , true)
      $scope = @$scope
      updater = ->
        $scope.$apply()
      @$scope.$on '$destroy', =>
        angular.element(@$window).unbind 'resize', updater
      angular.element(@$window).bind 'resize', updater
    @dot

  getWindowDimensions: =>
    h: @$window.innerHeight
    w: @$window.innerWidth

  loadDot:=>
    elm = angular.element(@dot)

    if elm.data('dotdotdot')
      elm.triggerHandler 'destroy.dot'
    elm.data 'dotdotdot-style', elm.attr('style') or ''
    elm.css 'word-wrap', 'break-word'
    if elm.css('white-space') == 'nowrap'
      elm.css 'white-space', 'normal'

    elm.bind_events = =>
      elm.bind 'update.dot', @update
      .bind 'isTruncated.dot', @truncated
      .bind 'originalContent.dot', @getOriginalContent
      .bind 'destroy.dot', @destroyDot
      elm

    elm.unbind_events = ->
      elm.unbind 'update.dot'
      elm.unbind 'isTruncated.dot'
      elm.unbind 'originalContent.dot'
      elm.unbind 'destroy.dot'
      elm

    @dot.watch = @windowWatcher

    @dot.orgContent = elm.contents()
    o = @$scope.dotOptions || {}

    # TODO: generate functionality for after
    @dot.opts = angular.extend({}, @defaults, o, {after:null})
    @dot.conf = {}
    @dot.$inr = null
    if !(@dot.opts.lastCharacter.remove instanceof Array)
      @dot.opts.lastCharacter.remove = @defaultArrays.lastCharacter.remove
    if !(@dot.opts.lastCharacter.noEllipsis instanceof Array)
      @dot.opts.lastCharacter.noEllipsis = @defaultArrays.lastCharacter.noEllipsis
    @dot.conf.afterElement = getElement(@dot.opts.after, elm)
    @dot.conf.isTruncated = false
    @dot.conf.dotId = dotId++
    elm.data('dotdotdot', true).bind_events().triggerHandler 'update.dot'
    if @dot.opts.watch
      @dot.watch()
    elm


  # private
  dotId = 1
  children = ($elem, o, after) ->
    $elements = $elem.children()
    isTruncated = false
    $elem.empty()
    a = 0
    l = $elements.length
    while a < l
      $e = $elements.eq(a)
      $elem.append $e
      if after
        $elem.append after
      if test($elem, o)
        $e.remove()
        isTruncated = true
        break
      else
        if after
          after.remove()
      a++
    isTruncated

  ellipsis = ($elem, $d, $i, o, after) ->
    isTruncated = false
    #	Don't put the ellipsis directly inside these elements
    notx = ['a table', 'thead', 'tbody', 'tfoot', 'tr', 'col','colgroup', 'object', 'embed', 'param', 'ol', 'ul', 'dl', 'blockquote', 'select', 'optgroup', 'option', 'textarea', 'script', 'style']
    #	Don't remove these elements even if they are after the ellipsis
    noty = ['script', '.dotdotdot-keep']
    angular.forEach $elem.contents().remove()
    , (e)->
      $e = angular.element(e)
      if typeof e == 'undefined' or e.nodeType == 3 and e.data.trim().length == 0
        return true
      else if responseTo($e, noty)
        $elem.append $e
      else if isTruncated
        return true
      else
        $elem.append $e
        if after and e.nodeType == 1 # and !$e.is(o.after) and !$e.find(o.after).length
          $elem[if responseTo($elem,notx) then 'after' else 'append'] after
        if test($i, o)
          if e.nodeType == 3
            isTruncated = ellipsisElement($e, $d, $i, o, after)
          else
            isTruncated = ellipsis($e, $d, $i, o, after)
          if !isTruncated
            $e.remove()
            isTruncated = true
        if !isTruncated
          if after
            after.remove()
    isTruncated

  # Ported functionality of jQuery.is
  responseTo = ($elem, types) ->
    throw Error("types must be an array") unless angular.isArray(types)

    if $elem instanceof angular.element
      for elem in $elem
        return true if responseTo(elem, types)
      return false

    return false if $elem.nodeName is '#text'

    for type in types
      throw Error('type element must be set as string and must have length') unless angular.isString(type) or type.length is 0
      if(type[0] is '.')
        return true if angular.element($elem).hasClass(type)
      else
        tags = type.split(' ')
        match = true
        checker = $elem

        while checker and tag = tags.shift()
          continue if tag is ''
          if checker.nodeName.toLowerCase() isnt tag.toLowerCase()
            match = false
            break
          checker = checker.firstChild

        return true if match and tags.length is 0

    false


  ellipsisElement = ($e, $d, $i, o, after) ->
    e = $e[0]
    if !e
      return false
    txt = getTextContent(e)
    space = if txt.indexOf(' ') != -1 then ' ' else '　'
    separator = if o.wrap == 'letter' then '' else space
    textArr = txt.split(separator)
    position = -1
    midPos = -1
    startPos = 0
    endPos = textArr.length - 1
    #	Only one word
    if o.fallbackToLetter and startPos == 0 and endPos == 0
      separator = ''
      textArr = txt.split(separator)
      endPos = textArr.length - 1
    while startPos <= endPos and !(startPos == 0 and endPos == 0)
      m = Math.floor((startPos + endPos) / 2)
      if m == midPos
        break
      midPos = m
      setTextContent e, textArr.slice(0, midPos + 1).join(separator) + o.ellipsis
      if !test($i, o)
        position = midPos
        startPos = midPos
      else
        endPos = midPos
        #	Fallback to letter
        if o.fallbackToLetter and startPos == 0 and endPos == 0
          separator = ''
          textArr = textArr[0].split(separator)
          position = -1
          midPos = -1
          startPos = 0
          endPos = textArr.length - 1
    if position != -1 and !(textArr.length == 1 and textArr[0].length == 0)
      txt = addEllipsis(textArr.slice(0, position + 1).join(separator), o)
      setTextContent e, txt
    else
      $w = $e.parent()
      $e.remove()
      afterLength = if after and after.closest($w).length then after.length else 0
      if $w.contents().length > afterLength
        e = findLastTextNode($w.contents().eq(-1 - afterLength), $d)
      else
        e = findLastTextNode($w, $d, true)
        if !afterLength
          $w.remove()
      if e
        txt = addEllipsis(getTextContent(e), o)
        setTextContent e, txt
        if afterLength and after
          angular.element(e).parent().append after
    true

  test = ($i, o) ->
    $i[0].clientHeight > o.maxHeight

  addEllipsis = (txt, o) ->
    while inArray(txt.slice(-1), o.lastCharacter.remove) > -1
      txt = txt.slice(0, -1)
    if inArray(txt.slice(-1), o.lastCharacter.noEllipsis) < 0
      txt += o.ellipsis
    txt

  inArray = (elem, arr, i) ->
    if arr
      len = arr.length
      i = if i then (if i < 0 then Math.max(0, len + i) else i) else 0
      while i < len
        # Skip accessing in sparse arrays
        if i in arr and arr[i] == elem
          return i
        i++
    -1

  # Wrap All elements
  wrapAll = (elm, wrapper) ->
    wrapper = if wrapper.length then wrapper[0] else wrapper
    parent = if elm.length then elm[0] else elm
    while parent.childNodes.length > 0
      wrapper.appendChild parent.childNodes[0]

    parent.appendChild wrapper
    elm

  getSizes = ($d) ->
    'width': $d[0].clientWidth
    'height': $d[0].clientHeight

  setTextContent = (e, content) ->
    if e.innerText
      e.innerText = content
    else if e.nodeValue
      e.nodeValue = content
    else if e.textContent
      e.textContent = content
    return

  getTextContent = (e) ->
    if e.innerText
      e.innerText
    else if e.nodeValue
      e.nodeValue
    else if e.textContent
      e.textContent
    else
      ''

  getPrevNode = (n) ->
    loop
      n = n.previousSibling
      unless n and n.nodeType != 1 and n.nodeType != 3
        break
    n

  findLastTextNode = ($el, $top, excludeCurrent) ->
    e = $el and $el[0]
    p = undefined
    if e
      if !excludeCurrent
        if e.nodeType == 3
          return e
        if $el.text().trim()
          return findLastTextNode(angular.element($el.contents()[$el.contents().length-1]), $top)
      p = getPrevNode(e)
      while !p
        $el = $el.parent()
        if $el is $top or !$el.length
          return false
        p = getPrevNode($el[0])
      if p
        return findLastTextNode(angular.element(p), $top)
    false

  getElement = (e, $i) ->
    if !e
      return false
    if typeof e == 'string'
      e = angular.element($i[0].querySelector(e))
      return if e.length then e else false
    if !e.jquery then false else e

  getTrueInnerHeight = ($el) ->
    h = $el.clientHeight
    a = [
      'paddingTop'
      'paddingBottom'
    ]
    z = 0
    l = a.length
    while z < l
      m = parseInt(getTrueStyle($el, a[z]), 10)
      if isNaN(m)
        m = 0
      h -= m
      z++
    h

  getTrueStyle = ($el, style)->
    if(window.getComputedStyle)
      return window.getComputedStyle($el)[style]
    else if document.documentElement.currentStyle
      return $el.currentStyle[style]

dotInit =->
  dotdotdot = Object.create (Dotdotdot.prototype)
  Dotdotdot.apply(dotdotdot, arguments)
  dotdotdot

angular.module('angular.dotdotdot', [])
.directive('dotdotdot', ['$window', dotInit ])
