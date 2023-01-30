var express = require('express');
var path = require('path')
var router = express.Router();
const {users, files} = require('../data/users')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/',(req, res)=>{
  const { username } = req.body;
  if(!username){
    res.redirect('/',{ error : 'Username is invalid' });
  }
  res.redirect(`/users/${username}`)
});

router.get('/files',(req, res)=>{
  res.render('files',{ files })
})

router.get('/files/:file', function(req, res, next){
  const filename = req.params.file
  const FILES_DIR = path.join(__dirname, `files/${filename}`)
  res.download(FILES_DIR, function (err) {
    if (!err) return; // file sent
    if (err.status !== 404) return next(err); // non-404 error
    // file for download not found
    res.statusCode = 404;
    res.send('Cant find that file, sorry!');
  });
});


module.exports = router;
