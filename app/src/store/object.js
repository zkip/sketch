import { writable } from "svelte/store";

const paths = new Map();
const cameras = new Map();
const modifier = new Map();
const components = new Map();

const subscribers = new Set();

const listeners = new Set();

const m_id_type = {};

function genID() {
	return Math.random() + "" + Date.now();
}

function setup() {}

function publish() {
	for (const [fn] of subscribers.entries()) {
		fn(get());
	}
}

function mutate(id, action, data) {
	for (const [fn] of listeners.entries()) {
		fn(id, action, data);
	}
}

let stop = false;

function clear() {
	subscribers.delete(fn);
}

function get() {
	return { paths, cameras, modifier, components };
}

export default {
	make(type, args) {
		let id;
		if (type == "Path") {
			id = genID();
			m_id_type[id] = "Path";
			paths.set(id, args);
			mutate(id, "M", { type, args });
		}
		publish();
		return id;
	},
	update(id, args) {
		const type = m_id_type[id];
		if (type == "Path") {
			paths.set(id, args);
			mutate(id, "U", { type, args });
		}
		publish();
	},
	clear,
	get,
	mutation(fn) {
		listeners.add(fn);
		return () => {
			listeners.delete(fn);
		};
	},
	subscribe(fn) {
		subscribers.add(fn);

		if (!stop) {
			setup();
			stop = true;
		}

		return clear;
	}
};
