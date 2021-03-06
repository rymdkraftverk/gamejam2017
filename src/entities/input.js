import { Entity, Key, Gamepad } from 'l1';

const buttons = {
  gamepad: [
    {
      i: '0',
      btn: 'green',
    },
    {
      i: '1',
      btn: 'blue',
    },
    {
      i: '2',
      btn: 'red',
    },
    {
      i: '3',
      btn: 'yellow',
    },
  ],
  // keys: ['up', 'down', 'left', 'right', 'space', 'g', 'h', 'j', 'k', 'l'],
};

const entity = Entity.create('input');

// entity.registerKeys = () => buttons.keys.forEach(Key.add);
entity.addClickListener = (id, l) => {
  entity
    .behaviors.click
    .listerners
    .set(id, l);
};

entity.removeClickListener = (id) => {
  entity
    .behaviors.click
    .listerners
    .delete(id);
};

entity.behaviors['scan-for-gamepads'] = {
  run: () => {
    Gamepad.run();
  },
};

entity.behaviors.click = {
  listerners: new Map(),
  tracker: {},
  init: (b, e) => {
    e.eachBtn((cid) => {
      b.tracker[cid] = {};
    });
  },
  run: (b, e) => {
    e.eachBtn((cid, btn) => {
      const pad = cid !== 'keyboard';
      if (pad) btn = btn.i;
      const pressedLast = b.tracker[cid][btn];

      const pressedNow = pad ? Gamepad.isPressed(cid, Number(btn)) : Key.isDown(btn);

      // click has occured
      if (pressedLast && !pressedNow) {
        // console.log(`[CLICK] source: ${cid}, button: ${btn}`)
        b.listerners.forEach(l => {
          l(cid, btn);
        });
      }

      b.tracker[cid][btn] = pressedNow;
    });
  },
};

entity.controllerIds = () => {
  const pads = Gamepad.getL1Controllers();
  return pads ? Object.keys(pads) : [];
};

entity.eachBtn = (action) => {
  const cids = entity.controllerIds();
  cids.forEach(cid => {
    buttons.gamepad.forEach(btn => {
      action(cid, btn);
    });
  });

  // buttons.keys.forEach(btn => {
  //   action('keyboard', btn);
  // });
};

export default entity;
