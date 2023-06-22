//  date object is used to find date and month
//  let today = new Date()
//    this tells the date object how we want data
// var options={weekday:"long", day:"numeric", month:"long"}
//  as per requires this method sents the data in english and according the options provided
// let day=today.toLocaleDateString("en-US",options)

module.exports.getdate=function(){
    const today = new Date()
    const options={weekday:"long", day:"numeric", month:"long"}
    return today.toLocaleDateString("en-US",options)
}
module.exports.getday=function(){
    const today = new Date()
    const options={weekday:"long"}
    return today.toLocaleDateString("en-US",options)
}