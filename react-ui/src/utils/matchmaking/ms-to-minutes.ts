export const msToMinutes = (ms: number) => {
    const portions: string[] = [];
    const msInMinute = 60 * 1000;

    const minutes = Math.trunc(ms / msInMinute);
    portions.push(minutes.toString());
    ms -= minutes * msInMinute;

    const seconds = Math.trunc(ms / 1000);
    portions.push(seconds > 9 ? seconds.toString() : `0${seconds}`);

    return portions.join(':');
}
