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
  type INode,
  type INodeWritableProps,
  type ITextNodeWritableProps,
} from '@lightningjs/renderer';

import { getRootNode, renderer } from './renderer/renderer.js';

export interface ISceneNode extends INode {
    /**
     * Adds a new child node to the scene
     */
    add: (child: ISceneNode) => void;
    /**
     * Destroys the node and all its children
     * 
     * @returns 
     */
    destroy: () => void;
    /**
     * Find a node by key
     * 
     * @param key string key
     * @returns ISceneNode or null
     */
    find: (key: string) => ISceneNode | null;
    /**
     * Gets the internal Lightning 3 node. 
     * Note: This should not be needed in most cases.
     * 
     * @returns INode or null
     */
    get: () => INode | null;
    /**
     * Get the key of the node
     */
    key: () => string;
    /**
     * Removes a child node from the tree, this will unmount the node and destroy it.
     * 
     * @param child 
     * @returns 
     */
    remove: (child: ISceneNode) => void;
}

/**
 * Node - Create a new node and render it to the scene
 * 
 * @param key Unique key for the node (used for finding nodes)
 * @param parent Parent to attach the node to
 * @param props Lightning 3 rendering props (see INodeWritableProps or ITextNodeWritableProps)
 * @returns ISceneNode
 */
export const Node = (key: string, parent: ISceneNode | null, props: Partial<INodeWritableProps> | Partial<ITextNodeWritableProps> = {}): ISceneNode => {
    const parentNode = parent ? parent.get() : getRootNode();
    let children: ISceneNode[] = [];

    const createLightningNode = () => {
        if (!renderer) {
            throw new Error('Renderer not initialized');
        }

        if ('text' in props) {
            return renderer.createTextNode({
                ...props,
                parent: parentNode
            });
        }

        return renderer.createNode({
            ...props,
            parent: parentNode
        });
    };

    const lightningNode = createLightningNode();

    const sceneNode = {
        add(child: ISceneNode) {
            children.push(child);
        },
        destroy() {
            if (!renderer) {
                return;
            }

            // destroy children
            children.forEach((child) => child.destroy());

            // should we wait for animation to finish? *shrug*
            lightningNode.destroy();
        },
        find (k: string) {
            if (key === k) {
                return proxy;
            }
    
            return children.map((child) => child.find(k)).filter((child) => child !== null)[0] || null;
        },
        get() {
            return lightningNode;
        },
        key() {
            return key;
        },
        remove(child: ISceneNode) {
            const index = children.indexOf(child);
            if (index > -1) {
                children.splice(index, 1);
            }
        }
    };

    const proxy = new Proxy(sceneNode, {
        get(target: ISceneNode, prop: keyof ISceneNode) {
            if (prop in target) {
                return target[prop];
            }
            
            return lightningNode ? (lightningNode as any)[prop] : null;
        },
        set(target: ISceneNode, prop: keyof ISceneNode, value: any) {
            if (prop in target) {
                (target as any)[prop as keyof ISceneNode] = value;
            } else if (lightningNode && value !== undefined) {
                (lightningNode as any)[prop as keyof INode] = value;
            }
            return true;
        }
    }) as ISceneNode;

    parent?.add(proxy);

    if (!parent) {
        console.warn(`Dangling node: ${key} no parent, adding to root`);
    }

    return proxy;
}