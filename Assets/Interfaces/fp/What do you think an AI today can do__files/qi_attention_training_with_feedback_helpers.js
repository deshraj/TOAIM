var img_attention_path = "./" + static_path + "/";

function get_word_color(weight) {
  /*
   * Assume that weight is in range [0,1]
   * :return String of the format "rgb(int, int, int)" (each int in range [0,255])
   */

  // Jet colormap -- [ [weight, [R, G, B]], ...]
  var jet = [[0,[0,0,131]],[0.125,[0,60,170]],[0.375,[5,255,255]],[0.625,[255,255,0]],[0.875,[250,0,0]],[1,[128,0,0]]];

  // Handle corner case
  if (weight == 1) {
      k = jet.length-1;
  }
  else {
    // Find appropriate color
    for (var k=0; k<jet.length-1; ++k) {
      // If weight in this range
      if(jet[k][0] <= weight && weight < jet[k+1][0] ) {
        // Yay! Found appropriate color
        break
      }
    }
  }
  // Store rgb
  var rgb = jet[k][1];
  // Stringify it
  var color = "rgb("+rgb[0]+", "+rgb[1]+", "+rgb[2]+")";
  return color;
}

function vis_question_attention(question, qatt_weights) {
    var question_div = $("#question");

    if( question[question.length-1] === "?" ) { // Truncate question mark
        question = question.substring(0, question.length-1);
    }
      // Split question into list of words
    var qwords = question.split(" ");
    // Push all weights into array "weights"
    var weights = [];
    for( var i = 0; i<qwords.length; i++ ) {
      weights.push(qatt_weights[qwords[i]]);
    }
    // Store max to normalize
    var max_weight = Math.max.apply(null, weights);

    // Store each word with color property in "html"
    var html = "";
    for( var i = 0; i<qwords.length; i++ ) {
        var color = get_word_color(weights[i]/max_weight);
        html += "<span style='color:" + color + "';>" + qwords[i] + "</span> ";
    }
    html += "?";
    question_div.html(html)
}
// ---------------------------------------------------------- 
// load json file into list
// ---------------------------------------------------------- 
function loadListOfScenes() {

    loadBaseData();
    for (var i = 0; i < q_id_list.length; ++i) {
        scene_choice_dict[q_id_list[i]] = { question: q_list[i], image: cur_scene_names[i], img_attention_url: img_attention_list[i], q_attention: q_attention_list[i], choice: undefined, gt: gt_list[i], phase: "test" };
    }

    // Set phase of first |train_set| elements to train
    for (var i = 0; i < train_set_size; ++i) {
        scene_choice_dict[q_id_list[i]]["phase"] = "train";
    }

    $("#sceneImg").attr('src', img_folder + cur_scene_names[0]+ '.jpg');
    $("#qiAttentionImg").attr('src', img_attention_path + img_attention_list[0]);
    if (xai === "Question Attention"|| xai === "QI Attention"){
        console.log(xai);
        vis_question_attention(q_list[0], q_attention_list[0]);
    }
    else {
        $('#question').html(q_list[0]);
    }
    // Define preload function
    $.preloadImages = function() {
        for (var i = 1; i < cur_scene_names.length; i++) {
            $("<img />").attr("src", img_folder + cur_scene_names[i]+ '.jpg');
            $("<img />").attr("src", img_attention_path + img_attention_list[i]);
        }
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
    $("#qiAttentionImg").attr('src', img_attention_path + img_attention_list[cur_scene]);
    if (xai === "Question Attention"|| xai === "QI Attention"){
        vis_question_attention(q_list[cur_scene], q_attention_list[cur_scene]);
    }
    else{
        $("#question").html(q_list[cur_scene]);
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
       highlight_selection();
    }
}

// ----------------------------------------------------------- 
// Grab the results and go to next task/submit
// ----------------------------------------------------------- 
function next(trigger_button) {
    // trigger_button: Argument that indicates calling (trigger) button
    // 0: "next" button. Need to verify if question was answered 
    
    // Check if this is a valid operation (answer already selected)
    if (trigger_button === 0) {
        if (!validate_scene()) {
            return -1;
        } else { // if valid choice is made, progress to next scene in below code 
            trigger_button = scene_choice_dict[q_id_list[cur_scene]].choice;
        }
    }

    // increment scene count
    cur_scene++;

    if ( cur_scene === train_set_size ) {   
        Mousetrap.unbind('ctrl+d');
        Mousetrap.unbind('ctrl+j');
        Mousetrap.unbind('ctrl+e');
        Mousetrap.unbind('ctrl+i');
        disable_feedback = true; // Set flag
        $("div#score").hide(); // Hide live score henceforth
        disable_previous_button();

        score = updateLiveScore("train");
        train_accuracy = score / train_set_size;

        $("span#finalScore").text(score);
        $("span#trainSetLengthFinal").text(train_set_size);

        $('#beginTestMsg').openModal({ 
            dismissible: false,
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
                Mousetrap.unbind(['ctrl+d', 'ctrl+d']);
                Mousetrap.unbind(['ctrl+j', 'ctrl+j']);
                Mousetrap.unbind(['ctrl+e', 'ctrl+e']);
                Mousetrap.unbind(['ctrl+i', 'ctrl+i']);
                console.log("All unbinded");
                cur_scene = phase_size;
                for (var i = phase_size; i < 2*phase_size; i++) {
                    scene_choice_dict[q_id_list[i]].choice = undefined;
                }
            },
            complete: function() {
                console.log("binding again");
                Mousetrap.bind(['ctrl+d', 'ctrl+d'], function() {
                    prev(0);
                });
                Mousetrap.bind(['ctrl+j', 'ctrl+j'], function() {
                    if ( scene_choice_dict[q_id_list[cur_scene]].choice ) {
                        next(1);
                    } else {
                        next(0);
                    }
                });
                Mousetrap.bind(['ctrl+e', 'ctrl+e'], function() {
                    proceed('correctly');
                });
                Mousetrap.bind(['ctrl+i', 'ctrl+i'], function() {
                    proceed('wrongly');
                });
                $("#phaseNumber").html("Phase 2: ");
                cur_scene = phase_size;
                $("#curScene").text(cur_scene + 1 - phase_size);
                $("#sceneImg").attr('src', img_folder + cur_scene_names[cur_scene]+ '.jpg');
                $("#qiAttentionImg").attr('src', img_attention_path + img_attention_list[cur_scene]);
                if (xai === "Question Attention"|| xai === "QI Attention"){
                    vis_question_attention(q_list[cur_scene], q_attention_list[cur_scene]);
                }
                else{
                    $("#question").html(q_list[cur_scene]);
                }
            } // Callback for Modal close
        });

    } else {
        enable_previous_button();
    }
    // are we _finally_ at the end of the task?
    if (cur_scene === num_scenes_per_hit) {
        // stop right there -- stay on last QI pair 
        cur_scene = num_scenes_per_hit - 1;
        highlight_selection();

        var final_score = updateLiveScore("test");
        test_accuracy = final_score / test_set_size;

        $("span#testScore").text(final_score);
        $("span#testSetLengthFinal").text(test_set_size);
        var performance_bonus = compute_bonus(final_score);
        $("span#performanceBonus").text(performance_bonus);

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
            } else if (choice) {
                highlight_selection();
            }
        } else { // Else show buttons
            hide_feedback();
        }

        // display an incremented scene count
        if ($("#phaseNumber").text() == "Phase 2: ") {
            $("#curScene").text(cur_scene + 1 - phase_size);
        }
        else{
            $("#curScene").text(cur_scene + 1);
        }
        // load next scene
        $("#sceneImg").attr('src', img_folder + cur_scene_names[cur_scene]+ '.jpg');
        $("#qiAttentionImg").attr('src', img_attention_path + img_attention_list[cur_scene]);
        if (xai === "Question Attention"|| xai === "QI Attention"){
            vis_question_attention(q_list[cur_scene], q_attention_list[cur_scene]);
        }
        else{
            $("#question").html(q_list[cur_scene]);
        }
        highlight_selection();
    }
  
}
