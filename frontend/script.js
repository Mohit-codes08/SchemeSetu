let currentActiveCard = 1;
const totalCards = 6;
let currentLang = "en";

// Dynamic Business Model Mapping based on Occupation
const businessOptionsMap = {
  "Farmer / Agriculture": [
    "🚜 Buying Tractor & Farm Implements (Sub-Mission on Agri)",
    "💧 Micro-Irrigation / Drip Installation (PMKSY)",
    "🐄 Dairy Farming & Animal Husbandry",
    "🌾 Organic Farming & Crop Expansion",
    "✍️ Custom / Other (Type or Speak 🎙️)"
  ],
  "Artisan / Craftsman": [
    "🪡 Tailoring & Boutique Setup (PM Vishwakarma)",
    "🏺 Pottery, Clay & Handicrafts Production",
    "🪵 Carpentry & Woodcraft Workshop",
    "⚒️ Blacksmith / Metal Tool Production",
    "✍️ Custom / Other (Type or Speak 🎙️)"
  ],
  "Street Vendor / Hawker": [
    "🛒 Fast Food, Tea & Snack Cart (PM SVANidhi)",
    "🥬 Fruit & Vegetable Vending Expansion",
    "👕 Footwear & Apparel Vending Stall",
    "✍️ Custom / Other (Type or Speak 🎙️)"
  ],
  "Small Shopkeeper / Retailer": [
    "🏪 General Kirana Store Expansion (Mudra Loan)",
    "📱 Mobile Repair & Electronics Store",
    "📦 Wholesale Inventory Purchase",
    "✍️ Custom / Other (Type or Speak 🎙️)"
  ],
  "Student / Youth": [
    "💻 Tech / Digital Services Startup (Startup India)",
    "🛵 Delivery / Logistics Transport Fleet",
    "📚 Higher Education / Skill Training Subsidy",
    "✍️ Custom / Other (Type or Speak 🎙️)"
  ],
  "Women Entrepreneur": [
    "🧵 Self Help Group (SHG) Garment Unit",
    "🍲 Packaged Food / Pickle & Masala Making",
    "💄 Beauty Salon & Wellness Centre (Stand-Up India)",
    "✍️ Custom / Other (Type or Speak 🎙️)"
  ],
  "Other": [
    "🚀 Starting New Micro-Enterprise",
    "⚙️ Purchasing Machinery / Tools",
    "💵 Working Capital / Business Expansion Loan",
    "✍️ Custom / Other (Type or Speak 🎙️)"
  ]
};

// Populate Step 6 Options based on Occupation text
function populateBusinessOptions(selectedOcc) {
  const bizSelect = document.getElementById("business-select");
  if (!bizSelect) return;
  bizSelect.innerHTML = `<option value="">Select planned business goal...</option>`;

  let matchedKey = "Other";
  for (let key of Object.keys(businessOptionsMap)) {
    if (selectedOcc.toLowerCase().includes(key.toLowerCase().split("/")[0].trim())) {
      matchedKey = key;
      break;
    }
  }

  const options = businessOptionsMap[matchedKey] || businessOptionsMap["Other"];
  options.forEach(opt => {
    const el = document.createElement("option");
    el.value = opt;
    el.textContent = opt;
    bizSelect.appendChild(el);
  });
}

// Step 2: Handle Occupation Dropdown
function handleOccupationSelect(val) {
  const occInput = document.getElementById("input-occupation");
  if (!occInput) return;

  if (val === "Custom" || val === "") {
    occInput.value = "";
    occInput.placeholder = "Speak 🎙️ or type your exact trade / work...";
    occInput.focus();
    populateBusinessOptions("Other");
  } else {
    occInput.value = val;
    populateBusinessOptions(val);
  }
}

// Step 6: Handle Business Dropdown
function handleBusinessSelect(val) {
  const customInput = document.getElementById("input-businessType");
  if (!customInput) return;
  if (val.includes("Custom / Other")) {
    customInput.value = "";
    customInput.placeholder = "Speak 🎙️ or type your exact business plan...";
    customInput.focus();
  } else {
    customInput.value = val;
  }
}

// Initial populate on load
document.addEventListener("DOMContentLoaded", () => {
  populateBusinessOptions("Other");
});

// ================= AI SPEECH-TO-TEXT (VOICE INPUT) =================
function startVoiceInput(inputId, btnElement) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Voice input is not supported in this browser. Please use Google Chrome or Edge.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = currentLang === "hi" ? "hi-IN" : "en-IN";
  recognition.interimResults = false;

  btnElement.classList.add("mic-listening");
  btnElement.textContent = "🔴";

  recognition.onresult = (event) => {
    let transcript = event.results[0][0].transcript;
    const inputEl = document.getElementById(inputId);
    
    if (inputEl.type === "number") {
      transcript = transcript.replace(/\D/g, "");
    }
    
    inputEl.value = transcript;
    inputEl.focus();

    if (inputId === "input-occupation") {
      populateBusinessOptions(transcript);
    }
  };

  recognition.onspeechend = () => {
    recognition.stop();
    btnElement.classList.remove("mic-listening");
    btnElement.textContent = "🎙️";
  };

  recognition.onerror = () => {
    recognition.stop();
    btnElement.classList.remove("mic-listening");
    btnElement.textContent = "🎙️";
  };

  recognition.start();
}

