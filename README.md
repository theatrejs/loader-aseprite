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
import {Actor} from '@theatrejs/theatrejs';

import spritesheetHero from './hero-16x16.aseprite';

class Hero extends Actor {
    onCreate() {
        this.$timeline = spritesheetHero.createTimeline({$actor: this, $framerate: 8, $loop: true, $tag: 'idle'});
    }
    onTick($timetick) {
        this.$timeline.tick($timetick);
    }
}
```

## With Preloading

```javascript
import {FACTORIES} from '@theatrejs/theatrejs';

import * as PLUGINASEPRITE from '@theatrejs/plugin-aseprite';

import spritesheetHero from './hero-16x16.aseprite';

class Hero extends FACTORIES.ActorWithPreloadables([PLUGINASEPRITE.FACTORIES.PreloadableAseprite(spritesheetHero)]) {
    onCreate() {
        this.$timeline = spritesheetHero.createTimeline({$actor: this, $framerate: 8, $loop: true, $tag: 'idle'});
    }
    onTick($timetick) {
        this.$timeline.tick($timetick);
    }
}
```
