'use strict'


var clock
var controls;

var set_game=false;

var lives=3;

var set_game_over=false;

var lastScene=pagesScene;

var transition=false;

var set_phoenixFire=true;

var lives_container;
var lives_text;
var eggs_container;
var eggs_text;
var enter_container;
var enter_text;
var velocity_container;
var velocity_text;
var middle_message;
var middle_text;
var spitting_fire_limit1_container;
var spitting_fire_limit2_container;
var spitting_fire_limit2_text;

var spitting_fire_limit=5;
var current_spitting_fire=spitting_fire_limit;

var init_bloom_f;

var game_music=new Audio('models/sound_effects/423805__tyops__game-theme-4.wav');
game_music.loop=true;

var eggs=0;

var game_over_sound=new Audio('models/sound_effects/173859__jivatma07__j1game-over-mono.wav')

var headUp=true;

var set_spittingFire=false;

var blackHoleBloom=false;

var tutorial_button=document.getElementById("tutorial_button");
var commands_button=document.getElementById("commands_button");
var exit_button=document.getElementById("exit_button");

var init_godRays=false;

var change_scene=true;

var isFullScreen=false;

var materialDepth;

var fly=false;

var set_enlight=false;

var darkMaterial = new THREE.MeshBasicMaterial( { color: "black" } );
var materials = {};
var finalComposer;
var bloomLayer;
var bloomComposer;
var BLOOM_SCENE=2;

var insideBall=false;
var enteringBall=-1;

var sunPosition = new THREE.Vector3( 0, 1000, - 1000 );
var screenSpacePosition = new THREE.Vector3();

var postprocessing = { enabled: false };
var orbitRadius = 200;
var bgColor = 0x000511;
var sunColor = 0xffee00;
var godrayRenderTargetResolutionMultiplier = 1.0 / 4.0;

var sound_effects=[fire_audio,screech,whoosh,hit,game_over_sound,explosion_sound];

var music_initial_volume=game_music.volume;
var soundEffects_initial_volumes=[];
for (var i=0; i<sound_effects.length; i++) {
  var vol=sound_effects[i].volume;
  soundEffects_initial_volumes.push(vol);
}

var middle_time=0;
var middle_time_limit=100;
var middle_visible=false;

var camera;

const scene=new THREE.Scene();

