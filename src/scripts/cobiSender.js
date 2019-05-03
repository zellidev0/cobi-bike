var url = "https://bosch-iot-insights.com/data-recorder-service/v2/zz0005657184692";
var project = "zz0005657184692";
var username = "zz0005657184692-dd72c48c-b718-4030-a889-428047379cf9";
var username64 = "enowMDA1NjU3MTg0NjkyLWRkNzJjNDhjLWI3MTgtNDAzMC1hODg5LTQyODA0NzM3OWNmOQ==";
var password = "Ls-5aaQcovgFTQoV";
var password64 = "THMtNWFhUWNvdmdGVFFvVg==";
var username_password_64 = "enowMDA1NjU3MTg0NjkyLWRkNzJjNDhjLWI3MTgtNDAzMC1hODg5LTQyODA0NzM3OWNmOTpMcy01YWFRY292Z0ZUUW9W";





class CobiSender {
    constructor() {
        // Where to subscribe
        this.toSubscribe = {
            motor: false,
            battery: false,
            mobile: false,
            navigationService: false,
            tourService: false
        };

        // Latest values
        this.motorValues = {
            distance: undefined,
            assistanceIndicator: undefined,
            range: undefined,
            supportedDriveModes: undefined,
            driveMode: undefined,
            nextService: undefined
        };

        this.batteryValues = {
            state: undefined
        };

        this.mobileValues = {
            location: undefined,
            heading: undefined,
            locationAvailability: undefined
        };

        this.navigationServiceValues = {
            route: undefined,
            eta: undefined,
            distanceToDestination: undefined,
            status: undefined
        };

        this.tourServiceValues = {
            calories: undefined,
            ascent: undefined,
            ridingDistance: undefined,
            ridingDuration: undefined,
            averageSpeed: undefined
        };

        this.subscriptions = {
            motor: false,
            battery: false,
            mobile: false,
            navigationService: false,
            tourService: false
        };

        this.sendInterval = undefined;

    }

    run() {
        this.initCobi();

        this.updateSubscriptions();

        document.getElementById('motorCheckbox').addEventListener('change', e => {
            this.toSubscribe.motor = e.target.checked;
            this.updateSubscriptions();
        });

        document.getElementById('batteryCheckbox').addEventListener('change', e => {
            this.toSubscribe.battery = e.target.checked;
            this.updateSubscriptions();
        });

        document.getElementById('mobileCheckbox').addEventListener('change', e => {
            this.toSubscribe.mobile = e.target.checked;
            this.updateSubscriptions();
        });

        document.getElementById('navigationServiceCheckbox').addEventListener('change', e => {
            this.toSubscribe.navigationService = e.target.checked;
            this.updateSubscriptions();
        });

        document.getElementById('tourServiceCheckbox').addEventListener('change', e => {
            this.toSubscribe.tourService = e.target.checked;
            this.updateSubscriptions();
        });



        document.getElementById('btnSendToInsights').addEventListener('click', e => {
            const result = sendOverHTTP(JSON.stringify(this));
            if (result) {
                document.getElementById("btnSendToInsights").classList.toggle('btn-success');
            } else {
                document.getElementById("btnSendToInsights").classList.toggle('btn-danger');
            }
        });


        // this.sendInterval = setInterval(() => {
        //     console.log(JSON.stringify(this.motorValues))
        // }, 1000);

    }

    initCobi() {
        COBI.init('token — can be anything right now');
        document.getElementById("btnInit").classList.toggle('btn-success');
        document.getElementById("btnInit").innerHTML = 'COBI is connected';

    }


