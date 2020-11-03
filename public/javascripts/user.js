function User(){
    this.viewablePoints = 0;
    this.transactionHistory = [];
    this.activePointsHistory = [];
    this.partnerPoints = {};
}

/*
 * for add requests, updates the partner's balance, setting it to zero if it goes negative
 * (assuming don't need to invalidate add request if balance goes negative, but instead just to set it back to zero)
 */
User.prototype.updatePartnerPoints = function(partner, pointValue){
    addOrSetDict(this.partnerPoints, partner, pointValue);
    console.log(partner)
    if (this.partnerPoints[partner] < 0){
        this.partnerPoints[partner] = 0;
    }
}

// adds points to specific partners, recalculate user-viewable points
User.prototype.addTransaction = function(partner, pointValue, time){
    transaction = {partner : partner, points : pointValue, time : time}
    this.transactionHistory.push(transaction);
    if(pointValue > 0){
        this.activePointsHistory.push(transaction);
    }
    this.updatePartnerPoints(partner, pointValue);
    this.updateViewablePoints(pointValue);
}

// sort function for dates in transactions
function pointHistoryCompare(a, b){
    return new Date(a) - new Date(b);
}

User.prototype.updateViewablePoints = function(points){
    this.viewablePoints += points
}

// ISSUE: multiple mention of a partner in the list cause multiple deductions to occur
User.prototype.deductTransaction = function(deductionAmount){
    if(this.viewablePoints < deductionAmount){
        //TODO, throw error
        return -1;
    }

    let partnerDeductions = {};
    
    while(deductionAmount > 0 && this.activePointsHistory.length > 0){
        let partner = this.activePointsHistory[0].partner
        let pointTrans = this.activePointsHistory[0].points
        let curPartnerPoints = this.partnerPoints[partner]
        let pointDiff = curPartnerPoints - deductionAmount;

        // if as many points as transaction, sub trans amount from both
        if(this.partnerPoints[partner] >= pointTrans){ // need to account for when deduction amount runs out
            if(deductionAmount > pointTrans){
                deductionAmount -= pointTrans;
                addOrSetDict(partnerPoints, partner, -pointTrans);
                addOrSetDict(partnerDeductions, partner, pointTrans);
            } else {
                addOrSetDict(partnerPoints, partner, -deductionAmount);
                addOrSetDict(partnerDeductions, partner, deductionAmount);
                deductionAmount = 0;
            }
        } else {
            if(deductionAmount > this.partnerPoints[partner]){
                deductionAmount -= this.partnerPoints[partner];
                addOrSetDict(partnerPoints, partner, -this.partnerPoints[partner])
                addOrSetDict(partnerDeductions, partner, this.partnerPoints[partner]);
            } else {
                addOrSetDict(partnerPoints, partner, -deductionAmount);
                addOrSetDict(partnerDeductions, partner, deductionAmount);
                deductionAmount = 0;
            }
        }
        this.activePointsHistory.shift()
    }
    if (deductionAmount === 0) {
        return partnerDeductions;
    } else {
        return -1;
    }


}

User.prototype.getPartnerPoints = function(){
    str = "";
    for (let partner in this.partnerPoints) {
        // check if the property/key is defined in the object itself, not in parent
        if (this.partnerPoints.hasOwnProperty(partner)) {  
            str += partner + " : " + this.partnerPoints[partner] + "\n";    
        }
    }
    return str;
}

// add value to dict[key] or set dict[key] if key does not exists
function addOrSetDict(dict, key, value, def=0){
    if(key in dict){
        dict[key] += value;
    } else {
        dict[key] = value;
    }
}


module.exports = User;

/*
create dictionary outlining amount deducted from each company
    if still have points to deduct, look at next row
    if points to add in the row are negative then skip the row
if points to add are positive then check that the company has at least that many points
if they have less then deduct whatever they have and go on to next row
if they have more then deduct the amount on that row and go on to next one
if deduction balance is zero then return
*/
