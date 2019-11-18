'use strict'


var loadingObjects=[loaded_phoenix,loaded_meteorite_4,loaded_meteorite_1,loaded_meteorite_2,loaded_meteorite_3,
                      loaded_ruby,loaded_diamond,loaded_sapphire,loaded_eggChest];


var pagesRender;

var particleSystem, uniforms, geometry;
var particles = 100000;

var showed_commands=false;

var start_game=false;
var set_startPage=true;

var version;

var difficulty_statement=document.getElementById('difficulty');
var easy_button=document.getElementById('easy');
var medium_button=document.getElementById('medium');
var hard_button=document.getElementById('hard');
var start_button=document.getElementById('start');
var play_button=document.getElementById('play_button');
var init_statement=document.getElementById('init_statement');
var lite_button=document.getElementById('lite');
var full_button=document.getElementById('full');
var version_statement=document.getElementById('version_statement');
var versions_buttons=document.getElementById('versions_buttons');
var difficulties_buttons=document.getElementById('difficulties_buttons');

var pages_bloom;

var pagesScene=new THREE.Scene();
pagesScene.name="game_scene";

var set_text=true;

var iceballs;

var set_new_game=false;

var loadingPercentage=0;

var showed_max=false;

var game_over=false;

var set_fire=false;

var commands=false;
var set_commands=true;

var tutorial=false;
var set_tutorial=true;

var exit=false;
var set_exit=true;

var showed_presents=false;
var showed_better=false;

var angelwings=document.getElementById('angelwings');

var pages_movementSpeed=2;
var pages_pdirs=[];

var button_a;
var button_d;
var button_w;
var button_s;
var button_r;
var button_f;
var button_b;
var button_k;
var button_c;
var button_t;
var button_m;
var button_up;
var button_down;

var new_game=false;

var letsgo_page=true;
var set_letsgo_page=true;

var put_phoenix=true;

var buttons=new THREE.Object3D();
buttons.name="buttons";

var wsad_buttons=new THREE.Object3D();
var rf_buttons=new THREE.Object3D();
var updown_buttons=new THREE.Object3D();

var first_time_tutorial=true;

var new_game_button_container=document.getElementById("new_game_button");
var new_game_button=document.getElementById("new_game");
var thanks=document.getElementById("thanks");

var start_t=0;

var particles_colors=[0xfe59c2,0xbb00bb,0x1414ff,0x14ffff];

