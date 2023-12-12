customElements.define(
	"rating-widget",
	class extends HTMLElement {
		numStars = 5;

		constructor() {
			super();
			this.attachShadow({ mode: "open" });
		}

		connectedCallback() {
			if (!this.shadowRoot) {
				throw new Error("Shadow root must be initialized");
			}

			const inputEl = document.querySelector('input[name="rating"]');
			if (inputEl) {
				this.numStars = clamp(parseInt(inputEl.max), 3, 10);
			}

			this.shadowRoot.innerHTML = `
			<div id="container">
				<p>How satisfied are you?</p>

				<div class="stars">
					${range(this.numStars)
						.map(
							(i) =>
								`<button data-rating="${
									this.numStars - i
								}">★</button>`
						)
						.join("")}
				</div>

				<div class="output"></div>
			</div>

			<style>
				* {
					margin: 0;
					padding: 0;
				}

				:host {
					--star-color: #aaa;
					--star-color-hover: #facc15;
				}

				button {
					all: unset;
				}

				#container {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					gap: 0.5rem;
					padding: 1rem;
					padding-top: 1.5rem;
					border-radius: 1rem;
					background-color: #fff;
					text-align: center;
					box-shadow: 0.1rem 0.2rem 0.5rem #0004;
				}

				p {
					font-weight: 600;
					color: #333;
				}

				.stars {
					display: inline-flex;
					flex-direction: row-reverse;
					font-size: 2rem;
					user-select: none;

				}
				
				.stars > * {
					color: var(--star-color);
					cursor: pointer;
				}

				.stars > *:hover ~ *,
				.stars > *:hover
				{
					color: var(--star-color-hover);
				}

				.output {
					color: #666;
				}
			</style>
		`;

			this.shadowRoot.querySelectorAll("button").forEach((button) => {
				button.addEventListener("click", () =>
					this.onStarClick(button)
				);
			});
		}

		disconnectedCallback() {
			this.shadowRoot.querySelectorAll("button").forEach((button) => {
				button.removeEventListener("click", () =>
					this.onStarClick(button)
				);
			});
		}

		submitRating(rating) {
			const output = this.shadowRoot.querySelector(".output");
			if (output) {
				output.textContent = this.getOutput(rating);
			}

			const stars = this.shadowRoot.querySelector(".stars");
			stars.style.display = "none";

			fetch("https://httpbin.org/post", {
				method: "POST",
				body: JSON.stringify({
					question: "How satisfied are you?",
					rating,
					sentBy: "JavaScript",
				}),
				headers: {
					"X-Sent-By": "JavaScript",
				},
			})
				.then((response) => response.json())
				.then((response) => {
					console.log(response);
				});
		}

		onStarClick(button) {
			const rating = button.dataset.rating;
			this.submitRating(rating);
		}

		getOutput(rating) {
			if (rating < 0.8 * this.numStars) {
				return `Thanks for the feedback of ${rating} stars. We'll try to do better!`;
			}

			return `Thanks for the ${rating} star rating!`;
		}
	}
);

function clamp(num, min, max) {
	return Math.min(Math.max(num, min), max);
}

function range(num) {
	return Array.from({ length: num }, (_, i) => i);
}