function main() {

    const canvas = document.getElementById('game_canvas');
    const renderer = new THREE.WebGLRenderer({canvas});

    scene.add(pagesScene);

    camera=pagesScene.getObjectByName("camera");

    materialDepth = new THREE.MeshDepthMaterial();

    var container=document.getElementById("container");
    renderer.setClearColor( 0xffffff );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    init_bloom_f=init_bloom;

    pages_bloom=function() {
      init_bloom(true);
      fire_phoenix.traverse(enableBloom);
    }

    function putInfo() {
    
      lives_container=document.getElementById("lives");
      lives_text=document.createTextNode("");
      lives_container.appendChild(lives_text);
      
      eggs_container=document.getElementById("eggs");
      eggs_text=document.createTextNode("");
      eggs_container.appendChild(eggs_text);

      enter_container=document.getElementById("reset_game");
      enter_text=document.createTextNode("Press ENTER to restart the game");
      enter_container.appendChild(enter_text);

      velocity_container=document.getElementById("velocity");
      velocity_text=document.createTextNode("velocity: "+velocity.toString());
      velocity_container.appendChild(velocity_text);

      time_container=document.getElementById("time");
      time_text=document.createTextNode("");
      time_container.appendChild(time_text);
      
      middle_message=document.getElementById("middle_message");
      middle_text=document.createTextNode("Enter a ball");
      middle_message.appendChild(middle_text);

      spitting_fire_limit1_container=document.getElementById("spitting_fire_limit1");
      spitting_fire_limit2_container=document.getElementById("spitting_fire_limit2");
      spitting_fire_limit2_text=document.createTextNode("limit: "+current_spitting_fire.toString());
      spitting_fire_limit2_container.appendChild(spitting_fire_limit2_text);
    }

    putInfo();

    
    init_bloom(false);
    initPostprocessing( window.innerWidth, window.innerHeight );

    function init_bloom(inBlackHole) {

      bloomLayer = new THREE.Layers();
      bloomLayer.set( BLOOM_SCENE );
      var renderScene = new THREE.RenderPass( scene.getObjectByName("game_scene"), camera );
      var bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 3, 0.5, 0.85 );
      if (inBlackHole) {
        bloomPass.threshold = 0;
        bloomPass.strength = 0.5;
        bloomPass.radius = 10;
      }
      if (version=='full')
        renderer.toneMappingExposure = 1.2;
      else
        renderer.toneMappingExposure = 1;
      bloomComposer = new THREE.EffectComposer( renderer );
      if (version=='full')
        bloomComposer.renderToScreen = false;
      else
        bloomComposer.renderToScreen = true;
      bloomComposer.addPass( renderScene );
      bloomComposer.addPass( bloomPass );
      var finalPass = new THREE.ShaderPass(
        new THREE.ShaderMaterial( {
          uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: bloomComposer.renderTarget2.texture }
          },
          vertexShader: document.getElementById( 'vertexshader' ).textContent,
          fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
          defines: {}
        } ), "baseTexture"
      );
      finalPass.needsSwap = true;
      finalComposer = new THREE.EffectComposer( renderer );
      finalComposer.addPass( renderScene );
      finalComposer.addPass( finalPass );
    }

    function renderBloom() {
        scene.traverse( darkenNonBloomed );
        bloomComposer.render();
        scene.traverse( restoreMaterial );
    }
    function darkenNonBloomed( obj ) {
      if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {
        materials[ obj.uuid ] = obj.material;
        obj.material = darkMaterial;
      }
    }
    function restoreMaterial( obj ) {
      if ( materials[ obj.uuid ] ) {
        obj.material = materials[ obj.uuid ];
        delete materials[ obj.uuid ];
      }
    }
    
    function keyup_spittingFire(onfire) {
      if (onfire==undefined && !tutorial && !commands) {
        fire_phoenix.remove(spittingFire);
        done_screech=false;
        fire_audio.pause();
        done_k_press=false;
      }
    }

    function getKeys() {
      var onfire=fire_phoenix.getObjectByName("phoenixFire");
      var has_phoenix=scene.getObjectByName("phoenix_box");
      document.onkeydown=function(event) {
        switch (event.keyCode) {
          case 65: //a
            if (!game_over && start_game && !pause && has_phoenix!=undefined && (!loaded_objects || !letsgo_page) && !exit) turn_and_go_f('left',insideBall);
            break;
          case 68: //d
            if (!game_over && start_game && !pause && has_phoenix!=undefined && (!loaded_objects || !letsgo_page) && !exit) turn_and_go_f('right',insideBall);
            break;
          case 82: //r
            if (!game_over && start_game && !pause && has_phoenix!=undefined && (!loaded_objects || !letsgo_page) && !exit) turn_and_go_f('up',insideBall);
            break;
          case 70: //f
            if (!game_over && start_game && !pause && has_phoenix!=undefined && (!loaded_objects || !letsgo_page) && !exit) turn_and_go_f('down',insideBall);
            break;
          case 87: //w
            if (!game_over && start_game && !pause && has_phoenix!=undefined && (!loaded_objects || !letsgo_page) && !exit) {
              start_intersection=true;
              turn_and_go_f('forward',insideBall);
            }
            break;
          case 83: //s
            if (!game_over && start_game && !pause && has_phoenix!=undefined && (!loaded_objects || !letsgo_page) && !exit) turn_and_go_f('backwards',insideBall);
            break;
          case 38: //up arrow
            if (velocity_container.style.visibility=="visible" && !commands && !tutorial && !game_over && start_game && !pause && has_phoenix!=undefined && (!loaded_objects || !letsgo_page) && !exit) {
              velocity+=0.2;
              velocity_text.nodeValue="velocity: "+(Math.round(velocity*100)/100).toString();
            }
            break;
          case 40: //down arrow
            if (velocity_container.style.visibility=="visible" && !commands && !tutorial && !game_over && start_game && !pause && has_phoenix!=undefined && (!loaded_objects || !letsgo_page) && !exit) {
              velocity-=0.2;
              if (velocity<1) {
                velocity=1;
              }
              velocity_text.nodeValue="velocity: "+(Math.round(velocity*100)/100).toString();
            }
            break;
          case 66: //b
            fullScreen();
            break;
          case 80: //p
            if (!game_over && start_game && (!loaded_objects || !letsgo_page) && !exit) pause_onclick();
            break;
          case 75: //k
            if (!pause && !game_over && start_game && lives>=1 && has_phoenix!=undefined && !exit && (!loaded_objects || !letsgo_page)) {
              if (current_spitting_fire>0 || scene.children[0]==firstPhaseScene) {  
                if (set_spittingFire) {
                  setSpittingFire();
                  set_spittingFire=false;
                }
                setSpittingFireParam();
                fire_phoenix.add(spittingFire);
                fire_phoenix.traverse(enableBloom);
                done_k_press=true;
                if (!done_screech && version=='full') {
                  screech.play();
                  done_screech=true;
                }
                if (version=='full')
                  fire_audio.play();
              }
              else {
                middle_text.nodeValue="Your fire has been extinguished!";
                middle_message.style.visibility="visible";
                middle_visible=true;
              }
            }
            break;
          case 13: //enter
            if (game_over && !exit) {
              start_game=false;
              set_startPage=true;
              fire_audio.pause();
              if (version=='full')
                game_music.play();
            }
            break;
          case 85: //u
            if (!exit && (scene.children[0]==firstPhaseScene || scene.children[0]==ballScene || scene.children[0]==blackHoleScene)) {
              exit_click();
            }
          case 67: //c
            if (start_game && loaded_objects() && (!loaded_objects || !letsgo_page) && !exit) {
              keyup_spittingFire(onfire)
              commands_click();
            }
            break;
          case 84: //t
            if (start_game && (!loaded_objects() || !letsgo_page) && !exit) {
              keyup_spittingFire(onfire)
              tutorial_click();
            }
            break;
          case 77: //m
            muteAll();
            break;
        }
      }
      document.onkeyup=function(event) {
        if (letsgo_page || exit) return;
        switch (event.keyCode) {
          case 75: // k
            if (start_game) keyup_spittingFire(onfire);
            break;
        }
      }
    }

    function enableBloom(obj) {
        obj.layers.enable(BLOOM_SCENE);
      }

    function cleanScene(objs,objs_boxes,objs_scene) {
      for (var i=0; i<objs.length; i++) {
        objs_scene.remove(objs[i]);
        objs_scene.remove(objs_boxes[i]);
      }
    }
  

    function initPostprocessing( renderTargetWidth, renderTargetHeight ) {
        postprocessing.t=0;
        postprocessing.scene = new THREE.Scene();
        postprocessing.camera = new THREE.OrthographicCamera( - 0.5, 0.5, 0.5, - 0.5, - 10000, 10000 );
        postprocessing.camera.position.z = 100;
        postprocessing.scene.add( postprocessing.camera );
        var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
        postprocessing.rtTextureColors = new THREE.WebGLRenderTarget( renderTargetWidth, renderTargetHeight, pars );
        postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget( renderTargetWidth, renderTargetHeight, pars );
        postprocessing.rtTextureDepthMask = new THREE.WebGLRenderTarget( renderTargetWidth, renderTargetHeight, pars );
        var adjustedWidth = renderTargetWidth * godrayRenderTargetResolutionMultiplier;
        var adjustedHeight = renderTargetHeight * godrayRenderTargetResolutionMultiplier;
        postprocessing.rtTextureGodRays1 = new THREE.WebGLRenderTarget( adjustedWidth, adjustedHeight, pars );
        postprocessing.rtTextureGodRays2 = new THREE.WebGLRenderTarget( adjustedWidth, adjustedHeight, pars );
        var godraysMaskShader = THREE.GodRaysDepthMaskShader;
        postprocessing.godrayMaskUniforms = THREE.UniformsUtils.clone( godraysMaskShader.uniforms );
        postprocessing.materialGodraysDepthMask = new THREE.ShaderMaterial( {
            uniforms: postprocessing.godrayMaskUniforms,
            vertexShader: godraysMaskShader.vertexShader,
            fragmentShader: godraysMaskShader.fragmentShader
        } );
        var godraysGenShader = THREE.GodRaysGenerateShader;
        postprocessing.godrayGenUniforms = THREE.UniformsUtils.clone( godraysGenShader.uniforms );
        postprocessing.materialGodraysGenerate = new THREE.ShaderMaterial( {
            uniforms: postprocessing.godrayGenUniforms,
            vertexShader: godraysGenShader.vertexShader,
            fragmentShader: godraysGenShader.fragmentShader
        } );
        var godraysCombineShader = THREE.GodRaysCombineShader;
        postprocessing.godrayCombineUniforms = THREE.UniformsUtils.clone( godraysCombineShader.uniforms );
        postprocessing.materialGodraysCombine = new THREE.ShaderMaterial( {
            uniforms: postprocessing.godrayCombineUniforms,
            vertexShader: godraysCombineShader.vertexShader,
            fragmentShader: godraysCombineShader.fragmentShader
        } );
        var godraysFakeSunShader = THREE.GodRaysFakeSunShader;
        postprocessing.godraysFakeSunUniforms = THREE.UniformsUtils.clone( godraysFakeSunShader.uniforms );
        postprocessing.materialGodraysFakeSun = new THREE.ShaderMaterial( {
            uniforms: postprocessing.godraysFakeSunUniforms,
            vertexShader: godraysFakeSunShader.vertexShader,
            fragmentShader: godraysFakeSunShader.fragmentShader
        } );
        postprocessing.godraysFakeSunUniforms.bgColor.value.setHex( bgColor );
        postprocessing.godraysFakeSunUniforms.sunColor.value.setHex( sunColor );
        postprocessing.godrayCombineUniforms.fGodRayIntensity.value = 0.75;
        postprocessing.quad = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 1.0, 1.0 ),
            postprocessing.materialGodraysGenerate
        );
        postprocessing.quad.position.z = - 9900;
        postprocessing.scene.add( postprocessing.quad );
        init_godRays=true;
    }

    function getStepSize( filterLen, tapsPerPass, pass ) {
        return filterLen * Math.pow( tapsPerPass, - pass );
    }
    function filterGodRays( inputTex, renderTarget, stepSize ) {
        postprocessing.scene.overrideMaterial = postprocessing.materialGodraysGenerate;
        postprocessing.godrayGenUniforms[ "fStepSize" ].value = stepSize;
        postprocessing.godrayGenUniforms[ "tInput" ].value = inputTex;
        renderer.setRenderTarget( renderTarget );
        renderer.render( postprocessing.scene, postprocessing.camera );
        postprocessing.scene.overrideMaterial = null;
    }

  


    function fullScreen() {
        var page=document.documentElement;
        if (!isFullScreen) {
          if (page.requestFullscreen) {
            page.requestFullscreen();
          } else if (page.mozRequestFullScreen) { 
            page.mozRequestFullScreen();
          } else if (page.webkitRequestFullscreen) {
            page.webkitRequestFullscreen();
          } else if (page.msRequestFullscreen) {
            page.msRequestFullscreen();
          }
          isFullScreen=true;
        }
        else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.mozCancelFullScreen) { 
            document.mozCancelFullScreen();
          } else if (document.webkitExitFullscreen) { 
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) { 
            document.msExitFullscreen();
          }
          isFullScreen=false;
        }
      }


  tutorial_button.onclick=function(event) {
    if (!set_game && tutorial_button.style.visibility=="visible") tutorial_click();
  }  

  commands_button.onclick=function(event) {
    if (loaded_objects() && !set_game && commands_button.style.visibility=="visible") commands_click();
  }


  function render() {



    var renderTargetWidth = window.innerWidth;
    var renderTargetHeight = window.innerHeight;
    camera.aspect = renderTargetWidth / renderTargetHeight;
    camera.updateProjectionMatrix(); 
    renderer.setSize( renderTargetWidth, renderTargetHeight );
      postprocessing.rtTextureColors.setSize( renderTargetWidth, renderTargetHeight );
      postprocessing.rtTextureDepth.setSize( renderTargetWidth, renderTargetHeight );
      postprocessing.rtTextureDepthMask.setSize( renderTargetWidth, renderTargetHeight );
      var adjustedWidth = renderTargetWidth * godrayRenderTargetResolutionMultiplier;
      var adjustedHeight = renderTargetHeight * godrayRenderTargetResolutionMultiplier;
      postprocessing.rtTextureGodRays1.setSize( adjustedWidth, adjustedHeight );
      postprocessing.rtTextureGodRays2.setSize( adjustedWidth, adjustedHeight );
    if (version=='full') {
      bloomComposer.setSize( renderTargetWidth, renderTargetHeight );
      finalComposer.setSize( renderTargetWidth, renderTargetHeight );
    }
    
  
      getKeys();

    if (middle_time>middle_time_limit && scene.children[0]!=firstPhaseScene) {
      middle_message.style.visibility="hidden";
      middle_visible=false;
      middle_time=0;
    }
    else if (middle_message.style.visibility=="visible") {
      middle_time++;
    }

    if (lives<1 && set_phoenixFire) {
      setPhoenixFire();
      phoenixFire.traverse(enableBloom);
      fire_phoenix.add(phoenixFire);
      if (version=='full') {
        fire_audio.play()
        explosion_sound.currentTime=0;
        explosion_sound.play()
      }
      set_phoenixFire=false;
    }


    if (lives<1 && set_game_over) {
      game_over=true;
      var fire_text=pagesScene.getObjectByName("text_fire");
      if (fire_text!=undefined) {
        pagesScene.remove(fire_text);
      }
      fire_phoenix.remove(phoenixFire);
      lives_container.style.visibility="hidden";
      eggs_container.style.visibility="hidden";
      middle_message.style.visibility="hidden";
      middle_visible=false;
      velocity_container.style.visibility="hidden";
      time_container.style.visibility="hidden";
      left_container.style.visibility="hidden";
      spitting_fire_limit1_container.style.visibility="hidden";
      spitting_fire_limit2_container.style.visibility="hidden";
      camera=pagesScene.getObjectByName("camera");
      var game_scene=scene.getObjectByName("game_scene");
      scene.remove(game_scene);
      scene.add(pagesScene);
      set_fire=true;
      enter_container.style.visibility="visible";
      tutorial_button.style.visibility="hidden";
      commands_button.style.visibility="hidden";
      pause_button.style.visibility="hidden";
      exit_button.style.visibility="hidden";
      game_music.pause();
      if (version=='full') game_over_sound.play();
      set_game_over=false;
    }

    if (set_blackHoleScene) {
      scene.remove(ballScene);
      scene.add(blackHoleScene);
      change_scene=true;
      set_blackHoleScene=false;
    }



    if (!loaded_objects() || (game_over && !set_game) || commands || tutorial || !start_game || exit || letsgo_page) {
      renderer.render(pagesScene,camera);
      requestAnimationFrame(pagesRender);
    }
    else {
      if (set_game) {
        var fire_text=pagesScene.getObjectByName("text_fire");
        if (fire_text!=undefined) {
          pagesScene.remove(fire_text);
        }
        lives=3;
        lives_text.nodeValue="Lives: "+lives.toString();
        eggs=0;
        eggs_text.nodeValue="Eggs: "+eggs.toString();
        scene.remove(pagesScene);
        setSpittingFire();
        setSpittingFireParam();
        set_spittingFire=true;
        scene.add(firstPhaseScene);
        if (phoenix_box.getObjectByName("fire_phoenix")==undefined) {
          phoenix_box.add(fire_phoenix);
          phoenix_model.position.set(0,0,0);
        }
        camera=phoenix_box.getObjectByName("camera");
        eggs=0;
        blackHoleBloom=false;
        change_scene=true;
        set_enlight=false;
        insideBall=false;
        game_over=false;
        enteringBall=-1;
        setLoad=true;
        set_balls=true;
        change_pos=true;
        cleanScene(sceneMeteorites,sceneMeteorites_boxes,ballScene);
        sceneMeteorites=[];
        sceneMeteorites_boxes=[];
        lightYears=0;
        entered_black_circle=false;
        ball_t=0;
        ball_putIN=false;
        new_eggChest=true;
        ballEggs=0;
        blackHole_t=0;
        blackHole_putIN=false;
        cleanScene(sceneCrystals,sceneCrystals_boxes,blackHoleScene);
        sceneCrystals=[];
        sceneCrystals_boxes=[];
        set_game_over=false;
        enter_container.style.visibility="hidden";
        set_phoenixFire=true;
        tutorial_button.style.visibility="visible";
        commands_button.style.visibility="visible";
        pause_button.style.visibility="visible";
        exit_button.style.visibility="visible";
        velocity=1;
        if (version=='full') game_music.play();
        current_spitting_fire=spitting_fire_limit;
        set_game=false;
      }
        if (change_scene) {
          start_intersection=false;
          scene.getObjectByName("game_scene").add(phoenix_box);
            lives_container.style.visibility="visible"
            eggs_container.style.visibility="visible"
          if (scene.children[0]==firstPhaseScene) {
            velocity_container.style.visibility="visible"
            middle_message.style.visibility="visible";
          }
          init_bloom(blackHoleBloom);
          change_scene=false;
          set_enlight=true;
          if (!showed_commands) {
            commands_click();
          }
  
        }

        if (set_enlight) {
          livesObj.traverse(enableBloom);
          eggsObj.traverse(enableBloom);
          if (version=='full') {
            phoenix_box.children[1].traverse(enableBloom);
            meteorite_4.traverse(enableBloom);
            meteorite_1.traverse(enableBloom);
            meteorite_2.traverse(enableBloom);
            meteorite_3.traverse(enableBloom);
            ruby.traverse(enableBloom);
            diamond.traverse(enableBloom);
            sapphire.traverse(enableBloom);
          }
          set_enlight=false;
        }
        else {
          renderBloom();
          finalComposer.render();
        }    
      if (!game_over) {
        if (insideBall && ballEggs==0) {
          if (entered_black_circle) {
            requestAnimationFrame(renderBlackHole);
          }
          else {
            requestAnimationFrame(renderBall);
          }
          if (ballLives<0) ballLives=0;
          lives=ballLives;
          lives_text.nodeValue="Lives: "+lives.toString();
        }
        else if (enteringBall>=0) {
            transition=true;
            tutorial_button.style.visibility="hidden";
            commands_button.style.visibility="hidden";
            pause_button.style.visibility="hidden";
            exit_button.style.visibility="hidden";
            if ( postprocessing.enabled ) {
                sunPosition.copy(spheres[enteringBall].position);
                screenSpacePosition.copy( sunPosition ).project( camera );
                screenSpacePosition.x = ( screenSpacePosition.x + 1 ) / 2;
                screenSpacePosition.y = ( screenSpacePosition.y + 1 ) / 2;
                postprocessing.godrayGenUniforms[ "vSunPositionScreenSpace" ].value.x = screenSpacePosition.x;
                postprocessing.godrayGenUniforms[ "vSunPositionScreenSpace" ].value.y = screenSpacePosition.y;
                postprocessing.godraysFakeSunUniforms[ "vSunPositionScreenSpace" ].value.x = screenSpacePosition.x;
                postprocessing.godraysFakeSunUniforms[ "vSunPositionScreenSpace" ].value.y = screenSpacePosition.y;
                renderer.setRenderTarget( postprocessing.rtTextureColors );
                renderer.clear( true, true, false );
                var sunsqH = 0.74 * window.innerHeight; 
                var sunsqW = 0.74 * window.innerHeight; 
                screenSpacePosition.x *= window.innerWidth;
                screenSpacePosition.y *= window.innerHeight;
                renderer.setScissor( screenSpacePosition.x - sunsqW / 2, screenSpacePosition.y - sunsqH / 2, sunsqW, sunsqH );
                renderer.setScissorTest( true );
                postprocessing.godraysFakeSunUniforms[ "fAspect" ].value = window.innerWidth / window.innerHeight;
                postprocessing.scene.overrideMaterial = postprocessing.materialGodraysFakeSun;
                renderer.setRenderTarget( postprocessing.rtTextureColors );
                renderer.render( postprocessing.scene, postprocessing.camera );
                renderer.setScissorTest( false );
                scene.overrideMaterial = null;
                renderer.setRenderTarget( postprocessing.rtTextureColors );
                renderer.render( scene, camera );
                scene.overrideMaterial = materialDepth;
                renderer.setRenderTarget( postprocessing.rtTextureDepth );
                renderer.clear();
                renderer.render( scene, camera );
                postprocessing.godrayMaskUniforms[ "tInput" ].value = postprocessing.rtTextureDepth.texture;
                postprocessing.scene.overrideMaterial = postprocessing.materialGodraysDepthMask;
                renderer.setRenderTarget( postprocessing.rtTextureDepthMask );
                renderer.render( postprocessing.scene, postprocessing.camera );
                var filterLen = 1.0;
                var TAPS_PER_PASS = 6.0;
                filterGodRays( postprocessing.rtTextureDepthMask.texture, postprocessing.rtTextureGodRays2, getStepSize( filterLen, TAPS_PER_PASS, 1.0 ) );
                filterGodRays( postprocessing.rtTextureGodRays2.texture, postprocessing.rtTextureGodRays1, getStepSize( filterLen, TAPS_PER_PASS, 2.0 ) );
                filterGodRays( postprocessing.rtTextureGodRays1.texture, postprocessing.rtTextureGodRays2, getStepSize( filterLen, TAPS_PER_PASS, 3.0 ) );
                postprocessing.godrayCombineUniforms[ "tColors" ].value = postprocessing.rtTextureColors.texture;
                postprocessing.godrayCombineUniforms[ "tGodRays" ].value = postprocessing.rtTextureGodRays2.texture;
                postprocessing.scene.overrideMaterial = postprocessing.materialGodraysCombine;
                renderer.setRenderTarget( null );
                renderer.render( postprocessing.scene, postprocessing.camera );
                postprocessing.scene.overrideMaterial = null;
                if (postprocessing.t>0.5) {
                  if (ballEggs>0) {
                    scene.remove(blackHoleScene);
                  }
                  else {
                    scene.remove(firstPhaseScene);
                  }
                  scene.add(phoenix_box);
                  set_enlight=true;
                }
                if (postprocessing.t>0.8) {
                  scene.remove(phoenix_box);
                  lives_container.style.visibility="hidden";
                  eggs_container.style.visibility="hidden";
                  middle_message.style.visibility="hidden";
                  middle_visible=false;
                  velocity_container.style.visibility="hidden";
                  left_container.style.visibility="hidden";
                  time_container.style.visibility="hidden";
                  spitting_fire_limit1_container.style.visibility="hidden";
                  spitting_fire_limit2_container.style.visibility="hidden";
                }
                if (postprocessing.t>1) {
                    postprocessing.t=0;
                    if (ballEggs>0) {
                      eggs+=ballEggs;
                      eggs_text.nodeValue="Eggs: "+eggs.toString();  
                      ballEggs=0;
                      entered_black_circle=false;
                      insideBall=false;
                      firstPhaseScene.remove(spheres[enteringBall]);
                      enteringBall=-1;
                      scene.add(firstPhaseScene);
                      if (ballLives<0) ballLives=0;
                      lives=ballLives;
                      lightYears=0;
                      blackHole_t=0;
                      blackHole_putIN=false;
                      setLoad=true;
                      current_spitting_fire=spitting_fire_limit;
                    }   
                    else {
                      insideBall=true;
                      entered_black_circle=false;
                      set_blackHoleScene=false;  
                      scene.add(ballScene);
                      ballLives=lives;
                      ball_t=0;
                      ball_putIN=false;
                      new_eggChest=true;
                      change_pos=true;
                      time_container.style.visibility="visible";
                      left_container.style.visibility="visible";
                      spitting_fire_limit1_container.style.visibility="visible";
                      spitting_fire_limit2_container.style.visibility="visible";
                      middle_text.nodeValue="Turn left and right to avoid the obstacles!";
                      middle_message.style.visibility="visible";
                      middle_visible=true;
                    }             
                    lives_container.style.visibility="visible";
                    eggs_container.style.visibility="visible";
                    tutorial_button.style.visibility="visible";
                    commands_button.style.visibility="visible";        
                    pause_button.style.visibility="visible";        
                    exit_button.style.visibility="visible";
                    transition=false;
                    change_scene=true;
                }
            }
            else {
                renderer.setRenderTarget( null );
                renderer.clear();
                renderer.render( scene, camera );
            }
            postprocessing.t+=0.01;
            if (postprocessing.t>0.05) {
              postprocessing.enabled=true;
            }
        }
        else {
            requestAnimationFrame(renderFirstPart);
        }
      }
    }


    
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

}

