{
	addEventListener("load", e => {
		console.log("glue has loaded.");

		const stage = document.querySelector(".stage");
		const cvs = stage.querySelector("canvas");
		const info = stage.querySelector(".info");
		const ctx = cvs.getContext("2d");
		let pool = {};
		let width, height;

		const bound = info.getBoundingClientRect();

		start({ cvs, draw, log, toLocal });

		update();
		init();

		addEventListener("resize", init);

		function init() {
			width = stage.offsetWidth;
			height = stage.offsetHeight;
			cvs.width = width;
			cvs.height = height;
		}

		function log(text) {
			info.innerHTML = text;
		}

		function toLocal(...p) {
			return [p[0] - bound.x, p[1] - bound.y];
		}

		function update() {
			ctx.clearRect(0, 0, width, height);
			for (let id in pool) {
				const fn = pool[id];
				ctx.save();
				fn({ ctx, log });
				ctx.restore();
			}

			requestAnimationFrame(update);
		}

		function draw(fn) {
			const id = Date.now() + "";
			pool[id] = fn;
		}
	});
}
