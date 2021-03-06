/**
 * Build style entry of all components
 */

const fs = require('fs-extra');
const path = require('path');
const components = require('./get-components')();
const dependencyTree = require('dependency-tree');

components.forEach(componentName => {
  const libDir = path.resolve(__dirname, '../../lib');
  const content = analyzeDependencies(componentName, libDir).map(component => `require('../../vant-css/${component}.css');`);
  fs.outputFileSync(path.join(libDir, componentName, './style/index.js'), content.join('\n'));
});

// Analyze component dependencies
function analyzeDependencies(componentName, libDir) {
  const checkList = ['base'];
  search(dependencyTree({
    directory: libDir,
    filename: path.resolve(libDir, componentName, 'index.js'),
    filter: path => path.indexOf('vant/lib/') !== -1
  }), checkList);
  return checkList.filter(component => checkComponentHasStyle(component));
}

function search(tree, checkList) {
  tree && Object.keys(tree).forEach(key => {
    search(tree[key], checkList);
    const component = key.split('/vant/lib/')[1].replace('/index.js', '').replace('mixins/', '');
    if (checkList.indexOf(component) === -1) {
      checkList.push(component);
    }
  });
}

function checkComponentHasStyle(componentName) {
  return fs.existsSync(path.join(__dirname, '../../lib/vant-css/', `${componentName}.css`));
}
