const { atan, asin, acos, sin, cos, pow, sqrt, abs, PI, random } = Math;

function start({ draw, log, toLocal }) {
	const ps = [
		[520, 170],
		[320, 170],
		[100, 340],
		[300, 140],
		[430, 210],
		[0, 0],
	];

	const fillStyle = ["purple", "red", "pink", "#f3f", "blue"];
	const strokeStyle = [, , , "blue"];
	const strokeWidth = [, , , 1];

	const fillOrder = [0, 1, 2, 3, 4];
	const strokeOrder = [
		[0, 1],
		[0, 2],
		[0, 3],
		[0, 4],
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
		let outAngleIdx;

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
			let i = 0,
				count = gapOrder.length;
			for (let [si, ei] of gapOrder) {
				const sp = ps[si],
					ep = ps[ei];
				const strokeStyle = outAngleIdx === i ? 'red' : '#a6d';

				ctx.save();
				ctx.lineWidth = 3;
				ctx.strokeStyle = strokeStyle;
				ctx.beginPath();
				ctx.moveTo(...sp);
				ctx.lineTo(...ep);

				ctx.stroke();
				ctx.restore();

				i++;
			}
		}

		const angles = updateGapPts();
		// console.log(angles);

		let info = "";
		info += "angles: " + angles.map(v => toAngle(v).toFixed(2)).join("--") + "<br>";

		const { abs } = Math;

		const GapAngleCollectorMapper = (angle, i, arr) => {
			const isFirst = i === 0;

			if (isFirst) {
				return Math.PI * 2 - last(arr) + first(arr);
			} else {
				const prevOne = arr[i - 1];
				return abs(prevOne - angle);
			}

		}

		const MaxiumOnesIndexFinder = ([prev, prevIdx], current, idx, arr) => {
			return prev > current ? [prev, prevIdx] : [current, idx]
		}

		info += "gap angles: " + angles.map(GapAngleCollectorMapper).map(v => toAngle(v).toFixed(2)).join("--") + "<br>";

		const collectedGapAngles = angles.map(GapAngleCollectorMapper);
		const [maxGapAngle, maxGapAngleIdx] = collectedGapAngles.reduce(MaxiumOnesIndexFinder, [collectedGapAngles[0], 0]);

		if (maxGapAngle > Math.PI) {
			outAngleIdx = maxGapAngleIdx;
		}

		log(info);
		drawPts();
		drawLines();
		drawGapPts();
	});

	function genComputeGapPts() {
		let startID = ps.length,
			count = strokeOrder.length;

		function compute() {
			const vecs = new Array(count);
			const tempAngles = vecs.slice();

			const rpts = strokeOrder
				.map(([si, ei], idx) => {
					const sp = ps[si],
						ep = ps[ei];

					const center = Vector(...sp);

					const vec = Vector().by(sp, ep);
					const vec_payload = [vec, vec.angle(), center];
					vecs[idx] = vec_payload;

					return vec_payload;
				})
				.sort((a, b) => a[1] - b[1])
				.map(([_, angle, center], idx, vecs) => {
					let resultAngle = 0;
					let previousAngle;
					if (idx === 0) {
						resultAngle = Math.PI;
						// The one's previous is last one.
						previousAngle = vecs[count - 1][1];
					} else {
						previousAngle = vecs[idx - 1][1];
					}

					resultAngle += (angle + previousAngle) / 2;

					const diffAngle = angle - previousAngle;

					const len = Math.abs(10 / Math.sin(diffAngle / 2));

					tempAngles[idx] = angle;

					return Vector(len, 0)
						.rotate(resultAngle)
						.add(center)
						.toFlat();
				});

			// log(rpts.map(([_, angle]) => Math.floor(angle)));

			return [rpts, tempAngles];
		}

		for (let i = 0; i < count; i++) {
			let id = ps.length;
			let sid = strokeOrder[i][0];
			ps.push([0, 0]);
			gapOrder.push([sid, id]);
		}

		return function update() {
			const [rpts, angles] = compute();
			for (let i = 0; i < count; i++) {
				ps[startID + i] = rpts[i];
			}
			return angles;
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

function first(arr) {
	return arr[0];
}

function last(arr) {
	return arr[arr.length - 1];
}