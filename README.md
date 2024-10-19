[![Copyright](https://img.shields.io/badge/©-deformhead-white.svg)](https://github.com/deformhead) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/theatrejs/loader-aseprite/blob/master/LICENSE) [![Bundle Size (Gzipped)](https://img.shields.io/bundlejs/size/@theatrejs/loader-aseprite@latest)](https://www.npmjs.com/package/@theatrejs/loader-aseprite/v/latest) [![NPM Version](https://img.shields.io/npm/v/@theatrejs/loader-aseprite/latest)](https://www.npmjs.com/package/@theatrejs/loader-aseprite/v/latest)

# Aseprite Webpack Loader

> *⚙️ A Webpack Loader for Aseprite files.*

## Installation

#### `dependencies`

```shell
npm install @theatrejs/plugin-aseprite --save
```

```shell
npm install @theatrejs/loader-aseprite --save-dev
```

#### `webpack configuration`

```javascript
{
    'module': {
        'rules': [
            ...
            {
                'test': /\.aseprite$/,
                'use': [
                    {
                        'loader': '@theatrejs/loader-aseprite',
                        'options': {
                            'aseprite': <path-to-aseprite-executable>
                        }
                    }
                ]
            }
            ...
        ]
    }
}
```

## Quick Start

> *⚠️ This example does not include the preloading of assets.*

```javascript
import {Stage} from '@theatrejs/theatrejs';
import * as PLUGINASEPRITE from '@theatrejs/plugin-aseprite';

import asepriteHero from './hero-16x16.aseprite';

class Level1 extends Stage {
    onCreate() {
        this.createActor(
            PLUGINASEPRITE.FACTORIES.ActorWithSpritesheet({
                $aseprite: asepriteHero,
                $loop: true,
                $tag: 'idle'
            })
        );
    }
}
```

## With Preloading

```javascript
import {FACTORIES} from '@theatrejs/theatrejs';
import * as PLUGINASEPRITE from '@theatrejs/plugin-aseprite';

import asepriteHero from './hero-16x16.aseprite';

class Level1 extends FACTORIES.StageWithPreloadables([PLUGINASEPRITE.FACTORIES.PreloadableAseprite(asepriteHero)]) {
    onCreate() {
        this.createActor(
            PLUGINASEPRITE.FACTORIES.ActorWithSpritesheet({
                $aseprite: asepriteHero,
                $loop: true,
                $tag: 'idle'
            })
        );
    }
}
```
