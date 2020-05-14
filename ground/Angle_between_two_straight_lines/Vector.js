function Vector(x = 0, y = 0) {
	const vec = cstor(x, y);

	function cstor(x = 0, y = 0) {
		return {
			x,
			y,
			normalize,
			scale,
			scaleToLen,
			negative,
			add,
			subtract,
			angle,
			angle2,
			angleBy,
			rotate,
			len,
			clone,
			toFlat,
			by,
		};
	}
	function rotate(degree) {
		let _angle = angle() + degree;

		let _len = len();

		vec.x = _len * cos(_angle);
		vec.y = _len * sin(_angle);
		return vec;
	}
	function normalize() {
		let _len = len();
		vec.x /= _len;
		vec.y /= _len;
		return vec;
	}
	function angle() {
		const { x, y } = vec;
		let f = vec.y / len();
		let v;

		if (y === 0 || x === 0) {
			if (y === 0 && x > 0) {
				return 0;
			}
			if (y === 0 && x < 0) {
				return PI;
			}
			if (x === 0 && y > 0) {
				return PI / 2;
			}
			if (x === 0 && y < 0) {
				return -PI / 2;
			}
		} else {
			v = asin(f);
		}

		// 第一象限
		if (x > 0 && y > 0) {
			return v;
		}
		// 第二象限
		if (x < 0 && y > 0) {
			return PI - v;
		}
		// 第三象限
		if (x < 0 && y < 0) {
			return PI - v;
		}
		// 第四象限
		if (x > 0 && y < 0) {
			return PI * 2 + v;
		}
	}
	function angle2() {
		return 2 * atan(vec.x / vec.y) + PI;
	}
	function angleBy(v) {
		let a = abs(v.angle() - vec.angle());
		a = a > PI ? PI * 2 - a : a;
		let corss = v.x * vec.y - vec.x * v.y;
		return a * (corss > 0 ? 1 : -1);
	}
	function len() {
		const { x, y } = vec;
		return sqrt(x * x + y * y);
	}
	function scale(x_r, y) {
		let r, x;
		if (!y) {
			r = x_r;
			vec.x *= r;
			vec.y *= r;
		} else {
			x = x_r;
			vec.x *= x;
			vec.y *= y;
		}
		return vec;
	}
	function scaleToLen(len) {
		normalize();
		scale(len);
		return vec;
	}
	function negative() {
		scale(-1);
		return vec;
	}
	function add(v) {
		vec.x += v.x;
		vec.y += v.y;
		return vec;
	}
	function subtract(v) {
		add(v.clone().scale(-1));
		return vec;
	}
	function clone() {
		return Vector(vec.x, vec.y);
	}
	function toFlat() {
		return [vec.x, vec.y];
	}
	function by(p1, p2) {
		return Vector(p2[0] - p1[0], p2[1] - p1[1]);
	}

	return vec;
}
