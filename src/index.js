import './style/main.scss'

import * as p5 from 'p5'
import { gsap, Power2 } from 'gsap'

import bookCover from './assets/images/bookCover.jpg'

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
		lines.push(new Line(P5.width / 3, -100, 'white'))
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
	constructor(posX, posY, color) {
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
		this.strokeColor = color
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
		P5.stroke('#070707')

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
	$canvas: document.querySelector('#canvasContainer'),
	$canvasbutton: document.querySelector('.buttonContainer .button'),
	$canvasbuttonText: document.querySelector('.buttonContainer p'),
	$shopOverlay: document.querySelector('.shopOverlay'),
	$buyButton: document.querySelector('.shopOverlay .buyButtonContainer .button'),
	$formOverlay: document.querySelector('.formOverlay'),

	isLaunched: false,

	shopApparition: null,
	formApparition: null,

	setup() {
		this.setupEvents()
		this.setupTimelines()
	},

	setupEvents() {
		// Page transition animation
		this.$canvasbutton.addEventListener('click', () => {
			this.goToShop()
		})

		// Canvas button hover animation
		this.$canvasbutton.addEventListener('mouseenter', () => {
			this.isLaunched === false ? gsap.to(this.$canvasbutton, 0.3, { width: 130, height: 130 }) : null
		})
		this.$canvasbutton.addEventListener('mouseleave', () => {
			this.isLaunched === false ? gsap.to(this.$canvasbutton, 0.3, { width: 120, height: 120 }) : null
		})

		// Buy button => form page
		this.$buyButton.addEventListener('click', () => {
			this.goToPayment()
			shop.setupBill()
		})

		// Then display the button
		this.displayButton()
	},

	setupTimelines() {
		// Shop page apparition
		this.shopApparition = gsap.timeline({ paused: true, defaultEase: Power2.easeInOut })
		this.shopApparition.from('.shopOverlay .slider', 0.8, { opacity: 0, x: '-300px' })
		this.shopApparition.from('.shopOverlay .title', 0.7, { opacity: 0, y: '200px' }, '-=0.7')
		this.shopApparition.from('.shopOverlay .description h2', 0.5, { opacity: 0, y: '100px' }, '-=0.6')
		this.shopApparition.from('.shopOverlay .description .firstP', 0.5, { opacity: 0, y: '100px' }, '-=0.4')
		this.shopApparition.from('.shopOverlay .description .secondP', 0.5, { opacity: 0, y: '100px' }, '-=0.4')
		this.shopApparition.from('.shopOverlay .description .subtext', 0.5, { opacity: 0, y: '100px' }, '-=0.4')
		this.shopApparition.from('.shopOverlay .prices .classic', 0.5, { opacity: 0, x: '100px' }, '-=0.4')
		this.shopApparition.from('.shopOverlay .prices .collector', 0.5, { opacity: 0, x: '100px' }, '-=0.4')
		this.shopApparition.from('.shopOverlay .buyButtonContainer .button', 0.5, { opacity: 0, y: '100px' }, '-=0.4')

		// Payment page apparition
		this.formApparition = gsap.timeline({ paused: true, defaultEase: Power2.easeInOut })
		this.formApparition.from('.formOverlay .dedicationContainer', 0.7, { opacity: 0, x: '150px' })
		this.formApparition.from(
			'.formOverlay .shippingChoiceContainer .shippingContainer',
			0.7,
			{
				opacity: 0,
				x: '150px',
			},
			'-=0.8'
		)
		this.formApparition.from(
			'.formOverlay .shippingChoiceContainer .handContainer',
			0.7,
			{
				opacity: 0,
				x: '150px',
			},
			'-=0.6'
		)
		this.formApparition.from('.formOverlay .namesContainer .firstNameContainer', 0.65, { opacity: 0, x: '150px' }, '-=0.6')
		this.formApparition.from('.formOverlay .namesContainer .lastNameContainer', 0.65, { opacity: 0, x: '150px' }, '-=0.6')
		this.formApparition.from('.formOverlay .mailContainer', 0.65, { opacity: 0, x: '150px' }, '-=0.6')
		this.formApparition.from('.formOverlay .countryContainer', 0.65, { opacity: 0, x: '150px' }, '-=0.6')
		this.formApparition.from('.formOverlay .cityContainer', 0.65, { opacity: 0, x: '150px' }, '-=0.6')
		this.formApparition.from('.formOverlay .postalCodeContainer', 0.65, { opacity: 0, x: '150px' }, '-=0.6')
		this.formApparition.from('.formOverlay .streetContainer', 0.65, { opacity: 0, x: '150px' }, '-=0.6')
		this.formApparition.from('.formOverlay .bill .normal', 0.65, { opacity: 0, x: '150px' }, '-=0.6')
		this.formApparition.from('.formOverlay .bill .collector', 0.65, { opacity: 0, x: '150px' }, '-=0.6')
		this.formApparition.from('.formOverlay .bill .shipping', 0.65, { opacity: 0, x: '150px' }, '-=0.6')
		this.formApparition.from('.formOverlay .bill .line', 0.65, { opacity: 0 }, '-=0.65')
		this.formApparition.from('.formOverlay .bill .totalContainer', 0.65, { opacity: 0, x: '150px' }, '-=0.6')
		this.formApparition.from('.formOverlay .cardFormContainer .cardNumberContainer', 0.65, { opacity: 0, x: '150px' }, '-=0.6')
		this.formApparition.from('.formOverlay .cardFormContainer .cardDateContainer', 0.65, { opacity: 0, x: '150px' }, '-=0.6')
		this.formApparition.from('.formOverlay .cardFormContainer .cardCryptoContainer', 0.65, { opacity: 0, x: '150px' }, '-=0.6')
		this.formApparition.from('.formOverlay .payButtonContainer', 0.65, { opacity: 0, y: '150px' }, '-=0.6')
	},

	// Display button after a delay
	displayButton() {
		setTimeout(() => {
			gsap.to(this.$canvasbutton, 1, { opacity: 1 })
			this.$canvasbutton.style.pointerEvents = 'auto'
			gsap.to(this.$canvasbuttonText, 1, { opacity: 1 })
		}, 0)
	},

	goToShop() {
		this.isLaunched = true

		// Animate width and height only to keep the same border weight
		gsap.to(this.$canvasbutton, 1.5, {
			width: window.innerWidth * 1.5,
			height: window.innerWidth * 1.5,
			ease: Power2.easeIn,
			// then stop the line
			onComplete: () => {
				// Clear line
				lines = []

				// Display shop overlay
				this.$shopOverlay.style.visibility = 'visible'
				this.$canvasbutton.style.visibility = 'hidden'

				// Display shop overlay elements
				this.shopApparition.play()

				// Recreate black line
				P5.background('#070707')
				lines.push(new Line(P5.width / 3, -100, 'black'))
			},
		})
		// Make vanish the text
		gsap.to(this.$canvasbuttonText, 1, { opacity: 0, ease: Power2.easeInOut })
	},

	goToPayment() {
		gsap.to(this.$canvas, 0.7, {
			opacity: 0,
			onComplete: () => {
				this.$canvas.style.visibility = 'hidden'
			},
		})
		gsap.to(this.$shopOverlay, 0.7, {
			opacity: 0,
			onComplete: () => {
				this.$shopOverlay.style.visibility = 'hidden'
				this.$formOverlay.style.display = 'flex'
				setTimeout(() => {
					// Display form overlay elements
					this.formApparition.play()
				}, 300)
			},
		})
	},
}
pageTransition.setup()

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
			this.index === i ? gsap.to(this.$indexes[i], 0.5, { background: 'white' }) : gsap.to(this.$indexes[i], 0.5, { background: 'none' })
		}
		this.index === 3 ? gsap.to(this.$indexes[0], 0.5, { background: 'white' }) : null
	},
}
slider.setup()