// Navigation Functions
function nextCard(step) {
  const currentCardEl = document.getElementById(`card-${step}`);
  const input = currentCardEl.querySelector("input, select");

  if (!input.checkValidity()) {
    input.reportValidity();
    return;
  }

  if (step === 2) {
    const occValue = document.getElementById("input-occupation").value;
    populateBusinessOptions(occValue);
  }

  currentCardEl.classList.remove("active-card");
  currentCardEl.classList.add("completed-card");
  currentCardEl.querySelector(".badge-status-txt").textContent = currentLang === "en" ? "✓ Completed" : "✓ पूर्ण हुआ";

  const nextStep = step + 1;
  if (nextStep <= totalCards) {
    const nextCardEl = document.getElementById(`card-${nextStep}`);
    nextCardEl.classList.remove("locked-card");
    nextCardEl.classList.add("active-card");
    nextCardEl.querySelector(".badge-status-txt").textContent = currentLang === "en" ? `Step ${nextStep} Active` : `चरण ${nextStep} सक्रिय`;
    
    const nextInput = nextCardEl.querySelector("input, select");
    if (nextInput) setTimeout(() => nextInput.focus(), 250);
  }
}

function prevCard(step) {
  const currentCardEl = document.getElementById(`card-${step}`);
  currentCardEl.classList.remove("active-card");
  currentCardEl.classList.add("locked-card");
  currentCardEl.querySelector(".badge-status-txt").textContent = currentLang === "en" ? `Step ${step} Locked` : `चरण ${step} लॉक`;

  const prevStep = step - 1;
  if (prevStep >= 1) {
    const prevCardEl = document.getElementById(`card-${prevStep}`);
    prevCardEl.classList.remove("completed-card");
    prevCardEl.classList.add("active-card");
    prevCardEl.querySelector(".badge-status-txt").textContent = currentLang === "en" ? `Step ${prevStep} Active` : `चरण ${prevStep} सक्रिय`;
    
    const prevInput = prevCardEl.querySelector("input, select");
    if (prevInput) setTimeout(() => prevInput.focus(), 250);
  }
}

// Language Toggle
const langToggle = document.getElementById("langToggle");
if (langToggle) {
  langToggle.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "hi" : "en";
    langToggle.textContent = currentLang === "en" ? "🌐 हिंदी" : "🌐 English";
    
    document.querySelectorAll("[data-en]").forEach(el => {
      el.textContent = currentLang === "en" ? el.dataset.en : el.dataset.hi;
    });
  });
}

// Form Submission with Dynamic URL Support
const form = document.getElementById("schemeForm");
const loader = document.getElementById("loader");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.language = currentLang;

    form.style.display = "none";
    document.querySelector(".grid-hero-header").style.display = "none";
    loader.classList.remove("hidden");

    // Dynamic backend URL (Localhost par localhost use karega, Render deploy par render url)
    const BACKEND_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : "https://schemesetu-backend.onrender.com";

    try {
      const res = await fetch(`${BACKEND_URL}/api/schemes/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      const result = await res.json();

      if (result.success && result.schemes && result.schemes.length > 0) {
        sessionStorage.setItem("schemeResult", JSON.stringify(result.schemes));
        sessionStorage.setItem("userName", result.name);
        sessionStorage.setItem("userLang", currentLang);
        window.location.href = "result.html";
      } else {
        alert("Error: Unable to match schemes. Please verify input data.");
        loader.classList.add("hidden");
        form.style.display = "grid";
        document.querySelector(".grid-hero-header").style.display = "block";
      }
    } catch (err) {
      alert("Connection Error: Backend server is not reachable at " + BACKEND_URL);
      loader.classList.add("hidden");
      form.style.display = "grid";
      document.querySelector(".grid-hero-header").style.display = "block";
    }
  });
}

// 3D Background Canvas
const canvas = document.getElementById("bgCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let symbols = [];
  let width, height;

  const govSymbols = ["₹", "🏛️", "🇮🇳", "📜", "💼", "💰", "✦"];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  class FloatingIcon {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 50;
      this.text = govSymbols[Math.floor(Math.random() * govSymbols.length)];
      this.fontSize = Math.random() * 18 + 12;
      this.speedY = Math.random() * 0.7 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.15;
      this.color = ["#ff9933", "#38bdf8", "#10b981", "#ffffff"][Math.floor(Math.random() * 4)];
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      if (this.y < -30) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.font = `${this.fontSize}px sans-serif`;
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.fillText(this.text, this.x, this.y);
      ctx.restore();
    }
  }

  for (let i = 0; i < 35; i++) {
    const icon = new FloatingIcon();
    icon.y = Math.random() * height;
    symbols.push(icon);
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        const dx = symbols[i].x - symbols[j].x;
        const dy = symbols[i].y - symbols[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.12 * (1 - dist / 140)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(symbols[i].x, symbols[i].y);
          ctx.lineTo(symbols[j].x, symbols[j].y);
          ctx.stroke();
        }
      }
    }
    symbols.forEach(s => {
      s.update();
      s.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
}