import {
  MainCoreDriver,
  RendererMain,
  type INodeWritableProps,
  type INode
} from '@lightningjs/renderer';

export let renderer: any | null = null;

let rootNode: INode | null = null;
export const getRootNode = () => {
    return rootNode;
}

export const initRenderer = async () => {
    if (renderer) {
        console.error('Renderer already initialized');
        return;
    }

    const driver = new MainCoreDriver();
    renderer = new RendererMain({
        appWidth: 1900,
        appHeight: 1080,
        clearColor: 0x00000000,
    }, 'app', driver);

    await renderer.init();

    rootNode = renderer.createNode({
        color: 0,
        parent: renderer.root,
    });
};
