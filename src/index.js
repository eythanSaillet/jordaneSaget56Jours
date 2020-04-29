import './style/main.scss'

import * as p5 from 'p5'

const P5 = new p5(s)

let line
function s(sk) {
	sk.setup = () => {
		sk.createCanvas(window.innerWidth, window.innerHeight).parent('canvasContainer')
		sk.background(0)
		sk.frameRate(60)
		sk.angleMode(sk.DEGREES)

		// Create line
		line = new Line(P5.width / 2, P5.height / 2)
	}

	sk.draw = () => {
		// Update line
		line.updatePos()
		line.draw()
	}
}

let mouse = P5.createVector()
window.addEventListener('mousemove', (_event) => {
	mouse.x = _event.clientX
	mouse.y = _event.clientY
})

class Line {
	constructor(posX, posY) {
		// Physics values
		this.pos = P5.createVector(posX, posY)
		this.oldPos = P5.createVector(posX, posY)
		this.vel = P5.createVector(0, 0)
		this.acc = P5.createVector(0, 0)

		this.maxSpeed = 2
		// this.minSpeed = 1

		// Style properties
		this.strokeWeight = 3
		this.strokeColor = 'white'
	}

	updatePos() {
		this.acc = p5.Vector.sub(mouse, this.pos)
		this.acc.setMag(0.05)

		this.vel.add(this.acc)
		this.vel.setMag(this.maxSpeed)
		this.pos.add(this.vel)
	}

	draw() {
		P5.strokeWeight(this.strokeWeight)
		P5.stroke('white')
		P5.line(this.oldPos.x, this.oldPos.y, this.pos.x, this.pos.y)
		this.oldPos = this.pos
		// P5.background('black')
		// console.log(this.vel.heading())
		// P5.line(this.pos.x, this.pos.y, this.pos.x, this.pos.y - 10)
		console.log('hey')
	}
}
