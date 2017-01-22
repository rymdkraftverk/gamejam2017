import { Gamepad, Render, Key, Entity, Timer, Core } from 'l1-lite';
import waitingForPlayers from './waiting-for-players'
import enterCode from './enter-code'
import evilCode from './evil-code'
import qs from 'query-string';

// consts
const allowed = ['initPhase', 'input', 'waiting-for-players', 'playerHandler']
const codeKeys = ['h', 'j', 'k', 'l', '0', '1', '2', '3']
const kbcode = {
  h: 'r', j: 'g', k: 'b', l: 'y'
}
const padcode = {
  0: 'g', 1: 'r', 2: 'b', 3: 'y'
}

// pure
const behaviorize = run => ({ run })

const transition = (e, from, to) => {
  delete e.behaviours[from]
  e.behaviours[to] = eval(to)
}

// filthy
const initState = () => {
  const q = qs.parse(window.location.search);
  return q.state || 'waiting'
}

const controllerIds = () => {
  return Core.get('input')
  .controllerIds()
  .concat(['keyboard']) // remove to disable keyboard
}

const anounceEvil = code => {
}

const spawnEvil = cid => {
  const kid = getArbitraryNumberInsteadOfSensibleControllerIdForKeyboard(cid)
  const e = Core.getEntities()
  const players = disabled.filter(e => e.type == 'player')
  const evil = players.filter(e => e.controllerId == kid)
  if(!evil || !evil.length) throw new Error('No evil found')
  if(evil.length != 1) throw new Error('Too much evil found')
  evil[0].alignment = 'evil'
  Core.evilId = evil[0].id;
}

const disable = () => {
  const entities = Core.getEntities()
  entities.forEach(e => {
    if(!allowed.includes(e.id)) {
      Core.remove(e)
      disabled.push(e)
    }
  })
  return disabled
}

const enable = () => {
  disabled.forEach(e => {
    Core.add(e)
  })
  disabled.length = 0
}

const getArbitraryNumberInsteadOfSensibleControllerIdForKeyboard = id => {
  return id == 'keyboard' ? '4': id
}

// states
const waiting = {
  delay: 30,
  complete: () => {
    const count = controllerIds().length
    return readyPlayers.length == count
  },
  init: (b, e) => {
    console.log('waiting...')
    waitingForPlayers();
    disable()

    Core.get('input')
    .addClickListener('ready', (cid, btn) => {
      if(!readyPlayers.includes(cid)) {
        readyPlayers.push(cid)

        Core.get('waiting-for-players')
        .behaviours['add-player'].add(cid)
      }
    })
  },
  run: (b, e) => {
    disable()
    if(b.complete()) {
      b.delay--
      if(b.delay <= 0) {
        Core.get('waiting-for-players').destroy()
        transition(e, 'waiting', 'registration')
      }
    }
  }
}

const registration = {
  codeLength: 4,
  complete: (b, e) => {
    return Object.keys(e.codes)
    .map(k => e.codes[k].length == b.codeLength)
    .reduce((p, c) => p && c)
  },
  init: (b, e) => {
    console.log('registering')
    const prompt = enterCode()

    // clear codes
    e.codes = {}
    controllerIds()
    .forEach(id => {
      e.codes[id] = []
    })

    Core.get('input')
    .addClickListener('codeclick', (cid, btn) => {
      if(codeKeys.includes(btn)) {
        // console.log(`[CODE KEY]: cid: ${cid}, btn: ${btn}`)
        const code = e.codes[cid]
        if(code.length < b.codeLength) {
          code.push(btn)
          // prompt.addKey(cid)
        }
        // console.log(`[CODE]: ${code} (cid: ${cid})`)
        if(b.complete(b, e)) {
          Core.get('input')
          .removeClickListener('codeclick')

          prompt.destroy()

          transition(e, 'registration', 'reveal')
        }
      }
    })
  },
  run: () => {}
}

const reveal = {
  delay: 120,
  pick: (codes) => {
    const controllers = Object.keys(codes)
    const i = Math.floor(Math.random() * controllers.length)
    const k = controllers[i]
    const c = codes[k]
    return {
      cid: k,
      code: c
    }
  },
  init: (b, e) => {
    console.log('revealing')
    const p = b.pick(e.codes)

    let map = p.cid == 'keyboard' ? kbcode: padcode
    const rgbyCode = p.code.map(k => map[k])
    console.log(`[REVEAL] Player with code [${rgbyCode}] is EVIL`)
    b.evilSign = evilCode(rgbyCode)

    spawnEvil(p.cid)
  },
  run: (b, e) => {
    b.delay--
    if(b.delay <= 0) {
      b.evilSign.destroy()
      transition(e, 'reveal', 'finished')
    }
  }
}

const finished = {
  init: (b, e) => {
    console.log('finished!')
  },
  run: (b, e) => {
    enable()
  }
}

// shitty state
const disabled = []
const codes = []
const readyPlayers = []

// init
const phase = Entity.create('initPhase');
transition(phase, null, initState())

// export
export default phase
