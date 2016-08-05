var micra = (function () {
  var camera, scene, renderer;
  var geometry, material, mesh;
  var controls;

  var objects = [];

  var raycaster;

  var loadTexture　= function () {
    var loader = new THREE.TextureLoader();
    // TODO:　読み込む画像を指定
    return {
      grass: loader.load('assets/images/grass.png'),
      groundSide: loader.load('assets/images/ground-side.png'),
      groundBottom: loader.load('assets/images/ground-bottom.png')
    };
  };
  var innerGrounds;
  var speedRate = 1;
  var textures = loadTexture();
  isCreate = false;

  var blocker = document.getElementById( 'blocker' );
  var instructions = document.getElementById( 'instructions' );

  var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

  if ( havePointerLock ) {

    var element = document.body;

    var pointerlockchange = function ( event ) {

      if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

        controlsEnabled = true;
        controls.enabled = true;

        blocker.style.display = 'none';

      } else {

        controls.enabled = false;

        blocker.style.display = '-webkit-box';
        blocker.style.display = '-moz-box';
        blocker.style.display = 'box';

        instructions.style.display = '';

      }

    };

    var pointerlockerror = function ( event ) {

      instructions.style.display = '';

    };

    // Hook pointer lock state change events
    document.addEventListener( 'pointerlockchange', pointerlockchange, false );
    document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

    document.addEventListener( 'pointerlockerror', pointerlockerror, false );
    document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
    document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

    instructions.addEventListener( 'click', function ( event ) {

      instructions.style.display = 'none';

      // Ask the browser to lock the pointer
      element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

      if ( /Firefox/i.test( navigator.userAgent ) ) {

        var fullscreenchange = function ( event ) {

          if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

            document.removeEventListener( 'fullscreenchange', fullscreenchange );
            document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

            element.requestPointerLock();
          }

        };

        document.addEventListener( 'fullscreenchange', fullscreenchange, false );
        document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

        element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

        element.requestFullscreen();

      } else {

        element.requestPointerLock();

      }

    }, false );

  } else {

    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

  }
  var controlsEnabled = false;

  var moveForward = false;
  var moveBackward = false;
  var moveLeft = false;
  var moveRight = false;
  var canJump = false;

  var prevTime = performance.now();
  var velocity = new THREE.Vector3();

  function init() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

    scene = new THREE.Scene();
    // scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

    var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    scene.add( light );

    controls = new THREE.PointerLockControls( camera );
    scene.add( controls.getObject() );

    var onKeyDown = function ( event ) {
      switch ( event.keyCode ) {
        case 16:
          speedRate = 0.2;
          break;
        case 17:
          isCreate = true;
          break;
        case 38: // up
        case 87: // w
          moveForward = true;
          break;

        case 37: // left
        case 65: // a
          moveLeft = true; break;

        case 40: // down
        case 83: // s
          moveBackward = true;
          break;

        case 39: // right
        case 68: // d
          moveRight = true;
          break;

        case 32: // space
          if ( canJump === true ) velocity.y += 350;
          canJump = false;
          break;

      }

    };

    var onKeyUp = function ( event ) {

      switch( event.keyCode ) {
        case 16:
          speedRate = 1.0;
          break;
        case 17:
          isCreate = false;
          break;
        case 38: // up
        case 87: // w
          moveForward = false;
          break;
        case 37: // left
        case 65: // a
          moveLeft = false;
          break;
        case 40: // down
        case 83: // s
          moveBackward = false;
          break;
        case 39: // right
        case 68: // d
          moveRight = false;
          break;

      }

    };

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
    document.addEventListener('click', onDocumentMouseDown, false);
    // document.addEventListener('contextmenu', onContextMenue, false);

    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );


    // objects

    geometry = new THREE.BoxGeometry( 20, 20, 20 );

    var grounds = [
      new THREE.MeshBasicMaterial({map: textures.groundSide}),
      new THREE.MeshBasicMaterial({map: textures.groundSide}),
      new THREE.MeshBasicMaterial({map: textures.grass}),
      new THREE.MeshBasicMaterial({map: textures.groundBottom}),
      new THREE.MeshBasicMaterial({map: textures.groundSide}),
      new THREE.MeshBasicMaterial({map: textures.groundSide})
    ];
    innerGrounds = [
      new THREE.MeshBasicMaterial({map: textures.groundSide}),
      new THREE.MeshBasicMaterial({map: textures.groundSide}),
      new THREE.MeshBasicMaterial({map: textures.groundBottom}),
      new THREE.MeshBasicMaterial({map: textures.groundBottom}),
      new THREE.MeshBasicMaterial({map: textures.groundSide}),
      new THREE.MeshBasicMaterial({map: textures.groundSide})
    ];

    for ( var i = 0; i < 500; i ++ ) {

      // material = new THREE.MeshPhongMaterial( { specular: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
      material = new THREE.MeshFaceMaterial(grounds);

      var mesh = new THREE.Mesh( geometry, material );
      mesh.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
      mesh.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
      mesh.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;
      scene.add( mesh );

      // material.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

      objects.push( mesh );

    }

    // floor
    for (var i = -200; i < 200; i += 20) {
      for (var j = -200; j < 200; j += 20) {
        material = new THREE.MeshFaceMaterial(innerGrounds);

        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = j;
        mesh.position.y = -10;
        mesh.position.z = i;
        scene.add( mesh );

        // material.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

        objects.push( mesh );

      }
    }





    //

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0xffffff );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //

    window.addEventListener( 'resize', onWindowResize, false );

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

  }

  var render = function() {

    requestAnimationFrame( render );

    if ( controlsEnabled ) {
      raycaster.ray.origin.copy( controls.getObject().position );
      raycaster.ray.origin.y -= 10;

      var intersections = raycaster.intersectObjects( objects );

      var isOnObject = intersections.length > 0;

      var time = performance.now();
      var delta = ( time - prevTime ) / 1000;

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;

      velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

      if ( moveForward ) velocity.z -= 400.0 * delta * speedRate;
      if ( moveBackward ) velocity.z += 400.0 * delta * speedRate;
      if ( moveLeft ) velocity.x -= 400.0 * delta * speedRate;
      if ( moveRight ) velocity.x += 400.0 * delta * speedRate;

      if ( isOnObject === true ) {
        velocity.y = Math.max( 0, velocity.y );

        canJump = true;
      }

      controls.getObject().translateX( velocity.x * delta );
      controls.getObject().translateY( velocity.y * delta );
      controls.getObject().translateZ( velocity.z * delta );

      if ( controls.getObject().position.y < 10 ) {

        velocity.y = 0;
        controls.getObject().position.y = 10;

        canJump = true;

      }

      prevTime = time;

    }

    renderer.render( scene, camera );

  };

  var onDocumentMouseDown = function (event) {
    console.log(controls.getObject().position);

    if (isCreate) {
      onContextMenue();
      return;
    }

    var raycaster = new THREE.Raycaster();
    var vector = new THREE.Vector3(0, 0, -1);
    raycaster.setFromCamera(vector, camera);

    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0 ) {
      // TODO: ブロックまでの距離がブロック1つ分以内であれば処理させたい。
      var cube = intersects[0].object;
      var pos = controls.getObject().position;
      var distance = (cube.position.x - pos.x) * (cube.position.x - pos.x) + (cube.position.y - pos.y) * (cube.position.y - pos.y) + (cube.position.z - pos.z) * (cube.position.z - pos.z);
      // console.log(distance);
      if (distance < 1200) {
        // intersects[0].object.material.transparent = true;
        scene.remove(cube)
        // var index = objects.indexOf(cube);
        // delete objects[index];
      }
    }
  };
  var onContextMenue = function () {
    innerGrounds = [
      new THREE.MeshBasicMaterial({map: textures.groundSide}),
      new THREE.MeshBasicMaterial({map: textures.groundSide}),
      new THREE.MeshBasicMaterial({map: textures.groundBottom}),
      new THREE.MeshBasicMaterial({map: textures.groundBottom}),
      new THREE.MeshBasicMaterial({map: textures.groundSide}),
      new THREE.MeshBasicMaterial({map: textures.groundSide})
    ];
    var geometry = new THREE.BoxGeometry( 20, 20, 20 );
    var material = new THREE.MeshFaceMaterial(innerGrounds);

    var mesh = new THREE.Mesh( geometry, material );
    var pos = controls.getObject().position;
    mesh.position.set(pos.x, pos.y + 5, pos.z);
    scene.add( mesh );
  };

  return {
    init: init,
    render: render
  };
})();
