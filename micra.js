var micra = (function () {
  var scene, renderer, camera;
  var controls, controlsEnabled;
  var moveForward,
      moveBackward,
      moveLeft,
      moveRight,
      canJump;
  var velocity;
  var clock;
  var havePointerLock;
  var walkSpeed = 40.0;
  var sneekSpeed = 10.0;
  var walkingSpeed = walkSpeed;

  var init = function () {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x0033ff, 1);
    // renderer.setClearColor(0xffffff, 1);
    document.body.appendChild( renderer.domElement );
    renderer.shadowMap.enabled = true;

    // TODO: フォグを付けるか検討
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 0.01, 180);

    // カメラの設定は，視野角，画面サイズ，カメラの見える範囲の最小値，最大値
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 150 );
    // camera.position.set(0, 0, 0);
    scene.add(camera);

    ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add( ambientLight );
    directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set( 7, 7, 7 );
    scene.add( directionalLight );

    // hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.6);
    // scene.add( hemiLight );

    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());

    clock = new THREE.Clock();
    velocity = new THREE.Vector3();

    havePointerLock = checkForPointerLock();
    initPointerLock();
    initControls();

    // TODO: ここで読み込んだテクスチャーで各ブロックを処理
    textures = loadTexture();
    var grounds = [
    	new THREE.MeshBasicMaterial({color: 0xfffff, map: textures.groundSide}),
    	new THREE.MeshBasicMaterial({color: 0xfffff, map: textures.groundSide}),
    	new THREE.MeshBasicMaterial({color: 0xfffff, map: textures.grass}),
    	new THREE.MeshBasicMaterial({color: 0xfffff, map: textures.groundBottom}),
    	new THREE.MeshBasicMaterial({color: 0xfffff, map: textures.groundSide}),
    	new THREE.MeshBasicMaterial({color: 0xfffff, map: textures.groundSide})
    ];
    var innerGounds = [
    	new THREE.MeshBasicMaterial({color: 0xfffff, map: textures.groundSide}),
    	new THREE.MeshBasicMaterial({color: 0xfffff, map: textures.groundSide}),
    	new THREE.MeshBasicMaterial({color: 0xfffff, map: textures.groundBottom}),
    	new THREE.MeshBasicMaterial({color: 0xfffff, map: textures.groundBottom}),
    	new THREE.MeshBasicMaterial({color: 0xfffff, map: textures.groundSide}),
    	new THREE.MeshBasicMaterial({color: 0xfffff, map: textures.groundSide})
    ];

    // キューブをいっぱい置いてみるテスト
    // うまくいけばいろいろと分離
    var side = 2;
    var cubeGeometry = new THREE.BoxGeometry(side, side, side);
    var material = new THREE.MeshFaceMaterial(innerGounds);
    for (var k = 0; k < 5; k++) {
      for (var i = 0; i < 40; i++) {
        for (var j = 0; j < 40; j++) {
          cube = new THREE.Mesh(cubeGeometry, material);
          var x = j * side - 40;
          var z = i * side - 40;
          cube.position.set(x, k * side - 1, z);
          // cube.position.set(x, -side / 2, z);
          cube.castShadow = true;
          cube.name = "cube-" + scene.children.length;
          scene.add(cube);
        }
      }
    }
    material = new THREE.MeshFaceMaterial(grounds);
    for (var i = 0; i < 15; i++) {
      for (var j = 0; j < 40; j++) {
        cube = new THREE.Mesh(cubeGeometry, material);
        var x = j * side - 40;
        var z = i * side - 40;
        cube.position.set(x, 5 * side - 1, z);
        cube.castShadow = true;
        cube.name = "cube-" + scene.children.length;
        scene.add(cube);
      }
    }

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('click', onDocumentMouseDown, false);
  };

  var render = function () {
    renderer.render(scene, camera);
    updateControls();
    requestAnimationFrame( render );
  };

  var loadTexture　= function () {
    var loader = new THREE.TextureLoader();
    // TODO:　読み込む画像を指定
    return {
      grass: loader.load('assets/images/grass.png'),
      groundSide: loader.load('assets/images/ground-side.png'),
      groundBottom: loader.load('assets/images/ground-bottom.png')
    };
  };

  var onWindowResize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
  	camera.updateProjectionMatrix();
  	renderer.setSize( window.innerWidth, window.innerHeight );
  };

  var onDocumentMouseDown = function (event) {
    var raycaster = new THREE.Raycaster();
    var vector = new THREE.Vector3(0, 0, -1);
    raycaster.setFromCamera(vector, camera);

    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0 ) {
      // TODO: ブロックまでの距離がブロック1つ分以内であれば処理させたい。
      var cube = intersects[0].object;
      var pos = controls.getObject().position;
      var distance = (cube.position.x - pos.x) * (cube.position.x - pos.x) + (cube.position.y - pos.y) * (cube.position.y - pos.y) + (cube.position.z - pos.z) * (cube.position.z - pos.z);
      console.log(distance);
      if (distance < 30) {
        // intersects[0].object.material.transparent = true;
        scene.remove(cube)
      }
    }
  };

  var checkForPointerLock = function () {
    return 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'wevkitPointerLockElement' in document;
  };

  function initPointerLock() {
    var element = document.body;

    if (havePointerLock) {
      var pointerlockchange = function (event) {
        if (document.pointerLockElement === element ||
            document.mozPointerLockElement === element ||
            document.webkitPointerLockElement === element) {
          controlsEnabled = true;
          controls.enabled = true;
        } else {
          controlsEnabled = false;
          controls.enabled = false;
        }
      };

      var pointerlockerror = function (event) {
        element.innerHTML = 'PointerLock Error';
      };

      document.addEventListener('pointerlockchange', pointerlockchange, false);
      document.addEventListener('mozpointerlockchange', pointerlockchange, false);
      document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

      document.addEventListener('pointerlockerror', pointerlockerror, false);
      document.addEventListener('mozpointerlockerror', pointerlockerror, false);
      document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

      var requestPointerLock = function(event) {
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();
      };
      element.addEventListener('click', requestPointerLock, false);
    } else {
      element.innerHTML = 'Bad browser; No pointer lock';
    }
  }


  function initControls() {
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
  }

  function onKeyDown(e) {
    switch (e.keyCode) {
      case 38: // up
      case 87: // w
        moveForward = true;
        break;
      case 37: // left
      case 65: // a
        moveLeft = true;
        break;
      case 40: // down
      case 83: // s
        moveBackward = true;
        break;
      case 39: // right
      case 68: // d
        moveRight = true;
        break;
      case 32: // space
        if (canJump === true) velocity.y += 350;
        canJump = false;
        break;
      case 16:
        walkingSpeed = sneekSpeed;
        break;
    }
  }

  function onKeyUp(e) {
    switch(e.keyCode) {
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
      case 16:
        walkingSpeed = walkSpeed;
        break;
    }
  }

  function updateControls() {
    if (controlsEnabled) {
      var delta = clock.getDelta();

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
      velocity.y -= 9.8 * 100.0 * delta;

      if (moveForward) velocity.z -= walkingSpeed * delta;
      if (moveBackward) velocity.z += walkingSpeed * delta;
      if (moveLeft) velocity.x -= walkingSpeed * delta;
      if (moveRight) velocity.x += walkingSpeed * delta;

      controls.getObject().translateX(velocity.x * delta);
      controls.getObject().translateY(velocity.y * delta);
      controls.getObject().translateZ(velocity.z * delta);

      if (controls.getObject().position.y < 10) {
        velocity.y = 0;
        controls.getObject().position.y = 10;
        canJump = true;
      }
    }
  }

  return {
    init: init,
    render: render
  };
})();
