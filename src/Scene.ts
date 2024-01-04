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

import { INodeWritableProps, ITextNodeWritableProps } from '@lightningjs/renderer';
import { Node, type ISceneNode } from './Node.js';

export interface IScene {
    /**
     * Destroy the scene and all its children.
     * 
     * @remark
     * This will also unregister any previously registered key listeners.
     * 
     * @returns 
     */
    destroy: () => void;
    /**
     * Get all children of the scene
     * 
     * @returns ISceneNode[]
     */
    children: () => ISceneNode[];
    /**
     * Find a node by key
     * 
     * @param key string key
     * @returns ISceneNode or null
     */
    find: (key: string) => ISceneNode | null;
    /**
     * Register a new key listener
     * 
     * @param event string event name
     * @param callback callback function
     */
    on: (event: string, callback: any) => void;
    /**
     * Unregister a key listener
     * 
     * @param event string event name
     * @param callback callback function
     */
    off: (event: string, callback: any) => void;
    /**
     * Render the scene
     * This will parse the template and render all nodes to the scene
     */
    render: () => void;
    /**
     * Get the parent of the scene
     * 
     * @returns ISceneNode or null
     */
    parent: () => ISceneNode | null;
    /**
     * Get the template of the scene
     * 
     * @returns any
     */
    template: () => ITemplate;
}

/**
 * Props is required for nested nodes, this represents the props of the parent node when nesting.
 */
export interface IProps {
    props: Partial<INodeWritableProps>;
}

/**
 * Template is the type of the scene template.
 * 
 * @remark
 * The template is a JSON object that represents the scene. For example:
 * ```js
 * const template = {
 *   'bg' : { x: 0, y: 0, width: 1900, height: 1080, color: colors.black },
 *   'text' : { x: 100, y: 100, text: 'Hello World', color: colors.white, fontSize: 50 },
 *   'square' : { x: 100, y: 300, width: 200, height: 200, color: colors.blue },
 * }
 * ```
 * 
 * The keys of the template are used to find nodes in the scene so they require to be unique. The values of each key can be either `INodeWritableProps` or `ITextNodeWritableProps` and is used to manipulate the coordinates of the parent node when nesting.
 * 
 * @remark
 * Nesting has 1 special case, when nesting a node you need to wrap the props in a `props` object. For example:
 * ```js
 * const template = {
 *  'row' : {
 *     props: { x: 60, y: 200 }
 *   }
 * }
 * ```
 * 
 * This will create a new node with the key `row` and the props `{ x: 60, y: 200 }`. The props are used to manipulate the coordinates of the parent node.
 * Without the props object the nested node will not be created or rendered.
 */
export interface ITemplate {
    [key: string]: Partial<INodeWritableProps> | Partial<ITextNodeWritableProps> | ITemplate | IProps | null;
}

const keyEvents = {
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'Enter': 'enter',
    'Escape': 'exit',
    'Backspace': 'back',
};
const supportedEvents = Object.keys(keyEvents);

/**
 * Create a new scene, creates new Lightning 3 nodes and renders them to the scene.
 * 
 * @remark
 * The `props` of the template can be either `INodeWritableProps` or `ITextNodeWritableProps` and is used to manipulate the coordinates of the parent node when nesting.
 * 
 * @param template The JSON template of the scene
 * @param parent Optional parent node, if no parent is provided the scene will be rendered to the root node.
 * @returns IScene
 */
export const Scene = (template: ITemplate, parent: ISceneNode | null = null): IScene => {
    let sceneChildNodes: ISceneNode[] = [];
    let eventListeners: any = {};

    const addEventListener = (event: string, callback: any) => {
        if (!eventListeners[event]) {
            eventListeners[event] = [];
        }

        eventListeners[event].push(callback);
    };

    const dispatchEvent = (event: KeyboardEvent) => {
        if (!supportedEvents.includes(event.key)) {
            return;
        }

        const keyEvent = keyEvents[event.key as keyof typeof keyEvents];

        if (!eventListeners[keyEvent]) {
            return;
        }

        eventListeners[keyEvent].forEach((callback: any) => callback());
    };

    const removeEventListener = (event: string, callback: any) => {
        if (!eventListeners[event]) {
            return;
        }

        const index = eventListeners[event].indexOf(callback);
        if (index > -1) {
            eventListeners[event].splice(index, 1);
        }
    };

    const parseTemplate = (layer: any, parent: any) => {
        if (!layer) {
            return;
        }

        Object.keys(layer).forEach((key) => {
            const props = layer[key];

            if (!props) {
                return;
            }

            let isNested = false;
            const keyProps = Object.keys(props);
      
            if (keyProps.length > 0 && keyProps.includes('props')) {
                isNested = true;
            }

            const node = Node(key, parent, isNested ? props.props : props);

            if (!parent) {
                sceneChildNodes.push(node);
            } else {
                parent.add(node);
            }

            if (isNested) {
                // remove props from original props
                delete props.props;
                parseTemplate(props, node);
            }
        });
    }

    return {
        destroy() {
            window.removeEventListener('keydown', dispatchEvent);
            eventListeners = {};

            sceneChildNodes.forEach((child) => child.destroy());
            sceneChildNodes = [];
        },
        children() {
            return sceneChildNodes;
        },
        find(key: string): ISceneNode | null {
            return sceneChildNodes.map((child) => child.find(key)).filter((child) => child !== null)[0] || null;
        },
        on(event: string, callback: any) {
            addEventListener(event, callback);
        },
        off(event: string, callback: any) {
            removeEventListener(event, callback);
        },
        render() {
            window.addEventListener('keydown', dispatchEvent);
            parseTemplate(template, parent);
        },
        parent() {
            return parent || null;
        },
        template() {
            return template;
        },
    }
}