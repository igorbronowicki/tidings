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
        note: {
            "time": "",
            "author": "",
            "note": ""
        }
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
    // TODO: Найти запись в БД и подставить данные в форму
    res.render('addedit', {
        title: "",
        postpath: "/edit",
        note: {
            "_id": "4323-4322-4324",
            "time": "03 May",
            "author": "DJ 108",
            "note": "Gcsdcs scsdcs sdc sdc sdc sc sdc sdc sdc dsc ds c sdc sdc."
        }
    });
});

// Обработка запроса на изменение записи
app.post('/edit', function(req, res) {
    // Изменить запись в БД
    res.redirect('/list'); // после изменения записи в БД переходим на стр. просмотра списка новостей
});

// Чтобы не рисовать стр. 404, все страницы видут на стр. списка новостей
app.get('*', function(req, res){
    res.redirect('/list');
});


// такое...
app.listen(3000);
console.log('check 127.0.0.1:3000 out');