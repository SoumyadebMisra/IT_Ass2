var express = require('express');
const fileUpload = require('express-fileupload')
var router = express.Router();
const {users, files} = require('../data/users')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken');
const { authorizationMiddleware } = require('../middleware/AuthMiddleware');

router.use(fileUpload())
router.use(cookieParser());


/* GET users listing. */
router.get('/signup', function(req, res, next) {
  res.render('signup')
});
router.get('/login', function(req, res, next) {
  res.render('login')
});

router.get('/logout',(req, res)=>{
  if(!req.cookies.access_token) {
    return res.redirect('/users/login')
  }
  return res.clearCookie('access_token')
            .status(200)
            .json('successfully logged out')
})

router.post('/signup', (req, res)=>{
  const { user_name, password } = req.body;
  console.log(user_name,password);
  if(!user_name){
    return res.redirect('/users/signup')
  } else if(!password) {
    return res.redirect('/users/signup')
  }
  const newUser = {
    username : user_name,
    password,
    files : []
  }
  const token = jwt.sign(user_name, process.env.SECRET);
  users.push(newUser);
  console.log(users);
  res
  .cookie("access_token", token, {
    httpOnly: true,
  })
  res.redirect(`/users/${user_name}`)
  
})

router.post('/login', (req, res)=>{
  const { user_name, password } = req.body;
  console.log(user_name,password);
  if(!user_name){
    return res.redirect('/users/signup')
  } else if(!password) {
    return res.redirect('/users/signup')
  }
  const user = users.find((user)=>{return user.username === user_name})
  if(!user) res.redirect('/users/signup')
  if(user.password !== password) res.redirect('users/login')
  const token = jwt.sign(user_name, process.env.SECRET);
  console.log(user);
  res.cookie("access_token", token, {
    httpOnly: true,
  })

  return res.render(`user`,{user})
  
})

router.get('/:username',authorizationMiddleware,(req, res)=>{
  const {username} = req.params;
  if(username !== req.username){
    // console.log(req)
    // console.log(username, req.username);
    return res.status(403).json('Wrong username')
  }
  const user = users.find((user)=>{
    return user.username === username;
  })
  if(!user){
    return res.redirect('/users/signup');
  }

  return res.render('user',{ user })
})
router.get('/:username/upload',authorizationMiddleware,(req, res)=>{
  const { username } = req.params;
  console.log(users);
  const user = users.find((user)=>{
    return user.username === username
  })
  if(!user){
    return res.redirect('/users/signup')
  }
  return res.render('upload', { user :  user});
})

router.post('/:username/upload',authorizationMiddleware,(req, res)=>{
  const {username} = req.params;
  const user = users.find((user)=>{
    return user.username === username
  })
  if(!user){
    return res.redirect('/users/signup')
  }
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  const file = req.files.uploadedFile;
  console.log(__dirname)
  const uploadPath = __dirname + '/files/' + file.name;
  file.mv(uploadPath, function(err) {
    if (err)
      return res.status(500).send(err);

    user.files.push(file.name)
    files.push(file.name)
    return res.redirect('/users/'+username);
  });

})


// router.get('/files/:file', function(req, res, next){
//   res.download(req.params.file, { root: FILES_DIR }, function (err) {
//     if (!err) return; // file sent
//     if (err.status !== 404) return next(err); // non-404 error
//     // file for download not found
//     res.statusCode = 404;
//     res.send('Cant find that file, sorry!');
//   });
//   res.send('file downloaded')
// });



module.exports = router;