main();


function tutorial_click() {
  if (transition || game_over) return;
  toHiddenTutorialComands();
  if (tutorial) {
    if (!commands) set_tutorial_commands(true);
      commands=false;
    document.getElementById("tutorial_title").style.visibility="hidden";
    document.getElementById("tutorial_text").style.visibility="hidden";
    document.getElementById("hold").style.visibility="hidden";
    if (pause) {
      document.getElementById("pause_title").style.visibility="visible";
      document.getElementById("tutorial_pause").style.visibility="visible";
      document.getElementById("commands_pause").style.visibility="visible";
      document.getElementById("resume_pause").style.visibility="visible";
      document.getElementById("exit_pause").style.visibility="visible";  
      document.getElementById("changeVersionButton").style.visibility="visible";
      if (version=='full') {
        document.getElementById("mute_pause").style.visibility="visible";
        document.getElementById("music_range").style.visibility="visible";
        document.getElementById("music_change").style.visibility="visible";
        document.getElementById("soundEffects_range").style.visibility="visible";  
        document.getElementById("soundEffects_change").style.visibility="visible";  
      } 
    }
    tutorial=false;
  }
  else {
    if (!commands)
      set_tutorial_commands(false);
      commands=false;
    tutorial=true;
    set_tutorial=true;
  }
}