function main() {

    pagesScene.background=new THREE.Color('black');

    var canvas = document.getElementById('game_canvas');

    var screen_width=window.innerWidth;
    var screen_height=window.innerHeight;
    var fov = 45;
    var aspect = screen_width/screen_height;
    var near = 0.1;
    var far = 200;
    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.name="camera";
    pagesScene.add(camera);

    camera.aspect=canvas.clientWidth/canvas.clientHeight;

    {
        const skyColor = 0x87CEEB;  
        const groundColor = 0xB97A20;  
        const intensity = 1;
        const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        pagesScene.add(light);
      }
    
      {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(5, 10, 2);
        light.castShadow=true;
        pagesScene.add(light);
        pagesScene.add(light.target);
      }
    
      var fire;
      function setFire() {
        var plane = new THREE.PlaneBufferGeometry( 1, 1 );
        fire = new THREE.Fire( plane, {
                textureWidth: 512,
                textureHeight: 512,
                debug: false
              } );
              fire.position.z = - 2;
              setFireParam();
        fire.name="text_fire";
      fire.scale.multiplyScalar(2.5);
      var fire_text=pagesScene.getObjectByName("text_fire");
      if (fire_text==undefined) {
        pagesScene.add( fire );
      }

    }

    {
      var away=-60;
      var down=0;
      var geometry=new THREE.PlaneBufferGeometry(5,5,32);

      var material = new THREE.MeshBasicMaterial( {map:  new THREE.TextureLoader().load('models/keyboard_buttons/W1.png'), side: THREE.DoubleSide} );
      button_w=new THREE.Mesh(geometry.clone(),material);
      button_w.position.z=away;
      wsad_buttons.add(button_w);

      material = new THREE.MeshBasicMaterial( {map:  new THREE.TextureLoader().load('models/keyboard_buttons/S1.png'), side: THREE.DoubleSide} );
      button_s=new THREE.Mesh(geometry.clone(),material);
      button_s.position.z=away;
      button_s.position.y=-5;
      wsad_buttons.add(button_s);
      
      material = new THREE.MeshBasicMaterial( {map:  new THREE.TextureLoader().load('models/keyboard_buttons/A1.png'), side: THREE.DoubleSide} );
      button_a=new THREE.Mesh(geometry.clone(),material);
      button_a.position.z=away;
      button_a.position.x=-5;
      button_a.position.y=-5;
      wsad_buttons.add(button_a);

      material = new THREE.MeshBasicMaterial( {map:  new THREE.TextureLoader().load('models/keyboard_buttons/D1.png'), side: THREE.DoubleSide} );
      button_d=new THREE.Mesh(geometry.clone(),material);
      button_d.position.z=away;
      button_d.position.x=5;
      button_d.position.y=-5;
      wsad_buttons.add(button_d);

      wsad_buttons.position.x=-25.5;
      wsad_buttons.position.y=down;
      buttons.add(wsad_buttons);

      material = new THREE.MeshBasicMaterial( {map:  new THREE.TextureLoader().load('models/keyboard_buttons/R1.png'), side: THREE.DoubleSide} );
      button_r=new THREE.Mesh(geometry.clone(),material);
      button_r.position.z=away;
      rf_buttons.add(button_r);

      material = new THREE.MeshBasicMaterial( {map:  new THREE.TextureLoader().load('models/keyboard_buttons/F13.png'), side: THREE.DoubleSide} );
      button_f=new THREE.Mesh(geometry.clone(),material);
      button_f.position.z=away;
      button_f.position.y=-5;
      rf_buttons.add(button_f);

      rf_buttons.position.y=down;
      buttons.add(rf_buttons);

      material = new THREE.MeshBasicMaterial( {map:  new THREE.TextureLoader().load('models/keyboard_buttons/B1.png'), side: THREE.DoubleSide} );
      button_b=new THREE.Mesh(geometry.clone(),material);
      button_b.position.z=away;
      button_b.position.x=10;
      button_b.position.y=-13;
      buttons.add(button_b);

      material = new THREE.MeshBasicMaterial( {map:  new THREE.TextureLoader().load('models/keyboard_buttons/K1.png'), side: THREE.DoubleSide} );
      button_k=new THREE.Mesh(geometry.clone(),material);
      button_k.position.z=away;
      button_k.position.x=-10;
      button_k.position.y=-13;
      buttons.add(button_k);

      material = new THREE.MeshBasicMaterial( {map:  new THREE.TextureLoader().load('models/keyboard_buttons/Up-Arrow1.png'), side: THREE.DoubleSide} );
      button_up=new THREE.Mesh(geometry.clone(),material);
      button_up.position.z=away;
      updown_buttons.add(button_up);

      material = new THREE.MeshBasicMaterial( {map:  new THREE.TextureLoader().load('models/keyboard_buttons/Down-Arrow1.png'), side: THREE.DoubleSide} );
      button_down=new THREE.Mesh(geometry.clone(),material);
      button_down.position.z=away;
      button_down.position.y=-5;
      updown_buttons.add(button_down);

      updown_buttons.position.x=22;
      buttons.add(updown_buttons);

      material = new THREE.MeshBasicMaterial( {map:  new THREE.TextureLoader().load('models/keyboard_buttons/C1.png'), side: THREE.DoubleSide} );
      button_c=new THREE.Mesh(geometry.clone(),material);
      button_c.position.z=away-10;
      button_c.position.y=15;
      buttons.add(button_c);

      material = new THREE.MeshBasicMaterial( {map:  new THREE.TextureLoader().load('models/keyboard_buttons/T1.png'), side: THREE.DoubleSide} );
      button_t=new THREE.Mesh(geometry.clone(),material);
      button_t.position.z=away-10;
      button_t.position.y=15;

      material=new THREE.MeshBasicMaterial( {map:  new THREE.TextureLoader().load('models/keyboard_buttons/M1.png'), side: THREE.DoubleSide} );
      button_m=new THREE.Mesh(geometry.clone(),material);
      button_m.position.z=away-10;
      button_m.position.y=-25;
      buttons.add(button_m)

    }

    
    pagesRender=pagesRender_;

    function setFireParam() {
      fire.color1.set(0xffdcaa);
      fire.color2.set(0xffa000);
      fire.color3.set(0x000000);
      fire.windX = 0.0;
      fire.windY = 0.75;
      fire.colorBias = 0.8;
      fire.burnRate = 1.0;
      fire.diffuse = 0.8;
      fire.viscosity = 0.25;
      fire.expansion = 0.0;
      fire.swirl = 50.0;
      fire.drag = 0.35;
      fire.airSpeed = 10.0;
      fire.speed = 150.0;
      fire.massConservation = false;
    };


    function fireText(text) {
      var size = 200;
      var color = "#FF0040";
      canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 2048;
      var context = canvas.getContext( "2d" );
      context.font = size + "pt fire-text-font";
      context.strokeStyle = "black";
      context.strokeRect( 0, 0, canvas.width, canvas.height );
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.lineWidth = 5;
      context.strokeStyle = color;
      context.fillStyle = "black";
      var offset=0.56;
      if (game_over) offset=0.5;
      context.strokeText( text, canvas.width / 2, canvas.height * offset );
      var texture = new THREE.Texture( canvas );
      texture.needsUpdate = true;
      fire.setSourceMap( texture );
    };

    var t_show=0;



    uniforms = {
      pointTexture: { value: new THREE.TextureLoader().load( "models/textures/spark1.png" ) }
    };
    var shaderMaterial = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: document.getElementById( 'vertexshader-particles' ).textContent,
      fragmentShader: document.getElementById( 'fragmentshader-particles' ).textContent,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true
    } );
    geometry = new THREE.BufferGeometry();
    var positions = [];
    var colors = [];
    var sizes = [];
    for ( var i = 0; i < particles; i ++ ) {
      positions.push(0);
      positions.push(0);
      positions.push(0);
      var color_index=Math.round(Math.random()*(particles_colors.length-1));
      var color = new THREE.Color(particles_colors[color_index]);
      colors.push( color.r, color.g, color.b );
      sizes.push( 5 );
      pages_pdirs.push({x:(Math.random()*2-1)*pages_movementSpeed,y:(Math.random()*2-1)*pages_movementSpeed,z:(Math.random()*2-1)*pages_movementSpeed});
    }
    geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).setDynamic( true ) );
    geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    geometry.addAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setDynamic( true ) );
    particleSystem = new THREE.Points( geometry, shaderMaterial );
  

  function setIceBalls() {
    var plane = new THREE.PlaneBufferGeometry( 150, 150, 32);
    iceballs = new THREE.Fire( plane, {
      textureWidth: 512,
      textureHeight: 512,
      debug: false
    } );
    iceballs.position.z=-90;
    iceballs.position.y=20;
    iceballs.name="iceballs";
    iceballs.color1.set(0x00bdf7);
    iceballs.color2.set(0x1b3fb6);
    iceballs.color3.set(0x001869);
    iceballs.windX = 0.0;
    iceballs.windY = - 0.25;
    iceballs.colorBias = 0.25;
    iceballs.burnRate = 2.6;
    iceballs.diffuse = 5.0;
    iceballs.viscosity = 0.5;
    iceballs.expansion = 0.75;
    iceballs.swirl = 30.0;
    iceballs.drag = 0.0;
    iceballs.airSpeed = 20.0;
    iceballs.speed = 300.0;
    iceballs.massConservation = false;
    iceballs.clearSources();
    iceballs.addSource( 0.7, 0.15, 0.1, 0.5, 0.0, 1.0 );
    iceballs.addSource( 0.3, 0.15, 0.1, 0.5, 0.0, 1.0 );
  }


  new_game_button.onclick=function(event) {
    set_new_game=true;
  }

  function clickDifficulty() {
    play_button.style.visibility="visible";
    difficulty_statement.style.visibility="hidden";
    difficulties_buttons.style.visibility="hidden";
  }

  function clickVersion() {
    versions_buttons.style.visibility="hidden";
    version_statement.style.visibility="hidden";
    difficulty_statement.style.visibility="visible";
    difficulties_buttons.style.visibility="visible";
  }

  lite_button.onclick=function (event) {
    if (versions_buttons.style.visibility=="visible") {
      if (version!=undefined && version!="lite") {
        changeVersion();
      }
      version='lite';
      clickVersion();
    }
  }
  full_button.onclick=function (event) {
    if (versions_buttons.style.visibility=="visible") {
      if (version!='full') {
        changeVersion();
      }
      version='full';
      clickVersion();
    }
  }
  easy_button.onclick=function(event) {
    if (difficulties_buttons.style.visibility=="visible") {
      difficulty=difficultyMap.easy;
      clickDifficulty();
    }
  }
  medium_button.onclick=function(event) {
    if (difficulties_buttons.style.visibility=="visible") {
      difficulty=difficultyMap.medium;
      clickDifficulty();
    }
  }
  hard_button.onclick=function(event) {
    if (difficulties_buttons.style.visibility=="visible") {
      difficulty=difficultyMap.hard;
      clickDifficulty();
    }
  }

  start_button.onclick=function(event) {
    if (play_button.style.visibility=="visible") {
      start_game=true;
      play_button.style.visibility="hidden";
      init_statement.style.visibility="hidden";
      pagesScene.remove(particleSystem);
      if (first_time_tutorial) {
        tutorial=true;
        first_time_tutorial=false;
      }
      else if (showed_better && showed_presents && !letsgo_page) {
        set_game=true;
      }
    }
  }


  function pagesRender_() {

      if (set_fire) {
        setFire();
        set_fire=false;
      }

      if (loaded_objects() && letsgo_page) {
        if (set_letsgo_page) {
          fire_phoenix.position.z=-40;
          fire_phoenix.position.y=-4;
          fire_phoenix.position.x=-15;
          pagesScene.add(fire_phoenix);
          setSpittingFire();
          pages_bloom();
          document.getElementById('letsgo').style.visibility="visible";
          start_t=0;
          set_letsgo_page=false;
        }
        if (start_t>1) {
          pagesScene.remove(fire_phoenix);
          document.getElementById('letsgo').style.visibility="hidden";
          back_to_starting_rot_pos();
          letsgo_page=false;
          set_game=true;
          start_t=0;
        }
        else {
          start_t+=0.006;
          fire_phoenix.position.x+=0.4;
          phoenix_flight_animation_f(0.1);
        }
      }
      if (!showed_presents) {
        if (start_t>1) {
          angelwings.style.visibility="hidden";
          document.getElementById('better').style.visibility="hidden";
        if (showed_better) {
            showed_presents=true;
          }
          else {
            showed_better=true;
          }
          start_t=0;
        }
        else {
          if (showed_better) {
            angelwings.style.visibility="visible";
          }
          else {
            document.getElementById('better').style.visibility="visible";
          }
          start_t+=0.005;
        }
      }
      else if (!start_game) {
        if (set_startPage) {
          var fire_text=pagesScene.getObjectByName("text_fire");
          if (fire_text!=undefined) {
            pagesScene.remove(fire_text);
          }
          document.getElementById("reset_game").style.visibility="hidden";
          versions_buttons.style.visibility="visible";
          version_statement.style.visibility="visible";      
          init_statement.style.visibility="visible";
          pagesScene.add(particleSystem);
          set_startPage=false;
        }
        var part_positions=geometry.attributes.position.array;
        for ( var i = 0; i < particles; i ++ ) {
          if (i%3==0) {
            part_positions[i]-=pages_pdirs[i].x;
            part_positions[i+1]-=pages_pdirs[i].y;
            part_positions[i+2]-=pages_pdirs[i].z;
            var max_pos=-300;
            if (part_positions[i]<max_pos || part_positions[i+1]<max_pos || part_positions[i+2]<max_pos) {
              part_positions[i]=0;
              part_positions[i+1]=0;
              part_positions[i+2]=0;
            }  
          }
        }
        geometry.attributes.size.needsUpdate = true;
        geometry.attributes.position.needsUpdate = true;

      }
      else if (exit) {
        if (set_exit) {
          back_to_starting_rot_pos();
          fire_phoenix.visible=true;
          fire_phoenix.rotation.y=-Math.PI/2;
          fire_phoenix.position.y=-1.5;
          fire_phoenix.position.z=-30;
          thanks.style.visibility="visible";
          bow=true;
          restore_phoenix_t();
          new_game_button_container.style.visibility="visible";
          set_exit=false;
        }
        if (fly) {
          phoenix_flight_animation_f(0);
        } else if (put_phoenix) {
          pagesScene.add(fire_phoenix);
          restore_phoenix_t();
          put_phoenix=false;
        }
        else if (bow) {
          phoenix_bow_animation();
        }
        else if (new_game) {
          restore_phoenix_t();
          exit=false;
          start_game=false;
          set_startPage=true;
          back_to_starting_rot_pos();
          new_game=false;
        }
        else if (set_new_game) {
          setting_new_game();
        }
      }
      else if (commands) {
        if (set_commands) {
          var fire_text=pagesScene.getObjectByName("text_fire");
          if (fire_text!=undefined) {
            pagesScene.remove(fire_text);
          }
          setIceBalls();
          var has_iceballs=pagesScene.getObjectByName("iceballs");
          if (has_iceballs!=undefined) {
            pagesScene.remove(has_iceballs);
          }  
          pagesScene.add(iceballs);
          pagesScene.add(buttons);
          pagesScene.remove(button_t);
          document.getElementById("lives").style.visibility="hidden";
          document.getElementById("eggs").style.visibility="hidden";
          document.getElementById("middle_message").style.visibility="hidden";
          document.getElementById("tutorial_title").style.visibility="hidden";
          document.getElementById("tutorial_text").style.visibility="hidden";
          middle_visible=false;
          document.getElementById("mute").style.visibility="visible";
          document.getElementById("commands").style.visibility="visible";
          document.getElementById("hold").style.visibility="visible";
          document.getElementById("on_off").style.visibility="visible";
          document.getElementById("w").style.visibility="visible";
          document.getElementById("s").style.visibility="visible";
          document.getElementById("a").style.visibility="visible";
          document.getElementById("d").style.visibility="visible";
          document.getElementById("r").style.visibility="visible";
          document.getElementById("f").style.visibility="visible";
          document.getElementById("k").style.visibility="visible";
          document.getElementById("b").style.visibility="visible";
          document.getElementById("up").style.visibility="visible";
          document.getElementById("down").style.visibility="visible";
          document.getElementById("t").style.visibility="visible";
          document.getElementById("c").style.visibility="visible";
          document.getElementById("p").style.visibility="visible";
          document.getElementById("e").style.visibility="visible";
          showed_commands=true;
          set_commands=false;
        }
      }
      else if (tutorial) {
        if (set_tutorial) {
          var fire_text=pagesScene.getObjectByName("text_fire");
          if (fire_text!=undefined) {
            pagesScene.remove(fire_text);
          }
          setIceBalls();
          pagesScene.add(button_t);
          pagesScene.remove(buttons);
          var has_iceballs=pagesScene.getObjectByName("iceballs");
          if (has_iceballs!=undefined) {
            pagesScene.remove(has_iceballs);
          }  
          pagesScene.add(iceballs);
          document.getElementById("lives").style.visibility="hidden";
          document.getElementById("eggs").style.visibility="hidden";
          document.getElementById("middle_message").style.visibility="hidden";
          document.getElementById("commands").style.visibility="hidden";
          document.getElementById("mute").style.visibility="hidden";
          document.getElementById("tutorial_title").style.visibility="visible";
          document.getElementById("tutorial_text").style.visibility="visible";
          middle_visible=true;
          document.getElementById("on_off").style.visibility="visible";
          set_tutorial=false;
        }
      }
      else if (game_over) {
        fireText("GAME OVER");
      }
      else {
        var perc=Math.round(loadingPercentage*100);
        fireText("Loading... "+perc.toString()+"%");
        if (perc==100) {
          t_show+=0.1;
          if (t_show>1) {
            showed_max=true;
          }
        }
      }
      
      
      
  }


}

main();

function loaded_objects() {
  var how_many=0
    for (var i=0; i<loadingObjects.length; i++) {
        if (loadingObjects[i]()) {
          how_many++;
        }
    }
    loadingPercentage=how_many/loadingObjects.length;
    if (showed_max) return true;
    else return false;
}

function setting_new_game() {
  if (new_game_button_container.style.visibility=="visible" && !bow) { 
    pagesScene.remove(fire_phoenix);
    new_game_button_container.style.visibility="hidden";
    thanks.style.visibility="hidden";
    new_game=true;
    bow=true;
    restore_phoenix_t();
    if (version=='full') game_music.play();
    set_new_game=false;
  }  
}