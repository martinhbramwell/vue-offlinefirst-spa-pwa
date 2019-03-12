// progressbar.js@1.0.0 version is used
// Docs: http://progressbarjs.readthedocs.org/en/1.0.0/

const startProgress = (container) => {
  return new ProgressBar.Line(container, {
    strokeWidth: 4,
    easing: 'easeInOut',
    duration: 1400,
    color: '#FFEA82',
    trailColor: '#eee',
    trailWidth: 1,
    svgStyle: {width: '100%', height: '100%'},
    text: {
      style: {
        // Text color.
        // Default: same as stroke color (options.color)
        color: '#999',
        position: 'absolute',
        right: '0',
        top: '30px',
        padding: 0,
        margin: 0,
        transform: null
      },
      autoStyleContainer: false
    },
    from: {color: '#FFEA82'},
    to: {color: '#ED6A5A'},
    step: (state, bar) => {
      bar.setText(Math.round(bar.value() * 100) + ' Porcentaje de 1000 clientes');
    }
  });
}

// bar.animate(.20);  // Number from 0.0 to 1.0
// bar.animate(.40);  // Number from 0.0 to 1.0
// bar.animate(.60);  // Number from 0.0 to 1.0

// clearInterval(timer);

/* bar.animate(.80);  // Number from 0.0 to 1.0
bar.animate(1.0);  // Number from 0.0 to 1.0
 */
