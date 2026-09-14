/*
 * WebGL liquid edges
 * A compact, panel-only shader inspired by Pavel Dobryakov's MIT-licensed
 * WebGL Fluid Simulation: https://github.com/PavelDoGreat/WebGL-Fluid-Simulation
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.WebGLRenderingContext || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const vertexSource = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2 uCanvasResolution;
    uniform vec2 uCardResolution;
    uniform float uBleed;
    uniform vec2 uPointer;
    uniform float uMotion;
    uniform float uTime;
    uniform vec3 uBorderColor;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float strength = 0.58;
      for (int i = 0; i < 5; i++) {
        value += strength * noise(p);
        p = p * 2.02 + vec2(17.2, 9.1);
        strength *= 0.52;
      }
      return value;
    }

    void main() {
      float time = uTime * 0.17;
      vec2 cardPosition = vUv * uCanvasResolution - vec2(uBleed);
      vec2 uv = cardPosition / uCardResolution;
      vec2 field = uv * 4.2;
      field += vec2(fbm(field + vec2(time, -time * 0.7)), fbm(field + vec2(-time * 0.55, time))) * 2.2;
      float flow = fbm(field + vec2(time * 1.3, -time));
      float ripple = sin((flow * 14.0) + (uv.x + uv.y) * 8.0 - time * 8.0) * 0.5 + 0.5;

      float pointerDistance = distance(uv, uPointer);
      float pointerWake = exp(-pointerDistance * 17.0) * uMotion;
      flow += pointerWake * 0.32;
      ripple = mix(ripple, sin(pointerDistance * 68.0 - uTime * 7.0) * 0.5 + 0.5, pointerWake * 0.62);

      vec3 midnight = vec3(0.005, 0.025, 0.16);
      vec3 royal = vec3(0.02, 0.12, 0.72);
      vec3 electric = vec3(0.02, 0.55, 1.0);
      vec3 ice = vec3(0.66, 0.94, 1.0);
      vec3 colour = mix(uBorderColor, royal, smoothstep(0.20, 0.72, flow));
      colour = mix(colour, electric, smoothstep(0.48, 0.88, ripple) * 0.72);
      colour += ice * pow(ripple, 12.0) * 0.92;
      colour += ice * pointerWake * 0.8;

      vec2 rectangleDistance = abs(cardPosition - uCardResolution * 0.5) - uCardResolution * 0.5;
      float signedEdgeDistance = length(max(rectangleDistance, 0.0));
      float contour = (fbm(uv * 8.0 + vec2(time * 1.7, -time * 1.2)) - 0.5) * 12.0;
      contour += sin((uv.x - uv.y) * 18.0 + time * 10.0) * 3.0;
      float fluidBand = 1.0 - smoothstep(4.0, 16.0, abs(signedEdgeDistance - contour));
      float crest = smoothstep(0.78, 0.98, ripple) * fluidBand;
      gl_FragColor = vec4(colour + ice * crest * 0.62, fluidBand * (0.76 + crest * 0.24));
    }
  `;

  const compileShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };

  const hosts = [...document.querySelectorAll('.node-preview-card, .upcoming-card, .about-portrait-card, .asymmetric-guide-box, .tile')];
  const simulations = [];

  hosts.forEach((host) => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) return;

    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    const canvasResolution = gl.getUniformLocation(program, 'uCanvasResolution');
    const cardResolution = gl.getUniformLocation(program, 'uCardResolution');
    const bleed = gl.getUniformLocation(program, 'uBleed');
    const pointer = gl.getUniformLocation(program, 'uPointer');
    const motion = gl.getUniformLocation(program, 'uMotion');
    const borderColorLocation = gl.getUniformLocation(program, 'uBorderColor');

    canvas.className = 'fluid-edge-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    // fluid edge disabled – removed canvas and host class
    // canvas not added to host

    // Compute border colour from host background
    const style = getComputedStyle(host);
    let borderColor = [0, 0, 0]; // default black
    const bgColor = style.backgroundColor;
    if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
      // Parse rgb(a) string
      const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (match) {
        borderColor = [parseInt(match[1]) / 255, parseInt(match[2]) / 255, parseInt(match[3]) / 255];
      }
    } else {
      // If background-image is set, sample dominant colour (center pixel)
      const bgImg = style.backgroundImage;
      if (bgImg && bgImg !== 'none') {
        const urlMatch = bgImg.match(/url\(["']?(.*?)["']?\)/i);
        if (urlMatch) {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.src = urlMatch[1];
          img.onload = () => {
            const tempCanvas = document.createElement('canvas');
            const ctx = tempCanvas.getContext('2d');
            tempCanvas.width = 1;
            tempCanvas.height = 1;
            ctx.drawImage(img, 0, 0, 1, 1);
            const data = ctx.getImageData(0, 0, 1, 1).data;
            const sampled = [data[0] / 255, data[1] / 255, data[2] / 255];
            simulation.borderColor = sampled;
          };
          // Fallback until image loads
          simulation.borderColor = [0.1, 0.1, 0.2];
        }
      }
    }
    simulation.borderColor = borderColor;
    // Store uniform location reference
    simulation.borderColorLocation = borderColorLocation;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      simulation.cardWidth = Math.max(1, rect.width * scale);
      simulation.cardHeight = Math.max(1, rect.height * scale);
      simulation.bleedSize = 24 * scale; // increased from 16 to push fluid outside the card
      const width = Math.max(1, Math.round(simulation.cardWidth + simulation.bleedSize * 2));
      const height = Math.max(1, Math.round(simulation.cardHeight + simulation.bleedSize * 2));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    new ResizeObserver(resize).observe(host);
    resize();
    host.addEventListener('pointermove', (event) => {
      const rect = host.getBoundingClientRect();
      simulation.pointerX = (event.clientX - rect.left) / rect.width;
      simulation.pointerY = 1 - (event.clientY - rect.top) / rect.height;
      simulation.energy = 1;
    });
    simulations.push(simulation);
  });

  const render = (timestamp) => {
    simulations.forEach((simulation) => {
      const { canvas, gl, program, buffer, position, canvasResolution, cardResolution, bleed, pointer, motion, time } = simulation;
      simulation.energy *= 0.965;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(canvasResolution, canvas.width, canvas.height);
      gl.uniform2f(cardResolution, simulation.cardWidth, simulation.cardHeight);
      gl.uniform1f(bleed, simulation.bleedSize);
      gl.uniform2f(pointer, simulation.pointerX, simulation.pointerY);
      gl.uniform3f(simulation.borderColorLocation, simulation.borderColor[0], simulation.borderColor[1], simulation.borderColor[2]);
    });
    requestAnimationFrame(render);
  };

  if (simulations.length) requestAnimationFrame(render);
});
