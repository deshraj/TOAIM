// Set this once training completes
var disable_feedback = false;
var train_set_size = -1;
var test_set_size = -1;

// ---------------------------------------------------------- 
// Recompute score, update div
// ---------------------------------------------------------- 
function updateLiveScore(phase) {
    var score = 0;
    for (var i = 0; i < q_id_list.length; ++i) {
        if ((scene_choice_dict[q_id_list[i]]["phase"] === phase) && 
            (scene_choice_dict[q_id_list[i]].choice === vicki_answer_list[i].toLowerCase())) {
            score += 1;
        }
    }
    $("#curAcc").text(score);
    $("#trainSetLength").text(train_set_size);
    return score;
}

function unbind_hotkeys() {
    Mousetrap.unbind('shift+left');
    Mousetrap.unbind('shift+right');
}

function rebind_hotkeys() {
    Mousetrap.bind(['shift+left', 'shift+left'], function() {
        proceed('correctly');
    });
    Mousetrap.bind(['shift+right', 'shift+right'], function() {
        proceed('wrongly');
    });
}

function show_feedback(trigger_button) {

    $("#answerSelectBtn").hide();
    $("#continueBtn").show();
    $("#display-answer").show();
}

function hide_feedback() {
    $("#answerSelectBtn").show();
    $("#continueBtn").hide();
    $("#display-answer").hide();
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function display_feedback_text(trigger_button) {
    // Build feedback text
    var feedback_text = "";
    var color = "red";
    if (trigger_button === vicki_answer_list[cur_scene]) {
        feedback_text = "<i class='material-icons' id='correct'>done</i> That's right!";
        color = "green";
    } else {
        feedback_text = "<i class='material-icons' id='incorrect'>error</i> That's not right! Vicki's answer to this question was <b>" + vicki_answer_list[cur_scene].toLowerCase() + ".</b>";
    }
    $("#answer-label").html("<font color=" + color + ">" + feedback_text + "</font>");
}

// Disable dropdown
function disableDropDown() {
    $("select")[0].selectize.disable();
}

// Enable dropdown
function enableDropDown() {
    $("select")[0].selectize.enable();
}

function disable_previous_button() {
    Mousetrap.unbind('ctrl+j');
    $("#prevButton").attr("disabled", true)
    $('#prevButton').css("pointer-events", "none");
}

function enable_previous_button() {
    Mousetrap.bind(['ctrl+j', 'ctrl+j'], function() {
        prev(0);
    });
    $("#prevButton").attr("disabled", false)
    $("#prevButton").css("pointer-events", "");
}

function feedback(trigger_button) {
    /* Display instant feedback
     * trigger_button: Argument that indicates calling (trigger) button
     * correctly: "Correctly" button clicked
     * wrongly: "Wrongly" button clicked
     */
    
    show_feedback();
    display_feedback_text(trigger_button);
    updateLiveScore("train");
    disableDropDown();
}

function compute_bonus(accuracy) {
    return 0.0;
}