let shop = {
	classicNumber: 0,
	collectorNumber: 1,
	animationDistance: 25,
	names: ['classic', 'collector'],
	shippingPrice: 5,
	totalPrice: 0,

	$classicButtons: document.querySelectorAll('.prices .classic .numberSelector>span'),
	$classicDigits: document.querySelectorAll('.prices .classic .numberSelector .number span'),
	$collectorButtons: document.querySelectorAll('.prices .collector .numberSelector>span'),
	$collectorDigits: document.querySelectorAll('.prices .collector .numberSelector .number span'),

	$billClassicNumber: document.querySelector('.formOverlay .bill .normal .number span'),
	$billCollectorNumber: document.querySelector('.formOverlay .bill .collector .number span'),
	$billClassicPrice: document.querySelector('.formOverlay .bill .normal .price'),
	$billCollectorPrice: document.querySelector('.formOverlay .bill .collector .price'),

	$billShippingPrice: document.querySelector('.formOverlay .bill .shipping .price'),
	$billTotal: document.querySelector('.formOverlay .bill .totalContainer .total'),
	$shippingChoiceContainer: document.querySelector('.shippingChoiceContainer'),

	setup() {
		for (const _name of this.names) {
			this[`$${_name}Digits`][0].innerHTML = this[`${_name}Number`]
			this[`$${_name}Digits`][1].innerHTML = this[`${_name}Number`]
			for (const _button of this[`$${_name}Buttons`]) {
				_button.addEventListener('click', () => {
					if (_button.className === 'less') {
						if (this[`${_name}Number`] > 0) {
							this.updateValue(-1, _name)
						}
					} else if (_button.className === 'more') {
						if (this[`${_name}Number`] < 10) {
							this.updateValue(1, _name)
						}
					}
				})
			}
		}
		this.setupShippingChoiceEvents()
	},

	updateValue(direction, name) {
		this[`${name}Number`] += 1 * direction
		gsap.to(this[`$${name}Digits`][0], 0, { y: 0, opacity: 1 })
		gsap.to(this[`$${name}Digits`][0], 0.3, { y: this.animationDistance * -1 * direction, opacity: 0 })
		this[`$${name}Digits`][1].innerHTML = this[`${name}Number`]
		gsap.to(this[`$${name}Digits`][1], 0, { y: this.animationDistance * direction, opacity: 0 })
		gsap.to(this[`$${name}Digits`][1], 0.3, { y: 0, opacity: 1 })
	},

	setupBill() {
		// Update numbers
		this.$billClassicNumber.innerHTML = this.classicNumber
		this.$billCollectorNumber.innerHTML = this.collectorNumber
		// Update prices
		this.$billClassicPrice.innerHTML = `${this.classicNumber * 28.75} €`
		this.$billCollectorPrice.innerHTML = `${this.collectorNumber * 56} €`
		this.totalPrice = this.classicNumber * 28.75 + this.collectorNumber * 56 + 5
		this.$billTotal.innerHTML = `${this.totalPrice} €`

		// Hide sipping choice if there is no collector
		if (this.collectorNumber === 0) {
			this.$shippingChoiceContainer.style.display = 'none'
		}
	},

	setupShippingChoiceEvents() {
		document.querySelector('.shippingChoiceContainer .shippingContainer input').addEventListener('click', () => {
			this.updateShippingBill(5)
		})
		document.querySelector('.shippingChoiceContainer .handContainer input').addEventListener('click', () => {
			this.updateShippingBill(0)
		})
	},

	updateShippingBill(price) {
		gsap.to(this, 0.7, {
			shippingPrice: price,
			onUpdate: () => {
				this.$billShippingPrice.innerHTML = `${Math.ceil(this.shippingPrice)} €`
			},
		})
		gsap.to(this, 0.7, {
			totalPrice: this.classicNumber * 28.75 + this.collectorNumber * 56 + price,
			onUpdate: () => {
				this.$billTotal.innerHTML = `${Math.ceil(this.totalPrice)} €`
			},
		})
	},
}
shop.setup()

let resizer = {
	$imageContainer: document.querySelector('.slider .imageContainer'),
	$image: document.querySelector('.slider .imageContainer img'),
	isLoaded: false,

	setup() {
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
