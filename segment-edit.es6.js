var SegmentVis   = require('segment-vis');
var makeEditable = require('make-editable');
// var extend       = require('utils').extend;

'use strict';

class SegmentEdit extends SegmentVis {

  constructor() {
    if (!(this instanceof SegmentEdit)) { return new SegmentEdit; }

    super();
    // default editable properties
    var defaults = {
      edits: ['x', 'y', 'width', 'height'],
      handlerWidth: 2,
      handlerOpacity: 0
    };

    this.params(defaults);
  }

  // add handler on segment shape
  update(data) {
    var g = super.update(data);

    g.append('line')
      .attr('class', 'handle left')
      .attr('stroke-width', this.param('handlerWidth'))
      .attr('stroke-opacity', this.param('handlerOpacity'));

    g.append('line')
      .attr('class', 'handle right')
      .attr('stroke-width', this.param('handlerWidth'))
      .attr('stroke-opacity', this.param('handlerOpacity'));
  }

  draw(el) {
    el = super.draw(el);
    var accessors = this.getAccesors();

    var _handlerWidth = parseInt(this.param('handlerWidth'), 10)
    var _halfHandler = _handlerWidth * 0.5;

    el.selectAll('.handle.left')
      .attr('x1', _halfHandler)
      .attr('x2', _halfHandler)
      .attr('y1', 0)
      .attr('y2', accessors.h)
      .style('stroke', accessors.color);

    el.selectAll('.handle.right')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', accessors.h)
      .attr('transform', (d) => { 
        return 'translate(' + accessors.rhx(d) + ', 0)'; 
      })
      .style('stroke', accessors.color);
  }

  getAccesors() {
    var accessors = super.getAccessors();

    var _handlerWidth = parseInt(this.param('handlerWidth'), 10)
    var _halfHandler = _handlerWidth * 0.5;

    // handler positions
    // var hh  = (d) => { return accessors.y(d) + accessors.h(d); }
    // var lhx = (d) => { return accessors.x(d) + _halfHandler; }
    var rhx = (d) => {
      let width = accessors.w(d);

      return (width < (_handlerWidth * 2)) ?
        _handlerWidth + this.__minWidth : width - _halfHandler;
    }

    return Object.assign(accessors, { rhx: rhx });
  }

  // logic performed to select an item from the brush
  brushItem(extent, mode) {
    mode = mode || 'xy'; // default tries to match both

    var modeX = mode.indexOf('x') >= 0;
    var modeY = mode.indexOf('y') >= 0;
    var matchX = false, matchY = false;

    // data mappers
    var start = this.start();
    var duration = this.duration();
    var y = this.y();
    var height = this.height();

    this.g.selectAll('.selectable').classed('selected', (d, i) => {
      // var offsetTop = (that.top() || 0) + (that.base.margin().top || 0);
      // var offsetLeft = (that.left || 0) + (that.base.margin().left || 0);

      // X match
      if (modeX) {
        var x1 = start(d);
        var x2 = x1 + duration(d);
        //            begining sel               end sel
        var matchX1 = extent[0][0] <= x1 && x2 < extent[1][0];
        var matchX2 = extent[0][0] <= x2 && x1 < extent[1][0];

        matchX = (matchX1 || matchX2);
      } else {
        matchX = true;
      }

      // Y match
      if (modeY) {
        var y1 = y(d);
        var y2 = y1 + height(d);
        //            begining sel               end sel
        var matchY1 = extent[0][1] <= y1 && y2 < extent[1][1];
        var matchY2 = extent[0][1] <= y2 && y1 <= extent[1][1];

        matchY = (matchY1 || matchY2);
      } else {
        matchY = true;
      }

      return matchX && matchY;
    });
  }

  // checks if the clicked item is one of our guys
  clicked(item) {
    var items = this.g.selectAll('rect, line')[0];
    return items.indexOf(item) !== -1;
  }

  // mouse drag event switcher depending on drag (left|right|block) levels
  onDrag(e) {
    if (this.base.brushing()) { return; }

    var classList = e.dragged.classList;
    var mode = 'mv';
    
    if (classList.contains('left') > 0) mode = 'l';
    if (classList.contains('right') > 0) mode = 'r';

    this.handleDrag(mode, e);
  }

  // handles all the dragging possibilities
  handleDrag(mode, e) {
    var d = e.d;
    var delta = e.event;
    var item = e.target;

    var xScale = this.base.xScale;
    var yScale = this.yScale;

    var constrains = this.param('edits');
    var canX = !!~constrains.indexOf('x');
    var canY = !!~constrains.indexOf('y');
    var canW = !!~constrains.indexOf('width');
    var canH = !!~constrains.indexOf('height');

    // data mappers
    var _start = this.start();
    var _duration = this.duration();
    var _y = this.y();

    // has to be the svg because the group is virtually not there :( ??
    if (mode === 'l' || mode === 'r') {
      this.base.svg.classed('handle-resize', true);
    } else {
      this.base.svg.classed('handle-drag', true);
    }

    var width = xScale(_duration(d));
    var posX = xScale(_start(d));

    // handle resize
    if (mode === 'l' && canW) width -= delta.dx; // px
    if (mode === 'r' && canW) width += delta.dx; // px

    // apply duration when editing through the handles
    if ((mode === 'l' || mode === 'r') && canW) {
      if (width < 1) { width = 1; }
      _duration(d, xScale.invert(width));
    }

    if (mode === 'l' && canW) {
      posX += delta.dx;
      _start(d, xScale.invert(posX));
    }

    // handle move
    if (mode === 'mv' && canX) {
      var minX = 0;
      var maxX = this.base.width();
      var targetX = posX + delta.dx;

      if (targetX >= minX && (targetX + width) <= maxX) {
        posX = targetX;
        _start(d, xScale.invert(posX));
      }
    }

    if (mode === 'mv' && canY) {
      var posY = this.yScale(_y(d));
      var minY = this.param('height') - this.yScale(this.height()(d));
      var maxY = this.param('height');
      var targetY = posY + delta.dy;

      if (targetY >= minY && targetY <= maxY) {
        posY = targetY;
        _y(d, this.yScale.invert(posY));
      }
    }
    // redraw `.selected` item(s)
    this.draw(this.d3.select(item));
  }
}

// make editable mixin
makeEditable(SegmentEdit);

module.exports = SegmentEdit;
