export interface Setting {
    name: string,
    key: string,
    type: 'input' | 'slider' | 'checkbox',
    value: number,
    minValue?: number,
    maxValue?: number,
    step?: number,
    advanced?: boolean
}

export const defaultSettings: Setting[] = [
    {
        name: 'Lives',
        key: 'lives',
        type: 'input',
        value: 3,
        minValue: 1,
        maxValue: 99
    },
    {
        name: 'Time',
        key: 'time',
        type: 'input',
        value: 60,
        minValue: 1,
        maxValue: 999
    },
    {
        name: 'Dur',
        key: 'durability',
        type: 'input',
        value: 3,
        minValue: 1,
        maxValue: 3
    },
    {
        name: 'Start Speed',
        key: 'startSpeed',
        type: 'input',
        value: 1,
        minValue: 0.1,
        maxValue: 10,
        step: 0.1
    },
    {
        name: 'Max Speed',
        key: 'maxSpeed',
        type: 'input',
        value: 3,
        minValue: 0.1,
        maxValue: 10,
        step: 0.1
    },
    {
        name: 'Rebound',
        key: 'rebound',
        type: 'slider',
        value: 0.75,
        minValue: 0.1,
        maxValue: 1.5,
        step: 0.05
    },
    {
        name: 'Paddle Size',
        key: 'paddleSize',
        type: 'slider',
        value: 1,
        minValue: 0.1,
        maxValue: 3,
        step: 0.1
    },
    {
        name: 'Speed Bonus',
        key: 'speedBonus',
        type: 'slider',
        value: 6,
        minValue: 1,
        maxValue: 10,
        step: 0.1
    },
    {
        name: 'Show Bonus',
        key: 'showBonus',
        type: 'checkbox',
        value: 0
    },
    {
        name: 'Advanced Gen',
        key: 'advancedGen',
        type: 'checkbox',
        value: 0
    },
    {
        name: 'Difficulty',
        key: 'difficulty',
        type: 'slider',
        value: 3,
        minValue: 1,
        maxValue: 5,
        step: 1,
        advanced: true
    },
    {
        name: 'Max',
        key: 'maxCubes',
        type: 'input',
        value: 60,
        minValue: 1,
        maxValue: 150,
        advanced: false
    },
    {
        name: 'Min',
        key: 'minCubes',
        type: 'input',
        value: 30,
        minValue: 1,
        maxValue: 150,
        advanced: false
    },
    {
        name: 'Bonus Chance',
        key: 'bonusChance',
        type: 'input',
        value: 0.1,
        minValue: 0.1,
        maxValue: 1,
        step: 0.1,
        advanced: false
    },
    {
        name: 'Bonus Count',
        key: 'bonusCount',
        type: 'input',
        value: 5,
        minValue: 1,
        maxValue: 150,
        advanced: false
    },
    {
        name: 'Db Chance',
        key: 'debuffChance',
        type: 'input',
        value: 0.1,
        minValue: 0,
        maxValue: 1,
        step: 0.1,
        advanced: false
    },
    {
        name: 'Db Count',
        key: 'debuffCount',
        type: 'input',
        value: 5,
        minValue: 1,
        maxValue: 150,
        advanced: false
    }
]
