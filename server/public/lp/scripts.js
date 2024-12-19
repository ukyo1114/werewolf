// scripts.js

document.addEventListener('DOMContentLoaded', function() {
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
      const button = item.querySelector('.accordion-button');

      button.addEventListener('click', () => {
          const isActive = item.classList.contains('active');

          // すべてのアコーディオンを閉じる
          accordionItems.forEach(i => {
              i.classList.remove('active');
              i.querySelector('.accordion-button').setAttribute('aria-expanded', 'false');
          });

          // クリックしたアコーディオンの開閉を切り替える
          if (!isActive) {
              item.classList.add('active');
              button.setAttribute('aria-expanded', 'true');
          }
      });
  });
});
