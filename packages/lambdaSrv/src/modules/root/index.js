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
  res.render('root/show', { title: 'Iridium Blue', rootObject: { "string" : "some text", "object" : { "string" : "text" } } });
});

module.exports = router
