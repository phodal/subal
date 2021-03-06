const fs = require('fs');
const path = require('path');
const Subal = require('../index');

const filePath = path.join(__dirname, 'fixture/tests-simple.json');

fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
  if (!err) {
    let subal = new Subal(data);

    let results = subal
      .tokenizer()
      .parser()
      .generator()
      .renderString();

    console.log(results);
  } else {
    console.log(err);
  }
});
