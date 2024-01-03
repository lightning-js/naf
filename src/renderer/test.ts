import {
    CoreExtension,
    WebTrFontFace,
    SdfTrFontFace,
    type Stage,
  } from '@lightningjs/renderer/core';
  
  export default class MyCoreExtension extends CoreExtension {
    async run(stage: Stage) {
      // Load fonts into core
      stage.fontManager.addFontFace(
        new WebTrFontFace('Ubuntu', {}, '/fonts/Ubuntu-Regular.ttf'),
      );
  
      stage.fontManager.addFontFace(
        new SdfTrFontFace(
          'Ubuntu',
          {},
          'msdf',
          stage,
          '/fonts/Ubuntu-Regular.msdf.png',
          '/fonts/Ubuntu-Regular.msdf.json',
        ),
      );
    }
  }