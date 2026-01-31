/* =============================================
   MAIN JAVASCRIPT - Free Tech for Small Businesses
   ============================================= */

// =============================================
// SCROLL ANIMATIONS
// =============================================

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
  observer.observe(section);
});

// =============================================
// FORM HANDLING - Tech Services Form
// =============================================

document.getElementById('tech-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);
  
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      document.getElementById('successModal').style.display = 'block';
      this.reset();
    } else {
      alert('There was an error submitting your form. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('There was an error submitting your form. Please try again.');
  }
});

// =============================================
// FORM HANDLING - AI Class Signup Form
// =============================================

document.getElementById('class-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);
  
  try {
    const response = await fetch('/api/class-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      const modal = document.getElementById('successModal');
      modal.querySelector('h2').textContent = "You're in";
      modal.querySelector('p').textContent = "I'll email you details in 24 hours.";
      modal.style.display = 'block';
      this.reset();
    } else {
      alert('There was an error signing up. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('There was an error signing up. Please try again.');
  }
});

// =============================================
// MODAL HANDLING
// =============================================

document.querySelector('.close').addEventListener('click', function() {
  document.getElementById('successModal').style.display = 'none';
});

window.addEventListener('click', function(e) {
  const modal = document.getElementById('successModal');
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// =============================================
// SMOOTH SCROLLING
// =============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// =============================================
// CALENDLY WIDGET INITIALIZATION
// =============================================

window.onload = function() { 
  if (typeof Calendly !== 'undefined') {
    Calendly.initBadgeWidget({ 
      url: 'https://calendly.com/ryansmallbussinessdoctor/15min', 
      text: 'Schedule time with me', 
      color: '#0071e3', 
      textColor: '#ffffff', 
      branding: true 
    }); 
  }
  
  // Load prompts from API on page load
  if (typeof loadPrompts === 'function') {
    loadPrompts();
  }
};
