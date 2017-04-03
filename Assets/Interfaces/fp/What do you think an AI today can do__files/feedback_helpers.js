// Set this once training completes
var disable_feedback = false;
var train_set_size = -1;
var test_set_size = -1;

var train_accuracy = -1;
var test_accuracy = -1;

// ---------------------------------------------------------- 
// Recompute score, update div
// ---------------------------------------------------------- 
function updateLiveScore(phase) {
    var score = 0;
    for (var i = 0; i < q_id_list.length; ++i) {
        if ((scene_choice_dict[q_id_list[i]]["phase"] === phase) && 
            (scene_choice_dict[q_id_list[i]].choice === gt_list[i].toLowerCase())) {
            score += 1;
        }
    }
    $("#curAcc").text(score);
    $("#trainSetLength").text(train_set_size);
    return score;
}

function unbind_hotkeys() {
    Mousetrap.unbind('ctrl+e');
    Mousetrap.unbind('ctrl+i');
}
function rebind_hotkeys() {
    Mousetrap.bind(['ctrl+e', 'ctrl+e'], function() {
        proceed('correctly');
    });
    Mousetrap.bind(['ctrl+i', 'ctrl+i'], function() {
        proceed('wrongly');
    });
}
function show_feedback() {
    $("#correctButton, #wrongButton").hide();
    $("#correctButton, #wrongButton").prop("disabled", true);
    $("#display-answer").show();
    unbind_hotkeys();
}

function hide_feedback() {
    $("#correctButton, #wrongButton").show();
    $("#correctButton, #wrongButton").prop("disabled", false);
    $("#display-answer").hide();
    rebind_hotkeys();
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function display_feedback_text(trigger_button) {
    var feedback_prefix = "", color = "";
    if (trigger_button === gt_list[cur_scene].toLowerCase()) {
        feedback_prefix = "<i class='material-icons' id='correct'>done</i>That's right! ";
        color = "green";
    } else {
        feedback_prefix = "<i class='material-icons' id='incorrect'>error</i> That's not right! You predicted <b>" + capitalizeFirstLetter(trigger_button) + "</b>, but ";
        color = "red";
    }
    var feedback_text = feedback_prefix + "Vicki answered this question <b>" + gt_list[cur_scene] + "</b>.";
    $("#answer-label").html("<font color=" + color + ">" + feedback_text + "</font>");
}

function disable_previous_button() {
    Mousetrap.unbind('ctrl+d');
    $("#prevButton").attr("disabled", true)
    $('#prevButton').css("pointer-events", "none");
}

function enable_previous_button() {
    Mousetrap.bind(['ctrl+d', 'ctrl+d'], function() {
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
}

function compute_bonus(accuracy) {
    return 0.0;
}
