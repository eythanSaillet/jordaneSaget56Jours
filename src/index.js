import './style/main.scss'

import * as p5 from 'p5'

const P5 = new p5(s)

function s(sk) {
	sk.setup = () => {
		sk.createCanvas(window.innerWidth / 2, window.innerHeight / 2).parent('canvasContainer')
		sk.background(0)
	}

	sk.draw = () => {}
}
