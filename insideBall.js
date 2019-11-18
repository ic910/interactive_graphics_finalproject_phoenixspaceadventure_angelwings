'use strict'


var fly=false;

var change_pos=true;

var renderBall;

var ballLives;

var ballScene=new THREE.Scene();
ballScene.name="game_scene";

var explosion_sound=new Audio('models/sound_effects/235968__tommccann__explosion-01.wav')
explosion_sound.volume=0.35;

var last_collision;

var set_blackHoleScene;

var black_circle;
var black_circle_original;

var meteorite_4;
var meteorite_1;
var meteorite_2;
var meteorite_3;

var meteorites=[];

var sceneMeteorites=[];
var sceneMeteorites_boxes=[];
var sceneMeteorites_play_audio=[];
var sceneMeteorites_fire_collision=[];

var lightYears=0;

var entered_black_circle=false;

var ball_t=0;

var ball_putIN=false;

var difficulty;

var time_container;
var time_text;
var left_container=document.getElementById('left');

var started_audio=false;

var tc=0;

var explosions=[];
var explosions_time=[];
var movementSpeed=0.5;
var ball_particles_dirs=[];

var whoosh=new Audio('models/sound_effects/394424__inspectorj__bamboo-swing-c9.wav');

var hit=new Audio('models/sound_effects/270332__littlerobotsoundfactory__hit-03.wav');

var egg_init_pos;

var fire_collision_tmax=40;

var ball_particleSystem, ball_uniforms, ball_geometry;
var ball_particles = 500000;

var difficultyMap={
  "easy":{
    "black_circle_entrance":100,
    "ball_obstacles_entrance":400,
    "distance": 0.05,
    "eggChest_entrance":250,
  },
  "medium":{
    "black_circle_entrance":200,
    "ball_obstacles_entrance":200,
    "distance": 0.1,
    "eggChest_entrance":400,
  },
  "hard":{
    "black_circle_entrance":300,
    "ball_obstacles_entrance":50,
    "distance": 0.2,
    "eggChest_entrance":600,
  }
}