function commands_click() {
  if (transition || game_over) return;
  toHiddenTutorialComands();
  if (commands) {
    if (!tutorial) set_tutorial_commands(true);
      tutorial=false;
      if (pause) {
        document.getElementById("pause_title").style.visibility="visible";
        document.getElementById("tutorial_pause").style.visibility="visible";
        document.getElementById("commands_pause").style.visibility="visible";
        document.getElementById("resume_pause").style.visibility="visible";
        document.getElementById("exit_pause").style.visibility="visible";    
        document.getElementById("changeVersionButton").style.visibility="visible";
        if (version=='full') {
          document.getElementById("mute_pause").style.visibility="visible";
          document.getElementById("music_range").style.visibility="visible";  
          document.getElementById("music_change").style.visibility="visible";  
          document.getElementById("soundEffects_range").style.visibility="visible";  
          document.getElementById("soundEffects_change").style.visibility="visible";  
        }
      }      
    commands=false;
  }
  else {
    if (!tutorial) set_tutorial_commands(false);
      tutorial=false;
    commands=true;
    set_commands=true;
  }
}

function set_tutorial_commands(tc) {
  if (transition) return;
  toHiddenTutorialComands();
  if (tc) {
    pagesScene.remove(iceballs);
    scene.remove(pagesScene);
    scene.add(lastScene);
    if (!game_over) {
      camera=lastScene.getObjectByName("camera");
    }
    if (lastScene!=pagesScene) {
      lives_container.style.visibility="visible";
      eggs_container.style.visibility="visible";
      if (lastScene==firstPhaseScene) {
        velocity_container.style.visibility="visible";
        if (!pause) {
          middle_message.style.visibility="visible";
        }
      }
      else if (lastScene==ballScene || lastScene==blackHoleScene){
        time_container.style.visibility="visible";
        left_container.style.visibility="visible";
        spitting_fire_limit1_container.style.visibility="visible";
        spitting_fire_limit2_container.style.visibility="visible";
      }
      var phoenix_fire=fire_phoenix.getObjectByName("phoenixFire");
      if (phoenix_fire!=undefined) {
        fire_phoenix.remove(phoenix_fire);
        set_phoenixFire=true;
      }
      else {
        set_spittingFire=true;
      }
    }
    else {
      set_fire=true;
    }
    toHiddenTutorialComands();
    fire_audio.pause();
  }
  else {
    lives_container.style.visibility="hidden";
    eggs_container.style.visibility="hidden";
    middle_message.style.visibility="hidden";
    middle_visible=false;
    velocity_container.style.visibility="hidden";
    time_container.style.visibility="hidden";
    left_container.style.visibility="hidden";
    spitting_fire_limit1_container.style.visibility="hidden";
    spitting_fire_limit2_container.style.visibility="hidden";
    lastScene=scene.getObjectByName("game_scene");
    scene.remove(lastScene);
    scene.add(pagesScene);
    camera=pagesScene.getObjectByName("camera");
    if (version=='full') fire_audio.play();
  }
}

