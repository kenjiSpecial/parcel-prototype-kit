import {
	activeTexture,
	bindBuffer,
	Camera,
	createBufferWithLocation,
	createIndex,
	createProgram,
	getSphere,
	getUniformLocations
} from 'dan-shari-gl';
import { utimes } from 'fs-extra';
import { mat4 } from 'gl-matrix';
import { BufferObject, IndexObject } from '../../../types/mesh';
import { TexturePools } from '../../../utils/TexturePools';
import fragmentShaderSrc from './shaders/shader.frag.glsl';
import vertexShaderSrc from './shaders/shader.vert.glsl';

export class Sphere {
	private readonly gl: WebGLRenderingContext;
	private readonly program: WebGLProgram;
	private readonly buffers: {
		position: BufferObject;
		uv: BufferObject;
		index: IndexObject;
	};
	private readonly uniforms: {
		uMVPMatrix: WebGLUniformLocation;
		uTexture: WebGLUniformLocation;
		uTime: WebGLUniformLocation;
	};
	private readonly matrix: { model: mat4; mv: mat4; mvp: mat4 };
	private time: number = 0;

	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
		this.program = createProgram(gl, vertexShaderSrc as string, fragmentShaderSrc as string);
		const { vertices, uvs, indices } = getSphere(5, 32, 32);

		this.buffers = {
			position: createBufferWithLocation(
				gl,
				this.program,
				new Float32Array(vertices),
				'position'
			),
			uv: createBufferWithLocation(gl, this.program, new Float32Array(uvs), 'uv'),
			index: createIndex(gl, new Uint16Array(indices))
		};

		this.matrix = {
			model: mat4.create(),
			mv: mat4.create(),
			mvp: mat4.create()
		};

		this.uniforms = getUniformLocations(gl, this.program, [
			'uMVPMatrix',
			'uTexture',
			'uTime'
		]) as {
			uMVPMatrix: WebGLUniformLocation;
			uTexture: WebGLUniformLocation;
			uTime: WebGLUniformLocation;
		};
	}

	public render(camera: Camera) {
		const { position, uv, index } = this.buffers;
		const { uMVPMatrix, uTime } = this.uniforms;
		this.time = this.time + 1 / 60;

		const { model, mv, mvp } = this.matrix;
		mat4.multiply(mv, camera.viewMatrix, model);
		mat4.multiply(mvp, camera.projectionMatrix, mv);

		this.gl.useProgram(this.program);
		bindBuffer(this.gl, position.buffer, position.location, 3);
		bindBuffer(this.gl, uv.buffer, uv.location, 2);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, index.buffer);
		this.gl.uniformMatrix4fv(uMVPMatrix, false, mvp);
		this.gl.uniform1f(uTime, this.time);
		activeTexture(this.gl, TexturePools.GET_TEXTURE('tiny01'), this.uniforms.uTexture, 0);

		this.gl.drawElements(this.gl.TRIANGLES, index.cnt, this.gl.UNSIGNED_SHORT, 0);
	}
}