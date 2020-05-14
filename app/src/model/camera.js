import { writable } from "svelte/store";
import object from "@/store/object";

// export const pool = new Map();
export let count = 0;

const C = {
	matrix: null
};

const assign = Object.assign;
const combine = v => assign({}, v);

export default () => {
	const camera = combine(C);
	const m_id_object = new Map();
	const m_object_id = new Map();

	let ready = false;
	let ID, _project, _paper;

	const clear_object_mutation = object.mutation(render);

	function set(v) {
		assign(camera, v);
		console.log(camera, v);
		const { matrix } = camera;
		if (matrix) {
			_project.view.matrix.set(...matrix.values);
		}
		return camera;
	}

	function update(data) {
		if (ready) {
			set(data);
		}
	}

	function clear() {
		if (ready) {
			clear_object_mutation();
			ready = false;
		}
	}

	function subscribe(val) {
		if (ready) {
			val(set(camera));
		}
		return clear;
	}

	function setup(init, project, paper) {
		if (ready) return;
		_project = project;
		_paper = paper;
		assign(camera, init);
		ready = true;
		update(camera);
		const { paths } = object.get();
		const { Path } = _paper;
		for (const [id, args] of paths.entries()) {
			const ele = new Path(args);
			ele.strokeColor = "red";
			m_id_object.set(id, ele);
			m_object_id.set(ele, id);
		}
	}

	function get() {
		return camera;
	}

	function render(id, action, data) {
		if (!ready) return;
		const { Path } = _paper;
		const { type, args } = data;
		let ele = m_id_object.get(id);
		if (!ele) {
			if (type == "Path") {
				ele = new Path();
				m_id_object.set(id, ele);
				m_object_id.set(ele, id);
			}
		}
		if (type == "Path") {
			ele.segments = args;
		} else if (type == "Modifier") {
		} else if (type == "Component") {
		} else if (type == "Instance") {
		}
	}

	return { update, subscribe, clear, setup, get };
};