function toHiddenTutorialComands() {
  pagesScene.remove(button_t);
  pagesScene.remove(buttons);
  pagesScene.remove(iceballs);
  document.getElementById("mute_pause").style.visibility="hidden";
  document.getElementById("pause_title").style.visibility="hidden";
  document.getElementById("tutorial_pause").style.visibility="hidden";
  document.getElementById("commands_pause").style.visibility="hidden";
  document.getElementById("resume_pause").style.visibility="hidden";
  document.getElementById("exit_pause").style.visibility="hidden";
  document.getElementById("music_range").style.visibility="hidden";
  document.getElementById("music_change").style.visibility="hidden";
  document.getElementById("soundEffects_range").style.visibility="hidden";
  document.getElementById("soundEffects_change").style.visibility="hidden";
  document.getElementById("changeVersionButton").style.visibility="hidden";
  document.getElementById("tutorial_title").style.visibility="hidden";
  document.getElementById("tutorial_text").style.visibility="hidden";
  document.getElementById("mute").style.visibility="hidden";
  document.getElementById("commands").style.visibility="hidden";
  document.getElementById("hold").style.visibility="hidden";
  document.getElementById("on_off").style.visibility="hidden";
  document.getElementById("w").style.visibility="hidden";
  document.getElementById("s").style.visibility="hidden";
  document.getElementById("a").style.visibility="hidden";
  document.getElementById("d").style.visibility="hidden";
  document.getElementById("r").style.visibility="hidden";
  document.getElementById("f").style.visibility="hidden";
  document.getElementById("k").style.visibility="hidden";
  document.getElementById("b").style.visibility="hidden";
  document.getElementById("up").style.visibility="hidden";
  document.getElementById("down").style.visibility="hidden";
  document.getElementById("t").style.visibility="hidden";
  document.getElementById("c").style.visibility="hidden";
  document.getElementById("p").style.visibility="hidden";
  document.getElementById("e").style.visibility="hidden";
  if (!game_over && loaded_objects()) {
    document.getElementById("lives").style.visibility="visible";
    document.getElementById("eggs").style.visibility="visible";
  }
}

