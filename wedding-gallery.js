// Simple gallery: tries to render cake-1..cake-50 from images/wedding-cake/
document.addEventListener('DOMContentLoaded', ()=>{
  const gallery = document.getElementById('gallery');
  if(!gallery) return;

  // We'll attempt to display up to 50 thumbnails; files are expected to be named cake-1.jpg ... cake-N.jpg
  for(let i=1;i<=50;i++){
    const thumb = `images/wedding-cake/cake-${i}.jpg`;
    const full = `images/wedding-cake/fullsize/cake-${i}.jpg`;
    // create an image element and use the onload/onerror trick to detect existence
    const img = new Image();
    img.src = thumb;
    img.alt = `Wedding cake ${i}`;
    img.loading = 'lazy';
    img.style.width = '100%';
    img.style.height = '180px';
    img.style.objectFit = 'cover';

    img.onload = ()=>{
      const card = document.createElement('div');
      card.className = 'card';
      const link = document.createElement('a');
      link.href = full;
      link.target = '_blank';
      link.rel = 'noopener';
      link.appendChild(img);
      const title = document.createElement('h3');
      title.textContent = `Cake ${i}`;
      card.appendChild(link);
      card.appendChild(title);
      gallery.appendChild(card);
    };
    img.onerror = ()=>{
      // missing file, ignore
    };
  }
});