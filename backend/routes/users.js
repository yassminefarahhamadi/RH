const express = require('express');
const router = express.Router();
const usersController = require('../controllers/userController');

// ⚠️ Placez la route /filter AVANT /:id
router.get('/filter', usersController.getFiltered);
router.get('/', usersController.getAll);
router.post('/', usersController.create);
router.put('/:id', usersController.update);
router.delete('/:id', usersController.remove);
router.get('/:id', usersController.getById);

module.exports = router;
