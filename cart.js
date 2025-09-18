document.addEventListener('DOMContentLoaded', ()=>{
  const draftKey = 'cherish3d_checkout';
  const ordersKey = 'cherish3d_orders';
  const draftArea = document.getElementById('draftArea');
  const ordersArea = document.getElementById('ordersArea');
  const clearBtn = document.getElementById('clearOrders');

  function render(){
    const draftRaw = localStorage.getItem(draftKey);
    draftArea.innerHTML = '';
    if(draftRaw){
      try{
        const draft = JSON.parse(draftRaw);
        draftArea.innerHTML = '';
        const box = document.createElement('div');
        box.className = 'card';
        box.innerHTML = `
          <h3>Draft (not yet paid)</h3>
          <div><strong>${draft.productTitle}</strong> — <span>$${parseFloat(draft.price||0).toFixed(2)}</span></div>
          <div style="margin-top:8px">
            <button id="backToProduct" class="btn">Back to product</button>
            <a href="checkout.html" id="continueCheckout" class="btn" style="margin-left:8px">Continue to checkout</a>
            <button id="removeDraft" class="btn" style="margin-left:8px">Remove draft</button>
          </div>
        `;
        draftArea.appendChild(box);
        // wire buttons
        setTimeout(()=>{
          const back = document.getElementById('backToProduct');
          const remove = document.getElementById('removeDraft');
          if(back){ back.addEventListener('click', ()=>{ window.location.href = draft.productUrl || 'products.html'; }); }
          if(remove){ remove.addEventListener('click', ()=>{ if(confirm('Remove draft?')){ localStorage.removeItem(draftKey); render(); } }); }
        }, 10);
      }catch(e){ draftArea.textContent = 'Invalid draft data'; }
    }else{
      draftArea.innerHTML = '<p class="muted">No draft selection. Use Book & Pay on a product page to create a draft.</p>';
    }

    const ordersRaw = localStorage.getItem(ordersKey);
    ordersArea.innerHTML = '';
    let orders = [];
    try{ orders = JSON.parse(ordersRaw||'[]'); }catch(e){ orders = [] }
    if(!orders.length){
      ordersArea.innerHTML = '<p class="muted">No confirmed orders yet. After paying & booking, orders will appear here.</p>';
      return;
    }
    const list = document.createElement('div');
    orders.slice().reverse().forEach(o=>{
      const box = document.createElement('div');
      box.className = 'card';
      box.innerHTML = `<strong>${o.id}</strong><div>${o.product}</div><div>Booking: ${o.bookingTime}</div><div>Paid: $${parseFloat(o.price||0).toFixed(2)}</div>`;
      list.appendChild(box);
    });
    ordersArea.appendChild(list);
  }

  clearBtn.addEventListener('click', ()=>{
    if(!confirm('Clear all confirmed orders? This cannot be undone.')) return;
    localStorage.removeItem(ordersKey);
    render();
  });

  render();
});