pause_tutorial.onclick=function(event) {
  tutorial_click();
}

pause_commands.onclick=function(event) {
  commands_click();
}

exit_button.onclick=function(event) {
  exit_click();
}

pause_exit.onclick=function(event) {
  exit_click();
}

function exit_click() {
  if (exit_button.style.visibility="visible" && !exit) {
    if (tutorial) tutorial_click();
    if (commands) commands_click();
    var rmscene=scene.getObjectByName("game_scene");
    scene.remove(rmscene);
    scene.add(pagesScene);
    camera=pagesScene.getObjectByName("camera");
    toHiddenTutorialComands();
    tutorial_button.style.visibility="hidden";
    commands_button.style.visibility="hidden";
    pause_button.style.visibility="hidden";
    exit_button.style.visibility="hidden";
    lives_container.style.visibility="hidden";
    eggs_container.style.visibility="hidden";
    middle_message.style.visibility="hidden";
    middle_visible=false;
    velocity_container.style.visibility="hidden";
    time_container.style.visibility="hidden";
    left_container.style.visibility="hidden";
    spitting_fire_limit1_container.style.visibility="hidden";
    spitting_fire_limit2_container.style.visibility="hidden";
    fly=true;
    bow=true;
    restore_phoenix_t();
    put_phoenix=true;
    if (pause) {
      pause_onclick();
    }
    set_exit=true;
    game_music.pause();
    fire_audio.pause();
    exit=true;
  }
}



