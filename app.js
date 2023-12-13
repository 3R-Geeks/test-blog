const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

let posts = [];

app.post('/add-post', upload.single('image'), (req, res) => {
  const { title, date, text} = req.body;

  // File path for the uploaded image
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  const newPost = {
    title,
    date,
    text,
    image: imagePath,
    comments: [],
  };
  posts.push(newPost);
  res.redirect('/');
});

app.get('/', (req, res) => {
  res.render('index', { posts });
});

app.get('/post/:id', (req, res) => {
  const postId = parseInt(req.params.id);

  if (postId >= 0 && postId < posts.length) {
    const post = posts[postId];
    res.render('post', { post, postId });
  } else {
    res.status(404).send('Post not found');
  }
});

app.post('/add-comment/:id', (req, res) => {
  const postId = parseInt(req.params.id);

  if (postId >= 0 && postId < posts.length) {
    const { comment } = req.body;
    const post = posts[postId];
    post.comments.push(comment);
    res.redirect(`/post/${postId}`);
  } else {
    res.status(404).send('Post not found');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
