var insights_url = "https://bosch-iot-insights.com/data-recorder-service/v2/zz0005657184692";
var hub_url = "https://http.bosch-iot-hub.com/telemetry/";
var hub_url_lulu = "https://http.bosch-iot-hub.com/telemetry/t095a135d89f0405ca9ab579bd24546d4/COBI-04";


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

        this.subscriptions = {};

        this.sendInterval = undefined;

    }

    run() {
        this.initCobi();

        document.getElementById('btnInit').addEventListener('click', e => {
            this.initCobi()
        });

        document.getElementById('motorCheckbox').addEventListener('change', e => {
            document.getElementById('motorResult').innerHTML = "Subscribed: Waiting for data.";
            this.toSubscribe.motor = e.target.checked;
            this.updateSubscriptions();
        });

        document.getElementById('batteryCheckbox').addEventListener('change', e => {
            document.getElementById('batteryResult').innerHTML = "Subscribed: Waiting for data.";

            this.toSubscribe.battery = e.target.checked;
            this.updateSubscriptions();
        });

        document.getElementById('mobileCheckbox').addEventListener('change', e => {
            document.getElementById('mobileResult').innerHTML = "Subscribed: Waiting for data.";

            this.toSubscribe.mobile = e.target.checked;
            this.updateSubscriptions();
        });

        document.getElementById('navigationServiceCheckbox').addEventListener('change', e => {
            document.getElementById('navigationServiceResult').innerHTML = "Subscribed: Waiting for data.";

            this.toSubscribe.navigationService = e.target.checked;
            this.updateSubscriptions();
        });

        document.getElementById('tourServiceCheckbox').addEventListener('change', e => {
            document.getElementById('tourServiceResult').innerHTML = "Subscribed: Waiting for data.";

            this.toSubscribe.tourService = e.target.checked;
            this.updateSubscriptions();
        });


        const btnInsights = document.getElementById('btnSendToInsights');
        btnInsights.addEventListener('click', e => {
            const s = document.getElementById("username").value;
            let username_pw = btoa(s);

            if (username_pw === "") {
                document.getElementById("username").placeholder = "Insert username:passwort";
                return;
            }

            const result = sendOverHTTPTest(JSON.stringify(this), username_pw);
            // const result = sendToInsights(JSON.stringify(this), username_pw);
            if (result) {
                btnInsights.classList.add('btn-success');
                btnInsights.classList.remove('btn-danger');
            } else {
                btnInsights.classList.add('btn-danger');
                btnInsights.classList.remove('btn-success');
            }
        });

        const btnHub = document.getElementById('btnSendToHub');
        btnHub.addEventListener('click', e => {
            let s = document.getElementById("hubToken").value.toString();
            let hubToken = "Basic " + btoa(s);

            if (hubToken === "Basic ") {
                document.getElementById("hubToken").placeholder = "Insert hub auth token first.";
                return;
            }

            const result = sendToHub(JSON.stringify(this), hubToken);
            // const result = sendToHubLulu(JSON.stringify(this), hubToken);
            // const result = sendToHub(JSON.stringify(this), hubToken);
            if (result) {
                btnHub.classList.add('btn-success');
                btnHub.classList.remove('btn-danger');
            } else {
                btnHub.classList.remove('btn-danger');
                btnHub.classList.add('btn-success');
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

        if (this.toSubscribe.motor === false) {
            this.unsubscribe("motor", ["distance", "assistanceIndicator", "range", "supportedDriveModes", "driveMode", "nextService"]);
        } else {
            this.subscribe("motor", ["distance", "assistanceIndicator", "range", "supportedDriveModes", "driveMode", "nextService"]);
        }

        if (this.toSubscribe.battery === false) {
            this.unsubscribe("battery", ["state"]);
        } else {
            this.subscribe("battery", ["state"]);
        }

        if (this.toSubscribe.mobile === false) {
            this.unsubscribe("mobile", ["location", "heading", "locationAvailability"]);
        } else {
            this.subscribe("mobile", ["location", "heading", "locationAvailability"]);
        }

        if (this.toSubscribe.navigationService === false) {
            this.unsubscribe("navigationService", ["route", "eta", "distanceToDestination", "status"]);
        } else {
            this.subscribe("navigationService", ["route", "eta", "distanceToDestination", "status"]);
        }

        if (this.toSubscribe.tourService === false) {
            this.unsubscribe("tourService", ["calories", "ascent", "ridingDistance", "ridingDuration", "averageSpeed"]);
        } else {
            this.subscribe("tourService", ["calories", "ascent", "ridingDistance", "ridingDuration", "averageSpeed"]);
        }


    }


    subscribe(property, subProperties) {
        for (const subProp of subProperties) {
            const subKey = property + '_' + subProp;
            const propertyValues = property + "Values";
            this.subscriptions[subKey] = (value, timestamp) => {
                this[propertyValues][subKey] = value;
                document.getElementById(property + "Result").innerText = "Data received.";
                console.log("AAA_" + property + "_" + subProp + " :" + value)
            };
            COBI[property][subProp].subscribe(this.subscriptions[subKey]);
        }

        // Example
        // COBI.motor.distance.subscribe((value, timestamp) => {
        //     this.subscriptions.motor = true;
        //     this.motorValues.distance = value;
        //     document.getElementById("motor" + "Result").innerText = "Data received.";
        //     console.log("AAA_motor_distance" + " :" + value)
        // });

    }

    unsubscribe(property, subProperties) {
        for (const subProp of subProperties) {
            const subKey = property + '_' + subProp;
            const subFunc = this.subscriptions[subKey];
            if (subFunc) {
                COBI[property][subProp].unsubscribe(subFunc);
                delete this.subscriptions[subKey];
                document.getElementById(property + "Result").innerText = "Unsubscribed, last received data stored";
                console.log('BBB Unsubscribe: ' + subKey);
            }
        }

        //Example:
        //  COBI.motor.distance.unsubscribe((value, timestamp) => {
        //      this.subscriptions.motor = false;
        //      this.motorValues.distance = null;
        //      document.getElementById("motor" + "Result").innerText = "Unsubscribed, waiting for data stream to stop.";
        //      console.log("BBB_motor_assistanceIndicator")
        //  });
    }
}


function sendToInsights(json, usrPw) {
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
    httpRequest.open('POST', hub_url, true);
    httpRequest.setRequestHeader('Content-Type', 'application/json');
    httpRequest.setRequestHeader('Authorization', "Basic " + usrPw);
    httpRequest.send(json);
    console.log("AAA data was send");
    return true;
}

function sendToInsightsTest(json, usrPw) {
    console.log("AAATest" + json);
    return true;
}


function sendToHub(json, hubToken) {
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                console.log("HUB data send was successfull to hub");
            } else {
                console.log("HUB error sending data. Error code: " + httpRequest.status + ", Error message: " + httpRequest.responseText);
                return false;
            }
        }
    };
    httpRequest.open('POST', hub_url, true);
    httpRequest.setRequestHeader('QoS-Level', '1');
    httpRequest.setRequestHeader('Content-Type', 'application/json');
    httpRequest.setRequestHeader('Authorization', hubToken);
    let s = "{" +
        "   \"topic\": \"com.bosch.bcx.cobibike.julian/device_1/things/twin/commands/modify\"," +
        "   \"headers\": {}," +
        "   \"path\": \"/features/data\"," +
        "   \"value\": {" +
        "     \"properties\": " + json + "" +
        "   }" +
        "}";
    httpRequest.send(s);
    console.log("HUB data was send: " + s);
    return true;
}

function sendToHubTest(json, hubToken) {
    console.log("HUBTest" + json);
    return true;
}


function sendToHubLulu(json, hubToken) {
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                console.log("HUB data send was successfull to hub");
            } else {
                console.log("HUB error sending data. Error code: " + httpRequest.status + ", Error message: " + httpRequest.responseText);
                return false;
            }
        }
    };
    httpRequest.open('PUT', hub_url_lulu, true);
    httpRequest.setRequestHeader('QoS-Level', '1');
    httpRequest.setRequestHeader('Content-Type', 'application/json');
    httpRequest.setRequestHeader('Authorization', hubToken);
    let s = "{" +
        "   \"topic\": \"com.bosch.bcx/COBI/things/twin/commands/modify\"," +
        "   \"headers\": {}," +
        "   \"path\": \"/features/data\"," +
        "   \"value\": {" +
        "     \"properties\": " + json + "" +
        "   }" +
        "}";
    httpRequest.send(s);
    console.log("HUB data was send: " + s);
    return true;
}

new CobiSender().run();

