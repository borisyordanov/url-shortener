const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const shortURL = require('./models/shortURL');

app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/shortURLs');

app.use(express.static(__dirname + '/public'));

app.get('/new/:url(*)', (req, res, next) => {
	const { url } = req.params;

	const regexURL =
		'^((https|http|ftp|rtsp|mms)?://)' +
		"?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" + //ftp的user@
		'(([0-9]{1,3}.){3}[0-9]{1,3}' + // IP形式的URL- 199.194.52.184
		'|' + // 允许IP和DOMAIN（域名）
		"([0-9a-z_!~*'()-]+.)*" + // 域名- www.
		'([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' + // 二级域名
		'[a-z]{2,6})' + // first level domain- .com or .museum
		'(:[0-9]{1,4})?' + // 端口- :80
		'((/?)|' + // a slash isn't required if there is no file name
		"(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";

	const validURL = new RegExp(regexURL);

	if (validURL.test(url)) {
		const short = Math.floor(Math.random() * 100000).toString();

		const data = new shortURL({
			originalURL: url,
			shortURL: short
		});

		data.save(err => {
			if (err) {
				return res.send('Error saving to db');
			}
		});

		return res.json(data);
	} else {
		const data = new shortURL({
			originalURL: url,
			shortURL: 'Provide valid URL'
		});

		return res.json(data);
	}
});

app.get('/:urlToForward(*)', (req, res, next) => {
	console.log(req.params);
	const url = req.params.urlToForward;
	console.log(url);

	shortURL.findOne({ shortURL: url }, (err, data) => {
		if (err) {
			return res.send('Error reading database');
		} else {
			const validURL = new RegExp("^(http|https)://","i");

			if(validURL.test(data.originalURL)) {
				res.redirect(301, data.originalURL);
			} else {
				res.redirect(301, 'http://' + data.originalURL);
			}
		}
	});
});

app.listen(process.env.PORT || 3000, () => {
	console.log('Listening!');
});
