const {spawn} = require('child_process');
const EventEmitter = require('events');
const path = require('path');

const emitter = new EventEmitter();

const handleProcessErrors = (process) => {
    process.stderr.on('data', data => console.error(data.toString()));
    process.on('error', (e) => console.error(`Process failed:\n ${e}`));
};

const handleProcessEnd = (process, successMessage, successEventName) => {
    process.on('close', (errorCode) => {
        if (errorCode) {
            console.error(`Process failed to finish and exited with code ${errorCode}`);
        } else {
            console.info(successMessage);
            emitter.emit(successEventName);
        }
    });
};

const commands = {
    npmCommand: /^win/.test(process.platform) ? 'npm.cmd' : 'npm',
    copyScriptCommand: /^win/.test(process.platform) ? 'copy' : 'cp',
    createReactBuild: 'create-react-build',
    startLocally: 'start-locally'
}

const [, , argument] = process.argv;

const babylonPath = path.normalize('./babylon-core/');
const reactPath = path.normalize('./react-ui/');

const buildBabylonOptions = ['--prefix', babylonPath, 'run', 'build'];
const buildReactOptions = ['--prefix', reactPath, 'run', 'build'];
const startReactOptions = ['--prefix', reactPath, 'start'];

const sourcePath = path.normalize('./babylon-core/dist/js/bundleName.js');
const targetPath = path.normalize('./react-ui/public/js/bundleName.js');
const copyScriptOptions = [sourcePath, targetPath];

// build Babylon
const buildBabylonProcess = spawn(commands.npmCommand, buildBabylonOptions);
console.info('Building Babylon...');

handleProcessErrors(buildBabylonProcess);
handleProcessEnd(buildBabylonProcess, 'Babylon build finished successfully', 'babylon-build-ready');

emitter.on('babylon-build-ready', () => {
    // copy Babylon bundle to React App
    const copyScriptProcess = spawn(commands.copyScriptCommand, copyScriptOptions, {shell: /^win/.test(process.platform)});
    console.info(`Copying build...`);

    handleProcessErrors(copyScriptProcess);
    handleProcessEnd(copyScriptProcess, 'Babylon build copied successfully', 'build-copy-ready');
});

emitter.on('build-copy-ready', () => {
    console.log("Yes");
    console.log(argument);
    switch (argument) {
        case commands.createReactBuild:
            // build React App
            const buildReactProcess = spawn(commands.npmCommand, buildReactOptions);
            console.info(`Building React App...`);

            handleProcessErrors(buildReactProcess);
            handleProcessEnd(buildReactProcess, 'React build finished successfully', 'react-build-ready');
            break;
        case commands.startLocally:
            // start React app on localhost
            const runReactLocally = spawn(commands.npmCommand, startReactOptions);
            console.info(`Starting React App...`);

            handleProcessErrors(runReactLocally);
            break;
        default:
            // TODO: fix
            const runReactLocally1 = spawn(commands.npmCommand, startReactOptions);
            console.info(`Starting React App...`);

            handleProcessErrors(runReactLocally1);
            break;
    }
});

emitter.on('react-build-ready', () => {
    console.info(`Arkanoid App build is ready and can be found in ${reactPath}build`);
});

