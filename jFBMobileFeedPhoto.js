/*!
 * jFBMobileFeedPhoto.js
 *
 * @version  1.0.1
 * @author   Yusuke Sugomori
 * @license  http://yusugomori.com/license/mit The MIT License
 *
 * More details on github: https://github.com/yusugomori/jFBMobileFeedPhoto
*/
var jFBMobileFeedPhoto;

jFBMobileFeedPhoto = (function() {

  function jFBMobileFeedPhoto(options) {
    if (options == null) options = {};
    this.scrollTop = 0;
    this.placeHolderId = '#jFBMobileFeedPhoto';
    this.margin = 20;
    this.imageMargin = 7;
    this.images = [];
    if (options.id != null) this.placeHolderId = options.id;
    this.$placeHolder = $(this.placeHolderId);
    this.overlayPlaceHolderId = this.placeHolderId + 'Overlay';
    this.overlayImageMargin = 20;
    this.overlayCloseText = 'Done';
    this.overlayCloseTextPos = 15;
    this.isOverlayShown = false;
    this.onTouchThres = 10;
    this.onTouchCurrent = {
      x: 0,
      y: 0
    };
    this.onTouchStart = {
      x: 0,
      y: 0
    };
    this.onTouchDrag = {
      x: 0,
      y: 0
    };
    this.onTouchImageFlg = false;
    this.currentImgNum = null;
    this.targetImg = null;
    this.onTouchCurrentOverlay = {
      x: 0,
      y: 0
    };
    this.onTouchStartOverlay = {
      x: 0,
      y: 0
    };
    this.onTouchDragOverlay = {
      x: 0,
      y: 0
    };
    this.currentImgNumOverlay = null;
    $('body').append("<div id=\"" + (this.overlayPlaceHolderId.substring(1)) + "\"></div>");
    this.$overlayPlaceHolder = $(this.overlayPlaceHolderId);
    this.$placeHolder.hide();
    this.$overlayPlaceHolder.hide();
    this.setImageArray();
    this.$placeHolder.empty();
    if (options.margin != null) this.margin = options.margin;
    if (!((options.margin != null) || this.images.length !== 1)) this.margin = 5;
    this.winWidth = $(window).width();
    this.winHeight = 0;
    this.placeImage();
    this.placeOverlay();
    this.setStaticCss();
    this.setStaticOverlayCss();
    this.main();
    this.orientationchange();
  }

  jFBMobileFeedPhoto.prototype.main = function() {
    this.setCss();
    this.$placeHolder.show();
    if (this.images.length > 1) {
      this.onTouch(true);
    } else {
      this.onTouch(false);
    }
  };

  jFBMobileFeedPhoto.prototype.onTouch = function(flg) {
    if (flg == null) flg = true;
    this.touchstart();
    this.touchmove(flg);
    this.touchend(flg);
  };

  jFBMobileFeedPhoto.prototype.touchstart = function() {
    var _this = this;
    this.$placeHolder.on('touchstart', function(e) {
      var touch;
      if (event.touches[1] != null) {
        e.preventDefault();
        return;
      }
      _this.targetImg = e.target;
      touch = event.touches[0];
      _this.onTouchCurrent = _this.getTranslate(_this.$placeHolder);
      _this.onTouchStart = {
        x: touch.pageX,
        y: touch.pageY
      };
      _this.onTouchDrag = {
        x: touch.pageX,
        y: touch.pageY
      };
      if ((_this.targetImg.tagName != null) && _this.targetImg.tagName.toLowerCase().match(/img/)) {
        return _this.onTouchImageFlg = true;
      }
    });
  };

  jFBMobileFeedPhoto.prototype.touchmove = function(flg) {
    var _this = this;
    if (flg == null) flg = true;
    this.$placeHolder.on('touchmove', function(e) {
      var touch, _dX, _dY;
      if (event.touches[1] != null) {
        e.preventDefault();
        return;
      }
      touch = event.touches[0];
      _this.onTouchDrag = {
        x: touch.pageX,
        y: touch.pageY
      };
      if (!flg) return;
      _dX = Math.abs(_this.onTouchStart.x - _this.onTouchDrag.x);
      _dY = Math.abs(_this.onTouchStart.y - _this.onTouchDrag.y);
      if (_dX >= _dY) {
        e.preventDefault();
        return _this.slideImage();
      }
    });
  };

  jFBMobileFeedPhoto.prototype.touchend = function(flg) {
    var _this = this;
    if (flg == null) flg = true;
    this.$placeHolder.on('touchend', function(e) {
      var _dX, _dY;
      if (event.touches[1] != null) {
        e.preventDefault();
        return;
      }
      if (_this.onTouchImageFlg) {
        _this.onTouchImageFlg = false;
        _dX = Math.abs(_this.onTouchStart.x - _this.onTouchDrag.x);
        _dY = Math.abs(_this.onTouchStart.y - _this.onTouchDrag.y);
        if (_dX < _this.onTouchThres && _dY < _this.onTouchThres) {
          _this.showOverlay();
          return;
        }
      }
      if (!flg) return;
      return _this.slideImageFix();
    });
  };

  jFBMobileFeedPhoto.prototype.onTouchOverlay = function(flg) {
    if (flg == null) flg = true;
    this.touchstartOverlay();
    this.touchmoveOverlay(flg);
    this.touchendOverlay(flg);
  };

  jFBMobileFeedPhoto.prototype.touchstartOverlay = function() {
    var _this = this;
    this.$overlayPlaceHolder.on('touchstart', function(e) {
      var touch;
      if (event.touches[1] != null) {
        e.preventDefault();
        return;
      }
      touch = event.touches[0];
      _this.onTouchCurrentOverlay = _this.getTranslate(_this.$overlayPlaceHolder.children().eq(0));
      _this.onTouchStartOverlay = {
        x: touch.pageX,
        y: touch.pageY
      };
      return _this.onTouchDragOverlay = {
        x: touch.pageX,
        y: touch.pageY
      };
    });
  };

  jFBMobileFeedPhoto.prototype.touchmoveOverlay = function(flg) {
    var _this = this;
    if (flg == null) flg = true;
    this.$overlayPlaceHolder.on('touchmove', function(e) {
      var touch;
      e.preventDefault();
      if (event.touches[1] != null) return;
      touch = event.touches[0];
      _this.onTouchDragOverlay = {
        x: touch.pageX,
        y: touch.pageY
      };
      if (!flg) return;
      return _this.slideImageOverlay();
    });
  };

  jFBMobileFeedPhoto.prototype.touchendOverlay = function(flg) {
    var _this = this;
    if (flg == null) flg = true;
    this.$overlayPlaceHolder.on('touchend', function(e) {
      if (event.touches[1] != null) {
        e.preventDefault();
        return;
      }
      if (!flg) return;
      return _this.slideImageFixOverlay();
    });
  };

  jFBMobileFeedPhoto.prototype.showOverlay = function() {
    var _this = this;
    this.setScrollTop();
    this.$overlayPlaceHolder.css({
      visibility: 'hidden'
    });
    this.$overlayPlaceHolder.show();
    this.setOverlayCss();
    $('html,body').height(this.winHeight);
    this.$overlayPlaceHolder.css({
      visibility: 'visible'
    });
    this.isOverlayShown = true;
    if (this.images.length > 1) {
      this.onTouchOverlay(true);
    } else {
      this.onTouchOverlay(false);
    }
    this.$overlayPlaceHolder.children().eq(1).on('click', function(e) {
      return _this.hideOverlay();
    });
    $(window).on('scroll', function(e) {
      return _this.hideOverlay();
    });
  };

  jFBMobileFeedPhoto.prototype.hideOverlay = function() {
    $('html,body').css({
      height: 'auto'
    });
    this.$overlayPlaceHolder.off('touchstart');
    this.$overlayPlaceHolder.off('touchmove');
    this.$overlayPlaceHolder.off('touchend');
    this.$overlayPlaceHolder.children().eq(1).off('click');
    this.$overlayPlaceHolder.hide();
    this.isOverlayShown = false;
    $(window).off('scroll');
    scrollTo(0, this.scrollTop);
  };

  jFBMobileFeedPhoto.prototype.slideImage = function() {
    var dx, w, x;
    dx = this.onTouchDrag.x - this.onTouchStart.x;
    x = this.onTouchCurrent.x + dx;
    w = this.winWidth - 2 * this.margin;
    if (x > 0) x = 0;
    if (x < -1 * (this.images.length - 1) * (w + this.imageMargin)) {
      x = -1 * (this.images.length - 1) * (w + this.imageMargin);
    }
    this.$placeHolder.css({
      '-webkit-transition-duration': '0ms',
      '-webkit-transform': "translate3d(" + x + "px, 0px, 0px)"
    });
  };

  jFBMobileFeedPhoto.prototype.slideImageFix = function(flg) {
    var dx, thres, w, x;
    if (flg == null) flg = false;
    w = this.winWidth - 2 * this.margin;
    if (flg && (this.currentImgNum != null)) {
      thres = this.currentImgNum;
    } else {
      dx = this.onTouchDrag.x - this.onTouchStart.x;
      x = this.onTouchCurrent.x + dx;
      thres = Math.abs(x - w / 2 - this.imageMargin);
    }
    if (thres < 0) {
      x = 0;
      this.currentImgNum = 0;
    } else {
      if (!(flg && (this.currentImgNum != null))) {
        thres = parseInt(thres / (w + this.imageMargin));
      }
      if (thres >= this.images.length) {
        x = -1 * (this.images.length - 1) * (w + this.imageMargin);
      } else {
        x = -1 * thres * (w + this.imageMargin);
      }
      this.currentImgNum = thres;
    }
    this.$placeHolder.css({
      '-webkit-transition-duration': '150ms',
      '-webkit-transform': "translate3d(" + x + "px, 0px, 0px)"
    });
  };

  jFBMobileFeedPhoto.prototype.slideImageOverlay = function() {
    var dx, x;
    dx = this.onTouchDragOverlay.x - this.onTouchStartOverlay.x;
    x = this.onTouchCurrentOverlay.x + dx;
    if (x > 0) x = 0;
    if (x < -1 * (this.images.length - 1) * (this.winWidth + this.overlayImageMargin)) {
      x = -1 * (this.images.length - 1) * (this.winWidth + this.overlayImageMargin);
    }
    this.$overlayPlaceHolder.children().eq(0).css({
      '-webkit-transform': "translate3d(" + x + "px, 0px, 0px)"
    });
  };

  jFBMobileFeedPhoto.prototype.slideImageFixOverlay = function(flg) {
    var dx, ms, thres, w, x;
    if (flg == null) flg = false;
    w = this.winWidth;
    if (flg && (this.currentImgNumOverlay != null)) {
      thres = this.currentImgNumOverlay;
    } else {
      dx = this.onTouchDragOverlay.x - this.onTouchStartOverlay.x;
      x = this.onTouchCurrentOverlay.x + dx;
      thres = Math.abs(x - w / 2 - this.overlayImageMargin);
    }
    if (thres < 0) {
      x = 0;
      this.currentImgNumOverlay = 0;
    } else {
      if (!(flg && (this.currentImgNumOverlay != null))) {
        thres = parseInt(thres / (w + this.overlayImageMargin));
      }
      if (thres >= this.images.length) {
        x = -1 * (this.images.length - 1) * (w + this.overlayImageMargin);
      } else {
        x = -1 * thres * (w + this.overlayImageMargin);
      }
      this.currentImgNumOverlay = thres;
    }
    if (flg) {
      ms = '0ms';
    } else if (this.winWidth > this.winHeight) {
      ms = '300ms';
    } else {
      ms = '150ms';
    }
    this.$overlayPlaceHolder.children().eq(0).css({
      '-webkit-transition-duration': ms,
      '-webkit-transform': "translate3d(" + x + "px, 0px, 0px)"
    });
  };

  jFBMobileFeedPhoto.prototype.setStaticCss = function() {
    $('html, body').css({
      overflow: 'hidden',
      height: 'auto'
    });
    this.$placeHolder.css({
      position: 'relative',
      margin: '0 auto',
      '-webkit-transform': 'translate3d(0px, 0px, 0px)',
      '-webkit-transition-property': '-webkit-transform',
      '-webkit-transform-style': 'preserve-3d',
      '-webkit-transition-timing-function': 'ease-in-out',
      '-webkit-transition-duration': '0ms'
    });
    this.$placeHolder.children().css({
      position: 'absolute',
      top: 0
    });
    this.$placeHolder.children().children().css({
      position: 'relative',
      overflow: 'hidden',
      '-webkit-box-shadow': '0 1px 2px #888',
      'box-shadow': '0 1px 2px #888'
    });
    this.$placeHolder.children().children().find('img').css({
      'max-width': '100%',
      'height': 'auto',
      border: 0,
      display: 'block',
      position: 'absolute',
      top: 0,
      left: 0
    });
  };

  jFBMobileFeedPhoto.prototype.setStaticOverlayCss = function() {
    this.$overlayPlaceHolder.css({
      overflow: 'hidden',
      'z-index': 9999,
      position: 'fixed',
      top: 0,
      left: 0,
      background: '#000'
    });
    this.$overlayPlaceHolder.children().eq(0).css({
      '-webkit-transform': 'translate3d(0px, 0px, 0px)',
      '-webkit-transition-property': '-webkit-transform',
      '-webkit-transform-style': 'preserve-3d',
      '-webkit-transition-timing-function': 'ease-in-out',
      '-webkit-transition-duration': '0ms'
    });
    this.$overlayPlaceHolder.children().eq(1).css({
      'z-index': 10000,
      position: 'absolute',
      top: this.overlayCloseTextPos,
      right: this.overlayCloseTextPos,
      background: 'rgba(0,0,0,0.5)',
      color: '#ddd',
      padding: '3px 10px',
      border: 'solid 2px #ddd',
      'border-radius': '3px',
      'font-size': '11px',
      'font-weight': 'bold'
    });
    this.$overlayPlaceHolder.children().eq(0).children().css({
      position: 'absolute',
      top: 0
    });
    this.$overlayPlaceHolder.children().eq(0).children().children().css({
      position: 'relative',
      overflow: 'hidden'
    });
    this.$overlayPlaceHolder.children().eq(0).children().children().find('img').css({
      border: 0,
      display: 'block',
      position: 'absolute'
    });
    this.$overlayPlaceHolder.children().eq(0).children().children().children('div').css({
      position: 'absolute',
      bottom: 0,
      left: 0,
      color: '#fff',
      background: 'rgba(0,0,0,0.3)',
      padding: '20px',
      'font-size': '14px',
      'letter-spacing': '1px',
      '-webkit-box-sizing': 'border-box',
      'box-sizing': 'border-box'
    });
  };

  jFBMobileFeedPhoto.prototype.setCss = function() {
    var containerHeight, i, parentWidth, placeHolderLeft, size, _left, _ref;
    this.setWinHeight();
    placeHolderLeft = 0;
    size = this.winWidth - 2 * this.margin;
    containerHeight = size;
    parentWidth = this.$placeHolder.parent().width();
    if (parentWidth < size) placeHolderLeft = (parentWidth - size) / 2;
    this.$placeHolder.css({
      height: size,
      width: size,
      left: placeHolderLeft
    });
    for (i = 0, _ref = this.images.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      _left = i * (size + this.imageMargin);
      this.$placeHolder.children().eq(i).css({
        left: _left
      });
    }
    this.$placeHolder.children().children().css({
      height: containerHeight,
      width: size
    });
    this.$placeHolder.children().children().find('img').css({
      'min-width': size,
      'min-height': size
    });
  };

  jFBMobileFeedPhoto.prototype.setOverlayCss = function() {
    var i, imageNum, transX, _$img, _h, _height, _img, _l, _left, _ref, _src, _t, _tmpImg, _w, _width;
    imageNum = $(this.targetImg).attr('data-image-number');
    transX = -1 * imageNum * (this.winWidth + this.overlayImageMargin);
    this.setWinHeight();
    this.$overlayPlaceHolder.css({
      height: this.winHeight + 5,
      width: this.winWidth
    });
    this.$overlayPlaceHolder.children().eq(0).css({
      '-webkit-transform': "translate3d(" + transX + "px, 0px, 0px)"
    });
    for (i = 0, _ref = this.images.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      _left = i * (this.winWidth + this.overlayImageMargin);
      this.$overlayPlaceHolder.children().eq(0).children().eq(i).css({
        left: _left
      });
      _img = this.$overlayPlaceHolder.children().eq(0).children().eq(i).children().find('img');
      _$img = $(_img);
      _src = _$img.attr('src');
      _tmpImg = new Image();
      _tmpImg.src = _src;
      _w = _tmpImg.width;
      _h = _tmpImg.height;
      _width = _w;
      _height = _h;
      if (_w > this.winWidth) {
        _width = this.winWidth;
        _h = _h * this.winWidth / _w;
        _height = _h;
      }
      if (_h > this.winHeight) {
        _height = this.winHeight;
        _width = _width * this.winHeight / _h;
      }
      _t = (this.winHeight - _height) / 2;
      _l = (this.winWidth - _width) / 2;
      _$img.css({
        top: _t,
        left: _l,
        height: _height,
        width: _width
      });
    }
    this.$overlayPlaceHolder.children().eq(0).children().children().css({
      height: this.winHeight,
      width: this.winWidth
    });
    this.$overlayPlaceHolder.children().eq(0).children().children().children('div').css({
      width: this.winWidth
    });
  };

  jFBMobileFeedPhoto.prototype.placeImage = function() {
    var i, _html, _ref;
    for (i = 0, _ref = this.images.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      _html = '<div><div>';
      _html += "<img src=\"" + this.images[i].img + "\" data-image-number=\"" + i + "\" />";
      _html += '</div></div>';
      this.$placeHolder.append(_html);
    }
  };

  jFBMobileFeedPhoto.prototype.placeOverlay = function() {
    var i, _html, _ref;
    this.$overlayPlaceHolder.append('<div></div>');
    this.$overlayPlaceHolder.append("<div>" + this.overlayCloseText + "</div>");
    for (i = 0, _ref = this.images.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      _html = '<div><div>';
      _html += "<img src=\"" + this.images[i].img + "\" data-image-number=\"" + i + "\" />";
      if (this.images[i].div != null) {
        _html += "<div>" + this.images[i].div + "</div>";
      }
      _html += '</div></div>';
      this.$overlayPlaceHolder.children().eq(0).append(_html);
    }
  };

  jFBMobileFeedPhoto.prototype.setImageArray = function() {
    var self;
    self = this;
    this.$placeHolder.children('div').each(function() {
      var $_div, $_img, _hash;
      $_img = $(this).children('img');
      $_div = $(this).children('div');
      _hash = {
        img: $_img.attr('src')
      };
      if ($_div.length > 0) _hash.div = $_div.html();
      return self.images.push(_hash);
    });
  };

  jFBMobileFeedPhoto.prototype.getTranslate = function(elem) {
    var m;
    m = new WebKitCSSMatrix($(elem).css('-webkit-transform'));
    return {
      x: parseInt(m.e, 10),
      y: parseInt(m.f, 10)
    };
  };

  jFBMobileFeedPhoto.prototype.setWinHeight = function() {
    if (window.innerHeight != null) {
      this.winHeight = window.innerHeight;
    } else {
      this.winHeight = $(window).height();
    }
  };

  jFBMobileFeedPhoto.prototype.setScrollTop = function() {
    this.scrollTop = $(window).scrollTop();
  };

  jFBMobileFeedPhoto.prototype.iphoneHack = function() {
    setTimeout(scrollTo, 120, 0, 1);
  };

  jFBMobileFeedPhoto.prototype.orientationchange = function() {
    var _this = this;
    $(window).on('orientationchange', function() {
      _this.$placeHolder.hide();
      _this.winWidth = $(window).width();
      _this.slideImageFix(true);
      _this.main();
      if (_this.isOverlayShown) {
        _this.setOverlayCss();
        return _this.slideImageFixOverlay(true);
      }
    });
  };

  return jFBMobileFeedPhoto;

})();
