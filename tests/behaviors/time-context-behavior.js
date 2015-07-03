const assert = require('assert');

const Layer = require('../../es6/core/layer');
const LayerTimeContext = require('../../es6/core/layer-time-context');
const TimeContextBehavior = require('../../es6/behaviors/time-context-behavior');
const Timeline = require('../../es6/core/timeline');


describe('TimeContextBehavior', function(){
    describe('Edit behavior of TimeContext', function(){

        it('should edit shape accordingly', function(){

            let titleDiv = document.createElement('div');
            titleDiv.innerHTML = this.test.title;
            document.body.appendChild(titleDiv);
            let timelineDiv = document.createElement("div");
            document.body.appendChild(timelineDiv);

            // Create a timeline
            let timeline = new Timeline();
            timeline.registerContainer('foo', timelineDiv);

            // TimeContext
            let timeContext = new LayerTimeContext(timeline.timeContext)

            // Layer instanciation
            let layer = new Layer('collection', []);
            layer.setTimeContext(timeContext);
            layer.timeContext.duration = 12;

            // Attach layer to the timeline
            timeline.addLayer(layer, 'foo');
            timeline.render();
            timeline.draw();
            timeline.update();

            timeline.timeContextBehavior.edit(layer, 10, 0, layer.container);

            // Check that the timeContext.start has changed accordingly (10px becomes 0.6 sec)
            assert.equal(layer.timeContext.start, 0.1)
            assert.equal(layer.timeContext.duration, 12)
            assert.equal(layer.timeContext.offset, 0)

            timeline.timeContextBehavior.edit(layer, 10, 0, layer.contextShape.leftHandler);

            assert.equal(layer.timeContext.start, 0.2)
            assert.equal(layer.timeContext.duration, 11.9)
            assert.equal(layer.timeContext.offset, -0.1)

            timeline.timeContextBehavior.edit(layer, 10, 0, layer.contextShape.rightHandler);

            assert.equal(layer.timeContext.start, 0.2)
            assert.equal(layer.timeContext.duration, 12)
            assert.equal(layer.timeContext.offset, -0.1)

            timeline.timeContextBehavior.edit(layer, -20, 0, layer.contextShape.rect);
            // start can't be negative: -20 should give -0.1 start if not blocked, but it's blocked by the lib
            assert.equal(layer.timeContext.start, 0)
            assert.equal(layer.timeContext.duration, 12)
            assert.equal(layer.timeContext.offset, -0.1)

            timeline.timeContextBehavior.edit(layer, 10, 0, layer.contextShape.leftHandler);

            assert.equal(layer.timeContext.start, 0.1)
            assert.equal(layer.timeContext.duration, 11.9)
            assert.equal(layer.timeContext.offset, -0.2)
        })

        it('should edit shape accordingly v2', function(){
            let titleDiv = document.createElement('div');
            titleDiv.innerHTML = this.test.title;
            document.body.appendChild(titleDiv);
            let timelineDiv = document.createElement("div");
            document.body.appendChild(timelineDiv);

            // Create a timeline
            let timeline = new Timeline();
            timeline.registerContainer('foo', timelineDiv);

            // TimeContext
            let timeContext = new LayerTimeContext(timeline.timeContext)

            // Layer instanciation
            let layer = new Layer('collection', []);
            layer.setTimeContext(timeContext);
            layer.timeContext.duration = 12;

            // Attach layer to the timeline
            timeline.addLayer(layer, 'foo');
            timeline.render();
            timeline.draw();
            timeline.update();

            timeline.timeContextBehavior.edit(layer, 10, 0, layer.contextShape.leftHandler);

            assert.equal(layer.timeContext.start, 0.1)
            assert.equal(layer.timeContext.duration, 11.9)
            assert.equal(layer.timeContext.offset, -0.1)

            timeline.timeContextBehavior.edit(layer, 10, 0, layer.contextShape.rightHandler);

            assert.equal(layer.timeContext.start, 0.1)
            assert.equal(layer.timeContext.duration, 12)
            assert.equal(layer.timeContext.offset, -0.1)

            timeline.timeContextBehavior.edit(layer, -20, 0, layer.contextShape.rect);
            // start can't be negative: -20 should give -0.6 start if not blocked
            assert.equal(layer.timeContext.start, 0)
            assert.equal(layer.timeContext.duration, 12)
            assert.equal(layer.timeContext.offset, -0.1)

            timeline.timeContextBehavior.edit(layer, 10, 0, layer.contextShape.leftHandler);

            assert.equal(layer.timeContext.start, 0.1)
            assert.equal(layer.timeContext.duration, 11.9)
            assert.equal(layer.timeContext.offset, -0.2)

        })
    })
    describe('Stretch behavior of TimeContext', function(){
        it('should stretch behavior correctly', function(){
            let titleDiv = document.createElement('div');
            titleDiv.innerHTML = this.test.title;
            document.body.appendChild(titleDiv);
            let timelineDiv = document.createElement("div");
            document.body.appendChild(timelineDiv);

            // Create a timeline
            let timeline = new Timeline();
            timeline.registerContainer('foo', timelineDiv);

            // TimeContext
            let timeContext = new LayerTimeContext(timeline.timeContext)

            // Layer instanciation
            let layer = new Layer('collection', []);
            layer.setTimeContext(timeContext);
            layer.timeContext.duration = 12;

            // Attach layer to the timeline
            timeline.addLayer(layer, 'foo');
            timeline.render();
            timeline.draw();

            timeline.timeContextBehavior.stretch(layer, 10, 0, layer.container);

            let sR = layer.timeContext.stretchRatio;

            // "Non-sense" it's just a move
            assert.equal(layer.timeContext.start, 0.1)
            assert.equal(layer.timeContext.duration, 12)
            assert.equal(layer.timeContext.offset, 0)

            timeline.timeContextBehavior.stretch(layer, 10, 0, layer.contextShape.leftHandler);

            assert.equal(layer.timeContext.start, 0.2)
            assert.equal(layer.timeContext.duration, 12)
            assert.equal(layer.timeContext.offset, 0)
            assert.equal(layer.timeContext.stretchRatio, 11.9/12*sR)

            sR = 11.9/12*sR;

            timeline.timeContextBehavior.stretch(layer, -10, 0, layer.contextShape.rightHandler);

            assert.equal(layer.timeContext.start, 0.2)
            assert.equal(layer.timeContext.duration, 12)
            assert.equal(layer.timeContext.offset, 0)
            assert.equal(layer.timeContext.stretchRatio, 11.8/11.9*sR)

        })
    })
})