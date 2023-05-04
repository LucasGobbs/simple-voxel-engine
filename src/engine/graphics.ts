/*global document*/

import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import { WEBGL } from '../utils/webgl';
import { CharacterController } from '../entities/character_controller';
import { ThirdPersonCamera } from '../third_person_camera';
import { PointerLockControls } from './pointer';
import { Input } from './input';
const input = new Input();
declare var document: any;
declare var window: any;

// /addons/controls/OrbitControls.js';
export class Graphics{
  public threeInstance: THREE.WebGLRenderer;
  public camera: THREE.PerspectiveCamera;
  public cameraHolder: any;
  public scene: THREE.Scene;
  public stats: any;
  public controls: any;
  public charControls: any;
  constructor() { }

  public addLight(x: number, y: number, z: number) {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(x, y, z);
    this.scene.add(light);
  }
  init() {
    if (!WEBGL.isWebGL2Available()) throw Error("WebGL not found"); 
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xb0faff);
    this.initThree();
    this.initCamera();
    // this.controls = new OrbitControls(this.camera, this.threeInstance.domElement);
    this.controls = new PointerLockControls(this.camera, this.threeInstance.domElement);
    const blocker = document.getElementById( 'blocker' )!;
		const instructions = document.getElementById( 'instructions' )!;

    instructions.addEventListener( 'click',  ()=> {

      this.controls.lock();

    } );

    this.controls.addEventListener( 'lock', ()=> {

      instructions.style.display = 'none';
      blocker.style.display = 'none';

    } );

    this.controls.addEventListener( 'unlock', ()=> {

      blocker.style.display = 'block';
      instructions.style.display = '';

    } );
    return true;
  }

  get Scene() {
    return this.scene;
  }

  get Camera() {
    return this.camera;
  }

  private initThree() {
    this.threeInstance = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      precision: "lowp", //highp", "mediump" or "lowp"
      powerPreference: "low-power", //"high-performance", "low-power" or "default"
  });
    
    this.threeInstance.setPixelRatio(window.devicePixelRatio);
    this.threeInstance.setSize(window.innerWidth, window.innerHeight);

    const target = document.getElementById('target');
    if (!target) throw Error("Target not found"); 
    target.appendChild(this.threeInstance.domElement);

    this.stats = Stats();
    target.appendChild(this.stats.dom);

    window.addEventListener('resize', () => {
      this.onWindowResize();
    }, false);
  }

  private initCamera() {
    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 0.1;
    const far = 300.0;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(10, 9, 25);
    // this.camera.zoom = 100.0
    const color = 0xFF0000;  // white
    this.scene.fog = new THREE.Fog(0xb0faff, 0.15, 300);
      //new THREE.FogExp2(0xb0faff, 0.0085);

    // this.charControls = new CharacterController({
    //   camera: this.camera,
    //   scene: this.scene,
    // });

    // this.cameraHolder = new ThirdPersonCamera({
    //   camera: this.camera,
    //   target: this.controls,
    // });
  }

  public Render(_timeInSeconds: number) {
    // const delta = this.charControls.Update(_timeInSeconds);
    // this.controls.target = this.charControls.position;
    // this.camera.position.add(delta);
    let frontalSpeed = 40 * _timeInSeconds;
    let frontalMultiplier = 1.0;
    if (input.keys.shift) frontalMultiplier = 3;

    let lateralSpeed = 15 * _timeInSeconds;

    

    if (input.keys.forward) 
      this.controls.moveForward(frontalSpeed * frontalMultiplier);
    
    if (input.keys.backward) 
      this.controls.moveForward(-frontalSpeed * frontalMultiplier);
    
    if (input.keys.right) 
      this.controls.moveRight(lateralSpeed * frontalMultiplier);
    
    if (input.keys.left) 
      this.controls.moveRight(-lateralSpeed * frontalMultiplier);
    
    if (input.keys.space) 
      this.controls.moveUp(frontalSpeed * frontalMultiplier);
    
    if (input.keys.control) 
      this.controls.moveUp(-frontalSpeed * frontalMultiplier);
    // this.controls.update()
    // this.cameraHolder.Update(_timeInSeconds);
    this.threeInstance.render(this.scene, this.camera);
    this.stats.update();
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.threeInstance.setSize(window.innerWidth, window.innerHeight);
  }
}
