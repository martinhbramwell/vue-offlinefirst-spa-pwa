const LG = console.log; // eslint-disable-line no-console, no-unused-vars

function getAll(selector) {
  return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
}

export function responsivity() {
  const $dropdowns = getAll('.navbar-item.has-dropdown:not(.is-hoverable)');
  const $burgers = getAll('.burger');

  function closeDropdowns() {
    $dropdowns.forEach(($el) => {
      $el.classList.remove('is-active');
    });
  }


  if ($dropdowns.length > 0) {
    $dropdowns.forEach(($el) => {
      $el.addEventListener('click', (event) => { // eslint-disable-line no-unused-vars
        event.stopPropagation();
        $el.classList.toggle('is-active');
      });
    });

    document.addEventListener('click', (event) => { // eslint-disable-line no-unused-vars
      closeDropdowns();
    });
  }

  // Close dropdowns if ESC pressed
  document.addEventListener('keydown', (event) => {
    const e = event || window.event;
    if (e.keyCode === 27) {
      closeDropdowns();
    }
  });

  // Toggles
  if ($burgers.length > 0) {
    LG(`--- We haz ${$burgers.length} burgers. ---`);
    LG($burgers);
    $burgers.forEach(($el) => {
      $el.addEventListener('click', () => {
        const { target } = $el.dataset;
        const $target = document.getElementById(target);
        // LG('------');
        // LG($el.classList);
        // LG($target.classList);
        // LG('------');
        $el.classList.toggle('is-active');
        $target.classList.toggle('is-active');
      });
    });
  } else {
    LG('--- Yes! We haz no burgers ---');
  }
}

export function shutBurgerMenu() {
  getAll('.burger').forEach(burger => burger.classList.remove('is-active'));
  getAll('.burger-bar').forEach(bar => bar.classList.remove('is-active'));
}

LG('        ############# Responsive menu event handling installed #############');
