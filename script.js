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

  // 2. SERVICES PAGE CATEGORY FILTERING

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


  // 3. PRE-SELECT SERVICE FOR BOOKING
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

  // 4. FORM HANDLERS (BOOKING, QUICK RESERVE, CONTACT)

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
    return `Asante, ${name}! Your request for "${service}" on ${date} at ${time} at our Westlands studio has been received. Confirmation sent via SMS & email!`;
  });

  handleFormSubmit('inviteBookingForm', 'inviteBookingFeedback', (data) => {
    const name = data.get('name') || 'Guest';
    const service = data.get('service') || 'Signature Gel Manicure';
    return `Karibu to Zuri Nail Atelier, ${name}! Your visit for ${service} is queued. Check your inbox for your Nairobi studio invite.`;
  });

  handleFormSubmit('contactForm', 'contactFeedback', (data) => {
    const name = data.get('name') || 'there';
    return `Asante for reaching out, ${name}! Our Westlands concierge will respond within 2 hours.`;
  });
});