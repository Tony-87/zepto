(function($){
  var cache = [], timeout;
  
  $.fn.remove = function(){
    return this.each(function(el){
      //如果是图片,先把图片资源修改，元素放入缓存，这样浏览器才会释放图片所占资源
      if(el.tagName=='IMG'){
        cache.push(el);
        el.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
        if(timeout) clearTimeout(timeout);
        timeout = setTimeout(function(){ cache = [] }, 60000);
      }
      el.parentNode.removeChild(el);
    });
  }  
})(Zepto);
