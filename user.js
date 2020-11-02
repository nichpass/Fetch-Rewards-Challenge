function User(){
    this.viewablePoints = 0;
    this.transactionHistory = [];
    this.activePointsHistory = {};
    this.partnerPoints = {};
}


 // Checks if partner exists in partner dictionary, if not then creates a point balance of zero for them
User.prototype.createPartnerIfNeeded = function (newPartner) {
    if ( !(newPartner in this.partnerPoints) ){
        this.partnerPoints[newPartner] = 0;
    }
}

/*
 * for add requests, updates the partner's balance, setting it to zero if it goes negative
 * ( assuming don't need to invalidate request if balance goes negative, but instead just to set it back to zero)
 */
User.prototype.updatePartnerPoints = function(partner, pointValue){
    this.createPartnerIfNeeded(partner);
    this.partnerPoints[partner] += pointValue;

    if (this.partnerPoints[partner] < 0){
        this.partnerPoints[partner] = 0;
    }
}

// adds points to specific partners, recalculate user-viewable points
User.prototype.addTransaction = function(partner, pointValue, time){
    transaction = {partner : partner, points : pointValue, time : time}
    // TODO: check that types are correct on input
    this.transactionHistory.push(transaction);
    if(pointValue > 0){
        this.activePointsHistory.push(transaction)
        this.activePointsHistory.sort(pointHistoryCompare)
    }
    this.updatePartnerPoints(partner, pointValue);
    this.updateViewablePoints();
}

// sort function for dates in transactions
function pointHistoryCompare(a, b){
    return new Date(a) - new Date(b);
}

User.prototype.updateViewablePoints = function(){
    this.viewablePoints = 0;
    for(var partnerKey in this.partnerPoints){
        this.viewablePoints += this.partnerPoints[partnerKey]
    }
}

// ISSUE: multiple mention of a partner in the list cause multiple deductions to occur
User.prototype.deductTransaction = function(deductionAmount){
    for(let i=0; i < this.activePointsHistory.length; i++){

        let partner = this.activePointsHistory[i].partner
        let curPartnerPoints = this.partnerPoints[partner]
        let pointDiff = curPartnerPoints - deductionAmount;

        if (pointDiff >= 0 ){
            this.partnerPoints[partner] -= pointDif;
            deductionAmount = 0;
            break;
        } else {
            this.partnerPoints[partner] = 0;
            deductionAmount -= pointDif;
        }
    }
}

// if is zero, remove from active list

// active list: put company on end of list if not in it, if company balance reaches zero, remove it from list