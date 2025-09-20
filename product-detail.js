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
    // Check for embedded price table JSON (size -> color -> price)
    let priceTable = null;
    try{
      const el = document.getElementById('priceTable');
      if(el) priceTable = JSON.parse(el.textContent);
    }catch(e){ priceTable = null }

    // Determine the starting total based on priceTable and selected color/choices.
    let total = NaN;
    const sizeSelect = form.querySelector('select[name="size"], select#size');
    const selectedSize = sizeSelect ? sizeSelect.value : null;

    // Helper: try price from embedded JSON table
    const tryPriceTable = (sizeKey, choiceKey) => {
      try{
        if(priceTable && sizeKey && choiceKey && priceTable[sizeKey] && priceTable[sizeKey][choiceKey] !== undefined){
          return parseFloat(priceTable[sizeKey][choiceKey]) || NaN;
        }
      }catch(e){}
      return NaN;
    };

    // Helper: try price from visible table DOM
    const tryDomTable = (sizeKey, choiceKey) => {
      try{
        const table = document.querySelector('.price-table');
        if(table && sizeKey && choiceKey){
          const cell = table.querySelector(`tr[data-size="${sizeKey}"] td[data-color="${choiceKey}"]`);
          if(cell){
            return parseFloat(cell.dataset.priceCouple) || NaN;
          }
        }
      }catch(e){}
      return NaN;
    };

    // 1) Prefer color radio mapping
    try{
      const colorChecked = form.querySelector('input[name="color"]:checked');
      const colorKey = colorChecked ? colorChecked.value : null;
      if(colorKey){
        total = tryPriceTable(selectedSize, colorKey);
        if(isNaN(total)) total = tryDomTable(selectedSize, colorKey);
      }
    }catch(e){ /* ignore */ }

    // 2) If still no price, try other radio groups (excluding variant)
    if(isNaN(total)){
      const radioGroups = {};
      form.querySelectorAll('input[type="radio"]').forEach(r=>{
        const name = r.name || '__noname__';
        if(!radioGroups[name]) radioGroups[name] = [];
        radioGroups[name].push(r);
      });
      for(const name in radioGroups){
        if(name === 'variant') continue;
        const checked = radioGroups[name].find(r=>r.checked);
        if(checked){
          const key = checked.value;
          total = tryPriceTable(selectedSize, key);
          if(isNaN(total)){
            // check DOM cell
            total = tryDomTable(selectedSize, key);
          }
          if(isNaN(total)){
            total = parseFloat(checked.dataset.price || NaN) || NaN;
          }
          if(!isNaN(total)) break;
        }
      }
    }

    // 3) Fall back to base if nothing found
    if(isNaN(total)) total = base;

    // Add select increments (if any)
    form.querySelectorAll('select').forEach(s=>{
      const opt = s.options[s.selectedIndex];
      const p = parseFloat(opt.dataset.price || 0) || 0;
      total += p;
    });
    // Add checkbox increments
    form.querySelectorAll('input[type="checkbox"]').forEach(cb=>{
      if(cb.checked){ total += parseFloat(cb.dataset.price || 0) || 0 }
    });
    // Apply variant modifier (single = half price for couple product)
    try{
      const variantEl = form.querySelector('input[name="variant"]:checked');
      if(variantEl && variantEl.value === 'single'){
        total = total / 2;
      }
    }catch(e){ /* ignore */ }

    priceEl.textContent = total.toFixed(2).replace(/\.00$/, '');

    // Highlight the visible table row matching the selected size (if present)
    try {
      const sizeSelect = form.querySelector('select[name="size"], select#size');
      const size = sizeSelect ? sizeSelect.value : null;
      const table = document.querySelector('.price-table');
      // Update table cell values for variant (single = half of couple prices)
      try{
        const variantEl = form.querySelector('input[name="variant"]:checked');
        const isSingle = variantEl && variantEl.value === 'single';
        if(table){
          table.querySelectorAll('[data-price-couple]').forEach(td => {
            const couple = parseFloat(td.dataset.priceCouple) || 0;
            const display = isSingle ? (couple / 2) : couple;
            td.textContent = '$' + display.toFixed(2);
          });
        }
      }catch(e){ console.warn('Table variant update failed', e) }
      if (table) {
        // Column highlight: set a class on table like highlight-color-<key>
        try{
          const colorChecked = form.querySelector('input[name="color"]:checked')?.value || null;
          // remove prior highlight classes
          table.className = table.className.split(/\s+/).filter(c=>!c.startsWith('highlight-color-')).join(' ');
          if(colorChecked){ table.classList.add('highlight-color-' + colorChecked); }
        }catch(e){/* ignore */}

        table.querySelectorAll('tr.selected').forEach(r => r.classList.remove('selected'));
        if (size) {
          const row = table.querySelector(`tr[data-size="${size}"]`);
          if (row) {
            row.classList.add('selected');
            // on small screens, ensure the selected row is visible
            const wrap = table.closest('.table-wrap');
            if (wrap) {
              const rowRect = row.getBoundingClientRect();
              const wrapRect = wrap.getBoundingClientRect();
              // if row is out of view to the left or right, scroll it into center
              if (rowRect.left < wrapRect.left || rowRect.right > wrapRect.right) {
                const offset = rowRect.left - wrapRect.left - (wrapRect.width/2) + (rowRect.width/2);
                wrap.scrollBy({ left: offset, behavior: 'smooth' });
              }
            }
          }
        }
      }
      // Update inline option prices next to color radios
      try{
        const isSingle = form.querySelector('input[name="variant"]:checked')?.value === 'single';
        // For each opt-price span, find matching table cell by data-color and size
        document.querySelectorAll('.opt-price[data-color]').forEach(span => {
          const colorKey = span.getAttribute('data-color');
          let display = '';
          if(size && table){
            const cell = table.querySelector(`tr[data-size="${size}"] td[data-color="${colorKey}"]`);
            if(cell){
              const couple = parseFloat(cell.dataset.priceCouple) || 0;
              display = '$' + (isSingle ? (couple/2).toFixed(2) : couple.toFixed(2));
            }
          }
          // Fallback: try priceTable JSON
          if(!display){
            try{
              const pt = document.getElementById('priceTable');
              if(pt){
                const priceTable = JSON.parse(pt.textContent||'{}');
                if(priceTable[size] && priceTable[size][colorKey]!==undefined){
                  const couple = parseFloat(priceTable[size][colorKey]) || 0;
                  display = '$' + (isSingle ? (couple/2).toFixed(2) : couple.toFixed(2));
                }
              }
            }catch(e){}
          }
          span.textContent = display;
        });
      }catch(e){ console.warn('Opt-price update failed', e) }
    } catch (e) {
      console.warn('Price table highlight failed', e);
    }
  }

  form.addEventListener('change', sumPrices);
  sumPrices();
  // Add to cart placeholder
  const addBtn = document.getElementById('addToCart');
  if(addBtn){
    addBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      alert('This is a mock site — cart functionality isn\'t implemented. Selected price: $' + priceEl.textContent + "\n(Variant: " + (form.querySelector('input[name=\"variant\"]:checked')?.value || 'couple') + ")");
    });
  }

  // Book & Pay: capture current selection, save to localStorage and redirect to checkout
  const bookPayBtn = document.getElementById('bookPay');
  if(bookPayBtn){
    bookPayBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      // gather selection data
      try{
        const title = document.querySelector('h2')?.textContent?.trim() || document.title || 'Product';
        const url = window.location.pathname.split('/').pop() || window.location.href;
        const size = form.querySelector('select[name="size"], select#size')?.value || null;
        const color = form.querySelector('input[name="color"]:checked')?.value || null;
        const variant = form.querySelector('input[name="variant"]:checked')?.value || null;
        const price = parseFloat((priceEl.textContent||'').replace(/[^0-9.]/g, '')) || 0;
        // extras: any checked checkboxes or selects with data-price
        const extras = [];
        form.querySelectorAll('input[type="checkbox"]').forEach(cb=>{
          if(cb.checked){ extras.push({ name: cb.name || cb.id || cb.value, value: cb.value, price: parseFloat(cb.dataset.price||0)||0 }); }
        });
        form.querySelectorAll('select').forEach(s=>{
          const opt = s.options[s.selectedIndex];
          if(opt && (parseFloat(opt.dataset.price||0) || 0) !== 0){
            extras.push({ name: s.name||s.id, value: opt.value, price: parseFloat(opt.dataset.price||0)||0 });
          }
        });

        const payload = {
          productTitle: title,
          productUrl: url,
          selections: { size, color, variant, extras },
          price: price,
          savedAt: (new Date()).toISOString()
        };
  localStorage.setItem('cherish3d_checkout', JSON.stringify(payload));
  // redirect to cart page first (user can continue to checkout from Cart)
  window.location.href = 'cart.html';
      }catch(err){
        console.warn('Failed to capture selection for Book & Pay', err);
        alert('Could not start Book & Pay. Please try again.');
      }
    });
  }
});






