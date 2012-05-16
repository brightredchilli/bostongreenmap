function update_second_dropdown(search_type, filter_type, filter,value_key,django_neighborhood){
  /*
    Pass in:
      The type of the second box for search_type
      The type of the first box for filter_type;
      The value to filter on for filter
      The value_key is whether to use 'id' or 'slug'
  */
  //Set the first item in the dropdown box
   var out = '<option value="">Select Your ';
   switch(search_type) {
    case 'neighborhood':
      out += 'Neighborhood/Town';
      break;
    case 'parktype':
      out += "Park Type";
      break;
    case 'activity':
      out += "Activity";
      break;
   }
   out += "</option>";
   $.ajax({
     url:'/api/v1/'+search_type+'/?format=json&limit=1000&'+filter_type+'='+filter,
     dataType:'json',
     success:function(json){
       $.each(json['objects'], function(key, obj) {
          //check whether the value returned is supposed to be an id or a slug.
          //Create the new item in the dropdown list.
          if ( obj['slug'] == django_neighborhood){
            out+= '<option selected="selected" value="'+escape(obj[value_key])+'">' + obj['name']+'</option>';
            //coming in from neighborhood page
          } else {
            out+= '<option value="'+escape(obj[value_key])+'">' + obj['name']+'</option>';
          }
        });
        //replace the items in the dropdown list, and select the first element
        $("#neighborhood_"+search_type).html(out);
        $("#neighborhood_"+search_type).val($("#neighborhood_"+search_type+" option:first").val());
        if (typeof(django_neighborhood) != "undefined"){
          //Select the neighborhood passed in via the page parameter and auto search
          var neigh = $('#neighborhood_neighborhood option[value="'+django_neighborhood+'"]');
          neigh.attr('selected','selected');
          play_get_parks(0);
        }
     }
   });
}

function explore_filter_activities(neighborhood_slug,parktype_id){
  var out = "";
   $.ajax({
     //probe the correct park url
     url:'/api/v1/exploreactivity/?format=json&limit=1000&neighborhood='+neighborhood_slug+'&parktype='+parktype_id,
     //url:url,
     dataType:'json',
     success:function(json){
       $.each(json['objects'], function(key, obj) {
         //check whether the value returned is supposed to be an id or a slug.
         //Create the new item in the dropdown list.
         out+= '<input type="checkbox" class="activity_checkbox" name="activity_checkboxes" value="'+obj['id']+'">'+obj['name']+'<br>';
       });
       //replace the items in the dropdown list, and select the first element
       $("#activity_checkboxes").html(out);
     }
   });
}


function explore_filter_parkactivities(){
  var neighborhood = $("#neighborhood_neighborhood").val();
  var parktype = $("#neighborhood_parktype").val();
  var activities = new Array();
  $('#activity_checkboxes input:checked').each(function() {
    activities.push($(this).val());
  });
  $("#parklist").html("");
  $("#facilitylist").html("");
  if (activities.length == 0){
    return;
  }

  activities = activities.join(",");
  $.ajax({
     //probe the correct park url
     url:'/api/v1/explorepark/?format=json&limit=1000&neighborhood='+neighborhood+'&parktype='+parktype+'&activity_ids='+activities,
     //url:url,
     dataType:'json',
     success:function(json){
       var out = "";
        $.each(json['objects'], function(key, obj) {
           //DO SOMETHING BETTER HERE USING THE DATA.
        out+= obj['name'] + " - " + obj['os_id']+'<br>';
       });
       $("#parklist").html(out);
     }
   });

    $.ajax({
     url:'/api/v1/explorefacility/?format=json&limit=1000&neighborhood='+neighborhood+'&parktype='+parktype+'&activity_ids='+activities,
     dataType:'json',
     success:function(json){
      var out = "";
       $.each(json['objects'], function(key, obj) {
          //DO SOMETHING BETTER HERE USING THE DATA.
          out += obj['name'] + " - " + obj['id']+'<br>';
       });
       $("#facilitylist").html(out);
     }
   });

}

function play_get_parks(offset){
  var neighborhood = $("#neighborhood_neighborhood").val();
  var activity = $("#neighborhood_activity").val();
  if (activity === ""){ return;}
  if (neighborhood=== ""){ return;}
  var activities = new Array();
  $("#parklist").html("");
  var url = '/api/v1/playpark/?format=json&limit=10&neighborhood='+neighborhood+'&activity='+activity+'&offset='+offset;
  update_parklist(url);
}

function update_parklist(url){
  $.ajax({
     url:url,
     dataType:'json',
     success:function(json){
        var out = "";
        $.each(json['objects'], function(key, park) {
	      var p = "<h3><a href='/park/"+park['slug']+"'>"+park['name'] + "</a></h3>";
              if (park['description']) {p += "<p>"+ park['description']+"</p>";};
              //Load on Map - MF
              out += p;
        });
        var previous = false;
        if(json['meta']['previous']){
       	    out += '<a href="javascript:void(0)" onclick="update_parklist(\''+json['meta']['previous']+'\')">PREVIOUS</a>';
            previous = true;
	}
        if(json['meta']['next']){
            if(previous){ out += "&nbsp;&nbsp;";}
       	    out += '<a href="javascript:void(0)" onclick="update_parklist(\''+json['meta']['next']+'\')">NEXT</a>';
	}
        $("#parklist").html(out);
     }
   });
}

