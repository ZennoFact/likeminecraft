var micra = (function () {
  var scene;
  var renderer;
  var camera, directionalLigh, ambientLight;
  var controls;

  var init = function () {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x000000, 1);
    document.body.appendChild( renderer.domElement );
    renderer.shadowMap.enabled = true;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1, 150 );
    camera.position.set(0, 0, 50);

    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add( ambientLight );

    directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( 0, 1, 7 );
    scene.add( directionalLight );

    // カメラでの操作をいったん追加
    controls = new THREE.OrbitControls(camera);

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
        cube = new THREE.Mesh(cubeGeometry, materials[i + j % 2])
        var x = j * side - 100;
        var z = i * side - 100;
        cube.position.set(x, -side, z);
        scene.add(cube);
      }
    }


    window.addEventListener('resize', onWindowResize, false);
  };

  var render = function () {
    renderer.render(scene, camera);
    // カメラの操作を更新
    controls.update();
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
    console.log("Yes, on window resize!");
    camera.aspect = window.innerWidth / window.innerHeight;
  	camera.updateProjectionMatrix();
  	renderer.setSize( window.innerWidth, window.innerHeight );
  };

  return {
    init: init,
    render: render
  };
})();
