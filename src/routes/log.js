let router = require('express').Router();
let logsController = require("../controllers/logsController");

router.post('/create', logsController.createLog);
router.get('/', logsController.allLogs);
router.get('/view/:id', logsController.viewLog);
router.put('/update/:id', logsController.updateLog);

router.delete('/delete/:id', logsController.removeLog);
router.delete('/delete', logsController.removeAllLogs);

router.get('/search', logsController.search);

module.exports = router;