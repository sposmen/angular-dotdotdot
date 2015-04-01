(function() {
  var Dotdotdot, dotInit,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Dotdotdot = (function() {
    var addEllipsis, children, dotId, ellipsis, ellipsisElement, findLastTextNode, getElement, getPrevNode, getSizes, getTextContent, getTrueInnerHeight, getTrueStyle, inArray, responseTo, setTextContent, test, wrapAll;

    Dotdotdot.prototype.defaults = {
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
    };

    Dotdotdot.prototype.defaultArrays = {
      'lastCharacter': {
        'remove': [' ', '\u3000', ',', ';', '.', '!', '?'],
        'noEllipsis': []
      }
    };

    Dotdotdot.prototype.restrict = 'A';

    Dotdotdot.prototype.scope = {
      dotOptions: '=?dotdotdot'
    };

    function Dotdotdot($window) {
      this.$window = $window;
      this.loadDot = bind(this.loadDot, this);
      this.getWindowDimensions = bind(this.getWindowDimensions, this);
      this.windowWatcher = bind(this.windowWatcher, this);
      this.post = bind(this.post, this);
      this.compile = bind(this.compile, this);
      this.setStringTrim();
    }

    Dotdotdot.prototype.setStringTrim = function() {
      if (!String.prototype.trim) {
        return (function() {
          return String.prototype.trim = function() {
            return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
          };
        })();
      }
    };

    Dotdotdot.prototype.compile = function() {
      return {
        post: this.post()
      };
    };

    Dotdotdot.prototype.post = function() {
      return (function(_this) {
        return function($scope1, elm, $attrs) {
          _this.$scope = $scope1;
          _this.$attrs = $attrs;
          _this.dot = elm[0];
          return _this.loadDot();
        };
      })(this);
    };

    Dotdotdot.prototype.update = function(e, c) {
      var after, trunc;
      e.preventDefault();
      e.stopPropagation();
      this.opts.maxHeight = typeof this.opts.height === 'number' ? this.opts.height : getTrueInnerHeight(this);
      this.opts.maxHeight += this.opts.tolerance;
      if (typeof c !== 'undefined') {
        if (typeof c === 'string' || indexOf.call(c, 'nodeType') >= 0 && c.nodeType === 1) {
          c = angular.element('<div />').append(c).contents();
        }
        if (c instanceof $) {
          this.orgContent = c;
        }
      }
      this.$inr = angular.element(wrapAll(this, angular.element('<div class="dotdotdot" />'))).children();
      this.$inr.contents().remove();
      this.$inr.append(this.orgContent.clone(true)).find('br').replaceWith('  <br />  ').css({
        'height': 'auto',
        'width': 'auto',
        'border': 'none',
        'padding': 0,
        'margin': 0
      });
      after = false;
      trunc = false;
      if (this.conf.afterElement) {
        after = this.conf.afterElement.clone(true);
        this.conf.afterElement.remove();
      }
      if (test(this.$inr, this.opts)) {
        if (this.opts.wrap === 'children') {
          trunc = children(this.$inr, this.opts, after);
        } else {
          trunc = ellipsis(this.$inr, this, this.$inr, this.opts, after);
        }
      }
      this.$inr.replaceWith(this.$inr.contents());
      this.$inr = null;
      if (angular.isFunction(this.opts.callback)) {
        this.opts.callback.call(this, trunc, this.orgContent);
      }
      this.conf.isTruncated = trunc;
      return trunc;
    };

    Dotdotdot.prototype.truncated = function(e, fn) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof fn === 'function') {
        fn.call(this, this.conf.isTruncated);
      }
      return this.conf.isTruncated;
    };

    Dotdotdot.prototype.getOriginalContent = function(e, fn) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof fn === 'function') {
        fn.call(this, this.orgContent);
      }
      return this.orgContent;
    };

    Dotdotdot.prototype.destroyDot = function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.unbind_events().contents().remove();
      this.append(this.orgContent).attr('style', this.data('dotdotdot-style') || '').data('dotdotdot', false);
    };

    Dotdotdot.prototype.windowWatcher = function() {
      var $scope, dot, updater;
      if (this.dot.opts.watch === 'window') {
        dot = angular.element(this.dot);
        this.$scope.$watch(this.getWindowDimensions, function() {
          return dot.triggerHandler('update.dot');
        }, true);
        $scope = this.$scope;
        updater = function() {
          return $scope.$apply();
        };
        this.$scope.$on('$destroy', (function(_this) {
          return function() {
            return angular.element(_this.$window).unbind('resize', updater);
          };
        })(this));
        angular.element(this.$window).bind('resize', updater);
      }
      return this.dot;
    };

    Dotdotdot.prototype.getWindowDimensions = function() {
      return {
        h: this.$window.innerHeight,
        w: this.$window.innerWidth
      };
    };

    Dotdotdot.prototype.loadDot = function() {
      var elm, o;
      elm = angular.element(this.dot);
      if (elm.data('dotdotdot')) {
        elm.triggerHandler('destroy.dot');
      }
      elm.data('dotdotdot-style', elm.attr('style') || '');
      elm.css('word-wrap', 'break-word');
      if (elm.css('white-space') === 'nowrap') {
        elm.css('white-space', 'normal');
      }
      elm.bind_events = (function(_this) {
        return function() {
          elm.bind('update.dot', _this.update).bind('isTruncated.dot', _this.truncated).bind('originalContent.dot', _this.getOriginalContent).bind('destroy.dot', _this.destroyDot);
          return elm;
        };
      })(this);
      elm.unbind_events = function() {
        elm.unbind('update.dot');
        elm.unbind('isTruncated.dot');
        elm.unbind('originalContent.dot');
        elm.unbind('destroy.dot');
        return elm;
      };
      this.dot.watch = this.windowWatcher;
      this.dot.orgContent = elm.contents();
      o = this.$scope.dotOptions || {};
      this.dot.opts = angular.extend({}, this.defaults, o, {
        after: null
      });
      this.dot.conf = {};
      this.dot.$inr = null;
      if (!(this.dot.opts.lastCharacter.remove instanceof Array)) {
        this.dot.opts.lastCharacter.remove = this.defaultArrays.lastCharacter.remove;
      }
      if (!(this.dot.opts.lastCharacter.noEllipsis instanceof Array)) {
        this.dot.opts.lastCharacter.noEllipsis = this.defaultArrays.lastCharacter.noEllipsis;
      }
      this.dot.conf.afterElement = getElement(this.dot.opts.after, elm);
      this.dot.conf.isTruncated = false;
      this.dot.conf.dotId = dotId++;
      elm.data('dotdotdot', true).bind_events().triggerHandler('update.dot');
      if (this.dot.opts.watch) {
        this.dot.watch();
      }
      return elm;
    };

    dotId = 1;

    children = function($elem, o, after) {
      var $e, $elements, a, isTruncated, l;
      $elements = $elem.children();
      isTruncated = false;
      $elem.empty();
      a = 0;
      l = $elements.length;
      while (a < l) {
        $e = $elements.eq(a);
        $elem.append($e);
        if (after) {
          $elem.append(after);
        }
        if (test($elem, o)) {
          $e.remove();
          isTruncated = true;
          break;
        } else {
          if (after) {
            after.remove();
          }
        }
        a++;
      }
      return isTruncated;
    };

    ellipsis = function($elem, $d, $i, o, after) {
      var isTruncated, notx, noty;
      isTruncated = false;
      notx = ['a table', 'thead', 'tbody', 'tfoot', 'tr', 'col', 'colgroup', 'object', 'embed', 'param', 'ol', 'ul', 'dl', 'blockquote', 'select', 'optgroup', 'option', 'textarea', 'script', 'style'];
      noty = ['script', '.dotdotdot-keep'];
      angular.forEach($elem.contents().remove(), function(e) {
        var $e;
        $e = angular.element(e);
        if (typeof e === 'undefined' || e.nodeType === 3 && e.data.trim().length === 0) {
          return true;
        } else if (responseTo($e, noty)) {
          return $elem.append($e);
        } else if (isTruncated) {
          return true;
        } else {
          $elem.append($e);
          if (after && e.nodeType === 1) {
            $elem[responseTo($elem, notx) ? 'after' : 'append'](after);
          }
          if (test($i, o)) {
            if (e.nodeType === 3) {
              isTruncated = ellipsisElement($e, $d, $i, o, after);
            } else {
              isTruncated = ellipsis($e, $d, $i, o, after);
            }
            if (!isTruncated) {
              $e.remove();
              isTruncated = true;
            }
          }
          if (!isTruncated) {
            if (after) {
              return after.remove();
            }
          }
        }
      });
      return isTruncated;
    };

    responseTo = function($elem, types) {
      var checker, elem, j, k, len1, len2, match, tag, tags, type;
      if (!angular.isArray(types)) {
        throw Error("types must be an array");
      }
      if ($elem instanceof angular.element) {
        for (j = 0, len1 = $elem.length; j < len1; j++) {
          elem = $elem[j];
          if (responseTo(elem, types)) {
            return true;
          }
        }
        return false;
      }
      if ($elem.nodeName === '#text') {
        return false;
      }
      for (k = 0, len2 = types.length; k < len2; k++) {
        type = types[k];
        if (!(angular.isString(type) || type.length === 0)) {
          throw Error('type element must be set as string and must have length');
        }
        if (type[0] === '.') {
          if (angular.element($elem).hasClass(type)) {
            return true;
          }
        } else {
          tags = type.split(' ');
          match = true;
          checker = $elem;
          while (checker && (tag = tags.shift())) {
            if (tag === '') {
              continue;
            }
            if (checker.nodeName.toLowerCase() !== tag.toLowerCase()) {
              match = false;
              break;
            }
            checker = checker.firstChild;
          }
          if (match && tags.length === 0) {
            return true;
          }
        }
      }
      return false;
    };

    ellipsisElement = function($e, $d, $i, o, after) {
      var $w, afterLength, e, endPos, m, midPos, position, separator, space, startPos, textArr, txt;
      e = $e[0];
      if (!e) {
        return false;
      }
      txt = getTextContent(e);
      space = txt.indexOf(' ') !== -1 ? ' ' : '　';
      separator = o.wrap === 'letter' ? '' : space;
      textArr = txt.split(separator);
      position = -1;
      midPos = -1;
      startPos = 0;
      endPos = textArr.length - 1;
      if (o.fallbackToLetter && startPos === 0 && endPos === 0) {
        separator = '';
        textArr = txt.split(separator);
        endPos = textArr.length - 1;
      }
      while (startPos <= endPos && !(startPos === 0 && endPos === 0)) {
        m = Math.floor((startPos + endPos) / 2);
        if (m === midPos) {
          break;
        }
        midPos = m;
        setTextContent(e, textArr.slice(0, midPos + 1).join(separator) + o.ellipsis);
        if (!test($i, o)) {
          position = midPos;
          startPos = midPos;
        } else {
          endPos = midPos;
          if (o.fallbackToLetter && startPos === 0 && endPos === 0) {
            separator = '';
            textArr = textArr[0].split(separator);
            position = -1;
            midPos = -1;
            startPos = 0;
            endPos = textArr.length - 1;
          }
        }
      }
      if (position !== -1 && !(textArr.length === 1 && textArr[0].length === 0)) {
        txt = addEllipsis(textArr.slice(0, position + 1).join(separator), o);
        setTextContent(e, txt);
      } else {
        $w = $e.parent();
        $e.remove();
        afterLength = after && after.closest($w).length ? after.length : 0;
        if ($w.contents().length > afterLength) {
          e = findLastTextNode($w.contents().eq(-1 - afterLength), $d);
        } else {
          e = findLastTextNode($w, $d, true);
          if (!afterLength) {
            $w.remove();
          }
        }
        if (e) {
          txt = addEllipsis(getTextContent(e), o);
          setTextContent(e, txt);
          if (afterLength && after) {
            angular.element(e).parent().append(after);
          }
        }
      }
      return true;
    };

    test = function($i, o) {
      return $i[0].clientHeight > o.maxHeight;
    };

    addEllipsis = function(txt, o) {
      while (inArray(txt.slice(-1), o.lastCharacter.remove) > -1) {
        txt = txt.slice(0, -1);
      }
      if (inArray(txt.slice(-1), o.lastCharacter.noEllipsis) < 0) {
        txt += o.ellipsis;
      }
      return txt;
    };

    inArray = function(elem, arr, i) {
      var len;
      if (arr) {
        len = arr.length;
        i = i ? (i < 0 ? Math.max(0, len + i) : i) : 0;
        while (i < len) {
          if (indexOf.call(arr, i) >= 0 && arr[i] === elem) {
            return i;
          }
          i++;
        }
      }
      return -1;
    };

    wrapAll = function(elm, wrapper) {
      var parent;
      wrapper = wrapper.length ? wrapper[0] : wrapper;
      parent = elm.length ? elm[0] : elm;
      while (parent.childNodes.length > 0) {
        wrapper.appendChild(parent.childNodes[0]);
      }
      parent.appendChild(wrapper);
      return elm;
    };

    getSizes = function($d) {
      return {
        'width': $d[0].clientWidth,
        'height': $d[0].clientHeight
      };
    };

    setTextContent = function(e, content) {
      if (e.innerText) {
        e.innerText = content;
      } else if (e.nodeValue) {
        e.nodeValue = content;
      } else if (e.textContent) {
        e.textContent = content;
      }
    };

    getTextContent = function(e) {
      if (e.innerText) {
        return e.innerText;
      } else if (e.nodeValue) {
        return e.nodeValue;
      } else if (e.textContent) {
        return e.textContent;
      } else {
        return '';
      }
    };

    getPrevNode = function(n) {
      while (true) {
        n = n.previousSibling;
        if (!(n && n.nodeType !== 1 && n.nodeType !== 3)) {
          break;
        }
      }
      return n;
    };

    findLastTextNode = function($el, $top, excludeCurrent) {
      var e, p;
      e = $el && $el[0];
      p = void 0;
      if (e) {
        if (!excludeCurrent) {
          if (e.nodeType === 3) {
            return e;
          }
          if ($el.text().trim()) {
            return findLastTextNode(angular.element($el.contents()[$el.contents().length - 1]), $top);
          }
        }
        p = getPrevNode(e);
        while (!p) {
          $el = $el.parent();
          if ($el === $top || !$el.length) {
            return false;
          }
          p = getPrevNode($el[0]);
        }
        if (p) {
          return findLastTextNode(angular.element(p), $top);
        }
      }
      return false;
    };

    getElement = function(e, $i) {
      if (!e) {
        return false;
      }
      if (typeof e === 'string') {
        e = angular.element($i[0].querySelector(e));
        if (e.length) {
          return e;
        } else {
          return false;
        }
      }
      if (!e.jquery) {
        return false;
      } else {
        return e;
      }
    };

    getTrueInnerHeight = function($el) {
      var a, h, l, m, z;
      h = $el.clientHeight;
      a = ['paddingTop', 'paddingBottom'];
      z = 0;
      l = a.length;
      while (z < l) {
        m = parseInt(getTrueStyle($el, a[z]), 10);
        if (isNaN(m)) {
          m = 0;
        }
        h -= m;
        z++;
      }
      return h;
    };

    getTrueStyle = function($el, style) {
      if (window.getComputedStyle) {
        return window.getComputedStyle($el)[style];
      } else if (document.documentElement.currentStyle) {
        return $el.currentStyle[style];
      }
    };

    return Dotdotdot;

  })();

  dotInit = function() {
    var dotdotdot;
    dotdotdot = Object.create(Dotdotdot.prototype);
    Dotdotdot.apply(dotdotdot, arguments);
    return dotdotdot;
  };

  angular.module('angular.dotdotdot', []).directive('dotdotdot', ['$window', dotInit]);

}).call(this);
