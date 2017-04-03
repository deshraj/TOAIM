
// ---------------------------------------------------------- 
// load json file into list
// ---------------------------------------------------------- 
function loadListOfScenes() {
    loadBaseData();
    
    for (var i = 0; i < q_id_list.length; ++i) {
        scene_choice_dict[q_id_list[i]] = { question: q_list[i], image: cur_scene_names[i], choice: undefined, phase: "test" };
    }

    for (var i = 0; i < train_set_size; ++i) {
        scene_choice_dict[q_id_list[i]]["phase"] = "train";
    }
    
    num_scenes_per_hit = cur_scene_names.length;
    console.log(num_scenes_per_hit);
    // let's get the party started! 
    if (num_scenes_per_hit == 0){
        $("#sceneImg").attr('src', 'https://vqa_mscoco_images.s3.amazonaws.com/train2014/COCO_train2014_000000030775.jpg');
    }
    else{
        $("#sceneImg").attr('src', img_folder + cur_scene_names[0] + '.jpg');
    }
    $('#question').html(q_list[0]);

    // Define preload function
    $.preloadImages = function() {
            for (var i = 1; i < cur_scene_names.length; i++) {
                $("<img />").attr("src", img_folder + cur_scene_names[i] + '.jpg');
            }
            console.log('Finished preloading images');
        }
        // Call preload function
    $.preloadImages();
}

// ---------------------------------------------------------- 
// Go to previous task (if applicable)
// ---------------------------------------------------------- 
function prev() {

    var prev_cur_scene = cur_scene;
    if ( cur_scene === train_set_size ) {
        disable_previous_button();
        return;
    }
    if (cur_scene > 0) {
        cur_scene -= 1;
    }
    // decrement scene count displayed
    if ($("#phaseNumber").text() == "Phase 2: ") {
        $("#curScene").text(cur_scene + 1 - phase_size);
    }
    else{
        $("#curScene").text(cur_scene + 1);
    }    // load previous scene
    $("#sceneImg").attr('src', img_folder + cur_scene_names[cur_scene]+ '.jpg');
    $("#question").html(q_list[cur_scene]);
    var $select = $('select').selectize();
    var control = $select[0].selectize;
    if (scene_choice_dict[q_id_list[cur_scene]].choice != null){
        control.setValue(scene_choice_dict[q_id_list[cur_scene]].choice);
    } else{
         control.clear();
         $("#answer-selectized").focus();
    }
    var choice = scene_choice_dict[q_id_list[cur_scene]].choice;
    if ( (!disable_feedback) && (cur_scene !== 0) ) {
        console.log('1');
        feedback(choice);
    } else if (cur_scene == 0){
        if (prev_cur_scene != 0){
            feedback(choice);
        }
        else {
            return;
        }
    } else {
        console.log('3');
    }
}

// ----------------------------------------------------------- 
// Grab the results and go to next task/submit
// ----------------------------------------------------------- 
function next(trigger_button) {
    // trigger_button: Argument that indicates calling (trigger) button
    
    // Check if this is a valid operation (answer already selected)
    if (trigger_button == "") {
        if ( !validate_scene() ) {
            return -1;
        } else { // if valid choice is made, progress to next scene in below code 
            trigger_button = scene_choice_dict[q_id_list[cur_scene]].choice;
        }
    }

    if (trigger_button) {
        
        // increment scene count
        cur_scene++;

        // At train -> test transition, set flag, show modal and disable previous button
        if ( cur_scene === train_set_size ) {
            
            disable_feedback = true; // Set flag
            $("div#score").hide(); // Hide live score henceforth
            disable_previous_button();

            score = updateLiveScore("train");
            train_accuracy = score / train_set_size;
            $("span#finalScore").text(score);
            $("span#trainSetLengthFinal").text(train_set_size);
            $("#body").keypress(function(e) {
              if (e.which == 13) {
                return false;
              }
            });
            $('#beginTestMsg').openModal({ 
                dismissible: false,
                ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
                    unbind_hotkeys();
                    cur_scene = phase_size;
                },
                complete: function() {
                    rebind_hotkeys();
                    $("#phaseNumber").html("Phase 2: ");
                    for (var i = phase_size; i < 2*phase_size; i++) {
                        scene_choice_dict[q_id_list[i]].choice = undefined;
                    }
                    cur_scene = phase_size;

                    $("#curScene").text(cur_scene + 1 - phase_size);
                    // load next scene
                    $("#sceneImg").attr('src', img_folder + cur_scene_names[cur_scene]+ '.jpg');
                    $("#question").html(q_list[cur_scene]);
                    var $select = $('select').selectize();
                    var control = $select[0].selectize;
                    if (scene_choice_dict[q_id_list[cur_scene]].choice != null){
                        control.setValue(scene_choice_dict[q_id_list[cur_scene]].choice);
                    } else{
                         control.clear();
                         $("#answer-selectized").focus();
                    }
                } // Callback for Modal close
            });
            $("#phaseNumber").html("Phase 2: ");
        } else {
            enable_previous_button();
        }

        if (cur_scene === num_scenes_per_hit) {
            // stop right there -- stay on last QI pair 
            cur_scene = num_scenes_per_hit - 1;

            // Update live score
            score = updateLiveScore("test");
            test_accuracy = score / test_set_size;
            
            $("span#testScore").text(score);
            $("span#testSetLengthFinal").text(test_set_size);

            $('#modal1').openModal({ dismissible: false });
            // put cursor in comment box because -- why wouldn't you?  
            $("#hit_comment").each(function(idx) {
                if (idx == 0) {
                    $(this).focus();
                }
            });

        } else {

            if ( validate_scene(alert=false) ) { // If next scene is done, show feedback
                var choice = scene_choice_dict[q_id_list[cur_scene]].choice;
                if ( !disable_feedback ) {
                    feedback(choice);
                }
            } else { // Else show usual
                hide_feedback();
                enableDropDown();
            }

            if ($("#phaseNumber").text() == "Phase 2: ") {
                $("#curScene").text(cur_scene + 1 - phase_size);
            }
            else{
                $("#curScene").text(cur_scene + 1);
            }
            $("#sceneImg").attr('src', img_folder + cur_scene_names[cur_scene] + '.jpg');
            $("#question").html(q_list[cur_scene]);

            var $select = $('select').selectize();
            var control = $select[0].selectize;
            if (scene_choice_dict[q_id_list[cur_scene]].choice != null){
                control.setValue(scene_choice_dict[q_id_list[cur_scene]].choice);
            } else{
                 control.clear();
                 $("#answer-selectized").focus();
            }
        }
    } else {
        alert('next() called without trigger_button argument');
    }
}