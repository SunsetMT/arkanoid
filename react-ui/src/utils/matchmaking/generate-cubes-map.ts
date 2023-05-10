export const generateCubesMap = (cubesMap: [] = []) => {
    const initGame = () => {
        // @ts-ignore
        global.init(cubesMap);
        window.removeEventListener('initReady', initGame);
    }
    if (localStorage.getItem('isInitReady') === 'true') {
        initGame();
    } else {
        window.addEventListener('initReady', initGame);
    }
};

