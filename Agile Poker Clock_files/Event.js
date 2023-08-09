
function Event ( type )
{
    this.type = type;
    this.target = null;
    this.data = null;
}

Event.prototype.toString = function ()
{
    return "Event: " + this.type + " target: " + this.target + " data: " + this.data;
};
