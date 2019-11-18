'use strict'

var phoenix_clock;

var phoenix_box, phoenix_model, phoenix, phoenix_wings, phoenix_tail, phoenix_hair, phoenix_spine, phoenix_neck, phoenix_head, phoenix_light;
var phoenix_whole;

var turn_and_go_f;
var phoenix_flight_animation_f;

var velocity=1;

var spittingFire;
var spittingFire_bounding_box;
var phoenixFire;
var fire_phoenix;

var screech=new Audio('models/sound_effects/233558__waveplay-old__softer-car-screech.wav');
var done_screech=false;
var fire_audio=new Audio('models/sound_effects/322176__liamg-sfx__background-fire.wav');
fire_audio.loop=true;

var spare_phoenix;

var bow=false;

var pause=false;

var phoenix_bounding_box;

var phoenix_bow_animation;

var pause_button=document.getElementById("pause_button");
var pause_plane;

var livesObj=new THREE.Object3D();
var eggsObj=new THREE.Object3D();

var fly=false;

var done_k_press=false;

var pause_title=document.getElementById("pause_title");
var pause_mute=document.getElementById("mute_pause");
var pause_tutorial=document.getElementById("tutorial_pause");
var pause_commands=document.getElementById("commands_pause");
var pause_resume=document.getElementById("resume_pause");
var pause_exit=document.getElementById("exit_pause");
var music_change=document.getElementById("music_change");
var music_range=document.getElementById("music_range");
var soundEffects_change=document.getElementById("soundEffects_change");
var soundEffects_range=document.getElementById("soundEffects_range");
var pause_version=document.getElementById("changeVersionButton");

