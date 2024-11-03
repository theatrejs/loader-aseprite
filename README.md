[![Copyright](https://img.shields.io/badge/©-deformhead-white.svg)](https://github.com/deformhead) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/theatrejs/loader-aseprite/blob/master/LICENSE) [![Bundle Size (Gzipped)](https://img.shields.io/bundlejs/size/@theatrejs/loader-aseprite@latest)](https://www.npmjs.com/package/@theatrejs/loader-aseprite/v/latest) [![NPM Version](https://img.shields.io/npm/v/@theatrejs/loader-aseprite/latest)](https://www.npmjs.com/package/@theatrejs/loader-aseprite/v/latest)

# Aseprite Webpack Loader

> *⚙️ A Webpack Loader for Aseprite files.*

## Installation

> *⚠️ This loader needs you to have [**Aseprite**](https://www.aseprite.org) installed.*

```shell
npm install @theatrejs/plugin-aseprite --save
```

```shell
npm install @theatrejs/loader-aseprite --save-dev
```

## Webpack Configuration

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
                            'aseprite': '<path-to-aseprite>' // The path to the Aseprite executable.
                        }
                    }
                ]
            }
            ...
        ]
    }
}
```

## Webpack Configuration (Advanced Options)

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
                            'aseprite': '<path-to-aseprite>', // The path to the Aseprite executable.
                            'prepare': {
                                'sheet': 'packed', // The Aseprite output 'sheet type' option ('colums' | 'horizontal' | 'packed' | 'rows' | 'vertical') ('rows' by default).
                                'trim': true // The Aseprite output 'trim cels' option (false by default).
                            },
                            'processing': {
                                'colorswap': [
                                    {
                                        'source': [255, 0, 255, 255], // A source color to swap from (in rgba).
                                        'target': [0, 0, 0, 0] // A target color to swap to (in rgba).
                                    }
                                ]
                            }
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
