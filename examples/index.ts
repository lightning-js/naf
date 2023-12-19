/*
 * Copyright 2023 Comcast Cable Communications Management, LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { initRenderer, Scene, Node, colors } from "../index.js";

await initRenderer();

const run = async () => {
    const scene = Scene({
        'bg' : { x: 0, y: 0, width: 1900, height: 1080, color: colors.black },
        'text' : { x: 100, y: 100, text: 'Hello World', color: colors.white, fontSize: 50 },
        'square' : { x: 100, y: 300, width: 200, height: 200, color: colors.blue },
        'row' : {
            props: { x: 60, y: 200 }
        }
    });

    scene.render();

    const row = scene.find('row');
    Array(40).fill(0).forEach((_, i) => {
        if (!row) return;
        //@ts-ignore
        const color = colors[Object.keys(colors)[i]];
        Node('square' + i, row, { x: i * 40, y: 0, width: 20, height: 20, color });
    });

    const square = scene.find('square');
    square?.animate({ x: 1000 }, { duration: 1000, delay: 1000 })?.start();

    scene.on('left', () => {
        console.log('left');

        if (!square) return;
        square.x -= 10;
    });

    scene.on('right', () => {
        console.log('right');

        if (!square) return;
        square.x += 10;
    });

    scene.on('exit', () => {
        console.log('exit');
        scene.destroy();

        setTimeout(() => {
            run();
        }, 1000);
    });

}

run();