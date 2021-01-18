import './style/main.scss'

import p5 from 'p5'
import { gsap, Power2 } from 'gsap'

import bookCover from './assets/images/lithographie1.jpg'
import videoPoster from './assets/images/lithoThumbnail.jpg'

let stripe = Stripe('pk_live_vUQvEEjQ3CLSAm1wzqJE23ev00dgNmGdR8')

const P5 = new p5(s)

// Display success overlay if the payment is successful
const splitUrl = window.location.href.split('#')
if (splitUrl[splitUrl.length - 1] === 'success') {
	document.querySelector('.successOverlay').style.display = 'flex'
}

// Display video
document.querySelector('#video').poster = videoPoster

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
		this.bgRightPos = P5.createVector(this.pos.x + (P5.cos(angle - 90) * this.lineWeight) / 2 / 2, this.pos.y + (P5.sin(angle - 90) * this.lineWeight) / 2 / 2)
		P5.line(this.bgRightPos.x, this.bgRightPos.y, this.bgRightOldPos.x, this.bgRightOldPos.y)
		this.bgRightOldPos = this.bgRightPos
		// Background left line
		this.bgLeftPos = P5.createVector(this.pos.x + (P5.cos(angle + 90) * this.lineWeight) / 2 / 2, this.pos.y + (P5.sin(angle + 90) * this.lineWeight) / 2 / 2)
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
		this.rightPos = P5.createVector(this.pos.x + (P5.cos(angle - 90) * this.lineWeight) / 2, this.pos.y + (P5.sin(angle - 90) * this.lineWeight) / 2)
		P5.line(this.rightPos.x, this.rightPos.y, this.rightOldPos.x, this.rightOldPos.y)
		this.rightOldPos = this.rightPos
		// Left side line
		this.leftPos = P5.createVector(this.pos.x + (P5.cos(angle + 90) * this.lineWeight) / 2, this.pos.y + (P5.sin(angle + 90) * this.lineWeight) / 2)
		P5.line(this.leftPos.x, this.leftPos.y, this.leftOldPos.x, this.leftOldPos.y)
		this.leftOldPos = this.leftPos
	}
}

