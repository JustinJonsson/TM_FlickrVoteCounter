// ==UserScript==
// @name         VoteCounter
// @namespace    http://fidessa.com/
// @version      0.4
// @description  Automatically tally votes in Fidessa photo contest threads
// @author       Justin Jonsson
// @match        http*://www.flickr.com/groups/ccgalleria/discuss*
// ==/UserScript==

// ==Changelog==
// 0.1 - initial version
// 0.2 - only run on threads with "vote" (case-insensitive) in the title.
// 0.3 - refactor & clean-up
// 0.4 - support Classic Groups experience, not just the New Groups Experience Beta.

window.onload = (function() {
    'use strict';

    // check that this is a voting thread.
    function isVoteThread() {
        if (isBeta) {
            var topicSubjectSel = document.getElementsByClassName("topic-subject");
            var topicText = topicSubjectSel[0].innerText;
        } else {
            var topicSubjectSel = document.getElementsByClassName("group-topic-detail-col");
            var topicText = topicSubjectSel[0].firstElementChild.innerText;
        }
        var match = topicText.match(/vote/i);
        if (match) {match = match.length;}
        return match > 0 ? true : false;
    }

    function checkIfBeta(){
        var repliesSel = document.getElementsByClassName("reply");
        return (repliesSel.length > 0 ? true : false);
    }

    // check that the passed in char is a letter.
    function isLetter(str) {
        return str.match(/[a-z]/i);
    }

    // take a string and create an array containing the first three letters.
    function firstThreeChars(str){
        var firstThree = [];
        var i = 0;
        while (firstThree.length < 3 && i < str.length ){
            if ( isLetter(str.charAt(i)) ) {
                firstThree.push(str.charAt(i).toUpperCase());
            }
            i++;
        }
        return firstThree;
    }

    // tally scores based on votes.
    // First vote = 3 poitns, 2nd 2 points, 3rd 1 point.
    function incrementTally(letter, multiplier){
        if (typeof tally[letter] === "undefined") {
            tally[letter] = multiplier;
        } else {
            tally[letter] += multiplier;
        }
        return;
    }

    // Call the appropriate vote accumulator.
    function getVotes(){
        if (isBeta) {
            getBetaVotes();
        } else {
            getClassicVotes();
        }
    }

    // get people's votes and throw them into an array.
    function getBetaVotes(){
        var repliesSel = document.getElementsByClassName("reply");
        var messageSel;
        var messageTextSel;
        var messageText;
        for (var i = 0; i < repliesSel.length; i++){
            messageSel = repliesSel[i].getElementsByClassName("message");
            messageTextSel = messageSel[0].getElementsByClassName("message-text");
            messageText = messageTextSel[0].innerText;
            votes[i] = firstThreeChars(messageText);
        }
    }

    // get people's votes and throw them into an array.
    function getClassicVotes(){
        var topicReplySel = document.getElementsByClassName("TopicReply");
        var saidSel = topicReplySel[0].getElementsByClassName("Said");
        var messageSel;
        var messageTextSel;
        var messageText;
        for (var i = 0; i < saidSel.length; i++){
            messageSel = saidSel[i].getElementsByTagName("p");
            messageText = messageSel[0].innerText;
            votes[i] = firstThreeChars(messageText);
        }
    }

    //do the maths
    function tallyVotes(){
        var multiplier;
        for (var i = 0; i < votes.length; i++) {
            for (var j = 0; j < 3; j++) {
                multiplier = (3-j);
                incrementTally(votes[i][j], multiplier);
            }
        }
    }

    // sort and print the scores
    function printResults(){

        // first sort the
        var sortable = [];
        for (var letter in tally) {
            sortable.push([letter, tally[letter]]);
        }

        sortable.sort(function(a, b) {
            return b[1] - a[1];
        });

        tally.sort(function(a, b) {
            return b[1] - a[1];
        });

        // print scores
        var printable = "";
        for (var i = 0; i < sortable.length; i++) {
            printable += (i<=2?"<b>":"") + (sortable[i][0] + ": " + sortable[i][1] + (i<=2?"</b>":"") + "<br />");
        }

        if (isBeta) {
            var lastReplySel = document.getElementsByClassName("last-reply");
            lastReplySel[0].insertAdjacentHTML("afterend", "<div class=\"reply\">"+ printable +"</div> ");
        } else {
            var topicReplySel = document.getElementsByClassName("TopicReply");
            var saidSel = topicReplySel[0].getElementsByClassName("Said");
            var trSel = topicReplySel[0].getElementsByTagName("tr");
            trSel[saidSel.length-1].insertAdjacentHTML("afterend","<tr valign='top'><td class='Who'></td><td class='Said'><h4>Vote Counter says:</h4>"+ printable +"</td>");
        }
    }

    var votes = [];
    var tally = [];
    var isBeta = true;

    isBeta = checkIfBeta();
    console.log("BETA: ", isBeta);

    if( isVoteThread() ){
        getVotes();
        tallyVotes();
        printResults();
    }

})();