function main() {

    ballScene.background=new THREE.TextureLoader().load('models/skyboxes/jupiter.jpg');

  {
    const skyColor = 0x87CEEB;  
    const groundColor = 0xB97A20; 
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    ballScene.add(light);
  }

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 0, 2);
    ballScene.add(light);
    ballScene.add(light.target);
  }

  renderBall=renderBall_;

  {
    var circle_geometry=new THREE.CircleBufferGeometry(10,32);
    var material=new THREE.MeshBasicMaterial({color:0x000000,side:THREE.DoubleSide});
    black_circle_original=new THREE.Mesh(circle_geometry,material);
    black_circle_original.position.x=500;
    black_circle_original.rotation.y=-Math.PI/2;
    black_circle_original.castShadow=true;
  }

  {
    new THREE.GLTFLoader()
            .load('models/meteorite/scene.gltf', function(gltf) {
                var model=gltf.scene;
                model.traverse(function(child){
                    if (child.isMesh) {
                      child.castShadow=true;
                      child.receiveShadow=true;
                    }
                  });
                var point_light=new THREE.PointLight( 0xffffff, 1, 250, 0.5 );
                model.scale.multiplyScalar(0.01);
                model.position.x=20;
                point_light.add(model);
                model.name="meteorite_4";
                meteorites.push(model);
                meteorite_4=model;
            }, undefined, undefined);
  }


  {
    new THREE.GLTFLoader()
            .load('models/asteroid_01/scene.gltf', function(gltf) {
                var model=gltf.scene;
                model.traverse(function(child){
                    if (child.isMesh) {
                      child.castShadow=true;
                      child.receiveShadow=true;
                    }
                  });
                model.scale.multiplyScalar(0.0005);
                model.position.x=20;
                model.name="meteorite_1";
                meteorites.push(model);
                meteorite_1=model;
            }, undefined, undefined);
  }


  {
    new THREE.GLTFLoader()
            .load('models/meteorite_2/scene.gltf', function(gltf) {
                var model=gltf.scene;
                model.traverse(function(child){
                    if (child.isMesh) {
                      child.castShadow=true;
                      child.receiveShadow=true;
                    }
                  });
                model.scale.multiplyScalar(0.001);
                model.position.x=20;
                var point_light=new THREE.PointLight( 0xffffff, 1, 250, 0.1 );
                point_light.add(model);
                model.name="meteorite_2";
                meteorites.push(model);
                meteorite_2=model;
            }, undefined, undefined);
  }


  {
    new THREE.GLTFLoader()
            .load('models/meteorite_3/scene.gltf', function(gltf) {
                var model=gltf.scene;
                model.traverse(function(child){
                    if (child.isMesh) {
                      child.castShadow=true;
                      child.receiveShadow=true;
                    }
                  });
                model.scale.multiplyScalar(0.1);
                model.position.x=20;
                var point_light=new THREE.PointLight( 0xffffff, 1, 250, 1 );
                point_light.add(model);
                model.name="meteorite_3";
                meteorite_3=model;
                meteorites.push(model);
            }, undefined, undefined);
  }



  ball_uniforms = {
    pointTexture: { value: new THREE.TextureLoader().load( "models/textures/circle.png" ) }
  };
  var shaderMaterial = new THREE.ShaderMaterial( {
    uniforms: ball_uniforms,
    vertexShader: document.getElementById( 'vertexshader-particles' ).textContent,
    fragmentShader: document.getElementById( 'fragmentshader-particles' ).textContent,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true
  } );
  ball_geometry = new THREE.SphereBufferGeometry(200,32);
  var positions = [];
  var colors = [];
  var sizes = [];
  var color = new THREE.Color(0x451c14);
  for ( var i = 0; i < ball_particles; i ++ ) {
    positions.push(0);
    positions.push(0);
    positions.push(0);
    colors.push( color.r, color.g, color.b );
    sizes.push( 4 );
    ball_particles_dirs.push({x:(Math.random()*2-1)*movementSpeed,y:(Math.random()*2-1)*movementSpeed,z:(Math.random()*2-1)*movementSpeed});
  }
  ball_geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).setDynamic(true) );
  ball_geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ).setDynamic(true) );
  ball_geometry.addAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setDynamic( true ) );
  ball_particleSystem = new THREE.Points( ball_geometry, shaderMaterial );
  ball_particleSystem.name='particles';


  function renderBall_() {
  
      if (!pause) {  
        if (change_pos) {
          back_to_starting_rot_pos();
          change_pos=false;
        }
    
        if (lightYears<difficulty["black_circle_entrance"]) {
          if (ball_t%difficulty["ball_obstacles_entrance"]==0) {
            var index=Math.round(Math.random()*(meteorites.length-1));
            var meteorite=meteorites[index].clone();
            var box=new THREE.BoundingBoxHelper(meteorite,0x000000);
            meteorite.position.z=Math.random()*2-1;
            meteorite.position.y=0.3;
            ballScene.add(meteorite);
            sceneMeteorites.push(meteorite);
            box.geometry.computeBoundingBox();
            box.update();
            box.visible=false;
            sceneMeteorites_boxes.push(box);
            ballScene.add(box);
            sceneMeteorites_play_audio.push(false);
            sceneMeteorites_fire_collision.push(0);
          }
        }
        else if (!ball_putIN && (sceneMeteorites.length==0 || (sceneMeteorites.length==1 && sceneMeteorites[0].position.x<10))) {
          black_circle=black_circle_original.clone();
          ballScene.add(black_circle);
          ball_putIN=true;
        }
      
        for (var i=0; i<sceneMeteorites.length; i++) {
        var has_spittingFire=fire_phoenix.getObjectByName("spittingFire")!=undefined;
        if (!has_spittingFire || (has_spittingFire && !spittingFire_bounding_box.geometry.boundingBox.intersectsBox(sceneMeteorites_boxes[i].geometry.boundingBox))) {
          sceneMeteorites_fire_collision[i]=0;
          sceneMeteorites[i].position.x-=difficulty["distance"];
          sceneMeteorites_boxes[i].update();
          sceneMeteorites_boxes[i].geometry.computeBoundingBox();
        }
        else {
          sceneMeteorites_fire_collision[i]+=1;
          var time_left=fire_collision_tmax-sceneMeteorites_fire_collision[i];
          if (time_left<0) time_left=0;
          middle_text.nodeValue="The meteorite will explode in "+(time_left).toString();
          middle_message.style.visibility="visible";
        }
          if (sceneMeteorites[i].position.x<-20 || sceneMeteorites_fire_collision[i]>fire_collision_tmax) {
          ballScene.remove(sceneMeteorites[i]);
          ballScene.remove(sceneMeteorites_boxes[i]);
          if (sceneMeteorites_fire_collision[i]>fire_collision_tmax) {
            var new_particles=ball_particleSystem.clone();
            new_particles.position.copy(sceneMeteorites[i].position);
            explosions.push(new_particles);
            ballScene.add(new_particles);
            explosions_time.push(0);
            if (version=='full') {
              explosion_sound.currentTime=0;
              explosion_sound.play();
            }
            current_spitting_fire--;
            if (current_spitting_fire<0) current_spitting_fire=0;
            spitting_fire_limit2_text.nodeValue="left: "+current_spitting_fire.toString();
          }
          sceneMeteorites.splice(i,1);
          sceneMeteorites_boxes.splice(i,1);
          sceneMeteorites_play_audio.splice(i,1);
          sceneMeteorites_fire_collision.splice(i,1);
        }
      }

      var explosions_time_tmax=15;
      for (var i=0; i<explosions.length; i++) {
        if (explosions_time[i]>explosions_time_tmax) {
          ballScene.remove(explosions[i]);
          explosions.splice(i,1);
          explosions_time.splice(i,1);
          var positions_=ball_particleSystem.geometry.attributes.position.array;
          for (var j=0; j<ball_particles; j++) {
            positions_[j]=0;
          }
        }
      }

      for (var i=0; i<explosions.length; i++) {
        var expl_positions=explosions[i].geometry.attributes.position.array;
        for (var j=0; j<ball_particles; j++) {
          if (j%3==0) {
            expl_positions[j]-=ball_particles_dirs[j].x;
            expl_positions[j+1]-=ball_particles_dirs[j].y;
            expl_positions[j+2]-=ball_particles_dirs[j].z;
          }
        }
        explosions_time[i]++;
      }

      ball_particleSystem.geometry.attributes.position.needsUpdate = true;


      lightYears+=difficulty["distance"];

      updatePhoenixBoundingBoxes();



        var collide=collision();
        gotHit(collide);

        ball_t++;
      

        

      if (ball_putIN && lightYears>=difficulty["black_circle_entrance"]) {
        black_circle.position.x-=difficulty["distance"]*10;
        if (black_circle.position.x<1) {
          entered_black_circle=true;
          set_blackHoleScene=true;
          ballScene.remove(black_circle);
          blackHoleBloom=true;
          time_container.style.color='whitesmoke';
          left_container.style.color='whitesmoke';
          spitting_fire_limit1_container.style.color='whitesmoke';
          spitting_fire_limit2_container.style.color='whitesmoke';
          middle_message.style.color='whitesmoke';
        }
      }
    }

    phoenix_flight_animation_f(0);

    var time_to_eggs=Math.round(difficulty.eggChest_entrance+egg_init_pos-egg_init_pos*difficulty.distance-lightYears);
    time_text.nodeValue="left: "+time_to_eggs.toString();

    closeMeteorite();
    
  }

  function collision() {
    for (var i=0; i<sceneMeteorites_boxes.length; i++) {
      if (phoenix_bounding_box.geometry.boundingBox.intersectsBox(sceneMeteorites_boxes[i].geometry.boundingBox)) {
        return sceneMeteorites[i];
      }
    }
    return false;
  }

  function closeMeteorite() {
    for (var i=0; i<sceneMeteorites.length; i++) {
      if (sceneMeteorites[i].position.x<phoenix_box.position.x+3) {
        if (!sceneMeteorites_play_audio[i]) {
          if (version=='full') whoosh.play();
          sceneMeteorites_play_audio[i]=true;
        }
      }
    }
  }

}

main();

function loaded_meteorite_4() {
  return meteorite_4!=undefined;
}

function loaded_meteorite_1() {
  return meteorite_1!=undefined;
}

function loaded_meteorite_2() {
  return meteorite_2!=undefined;
}

function loaded_meteorite_3() {
  return meteorite_3!=undefined;
}

function gotHit(collide) {
  if (collide!=false && (last_collision==undefined || collide!=last_collision)) {
    last_collision=collide;
    ballLives--;
    if (version=='full') hit.play();
  }
  if (collide || tc>0) {
    set_game_over=false;
    if (tc%5==0 && ballLives>0) {
      fire_phoenix.visible=!fire_phoenix.visible;
    }
    tc++;
    if (ballLives<1) {
      fire_phoenix.visible=true;
    }
    if (tc>100) {
      tc=0;
      fire_phoenix.visible=true;
      set_game_over=true;
    }
  }
}

