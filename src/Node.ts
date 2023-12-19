import {
  type INode,
  type INodeWritableProps,
  type ITextNodeWritableProps,
  type INodeAnimatableProps,
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
    let node: INode | null = null;
    let children: ISceneNode[] = [];

    const render = () => {
        if (!renderer) {
            return;
        }

        if ('text' in props) {
            node = renderer.createTextNode({
                ...props,
                parent: parentNode
            });
            return;
        }

        node = renderer.createNode({
            ...props,
            parent: parentNode
        });
    };

    render();

    const _node = {
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
            node?.destroy();
            node = null;
        },
        find(k: string) {
            if (key === k) {
                return this;
            }

            return children.find((child) => child.find(key)) || null;
        },
        get() {
            return node;
        },
        remove(child: ISceneNode) {
            const index = children.indexOf(child);
            if (index > -1) {
                children.splice(index, 1);
            }
        }
    };

    const proxy = new Proxy(_node, {
        get(target, prop: string) {
            if (prop in target) {
                // @ts-ignore
                return target[prop];
            }
            
            return node ? node[prop as keyof INodeAnimatableProps || prop as keyof ITextNodeWritableProps] : null;
        },
        set(target, prop: string, value) {
            if (prop in target) {
                // @ts-ignore
                target[prop] = value;
            } else if (node && value !== undefined) {
                node[prop as keyof INodeAnimatableProps || prop as keyof ITextNodeWritableProps] = value;
            }
            return true;
        }
    });

    return proxy as ISceneNode;
}