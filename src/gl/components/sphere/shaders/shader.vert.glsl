precision highp float;

attribute vec4 position;
attribute vec2 uv;

uniform mat4 uMVPMatrix;

varying vec2 vUv;

void main() {
    gl_Position = uMVPMatrix * position;
    vUv = uv;
}