let pageTransition = {
	$canvas: document.querySelector('#canvasContainer'),
	$canvasbutton: document.querySelector('.buttonContainer .button'),
	$canvasbuttonText: document.querySelector('.buttonContainer p'),
	$shopOverlay: document.querySelector('.shopOverlay'),
	$buyButton: document.querySelector('.shopOverlay .button'),
	$shippingChoiceCheckBox: document.querySelector('.shopOverlay .buyButtonContainer input'),

	isLaunched: false,
	shopApparition: null,

	setup() {
		this.setupEvents()
		this.setupTimelines()
		this.goToShop()
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

		// Go to payment page on buy button click
		this.$buyButton.addEventListener('click', () => {
			this.goToPayment()
		})

		// Then display the button
		this.displayButton()
	},

	setupTimelines() {
		// Shop page apparition
		this.shopApparition = gsap.timeline({
			paused: true,
			defaultEase: Power2.easeInOut,
		})
		this.shopApparition.from('.shopOverlay .slider', 0.8, {
			opacity: 0,
			x: '-300px',
		})
		this.shopApparition.from('.shopOverlay .title', 0.7, { opacity: 0, y: '200px' }, '-=0.6')
		this.shopApparition.from('.shopOverlay .description h2', 0.5, { opacity: 0, y: '100px' }, '-=0.6')
		this.shopApparition.from('.shopOverlay .description .firstP', 0.5, { opacity: 0, y: '100px' }, '-=0.4')
		this.shopApparition.from('.shopOverlay .description .secondP', 0.5, { opacity: 0, y: '100px' }, '-=0.4')
		this.shopApparition.from('.shopOverlay .description .subtext', 0.5, { opacity: 0, y: '100px' }, '-=0.4')
		this.shopApparition.from('.shopOverlay .prices .classic', 0.45, { opacity: 0, x: '100px' }, '-=0.4')
		this.shopApparition.from('.shopOverlay .prices .collector', 0.45, { opacity: 0, x: '100px' }, '-=0.35')
		this.shopApparition.from('.shopOverlay .buyButtonContainer .shippingChoice', 0.45, { opacity: 0, y: '80px' }, '-=0.35')
		this.shopApparition.from('.shopOverlay .buyButtonContainer .button', 0.45, { opacity: 0, y: '80px' }, '-=0.35')
		// Animate video
		this.shopApparition.to(document.querySelector('#video'), { duration: 0.7, opacity: 1, y: 0 }, '-=1.2')
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
		let diameter = window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight
		gsap.to(this.$canvasbutton, 1.5, {
			width: diameter * 1.5,
			height: diameter * 1.5,
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
		gsap.to(this.$canvasbuttonText, 1, {
			opacity: 0,
			ease: Power2.easeInOut,
		})
	},

	goToPayment() {
		let items = []
		if (shop.classicNumber >= 0) {
			shop.classicNumber === 0 ? (shop.classicNumber = 1) : null
			items.push({
				price: 'price_1I6BFzIe0KUcqb1JdBbVmWM7',
				quantity: shop.classicNumber,
			})
		}
		// if (shop.collectorNumber > 0) {
		// 	items.push({
		// 		price: 'price_1HddAqLdNkflxGiPAWnkblGX',
		// 		quantity: shop.collectorNumber,
		// 	})
		// }
		// Define shipping price
		// let shippingPrice
		items.push({ price: 'price_1I6axQIe0KUcqb1JWTiRBC12', quantity: 1 })
		// if (document.querySelector('#shippingCheckbox').checked) {
		// }
		// if (shop.collectorNumber + shop.classicNumber === 1) {
		// 	// 4,95
		// 	shippingPrice = 'price_1GzSVBLdNkflxGiP0b1G9Yll'
		// } else if (shop.collectorNumber + shop.classicNumber === 2) {
		// 	// 6,35
		// 	shippingPrice = 'price_1GzSVBLdNkflxGiPkhRvar1J'
		// } else if (shop.collectorNumber + shop.classicNumber === 3) {
		// 	// 7,25
		// 	shippingPrice = 'price_1GzSVBLdNkflxGiPB9UJXyeV'
		// } else if (shop.collectorNumber + shop.classicNumber === 4) {
		// 	// 7,95
		// 	shippingPrice = 'price_1GzSVBLdNkflxGiPuYOOhasI'
		// } else if (shop.collectorNumber + shop.classicNumber < 9) {
		// 	// 8,95
		// 	shippingPrice = 'price_1GzSVBLdNkflxGiPCWwwCGJC'
		// } else {
		// 	// 13,75
		// 	shippingPrice = 'price_1GzSVBLdNkflxGiP7Fjz4NBD'
		// }
		// if (shop.collectorNumber + shop.classicNumber === 1) {
		// 	// 7,95
		// 	shippingPrice = 'price_1GzSVBLdNkflxGiPuYOOhasI'
		// } else {
		// 	// 13,75
		// 	shippingPrice = 'price_1GzSVBLdNkflxGiP7Fjz4NBD'
		// }
		// items.push({
		// 	price: shippingPrice,
		// 	quantity: 1,
		// })
		let paymentInfo = {
			lineItems: items,
			mode: 'payment',
			successUrl: `${window.location.href}#success`,
			cancelUrl: window.location.href,
			// shippingAddressCollection: {
			// 	allowedCountries: ['FR'],
			// },
		}
		document.querySelector('#shippingCheckbox').checked ? (paymentInfo.shippingAddressCollection = { allowedCountries: ['FR'] }) : null

		if (shop.classicNumber !== 0 || shop.collectorNumber != 0) {
			stripe.redirectToCheckout(paymentInfo).then(function (result) {
				alert('Il y a une erreur : ' + result.error.message)
			})
		}
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
					x: `-${100.1 * this.index}%`,
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
	classicNumber: 1,
	collectorNumber: 0,
	animationDistance: 25,
	// names: ['classic', 'collector'],
	names: ['classic'],
	shippingPrice: 5,
	totalPrice: 0,

	$classicButtons: document.querySelectorAll('.prices .classic .numberSelector>span'),
	$classicDigits: document.querySelectorAll('.prices .classic .numberSelector .number span'),
	$collectorButtons: document.querySelectorAll('.prices .collector .numberSelector>span'),
	$collectorDigits: document.querySelectorAll('.prices .collector .numberSelector .number span'),

	setup() {
		// Set shipping checkbox basic state

		for (const _name of this.names) {
			this[`$${_name}Digits`][0].innerHTML = this[`${_name}Number`]
			this[`$${_name}Digits`][1].innerHTML = this[`${_name}Number`]
			for (const _button of this[`$${_name}Buttons`]) {
				_button.addEventListener('click', () => {
					if (_button.className === 'less') {
						if (this[`${_name}Number`] > 0) {
							this.updateValue(-1, _name)
							// Disable hand delivery checkbox when there is no collector
							if (_name === 'collector' && this.collectorNumber === 0) {
								pageTransition.shipping = true
								pageTransition.$shippingChoiceCheckBox.disabled = true
								pageTransition.$shippingChoiceCheckBox.checked = false
							}
						}
					} else if (_button.className === 'more') {
						if (this[`${_name}Number`] < 10) {
							this.updateValue(1, _name)
						}
					}
					// Enable hand delivery checkbox when there is at least 1 collector
					if (_name === 'collector' && this.collectorNumber === 1) {
						pageTransition.$shippingChoiceCheckBox.disabled = false
					}
				})
			}
		}
	},

	updateValue(direction, name) {
		this[`${name}Number`] += 1 * direction
		gsap.to(this[`$${name}Digits`][0], 0, { y: 0, opacity: 1 })
		gsap.to(this[`$${name}Digits`][0], 0.3, {
			y: this.animationDistance * -1 * direction,
			opacity: 0,
		})
		this[`$${name}Digits`][1].innerHTML = this[`${name}Number`]
		gsap.to(this[`$${name}Digits`][1], 0, {
			y: this.animationDistance * direction,
			opacity: 0,
		})
		gsap.to(this[`$${name}Digits`][1], 0.3, { y: 0, opacity: 1 })
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