function main() {

  const canvas=document.getElementById("game_canvas");

  turn_and_go_f=turn_and_go;
    phoenix_flight_animation_f=phoenix_flight_animation;

    phoenix_box=new THREE.Object3D();
    phoenix_box.name="phoenix_box";
    phoenix_box.position.set(0,-9,0);
    phoenix_box.rotation.set(0,Math.PI/2,0);

    fire_phoenix=new THREE.Object3D();
    fire_phoenix.name="fire_phoenix";
  
    var screen_width=window.innerWidth;
    var screen_height=window.innerHeight;
    var fov = 45;
    var aspect = screen_width/screen_height;
    var near = 0.1;
    var far = 2000000;
    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.name="camera";
    phoenix_box.add(camera);

    camera.aspect=canvas.clientWidth/canvas.clientHeight;

    phoenix_bow_animation=function () {
      if (bow) {
        phoenixMove('bow',0);
      }
    }

    phoenix_clock=new THREE.Clock();

    var ellipse=new THREE.Object3D();

    var curve=new THREE.Shape();
    curve.absellipse(
      -10,  41,           
      9, 2,           
      0,  2 * Math.PI,  
      false,            
      0                 
    );
    
    var geometry = new THREE.ShapeBufferGeometry(curve);
    
    var material = new THREE.MeshBasicMaterial( { color : 0x000000, side: THREE.DoubleSide } );
    
    var mesh = new THREE.Mesh( geometry, material );
    ellipse.add(mesh);

    curve=new THREE.EllipseCurve(
      -10,  41,           
      8, 1,           
      0,  2 * Math.PI,  
      false,            
      0                 
    );
    
    var points = curve.getPoints( 50 );
    geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    var material = new THREE.LineBasicMaterial( { color : 0x7fffd4, side: THREE.DoubleSide } );
    
    var mesh = new THREE.Line( geometry, material );
    ellipse.add(mesh);
    ellipse.scale.multiplyScalar(0.5);
    ellipse.rotation.y=Math.PI/2;
    livesObj.add(ellipse.clone());
    livesObj.name="lives";
    eggsObj.add(ellipse.clone());
    eggsObj.name="eggs";
    eggsObj.position.z-=10;


    {
      var geometry=new THREE.PlaneBufferGeometry(115,60,32);
      var material=new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.DoubleSide});
      pause_plane=new THREE.Mesh(geometry,material);
      pause_plane.rotation.y=Math.PI/2;
      pause_plane.position.x=50;
      pause_plane.visible=false;
    }

    {
      pause_button.onclick=function(event) {
        if (pause_button.style.visibility=="visible" && loaded_objects() && !set_game) pause_onclick();
      }
    }


    {
        new THREE.GLTFLoader()
              .load('models/phoenix_bird/scene.gltf', function(gltf) {
            var model=gltf.scene;
            model.name="phoenix";
            model.scale.multiplyScalar(0.02);
            model.traverse(function(child){
              if (child.isMesh) {
                child.castShadow=true;
                child.receiveShadow=true;
              }
            });
            camera.position.set(-31.5,13,0);
            fire_phoenix.add(model);
            spare_phoenix=model.clone();
            camera.lookAt(model.position);
            phoenix_box.scale.multiplyScalar(0.05);
            phoenix_model=model;
            phoenix=get_phoenix();
            phoenix_wings=[get_phoenix_left_wing()];
            phoenix_wings.push(get_phoenix_right_wing(phoenix_wings[0]));
            phoenix_tail=get_phoenix_tail();
            phoenix_hair=[get_phoenix_nextTailHair(),get_phoenix_nearTailHair(),get_phoenix_babyTailHair(),get_phoenix_babyChestHair(),get_phoenix_babyHeadHair()];
            phoenix_spine=get_phoenix_spine();
            phoenix_neck=get_phoenix_neck();
            phoenix_head=get_phoenix_head();
            phoenix_whole=[phoenix, phoenix_wings, phoenix_tail, phoenix_hair, phoenix_spine, phoenix_neck, phoenix_head];
            phoenix_box.add(fire_phoenix);
            phoenix_bounding_box=new THREE.BoundingBoxHelper(model,'black');
            phoenix_bounding_box.geometry.computeBoundingBox();
            phoenix_bounding_box.update();
            phoenix_bounding_box.visible=false;
            fire_phoenix.add(phoenix_bounding_box);
            phoenix_box.add(livesObj);
            phoenix_box.add(eggsObj);
            phoenix_box.add(pause_plane);
    }, undefined, undefined);

    }

    phoenix_clock.start();


    function toEndPose(bodypart,move) {
      for (var i=0; i<bodypart['bodypart'].length; i++) {
        var end=bodypart[move+'_end1'][i];
        bodypart['bodypart'][i].rotateY(end-bodypart[move+'_start1'][i]);
        bodypart[move+'_end1'][i]=bodypart[move+'_start1'][i];
        bodypart[move+'_start1'][i]=end;
      }
    }

    function getBoneCourse(bodypart,move,w) {
      if (bodypart[move+'_down']) {
        bodypart[move+'_points1']=[bodypart[move+'_start1'],bodypart[move+'_pointd'],bodypart[move+'_end1']];
      }
      else {
        bodypart[move+'_points1']=[bodypart[move+'_end1'],bodypart[move+'_pointu'],bodypart[move+'_start1']];
      }
      bodypart[move+'_down']=!bodypart[move+'_down'];
    }


    function get_tvec(points) {
      var n=points.length;
      var new_points=[];
      for (var i=0; i<n; i++) {
        new_points.push(points[i][0]);
      }
      var t=[0];
      var d=Math.abs(new_points[n-1]-new_points[0]);
      for (var i=1; i<n-1; i++) {
        var v=(new_points[i]-new_points[0])/d;
        t.push(Math.abs(v));
      }
      t.push(1)
      return t;
    }
  




    function interpolate(bodypart,move,quale) {
      var amounts=bodypart[move+'_amounts'+quale];
      var x=bodypart[move+'_points'+quale];
      var t_vec=bodypart[move+'_t_vec'+quale];
      var t=bodypart['t'];
      var range=bodypart[move+'_range'+quale];
      var nbones=bodypart['bodypart'].length;
      var tn=bodypart[move+'_t_vec'+quale].length;
      var pos=bodypart[move+'_move'+quale];
      var f=range%tn;
      var e=(range+1)%tn;
      for (var i=0; i<nbones; i++) {
        amounts[i]=interpolation(x[f][i],x[e][i],t_vec[f],t_vec[e],t)-pos[i];
      }
    }

    var wing_up;
    
    function phoenixBoneMove(bodypart,move,delta) {
    bodypart['t']+=bodypart[move+'_move_speed']+delta;
    if (bodypart['t']<1) {
      wing_up=phoenix_wings[0].fly_down;
    }
      for (var j=0; j<6; j++) {
        var w=j.toString();
        if (bodypart[move+'_start'+w]!=undefined) {
          interpolate(bodypart,move,w);
          for (var i=0; i<bodypart['bodypart'].length; i++) {
            bodypart[move+'_move'+w][i]+=bodypart[move+'_amounts'+w][i];
            switch (j) {
              case 0:
                bodypart['bodypart'][i].rotateX(bodypart[move+'_amounts'+w][i]);
                break;
              case 1:
                bodypart['bodypart'][i].rotateY(bodypart[move+'_amounts'+w][i]);
                break;
              case 2:
                bodypart['bodypart'][i].rotateZ(bodypart[move+'_amounts'+w][i]);
                break;
              case 3:
                bodypart['bodypart'][i].translateX(bodypart[move+'_amounts'+w][i]);
                break;
              case 4:
                bodypart['bodypart'][i].translateY(bodypart[move+'_amounts'+w][i]);
                break;
              case 5:
                bodypart['bodypart'][i].translateZ(bodypart[move+'_amounts'+w][i]);
                break;            }
          }
            var e=(bodypart[move+'_range'+w]+1)%bodypart[move+'_t_vec'+w].length;
            if (bodypart['t']>bodypart[move+'_t_vec'+w][e]) bodypart[move+'_range'+w]++;
            if (bodypart['t']>1) {
              bodypart[move+'_change_course'+w](bodypart,move,w);
              change_start(bodypart,w);
              bodypart[move+'_t_vec'+w]=get_tvec(bodypart[move+'_points'+w]);
              bodypart[move+'_range'+w]=0;
              if (move=='bow') {
                bow=false;
              }      
            }
        }
      }
      if (bodypart['t']>1) {
        bodypart['t']=0;
        if (bow && wing_up) {
          fly=false;
        }
      }
    }


    function phoenix_flight_animation(delta) {
      phoenixMove('fly',delta);
    }

    function phoenixMove(move,delta) {
      for (var i=0; i<phoenix_whole.length; i++) {
        if (!Array.isArray(phoenix_whole[i])) {
          phoenixBoneMove(phoenix_whole[i],move,delta);
        }
        else {
          for (var j=0; j<phoenix_whole[i].length; j++) {
          phoenixBoneMove(phoenix_whole[i][j],move,delta);
          }
        }
      }
    }
    
    function invertPoints(bodypart,move,quale) {
      bodypart[move+'_points'+quale]=invertVec(bodypart[move+'_points'+quale]);
    }


    function get_phoenix() {
      var phoenix_={}
      phoenix_['name']='Phoenix';
      phoenix_['bodypart']=[phoenix_model];
      phoenix_['fly_start4']=[];
      phoenix_['fly_move4']=[];
      phoenix_['fly_amounts4']=[];
      phoenix_['fly_start4']=[phoenix_['bodypart'][0].position.y];
      phoenix_['start4']=[phoenix_['bodypart'][0].position.y];
      phoenix_['fly_end4']=[phoenix_['fly_start4'][0]+0.5];
      phoenix_['fly_move4']=[phoenix_['fly_start4'][0]];
      phoenix_['fly_amounts4']=[0];
      phoenix_['t']=0;
      phoenix_['fly_points4']=[phoenix_['fly_start4'],phoenix_['fly_end4']];
      phoenix_['fly_t_vec4']=get_tvec(phoenix_['fly_points4']);
      phoenix_['fly_range4']=0;
      phoenix_['fly_move_speed']=0.045;
      phoenix_['fly_change_course4']=invertPoints;
      phoenix_['turn_max']=0.7;
      phoenix_['turn']=0;
      phoenix_['turnup_max']=Math.PI/2;
      phoenix_['turnup']=0;
      phoenix_['fire_turn']=0;
      phoenix_['fire_trans']=0;
      phoenix_['turn_ytrans']=0;
      phoenix_['position']=0;
      phoenix_['box_turn']=0;
      return phoenix_;
    }

    

    function get_phoenix_head() {
      var phoenix_head_={}
      phoenix_head_['name']='Head';
      phoenix_head_['bodypart']=[phoenix_model.getObjectByName('b_Head_06'),phoenix_model.getObjectByName('B_Jaw_07')];
      phoenix_head_['fly_start2']=[];
      phoenix_head_['bow_start2']=[];
      phoenix_head_['start2']=[];
      phoenix_head_['fly_move2']=[];
      phoenix_head_['bow_move2']=[];
      phoenix_head_['fly_amounts2']=[];
      phoenix_head_['bow_amounts2']=[];
      for (var i=0; i<phoenix_head_['bodypart'].length; i++) {
        phoenix_head_['fly_start2'].push(phoenix_head_['bodypart'][i].rotation.z);
        phoenix_head_['bow_start2'].push(phoenix_head_['bodypart'][i].rotation.z);
        phoenix_head_['start2'].push(phoenix_head_['bodypart'][i].rotation.z);
      }
      phoenix_head_['fly_end2']=[phoenix_head_['fly_start2'][0], -0.2];
      phoenix_head_['bow_end2']=[-0.5,phoenix_head_['fly_start2'][0]];
      for (var i=0; i<phoenix_head_['bodypart'].length; i++) {      
        phoenix_head_['fly_move2'].push(phoenix_head_['fly_start2'][i]);
        phoenix_head_['bow_move2'].push(phoenix_head_['fly_start2'][i]);
        phoenix_head_['fly_amounts2'].push(0);
        phoenix_head_['bow_amounts2'].push(0);
      }
      phoenix_head_['t']=0;
      phoenix_head_['fly_points2']=[phoenix_head_['fly_start2'],phoenix_head_['fly_end2']];
      phoenix_head_['bow_points2']=[phoenix_head_['bow_start2'],phoenix_head_['bow_end2']];
      phoenix_head_['fly_t_vec2']=get_tvec(phoenix_head_['fly_points2']);
      phoenix_head_['bow_t_vec2']=get_tvec(phoenix_head_['bow_points2']);
      phoenix_head_['fly_range2']=0;
      phoenix_head_['bow_range2']=0;
      phoenix_head_['fly_move_speed']=0.045;
      phoenix_head_['bow_move_speed']=0.02;
      phoenix_head_['fly_change_course2']=invertPoints;
      phoenix_head_['bow_change_course2']=invertPoints;
      return phoenix_head_;
    }



    function get_phoenix_neck() {
      var phoenix_neck_={}
      phoenix_neck_['name']='Neck';
      phoenix_neck_['bodypart']=[phoenix_model.getObjectByName('b_Neck_0_03'),phoenix_model.getObjectByName('b_Neck_1_04'),phoenix_model.getObjectByName('b_Neck_2_05')];
      phoenix_neck_['fly_start2']=[];
      phoenix_neck_['bow_start2']=[];
      phoenix_neck_['start2']=[];
      phoenix_neck_['fly_move2']=[];
      phoenix_neck_['bow_move2']=[];
      phoenix_neck_['fly_amounts2']=[];
      phoenix_neck_['bow_amounts2']=[];
      for (var i=0; i<phoenix_neck_['bodypart'].length; i++) {
        phoenix_neck_['fly_start2'].push(phoenix_neck_['bodypart'][i].rotation.z);
        phoenix_neck_['bow_start2'].push(phoenix_neck_['bodypart'][i].rotation.z);
        phoenix_neck_['start2'].push(phoenix_neck_['bodypart'][i].rotation.z);
      }
      phoenix_neck_['fly_end2']=[phoenix_neck_['fly_start2'][0], -0.2, -0.2];
      phoenix_neck_['bow_end2']=[-0.5, phoenix_neck_['fly_start2'][1], phoenix_neck_['fly_start2'][2]];
      for (var i=0; i<phoenix_neck_['bodypart'].length; i++) {      
        phoenix_neck_['fly_move2'].push(phoenix_neck_['fly_start2'][i]);
        phoenix_neck_['bow_move2'].push(phoenix_neck_['fly_start2'][i]);
        phoenix_neck_['fly_amounts2'].push(0);
        phoenix_neck_['bow_amounts2'].push(0);
      }
      phoenix_neck_['t']=0;
      phoenix_neck_['fly_points2']=[phoenix_neck_['fly_start2'],phoenix_neck_['fly_end2']];
      phoenix_neck_['bow_points2']=[phoenix_neck_['bow_start2'],phoenix_neck_['bow_end2']];
      phoenix_neck_['fly_t_vec2']=get_tvec(phoenix_neck_['fly_points2']);
      phoenix_neck_['bow_t_vec2']=get_tvec(phoenix_neck_['bow_points2']);
      phoenix_neck_['fly_range2']=0;
      phoenix_neck_['bow_range2']=0;
      phoenix_neck_['fly_move_speed']=0.045;
      phoenix_neck_['bow_move_speed']=0.02;
      phoenix_neck_['fly_change_course2']=invertPoints;
      phoenix_neck_['bow_change_course2']=invertPoints;
      return phoenix_neck_;
    }



    function get_phoenix_spine() {
      var phoenix_spine_={}
      phoenix_spine_['name']='Spine';
      phoenix_spine_['bodypart']=[phoenix_model.getObjectByName('B_Spine_02')];
      phoenix_spine_['fly_start3']=[];
      phoenix_spine_['start3']=[];
      phoenix_spine_['fly_move3']=[];
      phoenix_spine_['fly_amounts3']=[];
      phoenix_spine_['fly_start3']=[phoenix_spine_['bodypart'][0].position.x];
      phoenix_spine_['start3']=[phoenix_spine_['bodypart'][0].position.x];
      phoenix_spine_['fly_end3']=[phoenix_spine_['fly_start3'][0]+5];
      phoenix_spine_['fly_move3']=[phoenix_spine_['fly_start3'][0]];
      phoenix_spine_['fly_amounts3']=[0];
      phoenix_spine_['t']=0;
      phoenix_spine_['fly_points3']=[phoenix_spine_['fly_start3'],phoenix_spine_['fly_end3']];
      phoenix_spine_['fly_t_vec3']=get_tvec(phoenix_spine_['fly_points3']);
      phoenix_spine_['fly_range3']=0;
      phoenix_spine_['fly_move_speed']=0.045;
      phoenix_spine_['fly_change_course3']=invertPoints;
      return phoenix_spine_;
    }



    function get_phoenix_babyHeadHair() {
      var phoenix_hair_={}
      phoenix_hair_['name']='Baby head hair';
      phoenix_hair_['bodypart']=[phoenix_model.getObjectByName('B_Hair_0_010'),phoenix_model.getObjectByName('B_Hair_1_08'),phoenix_model.getObjectByName('B_Hair_2_09'),
                                  phoenix_model.getObjectByName('B_Hair_3_015'),phoenix_model.getObjectByName('B_Hair_4_016'),phoenix_model.getObjectByName('B_Hair_5_017'),
                                  phoenix_model.getObjectByName('B_Hair_6_018'),phoenix_model.getObjectByName('B_Hair_44_011'),phoenix_model.getObjectByName('B_Hair_45_012'),
                                  phoenix_model.getObjectByName('B_Hair_46_013'),phoenix_model.getObjectByName('B_Hair_47_014')];
      phoenix_hair_['fly_start2']=[];
      phoenix_hair_['start2']=[];
      phoenix_hair_['fly_move2']=[];
      phoenix_hair_['fly_amounts2']=[];
      for (var i=0; i<phoenix_hair_['bodypart'].length; i++) {
        phoenix_hair_['fly_start2'].push(phoenix_hair_['bodypart'][i].rotation.z);
        phoenix_hair_['start2'].push(phoenix_hair_['bodypart'][i].rotation.z);
      }
      phoenix_hair_['fly_end2']=[1.8, 1.8, -1.8, 2.6, 0.5, 0.5, phoenix_hair_['fly_start2'][6], -2.6, -0.5, -0.5, phoenix_hair_['fly_start2'][10]];
      for (var i=0; i<phoenix_hair_['bodypart'].length; i++) {      
        phoenix_hair_['fly_move2'].push(phoenix_hair_['fly_start2'][i]);
        phoenix_hair_['fly_amounts2'].push(0);
      }
      phoenix_hair_['t']=0;
      phoenix_hair_['fly_points2']=[phoenix_hair_['fly_start2'],phoenix_hair_['fly_end2']];
      phoenix_hair_['fly_t_vec2']=get_tvec(phoenix_hair_['fly_points2']);
      phoenix_hair_['fly_range2']=0;
      phoenix_hair_['fly_move_speed']=0.045;
      phoenix_hair_['fly_change_course2']=invertPoints;
      return phoenix_hair_;
    }


    

    function get_phoenix_babyChestHair() {
      var phoenix_hair_={}
      phoenix_hair_['name']='Baby chest hair';
      phoenix_hair_['bodypart']=[phoenix_model.getObjectByName('B_Hair_7_019'),phoenix_model.getObjectByName('B_Hair_8_020'),phoenix_model.getObjectByName('B_Hair_9_021'),
                                  phoenix_model.getObjectByName('B_Hair_10_022'),phoenix_model.getObjectByName('B_Hair_11_023'),phoenix_model.getObjectByName('B_Hair_12_024'),
                                  phoenix_model.getObjectByName('B_Hair_13_025'),phoenix_model.getObjectByName('B_Hair_14_026'),phoenix_model.getObjectByName('B_Hair_15_027')];
      phoenix_hair_['fly_start2']=[];
      phoenix_hair_['start2']=[];
      phoenix_hair_['fly_move2']=[];
      phoenix_hair_['fly_amounts2']=[];
      for (var i=0; i<phoenix_hair_['bodypart'].length; i++) {
        phoenix_hair_['fly_start2'].push(phoenix_hair_['bodypart'][i].rotation.z);
        phoenix_hair_['start2'].push(phoenix_hair_['bodypart'][i].rotation.z);
      }
      phoenix_hair_['fly_end2']=[-2.7, 0, 0.8, 3, 0.2, -0.4, -2.7, 0, 0.8];
      for (var i=0; i<phoenix_hair_['bodypart'].length; i++) {      
        phoenix_hair_['fly_move2'].push(phoenix_hair_['fly_start2'][i]);
        phoenix_hair_['fly_amounts2'].push(0);
      }
      phoenix_hair_['t']=0;
      phoenix_hair_['fly_points2']=[phoenix_hair_['fly_start2'],phoenix_hair_['fly_end2']];
      phoenix_hair_['fly_t_vec2']=get_tvec(phoenix_hair_['fly_points2']);
      phoenix_hair_['fly_range2']=0;
      phoenix_hair_['fly_move_speed']=0.045;
      phoenix_hair_['fly_change_course2']=invertPoints;
      return phoenix_hair_;
    }



    function get_phoenix_babyTailHair() {
      var phoenix_hair_={}
      phoenix_hair_['name']='Baby tail hair';
      phoenix_hair_['bodypart']=[phoenix_model.getObjectByName('B_Hair_16_065'),phoenix_model.getObjectByName('B_Hair_17_066'),
                                                  phoenix_model.getObjectByName('B_Hair_18_067'),phoenix_model.getObjectByName('B_Hair_19_062'),
                                                  phoenix_model.getObjectByName('B_Hair_20_063'),phoenix_model.getObjectByName('B_Hair_21_064')];
      phoenix_hair_['fly_start2']=[];
      phoenix_hair_['start2']=[];
      phoenix_hair_['fly_move2']=[];
      phoenix_hair_['fly_amounts2']=[];
      phoenix_hair_['fly_end2']=[-0.5, 1, 1, -0.5, 1, 1];
      for (var i=0; i<phoenix_hair_['bodypart'].length; i++) {
        phoenix_hair_['fly_start2'].push(phoenix_hair_['bodypart'][i].rotation.z);
        phoenix_hair_['start2'].push(phoenix_hair_['bodypart'][i].rotation.z);
        phoenix_hair_['fly_move2'].push(phoenix_hair_['fly_start2'][i]);
        phoenix_hair_['fly_amounts2'].push(0);
      }
      phoenix_hair_['t']=0;
      phoenix_hair_['fly_points2']=[phoenix_hair_['fly_start2'],phoenix_hair_['fly_end2']];
      phoenix_hair_['fly_t_vec2']=get_tvec(phoenix_hair_['fly_points2']);
      phoenix_hair_['fly_range2']=0;
      phoenix_hair_['fly_move_speed']=0.045;
      phoenix_hair_['fly_change_course2']=invertPoints;
      return phoenix_hair_;
    }

    function get_phoenix_nearTailHair() {
      var phoenix_hair_={}
      phoenix_hair_['name']='Near tail hair';
      phoenix_hair_['bodypart']=[phoenix_model.getObjectByName('B_Hair_34_057'),phoenix_model.getObjectByName('B_Hair_35_058'),
                                                  phoenix_model.getObjectByName('B_Hair_36_059'),phoenix_model.getObjectByName('B_Hair_37_060'),
                                                  phoenix_model.getObjectByName('B_Hair_38_061'),phoenix_model.getObjectByName('B_Hair_39_052'),
                                                  phoenix_model.getObjectByName('B_Hair_40_053'),phoenix_model.getObjectByName('B_Hair_41_054'),
                                                  phoenix_model.getObjectByName('B_Hair_42_055'),phoenix_model.getObjectByName('B_Hair_43_056')];
      phoenix_hair_['fly_start1']=[];
      phoenix_hair_['start1']=[];
      phoenix_hair_['fly_new_start1']=[];
      phoenix_hair_['fly_start_change']=true;
      phoenix_hair_['fly_move1']=[];
      phoenix_hair_['fly_amounts1']=[];
      phoenix_hair_['fly_end1']=[0.65, -0.5062550937508034, -0.6192642718722667, 0.5135043389106355, 0.6205110507599985, 0.35, -0.16408863054991873, -0.522768077957019, 0.652826650041959, 0.452587381919743];
      for (var i=0; i<phoenix_hair_['bodypart'].length; i++) {
        phoenix_hair_['fly_start1'].push(phoenix_hair_['bodypart'][i].rotation.y);
        phoenix_hair_['start1'].push(phoenix_hair_['bodypart'][i].rotation.y);
        phoenix_hair_['fly_new_start1'].push(phoenix_hair_['fly_start1'][i]);
      }
      phoenix_hair_['fly_new_start1'][0]-=0.4;
      phoenix_hair_['fly_new_start1'][1]+=0.5;
      phoenix_hair_['fly_new_start1'][2]+=0.5;
      phoenix_hair_['fly_new_start1'][3]+=0.1;
      phoenix_hair_['fly_new_start1'][5]-=0.4;
      phoenix_hair_['fly_new_start1'][6]+=0.5;
      phoenix_hair_['fly_new_start1'][7]+=0.5;
      phoenix_hair_['fly_new_start1'][8]+=0.1;
      toEndPose(phoenix_hair_,'fly');
      for (var i=0; i<phoenix_hair_['bodypart'].length; i++) {      
        phoenix_hair_['fly_move1'].push(phoenix_hair_['fly_start1'][i]);
        phoenix_hair_['fly_amounts1'].push(0);
      }
      phoenix_hair_['t']=0;
      phoenix_hair_['fly_points1']=[phoenix_hair_['fly_start1'],phoenix_hair_['fly_end1']];
      phoenix_hair_['fly_t_vec1']=get_tvec(phoenix_hair_['fly_points1']);
      phoenix_hair_['fly_range1']=0;
      phoenix_hair_['fly_move_speed']=0.045;
      phoenix_hair_['fly_change_course1']=invertPoints;
      return phoenix_hair_;
    }

    function get_phoenix_nextTailHair() {
      var phoenix_hair_={}
      phoenix_hair_['name']='Next tail hair';
      phoenix_hair_['bodypart']=[phoenix_model.getObjectByName('B_Hair_22_040'),phoenix_model.getObjectByName('B_Hair_23_041'),
                                                  phoenix_model.getObjectByName('B_Hair_24_042'),phoenix_model.getObjectByName('B_Hair_25_043'),
                                                  phoenix_model.getObjectByName('B_Hair_26_044'),phoenix_model.getObjectByName('B_Hair_27_045'),
                                                  phoenix_model.getObjectByName('B_Hair_28_046'),phoenix_model.getObjectByName('B_Hair_29_047'),
                                                  phoenix_model.getObjectByName('B_Hair_30_048'),phoenix_model.getObjectByName('B_Hair_31_049'),
                                                  phoenix_model.getObjectByName('B_Hair_32_050'),phoenix_model.getObjectByName('B_Hair_33_051')];
      phoenix_hair_['fly_start1']=[];
      phoenix_hair_['start1']=[];
      phoenix_hair_['fly_new_start1']=[];
      phoenix_hair_['fly_start_change']=true;
      phoenix_hair_['fly_move1']=[];
      phoenix_hair_['fly_amounts1']=[];
      phoenix_hair_['fly_end1']=[1, -0.14259880677889564, -0.2966417828820729, -0.15321034086141405, -0.2582910298316783, -0.5641353647393219, 1.05, -0.1944566147652859, -0.33464097194289466, -0.08487375899328098, -0.2525822939370811, -0.5806061791886872];
      for (var i=0; i<phoenix_hair_['bodypart'].length; i++) {
        phoenix_hair_['fly_start1'].push(phoenix_hair_['bodypart'][i].rotation.y);
        phoenix_hair_['start1'].push(phoenix_hair_['bodypart'][i].rotation.y);
        phoenix_hair_['fly_new_start1'].push(phoenix_hair_['fly_start1'][i]);
      }
      phoenix_hair_['fly_new_start1'][0]-=0.3;
      phoenix_hair_['fly_new_start1'][6]-=0.3;
      toEndPose(phoenix_hair_,'fly');
      for (var i=0; i<phoenix_hair_['bodypart'].length; i++) {      
        phoenix_hair_['fly_move1'].push(phoenix_hair_['fly_start1'][i]);
        phoenix_hair_['fly_amounts1'].push(0);
      }
      phoenix_hair_['t']=0;
      phoenix_hair_['fly_points1']=[phoenix_hair_['fly_start1'],phoenix_hair_['fly_end1']];
      phoenix_hair_['fly_t_vec1']=get_tvec(phoenix_hair_['fly_points1']);
      phoenix_hair_['fly_range1']=0;
      phoenix_hair_['fly_move_speed']=0.045;
      phoenix_hair_['fly_change_course1']=invertPoints;
      return phoenix_hair_;
    }


    function change_start(bodypart,quale) {
      if (bodypart['fly_new_start'+quale]==undefined) return;
      if (bodypart['fly_start_change']) {
        bodypart['fly_points'+quale][0]=bodypart['fly_new_start'+quale];
        bodypart['fly_start_change']=false;
      }
    }

    function get_phoenix_tail() {
      var phoenix_tail_={}
      phoenix_tail_['name']='Tail';
      phoenix_tail_['bodypart']=[phoenix_model.getObjectByName('B_Tail_0_029'),phoenix_model.getObjectByName('B_Tail_1_030'),
                                                  phoenix_model.getObjectByName('B_Tail_2_031'),phoenix_model.getObjectByName('B_Tail_3_032'),
                                                  phoenix_model.getObjectByName('B_Tail_4_033'),phoenix_model.getObjectByName('B_Tail_5_034')];
      phoenix_tail_['fly_start1']=[];
      phoenix_tail_['start1']=[];
      phoenix_tail_['fly_start_change']=true;
      phoenix_tail_['fly_new_start1']=[];
      phoenix_tail_['fly_move1']=[];
      phoenix_tail_['fly_amounts1']=[];
      phoenix_tail_['fly_end1']=[0.6, -0.7, 0.08137002165684848, 0.2921374581413133, 0.3908763794903455, 0.3603768335978603];
      for (var i=0; i<phoenix_tail_['bodypart'].length; i++) {
        phoenix_tail_['fly_start1'].push(phoenix_tail_['bodypart'][i].rotation.y);
        phoenix_tail_['start1'].push(phoenix_tail_['bodypart'][i].rotation.y);
        phoenix_tail_['fly_new_start1'].push(phoenix_tail_['fly_start1'][i])
      }
      phoenix_tail_['fly_new_start1'][0]+=0.3;
      phoenix_tail_['fly_new_start1'][1]-=0.4;
      toEndPose(phoenix_tail_,'fly');
      for (var i=0; i<phoenix_tail_['bodypart'].length; i++) {      
        phoenix_tail_['fly_move1'].push(phoenix_tail_['fly_start1'][i]);
        phoenix_tail_['fly_amounts1'].push(0);
      }
      phoenix_tail_['t']=0;
      phoenix_tail_['fly_points1']=[phoenix_tail_['fly_start1'],phoenix_tail_['fly_end1']];
      phoenix_tail_['fly_t_vec1']=get_tvec(phoenix_tail_['fly_points1']);
      phoenix_tail_['fly_range1']=0;
      phoenix_tail_['fly_move_speed']=0.045;
      phoenix_tail_['fly_change_course1']=invertPoints;
      return phoenix_tail_;
    }


    function get_phoenix_left_wing() {
      var phoenix_leftWing_={}
      phoenix_leftWing_['name']='Left wing';
      phoenix_leftWing_['bodypart']=[phoenix_model.getObjectByName('B_Left_Wing_0_070'),phoenix_model.getObjectByName('B_Left_Wing_1_071'),
                                                  phoenix_model.getObjectByName('B_Left_Wing_2_072'),phoenix_model.getObjectByName('B_Left_Wing_3_076'),
                                                  phoenix_model.getObjectByName('B_Left_Wing_4_077'),phoenix_model.getObjectByName('B_Left_Wing_5_078'),
                                                  phoenix_model.getObjectByName('B_Left_Wing_6_073'),phoenix_model.getObjectByName('B_Left_Wing_7_074'),
                                                  phoenix_model.getObjectByName('B_Left_Wing_8_075'),phoenix_model.getObjectByName('B_Left_Wing_9_069')];
      phoenix_leftWing_['fly_start1']=[];
      phoenix_leftWing_['start1']=[];
      phoenix_leftWing_['bow_start1']=[];
      phoenix_leftWing_['fly_move1']=[];
      phoenix_leftWing_['bow_move1']=[];
      phoenix_leftWing_['fly_amounts1']=[];
      phoenix_leftWing_['bow_amounts1']=[];
      for (var i=0; i<phoenix_leftWing_['bodypart'].length; i++) {
        phoenix_leftWing_['start1'].push(phoenix_leftWing_['bodypart'][i].rotation.y);
        phoenix_leftWing_['fly_start1'].push(phoenix_leftWing_['bodypart'][i].rotation.y);
        phoenix_leftWing_['bow_start1'].push(phoenix_leftWing_['bodypart'][i].rotation.z);
        phoenix_leftWing_['fly_move1'].push(phoenix_leftWing_['fly_start1'][i]);
        phoenix_leftWing_['bow_move1'].push(phoenix_leftWing_['bow_start1'][i]);
        phoenix_leftWing_['fly_amounts1'].push(0);
        phoenix_leftWing_['bow_amounts1'].push(0);
      }                 
      phoenix_leftWing_['fly_end1']=[1.3436209309854577, 0.5043555072889204, 0.064029696695306, 0.11857884976716665, 0.20463094075386634, 0.210861801807999, 0.15021487520049584, 0.40589235983058647, 0.7977199727536788, 1.747323824426069];
      phoenix_leftWing_['bow_end1']=[Math.PI,0.7,1.6,phoenix_leftWing_.bow_start1[3]+0.5,phoenix_leftWing_['bow_start1'][4],phoenix_leftWing_['bow_start1'][5],phoenix_leftWing_['bow_start1'][6],phoenix_leftWing_['bow_start1'][7],phoenix_leftWing_['bow_start1'][8],phoenix_leftWing_['bow_start1'][9]];
      phoenix_leftWing_['fly_pointd']=[0.8436209309854577, -0.19564449271107953, -0.635970303304694, -0.4522174770277299, -0.09536905924613365, -0.889138198192001, -0.5497851247995041, -0.2941076401694135, -0.3522800272463211, 0.9973238244260689];
      phoenix_leftWing_['fly_pointu']=[0.3436209309854577, -0.2956444927110795, 0.6640296966953059, 0.14778252297227018, 0.7046309407538663, -0.18913819819200103, 0.15021487520049584, 0.6058923598305864, 0.5977199727536789, 0.9973238244260689];
      phoenix_leftWing_['t']=0;
      phoenix_leftWing_['fly_down']=true;
      getBoneCourse(phoenix_leftWing_,'fly');
      phoenix_leftWing_['bow_points1']=[phoenix_leftWing_['bow_start1'],phoenix_leftWing_['bow_end1']];
      phoenix_leftWing_['fly_t_vec1']=get_tvec(phoenix_leftWing_['fly_points1']);
      phoenix_leftWing_['bow_t_vec1']=get_tvec(phoenix_leftWing_['bow_points1']);
      phoenix_leftWing_['fly_range1']=0;
      phoenix_leftWing_['bow_range1']=0;
      phoenix_leftWing_['fly_move_speed']=0.045;
      phoenix_leftWing_['bow_move_speed']=0.02;
      phoenix_leftWing_['fly_change_course1']=getBoneCourse;
      phoenix_leftWing_['bow_change_course1']=invertPoints;
      return phoenix_leftWing_;
    }

    function mirrorMove(move,start,end,new_start) {
      var movelen=move.length;
      var new_move=[];
      for (var i=0; i<movelen; i++) {
        var d=move[i]-start[i];
        var point=new_start[i]+d;
        new_move.push(point);
      }
      return new_move;
    }

    function get_phoenix_right_wing(other_wing) {
      var phoenix_rightWing_={}
      phoenix_rightWing_['name']='Right wing';
      phoenix_rightWing_['bodypart']=[phoenix_model.getObjectByName('B_Right_Wing_0_079'),phoenix_model.getObjectByName('B_Right_Wing_1_080'),
                                                  phoenix_model.getObjectByName('B_Right_Wing_2_084'),phoenix_model.getObjectByName('B_Right_Wing_3_081'),
                                                  phoenix_model.getObjectByName('B_Right_Wing_4_082'),phoenix_model.getObjectByName('B_Right_Wing_5_083'),
                                                  phoenix_model.getObjectByName('B_Right_Wing_6_085'),phoenix_model.getObjectByName('B_Right_Wing_7_086'),
                                                  phoenix_model.getObjectByName('B_Right_Wing_8_087'),phoenix_model.getObjectByName('B_Right_Wing_9_068')];
      phoenix_rightWing_['fly_start1']=[];
      phoenix_rightWing_['bow_start1']=[];
      phoenix_rightWing_['start1']=[];
      phoenix_rightWing_['fly_move1']=[];
      phoenix_rightWing_['bow_move1']=[];
      phoenix_rightWing_['fly_amounts1']=[];
      phoenix_rightWing_['bow_amounts1']=[];
      for (var i=0; i<phoenix_rightWing_['bodypart'].length; i++) {
        phoenix_rightWing_['start1'].push(phoenix_rightWing_['bodypart'][i].rotation.y);
        phoenix_rightWing_['fly_start1'].push(phoenix_rightWing_['bodypart'][i].rotation.y);
        phoenix_rightWing_['bow_start1'].push(phoenix_rightWing_['bodypart'][i].rotation.y);
        phoenix_rightWing_['fly_move1'].push(phoenix_rightWing_['fly_start1'][i]);
        phoenix_rightWing_['bow_move1'].push(phoenix_rightWing_['fly_start1'][i]);
        phoenix_rightWing_['fly_amounts1'].push(0);
        phoenix_rightWing_['bow_amounts1'].push(0);
      }
      phoenix_rightWing_['fly_end1']=mirrorMove(other_wing['fly_end1'],other_wing['fly_start1'],other_wing['fly_end1'],phoenix_rightWing_['fly_start1']);
      phoenix_rightWing_['fly_pointd']=mirrorMove(other_wing['fly_pointd'],other_wing['fly_start1'],other_wing['fly_end1'],phoenix_rightWing_['fly_start1']);
      phoenix_rightWing_['fly_pointu']=mirrorMove(other_wing['fly_pointu'],other_wing['fly_start1'],other_wing['fly_end1'],phoenix_rightWing_['fly_start1']);
      phoenix_rightWing_['bow_end1']=phoenix_rightWing_.fly_pointd;
      phoenix_rightWing_['t']=0;
      phoenix_rightWing_['fly_points1']=null;
      phoenix_rightWing_['bow_points1']=[phoenix_rightWing_.bow_start1,phoenix_rightWing_.bow_end1];
      phoenix_rightWing_['fly_down']=true;
      getBoneCourse(phoenix_rightWing_,'fly');
      phoenix_rightWing_['fly_t_vec1']=get_tvec(phoenix_rightWing_['fly_points1']);
      phoenix_rightWing_['bow_t_vec1']=get_tvec(phoenix_rightWing_['bow_points1']);
      phoenix_rightWing_['fly_range1']=0;
      phoenix_rightWing_['bow_range1']=0;
      phoenix_rightWing_['fly_move_speed']=other_wing['fly_move_speed'];
      phoenix_rightWing_['bow_move_speed']=other_wing['bow_move_speed'];
      phoenix_rightWing_['fly_change_course1']=getBoneCourse;
      phoenix_rightWing_['bow_change_course1']=invertPoints;
      return phoenix_rightWing_;
    }


    function turn_and_go(direction,insideBall) {
      if (set_spittingFire) {
        setSpittingFire();
        setSpittingFireParam();
        set_spittingFire=false;
      }
      var left_right=direction=='left' || direction=='right';
      var up_down=direction=='up' || direction=='down';
      var dir=1;
      if (direction=='left' || direction=='down' || direction=='backwards') dir=-1;
      var amount=0.03;
      var phoenix_amount=0.03;
      var ytrans=-0.009;
      if (!left_right && !up_down) {
        amount=100;
      }
      amount*=dir*velocity;
      phoenix_amount*=dir;
      if (!insideBall) {
        phoenix_amount*=velocity;
        ytrans*=velocity*velocity;
      }
      var fire_amount=0.05;
      if (insideBall) {
        fire_amount=0.01;
      }
      if (direction=='right') {
        fire_amount*=-1;
      }
      var fire_trans=0.05;
      if (direction=='left') {
        fire_trans*=-1;
      }
      if ((left_right && Math.abs(phoenix['turn']+amount)>phoenix['turn_max']) || (up_down && Math.abs(phoenix['turnup']+amount)>phoenix['turnup_max'])) {
        phoenix_amount=0;
        ytrans=0;
        fire_amount=0;
        fire_trans=0;
      }
        if (left_right) {
          phoenix['turn']+=phoenix_amount;
          var inside_dir=1;
          if (insideBall) inside_dir=-1;
          fire_phoenix.rotateX(phoenix_amount*inside_dir);
          phoenix['fire_turn']+=fire_amount;
          spittingFire.rotateY(fire_amount);
          if (insideBall) {
            spittingFire.translateZ(fire_trans);
            phoenix['fire_trans']+=fire_trans;
          }
          if (!insideBall) {
            phoenix['box_turn']-=amount;
            phoenix_box.rotateY(-amount);
          }
          else {
            fire_phoenix.translateZ(phoenix_amount*20);
            fire_phoenix.translateY(ytrans);
          }
        }
        else if (up_down && !insideBall) {
          phoenix['turnup']+=phoenix_amount;
          phoenix_box.rotateZ(phoenix_amount);
        }
        else if (!insideBall) {
          phoenix['position']+=amount;
          phoenix_box.translateX(amount);
        }
        camera.updateProjectionMatrix();
    }
}

