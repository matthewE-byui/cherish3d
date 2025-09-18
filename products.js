// Simple product filtering and anchor handling for the static products page
document.addEventListener('DOMContentLoaded', function(){
  const grid = document.querySelector('.grid');
  if(!grid) return;

  // Filters area will be created dynamically if not present
  const categories = Array.from(new Set(Array.from(grid.querySelectorAll('.card')).map(c=>c.dataset.category || 'uncategorized')));

  const filterBar = document.createElement('div');
  filterBar.className = 'filter-bar';
  filterBar.innerHTML = '<button class="filter active" data-filter="*">All</button>' + categories.map(cat=>`<button class="filter" data-filter="${cat}">${cat}</button>`).join('');
  grid.parentNode.insertBefore(filterBar, grid);

  function applyFilter(filter){
    const cards = grid.querySelectorAll('.card');
    cards.forEach(card=>{
      const cat = card.dataset.category || 'uncategorized';
      const show = (filter==='*') || (cat===filter);
      card.style.display = show? 'block' : 'none';
    });
  }

  filterBar.addEventListener('click', (e)=>{
    const btn = e.target.closest('.filter');
    if(!btn) return;
    filterBar.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });

  // Anchor smooth scrolling for details links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const target = document.querySelector(this.getAttribute('href'));
      if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth'}); }
    });
  });
});
