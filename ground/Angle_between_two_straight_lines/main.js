const { atan, asin, acos, sin, cos, pow, sqrt, abs, PI, random } = Math;

function start({ draw, log, toLocal }) {
	const ps = [
		[520, 170],
		[320, 170],
		[100, 340],
		[300, 140],
		[0, 0]
	];

	const fillColor = ["purple", "red", "pink", "#f3f", "blue"];
	const strokeColor = ["blue"];
	const strokeWidth = [1];

	const fillOrder = [[0, 1, 2, 3]];
	const strokeOrder = [[0, 1, 2, 3]];

	const vectorOrder = [];

	let linewidth = 100;

	const updateFlat1 = addFlatPts();

	let _bk_move = { strokeStyle: {}, fillStyle: {}, strokeWidth: {} };
	let _lastOrder = [],
		_lastNearestOrder = -1;
	addEventListener("mousemove", e => {
		const { clientX, clientY } = e;
		const { nearOrder, nearestOrder } = hit(toLocal(clientX, clientY));

		strokeWidth[_lastNearestOrder] =
			_bk_move.strokeWidth[_lastNearestOrder];
		strokeColor[_lastNearestOrder] =
			_bk_move.strokeStyle[_lastNearestOrder];
		delete _bk_move.strokeWidth[_lastNearestOrder];
		delete _bk_move.strokeStyle[_lastNearestOrder];

		_bk_move.strokeWidth[nearestOrder] = strokeWidth[nearestOrder];
		_bk_move.strokeStyle[nearestOrder] = strokeColor[nearestOrder];
		strokeWidth[nearestOrder] = 3;
		strokeColor[nearestOrder] = "#333";

		_lastOrder = nearOrder;
		_lastNearestOrder = nearestOrder;
	});

	function randomColor() {
		return `rgb(${[
			(random() * 255) >> 0,
			(random() * 255) >> 0,
			(random() * 255) >> 0
		].join(",")})`;
	}

	function addRandomPt() {
		ps.push([random() * 500 + 20, random() * 400 + 40]);
		fillColor.push(randomColor());
		fillOrder.push(ps.length - 1);
	}

	function addFlatPts() {
		const startID = ps.length;
		const rpts = gen();
		for (let i = 0; i < rpts.length; i++) {
			ps.push(rpts[i]);
			fillColor.push("#567");
			fillOrder.push(startID + i);
		}
		console.log(ps);

		function gen() {
			return genFlatPts(linewidth, ps.slice(0, 4));
		}

		return function update() {
			const rpts = gen();
			for (let i = 0; i < rpts.length; i++) {
				ps[i + startID] = rpts[i];
			}
		};
	}

	addEventListener("mousedown", e => {
		const { clientX, clientY } = e;
		if (_lastNearestOrder >= 0) {
			const nearestOrder = _lastNearestOrder;
			const bp = ps[nearestOrder].slice();
			const ip = toLocal(clientX, clientY);

			const move_fn = e => {
				const { clientX, clientY } = e;
				const np = toLocal(clientX, clientY);
				const op = [np[0] - ip[0], np[1] - ip[1]];
				ps[nearestOrder] = [bp[0] + op[0], bp[1] + op[1]];

				updateFlat1();
				// compute();

				// log(`
				// vec0.angle: ${toAngle(vec0.angle())}<br>
				// vec1.angle: ${toAngle(vec1.angle())}<br>
				// vecB.angle: ${toAngle(betweenVec.angle())}<br>
				// vecThinta: ${toAngle(a)}<br>
				// `);
			};
			const up_fn = () => {
				removeEventListener("mousemove", move_fn);
				removeEventListener("mouseup", up_fn);
			};
			addEventListener("mousemove", move_fn);
			addEventListener("mouseup", up_fn);
		}
	});

	function hit(p) {
		let nearOrder = [];
		let nearestOrder = -1;
		let nearestDist = -1;
		for (let i = 0; i < fillOrder.length; i++) {
			const dist = getDistance(ps[fillOrder[i]], p);
			if (!i) {
				nearestDist = dist;
			}
			if (dist < 40) {
				if (!i) {
					nearestOrder = fillOrder[i];
				}
				if (nearestDist > dist) {
					nearestDist = dist;
					nearestOrder = fillOrder[i];
				}
				nearOrder.push(fillOrder[i]);
			}
		}
		return { nearOrder, nearestOrder, nearestDist };
	}

	function getDistance(...ps) {
		return sqrt(pow(ps[0][0] - ps[1][0], 2) + pow(ps[0][1] - ps[1][1], 2));
	}

	draw(({ ctx }) => {
		function drawPts() {
			for (let i of fillOrder) {
				const p = ps[i];
				let isFill = false,
					isStroke = true;
				ctx.save();
				ctx.beginPath();
				if (fillColor[i]) {
					ctx.fillStyle = fillColor[i];
					isFill = true;
				}
				if (strokeColor[i]) {
					ctx.strokeStyle = strokeColor[i];
				} else {
					isStroke = false;
				}
				if (strokeWidth[i]) {
					ctx.lineWidth = strokeWidth[i];
				} else {
					isStroke = false;
				}
				ctx.arc(...p, 10, 0, Math.PI * 2);

				isFill && ctx.fill();
				isStroke && ctx.stroke();
				ctx.restore();
			}
		}
		function drawMainLine() {
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(...ps[strokeOrder[0]]);
			for (let i = 1; i < strokeOrder.length; i++) {
				ctx.lineTo(...ps[strokeOrder[i]]);
			}
			ctx.stroke();
			ctx.restore();
		}
		function drawVectors() {
			function drawVector(i) {
				let vec = genVector(i);
				let _len = vec.len();
				ctx.save();
				ctx.rotate(vec.angle());
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(_len, 0);
				ctx.lineTo(_len, -10);
				ctx.stroke();
				ctx.restore();
			}
			ctx.save();
			ctx.translate(...toLocal(innerWidth / 2, innerHeight / 2));
			for (let i = 0; i < vectorOrder.length; i++) {
				drawVector(i);
			}
			ctx.restore();
		}

		drawPts();
		drawMainLine();
		drawVectors();
	});

	function compute() {
		let vec1 = genVector(0);
		let vec2 = genVector(1);
		let center = vec2.angleBy(vec1) / 2;
		let miterLen = linewidth / 2 / sin(center);
		betweenVec = vec1
			.clone()
			.rotate(center + PI)
			.scaleToLen(miterLen);
	}

	function genVector(order) {
		let vo = vectorOrder[order];
		let p1 = ps[vo[0]],
			p2 = vo.length === 1 ? [0, 0] : ps[vo[1]];
		let vec = Vector(p2[0] - p1[0], p2[1] - p1[1]);
		return vec;
	}
}

