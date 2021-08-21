import AnchorJS from './vendor/anchor-js.js';

import { Gallery } from './components/gallery.js';

const imageGalleries = {
  '15': [
    {
      src: '/images/guides/15-note--box-isometric.jpg',
      alt: 'A 15-note music-box, viewed from an isometric angle',
    },
    {
      src: '/images/guides/15-note--box-front.jpg',
      alt: 'A 15-note music-box, viewed from the front',
    },
    {
      src: '/images/guides/15-note--box-back.jpg',
      alt: 'A 15-note music-box, viewed from the back',
    },
    {
      src: '/images/guides/15-note--box-side.jpg',
      alt: 'A 15-note music-box, viewed from the side',
    },
    {
      src: '/images/guides/15-note--box-bottom.jpg',
      alt: 'A 15-note music-box, viewed from the bottom',
    },
    {
      src: '/images/guides/15-note--box-and-paper.jpg',
      alt: 'A 15-note music-box, with paper fed through it',
    },
  ],
  '20': [
    {
      src: '/images/guides/20-note--box.jpg',
      alt: 'A 20-note music-box, viewed from above',
    },
    {
      src: '/images/guides/20-note--box-bottom.jpg',
      alt: 'A 20-note music-box, viewed the bottom',
    },
    {
      src: '/images/guides/20-note--music-box-kit.jpg',
      alt: 'A 20-note music-box, with a punch tool and music box paper',
    },
  ],
  '30': [
    {
      src: '/images/guides/30-note--box-front.jpg',
      alt: 'A 30-note music-box, viewed from the front',
    },
    {
      src: '/images/guides/30-note--box-back.jpg',
      alt: 'A 30-note music-box, viewed from the back',
    },
    {
      src: '/images/guides/30-note--box-left.jpg',
      alt: 'A 30-note music-box, viewed from the left side',
    },
    {
      src: '/images/guides/30-note--box-right.jpg',
      alt: 'A 30-note music-box, viewed from the right side',
    },
    {
      src: '/images/guides/30-note--box-bottom.jpg',
      alt: 'A 30-note music-box, viewed from the bottom',
    },
    {
      src: '/images/guides/30-note--box-and-paper.jpg',
      alt: 'A 30-note music-box, with paper fed through it',
    },
  ]
};

new Gallery({ id: '15-note-gallery', images: imageGalleries['15'] }).render();
new Gallery({ id: '20-note-gallery', images: imageGalleries['20'] }).render();
new Gallery({ id: '30-note-gallery', images: imageGalleries['30'] }).render();

///////////////////////////////////////////////////////////////////////////////
// Below we have a few little scripts that aren't componentized because they //
// act broadly across the page and I don't want to turn guides into a full   //
// JavaScript rendered app (at least not right now).                         //
///////////////////////////////////////////////////////////////////////////////

new AnchorJS().add('.guide h2, .guide h3, .guide h4, .guide h5, .guide h6');

(function() {
  // A tiny bit of JS to open/close the nav on mobile
  const navIconEl = document.querySelector('#off-canvas-nav-icon');
  const sidebarEl = document.querySelector('#left-sidebar');
  const overlayEl = document.querySelector('#off-canvas-overlay');
  const bodyEl = document.body;

  navIconEl.addEventListener('click', toggleSidebar);
  overlayEl.addEventListener('click', toggleSidebar);

  function toggleSidebar(e) {
    sidebarEl.classList.toggle('on-canvas');
    overlayEl.classList.toggle('is-active');
    bodyEl.classList.toggle('no-scroll');
  }
})();
