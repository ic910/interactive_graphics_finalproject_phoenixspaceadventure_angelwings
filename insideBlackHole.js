'use strict'


var fly=false;


var new_eggChest=true;

var renderBlackHole;

var new_color;

var blackHoleScene=new THREE.Scene();
blackHoleScene.name="game_scene";

var eggChest;

var ballEggs=0;

var blackHole_t=0;

var blackHole_putIN=false;

var egg_box_original=new THREE.Object3D();
var egg_box;
var egg_bounding_box;

var sapphire;
var diamond;
var ruby;

var crystals=[];
var sceneCrystals=[];
var sceneCrystals_boxes=[];
var sceneCrystals_play_audio=[];
var sceneCrystals_fire_collision=[];

var blackHole_explosions=[];
var blackHole_explosions_time=[];
var blackHole_movementSpeed=0.5;
var blackHole_particles_dirs=[];

var blackHole_particleSystem, blackHole_uniforms, blackHole_geometry;
var blackHole_particles = 500000;

var light;

function main() {

    blackHoleScene.background=new THREE.Color('black');

  {
    const skyColor = 0x87CEEB; 
    const groundColor = 0xB97A20;  
    const intensity = 1;
    light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    blackHoleScene.add(light);
  }


  renderBlackHole=renderBlackHole_;


  {
    new THREE.GLTFLoader()
            .load('models/low_poly_crystals/scene.gltf', function(gltf) {
                var model=gltf.scene;
                model.traverse(function(child){
                    if (child.isMesh) {
                      child.castShadow=true;
                      child.receiveShadow=true;
                    }
                  });
                var point_light_ruby=new THREE.PointLight( 0xffffff, 1, 250, 0.5 );
                var point_light_diamond=new THREE.PointLight( 0xffffff, 1, 250, 0.5 );
                var point_light_sapphire=new THREE.PointLight( 0xffffff, 1, 250, 0.5 );
                ruby=model.getObjectByName("Ruby");
                diamond=model.getObjectByName("Diamond");
                sapphire=model.getObjectByName("Sapphire");
                ruby.scale.multiplyScalar(0.15);
                ruby.position.x=15;
                ruby.rotation.x=-Math.PI/2-0.4;
                point_light_ruby.add(ruby);
                diamond.scale.multiplyScalar(0.15);
                diamond.position.x=15;
                diamond.rotation.x=-Math.PI/2;
                point_light_diamond.add(diamond);
                sapphire.scale.multiplyScalar(0.15);
                sapphire.position.x=15;
                sapphire.rotation.x=-Math.PI/2+0.5;
                point_light_sapphire.add(sapphire);
                crystals.push(ruby);
                crystals.push(diamond);
                crystals.push(sapphire);
            }, undefined, undefined);
  }

  var lightHelper;
  var shadowCameraHelper;
  var plane;

  {
    function set_spotLight() {
      var spot=new THREE.Object3D();
      var spotLight = new THREE.SpotLight( 0xffffff, 1 );
      spotLight.position.copy(egg_box_original.position);
      spotLight.position.y-=19;
      spotLight.position.z+=50;
      spotLight.target=eggChest;
      spotLight.angle = Math.PI / 4;
      spotLight.penumbra = 0.05;
      spotLight.decay = 2;
      spotLight.distance = 200;
      spotLight.castShadow = true;
      spotLight.shadow.mapSize.width = 512;
      spotLight.shadow.mapSize.height = 512;
      var spotLight_camera=new THREE.Object3D();
      spotLight.shadow.camera.near = 10;
      spotLight.shadow.camera.far = 200;
      spotLight.shadow.camera.target=eggChest;
      spotLight_camera.add(spotLight.shadow.camera);
      spot.add( spotLight );
      lightHelper = new THREE.SpotLightHelper( spotLight );
      spot.add( lightHelper );
      shadowCameraHelper = new THREE.CameraHelper( spotLight.shadow.camera );
      spotLight_camera.add(shadowCameraHelper);
      spot.add(spotLight_camera);
      spotLight_camera.rotation.x=Math.PI/2;
      spotLight_camera.position.y-=10;
      spotLight_camera.position.z-=9;
      spot.position.x-=10;
      spot.position.y-=10;
      spot.position.z-=10;
      spotLight.position.x-=10;
      spotLight.position.y-=10;
      spotLight.position.z-=10;
      egg_box_original.add(spotLight);
    }    

    new THREE.GLTFLoader()
            .load('models/dragon_chest/scene.gltf', function(gltf) {
                var model=gltf.scene;
                model.traverse(function(child){
                    if (child.isMesh) {
                      child.castShadow=true;
                      child.receiveShadow=false;
                    }
                  });
                model.position.x=10;
                model.scale.multiplyScalar(0.05);
                model.position.y=-2;
                model.rotation.z=Math.PI/2;
                model.rotation.x=Math.PI/2;
                model.name='eggChest'
                var point_light=new THREE.PointLight( 0xffffff, 1, 250, 0.5 );
                point_light.add(model)
                eggChest=point_light;
                var planeGeometry=new THREE.PlaneGeometry(2000,2000,32,32);
                var planeMaterial=new THREE.MeshBasicMaterial({color:0x000000,dithering:true});
                plane=new THREE.Mesh(planeGeometry,planeMaterial);
                plane.position.copy(eggChest.position);
                plane.rotation.y=-Math.PI/2;
                plane.rotation.z+=2;
                plane.receiveShadow=true;
                egg_box_original.add(plane);
                egg_box_original.rotation.z=-Math.PI/2;
                egg_box_original.position.y=9;
                egg_box_original.position.x=40;
                egg_init_pos=egg_box_original.position.x;
                set_spotLight();
                egg_box_original.add(eggChest);
              }, undefined, undefined);

        }

        
             

        blackHole_uniforms = {
          pointTexture: { value: new THREE.TextureLoader().load( "models/textures/spark1.png" ) }
        };
        var shaderMaterial = new THREE.ShaderMaterial( {
          uniforms: blackHole_uniforms,
          vertexShader: document.getElementById( 'vertexshader-particles' ).textContent,
          fragmentShader: document.getElementById( 'fragmentshader-particles' ).textContent,
          blending: THREE.AdditiveBlending,
          depthTest: false,
          transparent: true,
          vertexColors: true
        } );
        blackHole_geometry = new THREE.SphereBufferGeometry(200,32);
        var positions = [];
        var colors = [];
        var sizes = [];
        var color = new THREE.Color(0x451c14);
        for ( var i = 0; i < blackHole_particles; i ++ ) {
          positions.push(0);
          positions.push(0);
          positions.push(0);
          colors.push( color.r, color.g, color.b );
          sizes.push( 4 );
          blackHole_particles_dirs.push({x:(Math.random()*2-1)*blackHole_movementSpeed,y:(Math.random()*2-1)*blackHole_movementSpeed,z:(Math.random()*2-1)*blackHole_movementSpeed});
        }
        blackHole_geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).setDynamic(true) );
        blackHole_geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ).setDynamic(true) );
        blackHole_geometry.addAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setDynamic( true ) );
        blackHole_particleSystem = new THREE.Points( blackHole_geometry, shaderMaterial );
        blackHole_particleSystem.name='particles';



  var setSpotLight=true;


  function renderBlackHole_() {


    if (!pause) {  
      if (new_eggChest) {
        egg_box=egg_box_original.clone();
        egg_bounding_box=new THREE.BoundingBoxHelper(egg_box.getObjectByName('eggChest'));
        egg_bounding_box.geometry.computeBoundingBox();
        egg_bounding_box.update()
        egg_bounding_box.visible=false;
        new_eggChest=false;
      }
      
        if (lightYears<difficulty["eggChest_entrance"]) {
          if (blackHole_t%difficulty["ball_obstacles_entrance"]==0) {
            var index=Math.round(Math.random()*(crystals.length-1));
            var crystal=crystals[index].clone();
            var box=new THREE.BoundingBoxHelper(crystal,0x000000);
            crystal.position.z=Math.random()*2-1;
            crystal.position.y=0.3;
            blackHoleScene.add(crystal);
            sceneCrystals.push(crystal);
            box.geometry.computeBoundingBox();
            box.update();
            box.visible=false;
            sceneCrystals_boxes.push(box);
            blackHoleScene.add(box);
            sceneCrystals_play_audio.push(false);
            sceneCrystals_fire_collision.push(0);
          }
        }
        else if (!blackHole_putIN && (sceneCrystals.length==0 || (sceneCrystals.length==1 && sceneCrystals[0].position.x<10))) {
          blackHoleScene.add(egg_box);
          blackHole_putIN=true;
        }

    
        for (var i=0; i<sceneCrystals.length; i++) {
        var has_spittingFire=fire_phoenix.getObjectByName("spittingFire")!=undefined;
        if (!has_spittingFire || (has_spittingFire && !spittingFire_bounding_box.geometry.boundingBox.intersectsBox(sceneCrystals_boxes[i].geometry.boundingBox))) {
          sceneCrystals_fire_collision[i]=0;
          sceneCrystals[i].position.x-=difficulty["distance"];
          sceneCrystals_boxes[i].update();
          sceneCrystals_boxes[i].geometry.computeBoundingBox();
        }
        else {
          sceneCrystals_fire_collision[i]+=1;
          var time_left=fire_collision_tmax-sceneCrystals_fire_collision[i];
          if (time_left<0) time_left=0;
          middle_text.nodeValue="The crystal will explode in "+(time_left).toString();
          middle_message.style.visibility="visible";
        }
        if (sceneCrystals[i].position.x<-20 || sceneCrystals_fire_collision[i]>fire_collision_tmax) {
          blackHoleScene.remove(sceneCrystals[i]);
          blackHoleScene.remove(sceneCrystals_boxes[i]);
          if (sceneCrystals_fire_collision[i]>fire_collision_tmax) {
            var new_particles=blackHole_particleSystem.clone();
            new_particles.position.copy(sceneCrystals[i].position);
            change_color(new_particles,sceneCrystals[i]);
            blackHole_explosions.push(new_particles);
            blackHoleScene.add(new_particles);
            blackHole_explosions_time.push(0);
            if (version=='full') {
              explosion_sound.currentTime=0;
              explosion_sound.play();
            }
            current_spitting_fire--;
            if (current_spitting_fire<0) current_spitting_fire=0;
            spitting_fire_limit2_text.nodeValue="left: "+current_spitting_fire.toString();
          }
          sceneCrystals.splice(i,1);
          sceneCrystals_boxes.splice(i,1);
          sceneCrystals_play_audio.splice(i,1);
          sceneCrystals_fire_collision.splice(i,1);
        }
      }

      if (blackHole_putIN && lightYears>=difficulty["eggChest_entrance"]) {
        egg_box.position.x-=difficulty["distance"];
      }

      var blackHole_explosions_time_tmax=15;
      for (var i=0; i<blackHole_explosions.length; i++) {
        if (blackHole_explosions_time[i]>blackHole_explosions_time_tmax) {
          blackHoleScene.remove(blackHole_explosions[i]);
          blackHole_explosions.splice(i,1);
          blackHole_explosions_time.splice(i,1);
          var positions_=blackHole_particleSystem.geometry.attributes.position.array;
          for (var j=0; j<blackHole_particles; j++) {
            positions_[j]=0;
          }
        }
      }

      for (var i=0; i<blackHole_explosions.length; i++) {
        var expl_positions=blackHole_explosions[i].geometry.attributes.position.array;
        for (var j=0; j<blackHole_particles; j++) {
          if (j%3==0) {
            expl_positions[j]-=blackHole_particles_dirs[j].x;
            expl_positions[j+1]-=blackHole_particles_dirs[j].y;
            expl_positions[j+2]-=blackHole_particles_dirs[j].z;
          }
        }
        blackHole_explosions_time[i]++;
      }

      blackHole_particleSystem.geometry.attributes.position.needsUpdate = true;

      lightYears+=difficulty["distance"];

      updatePhoenixBoundingBoxes();

        egg_bounding_box.update();
        egg_bounding_box.geometry.computeBoundingBox();

        if (phoenix_bounding_box.geometry.boundingBox.intersectsBox(egg_bounding_box.geometry.boundingBox)) {
          ballEggs=3;
          blackHoleScene.remove(egg_box);
          blackHoleScene.remove(egg_bounding_box);
          blackHoleBloom=false;
        }




            var collide=collision();
            gotHit(collide);

      blackHole_t++;
    }


        phoenix_flight_animation_f(0);


        var time_to_eggs=Math.round(difficulty.eggChest_entrance+egg_init_pos-egg_init_pos*difficulty.distance-lightYears);
        if (time_to_eggs<0) time_to_eggs=0;
        time_text.nodeValue="left: "+time_to_eggs.toString();

        closeCrystal();

  }

  function change_color(given_particleSystem,given_object) {
    if (given_object.name=='Ruby') new_color=new THREE.Color('red')
    else if (given_object.name=='Sapphire') new_color=new THREE.Color('blue')
    else if (given_object.name='Diamond') new_color=new THREE.Color('green')
    else new_color=new THREE.Color('brown');
    var color_array=given_particleSystem.geometry.attributes.color.array;
    for (var i=0; i<ball_particles; i++) {
      if (Math.round(i%3)==0) {
        color_array[i]=new_color.r;
        color_array[i+1]=new_color.g;
        color_array[i+2]=new_color.b;
      }
    }
    given_particleSystem.geometry.attributes.color.needsUpdate = true;
  }
  

  function collision() {
    for (var i=0; i<sceneCrystals_boxes.length; i++) {
      if (phoenix_bounding_box.geometry.boundingBox.intersectsBox(sceneCrystals_boxes[i].geometry.boundingBox)) {
        return sceneCrystals[i];
      }
    }
    return false;
  }

  function closeCrystal() {
    for (var i=0; i<sceneCrystals.length; i++) {
      if (sceneCrystals[i].position.x<phoenix_box.position.x+3) {
        if (!sceneCrystals_play_audio[i]) {
          if (version=='full') whoosh.play();
          sceneCrystals_play_audio[i]=true;
        }
      }
    }
  }


}

main();

function loaded_ruby() {
  return ruby!=undefined;
}

function loaded_diamond() {
  return diamond!=undefined;
}

function loaded_sapphire() {
  return sapphire!=undefined;
}

function loaded_eggChest() {
  return eggChest!=undefined;
}

