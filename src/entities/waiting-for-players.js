import { Core, Render, Entity, Timer, Key, Debug, Gamepad} from 'l1-lite';

export default () => {
  const waitingForPlayersEntity = Entity.create('waiting-for-players')
  waitingForPlayersEntity.sprite = Render.getSprite('waiting-for-players')
  waitingForPlayersEntity.type = 'waiting-for-players'
  const { sprite } = waitingForPlayersEntity

  sprite.width = 515
  sprite.height = 162
  sprite.anchor.x = 0
  sprite.anchor.y = 0
  sprite.scale.x = 1.5
  sprite.scale.y = 1.5
  sprite.position.x = 455
  sprite.position.y = 20

  let newPlayers = 0
  let currentPlayers = 0
  let playerSprites = []

  waitingForPlayersEntity.behaviours['add-player'] = {
    add: (newPlayer) => {
      newPlayers++
    },
    run: (b, e) => {
      if (newPlayers > 0){
        const newPlayerEntity = Entity.create('waiting-for-player-player-' + currentPlayers)
        newPlayerEntity.sprite = Render.getSprite('lizard1')
        newPlayerEntity.type = 'waiting-for-player-player'
        newPlayerEntity.sprite.width = 12
        newPlayerEntity.sprite.height = 13
        newPlayerEntity.sprite.anchor.x = 0
        newPlayerEntity.sprite.anchor.y = 0
        newPlayerEntity.sprite.scale.x = 5
        newPlayerEntity.sprite.scale.y = 5
        newPlayerEntity.sprite.position.x = 500 + (currentPlayers * 180)
        newPlayerEntity.sprite.position.y = 170

        Render.add(newPlayerEntity.sprite)
        newPlayers--
        currentPlayers++
        playerSprites = playerSprites.concat(newPlayerEntity.sprite)
      }
    }
  }

  waitingForPlayersEntity.destroy = () => {
    playerSprites.forEach(ps => {
      Render.remove(ps)
    })

    Render.remove(waitingForPlayersEntity.sprite)
    Core.remove(waitingForPlayersEntity)
  }

  Render.add(sprite)
  Core.add(waitingForPlayersEntity)
}