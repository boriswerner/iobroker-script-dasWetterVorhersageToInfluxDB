//add influx to the additional NPM modules in the javascript instance settings
const Influx = require('influx');

const influx= new Influx.InfluxDB({
    host: 'localhost', //or change to the IP of your influxdb
    database: '[yourDatabaseName]',
    username: '[yourUserName]',
    password: '[yourPassword]',
	  port:8086 //default port 8086, change if necessary
});

// current trigger is change of the current hour value so an hourly update is done. Haven't checked yet whether that makes sense.
// changes in the forecast will update the datapoint in influx
on({id: 'daswetter.0.NextHours.Location_1.Day_1.current.hour_value', change: "ne"}, function (obj) 
{ 
    $('channel[state.id=daswetter.0.NextHours.Location_1.*.Hour_*.temp_value]').each(function (id, i) {
            var tempValue = getState(id).val;

            var d=new Date(Date.now());
            var daysToAddSource = id.substring(id.indexOf("Day_")+4, id.indexOf("Day_")+5);
            var newDate = addDays(d, parseInt(daysToAddSource)-1);

            var hourInt = parseInt(id.substring(id.indexOf("Hour_")+5, id.indexOf("Hour_")+7).replace(".", ""));
            newDate.setHours(hourInt, 0, 0);
            
            //log(id + " | " + tempValue + " | " + newDate.valueOf()*1000000  + " | " + hourInt);
            
			//no error handling yet!
            influx.writePoints([
            {     
                measurement: '0_userdata.Wettervorhersage.DasWetter.temperature',
                timestamp: newDate.valueOf()*1000000,
                fields: { value: tempValue}
            } ]) 
            .then(() => {   
                // do something after insert...
            });
        }); 

    function addDays(date, days) {
        var result = new Date(date);
        var oldDay = parseInt(date.getDate());
        var addDays =  parseInt(days);
        var newDay = oldDay + addDays;
        result.setDate(newDay);
        return result;
    } 
});

