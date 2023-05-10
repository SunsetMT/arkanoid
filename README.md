# Arkanoid

### Repository Structure

babylon-core - Arkanoid Game Logic & Babylon Script \
react-ui - Arkanoid User Interface & Game Screens

### Install Dependencies

#### react-ui directory & babylon-core directory:
`npm i` or `npm i --legacy-peer-deps`

### Building Arkanoid App Using Terminal / Command Line & Node Script

**Important: Install All Dependencies First Using `npm i` In Every Project Directory**

`node build-arkanoid-app.js` - build babylon & copy build to react public folder\
`node build-arkanoid-app.js create-react-build` - everything above + build react\
`node build-arkanoid-app.js start-locally` - everything above + run app locally

### Building Arkanoid App Manually

#### babylon-core folder:
1) `npm run build`
2) Copy `babylon-core/dist/js/bundleName.js` to `react-ui/public/js`

#### react-ui folder:
1) `npm run build` - to create a build
2) `npm start` - to run app locally
