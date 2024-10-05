const subprocess = require('child_process');
const fs = require('fs');
const path = require('path');

const webpack = require('webpack');

/**
 * @type {webpack.RawLoaderDefinition}
 */
module.exports = function loader() {

    /**
     * @typedef {Object} typeoptions Options for the loader.
     * @property {(string | undefined)} typeoptions.aseprite The path of the Aseprite executable.
     * @private
     */

    const context = /** @type {webpack.LoaderContext<typeoptions>} */(this);

    const file = context.resourcePath;
    const options = context.getOptions();
    const aseprite = options.aseprite;

    try {

        require.resolve('@theatrejs/plugin-aseprite');
    }

    catch (error) {

        throw error;
    }

    if (typeof aseprite === 'undefined') {

        throw new Error('Aseprite executable path is missing in the loader options.');
    }

    if (fs.existsSync(aseprite) === false) {

        throw new Error('Aseprite executable not found reading path: ' + (typeof aseprite !== 'undefined' || aseprite !== '' ? '\'' + aseprite + '\'' : '<empty>') + '.');
    }

    const location = path.dirname(file);
    const filename = path.basename(file, '.aseprite');
    const png = filename + '.png';
    const json = filename + '.json';

    try {

        subprocess.execSync(

            'cd "' + location + '"' +

            ' && "' + aseprite  + '"' +
            ' --batch "' + file + '"' +
            ' --sheet "' + png + '"' +
            ' --sheet-type rows' +
            ' --split-tags' +
            ' --data "' + json + '"' +
            ' --list-tags' +
            ' --format json-array' +
            ' --filename-format {tag}#{tagframe001}@{title}.{extension}'
        );

        return (

            'import {Aseprite} from \'@theatrejs/plugin-aseprite\';' +

            'import texture from \'./' + png + '\';' +
            'import data from \'./' + json + '\';' +

            'export default new Aseprite(texture, data);'
        );
    }

    catch (error) {

        throw error;
    }
};

module.exports.raw = true;
