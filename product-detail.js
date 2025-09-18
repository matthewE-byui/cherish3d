// Product page price calculator
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('productForm');
  if(!form) return;

  const priceEl = document.getElementById('price');
  const basePrices = { 'couple': 15, 'caketopper': 10, 'baby': 12 };

  // Determine product base price from page (simple heuristic using title)
  const title = document.querySelector('h2')?.textContent?.toLowerCase() || '';
  let base = 10;
  if(title.includes('wedding') || title.includes('couple')) base = 15;
  else if(title.includes('cake')) base = 10;
  else if(title.includes('baby')) base = 12;

  function sumPrices(){
    let total = base;
    // selects with data-price
    form.querySelectorAll('select').forEach(s=>{
      const opt = s.options[s.selectedIndex];
      const p = parseFloat(opt.dataset.price || 0) || 0;
      total += p;
    });
    // checked checkboxes
    form.querySelectorAll('input[type="checkbox"]').forEach(cb=>{
      if(cb.checked){ total += parseFloat(cb.dataset.price || 0) || 0 }
    });
    priceEl.textContent = total.toFixed(2).replace(/\.00$/, '');
  }

  form.addEventListener('change', sumPrices);
  sumPrices();

  // Add to cart placeholder
  const addBtn = document.getElementById('addToCart');
  if(addBtn){
    addBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      alert('This is a mock site — cart functionality isn\'t implemented. Selected price: $' + priceEl.textContent);
    });
  }
});
