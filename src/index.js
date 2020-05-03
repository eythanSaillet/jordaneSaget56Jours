import './style/main.scss'

import * as p5 from 'p5'
import { gsap, Power2 } from 'gsap'

const P5 = new p5(s)

// P5 Init
let lines = []
function s(sk) {
	sk.setup = () => {
		sk.createCanvas(window.innerWidth, window.innerHeight).parent('canvasContainer')
		sk.background(10)
		sk.frameRate(60)
		sk.angleMode(sk.DEGREES)

		// Create line
		lines.push(new Line(P5.width / 2 - 150, -100))
	}

	sk.draw = () => {
		// Updating lines
		for (const _line of lines) {
			_line.updatePos()
			_line.draw()
		}
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

		this.maxSpeed = 4

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
		this.lineWeight = 30
		this.strokeWeight = 3
		this.strokeColor = 'white'
	}

	updatePos() {
		// Update acceleration
		this.acc = p5.Vector.sub(mouse, this.pos)
		this.acc.setMag(0.15)

		// Simulate physics
		this.vel.add(this.acc)
		this.vel.setMag(this.maxSpeed)
		this.pos.add(this.vel)
	}

	draw() {
		P5.noFill()
		let angle = this.vel.heading()

		// Background lines style
		P5.strokeWeight(this.lineWeight / 2 - this.strokeWeight)
		P5.stroke('black')

		// Background right line
		this.bgRightPos = P5.createVector(
			this.pos.x + (P5.cos(angle - 90) * this.lineWeight) / 2 / 2,
			this.pos.y + (P5.sin(angle - 90) * this.lineWeight) / 2 / 2
		)
		P5.line(this.bgRightPos.x, this.bgRightPos.y, this.bgRightOldPos.x, this.bgRightOldPos.y)
		this.bgRightOldPos = this.bgRightPos
		// Background left line
		this.bgLeftPos = P5.createVector(
			this.pos.x + (P5.cos(angle + 90) * this.lineWeight) / 2 / 2,
			this.pos.y + (P5.sin(angle + 90) * this.lineWeight) / 2 / 2
		)
		P5.line(this.bgLeftPos.x, this.bgLeftPos.y, this.bgLeftOldPos.x, this.bgLeftOldPos.y)
		this.bgLeftOldPos = this.bgLeftPos

		// Front lines style
		P5.strokeWeight(this.strokeWeight)
		P5.stroke(this.strokeColor)

		// Center line
		P5.line(this.pos.x, this.pos.y, this.oldPos.x, this.oldPos.y)
		this.oldPos.x = this.pos.x
		this.oldPos.y = this.pos.y

		// Sides line
		// Right side line
		this.rightPos = P5.createVector(
			this.pos.x + (P5.cos(angle - 90) * this.lineWeight) / 2,
			this.pos.y + (P5.sin(angle - 90) * this.lineWeight) / 2
		)
		P5.line(this.rightPos.x, this.rightPos.y, this.rightOldPos.x, this.rightOldPos.y)
		this.rightOldPos = this.rightPos
		// Left side line
		this.leftPos = P5.createVector(
			this.pos.x + (P5.cos(angle + 90) * this.lineWeight) / 2,
			this.pos.y + (P5.sin(angle + 90) * this.lineWeight) / 2
		)
		P5.line(this.leftPos.x, this.leftPos.y, this.leftOldPos.x, this.leftOldPos.y)
		this.leftOldPos = this.leftPos
	}
}

let pageTransition = {
	button: document.querySelector('.interface .button'),
	buttonText: document.querySelector('.interface p'),
	isLaunched: false,

	setupEvents() {
		// Page transition animation
		this.button.addEventListener('click', () => {
			this.isLaunched = true
			// Animate width and height only to keep the same border weight
			gsap.to(this.button, 1.7, {
				width: 2000,
				height: 2000,
				ease: Power2.easeInOut,
				// then stop the line
				onComplete: () => {
					lines = []
				},
			})
			// Make vanish the text
			gsap.to(this.buttonText, 1, { opacity: 0, ease: Power2.easeInOut })
		})

		// Button hover animation
		this.button.addEventListener('mouseenter', () => {
			this.isLaunched === false ? gsap.to(this.button, 0.3, { width: 130, height: 130 }) : null
		})
		this.button.addEventListener('mouseleave', () => {
			this.isLaunched === false ? gsap.to(this.button, 0.3, { width: 120, height: 120 }) : null
		})
	},
}
pageTransition.setupEvents()
