import * as sapper from "@sapper/app";
import object from "@/store/object";

const id = object.make("Path", [
	[0, 0],
	[100, 100]
]);

setInterval(() => {
	object.update(id, [
		[Math.random() * 200, Math.random() * 200],
		[100, 100]
	]);
}, 500);

sapper.start({
	target: document.querySelector("#sapper")
});
