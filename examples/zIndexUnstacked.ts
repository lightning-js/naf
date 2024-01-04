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

const addDiv = (id: string, zIndex: number | undefined | null | boolean, color: string, parent: HTMLElement, height: number = 100, width: number = 100, position: string = 'relative', top: number = 0, left: number = 0, opacity: number = 1) => {
    const div = document.createElement('div');
    div.innerHTML = id;
    div.id = id;
    div.style.position = position;
    div.style.width = width + 'px';
    div.style.height = height + 'px';
    div.style.backgroundColor = color;
    div.style.top = top + 'px';
    div.style.left = left + 'px';
    div.style.opacity = opacity.toString();
    div.style.border = '1px solid black';
    div.style.padding = '10px';

    if (zIndex) {
        div.style.zIndex = zIndex.toString();
    }

    parent.appendChild(div);

    return div;
}

// add a bunch of divs with stacked contexts
const addDivs = () => {
    const ele1 = addDiv('ele1', 2, 'green', container, 50, 200, 'relative', 0, 0, 0.5);
    const ele2 = document.createElement('div');
    ele2.style.position = 'relative';
    ele2.style.top = '0px';
    ele2.style.left = '0px';
    ele1.appendChild(ele2);
    addDiv('ele3', 10, 'blue', ele2, 50, 150, 'absolute', 0, 30);
}

addDivs();

// recreate the same scene in the renderer
const containerOffSet = 400;
const scene = Scene({
    'bg' : { x: 0, y: 0, width: 1900, height: 1080, color: colors.black },
    'container': {
        props: { x: 350, y: 50 },
        'ele1' : { x: 0, y: 0, width: 200, height: 75, color: colors.green, zIndex: 2, alpha: 0.40 },
        'ele2' : { 
            // note this doesn't work in Lightning, because everything is a stacked context per parent. 
            // browser follows the following rules: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context
            // for Lightning:
            // Within a stacking context, child elements are stacked according to the same rules explained just above. Importantly, the z-index values of its child stacking contexts only have meaning in this parent. 
            // Stacking contexts are treated atomically as a single unit in the parent stacking context.
            props: { x: 0, y: 0 },
            'ele3' : { x: 20, y: 35, width: 160, height: 60, color: colors.blue, zIndex: 10, alpha: 1 },
        }
    } 
});

await scene.render();

// force animation because renderer doesn't start rendering until something changes *shrug*
scene.find('container')?.animate({ x: containerOffSet }, { duration: 100 })?.start();