main();


function loaded_phoenix() {
  return phoenix!=undefined;
}


function invertVec(vec) {
  var new_vec=[];
  for (var i=vec.length-1; i>=0; i--) {
    new_vec.push(vec[i]);
  }
  return new_vec;
}

function interpolation(x0,x1,t0,t1,t) {
  return x0+(t-t0)/(t1-t0)*(x1-x0);
}

function changeFlySpeed(addSpeed) {
  for (var i=0; i<phoenix_whole.length; i++) {
    if (!Array.isArray(phoenix_whole[i])) {
      phoenix_whole[i]['fly_move_speed']+=addSpeed;
    }
    else {
      for (var j=0; j<phoenix_whole[i].length; j++) {
        phoenix_whole[i][j]['fly_move_speed']+=addSpeed;
      }
    }
  }
}

function setSpittingFire() {
  var cylinder = new THREE.CylinderBufferGeometry( 5, 10, 10);
  spittingFire = new THREE.Fire( cylinder, {
    textureWidth: 512,
    textureHeight: 512,
    debug: false
  } );
  spittingFire.name="spittingFire";      
  spittingFire.addSource( 0.5, 0.5, 0.1, 0.5, 0.4, 1.0 );
  setSpittingFireParam();
  spittingFire.castShadow=true;
  spittingFire.position.set(15,7,1);
  spittingFire.rotation.set(0,-0.27,-Math.PI/2+0.5);
  spittingFire_bounding_box=new THREE.BoundingBoxHelper(spittingFire);
  spittingFire_bounding_box.geometry.computeBoundingBox();
  spittingFire_bounding_box.update();
  spittingFire_bounding_box.visible=false;
  spittingFire.add(spittingFire_bounding_box);
}

