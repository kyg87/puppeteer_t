var fs = require('fs'),
    request = require('request');

var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

var moment = require('moment');


function timeStampFormat() {
    return moment().format('YYYY-MM-DD-HH-mm-ss');
};

// download('https://www.google.com/images/srpr/logo3w.png', 'image/google.png', function () {
//     console.log('done');
// });

module.exports.download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        //console.log('content-type:', res.headers['content-type']);
        //console.log('content-length:', res.headers['content-length']);
        
        var _filename = filename + timeStampFormat() +'.'+ res.headers['content-type'].split('/')[1] ;

        _filename = _filename.replace(/ /gi, "_")
        //console.log('_filename', _filename)
        request(uri).pipe(fs.createWriteStream(_filename)).on('error',function(err){
            console.log('err',err)
        });
        console.log('filename', _filename.split('/')[2])
        callback(_filename.split('/')[2])
    });
};