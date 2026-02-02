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
     * @property {boolean} [TypeOptions.constants] The option for generating the constants files with all the Aseprite animation tags.
     * @property {Object} [TypeOptions.prepare] The options for the Aseprite CLI.
     * @property {('columns' | 'horizontal' | 'packed' | 'rows' | 'vertical')} [TypeOptions.prepare.sheet] The output sheet type ('rows' by default).
     * @property {boolean} [TypeOptions.prepare.trim] The 'trim cels' option (false by default).
     * @property {Object} [TypeOptions.processing] The options for processing the output files.
     * @property {Array<TypeColorswap>} [TypeOptions.processing.colorswap] The swaps of colors.
     * @private
     */

    /**
     * @typedef {Object} TypeAseprite An Aseprite JSON data.
     * @property {Array<TypeAsepriteFrame>} TypeAseprite.frames The Aseprite JSON frames data.
     * @property {TypeAsepriteMeta} TypeAseprite.meta The Aseprite JSON meta data.
     * @private
     */

    /**
     * @typedef {Object} TypeAsepriteFrame An Aseprite JSON frame data.
     * @property {number} TypeAsepriteFrame.duration The duration.
     * @property {string} TypeAsepriteFrame.filename The file name.
     * @property {Object} TypeAsepriteFrame.frame The frame.
     * @property {number} TypeAsepriteFrame.frame.x The x position of the frame.
     * @property {number} TypeAsepriteFrame.frame.y The y position of the frame.
     * @property {number} TypeAsepriteFrame.frame.w The width of the frame.
     * @property {number} TypeAsepriteFrame.frame.h The height of the frame.
     * @property {boolean} TypeAsepriteFrame.rotated The rotated status.
     * @property {Object} TypeAsepriteFrame.spriteSourceSize The sprite source size.
     * @property {number} TypeAsepriteFrame.spriteSourceSize.x The x position of the sprite source.
     * @property {number} TypeAsepriteFrame.spriteSourceSize.y The y position of the sprite source.
     * @property {number} TypeAsepriteFrame.spriteSourceSize.w The width of the sprite source.
     * @property {number} TypeAsepriteFrame.spriteSourceSize.h The height of the sprite source.
     * @property {Object} TypeAsepriteFrame.sourceSize The sprite size.
     * @property {number} TypeAsepriteFrame.sourceSize.w The width of the source.
     * @property {number} TypeAsepriteFrame.sourceSize.h The height of the source.
     * @property {boolean} TypeAsepriteFrame.trimmed The trimmed status.
     * @private
     */

    /**
     * @typedef {Object} TypeAsepriteMeta An Aseprite JSON meta data.
     * @property {string} TypeAsepriteMeta.app The app meta data.
     * @property {string} TypeAsepriteMeta.format The format meta data.
     * @property {string} TypeAsepriteMeta.image The image meta data.
     * @property {string} TypeAsepriteMeta.scale The scale meta data.
     * @property {Object} TypeAsepriteMeta.size The size meta data.
     * @property {number} TypeAsepriteMeta.size.w The size width meta data.
     * @property {number} TypeAsepriteMeta.size.h The size height meta data.
     * @property {string} TypeAsepriteMeta.version The version meta data.
     * @property {Array<TypeAsepriteFrameTag>} TypeAsepriteMeta.frameTags The Aseprite JSON tags meta data.
     * @private
     */

    /**
     * @typedef {Object} TypeAsepriteFrameTag An Aseprite JSON tag meta data.
     * @property {string} TypeAsepriteFrameTag.name The name.
     * @property {number} TypeAsepriteFrameTag.from The first frame.
     * @property {number} TypeAsepriteFrameTag.to The last frame.
     * @property {string} TypeAsepriteFrameTag.direction The animation direction.
     * @property {string} TypeAsepriteFrameTag.color The color.
     * @private
     */

    const context = /** @type {webpack.LoaderContext<TypeOptions>} */(this);

    const file = context.resourcePath;
    const options = context.getOptions();
    const aseprite = options.aseprite;
    const constants = options.constants;
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
        const sourceAnimations = filename + '.animations.js';

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
            const sheetType = (typeof prepare !== 'undefined' && ['columns', 'horizontal', 'packed', 'rows', 'vertical'].indexOf(prepare.sheet) !== -1) ? prepare.sheet : 'rows';

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
                ' --filename-format frame-{frame001}@{title}.{extension}'
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

        if (fs.existsSync(path.resolve(location, sourceAnimations)) === false
        || fs.statSync(path.resolve(location, sourceAnimations)).mtime < fs.statSync(file).mtime) {

            if (constants === true) {

                const json = /** @type {TypeAseprite} */(JSON.parse(fs.readFileSync(path.resolve(location, sourceData), 'utf-8')));
                const tags = json.meta.frameTags
                .map(($tag) => ($tag.name))
                .sort();

                const content = tags.length > 0
                ? (
                    '/**\n' +
                    ' * @typedef {(' + tags.map(($tag) => ($tag.toUpperCase().replace(/-/g, '_'))).join(' | ') + ')} TypeAnimation An animation.\n' +
                    ' */\n' +
                    '\n' +
                    tags.map(($tag) => (

                        '/**\n' +
                        ' * The \'' + $tag.toUpperCase().replace(/-/g, '_') + '\' animation.\n' +
                        ' * @type {\'' + $tag + '\'}\n' +
                        ' * @constant\n' +
                        ' */\n' +
                        'const ' + $tag.toUpperCase().replace(/-/g, '_') + ' = \'' + $tag + '\';\n'

                    )).join('\n') + '\n' +
                    'export {\n' +
                    '\n' +
                    tags.map(($tag) => (

                        '    ' + $tag.toUpperCase().replace(/-/g, '_'))

                    ).join(',' + '\n') + '\n' +
                    '};\n'
                )
                : (

                    'export {};\n'
                );

                fs.writeFileSync(path.resolve(location, sourceAnimations), content, 'utf-8');
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
