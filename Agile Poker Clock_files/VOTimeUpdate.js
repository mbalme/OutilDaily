function VOTimeUpdate ( totalTime, roundTime, roundType )
{
    this.totalTime = totalTime;
    this.roundTime = roundTime;
    this.roundType = roundType;
}

VOTimeUpdate.prototype.toString = function ()
{
    return "total: " + this.totalTime + " round: " + this.roundTime + " roundType: " + this.roundType;
};