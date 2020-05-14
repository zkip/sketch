const { atan, asin, acos, sin, cos, pow, sqrt, abs, PI, random } = Math;

function start({ draw, log, toLocal }) {
	const ps = [
		[520, 170],
		[320, 170],
		[100, 340],
		[300, 140],
		[0, 0],
	];

	const fillStyle = ["purple", "red", "pink", "#f3f", "blue"];
	const strokeStyle = [, , , "blue"];
	const strokeWidth = [, , , 1];

	const fillOrder = [0, 1, 2, 3];
	const strokeOrder = [
		[0, 1],
		[0, 2],
		[0, 3],
	];

	const gapOrder = [];

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

	const vectorOrder = [[0, 1]];

	let linewidth = 100;

	let _bk_move = { strokeStyle: {}, fillStyle: {}, strokeWidth: {} };
	let _lastOrder = [],
		_lastNearestOrder = -1;
	addEventListener("mousemove", (e) => {
		const { clientX, clientY } = e;
		const { nearOrder, nearestOrder } = hit(toLocal(clientX, clientY));

		strokeWidth[_lastNearestOrder] =
			_bk_move.strokeWidth[_lastNearestOrder];
		strokeStyle[_lastNearestOrder] =
			_bk_move.strokeStyle[_lastNearestOrder];
		delete _bk_move.strokeWidth[_lastNearestOrder];
		delete _bk_move.strokeStyle[_lastNearestOrder];

		_bk_move.strokeWidth[nearestOrder] = strokeWidth[nearestOrder];
		_bk_move.strokeStyle[nearestOrder] = strokeStyle[nearestOrder];
		strokeWidth[nearestOrder] = 3;
		strokeStyle[nearestOrder] = "#333";

		_lastOrder = nearOrder;
		_lastNearestOrder = nearestOrder;
	});

	addEventListener("mousedown", (e) => {
		const { clientX, clientY } = e;
		if (_lastNearestOrder >= 0) {
			const nearestOrder = _lastNearestOrder;
			const bp = ps[nearestOrder].slice();
			const ip = toLocal(clientX, clientY);

			const move_fn = (e) => {
				const { clientX, clientY } = e;
				const np = toLocal(clientX, clientY);
				const op = [np[0] - ip[0], np[1] - ip[1]];
				ps[nearestOrder] = [bp[0] + op[0], bp[1] + op[1]];
			};
			const up_fn = () => {
				removeEventListener("mousemove", move_fn);
				removeEventListener("mouseup", up_fn);
			};
			addEventListener("mousemove", move_fn);
			addEventListener("mouseup", up_fn);
		}
	});

	const updateGapPts = genComputeGapPts();
	draw(({ ctx }) => {
		function drawPts() {
			for (let i of fillOrder) {
				const p = ps[i];
				let isFill = false,
					isStroke = true;
				ctx.save();
				ctx.beginPath();
				if (fillStyle[i]) {
					ctx.fillStyle = fillStyle[i];
					isFill = true;
				}
				if (strokeStyle[i]) {
					ctx.strokeStyle = strokeStyle[i];
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

		function drawLines() {
			for (let [si, ei] of strokeOrder) {
				const sp = ps[si],
					ep = ps[ei];
				ctx.save();
				ctx.beginPath();
				ctx.moveTo(...sp);
				ctx.lineTo(...ep);

				ctx.stroke();
				ctx.restore();
			}
		}

		function drawGapPts() {
			for (let [si, ei] of gapOrder) {
				const sp = ps[si],
					ep = ps[ei];
				ctx.save();
				ctx.strokeStyle = "#ee3a";
				ctx.beginPath();
				ctx.setLineDash([5]);
				ctx.moveTo(...sp);
				ctx.lineTo(...ep);

				ctx.stroke();
				ctx.restore();
			}
		}

		updateGapPts();

		drawPts();
		drawLines();
		drawGapPts();
	});

	function genComputeGapPts() {
		let startID = ps.length,
			count = strokeOrder.length;

		function compute() {
			const rpts = [];
			let _lastVec,
				_firstVec,
				_has = false;
			let spt;

			for (let [si, ei] of strokeOrder) {
				const sp = ps[si],
					ep = ps[ei];

				spt = sp;

				const vec = Vector().by(sp, ep);

				if (!_has) {
					_firstVec = vec;
					_has = true;
				}

				if (_lastVec) {
					const angle = (vec.angle() + _lastVec.angle()) / 2;
					rpts.push(
						Vector(100, 0)
							.rotate(angle)
							.add(Vector(...sp))
							.toFlat()
					);
				}

				_lastVec = vec;
			}

			const angle = (_firstVec.angle() + _lastVec.angle()) / 2;
			rpts.push(
				Vector(100, 0)
					.rotate(angle)
					.add(Vector(...spt))
					.toFlat()
			);

			return rpts;
		}

		for (let i = 0; i < count; i++) {
			let id = ps.length;
			let sid = strokeOrder[i][0];
			ps.push([0, 0]);
			gapOrder.push([sid, id]);
		}

		console.log(compute());

		return function update() {
			const rpts = compute();
			for (let i = 0; i < count; i++) {
				ps[startID + i] = rpts[i];
			}
		};
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

function getDistance(...ps) {
	return sqrt(pow(ps[0][0] - ps[1][0], 2) + pow(ps[0][1] - ps[1][1], 2));
}
