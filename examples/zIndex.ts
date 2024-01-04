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

import { 
    initRenderer, 
    Scene, 
    colors,
    Node,
} from "../index.js";

await initRenderer();

// add HTML/CSS zindex example to body in its own container, get body tag
const body = document.getElementsByTagName('body')[0];
const container = document.createElement('div');
container.id = 'container';
container.style.position = 'absolute';
container.style.width = '100%';
container.style.height = '100%';
container.style.top = '50';
container.style.left = '50';
body?.appendChild(container);

const addDiv = (id: string, zIndex: number, color: string, parent: HTMLElement, height: number = 100, width: number = 100, position: string = 'relative', top: number = 0, left: number = 0) => {
    const div = document.createElement('div');
    div.innerHTML = id;
    div.id = id;
    div.style.position = position;
    div.style.width = width + 'px';
    div.style.height = height + 'px';
    div.style.backgroundColor = color;
    div.style.top = top + 'px';
    div.style.left = left + 'px';
    div.style.opacity = '0.8';
    div.style.border = '1px solid black';
    div.style.padding = '10px';
    div.style.zIndex = zIndex.toString();
    parent.appendChild(div);

    return div;
}

const clearContainer = () => {
    const container = document.getElementById('container');
    if (container) {
        container.innerHTML = '';
    }
}

// add a bunch of divs with stacked contexts
const addDivs = () => {
    addDiv('div1', 5, 'green', container, 50, 200);
    addDiv('div2', 2, 'orange', container, 50, 200, 'relative', 150, 0);
    const div3 = addDiv('div3', 4, 'red', container, 220, 150, 'absolute', 30, 30);

    addDiv('div4', 6, 'yellow', div3, 50, 100, 'relative', 0, 10);
    addDiv('div5', 1, 'yellow', div3, 50, 100, 'relative', 50, 10);
    addDiv('div6', 3, 'purple', div3, 180, 50, 'absolute', 10, 50);
 
}

addDivs();

// recreate the same scene in the renderer
const containerOffSet = 400;
const scene = Scene({
    'bg' : { x: 0, y: 0, width: 1900, height: 1080, color: colors.black },
    'container': {
        props: { x: 350, y: 50 },
        'div1' : { x: 0, y: 0, width: 200, height: 75, color: colors.green, zIndex: 5, alpha: 0.8 },
        'div2' : { x: 0, y: 200, width: 200, height: 75, color: colors.orange, zIndex: 2, alpha: 0.8 },
        'div3' : {
            props: { x: 30, y: 30, width: 150, height: 220, color: colors.red, zIndex: 4, alpha: 0.8 },
            'div4' : { x: 10, y: 20, width: 120, height: 60, color: colors.yellow, zIndex: 6, alpha: 0.8 },
            'div5' : { x: 10, y: 150, width: 120, height: 60, color: colors.yellow, zIndex: 1, alpha: 0.8 },
            'div6' : { x: 30, y: 10, width: 75, height: 180, color: colors.purple, zIndex: 3, alpha: 0.8 },
        }
    } 
});

await scene.render();

// force animation because renderer doesn't start rendering until something changes *shrug*
scene.find('container')?.animate({ x: containerOffSet }, { duration: 100 })?.start();