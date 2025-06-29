const subprocess = require('child_process');
const fs = require('fs');
const path = require('path');

const webpack = require('webpack');

const pngjs = require('pngjs').PNG.sync;

/**
 * @type {webpack.RawLoaderDefinition}
 */
module.exports = function loader() {

    /**
     * @typedef {Object} TypeColorswap A swap of two colors.
     * @property {Array<number>} TypeColorswap.source The source color to swap from (in rgba).
     * @property {Array<number>} TypeColorswap.target The target color to swap to (in rgba).
     * @private
     */

    /**
     * @typedef {Object} TypeOptions The options for the loader.
     * @property {string} TypeOptions.aseprite The path to the Aseprite executable.
     * @property {Object} [TypeOptions.prepare] The options for the Aseprite CLI.
     * @property {('colums' | 'horizontal' | 'packed' | 'rows' | 'vertical')} [TypeOptions.prepare.sheet] The output sheet type ('rows' by default).
     * @property {boolean} [TypeOptions.prepare.trim] The 'trim cels' option (false by default).
     * @property {Object} [TypeOptions.processing] The options for processing the output files.
     * @property {Array<TypeColorswap>} [TypeOptions.processing.colorswap] The swaps of colors.
     * @private
     */

    const context = /** @type {webpack.LoaderContext<TypeOptions>} */(this);

    const file = context.resourcePath;
    const options = context.getOptions();
    const aseprite = options.aseprite;
    const prepare = options.prepare;
    const processing = options.processing;

    try {

        require.resolve('@theatrejs/plugin-aseprite');
    }

    catch ($error) {

        throw $error;
    }

    try {

        const location = path.dirname(file);
        const filename = path.basename(file, '.aseprite');
        const sourceTexture = filename + '.png';
        const sourceData = filename + '.json';

        if (fs.existsSync(path.resolve(location, sourceTexture)) === false
        || fs.existsSync(path.resolve(location, sourceData)) === false
        || fs.statSync(path.resolve(location, sourceTexture)).mtime < fs.statSync(file).mtime
        || fs.statSync(path.resolve(location, sourceData)).mtime < fs.statSync(file).mtime) {

            if (typeof aseprite === 'undefined') {

                throw new Error('Aseprite executable path is missing in the loader options.');
            }

            if (fs.existsSync(aseprite) === false) {

                throw new Error('Aseprite executable not found reading path: ' + (typeof aseprite !== 'undefined' || aseprite !== '' ? '\'' + aseprite + '\'' : '<empty>') + '.');
            }

            const trim = (typeof prepare !== 'undefined' && prepare.trim === true) ? ' --trim' : '';
            const sheetType = (typeof prepare !== 'undefined' && ['colums', 'horizontal', 'packed', 'rows', 'vertical'].indexOf(prepare.sheet) !== -1) ? prepare.sheet : 'rows';

            subprocess.execSync(

                'cd "' + location + '"' +

                ' && "' + aseprite  + '"' +
                ' --batch "' + file + '"' +
                trim +
                ' --sheet "' + sourceTexture + '"' +
                ' --sheet-type ' + sheetType +
                ' --split-tags' +
                ' --data "' + sourceData + '"' +
                ' --list-tags' +
                ' --format json-array' +
                ' --filename-format {tag}#{tagframe001}@{title}.{extension}'
            );

            if (typeof processing !== 'undefined'
            && Array.isArray(processing.colorswap)
            && processing.colorswap.length > 0) {

                const bufferSource = fs.readFileSync(path.resolve(location, sourceTexture));
                const image = pngjs.read(bufferSource);

                const pixels = image.data;
                const height = image.height;
                const width = image.width;

                processing.colorswap.forEach(({source, target}) => {

                    const [redSource, greenSource, blueSource, alphaSource] = source;
                    const [redTarget, greenTarget, blueTarget, alphaTarget] = target;

                    for (let y = 0; y < height; y += 1) {

                        for (let x = 0; x < width; x += 1) {

                            const index = (width * y + x) * 4;

                            const indexRed = index;
                            const indexGreen = index + 1;
                            const indexBlue = index + 2;
                            const indexAlpha = index + 3;

                            if (pixels[indexRed] === redSource
                            && pixels[indexGreen] === greenSource
                            && pixels[indexBlue] === blueSource
                            && pixels[indexAlpha] === alphaSource) {

                                pixels[indexRed] = redTarget;
                                pixels[indexGreen] = greenTarget;
                                pixels[indexBlue] = blueTarget;
                                pixels[indexAlpha] = alphaTarget;
                            }
                        }
                    }
                });

                const bufferTarget = pngjs.write(image);
                fs.writeFileSync(path.resolve(location, sourceTexture), bufferTarget);
            }
        }

        return (

            'import {Aseprite} from \'@theatrejs/plugin-aseprite\';' +

            'import data from \'./' + sourceData + '\';' +
            'import texture from \'./' + sourceTexture + '\';' +

            'export default new Aseprite(texture, data);'
        );
    }

    catch ($error) {

        throw $error;
    }
};

module.exports.raw = true;
