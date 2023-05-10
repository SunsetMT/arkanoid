// make sure that client side has all necessary message type listeners
export enum MESSAGE_TYPE {
    // sender - client
    PLAYER_READY = 'player_ready',
    GAME_OVER = 'game_over',
    //GAME_PAUSED = 'game_paused',
    //GAME_RESUMED = 'game_resumed',
    PLAYER_PADDLE_INPUT = 'player_paddle_input',
    PLAYER_BALL_RELEASED = 'player_ball_released',
    PLAYER_GAME_RESULT = 'player_game_result',
    GAME_EVENT = 'game_event',
    // sender - server
    INFO = 'info',
    TIMER = 'timer',
    CLIENTS = 'clients',
    GAME_RESULT = 'game_result',
    HOST_ROOM_CONFIG = 'host_room_config',
    OPPONENT_PADDLE_INPUT = 'opponent_paddle_input',
    OPPONENT_BALL_RELEASED = 'opponent_ball_released',
    OPPONENT_GAME_EVENT = 'opponent_game_event',
}
