export enum EVENT_TYPE {
    PADDLE_POSITION = 'paddlePositionX',
    PLAYER_INFO = 'playerInfo',
    BALL_RELEASED = 'ballReleased',
    FORFEIT = 'Forfeit',
    GAME_EVENT = 'gameEvent',
    // opponent game event - receive
    DISPOSE_BLOCK = 'Block',
    CHANGE_MATERIAL = 'changeMaterial',
    DISPOSE_BALL = 'Ball',
    ENABLE_GUN = 'gun',
    MINUS_SIZE = 'minusSize',
    PLUS_SIZE = 'plusSize',
    SUPER_BALL = 'superBall',
    ENERGY_BALL = 'energyBall',
    SPAWN_BALL = 'spawnBall',
    BALL_POSITION = 'ballPosition',
    // opponent game event - dispatch
    DISPATCH_DISPOSE_BLOCK = 'disposeBlock',
    DISPATCH_CHANGE_MATERIAL = 'opponentChangeMaterial',
    DISPATCH_DISPOSE_BALL = 'disposeBall',
    DISPATCH_ENABLE_GUN = 'opponentGun',
    DISPATCH_MINUS_SIZE = 'opponentMinusSize',
    DISPATCH_PLUS_SIZE = 'opponentPlusSize',
    DISPATCH_SUPER_BALL = 'opponentSuperBall',
    DISPATCH_ENERGY_BALL = 'opponentEnergyBall',
    DISPATCH_SPAWN_BALL = 'opponentSpawnBall',
    DISPATCH_BALL_POSITION = 'opponentBallPosition'
}
