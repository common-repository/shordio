var shordy_timerId;
function updatePlaylist() {
    if(jQuery('#shordy_audio_length_site').val() < "00:15")
    {
        updatePlayListCount();
    }
    else
    {
        let i = jQuery('#shordy_play_timer_site').val();	
        shordy_timerId = setInterval(function() {
         jQuery("#shordy_play_timer_site").val(i);
            if(parseInt(i) == 15)
            {
                updatePlayListCount();
                jQuery("#shordy_play_timer_site").val(20);
            }
            i= parseInt(i)+1;
        }, 1000);
        
    }
} 
function updatePlayListCount()
{ 
   var ShodyUID = jQuery( "#shordy_codeid" ).val(); 
   var userID   = jQuery( "#user_val").val();
    var params = {        
        'base_url': 'https://plugin.shordio.com/',
        'plugin_url': 'https://plugin.shordio.com/',
        'audioplayer': null,
        'ShodyUID': ShodyUID
    };
    
   var xhttp = new XMLHttpRequest();
                xhttp.open("POST", params.base_url + 'shordy-embed/update-shordy-count-condition', true);
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send("shordy_id=" + ShodyUID  + "&user_id=" + userID + "&token=" + sessionStorage.token);
return false;
}
function myStopFunction_playcount() {
    clearTimeout(shordy_timerId);
}

function loginmodalshow()
    {
        jQuery(".login").show();
    }
    function loginmodalhide()
    {
        jQuery(".login").hide();
        jQuery(".emailcls").val("");
        jQuery(".passwordcls").val("");
        jQuery('#error').css("background","");
        jQuery("#message").hide();
    }