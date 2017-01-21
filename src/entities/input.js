import { Core, Render, Entity, Key, Gamepad} from 'l1-lite';

const buttons = {
  gamepad: [
    {
      i: '0',
      btn: 'green'
    },
    {
      i: '1',
      btn: 'blue'
    },
    {
      i: '2',
      btn: 'red'
    },
    {
      i: '3',
      btn: 'yellow'
    }
  ],
  keys: ['up', 'down', 'left', 'right', 'space', 'g', 'h', 'j', 'k', 'l']
}

const controllerIds = () => {
  const pads = Gamepad.getGamepads()
  return pads ? Object.keys(pads) : []
}

const entity = Entity.create('input');

entity.registerKeys = () => buttons.keys.forEach(Key.add)
entity.addClickListener = (id, l) => {
  entity
  .behaviours['click']
  .listerners
  .set(id, l)
}

entity.removeClickListener = (id) => {
  entity
  .behaviours['click']
  .listerners
  .delete(id)
}

entity.behaviours['scan-for-gamepads'] = {
  run: (b, e) => {
    Gamepad.run();
  }
}

entity.behaviours['click'] = {
  listerners: new Map(),
  tracker: {},
  init: (b, e) => {
    e.eachBtn((cid, btn) => {
      b.tracker[cid] = {}
    })
  },
  run: (b, e) => {
    e.eachBtn((cid, btn) => {
      const pressedLast = b.tracker[cid][btn]
      const pressedNow = Gamepad.isPressed(cid, btn) || Key.isDown(btn)

      // click has occured
      if(pressedLast && !pressedNow) {
        // console.log(`[CLICK] source: ${cid}, button: ${btn}`)
        b.listerners.forEach(l => {
          l(cid, btn)
        })
      }

      b.tracker[cid][btn] = pressedNow
    })
  }
}

entity.eachBtn = (action) => {
  const cids = controllerIds()
  cids.forEach(cid => {
    buttons.gamepad.forEach(btn => {
      action(cid, btn.btn)
    })
  })

  buttons.keys.forEach(btn => {
    action('keys', btn)
  })
}

export default entity;