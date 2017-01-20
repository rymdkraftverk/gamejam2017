import { Core, Render, Entity, Timer, Key, Debug, Gamepad} from 'l1-lite';
import sprites from './sprites.json';

import Matter from 'matter-js'

import addPlayer from './entities/player.js'

var Engine = Matter.Engine;
var engine = Engine.create();
var World = Matter.World;
var Bodies = Matter.Bodies;
engine.world.gravity.y = 0;
Engine.run(engine);

Core.engine = engine;
Core.World = World;
Core.Bodies = Bodies;

Core.Render = Render;

import playerHandler from './entities/player-handler';
import controller from './entities/controller';

Render.createRenderer(600, 400, sprites).then(() => {
  Core.createCore();
  Core.start();
  Debug.initDebugTools();
  Key.add('up');
  Key.add('right');
  Key.add('down');
  Key.add('left');

  addPlayer(Core);

});


/*
  entity.behaviours['delete-move-y'] = {
    timer: Timer.create(300, (b, e) => {
      delete e.behaviours['move-y'];
    }),
    run: (b, e) => {
      const { timer } = b;
      if (timer){
        if (timer.run(b, e)){
          delete b.timer;
        }
      }
    }
  }
*/
