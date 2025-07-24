
  const headlineLines = document.querySelectorAll('.headline-line');
  const subtextEl = document.querySelector('.subtext');

  const textSets = [
    {
      lines: [
        "Explore places you’ve only dreamed",  
        "of visiting—safely, comfortably", 
        "and memorably with our guided adventures."
      ],
      subtext: "Don’t worry about the quality of the service."
    },
    {
      lines: [
        "Let your curiosity lead the way as", 
        "we bring you face-to-face",
        "with world wonders and cultures."
      ],
      subtext: "Stay with us for unforgettable experiences."
    },
    {
      lines: [
        "Relax—we handle the logistics while", 
        "you soak up the joy, wonder", 
        "and magic of the journey."
      ],
      subtext: "Adventure has never been easier or more elegant."
    }
  ];

  let index = 0;

  function updateTextSet() {
    const set = textSets[index];

    headlineLines.forEach((lineEl, i) => {
      lineEl.style.animation = 'none'; // Reset animation
      void lineEl.offsetWidth; // Trigger reflow
      lineEl.textContent = set.lines[i];
      lineEl.style.animation = '';
    });

    subtextEl.style.animation = 'none';
    void subtextEl.offsetWidth;
    subtextEl.textContent = set.subtext;
    subtextEl.style.animation = '';

    index = (index + 1) % textSets.length;
  }

  updateTextSet(); // Initial load

  setInterval(updateTextSet, 16000); // Every 16 seconds (match animation duration)

  //LOCATION

 function getLocation() {
    const loader = document.getElementById('loader');
    const input = document.getElementById('location');

    const savedLocation = sessionStorage.getItem('savedLocation');
    const promptedBefore = sessionStorage.getItem('locationPrompted');

    if (!promptedBefore) {
      if (navigator.geolocation) {
        if (loader) loader.style.display = "inline-block";

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
              const data = await response.json();

              const city = data.address.city || data.address.town || data.address.village || "Unknown city";
              const county = data.address.county || "Unavailable";
              const text = `${city}, ${county}`;
              let index = 0;

              // Save for next visits
              sessionStorage.setItem('locationPrompted', 'true');
              sessionStorage.setItem('savedLocation', text);

              if (loader) loader.style.display = "none";
              input.value = "";

              function typeWriterEffect() {
                if (index < text.length) {
                  input.value += text.charAt(index);
                  index++;
                  setTimeout(typeWriterEffect, 100);
                }
              }

              typeWriterEffect();
            } catch (error) {
              handleFallback("Unable to fetch location details.");
              sessionStorage.setItem('locationPrompted', 'true');
            }
          },
          () => {
            setTimeout(() => {
              handleFallback("Permission denied.");
              sessionStorage.setItem('locationPrompted', 'true');
            }, 2000);
          }
        );
      } else {
        handleFallback("Geolocation is not supported by this browser.");
        sessionStorage.setItem('locationPrompted', 'true');
      }
    } else {
      // Already prompted – use saved location
      if (loader) loader.style.display = "none";
      if (savedLocation) {
        input.value = savedLocation;
      } else {
        input.value = "Permission denied.";
      }
    }

    function handleFallback(message) {
      let index = 0;
      if (loader) loader.style.display = "none";
      input.value = "";

      function typeWriterEffect() {
        if (index < message.length) {
          input.value += message.charAt(index);
          index++;
          setTimeout(typeWriterEffect, 100);
        }
      }

      typeWriterEffect();
    }
  }

  // Run on first load
  window.onload = getLocation;

  // Enable user to re-trigger location by clicking icon
  document.addEventListener("DOMContentLoaded", () => {
    const icon = document.getElementById("location-icon");
    if (icon) {
      icon.addEventListener("click", () => {
        // Reset state
        sessionStorage.removeItem("locationPrompted");

        // Show loader if missing
        let loader = document.getElementById("loader");
        if (!loader) {
          loader = document.createElement("div");
          loader.id = "loader";
          loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
          document.body.appendChild(loader);
        } else {
          loader.style.display = "inline-block";
        }

        // Clear input
        const input = document.getElementById("location");
        if (input) input.value = "";

        getLocation();
      });
    }
  });


window.addEventListener("DOMContentLoaded",() => {
	const clock = new BouncyBlockClock(".clock");
});

class BouncyBlockClock {
	constructor(qs) {
		this.el = document.querySelector(qs);
		this.time = { a: [], b: [] };
		this.rollClass = "clock__block--bounce";
		this.digitsTimeout = null;
		this.rollTimeout = null;
		this.mod = 0 * 60 * 1000;

		this.loop();
	}
	animateDigits() {
		const groups = this.el.querySelectorAll("[data-time-group]");

		Array.from(groups).forEach((group,i) => {
			const { a, b } = this.time;

			if (a[i] !== b[i]) group.classList.add(this.rollClass);
		});

		clearTimeout(this.rollTimeout);
		this.rollTimeout = setTimeout(this.removeAnimations.bind(this),900);
	}
	displayTime() {
		// screen reader time
		const timeDigits = [...this.time.b];
		const ap = timeDigits.pop();

		this.el.ariaLabel = `${timeDigits.join(":")} ${ap}`;

		// displayed time
		Object.keys(this.time).forEach(letter => {
			const letterEls = this.el.querySelectorAll(`[data-time="${letter}"]`);

			Array.from(letterEls).forEach((el,i) => {
				el.textContent = this.time[letter][i];
			});
		});
	}
	loop() {
		this.updateTime();
		this.displayTime();
		this.animateDigits();
		this.tick();
	}
	removeAnimations() {
		const groups = this.el.querySelectorAll("[data-time-group]");
	
		Array.from(groups).forEach(group => {
			group.classList.remove(this.rollClass);
		});
	}
	tick() {
		clearTimeout(this.digitsTimeout);
		this.digitsTimeout = setTimeout(this.loop.bind(this),1e3);	
	}
	updateTime() {
		const rawDate = new Date();
		const date = new Date(Math.ceil(rawDate.getTime() / 1e3) * 1e3 + this.mod);
		let h = date.getHours();
		const m = date.getMinutes();
		const s = date.getSeconds();
		const ap = h < 12 ? "AM" : "PM";

		if (h === 0) h = 12;
		if (h > 12) h -= 12;

		this.time.a = [...this.time.b];
		this.time.b = [
			(h < 10 ? `0${h}` : `${h}`),
			(m < 10 ? `0${m}` : `${m}`),
			(s < 10 ? `0${s}` : `${s}`),
			ap
		];

		if (!this.time.a.length) this.time.a = [...this.time.b];
	}
}