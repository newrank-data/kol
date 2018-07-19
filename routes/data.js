require('dotenv').config();
const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const MONGODB_URI = process.env.MONGODB_URI;

router.get('/', (req, res) => {
  
  MongoClient.connect(MONGODB_URI, (err, db) => {

    const query = {};
    
    if (req.query.name) {
      const re = eval(`/${req.query.name}/i`);
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
      const cursor = db.collection('kol').find(query);
      cursor.count((err, num) => {
        if (!err) {
          cursor.sort({_id: -1}).skip(skip).limit(10);
          cursor.toArray((err, docs) => {
            if (!err) {
              res.status(200).end(JSON.stringify({
                num: num,
                skip: skip,
                docs, docs
              }));
              db.close()
            } else {
              console.log('search error.');
              db.close();
            }
          });
        } else {
          console.log('count error.');
          db.close();
        }
      });
    } else {
      console.error('connect mongo: fail!');
    }
  });
});

router.post('/', (req, res) => {
  const actionType = req.body.actionType;
  const id = req.body.id;
  const item = req.body.item;

  MongoClient.connect(MONGODB_URI, (err, db) => {
    if (actionType == 2) {
      db.collection('kol').update({
        _id: ObjectId(id)
      }, item, {}, (err, reply) => {
        if (!err) {
          res.status(200).end('处理成功');
          db.close();
        } else {
          console.log('update error.');
          console.log(err);
          db.close();
        }
      })
    } else if (actionType == 1) {
      db.collection('kol').insertOne(item, (err, reply) => {
        if (!err) {
          res.status(200).end('处理成功');
          db.close();
        } else {
          console.log('insert error.');
          db.close();
        }
      });
    }
  });
});

module.exports = router;
