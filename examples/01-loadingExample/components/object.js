const baseVertexShaderSrc = require('./shaders/shader-vert.glsl');
const baseFragmentShaderSrc = require('./shaders/shader-frag.glsl');
import { Program, ArrayBuffer, IndexArrayBuffer } from 'tubugl-core';
import { mat4 } from 'gl-matrix';
// import {
// 	TRIANGLES,
// 	UNSIGNED_SHORT,
// 	CULL_FACE,
// 	DEPTH_TEST,
// 	SRC_ALPHA,
// 	ONE_MINUS_SRC_ALPHA,
// 	BLEND
// } from 'tubugl-constants';

export class ModelObject {
	constructor(gl, params = {}, data) {
		this._gl = gl;
		this.modelMatrix = mat4.create();
		mat4.scale(this.modelMatrix, this.modelMatrix, [2, 2, 2]);
		mat4.translate(this.modelMatrix, this.modelMatrix, [0, 7.75, 0]);

		this.normalMatrix = mat4.create();
		mat4.invert(this.normalMatrix, this.modelMatrix);
		mat4.transpose(this.normalMatrix, this.normalMatrix);
		console.log(this.normalMatrix);

		let vertexShaderSrc = params.vertexShaderSrc ? params.vertexShaderSrc : baseVertexShaderSrc;
		let fragmentShaderSrc = params.fragmentShaderSrc
			? params.fragmentShaderSrc
			: baseFragmentShaderSrc;
		this._makeProgram(vertexShaderSrc, fragmentShaderSrc);
		this._makeBuffers(data.data);
	}

	_makeProgram(vertexShaderSrc, fragmentShaderSrc) {
		this._program = new Program(this._gl, vertexShaderSrc, fragmentShaderSrc);
	}

	_makeBuffers(data) {
		this._positionBuffer = new ArrayBuffer(
			this._gl,
			new Float32Array(data.attributes.position.array)
		);
		this._positionBuffer.setAttribs('position', 3);

		this._uvBuffer = new ArrayBuffer(this._gl, new Float32Array(data.attributes.uv.array));
		this._uvBuffer.setAttribs('uv', 2);

		this._normalBuffer = new ArrayBuffer(
			this._gl,
			new Float32Array(data.attributes.normal.array)
		);
		this._normalBuffer.setAttribs('normal', 3);

		this._indexBuffer = new IndexArrayBuffer(this._gl, new Uint16Array(data.index.array));

		this._cnt = data.index.array.length;
	}

	render(camera) {
		this.update(camera).draw();
	}

	update(camera) {
		this._program.use();

		this._positionBuffer.bind().attribPointer(this._program);
		this._uvBuffer.bind().attribPointer(this._program);
		this._normalBuffer.bind().attribPointer(this._program);
		this._indexBuffer.bind();

		this._gl.uniformMatrix4fv(
			this._program.getUniforms('modelMatrix').location,
			false,
			this.modelMatrix
		);
		this._gl.uniformMatrix4fv(
			this._program.getUniforms('viewMatrix').location,
			false,
			camera.viewMatrix
		);
		this._gl.uniformMatrix4fv(
			this._program.getUniforms('projectionMatrix').location,
			false,
			camera.projectionMatrix
		);

		this._gl.uniformMatrix4fv(
			this._program.getUniforms('normalMatrix').location,
			false,
			this.normalMatrix
		);

		return this;
	}

	draw() {
		// if (this._side === 'double') {
		this._gl.disable(this._gl.CULL_FACE);
		// } else if (this._side === 'front') {
		// 	this._gl.enable(CULL_FACE);
		// 	this._gl.cullFace(BACK);
		// } else {
		// 	this._gl.enable(CULL_FACE);
		// 	this._gl.cullFace(FRONT);
		// }

		this._gl.enable(this._gl.DEPTH_TEST);

		this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
		this._gl.enable(this._gl.BLEND);

		this._gl.drawElements(this._gl.TRIANGLES, this._cnt, this._gl.UNSIGNED_SHORT, 0);
	}
}