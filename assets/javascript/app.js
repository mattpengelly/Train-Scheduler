var config = {
    apiKey: "AIzaSyBKz_JD90oaQLPoR0qnHNmc65vUjoilf5g",
    authDomain: "train-tracker-42f6c.firebaseapp.com",
    databaseURL: "https://train-tracker-42f6c.firebaseio.com",
    projectId: "train-tracker-42f6c",
    storageBucket: "train-tracker-42f6c.appspot.com",
    messagingSenderId: "811484975932"
};

firebase.initializeApp(config);

database = firebase.database();

var trainScheduler = {

    addTrain: function (event) {

        var name = event.target.form[0].value;
        var destination = event.target.form[1].value;
        var firstTrain = event.target.form[2].value;
        var frequency = event.target.form[3].value;
        // console.log(event);
        console.log(name);
        console.log(destination);
        console.log(firstTrain);
        console.log(frequency);

        database.ref().push({

            name: name,
            destination: destination,
            firstTrain: firstTrain,
            frequency: frequency,

        });
    },

    writeRows: function (snapshot) {

        database.ref().on("value", function (snapshot) {
            $("tr").remove(".trains");
            snapshot.forEach(function (child) {

                // console.log("writeRows called");
                // console.log(snapshot.val());

                var name = child.val().name;
                var destination = child.val().destination;
                var frequency = child.val().frequency;
                var firstTrain = child.val().firstTrain;
                [minAway, next] = trainScheduler.calcTimes(frequency, firstTrain);

                var newRow = $("<tr class='trains'>");
                newRow.append("<td>" + name + "</td>");
                newRow.append("<td>" + destination + "</td>");
                newRow.append("<td class='text-center'>" + frequency + "</td>");
                newRow.append("<td class='text-center'>" + next + "</td>");
                newRow.append("<td class='text-center'>" + minAway + "</td>");
                newRow.append("<td class='delete-button'>X</td>");

                $("#train-list").append(newRow);

            });

            $(".currTime").empty();
            $(".currTime").append(moment().format('hh:mm'));

        })
    },

    calcTimes: function (tFrequency, firstTime) {
        // Assume the following situations.

        // (TEST 1)
        // First Train of the Day is 3:00 AM
        // Assume Train comes every 3 minutes.
        // Assume the current time is 3:16 AM....
        // What time would the next train be...? (Use your brain first)
        // It would be 3:18 -- 2 minutes away

        // (TEST 2)
        // First Train of the Day is 3:00 AM
        // Assume Train comes every 7 minutes.
        // Assume the current time is 3:16 AM....
        // What time would the next train be...? (Use your brain first)
        // It would be 3:21 -- 5 minutes away


        // ==========================================================

        // Solved Mathematically
        // Test case 1:
        // 16 - 00 = 16
        // 16 % 3 = 1 (Modulus is the remainder)
        // 3 - 1 = 2 minutes away
        // 2 + 3:16 = 3:18

        // Solved Mathematically
        // Test case 2:
        // 16 - 00 = 16
        // 16 % 7 = 2 (Modulus is the remainder)
        // 7 - 2 = 5 minutes away
        // 5 + 3:16 = 3:21

        // Assumptions
        // var tFrequency = 3;

        // Time is 3:30 AM
        // var firstTime = "03:30";

        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
        console.log("firstTimeConverted:  " + firstTimeConverted);

        // Current Time
        var currentTime = moment();
        console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        console.log("DIFFERENCE IN TIME: " + diffTime);

        // Time apart (remainder)
        var tRemainder = diffTime % tFrequency;
        console.log(tRemainder);

        // Minute Until Train
        var tMinutesTillTrain = tFrequency - tRemainder;
        console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

        // Next Train
        var nextTrain = moment().add(tMinutesTillTrain, "minutes");
        console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));

        return [tMinutesTillTrain, moment(nextTrain).format("hh:mm")];
    }
};

$(document).ready(function () {

    console.log("Page loaded");

    $("#add-train").on("click", function (event) {
        event.preventDefault();
        console.log("Submit was clicked");
        trainScheduler.addTrain(event);
    });

    database.ref().on("value", trainScheduler.writeRows);

    var updater = setInterval(trainScheduler.writeRows, 60000);

})