document.querySelectorAll('.image-carousel').forEach(carousel => {
  const images = carousel.querySelectorAll('img');
  let index = 0;
  let currentSize = "3in"; // default

  const showImage = (i) => {
    // hide all
    images.forEach(img => {
      img.classList.remove('active');
      img.style.display = "none";
    });
    // show only current size
    const visible = Array.from(images).filter(img => img.dataset.size === currentSize);
    if (visible.length > 0) {
      visible[i % visible.length].classList.add('active');
      visible[i % visible.length].style.display = "block";
    }
  };

  carousel.querySelector('.prev').addEventListener('click', () => {
    const visible = Array.from(images).filter(img => img.dataset.size === currentSize);
    index = (index - 1 + visible.length) % visible.length;
    showImage(index);
  });

  carousel.querySelector('.next').addEventListener('click', () => {
    const visible = Array.from(images).filter(img => img.dataset.size === currentSize);
    index = (index + 1) % visible.length;
    showImage(index);
  });

  // Listen for size changes
  document.getElementById("size").addEventListener("change", (e) => {
    currentSize = e.target.value;
    index = 0; // reset to first image
    showImage(index);
  });

  showImage(index);
});

document.addEventListener("DOMContentLoaded", () => {
  const sizeSelect = document.getElementById("size");
  const carousel = document.getElementById("figurine-carousel");
  const images = carousel.querySelectorAll("img");
  const prevBtn = carousel.querySelector(".prev");
  const nextBtn = carousel.querySelector(".next");
  let currentIndex = 0;
  let currentSize = sizeSelect.value;

  // Show only images for the current size
  function updateImages() {
    images.forEach((img, i) => {
      img.style.display = img.dataset.size === currentSize ? "none" : "none";
      img.classList.remove("active");
    });
    const visibleImgs = Array.from(images).filter(img => img.dataset.size === currentSize);
    if (visibleImgs.length > 0) {
      currentIndex = 0;
      visibleImgs[currentIndex].style.display = "block";
      visibleImgs[currentIndex].classList.add("active");
    }
  }

  // Change size updates images
  sizeSelect.addEventListener("change", (e) => {
    currentSize = e.target.value;
    updateImages();
  });

  // Next / Prev buttons
  function showImage(step) {
    const visibleImgs = Array.from(images).filter(img => img.dataset.size === currentSize);
    visibleImgs[currentIndex].style.display = "none";
    visibleImgs[currentIndex].classList.remove("active");
    currentIndex = (currentIndex + step + visibleImgs.length) % visibleImgs.length;
    visibleImgs[currentIndex].style.display = "block";
    visibleImgs[currentIndex].classList.add("active");
  }

  prevBtn.addEventListener("click", () => showImage(-1));
  nextBtn.addEventListener("click", () => showImage(1));

  // Init
  updateImages();
});