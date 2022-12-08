import { ReactiveVar } from 'meteor/reactive-var';
Template.export_import_print_display_button.inheritsHelpersFrom('non_transactional_list');
Template.export_import_print_display_button.onCreated(function(){

});

Template.export_import_print_display_button.events({
    'click .btnOpenSettings': async function (event, template) {
      let templateObject = Template.instance();
        var url = FlowRouter.current().path;
        //let tableName = await template.tablename.get()||'';
        let currenttablename = templateObject.data.tablename||"";

        let getTableName = currenttablename||'';
        if(currenttablename != ''){
        $(`#${getTableName} thead tr th`).each(function (index) {
          var $tblrow = $(this);
          var colWidth = $tblrow.width() || 0;
          var colthClass = $tblrow.attr('data-class') || "";
          $('.rngRange' + colthClass).val(colWidth);
        });
       $('.'+getTableName+'_Modal').modal('toggle');
      }
    },
    'click .btnImportModal': async function (event, template) {
       $('.importTemplateModal').modal('toggle');
    }
});

Template.export_import_print_display_button.helpers({

});
