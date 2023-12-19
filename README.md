# NAF is Not A Framework

Welcome to NAF! NAF is as the name suggests, not a framework. It's a wrapper. Not a rapper, like eminem but a wrapper like a candy wrapper. Instead of candy though it wraps Lightning 3 renderer APIs and nodes. This project relies on the [Lightning 3 renderer](https://github.com/lightning-js/renderer) the WebGL renderer.

Why do you need this? You probably don't, if you're looking to create an Application with multiple pages and reactivity you are in the wrong place. Instead you should hop on over to: [Blits](https://github.com/lightning-js/blits) or [SolidJS](https://github.com/lightning-js/solid).

So why does this exist? Well the render API of Lightning 3 is rudimentary. Its efficient but doesn't provide any tooling aside from Creating a Node or Text Node. Thus creating slightly more complex screens quickly turns into a pool of dog water. Sometimes you need to whip up a slightly complexer scene of nodes without it turning into a full fletched application.

## What does this provide?

A wrapper that spawns Lightning 3 nodes based on a JSON object, utility functions like finding a node, basic key handling, adding or removing nodes or destroying the entire scene. The API is straight forward and the functionality is limited.

It's not a framework though (but that might be in the eye of the beholder, so not going to debate it).

## What doesn't it provide?

If you're looking to build a full app, this is project does not provide a Router, state machines and data reactivity. If you need stuff like that, please hop on to the above mentioned App Development Framework projects.

# Getting Started

```bash
npm install @lightningjs/naf
```

Then create a new file and run the following:

```js
import { initRenderer, Scene, Node, colors } from "../index.js";

await initRenderer();

const scene = Scene({
    'bg' : { x: 0, y: 0, width: 1900, height: 1080, color: colors.black },
    'text' : { x: 100, y: 100, text: 'Hello World', color: colors.white, fontSize: 50 },
    'square' : { x: 100, y: 300, width: 200, height: 200, color: colors.blue }
});

scene.render();
```


## Handling keys

You can just add event listeners yourself an manipulate the nodes directly, alternatively each scene has a helper listener using the `on()` and `off()` hooks.

For example:

```js
scene.on('left', () => {
    console.log('left');

    /** do things **/
});
```

The currently supported keys are: `up`, `down`, `left`, `right`, `enter`, `exit` and `back`


## Finding and manipulating a node

To find a node, you can do use the `find()` function and find a node by key. For example:

```js
const square = scene.find('square');
```

After this the square object has a few utility functions to add or remove children and to destroy itself.
All other getter/setters are the Lightning 3 nodes exposed directly. Such as `x`, `y` coordinates, `width` and `height` dimensions or the `animate()` api.

# Docs

For more information you can find the docs [here](https://github.com/lightning-js/not-a-framework/tree/main/docs/index.html)
