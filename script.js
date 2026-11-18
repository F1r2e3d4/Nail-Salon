document.addEventListener('DOMContentLoaded', () => {

  // 1. MOBILE NAVIGATION TOGGLE
  
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isExpanded = navLinks.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isExpanded);
    });
  }

  // 2. CURRENCY CONVERTER ENGINE (BASE: KES)

  // Rates relative to 1 KES (updated live when online)
  const CURRENCIES = {
    KES: { symbol: 'KSh ', rate: 1, decimals: 0, label: 'KES (KSh)' },
    NGN: { symbol: '₦', rate: 10.3846, decimals: 0, label: 'NGN (₦)' },
    USD: { symbol: '$', rate: 1 / 130.0, decimals: 2, label: 'USD ($)' },
    GBP: { symbol: '£', rate: 0.76 / 130.0, decimals: 2, label: 'GBP (£)' },
    EUR: { symbol: '€', rate: 0.91 / 130.0, decimals: 2, label: 'EUR (€)' },
    AED: { symbol: 'AED ', rate: 3.67 / 130.0, decimals: 2, label: 'AED' }
  };

  let activeCurrency = localStorage.getItem('zuriCurrency') || 'KES';
  if (!CURRENCIES[activeCurrency]) activeCurrency = 'KES';

  const formatMoney = (kesAmount, currencyCode, decimalsOverride = null) => {
    const cfg = CURRENCIES[currencyCode] || CURRENCIES.KES;
    const converted = kesAmount * cfg.rate;
    const dec = decimalsOverride !== null ? decimalsOverride : cfg.decimals;
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec
    });
    return `${cfg.symbol}${formatted}`;
  };

  // Update every price tag & dropdown option across the current page
  const updateSitePrices = () => {
    document.querySelectorAll('[data-price-kes]').forEach((el) => {
      const kes = parseFloat(el.getAttribute('data-price-kes'));
      const prefix = el.getAttribute('data-price-prefix') || '';
      const suffix = el.getAttribute('data-price-suffix') || '';

      if (el.tagName === 'OPTION') {
        const baseName = el.getAttribute('data-base-label') || el.value;
        el.textContent = `${baseName} (${formatMoney(kes, activeCurrency)})`;
      } else {
        el.textContent = `${prefix}${formatMoney(kes, activeCurrency)}${suffix}`;
      }
    });

    document.querySelectorAll('[data-price-min-kes]').forEach((el) => {
      const minKes = parseFloat(el.getAttribute('data-price-min-kes'));
      const maxKes = parseFloat(el.getAttribute('data-price-max-kes'));
      el.textContent = `${formatMoney(minKes, activeCurrency)} – ${formatMoney(maxKes, activeCurrency)}`;
    });
  };

  // Sync navbar selector
  const currencySelector = document.getElementById('currencySelector');
  if (currencySelector) {
    currencySelector.value = activeCurrency;
    currencySelector.addEventListener('change', (e) => {
      activeCurrency = e.target.value;
      localStorage.setItem('zuriCurrency', activeCurrency);
      updateSitePrices();

      const convTo = document.getElementById('convTo');
      if (convTo) {
        convTo.value = activeCurrency;
        runConverter();
      }
    });
  }

  // Interactive Currency Converter Widget (services.html)
  const convAmount = document.getElementById('convAmount');
  const convFrom = document.getElementById('convFrom');
  const convTo = document.getElementById('convTo');
  const convSwap = document.getElementById('convSwap');
  const convResult = document.getElementById('convResult');
  const convRateNote = document.getElementById('convRateNote');
  const convApplyBtn = document.getElementById('convApplyBtn');
  const convStatusBadge = document.getElementById('convStatusBadge');

  const runConverter = () => {
    if (!convAmount || !convFrom || !convTo || !convResult) return;

    const amount = parseFloat(convAmount.value) || 0;
    const fromCode = convFrom.value;
    const toCode = convTo.value;

    const kesValue = amount / CURRENCIES[fromCode].rate;
    const targetValue = kesValue * CURRENCIES[toCode].rate;
    const unitRate = CURRENCIES[toCode].rate / CURRENCIES[fromCode].rate;

    const toCfg = CURRENCIES[toCode];
    convResult.textContent = `${toCfg.symbol}${targetValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} ${toCode}`;

    if (convRateNote) {
      convRateNote.textContent = `Exchange rate: 1 ${fromCode} = ${unitRate.toFixed(4)} ${toCode}`;
    }
  };

  if (convAmount && convFrom && convTo) {
    convFrom.value = 'KES';
    convTo.value = activeCurrency === 'KES' ? 'USD' : activeCurrency;

    [convAmount, convFrom, convTo].forEach((el) => {
      el.addEventListener('input', runConverter);
      el.addEventListener('change', runConverter);
    });

    if (convSwap) {
      convSwap.addEventListener('click', () => {
        const temp = convFrom.value;
        convFrom.value = convTo.value;
        convTo.value = temp;
        runConverter();
      });
    }

    if (convApplyBtn && currencySelector) {
      convApplyBtn.addEventListener('click', () => {
        activeCurrency = convTo.value;
        currencySelector.value = activeCurrency;
        localStorage.setItem('zuriCurrency', activeCurrency);
        updateSitePrices();
      });
    }

    runConverter();
  }

  // Fetch live KES exchange rates (falls back smoothly if offline)
  fetch('https://open.er-api.com/v6/latest/KES')
    .then((res) => (res.ok ? res.json() : Promise.reject()))
    .then((data) => {
      if (data && data.rates) {
        Object.keys(CURRENCIES).forEach((code) => {
          if (data.rates[code]) {
            CURRENCIES[code].rate = data.rates[code];
          }
        });
        if (convStatusBadge) {
          convStatusBadge.textContent = '● Live Nairobi Market Rates Active';
        }
        updateSitePrices();
        runConverter();
      }
    })
    .catch(() => {
      if (convStatusBadge) {
        convStatusBadge.textContent = '● Standard Studio Rates';
      }
    });

  // Initial price render
  updateSitePrices();

  // 3. SERVICES PAGE CATEGORY FILTERING

  const tabButtons = document.querySelectorAll('.tab-btn');
  const serviceItems = document.querySelectorAll('.service-item');

  if (tabButtons.length > 0) {
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-category');
        serviceItems.forEach((item) => {
          const itemCat = item.getAttribute('data-category');
          if (category === 'all' || itemCat === category) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }


  // 4. PRE-SELECT SERVICE FOR BOOKING
  const quickBookButtons = document.querySelectorAll('[data-book-service]');
  const serviceSelect = document.getElementById('bookingService');

  quickBookButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosen = btn.getAttribute('data-book-service');
      if (serviceSelect) {
        serviceSelect.value = chosen;
      }
    });
  });

  // 5. FORM HANDLERS (BOOKING, QUICK RESERVE, CONTACT)

  const handleFormSubmit = (formId, feedbackId, buildMessage) => {
    const form = document.getElementById(formId);
    const feedback = document.getElementById(feedbackId);
    if (!form || !feedback) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      feedback.textContent = buildMessage(formData);
      feedback.classList.add('show');
      form.reset();
    });
  };

  handleFormSubmit('bookingForm', 'bookingFeedback', (data) => {
    const name = data.get('name') || 'Guest';
    const service = data.get('service') || 'your nail appointment';
    const date = data.get('date') || 'your selected date';
    const time = data.get('time') || 'your selected time';
    return `Asante, ${name}! Your request for "${service}" on ${date} at ${time} (${activeCurrency}) at our Westlands studio has been received. Confirmation sent via SMS & email!`;
  });

  handleFormSubmit('inviteBookingForm', 'inviteBookingFeedback', (data) => {
    const name = data.get('name') || 'Guest';
    const service = data.get('service') || 'Signature Gel Manicure';
    return `Karibu to Zuri Nail Atelier, ${name}! Your visit for ${service} (${activeCurrency}) is queued. Check your inbox for your Nairobi studio invite.`;
  });

  handleFormSubmit('contactForm', 'contactFeedback', (data) => {
    const name = data.get('name') || 'there';
    return `Asante for reaching out, ${name}! Our Westlands concierge will respond within 2 hours.`;
  });
});