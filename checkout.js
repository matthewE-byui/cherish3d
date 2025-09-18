// Checkout page logic: load selection from localStorage, require booking, simulate payment
document.addEventListener('DOMContentLoaded', ()=>{
  const key = 'cherish3d_checkout';
  const raw = localStorage.getItem(key);
  const noSelection = document.getElementById('noSelection');
  const selectionDiv = document.getElementById('selection');
  const prodTitle = document.getElementById('prodTitle');
  const prodPrice = document.getElementById('prodPrice');
  const selectionsList = document.getElementById('selectionsList');
  const payBtn = document.getElementById('payBtn');
  const confirmation = document.getElementById('confirmation');

  if(!raw){ noSelection.style.display='block'; return }
  let data = null;
  try{ data = JSON.parse(raw); }catch(e){ noSelection.style.display='block'; return }
  selectionDiv.style.display = 'block';
  prodTitle.textContent = data.productTitle || 'Product';
  prodPrice.textContent = '$' + (parseFloat(data.price||0).toFixed(2)).replace(/\.00$/,'');

  // render selections
  selectionsList.innerHTML = '';
  const s = data.selections || {};
  if(s.size) selectionsList.innerHTML += `<div><strong>Size:</strong> ${s.size}</div>`;
  if(s.color) selectionsList.innerHTML += `<div><strong>Color:</strong> ${s.color}</div>`;
  if(s.variant) selectionsList.innerHTML += `<div><strong>Variant:</strong> ${s.variant}</div>`;
  if(s.extras && s.extras.length){
    const extrasHtml = s.extras.map(e=>`<div>${e.name}: ${e.value} ${e.price? '($'+parseFloat(e.price).toFixed(2)+')':''}</div>`).join('');
    selectionsList.innerHTML += `<div><strong>Extras:</strong>${extrasHtml}</div>`;
  }

  function validateBooking(){
    const dateEl = document.getElementById('bookDate');
    const hour = document.getElementById('bookHour').value;
    const minute = document.getElementById('bookMinute').value;
    if(!dateEl.value) { alert('Please pick a booking date'); return false }
    const dt = new Date(dateEl.value + 'T' + hour + ':' + minute + ':00');
    if(isNaN(dt.getTime())) { alert('Invalid date/time'); return false }
    // Day check: Mon-Sat allowed (0=Sun..6=Sat) -> disallow Sunday(0)
    const day = dt.getDay();
    if(day === 0){ alert('Bookings are allowed Monday through Saturday. Please choose another day.'); return false }
    // Hour check: between 09:00 and 17:00 inclusive, but 17:00 only when minute === 00
    const h = dt.getHours(); const m = dt.getMinutes();
    if(h < 9 || h > 17) { alert('Bookings are accepted between 09:00 and 17:00. Please choose a time in that range.'); return false }
    if(h === 17 && m !== 0){ alert('17:00 is the latest allowed booking time. Please choose minutes = 00 or an earlier hour.'); return false }
    return true;
  }

  payBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    if(!validateBooking()) return;
    // simulate payment (mock)
    payBtn.disabled = true;
    payBtn.textContent = 'Processing...';
    setTimeout(()=>{
      const conf = {
        id: 'CONF' + Math.floor(Math.random()*900000 + 100000),
        product: data.productTitle,
        selections: data.selections,
        price: data.price,
        bookedAt: (new Date()).toISOString(),
        bookingTime: document.getElementById('bookDate').value + ' ' + document.getElementById('bookHour').value + ':' + document.getElementById('bookMinute').value
      };
      // store confirmations in localStorage under 'cherish3d_orders'
      const ordersKey = 'cherish3d_orders';
      const old = JSON.parse(localStorage.getItem(ordersKey) || '[]');
      old.push(conf);
      localStorage.setItem(ordersKey, JSON.stringify(old));
      // remove checkout draft
      localStorage.removeItem(key);
      confirmation.style.display = 'block';
      confirmation.innerHTML = `<strong>Booking confirmed</strong><div>Reference: ${conf.id}</div><div>Booking time: ${conf.bookingTime}</div><div>Price paid: $${parseFloat(conf.price||0).toFixed(2)}</div>`;
      payBtn.style.display = 'none';
    }, 900);
  });
  // Back to cart button
  const backBtn = document.getElementById('backToCart');
  if(backBtn){ backBtn.addEventListener('click', (e)=>{ e.preventDefault(); window.location.href = 'cart.html'; }); }
});
