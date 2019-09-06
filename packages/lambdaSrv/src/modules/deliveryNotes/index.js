import express from 'express';
const router = express.Router();

// // middleware that is specific to this router
// router.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })

/**
 * Process Invoices
 */
router.get('/', (req, res) => {
  res.render('deliveryNotes/list', { title: 'Guías de Remisión' });
});

module.exports = router