function setSpittingFireParam() {
  spittingFire.color1.set(0xffffff);
  spittingFire.color2.set(0xffa000);
  spittingFire.color3.set(0x000000);
  spittingFire.windX=0.0;
  spittingFire.windY=0.75;
  spittingFire.colorBias=0.8;
  spittingFire.burnRate=1.2;
  spittingFire.diffuse=3.0;
  spittingFire.viscosity=0.0;
  spittingFire.expansion=0.0;
  spittingFire.swirl=6.0;
  spittingFire.drag=0.0;
  spittingFire.airSpeed=20.0;
  spittingFire.speed=500.0;
  spittingFire.massConservation=false;
}

function setPhoenixFire() {
  var cube = new THREE.BoxGeometry( 40, 60);
  phoenixFire = new THREE.Fire( cube, {
    textureWidth: 512,
    textureHeight: 512,
    debug: false
  } );
  phoenixFire.name="phoenixFire";
  phoenixFire.clearSources();    
  phoenixFire.addSource( 0.5, 0.5, 0.1, 0.5, 0.0, 1.0 );
  phoenixFire.color1.set(0xffffff);
  phoenixFire.color2.set(0xffa000);
  phoenixFire.color3.set(0x000000);
  phoenixFire.windX=0.0;
  phoenixFire.windY=0.75;
  phoenixFire.colorBias=0.8;
  phoenixFire.burnRate=1.2;
  phoenixFire.diffuse=3.0;
  phoenixFire.viscosity=0.0;
  phoenixFire.expansion=0.0;
  phoenixFire.swirl=6.0;
  phoenixFire.drag=0.0;
  phoenixFire.airSpeed=20.0;
  phoenixFire.speed=500.0;
  phoenixFire.massConservation=false;
  phoenixFire.castShadow=true;
  phoenixFire.rotation.y=Math.PI/2;
  phoenixFire.position.x=-17;
}

