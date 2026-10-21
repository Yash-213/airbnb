(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})();

(() => {
  const form = document.querySelector('#booking-form')
  if (!form) return

  const checkIn = form.elements.checkIn
  const checkOut = form.elements.checkOut
  const feedback = document.querySelector('#booking-feedback')
  const nightsLabel = document.querySelector('#booking-nights')
  const totalLabel = document.querySelector('#booking-total')
  const submitButton = document.querySelector('#booking-submit')
  const nightlyPrice = Number(form.dataset.nightlyPrice)
  let unavailable = false
  let availabilityRequest = 0

  const today = new Date()
  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-')
  checkIn.min = localToday
  checkOut.min = localToday

  const setFeedback = (message, state) => {
    feedback.textContent = message
    feedback.dataset.state = state
    feedback.classList.toggle('is-error', state === 'error')
    feedback.classList.toggle('is-success', state === 'success')
  }

  const updateEstimate = async () => {
    const requestId = ++availabilityRequest
    unavailable = false
    submitButton.disabled = false
    checkOut.min = checkIn.value || localToday

    if (!checkIn.value || !checkOut.value) {
      nightsLabel.textContent = 'Select your dates'
      totalLabel.textContent = 'Trip total will appear here'
      setFeedback('Select check-in and check-out dates to check availability.', 'neutral')
      return
    }

    const start = new Date(`${checkIn.value}T00:00:00`)
    const end = new Date(`${checkOut.value}T00:00:00`)
    const nights = Math.round((end - start) / 86400000)

    if (!Number.isFinite(nights) || nights <= 0) {
      nightsLabel.textContent = 'Choose a valid date range'
      totalLabel.textContent = 'Trip total unavailable'
      setFeedback('Check-out must be after check-in.', 'error')
      submitButton.disabled = true
      return
    }

    nightsLabel.textContent = `${nights} ${nights === 1 ? 'night' : 'nights'}`
    totalLabel.textContent = `₹${(nightlyPrice * nights).toLocaleString('en-IN')} total`
    setFeedback('Checking availability…', 'neutral')

    try {
      const url = new URL(form.dataset.availabilityUrl, window.location.origin)
      url.searchParams.set('checkIn', checkIn.value)
      url.searchParams.set('checkOut', checkOut.value)
      const response = await fetch(url, {
        headers: { Accept: 'application/json' }
      })
      if (!response.ok) throw new Error('Availability check failed')

      const result = await response.json()
      if (requestId !== availabilityRequest) return

      unavailable = !result.available
      submitButton.disabled = unavailable
      setFeedback(
        unavailable ? 'These dates are already booked. Try another range.' : 'Available for your selected dates.',
        unavailable ? 'error' : 'success'
      )
    } catch {
      if (requestId !== availabilityRequest) return
      setFeedback('Could not check availability. You can still submit and we will verify the dates.', 'neutral')
    }
  }

  checkIn.addEventListener('change', () => {
    if (checkOut.value && checkOut.value <= checkIn.value) checkOut.value = ''
    updateEstimate()
  })
  checkOut.addEventListener('change', updateEstimate)

  form.addEventListener('submit', event => {
    if (unavailable || (checkIn.value && checkOut.value && checkOut.value <= checkIn.value)) {
      event.preventDefault()
      setFeedback(
        unavailable ? 'Choose dates that are available before reserving.' : 'Check-out must be after check-in.',
        'error'
      )
    }
  })
})();

(() => {
  const toastElement = document.querySelector('#app-toast')
  if (!toastElement) return
  if (window.bootstrap) {
    window.bootstrap.Toast.getOrCreateInstance(toastElement).show()
    return
  }
  toastElement.classList.add('show')
  window.setTimeout(() => toastElement.classList.remove('show'), 5000)
})();

(() => {
  const ratingControl = document.querySelector('.rating-control')
  const ratingHint = document.querySelector('#rating-hint')
  if (!ratingControl || !ratingHint) return

  ratingControl.addEventListener('change', event => {
    const selectedRating = event.target
    if (!(selectedRating instanceof HTMLInputElement) || selectedRating.type !== 'radio') return

    ratingControl.classList.add('has-rating')
    ratingHint.textContent = `${selectedRating.value} ${selectedRating.value === '1' ? 'star' : 'stars'} selected.`
  })
})();

(() => {
  document.querySelectorAll('.password-toggle').forEach(toggle => {
    const password = document.getElementById(toggle.getAttribute('aria-controls'))
    const icon = toggle.querySelector('i')
    if (!password || !icon) return

    toggle.addEventListener('click', () => {
      const isVisible = password.type === 'password'
      password.type = isVisible ? 'text' : 'password'
      toggle.setAttribute('aria-label', isVisible ? 'Hide password' : 'Show password')
      toggle.setAttribute('aria-pressed', String(isVisible))
      icon.classList.toggle('fa-eye', !isVisible)
      icon.classList.toggle('fa-eye-slash', isVisible)
    })
  })
})();