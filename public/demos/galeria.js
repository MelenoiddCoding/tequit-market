(() => {
  const gallery = document.querySelector('.demo-gallery') || Array.from(document.querySelectorAll('section')).find(section => section.querySelector('h2')?.textContent?.trim() === 'Trabajos Realizados');
  if (!gallery) return;
  const photos = Array.from(gallery.querySelectorAll('.grid img'));
  if (!photos.length) return;
  const previousOverflow = { value: '' };
  let opener = null;
  let current = 0;
  let start = null;

  const dialog = document.createElement('dialog');
  dialog.className = 'gallery-dialog';
  dialog.setAttribute('aria-label', 'Galería de trabajos realizados');
  dialog.innerHTML = '<div class="gallery-layout"><div class="gallery-toolbar"><span class="gallery-count"></span><button type="button" class="gallery-close" aria-label="Cerrar galería">×</button></div><div class="gallery-stage"><button type="button" class="gallery-prev" aria-label="Foto anterior">‹</button><img alt=""><button type="button" class="gallery-next" aria-label="Foto siguiente">›</button></div><div class="gallery-caption"><strong></strong></div></div>';
  document.body.append(dialog);
  const largeImage = dialog.querySelector('.gallery-stage img');
  const count = dialog.querySelector('.gallery-count');
  const title = dialog.querySelector('.gallery-caption strong');
  const prev = dialog.querySelector('.gallery-prev');
  const next = dialog.querySelector('.gallery-next');

  function render() {
    const source = photos[current];
    largeImage.src = source.currentSrc || source.src;
    largeImage.alt = source.alt;
    title.textContent = source.closest('.grid > div')?.querySelector('p')?.textContent?.trim() || source.alt;
    count.textContent = `${current + 1} / ${photos.length}`;
    prev.hidden = next.hidden = photos.length < 2;
  }
  function move(amount) { current = (current + amount + photos.length) % photos.length; render(); }
  function close() { dialog.close(); }

  photos.forEach((photo, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-trigger';
    button.setAttribute('aria-label', `Ampliar foto: ${photo.alt}`);
    button.setAttribute('aria-haspopup', 'dialog');
    photo.before(button);
    button.append(photo);
    button.addEventListener('click', () => {
      opener = button;
      current = index;
      render();
      previousOverflow.value = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
      dialog.querySelector('.gallery-close').focus();
    });
  });
  dialog.addEventListener('close', () => { document.body.style.overflow = previousOverflow.value; opener?.focus(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  dialog.querySelector('.gallery-close').addEventListener('click', close);
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
  });
  dialog.addEventListener('touchstart', event => { start = { x:event.touches[0].clientX, y:event.touches[0].clientY }; }, { passive:true });
  dialog.addEventListener('touchend', event => {
    if (!start || photos.length < 2) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    start = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) move(dx < 0 ? 1 : -1);
  }, { passive:true });
})();
