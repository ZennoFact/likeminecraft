var micra = (function () {
  var scene;
  var renderer;
  var camera;
  var hemiLight;
  // var directionalLigh, ambientLight;
  var control;
  var clock;
  var projector;

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

    control = new THREE.FirstPersonControls(camera);
    control.lookSpeed = 0.05;
    control.movementSpeed = 5;
    control.noFly = true;
    control.lookVertical = true;
    control.constrainVertical = true;
    control.verticalMin = 1.0;
    control.verticalMax = 2.0;
    control.lon = 0.1;

    clock = new THREE.Clock();

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
    window.addEventListener('click', onDocumentMouseDown);
  };

  var render = function () {
    renderer.render(scene, camera);
    control.update(clock.getDelta());
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
  }

  return {
    init: init,
    render: render
  };
})();
