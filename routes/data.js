const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const mongoURL = 'mongodb://localhost:27017';

router.get('/', (req, res, next) => {
  
  MongoClient.connect(mongoURL, (err, client) => {

    const query = {};
    
    if (req.query.name) {
      const re = eval(`/${req.query.name}/`);
      query.name = {$regex: re};
    }
  
    if (req.query.type) {
      query.type = req.query.type;
    }
  
    if (req.query.category) {
      query.category = req.query.category;
    }
  
    if (req.query.is_valid) {
      query.is_valid = req.query.is_valid == 'false' ? false : true;
    }

    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
  
    if (!err) {
      const db = client.db('newrank');
      const cursor = db.collection('kol').find(query);
      cursor.count((err, num) => {
        if (!err) {
          cursor.skip(skip).limit(10);
          cursor.toArray((err, docs) => {
            if (!err) {
              res.status(200).end(JSON.stringify({
                num: num,
                skip: skip,
                docs, docs
              }));
              client.close()
            } else {
              next();
            }
          });
        } else {
          next();
        }
      });
    } else {
      console.error('connect mongo: fail!');
    }
  });
});

router.use((req, res) => {
  res.status(500).end('查询失败');
  client.close();
});



module.exports = router;
