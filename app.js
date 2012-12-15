var ejs = require('ejs');
    ejs.open = '[%';
    ejs.close = '%]';
var express = require('express');
var mongoose = require('mongoose');
var util = require('util');
var url = require('url');
var app = express();


// app configuration
app.engine('html', require('ejs').__express);
app.set('views', __dirname + '/templates');
app.set('view engine', 'html');
app.use('/static', express.static(__dirname + '/public'));
app.use(express.logger());
app.use(express.bodyParser());

// my custom middleware
var parseUrlParams = function(req, res, next) {
    req.urlP = url.parse(req.url, true);
    next();
}

// db configuration
var dbURL = 'mongodb://localhost/tidings';

var NoteSchema = new mongoose.Schema({
    "time": {
        "type": Date,
        "default": Date.now
    },
    "author": String,
    "note": String
});

var Note = mongoose.model('Note', NoteSchema);

mongoose.connect(dbURL);

var emptyNote = {
    "author": "",
    "note": ""
}

// routes

// Главная страница сайта. Переадресация на страницу списка новостей.
app.get('/', function(req, res) {
    res.redirect('/list'); // переход на стр. просмотра списка новостей
});

// Страница списка новостей
app.get('/list', function(req, res) {
    // Извлекаем все записи из БД
    Note.find({}, function(error, notes) {
        if (error) {
            // show error
        } else {
            res.render('list', {
                title: "Новости",
                notes: notes
            });
        }
    });
});

// Отрисовка формы для добавления записи
app.get('/add', function(req, res) {
    res.render('addedit', {
        title: "Новости",
        postpath: "/add",
        note: emptyNote
    });
});

// Обработка запроса на добавление записи
app.post('/add', function(req, res) {
    // Добавляем новую запись в БД
    Note.create({
        "author": req.body.author,
        "note": req.body.note
    }, function(error) {
        if (error) {
            // show error
        } else {
            res.redirect('/list'); // после добавления записи в БД переходим на стр. просмотра списка новостей
        }
    });
});

// Обработка запроса на удаление записи
app.get('/del', parseUrlParams, function(req, res) {
    // Удаляем запись из БД по ее _id
    Note.remove({
        "_id": req.urlP.query.id
    }, function(error) {
        if (error) {
            // show error
        } else {
            res.redirect('/list'); // после удаления записи из БД переходим на стр. просмотра списка новостей
        }
    });
});

// Отрисовка формы изменения записи
app.get('/edit', parseUrlParams, function(req, res) {
    Note.findOne({
        "_id": req.urlP.query.id
    }, function(error, note) {
        if (error) {
            // show error
        } else {
            res.render('addedit', {
                title: "Новости",
                postpath: "/edit",
                note: note
            });
        }
    });
});

// Обработка запроса на изменение записи
app.post('/edit', function(req, res) {
    Note.findOne({
        "_id": req.body.id
    }, function(error, note) {
        if (error) {
            // show error
        } else {
            note.time = new Date();
            note.author = req.body.author;
            note.note = req.body.note;
            note.save(function(error) {
                if (error) {
                    // show error
                } else {
                    res.redirect('/list'); // после изменения записи в БД переходим на стр. просмотра списка новостей
                }
            });
        }
    });
});

// Чтобы не рисовать стр. 404, все страницы видут на стр. списка новостей
app.get('*', function(req, res){
    res.redirect('/list');
});


// такое...
app.listen(3000);
console.log('check 127.0.0.1:3000 out');