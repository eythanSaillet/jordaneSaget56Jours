import './style/main.scss'

import * as p5 from 'p5'
import { gsap, Power2 } from 'gsap'

import bookCover from './assets/images/bookCover.jpg'
console.log(bookCover)

const P5 = new p5(s)

// P5 Init
let lines = []
let canvas = null
function s(sk) {
	sk.setup = () => {
		canvas = sk.createCanvas(window.innerWidth, window.innerHeight).parent('canvasContainer')
		sk.background(10)
		sk.frameRate(60)
		sk.angleMode(sk.DEGREES)

		// Update mouse pos vector with finger on mobile
		canvas.touchStarted(setMousePos)
		canvas.touchMoved(setMousePos)

		// Create line
		// lines.push(new Line(P5.width / 3, -100))
	}

	sk.draw = () => {
		// Updating lines
		for (const _line of lines) {
			_line.updatePos()
			_line.draw()
		}
	}
}

// Create vector with mouse pos
let mouse = P5.createVector(window.innerWidth / 5, window.innerHeight / 2)
function setMousePos() {
	mouse.x = P5.pmouseX
	mouse.y = P5.pmouseY
}

// Update mouse pos vector with mouse on desktop
window.addEventListener('mousemove', (_event) => {
	setMousePos()
})

class Line {
	constructor(posX, posY) {
		// Physics values
		this.pos = P5.createVector(posX, posY)
		this.vel = P5.createVector(0, 0)
		this.acc = P5.createVector(0, 0)

		this.maxSpeed = 3.5

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
		this.lineWeight = 32
		this.strokeWeight = 4.2
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
	button: document.querySelector('.buttonContainer .button'),
	buttonText: document.querySelector('.buttonContainer p'),
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

		// Then display the button
		this.displayButton()
	},

	// Display button after a delay
	displayButton() {
		setTimeout(() => {
			gsap.to(this.button, 1, { opacity: 1 })
			this.button.style.pointerEvents = 'auto'
			gsap.to(this.buttonText, 1, { opacity: 1 })
		}, 0)
	},
}
pageTransition.setupEvents()

let slider = {
	$imageContainer: document.querySelector('.slider .imageContainer'),
	$images: document.querySelectorAll('.slider .imageContainer img'),
	$indexes: document.querySelectorAll('.sliderIndexesContainer .index'),

	index: 0,
	canSlide: true,

	setup() {
		this.actualizeVisibleIndexes()
		this.$imageContainer.addEventListener('click', () => {
			this.slide()
			this.actualizeVisibleIndexes()
		})
	},

	slide() {
		if (this.canSlide) {
			this.canSlide = false
			this.index === 3 ? (this.index = 1) : this.index++
			for (const _image of this.$images) {
				gsap.to(_image, 0.8, {
					x: `-${100 * this.index}%`,
					ease: Power2.easeInOut,
					onComplete: () => {
						this.canSlide = true
						if (this.index === 3) {
							gsap.to(_image, 0, { x: '0%' })
						}
					},
				})
			}
		}
	},

	actualizeVisibleIndexes() {
		for (let i = 0; i < this.$indexes.length; i++) {
			this.index === i
				? gsap.to(this.$indexes[i], 0.5, { background: 'white' })
				: gsap.to(this.$indexes[i], 0.5, { background: 'none' })
		}
		this.index === 3 ? gsap.to(this.$indexes[0], 0.5, { background: 'white' }) : null
	},
}
slider.setup()

let shop = {
	classicNumber: 0,
	collectorNumber: 1,
	animationDistance: 25,

	setup() {
		let classicButtons = document.querySelectorAll('.prices .classic .numberSelector>span')
		let classicDigit = document.querySelectorAll('.prices .classic .numberSelector .number span')
		classicDigit[0].innerHTML = this.classicNumber
		classicDigit[1].innerHTML = this.classicNumber
		for (const _button of classicButtons) {
			_button.addEventListener('click', () => {
				if (_button.className === 'less') {
					if (this.classicNumber > 0) {
						this.classicNumber--
						gsap.to(classicDigit[0], 0, { y: 0, opacity: 1 })
						gsap.to(classicDigit[0], 0.3, { y: -this.animationDistance, opacity: 0 })
						classicDigit[1].innerHTML = this.classicNumber
						gsap.to(classicDigit[1], 0, { y: this.animationDistance, opacity: 0 })
						gsap.to(classicDigit[1], 0.3, { y: 0, opacity: 1 })
					}
				} else if (_button.className === 'more') {
					if (this.classicNumber < 10) {
						this.classicNumber++
						gsap.to(classicDigit[0], 0, { y: 0, opacity: 1 })
						gsap.to(classicDigit[0], 0.3, { y: this.animationDistance, opacity: 0 })
						classicDigit[1].innerHTML = this.classicNumber
						gsap.to(classicDigit[1], 0, { y: -this.animationDistance, opacity: 0 })
						gsap.to(classicDigit[1], 0.3, { y: 0, opacity: 1 })
					}
				}
			})
		}
	},
}
shop.setup()

let resizer = {
	$imageContainer: document.querySelector('.slider .imageContainer'),
	$image: document.querySelector('.slider .imageContainer img'),
	isLoaded: false,

	setup() {
		console.log(this.$image)
		if (this.$image.isLoaded) {
		}
		this.$image.addEventListener('load', () => {
			if (!this.isLoaded) {
				this.isLoaded = true
				this.resizeImageContainer()
				window.addEventListener('resize', () => {
					this.resizeImageContainer()
				})
			}
		})
		this.$image.src = bookCover
	},

	resizeImageContainer() {
		this.$image.style.width = `max-width: 100%;`
		let width = this.$image.getBoundingClientRect().width
		this.$imageContainer.style.width = `${width}px`
	},
}
resizer.setup()
