/**
 @author David Piegza

 Implements a selection for objects in a scene.

 It invokes a callback function when the mouse enters and when it leaves the object.
 Based on a Three.js selection example.

 Parameters:
 domElement: HTMLDomElement
 selected: callback function, passes the current selected object (on mouseover)
 clicked: callback function, passes the current clicked object
 */

THREE.ObjectSelection = function (parameters) {
    var parameters = parameters || {};
    var raycaster = new THREE.Raycaster();
    this.domElement = parameters.domElement || document;
    //this.projector = new THREE.Projector();
    this.INTERSECTED;

    var _this = this;

    var callbackSelected = parameters.selected;
    var callbackClicked = parameters.clicked;
    var mouse = new THREE.Vector2();

    var trace
    this.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
    function onDocumentMouseMove(event) {
        var rect = this.getBoundingClientRect()
        mouse.x = ( (event.clientX-rect.left) / this.width ) * 2 - 1;
        mouse.y = -( (event.clientY-rect.top) / this.height ) * 2 + 1;
        //console.log(mouse);
    }

    this.domElement.addEventListener('click', onDocumentMouseClick, false);
    function onDocumentMouseClick(event) {
        if (_this.INTERSECTED) {
            if (typeof callbackClicked === 'function') {
                callbackClicked(_this.INTERSECTED);
            }
        }
    }

    this.showTrace = function (scene, camera, raycaster) {

        if(!trace) {
            material = new THREE.LineBasicMaterial({color: 0x00f0ff, opacity: 1, linewidth: 10});

            var tmp_geo = new THREE.Geometry();
            tmp_geo.vertices.push(raycaster.ray.origin);
            tmp_geo.vertices.push(raycaster.ray.direction.multiplyScalar(10000));

            trace = new THREE.Line(tmp_geo, material, THREE.LinePieces);
            scene.add(trace)
        }else{

            trace.geometry.vertices[1]=raycaster.ray.origin.add(new THREE.Vector3( 1, 1, 0 ))

            trace.geometry.vertices[0]=raycaster.ray.direction.multiplyScalar(10000)
            trace.geometry.verticesNeedUpdate = true

        }

    }

    this.render = function (scene, camera) {
        raycaster.setFromCamera(mouse, camera);

        // calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects(scene.children);

        //this.showTrace(scene, camera,raycaster)
        // for ( var i = 0; i < intersects.length; i++ ) {

        //  intersects[ i ].object.material.color.set( 0xff0000 );

        // }
        //var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
        //this.projector.unprojectVector( vector, camera );
        //
        //var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        //
        //var intersects = raycaster.intersectObject(scene, true);
        //
        var element
        for(var i=0;i<intersects.length;i++){
            if(intersects[i].object.type!=='Line'){
                element=intersects[i].object
            }
        }
        if (element) {
            if (this.INTERSECTED != element) {
                if (this.INTERSECTED) {
                    this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
                }

                this.INTERSECTED = element;
                this.INTERSECTED.currentHex = this.INTERSECTED.material.color.getHex();
                this.INTERSECTED.material.color.setHex(0x0000ff);
                if (typeof callbackSelected === 'function') {
                    callbackSelected(this.INTERSECTED);
                }
            }
        } else {
            if (this.INTERSECTED) {
                this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
            }
            this.INTERSECTED = null;
            if (typeof callbackSelected === 'function') {
                callbackSelected(this.INTERSECTED);
            }
        }
    }
}
