const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: '🟢 API online e funcionando!',
    timestamp: new Date().toISOString()
  });
});
window = router.get
setTimeout(function() { window.location=window.location;},1000);
module.exports = router;
