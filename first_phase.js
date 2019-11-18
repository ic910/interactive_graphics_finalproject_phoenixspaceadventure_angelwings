'use strict'

var clock
var controls;

var galaxyBackground;

var isFullScreen=false;

var start_intersection=true;

var dir=[];

var ball_offset=[];

var renderFirstPart;

var balls=new THREE.Object3D();

var setLoad=true;

var set_balls=true;

var collisionRangeT=[];

var lastCollision=[];

const firstPhaseScene=new THREE.Scene();
firstPhaseScene.name="game_scene";

var spheres=[];
var spheres_boxes=[];
var dirs=[];


function main() {
    firstPhaseScene.background = new THREE.Color('black'); 
    galaxyBackground = new THREE.CubeTextureLoader().setPath('models/skyboxes/galaxy/').load([
      'GalaxyTex_PositiveX.png','GalaxyTex_NegativeX.png','GalaxyTex_PositiveY.png','GalaxyTex_NegativeY.png','GalaxyTex_PositiveZ.png','GalaxyTex_NegativeZ.png']);
    firstPhaseScene.background=galaxyBackground;
    clock = new THREE.Clock();

  {
    const skyColor = 0x87CEEB;  
    const groundColor = 0xB97A20;  
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    firstPhaseScene.add(light);
  }

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-5, 0, 0);
    light.castShadow=true;
    firstPhaseScene.add(light);
  }


  var shader = THREE.ShaderChunk.shadowmap_pars_fragment;
				shader = shader.replace(
					'#ifdef USE_SHADOWMAP',
					'#ifdef USE_SHADOWMAP' +
					document.getElementById( 'PCSS' ).textContent
				);
				shader = shader.replace(
					'#if defined( SHADOWMAP_TYPE_PCF )',
					document.getElementById( 'PCSSGetShadow' ).textContent +
					'#if defined( SHADOWMAP_TYPE_PCF )'
				);
				THREE.ShaderChunk.shadowmap_pars_fragment = shader;


  {
    var radius=100;
    var geometry = new THREE.SphereBufferGeometry( radius, 32, 16 );
    var material = new THREE.MeshPhongMaterial( { shininess: 100, color: 0xffffff, specular: 0x999999, envMap: firstPhaseScene.background } );
				for ( var i = 0; i < 500; i ++ ) {
					var mesh = new THREE.Mesh( geometry, material );
					mesh.position.x = Math.random() * 20000 - 10000;
					mesh.position.y = Math.random() * 20000 - 10000;
          mesh.position.z = Math.random() * 20000 - 10000;
          var scale=Math.random() * 3 + 1;
          mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;
          mesh.castShadow=true;
          mesh.receiveShadow=true;
					balls.add( mesh );
          spheres.push( mesh );
          var box=THREE.BoundingBoxHelper(mesh);
          box.geometry.computeBoundingBox();
          mesh.geometry.computeBoundingBox();
          spheres_boxes.push(box);
          dirs.push(1);
          collisionRangeT.push(0);
          lastCollision.push(-1);
          balls.add(box);
          box.visible=false;
        }
        
  }

  renderFirstPart=renderFirstPart_;

  clock.start();





  function intersectOtherSpheres(box) {
    for (var i=0; i<spheres_boxes.length; i++) {
      if (box!=spheres_boxes[i] && box.geometry.boundingBox.intersectsBox(spheres_boxes[i].geometry.boundingBox)) {
        return i;
      }
    }
    return -1;
  }


  function renderFirstPart_() {
  

    if (!pause) { 
      if (setLoad) {
        back_to_starting_rot_pos();
        var startx=10000;
        var starty=-500;
        phoenix_box.position.x+=-startx;
        phoenix_box.position.y+=starty;
        middle_text.nodeValue="Enter a ball";
        middle_message.style.visibility="visible";
        middle_visible=true;
        middle_message.style.color="black";
        time_container.style.color="black";
        left_container.style.color="black";
        spitting_fire_limit1_container.style.color="black";
        spitting_fire_limit2_container.style.color="black";
        if (set_balls) {
          var previous_balls=firstPhaseScene.getObjectByName("balls");
          if (previous_balls!=undefined) {
            firstPhaseScene.remove(previous_balls);
          }
          firstPhaseScene.add(balls);
          set_balls=false;
        }
        setLoad=false;
    }


    for (var i=0; i<spheres.length; i++) {
      if (ball_offset.length==spheres.length) {
        ball_offset[i]=0;
      }
      else {
        ball_offset.push(0);
      }
    }


        var timer = 0.0001 * Date.now();
        for ( var i = 0; i < spheres.length; i ++ ) {
            var other=intersectOtherSpheres(spheres_boxes[i]);
            if (other>=0) {
              if (lastCollision[i]!=other) {
                dirs[i]*=-1;
                ball_offset[i]=10;
              }
              lastCollision[i]=other;
            }
        }

        for ( var i = 0; i < spheres.length; i ++ ) {
              spheres[i].position.x += (20* Math.cos( timer + i ))*dirs[i]+ball_offset[i];
              spheres[i].position.y += (20* Math.sin( timer + i * 1.1 ))*dirs[i]+ball_offset[i];
              spheres_boxes[i].geometry.computeBoundingBox();
              spheres_boxes[i].update();
        }


      updatePhoenixBoundingBoxes();

      for (var i=0; i<spheres.length; i++) {
          if (start_intersection && phoenix_bounding_box.geometry.boundingBox.intersectsBox(spheres_boxes[i].geometry.boundingBox)) {
            enteringBall=i;
            velocity_container.style.visibility="hidden";
            middle_message.style.visibility="hidden";
            middle_visible=false;
          }

      }
    }


    phoenix_flight_animation_f(0);

  }

}

main();

