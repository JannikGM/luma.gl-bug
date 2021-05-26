import {AnimationLoop, Model} from '@luma.gl/engine';
import {Buffer, clear} from '@luma.gl/webgl';

import {brightnessContrast} from '@luma.gl/shadertools';

const loop = new AnimationLoop({
  onInitialize({gl}) {
    const positionBuffer = new Buffer(gl, new Float32Array([-0.5, -0.5, 0.5, -0.5, 0.0, 0.5]));

    const colorBuffer = new Buffer(
      gl,
      new Float32Array([1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0])
    );

    const vs = `
      attribute vec2 position;
      attribute vec3 color;

      varying vec3 vColor;

      void main() {
        vColor = color;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fs = `
      varying vec3 vColor;

      void main() {
        gl_FragColor = vec4(vColor, 1.0);
        gl_FragColor = brightnessContrast_filterColor(gl_FragColor);
      }
    `;

    const model = new Model(gl, {
      vs,
      fs,
      attributes: {
        position: positionBuffer,
        color: colorBuffer
      },
      vertexCount: 3,
      modules: [brightnessContrast]
    });

    return {model};
  },

  onRender({gl, model}) {
    clear(gl, {color: [0, 0, 0, 1]});

    const opts = {brightness: 0.5, contrast: -0.5}

    // Does not work
    model.setUniforms(opts).draw();

    // Does not work
    model.updateModuleSettings(opts).draw();

    // Does work
    model.draw({moduleSettings: opts});
    
    // Does work
    model.draw({uniforms: opts});
  }
});

loop.start();
