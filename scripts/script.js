


function receiveState() {
    if (inited) {
        switch (COBI.parameters.context()) {
            case COBI.context.onRide:
                COBI.motor.distance.read(function (value, timestamp) {
                    console.log("On ride")
                    document.getElementById('labelState').innerHTML = "On ride" + value.toString() + "at time:" + timestamp.toString();
                });
                break;
            case COBI.context.offRide:
                console.log("Off ride");
                document.getElementById('labelState').innerHTML = "Off Ride - Start a ride first to receive";
                break;
            default:
                console.log("Default");
        }
    } else {
        document.getElementById('labelState').innerHTML = 'You have to click init first to receive Data';
    }
}



