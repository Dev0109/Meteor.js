
Template.crm_mailchimp_add_campaign_modal.onRendered(function () {
  const templateObject = Template.instance();
})

Template.crm_mailchimp_add_campaign_modal.events({
  "click #btn_add_campaign": function (e) {

    let subject_line = $('#campaign_subject_line').val();
    let preview_text = $('#campaign_preview_text').val();
    let title = $('#campaign_title').val();
    let from_name = $('#campaign_from_name').val();
    let reply_to = $('#campaign_reply_to').val();
    let to_name = $('#campaign_to_name').val();

    if (!subject_line || !title || !from_name || !reply_to) {
      swal("Please enter the required fields!", "", "warning");
      return
    }

    let settings = {
      "subject_line": subject_line,
      "preview_text": preview_text,
      "title": title,
      "from_name": from_name,
      "reply_to": reply_to,
      // "use_conversation": true,
      "to_name": to_name,
    };

    try {
      let erpGet = erpDb();
      $(".fullScreenSpin").css("display", "inline-block");
      Meteor.call('createCampaign', erpGet, settings, function (error, result) {
        if (error !== undefined) {
          swal("Something went wrong!", "", "error");
        } else {
          swal("New campaign is added successfully", "", "success");
        }
        $(".fullScreenSpin").css("display", "none");
        $('#crmMailchimpAddCampaignModal').modal('toggle');
      });
    } catch (error) {
      swal("Something went wrong!", "", "error");
      $(".fullScreenSpin").css("display", "none");
    }
  },

})
