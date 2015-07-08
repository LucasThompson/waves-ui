import assert from 'assert';

import Layer from '../../es6/core/layer';
import Marker from '../../es6/shapes/marker';
import LayerTimeContext from '../../es6/core/layer-time-context';
import MarkerBehavior from '../../es6/behaviors/marker-behavior';
import Timeline from '../../es6/core/timeline';


describe('MarkerBehavior', function(){
    let titleDiv;
    let timeline;
    let timelineDiv;
    beforeEach(function(){
        titleDiv = document.createElement('div');
        titleDiv.innerHTML = this.currentTest.title;
        document.body.appendChild(titleDiv);
        timelineDiv = document.createElement("div");
        document.body.appendChild(timelineDiv);
    })
    describe('Edit Marker Behavior', function(){
        it('should correctly edit marker using marker behavior', function(){
            timeline = new Timeline();
            timeline.registerContainer(timelineDiv, {}, 'foo');

            // TimeContext
            let timeContext = new LayerTimeContext(timeline.timeContext)

            // Layer instanciation for a marker layer
            let data = [{ x: 3 }, { x: 6 }];
            let layer = new Layer('collection', data);
            layer.setTimeContext(timeContext);
            layer.configureShape(Marker);
            layer.setBehavior(new MarkerBehavior());
            layer.timeContext.duration = 12;

            // Attach layer to the timeline
            timeline.addLayer(layer, 'foo');
            ;
            timeline.drawLayersShapes();
            timeline.update();

            let item = layer.d3items.nodes()[0];
            layer.edit(item, 10, 0, undefined);

            assert.equal(layer.data[0].x, 3.1);

            layer.update();

        })
    })
})