function changeVersion() {
  var elem=document.getElementById("version_pause");
  if (elem.value=="Change to Lite Version") {
    elem.value="Change to Full Version";
    version='lite';
    game_music.pause();
    for (var i=0; i<sound_effects.length; i++) {
      sound_effects[i].pause();
    }
    pause_mute.style.visibility="hidden";
    music_range.style.visibility="hidden";
    music_change.style.visibility="hidden";
    soundEffects_range.style.visibility="hidden";
    soundEffects_change.style.visibility="hidden";
  }
  else {
    elem.value="Change to Lite Version";
    version='full';
    if (!letsgo_page) game_music.play();
    if (pause) {
      pause_mute.style.visibility="visible";
      music_range.style.visibility="visible";
      music_change.style.visibility="visible";
      soundEffects_range.style.visibility="visible";
      soundEffects_change.style.visibility="visible";
    }
  }
  init_bloom_f(blackHoleBloom);
}

function changeMuteButton() {
  muteAll();
  var elem=document.getElementById("mute_pause");
  if (elem.value=="Mute") {
    elem.value="Unmute";
  }
  else {
    elem.value="Mute";
  }
}

function muteAll() {
  game_music.muted=!game_music.muted;
  muteSoundEffects();
}

function muteSoundEffects() {
  for (var i=0; i<sound_effects.length; i++) {
    sound_effects[i].muted=!sound_effects[i].muted;
  }
}    

music_range.onchange=function (event) {
  var vol=event.target.value/100;
  vol*=music_initial_volume;
  game_music.volume=vol;
}

music_range.onclick=function (event) {
  music_range.style.cursor="grabbing";
}

soundEffects_range.onchange=function (event) {
  for (var i=0; i<sound_effects.length; i++) {
    var vol=event.target.value/100;
    vol*=soundEffects_initial_volumes[i];
    sound_effects[i].volume=vol;
  }
}

soundEffects_range.onclick=function (event) {
  music_range.style.cursor="grabbing";
}