function back_to_starting_rot_pos() {
  spittingFire.rotateY(-phoenix['fire_turn']);
  spittingFire.translateZ(-phoenix['fire_trans']);
  fire_phoenix.position.set(0,0,0);
  fire_phoenix.rotation.set(0,0,0);
  phoenix_box.position.set(0,0,0);
  phoenix_box.rotation.set(0,0,0);
  phoenix['turn']=0;
  phoenix['turnup']=0;
  phoenix['fire_turn']=0;
  phoenix['fire_trans']=0;
  phoenix['position']=0;
  phoenix['box_turn']=0;
}

function updatePhoenixBoundingBoxes() {
  phoenix_bounding_box.geometry.computeBoundingBox();
  phoenix_bounding_box.update();
  if (done_k_press) {
    spittingFire_bounding_box.geometry.computeBoundingBox();
    spittingFire_bounding_box.update();
  }
}

pause_resume.onclick=function(event) {
  pause_onclick();
}

function pause_onclick() {
  fire_phoenix.visible=true;
  if (pause) {
    if (tutorial) {
      tutorial_click()
    }
    else if (commands) {
      commands_click();
    }
    else {   
      pause_plane.visible=false;
      pause_title.style.visibility="hidden";
      pause_tutorial.style.visibility="hidden";
      pause_commands.style.visibility="hidden";
      pause_resume.style.visibility="hidden";
      pause_exit.style.visibility="hidden";
      pause_version.style.visibility="hidden";
      pause_mute.style.visibility="hidden";
      music_range.style.visibility="hidden";
      music_change.style.visibility="hidden";
      soundEffects_range.style.visibility="hidden";
      soundEffects_change.style.visibility="hidden";
      if (middle_visible) {
        middle_message.style.visibility="visible";
      }
      pause=false;
    }  
  }
  else {
    if (tutorial) {
      tutorial_click();
    }
    if (commands) {
      commands_click();
    }
    pause_plane.visible=true;
    pause_title.style.visibility="visible";
    pause_tutorial.style.visibility="visible";
    pause_commands.style.visibility="visible";
    pause_resume.style.visibility="visible";
    pause_exit.style.visibility="visible";
    pause_version.style.visibility="visible";
    if (version=='full') {
      pause_mute.style.visibility="visible";
      music_range.style.visibility="visible";
      music_change.style.visibility="visible";
      soundEffects_range.style.visibility="visible";
      soundEffects_change.style.visibility="visible";
    }
    middle_message.style.visibility="hidden";
    pause=true;
  }
}


function restore_phoenix_t() {
  for (var i=0; i<phoenix_whole.length; i++) {
        if (!Array.isArray(phoenix_whole[i])) {
          phoenix_whole[i].t=0;
        }
        else {
          for (var j=0; j<phoenix_whole[i].length; j++) {
            phoenix_whole[i][j].t=0;
          }
        }
  }
}
