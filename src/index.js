import './style/main.scss'

import * as p5 from 'p5'

const P5 = new p5(s)

let line
function s(sk) {
	sk.setup = () => {
		sk.createCanvas(window.innerWidth, window.innerHeight).parent('canvasContainer')
		sk.background(0)
		// sk.frameRate(60)
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

class Line {
	constructor(posX, posY) {
		// Physics values
		this.pos = P5.createVector(posX, posY)
		this.vel = P5.createVector(0, 0)
		this.acc = P5.createVector(0, 0)
		this.angle = null

		this.maxSpeed = 5

		// Style properties
		this.strokeWeight = 5
		this.strokeColor = 'white'

		// Noise
		this.noiseOff = 0
		this.noiseIncrementation = 0.0005
	}

	updatePos() {
		this.noiseOff += this.noiseIncrementation
		this.angle = (P5.noise(this.noiseOff) - 0.5) * 180
		// console.log(this.angle)
		// Convert angle into Vector2
		this.acc.x = Math.cos(this.angle)
		this.acc.y = Math.sin(this.angle)

		// Adding acceleration to velocity then velocity to position
		this.vel.add(this.acc)
		this.vel.limit(this.maxSpeed)
		this.pos.add(this.vel)
	}

	draw() {
		P5.strokeWeight(this.strokeWeight)
		P5.stroke('white')
		P5.point(this.pos.x, this.pos.y)
	}
}