function genFlatPts(width, pts, router = []) {
	const count = pts.length;
	const flatCount = count * 2;
	const rpts = new Array(flatCount);
	const widthHalf = width / 2;

	let bpt = Vector(...pts[0]);

	function make(cVec, lVec, isSide) {
		// angle between
		let ab = isSide ? 0 : cVec.angleBy(lVec.clone().negative());

		let angleOffset = isSide ? 0 : PI / 2 - ab / 2;
		let r = isSide ? widthHalf : widthHalf / sin(ab / 2);

		let goVec = cVec
			.clone()
			.scaleToLen(r)
			.rotate(PI / 2 + angleOffset);

		let backVec = goVec.clone().rotate(PI);

		return [goVec, backVec];
	}
	function set(order, go, back) {
		rpts[order] = go.add(bpt).toFlat();
		rpts[flatCount - order - 1] = back.add(bpt).toFlat();
	}

	let _lastPt = Vector(...pts[0]);
	let _lastVec = null;
	for (let i = 1; i < count; i++) {
		let cVec = Vector(...pts[i]).subtract(_lastPt);
		let [go, back] = make(cVec, _lastVec, !_lastVec);
		set(i - 1, go, back);

		bpt.add(cVec);

		_lastVec = cVec.clone();
		_lastPt = Vector(...pts[i]);
	}
	set(count - 1, ...make(_lastVec, _lastVec, true));

	return rpts;
}

function toAngle(rad) {
	return (rad / Math.PI) * 180;
}

function toRadian(angle) {
	return (angle * Math.PI) / 180;
}
