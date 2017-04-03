// Scene related
var qs;
var num_scenes_per_hit = -1;
var cur_scene = -1;

// Data
var img_folder = "./" + static_path;
var cur_scene_names = []; // list of img links
var q_list = []; // list of question strings
var q_id_list = []; // list of question strings

// Annotation related
var cur_choice;
var scene_choice = [];
var scene_choice_dict = {};
var yes_btn_state = false;
var no_btn_state = false;

// HIT-related Info
var init_time;

var cur_scene_dict = JSON_LOADED;

// ---------------------------------------------------------- 
// Stopwatch, other Initializations
// ---------------------------------------------------------- 
function init() {
    init_time = $.now();
    // count of current scene 
    cur_scene = 0;
    loadListOfScenes();
    console.log("listOfScenes JSON loaded");
    $("#display-answer").hide();
}

// ---------------------------------------------------------- 
// load json file into list
// ---------------------------------------------------------- 
function loadBaseData() {

    cur_scene_names = cur_scene_dict["img_list"];
    top5_confidence_list = cur_scene_dict["top5_confidence_list"];
    ans_confidence_list = cur_scene_dict["ans_confidence_list"];
    gc_url_list = cur_scene_dict["gc_url_list"];
	img_attention_list = cur_scene_dict["img_attention_list"];
    q_attention_list = cur_scene_dict["q_attention_list"];
    
    q_list = cur_scene_dict["q_list"];
    q_id_list = cur_scene_dict["q_id_list"];

    vicki_answer_list = cur_scene_dict["vicki_answer_list"];

    num_scenes_per_hit = cur_scene_names.length;

    // num_scenes_per_hit = 10; // DEBUG

    train_set_size = Math.floor(num_scenes_per_hit/2);
    test_set_size = num_scenes_per_hit - train_set_size;

    $("#trainSetLength").text(train_set_size);

    console.log(num_scenes_per_hit);
}

function highlight_selection() {
    if (scene_choice_dict[q_id_list[cur_scene]].choice === undefined) {
        if (yes_btn_state === true) {
            $("#correctButton").toggleClass("hovered");
            yes_btn_state = false;
        }
        if (no_btn_state === true) {
            $("#wrongButton").toggleClass("hovered");
            no_btn_state = false;
        }
    } else {
        if (scene_choice_dict[q_id_list[cur_scene]].choice === 'correctly') {
            if (yes_btn_state === false) {
                $("#correctButton").toggleClass("hovered");
                yes_btn_state = true;
            }
            if (no_btn_state === true) {
                $("#wrongButton").toggleClass("hovered");
                no_btn_state = false;
            }
        } else {
            if (yes_btn_state === true) {
                $("#correctButton").toggleClass("hovered");
                yes_btn_state = false;
            }
            if (no_btn_state === false) {
                $("#wrongButton").toggleClass("hovered");
                no_btn_state = true;
            }
        }
    }
}

// ------------------------------------------------------------ 
// Return True if choice is valid. Store choice. 
// Return False if choice is invalid. Display dialog. 
// ------------------------------------------------------------ 
function validate_scene(alert=true) {
    // initialize 
    var is_scene_valid = true;
    var choice = scene_choice_dict[q_id_list[cur_scene]].choice;
    // get radio button choice 
    if ( choice ) {
        // valid choice
    }
    // invalid choice 
    else {
        if (alert) {
            // 1500 is the duration of the toast
            Materialize.toast('Please select an option!', 1500);
        }   
        is_scene_valid = false;
        return is_scene_valid;
    }
    return is_scene_valid;
}

function proceed(trigger_button) {
    // Store choice
    scene_choice_dict[q_id_list[cur_scene]].choice = trigger_button;

    if (disable_feedback) {
        next(trigger_button);
    } else {
        feedback(trigger_button);
    }
}

function submit_form() {
        var duration = ($.now() - init_time) / 1000;
        duration = duration.toString();
        var comment = $('#hit_comment').val();

        var answers = [];
        answers.push({
            scene_choice_dict: scene_choice_dict
        });
        var ans = JSON.stringify(answers);

        $("input[name='hitDuration']").val(duration);
        $("input[name='hitResult']").val(ans);
        $("input[name='hitComment']").val(comment);

        console.log(scene_choice_dict);
        hitID = gup('hitId');
        assignmentID = gup('assignmentId');
        workerID = gup('workerId');
        $.ajax({
            type: "POST",
            url: form_url,
            data: {
                'result': JSON.stringify(scene_choice_dict),
                'comment': comment,
                'csrfmiddlewaretoken': $('[name="csrfmiddlewaretoken"]').val(),
                'hitId': gup('hitId'),
                'assignmentId': gup('assignmentId'),
                'workerId': gup('workerId'),
                'task': gup('task'),
                'xai': xai,
                'train_accuracy': train_accuracy,
                'test_accuracy': test_accuracy
            }
        }).done(function(data) {
            console.log(data);
            $("#mturk_form").submit();
        });
    }