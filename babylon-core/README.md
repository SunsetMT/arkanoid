# Arkanoid Babylon v5

## Project setup
1. Run `npm install`
2. To generate build `npm run build`
3. To start project `npm run start`


## To load game with React
1. Start downloading script
2. Watch `isInitReady` key in `localStorage`
3. Use global function `init(cubesMap?)`
4. Watch `isGameReady` key in `localStorage`
5. When `isGameReady` value equals 'true' you can use global funtion startGame() it will render scene and add event listeners to window

## Global functions
1. `init(cubesMap?)` Init game with specified map or generate random map
1. `startGame()` Start game after downloading and initializing
2. `forceGameOver()` Force game over and send results to localStorage
3. `reBuildGame(cubesMap?)` Force board update with optional param cubesMap

## localStorage
1. `cubesMap` is map of board use it to generate game. Example: `reBuildGame(JSON.parse(localStorage.getItem('cubesMap')))`
2. `gameMode` can be switched between `single` and `multiplayer` values
3. `playerBallReleased` is `true` after player shoot ball, becomes `false` after player lose ball
4. `opponentBallReleased` is `true` after opponent shoot ball, becomes `false` after opponent lose ball