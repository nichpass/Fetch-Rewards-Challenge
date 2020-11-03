var express = require('express');
var router = express.Router();
var User = require('../public/javascripts/user.js')

let user = new User();


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.get('/mypoints', function(req, res, next) {
  res.send("User Balance:" + user.viewablePoints);
});


// add points to account
router.post('/addpoints', function(req, res, next){
  transactions = req.body.transactions;

  for (let i = 0; i < transactions.length; i++){
    partner = transactions[i][0];
    points = parseInt(transactions[i][1].replace(/,/g, ""));
    time = formatTime(transactions[i][2]);

    user.addTransaction(partner, points, time);
  }
  res.send("Updated User Balance: " + user.viewablePoints + "\n\nPartner Balances:\n" + user.getPartnerPoints());
});


// remove points from account
router.post('/removepoints', function(req, res, next){
  transactions = req.body.transactions;
  deductAmount = transactions;

  user.deductTransaction(deductAmount);
  res.send("Updated User Balance: " + user.viewablePoints + "\n\nPartner Balances:\n" + user.getPartnerPoints())
});


// ex: changes "10/31 11AM"  to  "2020-10-31T11:00:00"   (assuming 2020 for each year to preserve given example format)
function formatTime(time){
  t = time.split(" ");
  dateStr = "2020-" + t[0].replace("/", "-"); // 10/31 -> 2020-10-31

  timeStr = t[1].substring(0, t[1].length - 2); // 11AM -> 11
  timeStr = timeStr.length < 2 ? "0" + timeStr : timeStr; // '9' -> '09' but '11' -> still '11'
  timeStr += ":00:00";

  return dateStr + "T" + timeStr;
}

module.exports = router;
