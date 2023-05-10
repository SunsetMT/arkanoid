export const unsetGameResultProps: gameProperties = {
    timeLeft: -1,
    playerBlocks: -1,
    playerLives: -1,
    playerScore: -1,
    opponentBlocks: -1,
    opponentLives: -1,
    opponentScore: -1
};

export interface gameProperties {
    timeLeft: number,
    playerBlocks: number,
    playerLives: number,
    playerScore: number,
    opponentBlocks: number,
    opponentLives: number,
    opponentScore: number
}

export const gameResultProps = () => {
    // checks if all game result properties are saved in localStorage
    const gameResultKeys = Object.keys(unsetGameResultProps);
    return gameResultKeys.filter(key => Object.keys(localStorage).includes(key)).length === gameResultKeys.length
        // gets and assigns values from localStorage
        ? gameResultKeys.reduce((gameProperties, propertyKey) => {
            return {...gameProperties, [propertyKey]: +localStorage.getItem(propertyKey)!}
        }, unsetGameResultProps)
        // returns an object of unset (invalid) game result properties
        : unsetGameResultProps;
}
