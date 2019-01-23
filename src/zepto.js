var Zepto = (function () {
  var slice = [].slice,
    d = document,
    ADJ_OPS = {
      append: 'beforeEnd',
      prepend: 'afterBegin',
      before: 'beforeBegin',
      after: 'afterEnd'
    },
    e, k, css;

  // fix for iOS 3.2 修复iOS 3.2的trim方法
  if (String.prototype.trim === void 0)
    String.prototype.trim = function () {
      //把前后空格，替换掉 
      return this.replace(/^\s+/, '').replace(/\s+$/, '')
    };


  //封装h5选择器，返回数组，querySelectorAll默认返回NodeList，是类数组
  function $$(el, selector) {
    var result = slice.call(el.querySelectorAll(selector))
    return result;
  }

  //查找类，使用正则
  function classRE(name) {
    return new RegExp("(^|\\s)" + name + "(\\s|$)")
  }

  //过滤掉空元素，undefined,null
  function compact(array) {
    return array.filter(function (el) {
      return el !== void 0 && el !== null
    })
  }

  //核心选择器方法，
  function $(_, context) {
    // _ 参数，是选择器如"#name", ".class"，"span"
    // context 参数，是上下文环境
    //如果context有值，则在context里查找元素
    if (context !== void 0) return $(context).find(_);

    function fn(_) {
      //选择元素后操作会用到该方法     
      fn.dom.forEach(_);
      return fn;//返回自身，方便后面链式调用
    }


    fn.dom = compact(
      (typeof _ == 'function' && 'dom' in _)
        ? _.dom
        : (_ instanceof Array
          ? _
          : (_ instanceof Element
            ? [_]
            : $$(d, fn.selector = _)
          )
        )
    );

    $.extend(fn, $.fn);
    return fn;
  }
  //扩展方法,把src对象上的属性方法，赋值给target
  $.extend = function (target, src) {
    for (k in src) {
      target[k] = src[k]
    }
  }

  //转为驼峰写法
  camelize = function (str) {
    return str.replace(/-+(.)?/g, function (match, chr) {
      return chr ? chr.toUpperCase() : ''
    })
  }

  $.fn = {
    compact: function () {
      this.dom = compact(this.dom); return this
    },
    get: function (idx) {
      return idx === void 0 ? this.dom : this.dom[idx]
    },
    remove: function () {
      return this(function (el) {
        el.parentNode.removeChild(el)
      });
    },
    each: function (callback) {
      return this(callback)
    },
    filter: function (selector) {
      return $(this.dom.filter(
        function (el) {
          //父级再查找一次过滤选择器，返回查找到的
          return $$(el.parentNode, selector).indexOf(el) >= 0;
        })
      );
    },
    first: function (callback) {
      this.dom = compact([this.dom[0]]);
      return this
    },
    find: function (selector) {
      return $(this.dom.map(function (el) {
        return $$(el, selector)
      }).reduce(function (a, b) {
        return a.concat(b)
      }, []));
    },
    closest: function (selector) {
      var el = this.dom[0].parentNode,
        nodes = $$(d, selector);
      while (el && nodes.indexOf(el) < 0) el = el.parentNode;
      return $(el && !(el === d) ? el : []);
    },
    pluck: function (property) { return this.dom.map(function (el) { return el[property] }) },
    show: function () { return this.css('display', 'block') },
    hide: function () { return this.css('display', 'none') },
    prev: function () { return $(this.pluck('previousElementSibling')) },
    next: function () { return $(this.pluck('nextElementSibling')) },
    html: function (html) {
      return html === void 0
        ? (this.dom.length > 0 ? this.dom[0].innerHTML : null)
        : this(function (el) {
          el.innerHTML = html
        });
    },
    attr: function (name, value) {
      return (typeof name == 'string' && value === void 0)
        ? (this.dom.length > 0 ? this.dom[0].getAttribute(name) || undefined : null)
        : this(function (el) {
          if (typeof name == 'object') {
            for (k in name) el.setAttribute(k, name[k])
          }
          else {
            el.setAttribute(name, value);
          }
        });
    },
    offset: function () {
      var obj = this.dom[0].getBoundingClientRect();
      return {
        left: obj.left + d.body.scrollLeft,
        top: obj.top + d.body.scrollTop,
        width: obj.width,
        height: obj.height
      };
    },
    css: function (prop, value) {
      if (value === void 0 && typeof prop == 'string') {
        return this.dom[0].style[camelize(prop)];
      }
      css = "";
      for (k in prop) css += k + ':' + prop[k] + ';';
      if (typeof prop == 'string') css = prop + ":" + value;
      return this(function (el) {
        el.style.cssText += ';' + css
      });
    },
    index: function (el) {
      return this.dom.indexOf($(el).get(0));
    },
    bind: function (event, callback) {
      return this(function (el) {
        event.split(/\s/).forEach(function (event) {
          el.addEventListener(event, callback, false);
        });
      });
    },
    delegate: function (selector, event, callback) {
      return this(function (el) {
        el.addEventListener(event, function (event) {
          var target = event.target,
            nodes = $$(el, selector);
          while (target && nodes.indexOf(target) < 0) target = target.parentNode;
          if (target && !(target === el) && !(target === d)) callback(target, event);
        }, false);
      });
    },
    live: function (event, callback) {
      $(d.body).delegate(this.selector, event, callback);
      return this;
    },
    hasClass: function (name) {
      return classRE(name).test(this.dom[0].className);
    },
    addClass: function (name) {
      return this(function (el) {
        !$(el).hasClass(name) && (el.className += (el.className ? ' ' : '') + name)
      });
    },
    removeClass: function (name) {
      return this(function (el) { el.className = el.className.replace(classRE(name), ' ').trim() });
    },
    trigger: function (event) {
      return this(function (el) {
        var e;
        el.dispatchEvent(e = d.createEvent('Events'), e.initEvent(event, true, false))
      });
    }
  };

  ['width', 'height'].forEach(function (m) {
    $.fn[m] = function () {
      return this.offset()[m]
    }
  });

  for (k in ADJ_OPS) {
    //柯里化
    $.fn[k] = (function (op) {
      return function (html) {
        return this(function (el) {
          el['insertAdjacent' + (html instanceof Element ? 'Element' : 'HTML')](op, html)
        })
      };
    })(ADJ_OPS[k]);

  }


  return $;
})();

'$' in window || (window.$ = Zepto);