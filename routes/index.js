var express = require('express');
var router = express.Router();
const indexController = require('../controllers/indexcontroller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET Show add profile Page */
router.get('/addprofile', function(req, res, next) {
  res.render('addprofile');
});

/* GET Show Profiles Page */
router.get('/profiles', indexController.profiles_get);

/* POST add profile */
router.post('/addprofile', indexController.addprofile_post);

/* GET Details Page. */
router.get('/details/:id', indexController.details_get);

/* GET Delete Profile. */
router.get('/deleteprofile/:id', indexController.deleteprofile_get);

/* POST Get Page Data. */
router.post('/pagedata', indexController.pagedata_post);



module.exports = router;
