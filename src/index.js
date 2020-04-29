import './style/main.scss'

import * as p5 from 'p5'

const P5 = new p5(s)

// P5 Init
let line
function s(sk) {
	sk.setup = () => {
		sk.createCanvas(window.innerWidth, window.innerHeight).parent('canvasContainer')
		sk.background(10)
		sk.frameRate(60)
		sk.angleMode(sk.DEGREES)

		// Create line
		line = new Line(P5.width / 2, -100)
	}

	sk.draw = () => {
		// Update line
		line.updatePos()
		line.draw()
	}
}

// Mouse position
let mouse = P5.createVector()
window.addEventListener('mousemove', (_event) => {
	mouse.x = _event.clientX
	mouse.y = _event.clientY
})

class Line {
	constructor(posX, posY) {
		// Physics values
		this.pos = P5.createVector(posX, posY)
		this.vel = P5.createVector(0, 0)
		this.acc = P5.createVector(0, 0)

		this.maxSpeed = 2

		// Drawing values
		this.oldPos = P5.createVector(posX, posY)
		this.leftPos = null
		this.leftOldPos = P5.createVector(posX, posY)
		this.rightPos = null
		this.rightOldPos = P5.createVector(posX, posY)
		this.bgRightPos = null
		this.bgRightOldPos = P5.createVector(posX, posY)
		this.bgLeftPos = null
		this.bgLeftOldPos = P5.createVector(posX, posY)

		// Style properties
		this.lineWeight = 20
		this.strokeWeight = 2
		this.strokeColor = 'white'
	}

	updatePos() {
		// Update acceleration
		this.acc = p5.Vector.sub(mouse, this.pos)
		this.acc.setMag(0.05)

		// Simulate physics
		this.vel.add(this.acc)
		this.vel.setMag(this.maxSpeed)
		this.pos.add(this.vel)
	}

	draw() {
		P5.noFill()
		let angle = this.vel.heading()

		// Line background
		P5.strokeWeight(this.lineWeight / 2 - this.strokeWeight)
		P5.stroke('black')

		// Background lines
		this.bgRightPos = P5.createVector(
			this.pos.x + (P5.cos(angle - 90) * this.lineWeight) / 2 / 2,
			this.pos.y + (P5.sin(angle - 90) * this.lineWeight) / 2 / 2
		)
		P5.line(this.bgRightPos.x, this.bgRightPos.y, this.bgRightOldPos.x, this.bgRightOldPos.y)
		this.bgRightOldPos = this.bgRightPos

		this.bgLeftPos = P5.createVector(
			this.pos.x + (P5.cos(angle + 90) * this.lineWeight) / 2 / 2,
			this.pos.y + (P5.sin(angle + 90) * this.lineWeight) / 2 / 2
		)
		P5.line(this.bgLeftPos.x, this.bgLeftPos.y, this.bgLeftOldPos.x, this.bgLeftOldPos.y)
		this.bgLeftOldPos = this.bgLeftPos

		// Center line
		P5.strokeWeight(this.strokeWeight)
		P5.stroke(this.strokeColor)
		P5.line(this.pos.x, this.pos.y, this.oldPos.x, this.oldPos.y)

		this.oldPos.x = this.pos.x
		this.oldPos.y = this.pos.y

		// Sides line
		this.rightPos = P5.createVector(
			this.pos.x + (P5.cos(angle - 90) * this.lineWeight) / 2,
			this.pos.y + (P5.sin(angle - 90) * this.lineWeight) / 2
		)
		P5.line(this.rightPos.x, this.rightPos.y, this.rightOldPos.x, this.rightOldPos.y)
		this.rightOldPos = this.rightPos

		this.leftPos = P5.createVector(
			this.pos.x + (P5.cos(angle + 90) * this.lineWeight) / 2,
			this.pos.y + (P5.sin(angle + 90) * this.lineWeight) / 2
		)
		P5.line(this.leftPos.x, this.leftPos.y, this.leftOldPos.x, this.leftOldPos.y)
		this.leftOldPos = this.leftPos
	}
}
