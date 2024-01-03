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
  MainCoreDriver,
  RendererMain,
  type RendererMainSettings,
  type INode
} from '@lightningjs/renderer';

import Extensions from './test.js';

export let renderer: any | null = null;

let rootNode: INode | null = null;
export const getRootNode = () => {
    return rootNode;
}

export const initRenderer = async (settings: RendererMainSettings = {}, canvasDiv: string = 'app') => {
    if (renderer) {
        console.error('Renderer already initialized');
        return;
    }

    const defaultSettings = {
        appWidth: 1900,
        appHeight: 1080,
        clearColor: 0x00000000,
    };

    const driver = new MainCoreDriver();
    renderer = new RendererMain({
        ...defaultSettings,
        ...settings,
        // fix me - for some reason this throws a vite class error
        //coreExtensionModule: Extensions,
    }, canvasDiv, driver);

    await renderer.init();

    rootNode = renderer.createNode({
        color: 0,
        parent: renderer.root,
    });
};
