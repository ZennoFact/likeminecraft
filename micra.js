var micra = (function () {
  var scene;
  var renderer;
  var camera, directionalLigh, ambientLight;

  var init = function () {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x000000, 1);
    document.body.appendChild( renderer.domElement );
    renderer.shadowMap.enabled = true;

    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1, 300 );
    camera.position.set(0, 0, 50);

    ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add( ambientLight );

    directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( 0, 1, 7 );
    scene.add( directionalLight );

    window.addEventListener('resize', onWindowResize());
  };

  var render = function () {
    renderer.render(scene, camera);

    requestAnimationFrame( render );
  };

  var onWindowResize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
  	camera.updateProjectionMatrix();
  	renderer.setSize( window.innerWidth, window.innerHeight );
  };

  return {
    init: init,
    render: render
  };
})();