    updateSubscriptions() {
        if (this.toSubscribe.motor === false && this.subscriptions.motor === true) {
            this.unsubscribe("motor", ["distance", "assistanceIndicator", "range", "supportedDriveModes", "driveMode", "nextService"]);
        } else if (this.toSubscribe.motor && !this.subscriptions.motor) {
            this.subscribe("motor", ["distance", "assistanceIndicator", "range", "supportedDriveModes", "driveMode", "nextService"]);
        }

        if (this.toSubscribe.battery === false && this.subscriptions.battery === true) {
            this.unsubscribe("battery", ["state"]);
        } else if (this.toSubscribe.battery && !this.subscriptions.battery) {
            this.subscribe("battery", ["state"]);
        }

        if (this.toSubscribe.mobile === false && this.subscriptions.mobile === true) {
            this.unsubscribe("mobile", ["location", "heading", "locationAvailability"]);
        } else if (this.toSubscribe.mobile && !this.subscriptions.mobile) {
            this.subscribe("mobile", ["location", "heading", "locationAvailability"]);
        }

        if (this.toSubscribe.navigationService === false && this.subscriptions.navigationService === true) {
            this.unsubscribe("navigationService", ["route", "eta", "distanceToDestination", "status"]);
        } else if (this.toSubscribe.navigationService && !this.subscriptions.navigationService) {
            this.subscribe("navigationService", ["route", "eta", "distanceToDestination", "status"]);
        }

        if (this.toSubscribe.tourService === false && this.subscriptions.tourService === true) {
            this.unsubscribe("tourService", ["calories", "ascent", "ridingDistance", "ridingDuration", "averageSpeed"]);
        } else if (this.toSubscribe.tourService && !this.subscriptions.tourService) {
            this.subscribe("tourService", ["calories", "ascent", "ridingDistance", "ridingDuration", "averageSpeed"]);
        }


    }


    subscribe(property, subProperties) {
        // Example
        // COBI.motor.distance.subscribe((value, timestamp) => {
        //     this.subscriptions.motor = true;
        //     this.motorValues.distance = value;
        //     document.getElementById("motor" + "Result").innerText = "SUCCESS";
        //     console.log("AAA_motor_distance" + " :" + value)
        // });

        subProperties.forEach((entry) => {
            let x = "COBI." + property + "." + entry + ".subscribe((value, timestamp) => {\n" +
                "                this.subscriptions." + property + " = true;\n" +
                "                this." + property + "Values." + entry + " = value;\n" +
                "                document.getElementById(\"" + property + "\" + \"Result\").innerText = \"SUCCESS\";\n" +
                "                console.log(\"AAA_" + entry + "\" + \" :\" + value)\n" +
                "            });";
            eval(x);
        });
    }

    unsubscribe(property, subProperties) {
        //Example:
        //  COBI.motor.distance.unsubscribe((value, timestamp) => {
        //      this.subscriptions.motor = false;
        //      this.motorValues.distance = null;
        //      document.getElementById("motor" + "Result").innerText = "";
        //      console.log("BBB_motor_assistanceIndicator")
        //  });



        subProperties.forEach((entry) => {
            let x = "COBI." + property + "." + entry + ".unsubscribe((value, timestamp) => {\n" +
                "                this.subscriptions." + property + " = false;\n" +
                "                this." + property + "Values." + entry + " = null;\n" +
                "                document.getElementById(\"" + property + "\" + \"Result\").innerText = \"\";\n" +
                "                console.log(\"BBB_" + entry + "\")\n" +
                "            });";
            eval(x);
        });
    }
}



function sendOverHTTP(json) {
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                console.log("AAA data send was successfull");
            } else {
                console.log("AAA error sending data. Error code: " + httpRequest.status + ", Error message: " + httpRequest.responseText);
                return false;
            }
        }
    };
    httpRequest.open('POST', url, true);
    httpRequest.setRequestHeader('Content-Type', 'application/json');
    httpRequest.setRequestHeader('Authorization', "Basic " + username_password_64);
    httpRequest.send(json);
    console.log("AAA data was send");
    return true;
}

function sendOverHTTPTest(json) {
    console.log("AAA" + json);
    return true;
}



new CobiSender().run();

