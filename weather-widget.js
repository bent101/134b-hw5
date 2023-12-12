customElements.define(
	"weather-widget",
	class extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: "open" });
		}

		connectedCallback() {
			if (!this.shadowRoot) {
				throw new Error("Shadow root must be initialized");
			}

			this.shadowRoot.innerHTML = `
			<div id="container">
				<div id="backdrop"></div>

				<div id="content">
					<h2>Curent Weather</h2>
					<p id="temp"></p>
					<div id="icon"></div>
					<p id="conditions"></p>
					<p id="details"></p>
				</div>
			</div>


			<style>
				* {
					margin: 0;
					padding: 0;
				}
				
				#container {
					background-size: cover;
					background-position: center;
					backdrop-filter: blur(10px);
					padding: 1rem;
					border-radius: 1rem;
					position: relative;
					box-shadow: 0.1rem 0.2rem 0.4rem #0004;
					
				}

				#backdrop {
					position: absolute;
					inset: 0;
					background-color: #000a;
					border-radius: inherit;
					z-index: -1;
					backdrop-filter: blur(0.5rem);
				}

				#content {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					height: 13rem;
					gap: 0.5rem;
					opacity: 0;
					transition: opacity 0.1s ease-in-out;
				}

				h2 {
					font-size: 0.8rem;
					text-transform: uppercase;
					font-weight: 800;
					letter-spacing: 0.1em;
					color: #fff8;
				}


				#temp {
					font-size: 4rem;
					font-weight: 800;
					color: #fff;
					padding-top: 1rem;
				}

				#conditions {
					color: #fffc;
					font-size: 1.2rem;
					font-weight: 600;
				}

				#details {
					color: #fff9;
					font-size: 1rem;
					padding-top: 1rem;
				}

				b {
					font-weight: 800;
					color: #fff;
				}

				.sup {
					font-size: 0.5em;
					display: inline-block;
					transform: translateY(-0.7em);
					color: #fff8;
				}

				#icon {
					color: white;
					display: inline;
					fill: white;
					stroke: white;
				}
			</style>

			`;

			const container = this.shadowRoot.querySelector("#container");
			const tempEl = this.shadowRoot.querySelector("#temp");
			const conditionsEl = this.shadowRoot.querySelector("#conditions");
			const detailsEl = this.shadowRoot.querySelector("#details");
			const contentEl = this.shadowRoot.querySelector("#content");
			const iconEl = this.shadowRoot.querySelector("#icon");

			fetch("https://api.weather.gov/gridpoints/SGX/53,20/forecast")
				.then((res) => res.json())
				.then((data) => {
					const currentWeather = data.properties.periods[0];

					tempEl.innerHTML = `${currentWeather.temperature}<span class="sup">°${currentWeather.temperatureUnit}</span>`;

					const conditions = currentWeather.shortForecast;
					conditionsEl.innerHTML = conditions;
					iconEl.innerHTML = this.getIcon(conditions);

					const windDetails = `<b>${currentWeather.windSpeed}</b> wind`;
					const humidityDetails = `<b>${currentWeather.relativeHumidity.value}%</b> humidity`;
					detailsEl.innerHTML = `${windDetails} • ${humidityDetails}`;

					container.style.backgroundImage = `url(${currentWeather.icon})`;
					contentEl.style.opacity = 1;
				})
				.catch((error) => {
					console.error(error);

					this.shadowRoot.innerHTML =
						"Weather data is unavailable at this time, please try again later.";
				});
		}

		getIcon(conditions) {
			const icon =
				["cloud", "fog", "sun", "rain"].find((icon) =>
					conditions.toLowerCase().includes(icon)
				) ?? "sun";

			return `
				<img src="icons/${icon}.svg" alt="${conditions}" />
			`;
		}
	}
);
