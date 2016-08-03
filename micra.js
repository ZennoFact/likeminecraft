var micra = (function () {
  var scene;
  var renderer;
  var camera;
  var hemiLight;
  // var directionalLigh, ambientLight;
  var controls, controlsEnabled;
  var moveForward,
      moveBackward,
      moveLeft,
      moveRight,
      canJump;
  var velocity;
  var clock;
  var projector;
  // var havePointerLock;

  var init = function () {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x000000, 1);
    document.body.appendChild( renderer.domElement );
    renderer.shadowMap.enabled = true;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 0.015, 100);

    projector = new THREE.Projector();

    // カメラの設定は，視野角，画面サイズ，カメラの見える範囲の最小値，最大値
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 150 );
    // camera = new THREE.OrthographicCamera( window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / 2, 0.1, 150 );
    // camera.up.set(0, 0, 1);
    // camera.lookAt(new THREE.Vector3(0, 0, 1));
    camera.position.set(0, 0, 0);
    scene.add(camera);

    // ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    // scene.add( ambientLight );
    //
    // directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    // directionalLight.position.set( 0, 1, 7 );
    // scene.add( directionalLight );

    hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.6);
    scene.add( hemiLight );

    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());

    clock = new THREE.Clock();
    velocity = new THREE.Vector3();

    // havePointerLock = checkForPointerLock();
    // initPointerLock();
    controlsEnabled = true;
    controls.enabled = true;
    initControls();

    // TODO: ここで読み込んだテクスチャーで各ブロックを処理
    textures = loadTexture();


    // キューブをいっぱい置いてみるテスト
    // うまくいけばいろいろと分離
    var side = 5;
    var cubeGeometry = new THREE.BoxGeometry(side, side, side);
    var materials = [];
    materials.push(new THREE.MeshLambertMaterial({color: 0x66ff66}));
    materials.push(new THREE.MeshLambertMaterial({color: 0x66ffaa}));
    for (var i = 0; i < 40; i++) {
      for (var j = 0; j < 40; j++) {
        cube = new THREE.Mesh(cubeGeometry, materials[i + j % 2]);
        var x = j * side - 100;
        var z = i * side - 100;
        cube.position.set(x, -side, z);
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
      // texture: loader.load('assets/images/');
    };
  };

  var onWindowResize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
  	camera.updateProjectionMatrix();
  	renderer.setSize( window.innerWidth, window.innerHeight );
  };

  var onDocumentMouseDown = function (event) {
    var vector = new THREE.Vector3( (event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    vector = vector.unproject(camera);

    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      intersects[0].object.material.transparent = true;
      scene.remove(intersects[0].object)
    }
  };

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
    }
  }

  function updateControls() {
    if (controlsEnabled) {
      var delta = clock.getDelta();
      var walkingSpeed = 200.0;

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
