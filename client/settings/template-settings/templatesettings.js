import { OrganisationService } from "../../js/organisation-service";
import { CountryService } from "../../js/country-service";
import { ReactiveVar } from "meteor/reactive-var";
import { SideBarService } from "../../js/sidebar-service";
import "../../lib/global/indexdbstorage.js";
let sideBarService = new SideBarService();
let organisationService = new OrganisationService();

var template_list = [ 
  "Bills",
  "Credits",
  "Customer Payments",
  "Customer Statements",
  "Invoices",
  "Invoice Back Orders",
  "Purchase Orders",
  "Quotes",
  "Refunds",
  "Sales Orders",
  "Supplier Payments",
  "Statements",
  "Delivery Docket",
  "Journal Entry",
  "Deposits",
  "Cheques",
];
var noHasTotals = ["Customer Payment", "Customer Statement", "Supplier Payment", "Statement", "Delivery Docket", "Journal Entry", "Deposit"];
var modal_data = [];

Template.templatesettings.onCreated(() => {
 
      let templateObject = Template.instance();
      templateObject.invoice_data = new ReactiveVar([]);
});

Template.templatesettings.onRendered(function () {
      let templateObject = Template.instance();
      $(document).on("click", ".templateItem .btnPreviewTemplate", function(e) {      
        title = $(this).parent().attr("data-id");
        number =  $(this).parent().attr("data-template-id");//e.getAttribute("data-template-id");
        templateObject.generateInvoiceData(title,number);        
      });

      templateObject.getTemplateInfoNew = function(){
        $('.fullScreenSpin').css('display', 'inline-block');
        getVS1Data('TTemplateSettings').then(function(dataObject) {
          if (dataObject.length == 0) {
              sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                  addVS1Data('TTemplateSettings', JSON.stringify(data));
                  
                  for (let i = 0; i < data.ttemplatesettings.length; i++) {
                   
                    if(data.ttemplatesettings[i].fields.SettingName == 'bill')
                    {
                        
                         if(data.ttemplatesettings[i].fields.Template == 1)
                         {       
                                 $('input[name="Bills_1"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                    $('#Bills_1').attr('checked','checked');
                                 }
                                
                         }
                         if(data.ttemplatesettings[i].fields.Template == 2)
                         {
                               $('input[name="Bills_2"]').val(data.ttemplatesettings[i].fields.Description);
                               if(data.ttemplatesettings[i].fields.Active == true)
                               {
                                 $('#Bills_2').attr('checked','checked');
                               }
                         }

                         if(data.ttemplatesettings[i].fields.Template == 3)
                         {
                               $('input[name="Bills_3"]').val(data.ttemplatesettings[i].fields.Description);
                               if(data.ttemplatesettings[i].fields.Active == true)
                               {
                                 $('#Bills_3').attr('checked','checked');
                               }
                         }


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Credits')
                    {

                           if(data.ttemplatesettings[i].fields.Template == 1)
                           {       
                                   $('input[name="Credits_1"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Credits_1').attr('checked','checked');
                                   }
                                 
                           }
                           if(data.ttemplatesettings[i].fields.Template == 2)
                           {
                                 $('input[name="Credits_2"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Credits_2').attr('checked','checked');
                                 }
                           }

                           if(data.ttemplatesettings[i].fields.Template == 3)
                           {
                                 $('input[name="Credits_3"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Credits_3').attr('checked','checked');
                                 }
                           }

                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Customer Payments')
                    {
                          
                           if(data.ttemplatesettings[i].fields.Template == 1)
                           {       
                                   $('input[name="Customer Payments_1"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                    // $('#Customer_Payments_1').attr('checked','checked');
                                   }
                                 
                           }
                           if(data.ttemplatesettings[i].fields.Template == 2)
                           {
                                 $('input[name="Customer Payments_2"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                 //  $('#Customer_Payments_2').attr('checked','checked');
                                 }
                           }

                           if(data.ttemplatesettings[i].fields.Template == 3)
                           {     

                                 $('input[name="Customer Payments_3"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Customer_Payments_3').attr('checked','checked');
                                 }
                           }
                       

                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Customer Statements')
                    {
                           if(data.ttemplatesettings[i].fields.Template == 1)
                           {       
                                   $('input[name="Customer Statements_1"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Customer_Statements_1').attr('checked','checked');
                                   }
                                 
                           }
                           if(data.ttemplatesettings[i].fields.Template == 2)
                           {
                                 $('input[name="Customer Statements_2"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Customer_Statements_2').attr('checked','checked');
                                 }
                           }

                           if(data.ttemplatesettings[i].fields.Template == 3)
                           {
                                 $('input[name="Customer Statements_3"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Customer_Statements_3').attr('checked','checked');
                                 }
                           }


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Invoices')
                    {
                           if(data.ttemplatesettings[i].fields.Template == 1)
                           {       
                                   $('input[name="Invoices_1"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Invoices_1').attr('checked','checked');
                                   }
                                 
                           }
                           if(data.ttemplatesettings[i].fields.Template == 2)
                           {
                                 $('input[name="Invoices_2"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Invoices_2').attr('checked','checked');
                                 }
                           }

                           if(data.ttemplatesettings[i].fields.Template == 3)
                           {
                                 $('input[name="Invoices_3"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Invoices_3').attr('checked','checked');
                                 }
                           }


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Invoice Back Orders')
                    {
                         if(data.ttemplatesettings[i].fields.Template == 1)
                         {       
                                 $('input[name="Invoice Back Orders_1"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Invoice_Back_Orders_1').attr('checked','checked');
                                 }
                               
                         }
                         if(data.ttemplatesettings[i].fields.Template == 2)
                         {
                               $('input[name="Invoice Back Orders_2"]').val(data.ttemplatesettings[i].fields.Description);
                               if(data.ttemplatesettings[i].fields.Active == true)
                               {
                                 $('#Invoice_Back_Orders_2').attr('checked','checked');
                               }
                         }

                         if(data.ttemplatesettings[i].fields.Template == 3)
                         {
                               $('input[name="Invoice Back Orders_3"]').val(data.ttemplatesettings[i].fields.Description);
                               if(data.ttemplatesettings[i].fields.Active == true)
                               {
                                 $('#Invoice_Back_Orders_3').attr('checked','checked');
                               }
                         }


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Purchase Orders')
                    {
                           if(data.ttemplatesettings[i].fields.Template == 1)
                           {       
                                   $('input[name="Purchase Orders_1"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Purchase_Orders_1').attr('checked','checked');
                                   }
                                 
                           }
                           if(data.ttemplatesettings[i].fields.Template == 2)
                           {
                                 $('input[name="Purchase Orders_2"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Purchase_Orders_2').attr('checked','checked');
                                 }
                           }

                           if(data.ttemplatesettings[i].fields.Template == 3)
                           {
                                 $('input[name="Purchase Orders_3"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Purchase_Orders_3').attr('checked','checked');
                                 }
                           }


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Quotes')
                    {
                           if(data.ttemplatesettings[i].fields.Template == 1)
                           {       
                                   $('input[name="Quotes_1"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Quotes_1').attr('checked','checked');
                                   }
                                 
                           }
                           if(data.ttemplatesettings[i].fields.Template == 2)
                           {
                                 $('input[name="Quotes_2"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Quotes_2').attr('checked','checked');
                                 }
                           }

                           if(data.ttemplatesettings[i].fields.Template == 3)
                           {
                                 $('input[name="Quotes_3"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Quotes_3').attr('checked','checked');
                                 }
                           }


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Refunds')
                    {
                           if(data.ttemplatesettings[i].fields.Template == 1)
                           {       
                                   $('input[name="Refunds_1"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Refunds_1').attr('checked','checked');
                                   }
                                 
                           }
                           if(data.ttemplatesettings[i].fields.Template == 2)
                           {
                                 $('input[name="Refunds_2"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Refunds_2').attr('checked','checked');
                                 }
                           }

                           if(data.ttemplatesettings[i].fields.Template == 3)
                           {
                                 $('input[name="Refunds_3"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Refunds_3').attr('checked','checked');
                                 }
                           }


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Sales Orders')
                    {
                             if(data.ttemplatesettings[i].fields.Template == 1)
                             {       
                                     $('input[name="Sales Orders_1"]').val(data.ttemplatesettings[i].fields.Description);
                                     if(data.ttemplatesettings[i].fields.Active == true)
                                     {
                                       $('#Sales_Orders_1').attr('checked','checked');
                                     }
                                   
                             }
                             if(data.ttemplatesettings[i].fields.Template == 2)
                             {
                                   $('input[name="Sales Orders_2"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Sales_Orders_2').attr('checked','checked');
                                   }
                             }

                             if(data.ttemplatesettings[i].fields.Template == 3)
                             {
                                   $('input[name="Sales Orders_3"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Sales_Orders_3').attr('checked','checked');
                                   }
                             } 


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Supplier Payments')
                    {
                             if(data.ttemplatesettings[i].fields.Template == 1)
                             {       
                                     $('input[name="Supplier Payments_1"]').val(data.ttemplatesettings[i].fields.Description);
                                     if(data.ttemplatesettings[i].fields.Active == true)
                                     {
                                       $('#Supplier_Payments_1').attr('checked','checked');
                                     }
                                   
                             }
                             if(data.ttemplatesettings[i].fields.Template == 2)
                             {
                                   $('input[name="Supplier Payments_2"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Supplier_Payments_2').attr('checked','checked');
                                   }
                             }

                             if(data.ttemplatesettings[i].fields.Template == 3)
                             {
                                   $('input[name="Supplier Payments_3"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Supplier_Payments_3').attr('checked','checked');
                                   }
                             } 


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Statements')
                    {
                             if(data.ttemplatesettings[i].fields.Template == 1)
                             {       
                                     $('input[name="Statements_1"]').val(data.ttemplatesettings[i].fields.Description);
                                     if(data.ttemplatesettings[i].fields.Active == true)
                                     {
                                       $('#Statements_1').attr('checked','checked');
                                     }
                                   
                             }
                             if(data.ttemplatesettings[i].fields.Template == 2)
                             {
                                   $('input[name="Statements_2"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Statements_2').attr('checked','checked');
                                   }
                             }

                             if(data.ttemplatesettings[i].fields.Template == 3)
                             {
                                   $('input[name="Statements_3"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Statements_3').attr('checked','checked');
                                   }
                             } 


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Delivery Docket')
                    {
                               if(data.ttemplatesettings[i].fields.Template == 1)
                               {       
                                       $('input[name="Delivery Docket_1"]').val(data.ttemplatesettings[i].fields.Description);
                                       if(data.ttemplatesettings[i].fields.Active == true)
                                       {
                                         $('#Delivery_Docket_1').attr('checked','checked');
                                       }
                                     
                               }
                               if(data.ttemplatesettings[i].fields.Template == 2)
                               {
                                     $('input[name="Delivery Docket_2"]').val(data.ttemplatesettings[i].fields.Description);
                                     if(data.ttemplatesettings[i].fields.Active == true)
                                     {
                                       $('#Delivery_Docket_2').attr('checked','checked');
                                     }
                               }

                               if(data.ttemplatesettings[i].fields.Template == 3)
                               {
                                     $('input[name="Delivery Docket_3"]').val(data.ttemplatesettings[i].fields.Description);
                                     if(data.ttemplatesettings[i].fields.Active == true)
                                     {
                                       $('#Delivery_Docket_3').attr('checked','checked');
                                     }
                               } 

                    }
               
               

                 }
                  
                      
                  $('.fullScreenSpin').css('display', 'none');
              }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
              });
          }else{ 
                  let data = JSON.parse(dataObject[0].data);    
                
                  for (let i = 0; i < data.ttemplatesettings.length; i++) {
                   
                    if(data.ttemplatesettings[i].fields.SettingName == 'bill')
                    {
                        
                         if(data.ttemplatesettings[i].fields.Template == 1)
                         {       
                                 $('input[name="Bills_1"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                    $('#Bills_1').attr('checked','checked');
                                 }
                                
                         }
                         if(data.ttemplatesettings[i].fields.Template == 2)
                         {
                               $('input[name="Bills_2"]').val(data.ttemplatesettings[i].fields.Description);
                               if(data.ttemplatesettings[i].fields.Active == true)
                               {
                                 $('#Bills_2').attr('checked','checked');
                               }
                         }

                         if(data.ttemplatesettings[i].fields.Template == 3)
                         {
                               $('input[name="Bills_3"]').val(data.ttemplatesettings[i].fields.Description);
                               if(data.ttemplatesettings[i].fields.Active == true)
                               {
                                 $('#Bills_3').attr('checked','checked');
                               }
                         }


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Credits')
                    {

                           if(data.ttemplatesettings[i].fields.Template == 1)
                           {       
                                   $('input[name="Credits_1"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Credits_1').attr('checked','checked');
                                   }
                                 
                           }
                           if(data.ttemplatesettings[i].fields.Template == 2)
                           {
                                 $('input[name="Credits_2"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Credits_2').attr('checked','checked');
                                 }
                           }

                           if(data.ttemplatesettings[i].fields.Template == 3)
                           {
                                 $('input[name="Credits_3"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Credits_3').attr('checked','checked');
                                 }
                           }

                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Customer Payments')
                    {
                          
                           if(data.ttemplatesettings[i].fields.Template == 1)
                           {       
                                   $('input[name="Customer Payments_1"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                    // $('#Customer_Payments_1').attr('checked','checked');
                                   }
                                 
                           }
                           if(data.ttemplatesettings[i].fields.Template == 2)
                           {
                                 $('input[name="Customer Payments_2"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                 //  $('#Customer_Payments_2').attr('checked','checked');
                                 }
                           }

                           if(data.ttemplatesettings[i].fields.Template == 3)
                           {     

                                 $('input[name="Customer Payments_3"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Customer_Payments_3').attr('checked','checked');
                                 }
                           }
                       

                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Customer Statements')
                    {
                           if(data.ttemplatesettings[i].fields.Template == 1)
                           {       
                                   $('input[name="Customer Statements_1"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Customer_Statements_1').attr('checked','checked');
                                   }
                                 
                           }
                           if(data.ttemplatesettings[i].fields.Template == 2)
                           {
                                 $('input[name="Customer Statements_2"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Customer_Statements_2').attr('checked','checked');
                                 }
                           }

                           if(data.ttemplatesettings[i].fields.Template == 3)
                           {
                                 $('input[name="Customer Statements_3"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Customer_Statements_3').attr('checked','checked');
                                 }
                           }


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Invoices')
                    {
                           if(data.ttemplatesettings[i].fields.Template == 1)
                           {       
                                   $('input[name="Invoices_1"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Invoices_1').attr('checked','checked');
                                   }
                                 
                           }
                           if(data.ttemplatesettings[i].fields.Template == 2)
                           {
                                 $('input[name="Invoices_2"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Invoices_2').attr('checked','checked');
                                 }
                           }

                           if(data.ttemplatesettings[i].fields.Template == 3)
                           {
                                 $('input[name="Invoices_3"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Invoices_3').attr('checked','checked');
                                 }
                           }


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Invoice Back Orders')
                    {
                         if(data.ttemplatesettings[i].fields.Template == 1)
                         {       
                                 $('input[name="Invoice Back Orders_1"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Invoice_Back_Orders_1').attr('checked','checked');
                                 }
                               
                         }
                         if(data.ttemplatesettings[i].fields.Template == 2)
                         {
                               $('input[name="Invoice Back Orders_2"]').val(data.ttemplatesettings[i].fields.Description);
                               if(data.ttemplatesettings[i].fields.Active == true)
                               {
                                 $('#Invoice_Back_Orders_2').attr('checked','checked');
                               }
                         }

                         if(data.ttemplatesettings[i].fields.Template == 3)
                         {
                               $('input[name="Invoice Back Orders_3"]').val(data.ttemplatesettings[i].fields.Description);
                               if(data.ttemplatesettings[i].fields.Active == true)
                               {
                                 $('#Invoice_Back_Orders_3').attr('checked','checked');
                               }
                         }


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Purchase Orders')
                    {
                           if(data.ttemplatesettings[i].fields.Template == 1)
                           {       
                                   $('input[name="Purchase Orders_1"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Purchase_Orders_1').attr('checked','checked');
                                   }
                                 
                           }
                           if(data.ttemplatesettings[i].fields.Template == 2)
                           {
                                 $('input[name="Purchase Orders_2"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Purchase_Orders_2').attr('checked','checked');
                                 }
                           }

                           if(data.ttemplatesettings[i].fields.Template == 3)
                           {
                                 $('input[name="Purchase Orders_3"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Purchase_Orders_3').attr('checked','checked');
                                 }
                           }


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Quotes')
                    {
                           if(data.ttemplatesettings[i].fields.Template == 1)
                           {       
                                   $('input[name="Quotes_1"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Quotes_1').attr('checked','checked');
                                   }
                                 
                           }
                           if(data.ttemplatesettings[i].fields.Template == 2)
                           {
                                 $('input[name="Quotes_2"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Quotes_2').attr('checked','checked');
                                 }
                           }

                           if(data.ttemplatesettings[i].fields.Template == 3)
                           {
                                 $('input[name="Quotes_3"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Quotes_3').attr('checked','checked');
                                 }
                           }


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Refunds')
                    {
                           if(data.ttemplatesettings[i].fields.Template == 1)
                           {       
                                   $('input[name="Refunds_1"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Refunds_1').attr('checked','checked');
                                   }
                                 
                           }
                           if(data.ttemplatesettings[i].fields.Template == 2)
                           {
                                 $('input[name="Refunds_2"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Refunds_2').attr('checked','checked');
                                 }
                           }

                           if(data.ttemplatesettings[i].fields.Template == 3)
                           {
                                 $('input[name="Refunds_3"]').val(data.ttemplatesettings[i].fields.Description);
                                 if(data.ttemplatesettings[i].fields.Active == true)
                                 {
                                   $('#Refunds_3').attr('checked','checked');
                                 }
                           }


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Sales Orders')
                    {
                             if(data.ttemplatesettings[i].fields.Template == 1)
                             {       
                                     $('input[name="Sales Orders_1"]').val(data.ttemplatesettings[i].fields.Description);
                                     if(data.ttemplatesettings[i].fields.Active == true)
                                     {
                                       $('#Sales_Orders_1').attr('checked','checked');
                                     }
                                   
                             }
                             if(data.ttemplatesettings[i].fields.Template == 2)
                             {
                                   $('input[name="Sales Orders_2"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Sales_Orders_2').attr('checked','checked');
                                   }
                             }

                             if(data.ttemplatesettings[i].fields.Template == 3)
                             {
                                   $('input[name="Sales Orders_3"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Sales_Orders_3').attr('checked','checked');
                                   }
                             } 


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Supplier Payments')
                    {
                             if(data.ttemplatesettings[i].fields.Template == 1)
                             {       
                                     $('input[name="Supplier Payments_1"]').val(data.ttemplatesettings[i].fields.Description);
                                     if(data.ttemplatesettings[i].fields.Active == true)
                                     {
                                       $('#Supplier_Payments_1').attr('checked','checked');
                                     }
                                   
                             }
                             if(data.ttemplatesettings[i].fields.Template == 2)
                             {
                                   $('input[name="Supplier Payments_2"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Supplier_Payments_2').attr('checked','checked');
                                   }
                             }

                             if(data.ttemplatesettings[i].fields.Template == 3)
                             {
                                   $('input[name="Supplier Payments_3"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Supplier_Payments_3').attr('checked','checked');
                                   }
                             } 


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Statements')
                    {
                             if(data.ttemplatesettings[i].fields.Template == 1)
                             {       
                                     $('input[name="Statements_1"]').val(data.ttemplatesettings[i].fields.Description);
                                     if(data.ttemplatesettings[i].fields.Active == true)
                                     {
                                       $('#Statements_1').attr('checked','checked');
                                     }
                                   
                             }
                             if(data.ttemplatesettings[i].fields.Template == 2)
                             {
                                   $('input[name="Statements_2"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Statements_2').attr('checked','checked');
                                   }
                             }

                             if(data.ttemplatesettings[i].fields.Template == 3)
                             {
                                   $('input[name="Statements_3"]').val(data.ttemplatesettings[i].fields.Description);
                                   if(data.ttemplatesettings[i].fields.Active == true)
                                   {
                                     $('#Statements_3').attr('checked','checked');
                                   }
                             } 


                    }

                    if(data.ttemplatesettings[i].fields.SettingName == 'Delivery Docket')
                    {
                               if(data.ttemplatesettings[i].fields.Template == 1)
                               {       
                                       $('input[name="Delivery Docket_1"]').val(data.ttemplatesettings[i].fields.Description);
                                       if(data.ttemplatesettings[i].fields.Active == true)
                                       {
                                         $('#Delivery_Docket_1').attr('checked','checked');
                                       }
                                     
                               }
                               if(data.ttemplatesettings[i].fields.Template == 2)
                               {
                                     $('input[name="Delivery Docket_2"]').val(data.ttemplatesettings[i].fields.Description);
                                     if(data.ttemplatesettings[i].fields.Active == true)
                                     {
                                       $('#Delivery_Docket_2').attr('checked','checked');
                                     }
                               }

                               if(data.ttemplatesettings[i].fields.Template == 3)
                               {
                                     $('input[name="Delivery Docket_3"]').val(data.ttemplatesettings[i].fields.Description);
                                     if(data.ttemplatesettings[i].fields.Active == true)
                                     {
                                       $('#Delivery_Docket_3').attr('checked','checked');
                                     }
                               } 

                    }
               
               

                 }
                  $('.fullScreenSpin').css('display', 'none');
          }
        }).catch(function(err) {
        sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                  addVS1Data('TTemplateSettings', JSON.stringify(data)); 
                
                  for (let i = 0; i < data.ttemplatesettings.length; i++) {
                   
                     if(data.ttemplatesettings[i].fields.SettingName == 'bill')
                     {
                         
                          if(data.ttemplatesettings[i].fields.Template == 1)
                          {       
                                  $('input[name="Bills_1"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                     $('#Bills_1').attr('checked','checked');
                                  }
                                 
                          }
                          if(data.ttemplatesettings[i].fields.Template == 2)
                          {
                                $('input[name="Bills_2"]').val(data.ttemplatesettings[i].fields.Description);
                                if(data.ttemplatesettings[i].fields.Active == true)
                                {
                                  $('#Bills_2').attr('checked','checked');
                                }
                          }

                          if(data.ttemplatesettings[i].fields.Template == 3)
                          {
                                $('input[name="Bills_3"]').val(data.ttemplatesettings[i].fields.Description);
                                if(data.ttemplatesettings[i].fields.Active == true)
                                {
                                  $('#Bills_3').attr('checked','checked');
                                }
                          }


                     }

                     if(data.ttemplatesettings[i].fields.SettingName == 'Credits')
                     {

                            if(data.ttemplatesettings[i].fields.Template == 1)
                            {       
                                    $('input[name="Credits_1"]').val(data.ttemplatesettings[i].fields.Description);
                                    if(data.ttemplatesettings[i].fields.Active == true)
                                    {
                                      $('#Credits_1').attr('checked','checked');
                                    }
                                  
                            }
                            if(data.ttemplatesettings[i].fields.Template == 2)
                            {
                                  $('input[name="Credits_2"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Credits_2').attr('checked','checked');
                                  }
                            }

                            if(data.ttemplatesettings[i].fields.Template == 3)
                            {
                                  $('input[name="Credits_3"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Credits_3').attr('checked','checked');
                                  }
                            }

                     }

                     if(data.ttemplatesettings[i].fields.SettingName == 'Customer Payments')
                     {
                           
                            if(data.ttemplatesettings[i].fields.Template == 1)
                            {       
                                    $('input[name="Customer Payments_1"]').val(data.ttemplatesettings[i].fields.Description);
                                    if(data.ttemplatesettings[i].fields.Active == true)
                                    {
                                     // $('#Customer_Payments_1').attr('checked','checked');
                                    }
                                  
                            }
                            if(data.ttemplatesettings[i].fields.Template == 2)
                            {
                                  $('input[name="Customer Payments_2"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                  //  $('#Customer_Payments_2').attr('checked','checked');
                                  }
                            }

                            if(data.ttemplatesettings[i].fields.Template == 3)
                            {     

                                  $('input[name="Customer Payments_3"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Customer_Payments_3').attr('checked','checked');
                                  }
                            }
                        

                     }

                     if(data.ttemplatesettings[i].fields.SettingName == 'Customer Statements')
                     {
                            if(data.ttemplatesettings[i].fields.Template == 1)
                            {       
                                    $('input[name="Customer Statements_1"]').val(data.ttemplatesettings[i].fields.Description);
                                    if(data.ttemplatesettings[i].fields.Active == true)
                                    {
                                      $('#Customer_Statements_1').attr('checked','checked');
                                    }
                                  
                            }
                            if(data.ttemplatesettings[i].fields.Template == 2)
                            {
                                  $('input[name="Customer Statements_2"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Customer_Statements_2').attr('checked','checked');
                                  }
                            }

                            if(data.ttemplatesettings[i].fields.Template == 3)
                            {
                                  $('input[name="Customer Statements_3"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Customer_Statements_3').attr('checked','checked');
                                  }
                            }


                     }

                     if(data.ttemplatesettings[i].fields.SettingName == 'Invoices')
                     {
                            if(data.ttemplatesettings[i].fields.Template == 1)
                            {       
                                    $('input[name="Invoices_1"]').val(data.ttemplatesettings[i].fields.Description);
                                    if(data.ttemplatesettings[i].fields.Active == true)
                                    {
                                      $('#Invoices_1').attr('checked','checked');
                                    }
                                  
                            }
                            if(data.ttemplatesettings[i].fields.Template == 2)
                            {
                                  $('input[name="Invoices_2"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Invoices_2').attr('checked','checked');
                                  }
                            }

                            if(data.ttemplatesettings[i].fields.Template == 3)
                            {
                                  $('input[name="Invoices_3"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Invoices_3').attr('checked','checked');
                                  }
                            }


                     }

                     if(data.ttemplatesettings[i].fields.SettingName == 'Invoice Back Orders')
                     {
                          if(data.ttemplatesettings[i].fields.Template == 1)
                          {       
                                  $('input[name="Invoice Back Orders_1"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Invoice_Back_Orders_1').attr('checked','checked');
                                  }
                                
                          }
                          if(data.ttemplatesettings[i].fields.Template == 2)
                          {
                                $('input[name="Invoice Back Orders_2"]').val(data.ttemplatesettings[i].fields.Description);
                                if(data.ttemplatesettings[i].fields.Active == true)
                                {
                                  $('#Invoice_Back_Orders_2').attr('checked','checked');
                                }
                          }

                          if(data.ttemplatesettings[i].fields.Template == 3)
                          {
                                $('input[name="Invoice Back Orders_3"]').val(data.ttemplatesettings[i].fields.Description);
                                if(data.ttemplatesettings[i].fields.Active == true)
                                {
                                  $('#Invoice_Back_Orders_3').attr('checked','checked');
                                }
                          }


                     }

                     if(data.ttemplatesettings[i].fields.SettingName == 'Purchase Orders')
                     {
                            if(data.ttemplatesettings[i].fields.Template == 1)
                            {       
                                    $('input[name="Purchase Orders_1"]').val(data.ttemplatesettings[i].fields.Description);
                                    if(data.ttemplatesettings[i].fields.Active == true)
                                    {
                                      $('#Purchase_Orders_1').attr('checked','checked');
                                    }
                                  
                            }
                            if(data.ttemplatesettings[i].fields.Template == 2)
                            {
                                  $('input[name="Purchase Orders_2"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Purchase_Orders_2').attr('checked','checked');
                                  }
                            }

                            if(data.ttemplatesettings[i].fields.Template == 3)
                            {
                                  $('input[name="Purchase Orders_3"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Purchase_Orders_3').attr('checked','checked');
                                  }
                            }


                     }

                     if(data.ttemplatesettings[i].fields.SettingName == 'Quotes')
                     {
                            if(data.ttemplatesettings[i].fields.Template == 1)
                            {       
                                    $('input[name="Quotes_1"]').val(data.ttemplatesettings[i].fields.Description);
                                    if(data.ttemplatesettings[i].fields.Active == true)
                                    {
                                      $('#Quotes_1').attr('checked','checked');
                                    }
                                  
                            }
                            if(data.ttemplatesettings[i].fields.Template == 2)
                            {
                                  $('input[name="Quotes_2"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Quotes_2').attr('checked','checked');
                                  }
                            }

                            if(data.ttemplatesettings[i].fields.Template == 3)
                            {
                                  $('input[name="Quotes_3"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Quotes_3').attr('checked','checked');
                                  }
                            }


                     }

                     if(data.ttemplatesettings[i].fields.SettingName == 'Refunds')
                     {
                            if(data.ttemplatesettings[i].fields.Template == 1)
                            {       
                                    $('input[name="Refunds_1"]').val(data.ttemplatesettings[i].fields.Description);
                                    if(data.ttemplatesettings[i].fields.Active == true)
                                    {
                                      $('#Refunds_1').attr('checked','checked');
                                    }
                                  
                            }
                            if(data.ttemplatesettings[i].fields.Template == 2)
                            {
                                  $('input[name="Refunds_2"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Refunds_2').attr('checked','checked');
                                  }
                            }

                            if(data.ttemplatesettings[i].fields.Template == 3)
                            {
                                  $('input[name="Refunds_3"]').val(data.ttemplatesettings[i].fields.Description);
                                  if(data.ttemplatesettings[i].fields.Active == true)
                                  {
                                    $('#Refunds_3').attr('checked','checked');
                                  }
                            }


                     }

                     if(data.ttemplatesettings[i].fields.SettingName == 'Sales Orders')
                     {
                              if(data.ttemplatesettings[i].fields.Template == 1)
                              {       
                                      $('input[name="Sales Orders_1"]').val(data.ttemplatesettings[i].fields.Description);
                                      if(data.ttemplatesettings[i].fields.Active == true)
                                      {
                                        $('#Sales_Orders_1').attr('checked','checked');
                                      }
                                    
                              }
                              if(data.ttemplatesettings[i].fields.Template == 2)
                              {
                                    $('input[name="Sales Orders_2"]').val(data.ttemplatesettings[i].fields.Description);
                                    if(data.ttemplatesettings[i].fields.Active == true)
                                    {
                                      $('#Sales_Orders_2').attr('checked','checked');
                                    }
                              }

                              if(data.ttemplatesettings[i].fields.Template == 3)
                              {
                                    $('input[name="Sales Orders_3"]').val(data.ttemplatesettings[i].fields.Description);
                                    if(data.ttemplatesettings[i].fields.Active == true)
                                    {
                                      $('#Sales_Orders_3').attr('checked','checked');
                                    }
                              } 


                     }

                     if(data.ttemplatesettings[i].fields.SettingName == 'Supplier Payments')
                     {
                              if(data.ttemplatesettings[i].fields.Template == 1)
                              {       
                                      $('input[name="Supplier Payments_1"]').val(data.ttemplatesettings[i].fields.Description);
                                      if(data.ttemplatesettings[i].fields.Active == true)
                                      {
                                        $('#Supplier_Payments_1').attr('checked','checked');
                                      }
                                    
                              }
                              if(data.ttemplatesettings[i].fields.Template == 2)
                              {
                                    $('input[name="Supplier Payments_2"]').val(data.ttemplatesettings[i].fields.Description);
                                    if(data.ttemplatesettings[i].fields.Active == true)
                                    {
                                      $('#Supplier_Payments_2').attr('checked','checked');
                                    }
                              }

                              if(data.ttemplatesettings[i].fields.Template == 3)
                              {
                                    $('input[name="Supplier Payments_3"]').val(data.ttemplatesettings[i].fields.Description);
                                    if(data.ttemplatesettings[i].fields.Active == true)
                                    {
                                      $('#Supplier_Payments_3').attr('checked','checked');
                                    }
                              } 


                     }

                     if(data.ttemplatesettings[i].fields.SettingName == 'Statements')
                     {
                              if(data.ttemplatesettings[i].fields.Template == 1)
                              {       
                                      $('input[name="Statements_1"]').val(data.ttemplatesettings[i].fields.Description);
                                      if(data.ttemplatesettings[i].fields.Active == true)
                                      {
                                        $('#Statements_1').attr('checked','checked');
                                      }
                                    
                              }
                              if(data.ttemplatesettings[i].fields.Template == 2)
                              {
                                    $('input[name="Statements_2"]').val(data.ttemplatesettings[i].fields.Description);
                                    if(data.ttemplatesettings[i].fields.Active == true)
                                    {
                                      $('#Statements_2').attr('checked','checked');
                                    }
                              }

                              if(data.ttemplatesettings[i].fields.Template == 3)
                              {
                                    $('input[name="Statements_3"]').val(data.ttemplatesettings[i].fields.Description);
                                    if(data.ttemplatesettings[i].fields.Active == true)
                                    {
                                      $('#Statements_3').attr('checked','checked');
                                    }
                              } 


                     }

                     if(data.ttemplatesettings[i].fields.SettingName == 'Delivery Docket')
                     {
                                if(data.ttemplatesettings[i].fields.Template == 1)
                                {       
                                        $('input[name="Delivery Docket_1"]').val(data.ttemplatesettings[i].fields.Description);
                                        if(data.ttemplatesettings[i].fields.Active == true)
                                        {
                                          $('#Delivery_Docket_1').attr('checked','checked');
                                        }
                                      
                                }
                                if(data.ttemplatesettings[i].fields.Template == 2)
                                {
                                      $('input[name="Delivery Docket_2"]').val(data.ttemplatesettings[i].fields.Description);
                                      if(data.ttemplatesettings[i].fields.Active == true)
                                      {
                                        $('#Delivery_Docket_2').attr('checked','checked');
                                      }
                                }

                                if(data.ttemplatesettings[i].fields.Template == 3)
                                {
                                      $('input[name="Delivery Docket_3"]').val(data.ttemplatesettings[i].fields.Description);
                                      if(data.ttemplatesettings[i].fields.Active == true)
                                      {
                                        $('#Delivery_Docket_3').attr('checked','checked');
                                      }
                                } 

                     }
                
                

                  }
                  $('.fullScreenSpin').css('display', 'none');
        }).catch(function (err) {
          $('.fullScreenSpin').css('display', 'none');
        });
      });

      };

      templateObject.getTemplateInfoNew();
      $("#templatePreviewModal").on("shown.bs.modal", function () {
                  const data = templateObject.invoice_data.get();
      });

      //save template fields in the localstorage   
      function saveTemplateFields(key, value){
            localStorage.setItem(key, value)
      }

      function updateTemplate0(object_invoce) {
        if (object_invoce.length > 0) {
          $('#templatePreviewModal #printcomment').text(object_invoce[0]["comment"]);
          $("#templatePreviewModal .o_url").text(object_invoce[0]["o_url"]);
          $("#templatePreviewModal .o_name").text(object_invoce[0]["o_name"]);
          $("#templatePreviewModal .o_address1").text(
            object_invoce[0]["o_address"]
          );
          $("#templatePreviewModal .o_city").text(object_invoce[0]["o_city"]);
          $("#templatePreviewModal .o_state").text(object_invoce[0]["o_state"]);
          $("#templatePreviewModal .o_reg").text(object_invoce[0]["o_reg"]);
          $("#templatePreviewModal .o_abn").text(object_invoce[0]["o_abn"]);
          $("#templatePreviewModal .o_phone").text(object_invoce[0]["o_phone"]);
    
          if(object_invoce[0]["applied"] == ""){
            $("#templatePreviewModal .applied").hide()
            $("#templatePreviewModal .applied").text(object_invoce[0]["applied"]);
          }else{
            $("#templatePreviewModal .applied").show()
            $("#templatePreviewModal .applied").text("Applied : " +  object_invoce[0]["applied"]);
          }

          if(object_invoce[0]["supplier_type"] == ""){
            $("#templatePreviewModal .customer").hide()
          }else{
            $("#templatePreviewModal .customer").show()
          }
          $("#templatePreviewModal .customer").empty();
          $("#templatePreviewModal .customer").append(object_invoce[0]["supplier_type"]);
    
          if(object_invoce[0]["supplier_name"] == ""){
            $("#templatePreviewModal .pdfCustomerName").hide()
          }else{
            $("#templatePreviewModal .pdfCustomerName").show()
          }
          $("#templatePreviewModal .pdfCustomerName").empty();
          $("#templatePreviewModal .pdfCustomerName").append(object_invoce[0]["supplier_name"]);
    
          if(object_invoce[0]["supplier_addr"] == ""){
            $("#templatePreviewModal .pdfCustomerAddress").hide()
          }else{
            $("#templatePreviewModal .pdfCustomerAddress").show()
          }
          $("#templatePreviewModal .pdfCustomerAddress").empty();
          $("#templatePreviewModal .pdfCustomerAddress").append(object_invoce[0]["supplier_addr"]);
    
          
          $("#templatePreviewModal .print-header").text(object_invoce[0]["title"]);
          $("#templatePreviewModal .modal-title").text(
            object_invoce[0]["title"] + " "+ " template"
          );


          if(object_invoce[0]["value"]=="")
          {
              $('.print-header-value').text('');

          }
          else{
            $('.print-header-value').text(object_invoce[0]["value"]);
          }
    
          if(object_invoce[0]["bsb"]=="")
          { 
              $('#templatePreviewModal .field_payment').hide();

          }
          else{

              $('#templatePreviewModal .field_payment').show();
          }
     
    
          $("#templatePreviewModal .bsb").text( "BSB (Branch Number) : " + object_invoce[0]["bsb"]);
          $("#templatePreviewModal .account_number").text( "Account Number : " + object_invoce[0]["account"]);
          $("#templatePreviewModal .swift").text("Swift Code : " + object_invoce[0]["swift"]);


          if(object_invoce[0]["date"] == ""){
            $("#templatePreviewModal .dateNumber").hide();
          }else{
            $("#templatePreviewModal .dateNumber").show();
          }
    
          $("#templatePreviewModal .date").text(object_invoce[0]["date"]);
    
          if(object_invoce[0]["pqnumber"] == ""){
            $("#templatePreviewModal .pdfPONumber").hide();
          }else{
            $("#templatePreviewModal .pdfPONumber").show();
          }
    
          $("#templatePreviewModal .po").text(object_invoce[0]["pqnumber"]);
    
          if(object_invoce[0]["invoicenumber"] == ""){
            $("#templatePreviewModal .invoiceNumber").hide();
          }else{
            $("#templatePreviewModal .invoiceNumber").show();
          }
        
          $("#templatePreviewModal .io").text(object_invoce[0]["invoicenumber"]);

          if(object_invoce[0]["refnumber"] == ""){
            $("#templatePreviewModal .refNumber").hide();
          }else{
            $("#templatePreviewModal .refNumber").show();
          }
          $("#templatePreviewModal .ro").text(object_invoce[0]["refnumber"]);

          if(object_invoce[0]["duedate"] == ""){
            $("#templatePreviewModal .pdfTerms").hide();
          }else{
            $("#templatePreviewModal .pdfTerms").show();
          }
          $("#templatePreviewModal .due").text(object_invoce[0]["duedate"]);

          if (object_invoce[0]["paylink"] == "") {
                $("#templatePreviewModal .link").hide();
                $("#templatePreviewModal .linkText").hide();
          } else {
                $("#templatePreviewModal .link").show();
                $("#templatePreviewModal .linkText").show();
          }

          if (object_invoce[0]["showFX"] == "") {
                $("#templatePreviewModal .showFx").hide();
                $("#templatePreviewModal .showFxValue").hide();
        } else {
                $("#templatePreviewModal .showFx").show();
                $("#templatePreviewModal .showFxValue").show();
                $("#templatePreviewModal .showFxValue").text(object_invoce[0]["showFX"]);
        }


              if(object_invoce[0]["customfield1"] == "NA")
              {   
                      $('#customfieldtablenew').css('display', 'none');
                      $('#customdatatablenew').css('display', 'none');
                      $('#templatePreviewModal .customfield1').text('');
                      $('#templatePreviewModal .customfield2').text('');
                      $('#templatePreviewModal .customfield3').text('');
                      
                      
                      $('#templatePreviewModal .customfield1data').text('');
                      $('#templatePreviewModal .customfield2data').text('');
                      $('#templatePreviewModal .customfield3data').text('');
        
              }
              else
              {
                    $('#customfieldtablenew').css('display', 'block');
                    $('#customdatatablenew').css('display', 'block');
                    
                    $('#templatePreviewModal .customfield1').text(object_invoce[0]["customfieldlabel1"]);
                    $('#templatePreviewModal .customfield2').text(object_invoce[0]["customfieldlabel2"]);
                    $('#templatePreviewModal .customfield3').text(object_invoce[0]["customfieldlabel3"]);
                    
                    if(object_invoce[0]["customfield1"] == '' || object_invoce[0]["customfield1"] == 0)
                    {
                      $('#templatePreviewModal .customfield1data').text('');
                    }
                    else
                    {
                      $('#templatePreviewModal .customfield1data').text(object_invoce[0]["customfield1"]);
                    }

                    if(object_invoce[0]["customfield2"] == '' || object_invoce[0]["customfield2"] == 0)
                    {
                      $('#templatePreviewModal .customfield2data').text('');
                    }
                    else
                    {
                      $('#templatePreviewModal .customfield2data').text( object_invoce[0]["customfield2"]);
                    }

                    if(object_invoce[0]["customfield3"] == '' || object_invoce[0]["customfield3"] == 0)
                    {
                      $('#templatePreviewModal .customfield3data').text('');
                    }
                    else
                    {
                      $('#templatePreviewModal .customfield3data').text( object_invoce[0]["customfield3"]);
                    }



              }

              if(object_invoce[0]["customfield1"] == "NA")
              {
                    $('#customfieldlable').css('display', 'none');
                    $('#customfieldlabledata').css('display', 'none');
              }
              else
              {
                    $('#customfieldlable').css('display', 'block');
                    $('#customfieldlabledata').css('display', 'block');
              }

            //   table header
              var tbl_header = $("#templatePreviewModal .tbl_header")
              tbl_header.empty()
              for(const [key , value] of Object.entries(object_invoce[0]["fields"])){

                    tbl_header.append("<th style='width:" + value + "%'; color: rgb(0 0 0);'>" + key + "</th>")
              }
         }
      }

      function loadTemplateBody1(object_invoce) {
        // table content
        var tbl_content = $("#templatePreviewModal .tbl_content");
        tbl_content.empty();
        var left_idx = 0;
        switch (object_invoce[0]["title"]) {
          case "Bill":
            left_idx = 1;
            break;
    
          case "Credit":
            left_idx = 1;
            break;
    
          case "Customer Payment":
            left_idx = 2;
            break;
    
          case "Customer Statement":
            left_idx = 3;
            break;  
    
          case "Invoice":
            left_idx = 1;
            break;
    
          case "Invoice Back Order":
            left_idx = 1;
            break;
    
          case "Purchase Order":
            left_idx = 1;
            break;
    
          case "Quote":
            left_idx = 1;
            break;
    
          case "Refund":
            left_idx = 1;
            break;
    
          case "Sales Order":
            left_idx = 1;
            break;
    
          case "Supplier Payment":
            left_idx = 2;
            break;
          
          case "Statement": 
            left_idx = 2;
            break;
          
          case "Delivery Docket":
            left_idx = 1;
            break;
    
          case "Journal Entry":
            left_idx = 1;
            break;
    
          case "Deposits":
            left_idx = 3;
            break;
    
          case "Cheques":
            left_idx = 1;
            break;
        }

        const data = object_invoce[0]["data"];
        let idx = 0;
        for(item of data){
            idx = 0;
            tbl_content.append("<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>");
            var content = "";
            for(item_temp of item){
                if (idx > left_idx)
                  content = content + "<td style='text-align: right;'>" + item_temp + "</td>";
                else
                  content = content + "<td>" + item_temp + "</td>";
                idx++;
            }
            tbl_content.append(content);
            tbl_content.append("</tr>");
        }

        // total amount
        if (noHasTotals.includes(object_invoce[0]["title"])) {
          $("#templatePreviewModal .field_amount").hide();
          $("#templatePreviewModal .field_payment").css("borderRight", "0px solid black");
        } else {
            $("#templatePreviewModal .field_amount").show();
            $("#templatePreviewModal .field_payment").css("borderRight", "1px solid black");
        }

        $('#templatePreviewModal #subtotal_total').text("Sub total");
        $("#templatePreviewModal #subtotal_totalPrint").text(object_invoce[0]["subtotal"]);
        $('#templatePreviewModal #grandTotal').text("Grand total");
        $("#templatePreviewModal #totalTax_totalPrint").text(object_invoce[0]["gst"]);
        $("#templatePreviewModal #grandTotalPrint").text(object_invoce[0]["total"]);
        $("#templatePreviewModal #totalBalanceDuePrint").text(object_invoce[0]["bal_due"]);
        $("#templatePreviewModal #paid_amount").text(object_invoce[0]["paid_amount"]);
      }

      function loadTemplateBody2(object_invoce) {
        // table content
        var tbl_content = $("#templatePreviewModal .tbl_content");
        tbl_content.empty();

        var left_idx = 0;
        switch (object_invoce[0]["title"]) {
          case "Bill":
            left_idx = 1;
            break;
    
          case "Credit":
            left_idx = 1;
            break;
    
          case "Customer Payment":
            left_idx = 2;
            break;
    
          case "Customer Statement":
            left_idx = 3;
            break;  
    
          case "Invoice":
            left_idx = 1;
            break;
    
          case "Invoice Back Order":
            left_idx = 1;
            break;
    
          case "Purchase Order":
            left_idx = 1;
            break;
    
          case "Quote":
            left_idx = 1;
            break;
    
          case "Refund":
            left_idx = 1;
            break;
    
          case "Sales Order":
            left_idx = 1;
            break;
    
          case "Supplier Payment":
            left_idx = 2;
            break;
          
          case "Statement": 
            left_idx = 2;
            break;
          
          case "Delivery Docket":
            left_idx = 1;
            break;
    
          case "Journal Entry":
            left_idx = 1;
            break;
    
          case "Deposits":
            left_idx = 3;
            break;
    
          case "Cheques":
            left_idx = 1;
            break;
        }

        const data = object_invoce[0]["data"];
        let idx = 0;
        for(item of data){
            idx = 0;
            tbl_content.append("<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>");
            var content = "";
            for(item_temp of item){
                if (idx > left_idx)
                  content = content + "<td style='text-align: right;'>" + item_temp + "</td>";
                else
                  content = content + "<td>" + item_temp + "</td>";
                idx++;
            }
            tbl_content.append(content);
            tbl_content.append("</tr>");
        }

        if (noHasTotals.includes(object_invoce[0]["title"])) {
          $(".subtotal2").hide();
        } else {
          $(".subtotal2").show();
        }

        $("#templatePreviewModal #subtotal_totalPrint2").text(
          object_invoce[0]["subtotal"]
        );
        $("#templatePreviewModal #grandTotalPrint2").text(
          object_invoce[0]["total"]
        );
        $("#templatePreviewModal #totalBalanceDuePrint2").text(
          object_invoce[0]["bal_due"]
        );
        $("#templatePreviewModal #paid_amount2").text(
          object_invoce[0]["paid_amount"]
        );
      }

      function loadTemplateBody3(object_invoce) {
        // table content
        var tbl_content = $("#templatePreviewModal .tbl_content");
        tbl_content.empty();
        
        var left_idx = 0;
        switch (object_invoce[0]["title"]) {
          case "Bill":
            left_idx = 1;
            break;
    
          case "Credit":
            left_idx = 1;
            break;
    
          case "Customer Payment":
            left_idx = 2;
            break;
    
          case "Customer Statement":
            left_idx = 3;
            break;  
    
          case "Invoice":
            left_idx = 1;
            break;
    
          case "Invoice Back Order":
            left_idx = 1;
            break;
    
          case "Purchase Order":
            left_idx = 1;
            break;
    
          case "Quote":
            left_idx = 1;
            break;
    
          case "Refund":
            left_idx = 1;
            break;
    
          case "Sales Order":
            left_idx = 1;
            break;
    
          case "Supplier Payment":
            left_idx = 2;
            break;
          
          case "Statement": 
            left_idx = 2;
            break;
          
          case "Delivery Docket":
            left_idx = 1;
            break;
    
          case "Journal Entry":
            left_idx = 1;
            break;
    
          case "Deposits":
            left_idx = 3;
            break;
    
          case "Cheques":
            left_idx = 1;
            break;
        }

        const data = object_invoce[0]["data"];
        let idx = 0;
        for(item of data){
            idx = 0;
            tbl_content.append("<tr style='border-bottom: 1px solid rgba(0, 0, 0, .1);'>");
            var content = "";
            for(item_temp of item){
                if (idx > left_idx)
                  content = content + "<td style='text-align: right;'>" + item_temp + "</td>";
                else
                  content = content + "<td>" + item_temp + "</td>";
                idx++;
            }
            tbl_content.append(content);
            tbl_content.append("</tr>");
        }

        // total amount
        if (noHasTotals.includes(object_invoce[0]["title"])) {
          $(".subtotal3").hide();
        } else {
          $(".subtotal3").show();
        }
      
        $("#templatePreviewModal #subtotal_totalPrint3").text(
          object_invoce[0]["subtotal"]
        );
        $("#templatePreviewModal #totalTax_totalPrint3").text(
          object_invoce[0]["gst"]
        );
        $("#templatePreviewModal #totalBalanceDuePrint3").text(
          object_invoce[0]["bal_due"]
        );
      }

      //update template with invoice type   
      function updateTemplate1(object_invoce) {
        initTemplateHeaderFooter1();
        $("#html-2-pdfwrapper").show();
        $("#html-2-pdfwrapper2").hide();
        $("#html-2-pdfwrapper3").hide();
        $("#templatePreviewModal").modal("toggle");
        loadTemplateHeaderFooter1(object_invoce);
        loadTemplateBody1(object_invoce);
      }

      function updateTemplate2(object_invoce) {
        initTemplateHeaderFooter2();
        $("#html-2-pdfwrapper").hide();
        $("#html-2-pdfwrapper2").show();
        $("#html-2-pdfwrapper3").hide();
        $("#templatePreviewModal").modal("toggle");
        loadTemplateHeaderFooter2(object_invoce);
        loadTemplateBody2(object_invoce);
      }

      function updateTemplate3(object_invoce) {
        initTemplateHeaderFooter3();
        $("#html-2-pdfwrapper").hide();
        $("#html-2-pdfwrapper2").hide();
        $("#html-2-pdfwrapper3").show();
        $("#templatePreviewModal").modal("toggle");
        loadTemplateHeaderFooter3(object_invoce);
        loadTemplateBody3(object_invoce);
      }

      // show bill data with dummy data
      function showBillData(template_title,number) {
      object_invoce = [];
      var array_data = [];
      array_data.push([
        "Accumlated Depreciation",
        "Accumlated Depreciation",
        "$0.00",
        "$900.00",
      ]);

      let item = '';
  

      if(number == 1)
      {
            item = {
              o_url: "vs1cloud.com",
              o_name: "Sample Company",
              o_address: "123 street",
              o_city: "Los Angeles",
              o_state: "Califonia 12345",
              o_reg: "",
              o_abn: "56789051234",
              o_phone: "Phone : 25151944",
              title: 'Bill',
              value:'751',
              date: "30/03/2022",
              invoicenumber:'751',
              refnumber: "",
              pqnumber: "",
              duedate:"",
              paylink: "",
              supplier_type: "Supplier",
              supplier_name : "Amar kumar",
              supplier_addr : "Antri\nGwalior\nMadhya Pradesh",
              fields: {
                "Account Name" : ["30", "left"],
                "Description" : ["40", "left"],
                "Tax" : ["15", "right"],
                "Amount" : ["15", "right"]
              },
              subtotal : "$900.00",
              gst : "$0.00",
              total : "$900.00",
              paid_amount : "$900.00",
              bal_due : "$0.00",
              bsb : "",
              account : "",
              swift : "",
              applied : "",
              data: array_data,
              customfield1:'NA',
              customfield2:'NA',
              customfield3:'NA',
              customfieldlabel1:'NA',
              customfieldlabel2:'NA',
              customfieldlabel3:'NA',
              showFX:"",
              comment:"Bill Template Preivew",
            };

      }
      else if(number == 2)
      {
            item = {
              o_url: "vs1cloud.com",
              o_name: "Sample Company",
              o_address: "123 street",
              o_city: "Los Angeles",
              o_state: "Califonia 12345",
              o_reg: "",
              o_abn: "56789051234",
              o_phone: "Phone : 25151944",
              title: 'Bill',
              value:'751',
              date: "30/03/2022",
              invoicenumber:'751',
              refnumber: "",
              pqnumber: "",
              duedate:"",
              paylink: "",
              supplier_type: "Supplier",
              supplier_name : "Amar kumar",
              supplier_addr : "Antri\nGwalior\nMadhya Pradesh",
              fields: {
                "Account Name" : ["30", "left"],
                "Description" : ["40", "left"],
                "Tax" : ["15", "right"],
                "Amount" : ["15", "right"]
              },
              subtotal : "$900.00",
              gst : "$0.00",
              total : "$900.00",
              paid_amount : "$900.00",
              bal_due : "$0.00",
              bsb : "",
              account : "",
              swift : "",
              applied : "",
              data: array_data,
              customfield1:'customfield1 data',
              customfield2:'customfield2 data',
              customfield3:'customfield3 data',
              customfieldlabel1:'customfield1',
              customfieldlabel2:'customfield2',
              customfieldlabel3:'customfield3',
              showFX:'',
              comment:"Bill Template Preivew",
            };
      }
      else{
        item = {
          o_url: "vs1cloud.com",
          o_name: "Sample Company",
          o_address: "123 street",
          o_city: "Los Angeles",
          o_state: "Califonia 12345",
          o_reg: "",
          o_abn: "56789051234",
          o_phone: "Phone : 25151944",
          title: 'Bill',
          value:'751',
          date: "30/03/2022",
          invoicenumber:'751',
          refnumber: "",
          pqnumber: "",
          duedate:"",
          paylink: "",
          supplier_type: "Supplier",
          supplier_name : "Amar kumar",
          supplier_addr : "Antri\nGwalior\nMadhya Pradesh",
          fields: {
            "Account Name" : ["30", "left"],
            "Description" : ["40", "left"],
            "Tax" : ["15", "right"],
            "Amount" : ["15", "right"]
          },
          subtotal : "$900.00",
          gst : "$0.00",
          total : "$900.00",
          paid_amount : "$900.00",
          bal_due : "$0.00",
          bsb : "",
          account : "",
          swift : "",
          applied : "",
          data: array_data,
          customfield1:'customfield1 data',
          customfield2:'customfield2 data',
          customfield3:'customfield3 data',
          customfieldlabel1:'customfield1',
          customfieldlabel2:'customfield2',
          customfieldlabel3:'customfield3',
          showFX:'AUD',
          comment:"Bill Template Preivew",

        };

      }
    
      object_invoce.push(item);
      $("#templatePreviewModal .field_payment").show();
      $("#templatePreviewModal .field_amount").show();
      if (number == 1) {
        updateTemplate1(object_invoce);
      } else if (number == 2) {
        updateTemplate2(object_invoce);
      } else {
        updateTemplate3(object_invoce);
      }

      saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);
      }

     //show credit data with dummy data
     function showCreditData(template_title,number) {
      object_invoce = [];
      var array_data = [];
      array_data.push([
        "Coghlin Tools Loan",
        "Advance to purchase tools",
        "$0.00",
        "$55.00",
      ]);
      array_data.push([
        "Bank Charges",
        "Bank Charges and Fees",
        "$0.00",
        "$70.00",
      ]);

      let item_credits = '';
      
      if(number == 1)
      {
        item_credits = {
          o_url: "vs1cloud.com",
          o_name: "Sample Company",
          o_address: "123 street",
          o_city: "Los Angeles",
          o_state: "Califonia 12345",
          o_reg: "",
          o_abn: "56789051234",
          o_phone: "Phone : 25151944",
          title: 'Credit',
          value: "751",
          date: "17/03/2022",
          invoicenumber: "17/03/2022",
          refnumber: "",
          pqnumber: "",
          duedate: "",
          paylink: "",
          supplier_type: "Supplier",
          supplier_name : "<p>The interesting <br>Company</p>",
          supplier_addr : "123 Street\nPE Eastern 5115\nAustralia",
          fields: {
            "Account Name" : ["30", "left"],
            "Description" : ["40", "left"],
            "Tax" : ["15", "right"],
            "Amount" : ["15", "right"]
          },
          subtotal : "$125.00",
          gst : "$0.00",
          total : "$125.00",
          paid_amount : "$0.00",
          bal_due : "$125.00",
          bsb : "",
          account : "",
          swift : "",
          data: array_data,
          applied : "",
          customfield1:'NA',
          customfield2:'NA',
          customfield3:'NA',
          customfieldlabel1:'NA',
          customfieldlabel2:'NA',
          customfieldlabel3:'NA',
          applied : "",
          showFX:"",
          comment:"Credit Template Preview",
        };

      }
      else if(number == 2)
      {
          item_credits = {
            o_url: "vs1cloud.com",
            o_name: "Sample Company",
            o_address: "123 street",
            o_city: "Los Angeles",
            o_state: "Califonia 12345",
            o_reg: "",
            o_abn: "56789051234",
            o_phone: "Phone : 25151944",
            title: 'Credit',
            value: "751",
            date: "17/03/2022",
            invoicenumber: "17/03/2022",
            refnumber: "",
            pqnumber: "",
            duedate: "",
            paylink: "",
            supplier_type: "Supplier",
            supplier_name : "<p>The interesting <br>Company</p>",
            supplier_addr : "123 Street\nPE Eastern 5115\nAustralia",
            fields: {
              "Account Name" : ["30", "left"],
              "Description" : ["40", "left"],
              "Tax" : ["15", "right"],
              "Amount" : ["15", "right"]
            },
            subtotal : "$125.00",
            gst : "$0.00",
            total : "$125.00",
            paid_amount : "$0.00",
            bal_due : "$125.00",
            bsb : "",
            account : "",
            swift : "",
            data: array_data,
            applied : "",
            customfield1:'customfield1 data',
            customfield2:'customfield2 data',
            customfield3:'customfield3 data',
            customfieldlabel1:'customfield1',
            customfieldlabel2:'customfield2',
            customfieldlabel3:'customfield3',
            showFX:'',
            comment:"Credit Template Preview",
          };

      }
      else
      {

        item_credits = {
          o_url: "vs1cloud.com",
          o_name: "Sample Company",
          o_address: "123 street",
          o_city: "Los Angeles",
          o_state: "Califonia 12345",
          o_reg: "",
          o_abn: "56789051234",
          o_phone: "Phone : 25151944",
          title: 'Credit',
          value: "751",
          invoicenumber: "17/03/2022",
          date: "17/03/2022",
          refnumber: "",
          pqnumber: "",
          duedate: "",
          paylink: "",
          supplier_type: "Supplier",
          supplier_name : "<p>The interesting <br>Company</p>",
          supplier_addr : "123 Street\nPE Eastern 5115\nAustralia",
          fields: {
            "Account Name" : ["30", "left"],
            "Description" : ["40", "left"],
            "Tax" : ["15", "right"],
            "Amount" : ["15", "right"]
          },
          subtotal : "$125.00",
          gst : "$0.00",
          total : "$125.00",
          paid_amount : "$0.00",
          bal_due : "$125.00",
          bsb : "",
          account : "",
          swift : "",
          data: array_data,
          applied : "",
          customfield1:'customfield1 data',
          customfield2:'customfield2 data',
          customfield3:'customfield3 data',
          customfieldlabel1:'customfield1',
          customfieldlabel2:'customfield2',
          customfieldlabel3:'customfield3',
          showFX:'AUD',
          comment:"Credit Template Preview",
        };


      }
    

      object_invoce.push(item_credits);

      $("#templatePreviewModal .field_payment").show();
      $("#templatePreviewModal .field_amount").show();

      if (number == 1) {
        updateTemplate1(object_invoce);
      } else if (number == 2) {
        updateTemplate2(object_invoce);
      } else {
        updateTemplate3(object_invoce);
      }
      saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);

     }

     //show customer payment info with DummyData
     function showCustomerPayment(template_title,number) {
      object_invoce = [];
      var array_data = [];
      array_data.push([
        "13/12/2021",
        "invoice",
        "710",
        "$50.00",
        "$50.00",
        "$50.00",
        "$0.00",
      ]);

      let item_payments = '';
      if(number == 1)
      {
            item_payments = {
              o_url: "vs1cloud.com",
              o_name: "Sample Company",
              o_address: "123 street",
              o_city: "Los Angeles",
              o_state: "Califonia 12345",
              o_reg: "",
              o_abn: "56789051234",
              o_phone: "Phone : 25151944",
              title: 'Customer Payment',
              value: "786",
              date: "14/04/2022",
              invoicenumber: "",
              refnumber: "5677",
              pqnumber: "",
              duedate: "",
              paylink: "",
              supplier_type: "Customer",
              supplier_name : "<p>Brand New <br> Company </p>",
              supplier_addr : "JHB\nA1515\nAustralia",
              fields: {
                "Date": ["15", "left"],
                "Type": ["15", "left"],
                "Trans": ["10", "left"],
                "Original": ["15", "right"],
                "Due": ["15", "right"],
                "Paid": ["15", "right"],
                "Outstanding": ["15", "right"]
              },
              subtotal : "$0.00",
              gst : "$0.00",
              total : "$0.00",
              paid_amount : "$0.00",
              bal_due : "$0.00",
              bsb : "",
              account : "",
              swift : "",
              data: array_data,
              applied : "$50.00",
              customfield1:'NA',
              customfield2:'NA',
              customfield3:'NA',
              customfieldlabel1:'NA',
              customfieldlabel2:'NA',
              customfieldlabel3:'NA',
              showFX:'',
              comment:"Customer Payment Template Preview"
              
              
            };

      }
      else if(number == 2)
      {
        item_payments = {
          o_url: "vs1cloud.com",
          o_name: "Sample Company",
          o_address: "123 street",
          o_city: "Los Angeles",
          o_state: "Califonia 12345",
          o_reg: "",
          o_abn: "56789051234",
          o_phone: "Phone : 25151944",
          title: 'Customer Payment',
          value: "786",
          date: "14/04/2022",
          invoicenumber: "",
          refnumber: "5677",
          pqnumber: "",
          duedate: "",
          paylink: "",
          supplier_type: "Customer",
          supplier_name : "<p>Brand New <br> Company </p>",
          supplier_addr : "JHB\nA1515\nAustralia",
          fields: {
            "Date": ["15", "left"],
            "Type": ["15", "left"],
            "Trans": ["10", "left"],
            "Original": ["15", "right"],
            "Due": ["15", "right"],
            "Paid": ["15", "right"],
            "Outstanding": ["15", "right"]
          },
          subtotal : "",
          gst : "",
          total : "",
          paid_amount : "",
          bal_due : "",
          bsb : '',
          account : '',
          swift : '',
          data: array_data,
          applied : "$50.00",
          customfield1:'customfield1 data',
          customfield2:'customfield2 data',
          customfield3:'customfield3 data',
          customfieldlabel1:'customfield1',
          customfieldlabel2:'customfield2',
          customfieldlabel3:'customfield3',
          showFX:'',
          comment:"Customer Payment Template Preview"
        };

      }
      else
      {

        item_payments = {
          o_url: "vs1cloud.com",
          o_name: "Sample Company",
          o_address: "123 street",
          o_city: "Los Angeles",
          o_state: "Califonia 12345",
          o_reg: "",
          o_abn: "56789051234",
          o_phone: "Phone : 25151944",
          title: 'Customer Payment',
          value: "786",
          date: "14/04/2022",
          invoicenumber: "",
          refnumber: "5677",
          pqnumber: "",
          duedate: "",
          paylink: "",
          supplier_type: "Customer",
          supplier_name : "<p>Brand New <br> Company </p>",
          supplier_addr : "JHB\nA1515\nAustralia",
          fields: {
            "Date": ["15", "left"],
            "Type": ["15", "left"],
            "Trans": ["10", "left"],
            "Original": ["15", "right"],
            "Due": ["15", "right"],
            "Paid": ["15", "right"],
            "Outstanding": ["15", "right"]
          },
          subtotal : "",
          gst : "",
          total : "",
          paid_amount : "",
          bal_due : "",
          bsb : '',
          account : '',
          swift : '',
          data: array_data,
          applied : "$50.00",
          customfield1:'customfield1 data',
          customfield2:'customfield2 data',
          customfield3:'customfield3 data',
          customfieldlabel1:'customfield1',
          customfieldlabel2:'customfield2',
          customfieldlabel3:'customfield3',
          showFX:'AUD',
          comment:"Customer Payment Template Preview"         
        };

      }
    

      object_invoce.push(item_payments);

      $("#templatePreviewModal .field_payment").show();
      $("#templatePreviewModal .field_amount").show();

      if (number == 1) {
        updateTemplate1(object_invoce);
      } else if (number == 2) {
        updateTemplate2(object_invoce);
      } else {
        updateTemplate3(object_invoce);
      }

      saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);
     }

     //show customer payment info with DummyData
     function showCustomerStatments(template_title,number) {
          object_invoce = [];
          var array_data = [];
          array_data.push([
            "720",
            "15/03/2022",
            "Payment",
            "30/12/1899",
            "-$15,000.00",
            "$0.00",
            "-$15,000.00",
          ]);

          array_data.push([
              "712",
              "17/03/2022",
              "Payment",
              "30/12/1899",
              "-$7,000.00",
              "$0.00",
              "-$70,000.00",
            ]);

            array_data.push([
              "718",
              "17/03/2022",
              "Payment",
              "30/12/1899",
              "-$15,000.00",
              "$0.00",
              "-$15,000.00",
            ]);
        
          let item_statement = '';
          if(number == 1)
          {
            item_statement = {
                o_url: "vs1cloud.com",
                o_name: "Sample Company",
                o_address: "123 street",
                o_city: "",
                o_state: "",
                o_reg: "",
                o_abn: "56789051234",
                o_phone: "Phone : 25151944",
                title: 'Customer Statement',
                value:"252",
                date: "11/04/2022",
                invoicenumber: "",
                refnumber: "",
                pqnumber: "",
                duedate: "",
                paylink: "Pay Now",
                supplier_type: "Customer",
                supplier_name : "John Wayne Inc",
                supplier_addr : "",
                fields: {
                  "ID": ["10", "left"],
                  "Date": ["15", "left"],
                  "Type": ["15", "left"],
                  "Due Date": ["15", "left"],
                  "Total": ["15", "right"],
                  "Paid": ["15", "right"],
                  "Balance": ["15", "right"]
                },
                subtotal : "$0.00",
                gst : "$0.00",
                total : "$0.00",
                paid_amount : "$0.00",
                bal_due : "$100,000.00",
                bsb : "",
                account : "",
                swift : "",
                data: array_data,
                applied : "$0.00",
                customfield1:'',
                customfield2:'',
                customfield3:'',
                customfieldlabel1:'',
                customfieldlabel2:'',
                customfieldlabel3:'',
                showFX:'',
                comment:"Customer statement template preview"
            };

          }
          else if(number == 2)
          {  
            item_statement = {
              o_url: "vs1cloud.com",
              o_name: "Sample Company",
              o_address: "123 street",
              o_city: "",
              o_state: "",
              o_reg: "",
              o_abn: "56789051234",
              o_phone: "Phone : 25151944",
              title: 'Customer Statement',
              value:"252",
              date: "11/04/2022",
              invoicenumber: "",
              refnumber: "",
              pqnumber: "",
              duedate: "",
              paylink: "Pay Now",
              supplier_type: "Customer",
              supplier_name : "John Wayne Inc",
              supplier_addr : "",
              fields: {
                "ID": ["10", "left"],
                "Date": ["15", "left"],
                "Type": ["15", "left"],
                "Due Date": ["15", "left"],
                "Total": ["15", "right"],
                "Paid": ["15", "right"],
                "Balance": ["15", "right"]
              },
              subtotal : "$0.00",
              gst : "$0.00",
              total : "$0.00",
              paid_amount : "$0.00",
              bal_due : "$100,000.00",
              bsb : "",
              account : "",
              swift : "",
              data: array_data,
              applied : "$0.00",
              customfield1:'customfield1',
              customfield2:'customfield2',
              customfield3:'customfield3',
              customfieldlabel1:'customfield1 data',
              customfieldlabel2:'customfield2 data',
              customfieldlabel3:'customfield3 data',
              showFX:'',
              comment:"Customer statement template preview"
            };


          }
          else{
            item_statement = {
              o_url: "vs1cloud.com",
              o_name: "Sample Company",
              o_address: "123 street",
              o_city: "",
              o_state: "",
              o_reg: "",
              o_abn: "56789051234",
              o_phone: "Phone : 25151944",
              title: 'Customer Statement',
              value:"252",
              date: "11/04/2022",
              invoicenumber: "",
              refnumber: "",
              pqnumber: "",
              duedate: "",
              paylink: "Pay Now",
              supplier_type: "Customer",
              supplier_name : "John Wayne Inc",
              supplier_addr : "",
              fields: {
                "ID": ["10", "left"],
                "Date": ["15", "left"],
                "Type": ["15", "left"],
                "Due Date": ["15", "left"],
                "Total": ["15", "right"],
                "Paid": ["15", "right"],
                "Balance": ["15", "right"]
              },
              subtotal : "$0.00",
              gst : "$0.00",
              total : "$0.00",
              paid_amount : "$0.00",
              bal_due : "$100,000.00",
              bsb : "",
              account : "",
              swift : "",
              data: array_data,
              applied : "$0.00",
              customfield1:'customfield1',
              customfield2:'customfield2',
              customfield3:'customfield3',
              customfieldlabel1:'customfield1 data',
              customfieldlabel2:'customfield2 data',
              customfieldlabel3:'customfield3 data',
              showFX:'AUD',
              comment:"Customer statement template preview"
            };



          }
        
      
          object_invoce.push(item_statement);

          $("#templatePreviewModal .field_payment").show();
          $("#templatePreviewModal .field_amount").show();


          if (number == 1) {
            updateTemplate1(object_invoce);
          } else if (number == 2) {
            updateTemplate2(object_invoce);
          } else {
            updateTemplate3(object_invoce);
          }

          saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);
     }

     //show invoice payment info with DummyData
     function showInvoice(template_title,number) {
      object_invoce = [];
      var array_data = [];
      array_data.push([
        "Fanta Grape Can",
        "Fanta Grape Can SODA",
        "1",
        "$0.00",
        "$0.00",
        "$0.00",
      ]);

      array_data.push([
          "Fanta Grape Can",
          "Fanta Grape Can SODA",
          "1",
          "$0.00",
          "$0.00",
          "$0.00",
        ]);
      let item_invoices = '';
      if(number == 1)
      {
          item_invoices = {

              o_url: 'vs1cloud.com',
              o_name: "Sample Company",
              o_address:"123 street",
              o_city: "Los Angeles",
              o_state: "Califonia 12345",
              o_reg:"",
              o_abn: "56789051234",
              o_phone:"Phone : 25151944",
              title: 'Invoice',
              value: '751',
              date: '25/05/2022',
              invoicenumber:'751',
              refnumber: '1234',
              pqnumber: '1244',
              duedate: '07/07/2022',
              paylink: "Pay Now",
              supplier_type: "Customer",
              supplier_name : "Amar",
              supplier_addr : "Gwalior\nMadhya Pradesh",
              fields: {
                "Product Name": ["25", "left"],
                "Description": ["30", "left"],
                "Qty": ["10", "right"],
                "Unit Price": ["10", "right"],
                "Tax": ["10", "right"],
                "Amount": ["15", "right"],
              },
              subtotal :"$500.00",
              gst : "$15.00",
              total : "$515.00",
              paid_amount : "$400.00",
              bal_due : "$115.00",
              bsb : "4654-454",
              account : "16161616",
              swift : "WPOCA5s",
              data: array_data,
              customfield1:'NA',
              customfield2:'NA',
              customfield3:'NA',
              customfieldlabel1:'NA',
              customfieldlabel2:'NA',
              customfieldlabel3:'NA',
              applied : "",
              showFX:"",
              comment:"Invoice Template Preview",
          };

      }
      else if(number == 2)
      {
          item_invoices = {
            o_url: 'vs1cloud.com',
            o_name: "Sample Company",
            o_address:"123 street",
            o_city: "Los Angeles",
            o_state: "Califonia 12345",
            o_reg:"",
            o_abn: "56789051234",
            o_phone:"Phone : 25151944",
            title: 'Invoice',
            value: '751',
            date: '25/05/2022',
            invoicenumber:'751',
            refnumber: '1234',
            pqnumber: '1244',
            duedate: '07/07/2022',
            paylink: "Pay Now",
            supplier_type: "Customer",
            supplier_name : "Amar",
            supplier_addr : "Gwalior\nMadhya Pradesh",
            fields: {
              "Product Name": ["25", "left"],
              "Description": ["30", "left"],
              "Qty": ["10", "right"],
              "Unit Price": ["10", "right"],
              "Tax": ["10", "right"],
              "Amount": ["15", "right"],
            },
            subtotal :"$500.00",
            gst : "$15.00",
            total : "$515.00",
            paid_amount : "$400.00",
            bal_due : "$115.00",
            bsb : "4654-454",
            account : "16161616",
            swift : "WPOCA5s",
            data: array_data,
            customfield1:'Custom Field 1 Data',
            customfield2:'Custom Field 2 Data',
            customfield3:'Custom Field 3 Data',
            customfieldlabel1:'Custom Field 1',
            customfieldlabel2:'Custom Field 2',
            customfieldlabel3:'Custom Field 3',
            applied : "",
            showFX:"",
            comment:"Invoice Template Preview",
          };

      }
      else
      {
          item_invoices = {
            o_url: 'vs1cloud.com',
            o_name: "Sample Company",
            o_address:"123 street",
            o_city: "Los Angeles",
            o_state: "Califonia 12345",
            o_reg:"",
            o_abn: "56789051234",
            o_phone:"Phone : 25151944",
            title: 'Invoice',
            value: '751',
            date: '25/05/2022',
            invoicenumber:'751',
            refnumber: '1234',
            pqnumber: '1244',
            duedate: '07/07/2022',
            paylink: "Pay Now",
            supplier_type: "Customer",
            supplier_name : "Amar",
            supplier_addr : "Gwalior\nMadhya Pradesh",
            fields: {
              "Product Name": ["25", "left"],
              "Description": ["30", "left"],
              "Qty": ["10", "right"],
              "Unit Price": ["10", "right"],
              "Tax": ["10", "right"],
              "Amount": ["15", "right"],
            },
            subtotal :"$500.00",
            gst : "$15.00",
            total : "$515.00",
            paid_amount : "$400.00",
            bal_due : "$115.00",
            bsb : "4654-454",
            account : "16161616",
            swift : "WPOCA5s",
            data: array_data,
            customfield1:'Custom Field 1 Data',
            customfield2:'Custom Field 2 Data',
            customfield3:'Custom Field 3 Data',
            customfieldlabel1:'Custom Field 1',
            customfieldlabel2:'Custom Field 2',
            customfieldlabel3:'Custom Field 3',
            applied : "",
            showFX:"AUD",
            comment:"Invoice Template Preview",
          };

      }
    
      

      object_invoce.push(item_invoices);

      $("#templatePreviewModal .field_payment").show();
      $("#templatePreviewModal .field_amount").show();

      if (number == 1) {
        updateTemplate1(object_invoce);
      } else if (number == 2) {
        updateTemplate2(object_invoce);
      } else {
        updateTemplate3(object_invoce);
      }

      saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);
     }

     //show invoice back  info with DummyData
     function showInvoiceBack(template_title,number) {
      object_invoce = [];
      var array_data = [];
      array_data.push([
          "Fanta Grape Can",
          "Fanta Grape Can SODA",
          "1",
          "$0.00",
          "$0.00",
          "$0.00",
        ]);

        array_data.push([
            "Fanta Grape Can",
            "Fanta Grape Can SODA",
            "1",
            "$0.00",
            "$0.00",
            "$0.00",
          ]);

      let item_invoices = '';

      if(number == 1)
      {
          item_invoices = {

              o_url: 'vs1cloud.com',
              o_name: "Sample Company",
              o_address:"123 street",
              o_city: "Los Angeles",
              o_state: "Califonia 12345",
              o_reg:"",
              o_abn: "56789051234",
              o_phone:"Phone : 25151944",
              title: 'Invoice Back Order',
              value: '751',
              date: '25/05/2022',
              invoicenumber:'751',
              refnumber: '1234',
              pqnumber: '1244',
              duedate: '07/07/2022',
              paylink: "Pay Now",
              supplier_type: "Customer",
              supplier_name : "Amar",
              supplier_addr : "Gwalior\nMadhya Pradesh",
              fields: {
                "Product Name": ["25", "left"],
                "Description": ["30", "left"],
                "Qty": ["10", "right"],
                "Unit Price": ["10", "right"],
                "Tax": ["10", "right"],
                "Amount": ["15", "right"],
              },
              subtotal :"$500.00",
              gst : "$15.00",
              total : "$515.00",
              paid_amount : "$400.00",
              bal_due : "$115.00",
              bsb : "4654-454",
              account : "16161616",
              swift : "WPOCA5s",
              data: array_data,
              customfield1:'NA',
              customfield2:'NA',
              customfield3:'NA',
              customfieldlabel1:'NA',
              customfieldlabel2:'NA',
              customfieldlabel3:'NA',
              applied : "",
              showFX:"",
              comment:"Invoice Back Order Template Preview",
          };

      }
      else if(number == 2)
      {
          item_invoices = {
            o_url: 'vs1cloud.com',
            o_name: "Sample Company",
            o_address:"123 street",
            o_city: "Los Angeles",
            o_state: "Califonia 12345",
            o_reg:"",
            o_abn: "56789051234",
            o_phone:"Phone : 25151944",
            title: 'Invoice Back Order',
            value: '751',
            date: '25/05/2022',
            invoicenumber:'751',
            refnumber: '1234',
            pqnumber: '1244',
            duedate: '07/07/2022',
            paylink: "Pay Now",
            supplier_type: "Customer",
            supplier_name : "Amar",
            supplier_addr : "Gwalior\nMadhya Pradesh",
            fields: {
              "Product Name": ["25", "left"],
              "Description": ["30", "left"],
              "Qty": ["10", "right"],
              "Unit Price": ["10", "right"],
              "Tax": ["10", "right"],
              "Amount": ["15", "right"],
            },
            subtotal :"$500.00",
            gst : "$15.00",
            total : "$515.00",
            paid_amount : "$400.00",
            bal_due : "$115.00",
            bsb : "4654-454",
            account : "16161616",
            swift : "WPOCA5s",
            data: array_data,
            customfield1:'Custom Field 1 Data',
            customfield2:'Custom Field 2 Data',
            customfield3:'Custom Field 3 Data',
            customfieldlabel1:'Custom Field 1',
            customfieldlabel2:'Custom Field 2',
            customfieldlabel3:'Custom Field 3',
            applied : "",
            showFX:"",
            comment:"Invoice Back Order Template Preview",
          };

      }
      else
      {
          item_invoices = {
            o_url: 'vs1cloud.com',
            o_name: "Sample Company",
            o_address:"123 street",
            o_city: "Los Angeles",
            o_state: "Califonia 12345",
            o_reg:"",
            o_abn: "56789051234",
            o_phone:"Phone : 25151944",
            title: 'Invoice Back Order',
            value: '751',
            date: '25/05/2022',
            invoicenumber:'751',
            refnumber: '1234',
            pqnumber: '1244',
            duedate: '07/07/2022',
            paylink: "Pay Now",
            supplier_type: "Customer",
            supplier_name : "Amar",
            supplier_addr : "Gwalior\nMadhya Pradesh",
            fields: {
              "Product Name": ["25", "left"],
              "Description": ["30", "left"],
              "Qty": ["10", "right"],
              "Unit Price": ["10", "right"],
              "Tax": ["10", "right"],
              "Amount": ["15", "right"],
            },
            subtotal :"$500.00",
            gst : "$15.00",
            total : "$515.00",
            paid_amount : "$400.00",
            bal_due : "$115.00",
            bsb : "4654-454",
            account : "16161616",
            swift : "WPOCA5s",
            data: array_data,
            customfield1:'Custom Field 1 Data',
            customfield2:'Custom Field 2 Data',
            customfield3:'Custom Field 3 Data',
            customfieldlabel1:'Custom Field 1',
            customfieldlabel2:'Custom Field 2',
            customfieldlabel3:'Custom Field 3',
            applied : "",
            showFX:"AUD",
            comment:"Invoice Back Order Template Preview",
          };

      }
     

      

      object_invoce.push(item_invoices);
      $("#templatePreviewModal .field_payment").show();
      $("#templatePreviewModal .field_amount").show();

      if (number == 1) {
        updateTemplate1(object_invoce);
      } else if (number == 2) {
        updateTemplate2(object_invoce);
      } else {
        updateTemplate3(object_invoce);
      }

      saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);
      }


     //show purchase orders  info with DummyData
     function showPurchaseOrder(template_title,number) {
        object_invoce = [];
        var array_data = [];
        array_data.push([
          "ABC Product",
          "ABC Product",
          "5",
          "$5.00",
          "$0.00",
          "$0.00",
        ]);
        let item_purchase = '';
        if(number == 1)
        {
           item_purchase = {
            o_url: "vs1cloud.com",
            o_name: "Sample Company",
            o_address: "123 street",
            o_city: "Los Angeles",
            o_state: "Califonia 12345",
            o_reg: "",
            o_abn: "56789051234",
            o_phone: "25151944",
            title: 'Purchase Order',
            value:"287",
            date: "29/03/2022",
            invoicenumber: ".",
            refnumber: "",
            pqnumber: "",
            duedate: "",
            paylink: "",
            supplier_type: "Supplier",
            supplier_name : "<p>ABC Building Company</p>",
            supplier_addr : "Dallas\nTexas 8877\nUnited States",
            fields: {
              "Product Name": ["25", "left"],
              "Description": ["30", "left"],
              "Qty": ["10", "right"],
              "Unit Price": ["10", "right"],
              "Tax": ["10", "right"],
              "Amount": ["15", "right"],
            },
            subtotal : "$0.00",
            gst : "$0.00",
            total : "$0.00",
            paid_amount : "$0.00",
            bal_due : "$0.00",
            bsb : "",
            account : "",
            swift : "",
            data: array_data,
            applied : "",
            customfield1:'NA',
            customfield2:'NA',
            customfield3:'NA',
            customfieldlabel1:'NA',
            customfieldlabel2:'NA',
            customfieldlabel3:'NA',
            applied : "",
            showFX:"",
            comment:"Purchases Order Template Preview",
            
          };


        }
        else if(number == 2)
        {
           item_purchase = {
            o_url: "vs1cloud.com",
            o_name: "Sample Company",
            o_address: "123 street",
            o_city: "Los Angeles",
            o_state: "Califonia 12345",
            o_reg: "",
            o_abn: "56789051234",
            o_phone: "25151944",
            title: 'Purchase Order',
            value:"287",
            date: "29/03/2022",
            invoicenumber: ".",
            refnumber: "",
            pqnumber: "",
            duedate: "",
            paylink: "",
            supplier_type: "Supplier",
            supplier_name : "<p>ABC Building Company</p>",
            supplier_addr : "Dallas\nTexas 8877\nUnited States",
            fields: {
              "Product Name": ["25", "left"],
              "Description": ["30", "left"],
              "Qty": ["10", "right"],
              "Unit Price": ["10", "right"],
              "Tax": ["10", "right"],
              "Amount": ["15", "right"],
            },
            subtotal : "$0.00",
            gst : "$0.00",
            total : "$0.00",
            paid_amount : "$0.00",
            bal_due : "$0.00",
            bsb : "",
            account : "",
            swift : "",
            data: array_data,
            applied : "",
            customfield1:"customfield1",
            customfield2:"customfield2",
            customfield3:"customfield3",
            customfieldlabel1:"customfieldlabel1",
            customfieldlabel2:"customfieldlabel2",
            customfieldlabel3:"customfieldlabel3",
            showFX:'',
            comment:"Purchases Order Template Preview",
          };

        }
        else{
          item_purchase = {
            o_url: "vs1cloud.com",
            o_name: "Sample Company",
            o_address: "123 street",
            o_city: "Los Angeles",
            o_state: "Califonia 12345",
            o_reg: "",
            o_abn: "56789051234",
            o_phone: "25151944",
            title: 'Purchase Order',
            value:"287",
            date: "29/03/2022",
            invoicenumber: ".",
            refnumber: "",
            pqnumber: "",
            duedate: "",
            paylink: "",
            supplier_type: "Supplier",
            supplier_name : "<p>ABC Building Company</p>",
            supplier_addr : "Dallas\nTexas 8877\nUnited States",
            fields: {
              "Product Name": ["25", "left"],
              "Description": ["30", "left"],
              "Qty": ["10", "right"],
              "Unit Price": ["10", "right"],
              "Tax": ["10", "right"],
              "Amount": ["15", "right"],
            },
            subtotal : "$0.00",
            gst : "$0.00",
            total : "$0.00",
            paid_amount : "$0.00",
            bal_due : "$0.00",
            bsb : "",
            account : "",
            swift : "",
            data: array_data,
            applied : "",
            customfield1:"customfield1",
            customfield2:"customfield2",
            customfield3:"customfield3",
            customfieldlabel1:"customfieldlabel1",
            customfieldlabel2:"customfieldlabel2",
            customfieldlabel3:"customfieldlabel3",
            showFX:'AUD',
            comment:"Purchases Order Template Preview",
            
          };


        }

        object_invoce.push(item_purchase);
        $("#templatePreviewModal .field_payment").show();
        $("#templatePreviewModal .field_amount").show();
        if (number == 1) {
          updateTemplate1(object_invoce);
        } else if (number == 2) {
          updateTemplate2(object_invoce);
        } else {
          updateTemplate3(object_invoce);
        }

        saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);
     }


     //show Quotes  info with DummyData
     function showQuotes(template_title,number) {
        object_invoce = [];
        var array_data = [];
        array_data.push([
          "Fanta Grape Can",
          "Fanta Grape Can SODA",
          "1",
          "$0.00",
          "$0.00",
          "$0.00",
        ]);

        let item_quote = '';

        if(number == 1)
        {
           item_quote = {
            o_url: "vs1cloud.com",
            o_name: "Sample Company",
            o_address: "123 street",
            o_city: "Los Angeles",
            o_state: "Califonia 12345",
            o_reg: "",
            o_abn: "56789051234",
            o_phone: "25151944",
            title: 'Quote',
            value: "287",
            date: "14/04/2022",
            invoicenumber: "147",
            refnumber: "456",
            pqnumber: "1234",
            duedate: "14/04/2022",
            paylink: "Pay Now",
            supplier_type: "Customer",
            supplier_name : "<p>Accenture Software Dev</p>",
            supplier_addr : "Building 3\nWaterfall Corporate\nSouth Africa",
            fields: {
              "Product Name": ["25", "left"],
              "Description": ["30", "left"],
              "Qty": ["10", "right"],
              "Unit Price": ["10", "right"],
              "Tax": ["10", "right"],
              "Amount": ["15", "right"],
            },
            subtotal : "$0.00",
            gst : "$0.00",
            total : "$0.00",
            paid_amount : "$0.00",
            bal_due : "$0.00",
            bsb : "4654-454",
            account : "151515",
            swift : "WPOCA5s",
            data: array_data,
            applied : "",
            customfield1:'NA',
            customfield2:'NA',
            customfield3:'NA',
            customfieldlabel1:'NA',
            customfieldlabel2:'NA',
            customfieldlabel3:'NA',
            showFX:'',
            comment:"Quote Template Preview",

          };

        }
        else if(number == 2)
        {
           item_quote = {
            o_url: "vs1cloud.com",
            o_name: "Sample Company",
            o_address: "123 street",
            o_city: "Los Angeles",
            o_state: "Califonia 12345",
            o_reg: "",
            o_abn: "56789051234",
            o_phone: "25151944",
            title: 'Quote',
            date: "14/04/2022",
            invoicenumber: "147",
            refnumber: "456",
            pqnumber: "1234",
            duedate: "14/04/2022",
            paylink: "Pay Now",
            supplier_type: "Customer",
            supplier_name : "<p>Accenture Software Dev</p>",
            supplier_addr : "Building 3\nWaterfall Corporate\nSouth Africa",
            fields: {
              "Product Name": ["25", "left"],
              "Description": ["30", "left"],
              "Qty": ["10", "right"],
              "Unit Price": ["10", "right"],
              "Tax": ["10", "right"],
              "Amount": ["15", "right"],
            },
            subtotal : "$0.00",
            gst : "$0.00",
            total : "$0.00",
            paid_amount : "$0.00",
            bal_due : "$0.00",
            bsb : "4654-454",
            account : "151515",
            swift : "WPOCA5s",
            data: array_data,
            applied : "",
            customfield1:'customfield1 data',
            customfield2:'customfield2 data',
            customfield3:'customfield3 data',
            customfieldlabel1:'customfield1',
            customfieldlabel2:'customfield2',
            customfieldlabel3:'customfield3',
            showFX:'',
            comment:"Quote Template Preview",
          };

        }
        else{
          item_quote = {
            o_url: "vs1cloud.com",
            o_name: "Sample Company",
            o_address: "123 street",
            o_city: "Los Angeles",
            o_state: "Califonia 12345",
            o_reg: "",
            o_abn: "56789051234",
            o_phone: "25151944",
            title: 'Quote',
            date: "14/04/2022",
            invoicenumber: "147",
            refnumber: "456",
            pqnumber: "1234",
            duedate: "14/04/2022",
            paylink: "Pay Now",
            supplier_type: "Customer",
            supplier_name : "<p>Accenture Software Dev</p>",
            supplier_addr : "Building 3\nWaterfall Corporate\nSouth Africa",
            fields: {
              "Product Name": ["25", "left"],
              "Description": ["30", "left"],
              "Qty": ["10", "right"],
              "Unit Price": ["10", "right"],
              "Tax": ["10", "right"],
              "Amount": ["15", "right"],
            },
            subtotal : "$0.00",
            gst : "$0.00",
            total : "$0.00",
            paid_amount : "$0.00",
            bal_due : "$0.00",
            bsb : "4654-454",
            account : "151515",
            swift : "WPOCA5s",
            data: array_data,
            applied : "",
            customfield1:'customfield1 data',
            customfield2:'customfield2 data',
            customfield3:'customfield3 data',
            customfieldlabel1:'customfield1',
            customfieldlabel2:'customfield2',
            customfieldlabel3:'customfield3',
            showFX:'AUD',
            comment:"Quote Template Preview",

          };


        }
     

        object_invoce.push(item_quote);
        $("#templatePreviewModal .field_payment").show();
        $("#templatePreviewModal .field_amount").show();
        if (number == 1) {
          updateTemplate1(object_invoce);
        } else if (number == 2) {
          updateTemplate2(object_invoce);
        } else {
          updateTemplate3(object_invoce);
        }

        saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);
      }


    //show refund  info with DummyData
    function showRefund(template_title,number) {
        object_invoce = [];
        var array_data = [];
        array_data.push([
          "Bank Stickers",
          "Bank Stickers",
          "1",
          "$50.00",
          "$0.00",
          "-$50.00",
        ]);
        let item_refund = '';

        if(number == 1)
        {
            item_refund = {
              o_url: "vs1cloud.com",
              o_name: "Sample Company",
              o_address: "123 street",
              o_city: "Los Angeles",
              o_state: "Califonia 12345",
              o_reg: "",
              o_abn: "56789051234",
              o_phone: "25151944",
              title: 'Refund',
              value: "738",
              date: "14/04/2022",
              invoicenumber: "",
              refnumber: "4656",
              pqnumber: "9055",
              duedate: "29/03/2022",
              paylink: "Pay Now",
              supplier_type: "Customer",
              supplier_name : "<p>Accenture Software Dev</p>",
              supplier_addr : "Building 3\nWaterfall Corporate\nSouth Africa",
              fields: {
                "Product Name": ["25", "left"],
                "Description": ["30", "left"],
                "Qty": ["10", "right"],
                "Unit Price": ["10", "right"],
                "Tax": ["10", "right"],
                "Amount": ["15", "right"],
              },
              subtotal : "-$50.00",
              gst : "$0.00",
              total : "-$50.00",
              paid_amount : "$0.00",
              bal_due : "-$50.00",
              bsb : "4654-454",
              account : "151515",
              swift : "WPOCA5s",
              data: array_data,
              applied : "",
              customfield1:'NA',
              customfield2:'NA',
              customfield3:'NA',
              customfieldlabel1:'NA',
              customfieldlabel2:'NA',
              customfieldlabel3:'NA',
              showFX:'',
              comment:"Refund Template Preview",
            };

        }
        else if(number == 2)
        {
             item_refund = {
              o_url: "vs1cloud.com",
              o_name: "Sample Company",
              o_address: "123 street",
              o_city: "Los Angeles",
              o_state: "Califonia 12345",
              o_reg: "",
              o_abn: "56789051234",
              o_phone: "25151944",
              title: 'Refund',
              value: "738",
              date: "14/04/2022",
              invoicenumber: "",
              refnumber: "",
              pqnumber: "9055",
              duedate: "29/03/2022",
              paylink: "Pay Now",
              supplier_type: "Customer",
              supplier_name : "<p>Accenture Software Dev</p>",
              supplier_addr : "Building 3\nWaterfall Corporate\nSouth Africa",
              fields: {
                "Product Name": ["25", "left"],
                "Description": ["30", "left"],
                "Qty": ["10", "right"],
                "Unit Price": ["10", "right"],
                "Tax": ["10", "right"],
                "Amount": ["15", "right"],
              },
              subtotal : "-$50.00",
              gst : "$0.00",
              total : "-$50.00",
              paid_amount : "$0.00",
              bal_due : "-$50.00",
              bsb : "4654-454",
              account : "151515",
              swift : "WPOCA5s",
              data: array_data,
              applied : "",
              customfield1:'customfield1 data',
              customfield2:'customfield2 data',
              customfield3:'customfield3 data',
              customfieldlabel1:'customfield1',
              customfieldlabel2:'customfield2',
              customfieldlabel3:'customfield3',
              showFX:'',
              comment:"Refund Template Preview",
            };


        }
        else
        {
            item_refund = {
                o_url: "vs1cloud.com",
                o_name: "Sample Company",
                o_address: "123 street",
                o_city: "Los Angeles",
                o_state: "Califonia 12345",
                o_reg: "",
                o_abn: "56789051234",
                o_phone: "25151944",
                title: 'Refund',
                value: "738",
                date: "14/04/2022",
                invoicenumber: "",
                refnumber: "",
                pqnumber: "9055",
                duedate: "29/03/2022",
                paylink: "Pay Now",
                supplier_type: "Customer",
                supplier_name : "<p>Accenture Software Dev</p>",
                supplier_addr : "Building 3\nWaterfall Corporate\nSouth Africa",
                fields: {
                  "Product Name": ["25", "left"],
                  "Description": ["30", "left"],
                  "Qty": ["10", "right"],
                  "Unit Price": ["10", "right"],
                  "Tax": ["10", "right"],
                  "Amount": ["15", "right"],
                },
                subtotal : "-$50.00",
                gst : "$0.00",
                total : "-$50.00",
                paid_amount : "$0.00",
                bal_due : "-$50.00",
                bsb : "4654-454",
                account : "151515",
                swift : "WPOCA5s",
                data: array_data,
                applied : "",
                customfield1:'customfield1 data',
                customfield2:'customfield2 data',
                customfield3:'customfield3 data',
                customfieldlabel1:'customfield1',
                customfieldlabel2:'customfield2',
                customfieldlabel3:'customfield3',
                showFX:'AUD',
                comment:"Refund Template Preview",
            
          };


        }
       

        object_invoce.push(item_refund);
        $("#templatePreviewModal .field_payment").show();
        $("#templatePreviewModal .field_amount").show();
        if (number == 1) {
          updateTemplate1(object_invoce);
        } else if (number == 2) {
          updateTemplate2(object_invoce);
        } else {
          updateTemplate3(object_invoce);
        }
        saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);
      }

      //show selas order  info with DummyData
    function showSealsOrder(template_title,number) {
        object_invoce = [];
        var array_data = [];
        array_data.push([
          "Test",
          "Test description",
          "2",
          "$0",
          "$0.00",
          "$0.00",
        ]);

        let item_invoices = '';

        if(number == 1)
        {
          item_invoices = {
                o_url: 'vs1cloud.com',
                o_name: "Sample Company",
                o_address:"123 street",
                o_city: "Los Angeles",
                o_state: "Califonia 12345",
                o_reg:"",
                o_abn: "56789051234",
                o_phone:"Phone : 25151944",
                title: 'Sales Order',
                value: '751',
                date: '25/05/2022',
                invoicenumber:'751',
                refnumber: '1234',
                pqnumber: '1244',
                duedate: '07/07/2022',
                paylink: "Pay Now",
                supplier_type: "Customer",
                supplier_name : "Amar",
                supplier_addr : "Gwalior\nMadhya Pradesh",
                fields: {
                  "Product Name": ["25", "left"],
                  "Description": ["30", "left"],
                  "Qty": ["10", "right"],
                  "Unit Price": ["10", "right"],
                  "Tax": ["10", "right"],
                  "Amount": ["15", "right"],
                },
                subtotal :"$500.00",
                gst : "$15.00",
                total : "$515.00",
                paid_amount : "$400.00",
                bal_due : "$115.00",
                bsb : "4654-454",
                account : "16161616",
                swift : "WPOCA5s",
                data: array_data,
                customfield1:'NA',
                customfield2:'NA',
                customfield3:'NA',
                customfieldlabel1:'NA',
                customfieldlabel2:'NA',
                customfieldlabel3:'NA',
                applied : "",
                showFX:"",
                comment:"Sales Order Template Preview",
            };
  
        }
        else if(number == 2)
        {
          item_invoices = {
              o_url: 'vs1cloud.com',
              o_name: "Sample Company",
              o_address:"123 street",
              o_city: "Los Angeles",
              o_state: "Califonia 12345",
              o_reg:"",
              o_abn: "56789051234",
              o_phone:"Phone : 25151944",
              title: 'Sales Order',
              value: '751',
              date: '25/05/2022',
              invoicenumber:'751',
              refnumber: '1234',
              pqnumber: '1244',
              duedate: '07/07/2022',
              paylink: "Pay Now",
              supplier_type: "Customer",
              supplier_name : "Amar",
              supplier_addr : "Gwalior\nMadhya Pradesh",
              fields: {
                "Product Name": ["25", "left"],
                "Description": ["30", "left"],
                "Qty": ["10", "right"],
                "Unit Price": ["10", "right"],
                "Tax": ["10", "right"],
                "Amount": ["15", "right"],
              },
              subtotal :"$500.00",
              gst : "$15.00",
              total : "$515.00",
              paid_amount : "$400.00",
              bal_due : "$115.00",
              bsb : "4654-454",
              account : "16161616",
              swift : "WPOCA5s",
              data: array_data,
              customfield1:'Custom Field 1 Data',
              customfield2:'Custom Field 2 Data',
              customfield3:'Custom Field 3 Data',
              customfieldlabel1:'Custom Field 1',
              customfieldlabel2:'Custom Field 2',
              customfieldlabel3:'Custom Field 3',
              applied : "",
              showFX:"",
              comment:"Sales Order Template Preview",
            };
  
        }
        else
        {
          item_invoices = {
              o_url: 'vs1cloud.com',
              o_name: "Sample Company",
              o_address:"123 street",
              o_city: "Los Angeles",
              o_state: "Califonia 12345",
              o_reg:"",
              o_abn: "56789051234",
              o_phone:"Phone : 25151944",
              title: 'Sales Order',
              value: '751',
              date: '25/05/2022',
              invoicenumber:'751',
              refnumber: '1234',
              pqnumber: '1244',
              duedate: '07/07/2022',
              paylink: "Pay Now",
              supplier_type: "Customer",
              supplier_name : "Amar",
              supplier_addr : "Gwalior\nMadhya Pradesh",
              fields: {
                "Product Name": ["25", "left"],
                "Description": ["30", "left"],
                "Qty": ["10", "right"],
                "Unit Price": ["10", "right"],
                "Tax": ["10", "right"],
                "Amount": ["15", "right"],
              },
              subtotal :"$500.00",
              gst : "$15.00",
              total : "$515.00",
              paid_amount : "$400.00",
              bal_due : "$115.00",
              bsb : "4654-454",
              account : "16161616",
              swift : "WPOCA5s",
              data: array_data,
              customfield1:'Custom Field 1 Data',
              customfield2:'Custom Field 2 Data',
              customfield3:'Custom Field 3 Data',
              customfieldlabel1:'Custom Field 1',
              customfieldlabel2:'Custom Field 2',
              customfieldlabel3:'Custom Field 3',
              applied : "",
              showFX:"AUD",
              comment:"Sales Order Template Preview",
            };
  
        }

        object_invoce.push(item_invoices);
        $("#templatePreviewModal .field_payment").show();
        $("#templatePreviewModal .field_amount").show();
        if (number == 1) {
          updateTemplate1(object_invoce);
        } else if (number == 2) {
          updateTemplate2(object_invoce);
        } else {
          updateTemplate3(object_invoce);
        }

        saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);
    }


    //show suppliers order  info with DummyData
    function showSuppliers(template_title,number) {
        object_invoce = [];
        
        var array_data = [];
      
        array_data.push([
            "30/03/2022",
            "Bill",
            "298",
            "$900.00",
            "$900.00",
            "$0.00",
        ]);

        let item_supplier = '';
        if(number == 1)
        {
               item_supplier = {
                o_url: "vs1cloud.com",
                o_name: "Sample Company",
                o_address: "123 street",
                o_city: "Los Angeles",
                o_state: "Califonia 12345",
                o_reg: "",
                o_abn: "56789051234",
                o_phone: "25151944",
                title: 'Supplier Payment',
                value:"287",
                date: "11/04/2022",
                invoicenumber: "",
                refnumber: "67886",
                pqnumber: "",
                duedate: "",
                paylink: "",
                supplier_type: "Supplier",
                supplier_name : "Brand New Company",
                supplier_addr : "",
                fields: {
                  "Date": ["15", "left"],
                  "Type": ["15", "left"],
                  "No": ["10", "left"],
                  "Amount": ["15", "right"],
                  "Due": ["15", "right"],
                  "Paid": ["15", "right"],
                  "Outstanding": ["15", "right"]
                },
                subtotal : "",
                gst : "",
                total : "",
                paid_amount : "",
                bal_due : "",
                bsb : "",
                account : "",
                swift : "",
                data: array_data,
                applied : "",
                customfield1:'NA',
                customfield2:'NA',
                customfield3:'NA',
                customfieldlabel1:'NA',
                customfieldlabel2:'NA',
                customfieldlabel3:'NA',
                showFX:'',
                comment:"Supplier Payment Preview"
                
              };
        }
        else if(number == 2)
        {
            item_supplier = {
              o_url: "vs1cloud.com",
              o_name: "Sample Company",
              o_address: "123 street",
              o_city: "Los Angeles",
              o_state: "Califonia 12345",
              o_reg: "",
              o_abn: "56789051234",
              o_phone: "25151944",
              title: 'Supplier Payment',
              value:"287",
              date: "11/04/2022",
              invoicenumber: "",
              refnumber: "67886",
              pqnumber: "",
              duedate: "",
              paylink: "",
              supplier_type: "Supplier",
              supplier_name : "Brand New Company",
              supplier_addr : "",
              fields: {
                "Date": ["15", "left"],
                "Type": ["15", "left"],
                "No": ["10", "left"],
                "Amount": ["15", "right"],
                "Due": ["15", "right"],
                "Paid": ["15", "right"],
                "Outstanding": ["15", "right"]
              },
              subtotal : "",
              gst : "",
              total : "",
              paid_amount : "",
              bal_due : "",
              bsb : "",
              account : "",
              swift : "",
              data: array_data,
              applied : "",
              customfield1:'customfield1 data',
              customfield2:'customfield2 data',
              customfield3:'customfield3 data',
              customfieldlabel1:'customfield1',
              customfieldlabel2:'customfield2',
              customfieldlabel3:'customfield3 ',
              showFX:'',
              comment:"Supplier Payment Preview"
            };
        }
        else
        {
           item_supplier = {
                o_url: "vs1cloud.com",
                o_name: "Sample Company",
                o_address: "123 street",
                o_city: "Los Angeles",
                o_state: "Califonia 12345",
                o_reg: "",
                o_abn: "56789051234",
                o_phone: "25151944",
                title: 'Supplier Payment',
                value:"287",
                date: "11/04/2022",
                invoicenumber: "",
                refnumber: "67886",
                pqnumber: "",
                duedate: "",
                paylink: "",
                supplier_type: "Supplier",
                supplier_name : "Brand New Company",
                supplier_addr : "",
                fields: {
                  "Date": ["15", "left"],
                  "Type": ["15", "left"],
                  "No": ["10", "left"],
                  "Amount": ["15", "right"],
                  "Due": ["15", "right"],
                  "Paid": ["15", "right"],
                  "Outstanding": ["15", "right"]
                },
                subtotal : "",
                gst : "",
                total : "",
                paid_amount : "",
                bal_due : "",
                bsb : "",
                account : "",
                swift : "",
                data: array_data,
                applied : "",
                customfield1:'customfield1 data',
                customfield2:'customfield2 data',
                customfield3:'customfield3 data',
                customfieldlabel1:'customfield1',
                customfieldlabel2:'customfield2',
                customfieldlabel3:'customfield3 ',
                showFX:'AUD',
                comment:"Supplier Payment Preview"
          };

        }



        object_invoce.push(item_supplier);

        $("#templatePreviewModal .field_payment").show();
        $("#templatePreviewModal .field_amount").show();


        if (number == 1) {
          updateTemplate1(object_invoce);
        } else if (number == 2) {
          updateTemplate2(object_invoce);
        } else {
          updateTemplate3(object_invoce);
        }

        saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);
    }

    function showStatements(template_title,number)
    {
        object_invoce = [];
        var array_data = [];
            array_data.push([
              "30/03/2022",
              "Statements",
              "298",
              "$900.00",
              "$900.00",
              "$0.00",
            ]);
        let item_statement = '';
        if(number == 1)
        {
           item_statement = {
            o_url: "vs1cloud.com",
            o_name: "Sample Company",
            o_address: "123 street",
            o_city: "Los Angeles",
            o_state: "Califonia 12345",
            o_reg: "",
            o_abn: "56789051234",
            o_phone: "25151944",
            title: 'Statement',
            value: "287",
            date: "11/04/2022",
            invoicenumber: "",
            refnumber: "67886",
            pqnumber: "",
            duedate: "",
            paylink: "",
            supplier_type: "Customer",
            supplier_name : "Brand New Company",
            supplier_addr : "",
            fields: {
              "Date": ["15", "left"],
              "Type": ["15", "left"],
              "No": ["10", "left"],
              "Amount": ["15", "right"],
              "Due": ["15", "right"],
              "Paid": ["15", "right"],
              "Outstanding": ["15", "right"]
            },
            subtotal : "$0.00",
            gst : "$0.00",
            total : "$0.00",
            paid_amount : "$0.00",
            bal_due : "$0.00",
            bsb : "",
            account : "",
            swift : "",
            data: array_data,
            applied : "",
            customfield1:'NA',
            customfield2:'NA',
            customfield3:'NA',
            customfieldlabel1:'NA',
            customfieldlabel2:'NA',
            customfieldlabel3:'NA',
            showFX:'',
            comment:"Statement Template Preview"
          };

        }
        else if(number == 2)
        {
           item_statement = {
            o_url: "vs1cloud.com",
            o_name: "Sample Company",
            o_address: "123 street",
            o_city: "Los Angeles",
            o_state: "Califonia 12345",
            o_reg: "",
            o_abn: "56789051234",
            o_phone: "25151944",
            title: 'Statement',
            value: "287",
            date: "11/04/2022",
            invoicenumber: "",
            refnumber: "67886",
            pqnumber: "",
            duedate: "",
            paylink: "",
            supplier_type: "Customer",
            supplier_name : "Brand New Company",
            supplier_addr : "",
            fields: {
              "Date": ["15", "left"],
              "Type": ["15", "left"],
              "No": ["10", "left"],
              "Amount": ["15", "right"],
              "Due": ["15", "right"],
              "Paid": ["15", "right"],
              "Outstanding": ["15", "right"]
            },
            subtotal : "$0.00",
            gst : "$0.00",
            total : "$0.00",
            paid_amount : "$0.00",
            bal_due : "$0.00",
            bsb : "",
            account : "",
            swift : "",
            data: array_data,
            applied : "",
            customfield1:'customfield1 data',
            customfield2:'customfield2 data',
            customfield3:'customfield3 data',
            customfieldlabel1:'customfield1',
            customfieldlabel2:'customfield2',
            customfieldlabel3:'customfield3',
            showFX:'',
            comment:"Statement Template Preview"
          };

        }
        else
        {
           item_statement = {
            o_url: "vs1cloud.com",
            o_name: "Sample Company",
            o_address: "123 street",
            o_city: "Los Angeles",
            o_state: "Califonia 12345",
            o_reg: "",
            o_abn: "56789051234",
            o_phone: "25151944",
            title: 'Statement',
            value: "287",
            date: "11/04/2022",
            invoicenumber: "",
            refnumber: "67886",
            pqnumber: "",
            duedate: "",
            paylink: "",
            supplier_type: "Customer",
            supplier_name : "Brand New Company",
            supplier_addr : "",
            fields: {
              "Date": ["15", "left"],
              "Type": ["15", "left"],
              "No": ["10", "left"],
              "Amount": ["15", "right"],
              "Due": ["15", "right"],
              "Paid": ["15", "right"],
              "Outstanding": ["15", "right"]
            },
            subtotal : "$0.00",
            gst : "$0.00",
            total : "$0.00",
            paid_amount : "$0.00",
            bal_due : "$0.00",
            bsb : "",
            account : "",
            swift : "",
            data: array_data,
            applied : "",
            customfield1:'customfield1 data',
            customfield2:'customfield2 data',
            customfield3:'customfield3 data',
            customfieldlabel1:'customfield1',
            customfieldlabel2:'customfield2',
            customfieldlabel3:'customfield3',
            showFX:'AUD',
            comment:"Statement Template Preview"
          };


        }
      

        object_invoce.push(item_statement);

        $("#templatePreviewModal .field_payment").show();
        $("#templatePreviewModal .field_amount").show();


        if (number == 1) {
          updateTemplate1(object_invoce);
        } else if (number == 2) {
          updateTemplate2(object_invoce);
        } else {
          updateTemplate3(object_invoce);
        }

        saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);

    }

    function showDeliveryDocket(template_title,number)
    {

      object_invoce = [];
      var array_data = [];
      array_data.push([
        "Fanta Grape Can",
        "Fanta Grape Can SODA",
        "1",

      ]);
  
      array_data.push([
          "Fanta Grape Can",
          "Fanta Grape Can SODA",
          "1",
    
        ]);
      let item_invoices = '';
      if(number == 1)
      {
          item_invoices = {

              o_url: 'vs1cloud.com',
              o_name: "Sample Company",
              o_address:"123 street",
              o_city: "Los Angeles",
              o_state: "Califonia 12345",
              o_reg:"",
              o_abn: "56789051234",
              o_phone:"Phone : 25151944",
              title: 'Delivery Docket',
              value: '751',
              date: '25/05/2022',
              invoicenumber:'751',
              refnumber: '1234',
              pqnumber: '1244',
              duedate: '07/07/2022',
              paylink: "Pay Now",
              supplier_type: "Customer",
              supplier_name : "Amar",
              supplier_addr : "Gwalior\nMadhya Pradesh",
              fields: {
                "Product Name" : ["40", "left"],
                "Description" : ["40", "left"],
                "Qty" : ["20", "right"]
              },
              subtotal :"",
              gst : "",
              total : "",
              paid_amount : "",
              bal_due : "",
              bsb : "",
              account : "",
              swift : "",
              data: array_data,
              customfield1:'NA',
              customfield2:'NA',
              customfield3:'NA',
              customfieldlabel1:'NA',
              customfieldlabel2:'NA',
              customfieldlabel3:'NA',
              applied : "",
              showFX:"",
              comment:"Delivery Docket Template Preview",
          };

      }
      else if(number == 2)
      {
          item_invoices = {
            o_url: 'vs1cloud.com',
            o_name: "Sample Company",
            o_address:"123 street",
            o_city: "Los Angeles",
            o_state: "Califonia 12345",
            o_reg:"",
            o_abn: "56789051234",
            o_phone:"Phone : 25151944",
            title: 'Delivery Docket',
            value: '751',
            date: '25/05/2022',
            invoicenumber:'751',
            refnumber: '1234',
            pqnumber: '1244',
            duedate: '07/07/2022',
            paylink: "Pay Now",
            supplier_type: "Customer",
            supplier_name : "Amar",
            supplier_addr : "Gwalior\nMadhya Pradesh",
            fields: {
              "Product Name" : ["40", "left"],
              "Description" : ["40", "left"],
              "Qty" : ["20", "right"]
            },
            subtotal :"",
            gst : "",
            total : "",
            paid_amount : "",
            bal_due : "",
            bsb : "",
            account : "",
            swift : "",
            data: array_data,
            customfield1:'Custom Field 1 Data',
            customfield2:'Custom Field 2 Data',
            customfield3:'Custom Field 3 Data',
            customfieldlabel1:'Custom Field 1',
            customfieldlabel2:'Custom Field 2',
            customfieldlabel3:'Custom Field 3',
            applied : "",
            showFX:"",
            comment:"Delivery Docket Template Preview",
          };

      }
      else
      {
          item_invoices = {
            o_url: 'vs1cloud.com',
            o_name: "Sample Company",
            o_address:"123 street",
            o_city: "Los Angeles",
            o_state: "Califonia 12345",
            o_reg:"",
            o_abn: "56789051234",
            o_phone:"Phone : 25151944",
            title: 'Delivery Docket',
            value: '751',
            date: '25/05/2022',
            invoicenumber:'751',
            refnumber: '1234',
            pqnumber: '1244',
            duedate: '07/07/2022',
            paylink: "Pay Now",
            supplier_type: "Customer",
            supplier_name : "Amar",
            supplier_addr : "Gwalior\nMadhya Pradesh",
            fields: {
              "Product Name" : ["40", "left"],
              "Description" : ["40", "left"],
              "Qty" : ["20", "right"]
            },
            subtotal :"",
            gst : "",
            total : "",
            paid_amount : "",
            bal_due : "",
            bsb : "",
            account : "",
            swift : "",
            data: array_data,
            customfield1:'Custom Field 1 Data',
            customfield2:'Custom Field 2 Data',
            customfield3:'Custom Field 3 Data',
            customfieldlabel1:'Custom Field 1',
            customfieldlabel2:'Custom Field 2',
            customfieldlabel3:'Custom Field 3',
            applied : "",
            showFX:"",
            comment:"Delivery Docket Template Preview",
          };

      }
     
  
      object_invoce.push(item_invoices);
  
      $("#templatePreviewModal .field_payment").show();
      $("#templatePreviewModal .field_amount").show();
  
      if (number == 1) {
        updateTemplate1(object_invoce);
      } else if (number == 2) {
        updateTemplate2(object_invoce);
      } else {
        updateTemplate3(object_invoce);
      }

      saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);
    }

    function showJournalEntry(template_title, number) {
      object_invoce = [];
      var array_data = [];
      array_data.push([
        "Bank",
        "Bank",
        "$700.00",
        "$0.00",
      ]);
      array_data.push([
        "Bank Charges",
        "Bank Charges and Fees",
        "$0.00",
        "$700.00",
      ]);

      let item = '';
  

      if(number == 1)
      {
            item = {
              o_url: "vs1cloud.com",
              o_name: "Sample Company",
              o_address: "123 street",
              o_city: "Los Angeles",
              o_state: "Califonia 12345",
              o_reg: "",
              o_abn: "56789051234",
              o_phone: "Phone : 25151944",
              title: 'Journal Entry',
              value:'56',
              date: "09/05/2022",
              invoicenumber:'56',
              refnumber: "",
              pqnumber: "",
              duedate:"",
              paylink: "",
              supplier_type: "Supplier",
              supplier_name : "",
              supplier_addr : "ABC Company Test R\n123 Main Street\nBrooklyn New York 1234\nUnited States",
              fields: {
                "Account Name" : ["30", "left"],
                "Description" : ["40", "left"],
                "Credit (Ex)" : ["15", "right"],
                "Debit (Ex)" : ["15", "right"]
              },
              subtotal : "$700.00",
              gst : "$0.00",
              total : "$700.00",
              paid_amount : "$700.00",
              bal_due : "$0.00",
              bsb : "",
              account : "",
              swift : "",
              applied : "",
              data: array_data,
              customfield1:'NA',
              customfield2:'NA',
              customfield3:'NA',
              customfieldlabel1:'NA',
              customfieldlabel2:'NA',
              customfieldlabel3:'NA',
              showFX:"",
              comment:"Journal Template Preivew",
            };

      }
      else if(number == 2)
      {
            item = {
              o_url: "vs1cloud.com",
              o_name: "Sample Company",
              o_address: "123 street",
              o_city: "Los Angeles",
              o_state: "Califonia 12345",
              o_reg: "",
              o_abn: "56789051234",
              o_phone: "Phone : 25151944",
              title: 'Journal Entry',
              value:'56',
              date: "09/05/2022",
              invoicenumber:'56',
              refnumber: "",
              pqnumber: "",
              duedate:"",
              paylink: "",
              supplier_type: "Supplier",
              supplier_name : "",
              supplier_addr : "ABC Company Test R\n123 Main Street\nBrooklyn New York 1234\nUnited States",
              fields: {
                "Account Name" : ["30", "left"],
                "Description" : ["40", "left"],
                "Credit (Ex)" : ["15", "right"],
                "Debit (Ex)" : ["15", "right"]
              },
              subtotal : "$700.00",
              gst : "$0.00",
              total : "$700.00",
              paid_amount : "$700.00",
              bal_due : "$0.00",
              bsb : "",
              account : "",
              swift : "",
              applied : "",
              data: array_data,
              customfield1:'customfield1 data',
              customfield2:'customfield2 data',
              customfield3:'customfield3 data',
              customfieldlabel1:'customfield1',
              customfieldlabel2:'customfield2',
              customfieldlabel3:'customfield3',
              showFX:'',
              comment:"Journal Template Preivew",
            };
      }
      else{
        item = {
          o_url: "vs1cloud.com",
          o_name: "Sample Company",
          o_address: "123 street",
          o_city: "Los Angeles",
          o_state: "Califonia 12345",
          o_reg: "",
          o_abn: "56789051234",
          o_phone: "Phone : 25151944",
          title: 'Journal Entry',
          value:'56',
          date: "09/05/2022",
          invoicenumber:'56',
          refnumber: "",
          pqnumber: "",
          duedate:"",
          paylink: "",
          supplier_type: "Supplier",
          supplier_name : "Amar kumar",
          supplier_addr : "ABC Company Test R\n123 Main Street\nBrooklyn New York 1234\nUnited States",
          fields: {
            "Account Name" : ["30", "left"],
            "Description" : ["40", "left"],
            "Credit (Ex)" : ["15", "right"],
            "Debit (Ex)" : ["15", "right"]
          },
          subtotal : "$700.00",
          gst : "$0.00",
          total : "$700.00",
          paid_amount : "$700.00",
          bal_due : "$0.00",
          bsb : "",
          account : "",
          swift : "",
          applied : "",
          data: array_data,
          customfield1:'customfield1 data',
          customfield2:'customfield2 data',
          customfield3:'customfield3 data',
          customfieldlabel1:'customfield1',
          customfieldlabel2:'customfield2',
          customfieldlabel3:'customfield3',
          showFX:'AUD',
          comment:"Journal Template Preivew",

        };

      }
    
      object_invoce.push(item);
      $("#templatePreviewModal .field_payment").show();
      $("#templatePreviewModal .field_amount").show();
      if (number == 1) {
        updateTemplate1(object_invoce);
      } else if (number == 2) {
        updateTemplate2(object_invoce);
      } else {
        updateTemplate3(object_invoce);
      }

      saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);
    }

    function showDepositData(template_title, number) {
      object_invoce = [];
      var array_data = [];
      array_data.push([
        "Bank",
        "Cheque",
        "",
        "Received From",
        "-$900.00",
      ]);
      
      let item = '';
  

      if(number == 1)
      {
            item = {
              o_url: "vs1cloud.com",
              o_name: "Sample Company",
              o_address: "123 street",
              o_city: "Los Angeles",
              o_state: "Califonia 12345",
              o_reg: "",
              o_abn: "56789051234",
              o_phone: "Phone : 25151944",
              title: 'Deposit',
              value:'616',
              date: "04/10/2022",
              invoicenumber:'616',
              refnumber: "",
              pqnumber: "",
              duedate:"",
              paylink: "",
              supplier_type: "Supplier",
              supplier_name : "",
              supplier_addr : "ABC Company Test R\n123 Main Street\nBrooklyn New York 1234\nUnited States",
              fields: {
                "From Account" : ["20", "left"],
                "Payment Method" : ["20", "left"],
                "Reference No" : ["20", "left"],
                "Received From" : ["25", "left"],
                "Amount" : ["15", "right"]
              },
              subtotal : "-$900.00",
              gst : "$0.00",
              total : "-$900.00",
              paid_amount : "-$900.00",
              bal_due : "$0.00",
              bsb : "",
              account : "",
              swift : "",
              applied : "",
              data: array_data,
              customfield1:'NA',
              customfield2:'NA',
              customfield3:'NA',
              customfieldlabel1:'NA',
              customfieldlabel2:'NA',
              customfieldlabel3:'NA',
              showFX:"",
              comment:"Deposit Template Preivew",
            };

      }
      else if(number == 2)
      {
            item = {
              o_url: "vs1cloud.com",
              o_name: "Sample Company",
              o_address: "123 street",
              o_city: "Los Angeles",
              o_state: "Califonia 12345",
              o_reg: "",
              o_abn: "56789051234",
              o_phone: "Phone : 25151944",
              title: 'Deposit',
              value:'616',
              date: "04/10/2022",
              invoicenumber:'616',
              refnumber: "",
              pqnumber: "",
              duedate:"",
              paylink: "",
              supplier_type: "Supplier",
              supplier_name : "",
              supplier_addr : "ABC Company Test R\n123 Main Street\nBrooklyn New York 1234\nUnited States",
              fields: {
                "From Account" : ["20", "left"],
                "Payment Method" : ["20", "left"],
                "Reference No" : ["20", "left"],
                "Received From" : ["25", "left"],
                "Amount" : ["15", "right"]
              },
              subtotal : "-$900.00",
              gst : "$0.00",
              total : "-$900.00",
              paid_amount : "-$900.00",
              bal_due : "$0.00",
              bsb : "",
              account : "",
              swift : "",
              applied : "",
              data: array_data,
              customfield1:'customfield1 data',
              customfield2:'customfield2 data',
              customfield3:'customfield3 data',
              customfieldlabel1:'customfield1',
              customfieldlabel2:'customfield2',
              customfieldlabel3:'customfield3',
              showFX:'',
              comment:"Deposit Template Preivew",
            };
      }
      else{

          
        item = {
          o_url: "vs1cloud.com",
          o_name: "Sample Company",
          o_address: "123 street",
          o_city: "Los Angeles",
          o_state: "Califonia 12345",
          o_reg: "",
          o_abn: "56789051234",
          o_phone: "Phone : 25151944",
          title: 'Deposit',
          value:'616',
          date: "04/10/2022",
          invoicenumber:'616',
          refnumber: "",
          pqnumber: "",
          duedate:"",
          paylink: "",
          supplier_type: "Supplier",
          supplier_name : "Amar kumar",
          supplier_addr : "ABC Company Test R\n123 Main Street\nBrooklyn New York 1234\nUnited States",
          fields: {
            "From Account" : ["20", "left"],
            "Payment Method" : ["20", "left"],
            "Reference No" : ["20", "left"],
            "Received From" : ["25", "left"],
            "Amount" : ["15", "right"]
          },
          subtotal : "-$900.00",
          gst : "$0.00",
          total : "-$900.00",
          paid_amount : "-$900.00",
          bal_due : "$0.00",
          bsb : "",
          account : "",
          swift : "",
          applied : "",
          data: array_data,
          customfield1:'customfield1 data',
          customfield2:'customfield2 data',
          customfield3:'customfield3 data',
          customfieldlabel1:'customfield1',
          customfieldlabel2:'customfield2',
          customfieldlabel3:'customfield3',
          showFX:'AUD',
          comment:"Deposit Template Preivew",

        };

      }
    
      object_invoce.push(item);
      $("#templatePreviewModal .field_payment").show();
      $("#templatePreviewModal .field_amount").show();
      if (number == 1) {
        updateTemplate1(object_invoce);
      } else if (number == 2) {
        updateTemplate2(object_invoce);
      } else {
        updateTemplate3(object_invoce);
      }

      saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);
    }
    
    function showChequeData(template_title, number) {
      object_invoce = [];
      var array_data = [];
      array_data.push([
        "Opening Bal Equity",
        "Receipt Claim",
        "$0.00",
        "$900.00",
      ]);
      
      let item = '';
  
      if(number == 1)
      {
            item = {
              o_url: "vs1cloud.com",
              o_name: "Sample Company",
              o_address: "123 street",
              o_city: "Los Angeles",
              o_state: "Califonia 12345",
              o_reg: "",
              o_abn: "56789051234",
              o_phone: "Phone : 25151944",
              title: 'Cheque',
              value:'371',
              date: "04/10/2022",
              invoicenumber:'371',
              refnumber: "",
              pqnumber: "",
              duedate:"",
              paylink: "",
              supplier_type: "Supplier",
              supplier_name : "",
              supplier_addr : "ABC Company Test R\n123 Main Street\nBrooklyn New York 1234\nUnited States",
              fields: {
                "Account Name" : ["30", "left"],
                "Description" : ["40", "left"],
                "Tax" : ["15", "right"],
                "Amount" : ["15", "right"]
              },
              subtotal : "$900.00",
              gst : "$0.00",
              total : "900.00",
              paid_amount : "$0.00",
              bal_due : "$0.00",
              bsb : "",
              account : "",
              swift : "",
              applied : "",
              data: array_data,
              customfield1:'NA',
              customfield2:'NA',
              customfield3:'NA',
              customfieldlabel1:'NA',
              customfieldlabel2:'NA',
              customfieldlabel3:'NA',
              showFX:"",
              comment:"Cheque Template Preivew",
            };

      }
      else if(number == 2)
      {
            item = {
              o_url: "vs1cloud.com",
              o_name: "Sample Company",
              o_address: "123 street",
              o_city: "Los Angeles",
              o_state: "Califonia 12345",
              o_reg: "",
              o_abn: "56789051234",
              o_phone: "Phone : 25151944",
              title: 'Cheque',
              value:'371',
              date: "04/10/2022",
              invoicenumber:'371',
              refnumber: "",
              pqnumber: "",
              duedate:"",
              paylink: "",
              supplier_type: "Supplier",
              supplier_name : "",
              supplier_addr : "ABC Company Test R\n123 Main Street\nBrooklyn New York 1234\nUnited States",
              fields: {
                "Account Name" : ["30", "left"],
                "Description" : ["40", "left"],
                "Tax" : ["15", "right"],
                "Amount" : ["15", "right"]
              },
              subtotal : "$900.00",
              gst : "$0.00",
              total : "$900.00",
              paid_amount : "$0.00",
              bal_due : "$0.00",
              bsb : "",
              account : "",
              swift : "",
              applied : "",
              data: array_data,
              customfield1:'customfield1 data',
              customfield2:'customfield2 data',
              customfield3:'customfield3 data',
              customfieldlabel1:'customfield1',
              customfieldlabel2:'customfield2',
              customfieldlabel3:'customfield3',
              showFX:'',
              comment:"Cheque Template Preivew",
            };
      }
      else{
         
        item = {
          o_url: "vs1cloud.com",
          o_name: "Sample Company",
          o_address: "123 street",
          o_city: "Los Angeles",
          o_state: "Califonia 12345",
          o_reg: "",
          o_abn: "56789051234",
          o_phone: "Phone : 25151944",
          title: 'Cheque',
          value:'371',
          date: "04/10/2022",
          invoicenumber:'371',
          refnumber: "",
          pqnumber: "",
          duedate:"",
          paylink: "",
          supplier_type: "Supplier",
          supplier_name : "Amar kumar",
          supplier_addr : "ABC Company Test R\n123 Main Street\nBrooklyn New York 1234\nUnited States",
          fields: {
            "Account Name" : ["30", "left"],
            "Description" : ["40", "left"],
            "Tax" : ["15", "right"],
            "Amount" : ["15", "right"]
          },
          subtotal : "$900.00",
          gst : "$0.00",
          total : "$900.00",
          paid_amount : "$0.00",
          bal_due : "$0.00",
          bsb : "",
          account : "",
          swift : "",
          applied : "",
          data: array_data,
          customfield1:'customfield1 data',
          customfield2:'customfield2 data',
          customfield3:'customfield3 data',
          customfieldlabel1:'customfield1',
          customfieldlabel2:'customfield2',
          customfieldlabel3:'customfield3',
          showFX:'AUD',
          comment:"Cheque Template Preivew",

        };

      }
    
      object_invoce.push(item);
      $("#templatePreviewModal .field_payment").show();
      $("#templatePreviewModal .field_amount").show();
      if (number == 1) {
        updateTemplate1(object_invoce);
      } else if (number == 2) {
        updateTemplate2(object_invoce);
      } else {
        updateTemplate3(object_invoce);
      }

      saveTemplateFields("fields" + template_title , object_invoce[0]["fields"]);
    }

     templateObject.generateInvoiceData = function (template_title,number) {
     object_invoce = [];
     switch (template_title) {
      case "Bills":
        showBillData(template_title,number);
        break;

      case "Credits":
        showCreditData(template_title,number);
        break;

      case "Customer Payments":
        showCustomerPayment(template_title,number);
        break;

      
      case "Customer Statements":
        showCustomerStatments(template_title,number);
        break;  

      case "Invoices":
        showInvoice(template_title,number);
        break;

      case "Invoice Back Orders":
        showInvoiceBack(template_title,number);
        break;

      case "Purchase Orders":
        showPurchaseOrder(template_title,number);
        break;

      case "Quotes":
        showQuotes(template_title,number);
        break;

      case "Refunds":
        showRefund(template_title,number);
        break;

      case "Sales Orders":
        showSealsOrder(template_title,number);
        break;

      case "Supplier Payments":
        showSuppliers(template_title,number);
        break;
      
      case "Statements": 
        showStatements(template_title,number);
        break;
      
      case "Delivery Docket":
        showDeliveryDocket(template_title,number);
        break;

      case "Journal Entry":
        showJournalEntry(template_title, number);
        break;

      case "Deposits":
        showDepositData(template_title, number);
        break;

      case "Cheques":
        showChequeData(template_title, number);
        break;
    }

     };
  });

Template.templatesettings.helpers({
  getTemplateList: function () {
    return template_list;
  },

  getTemplateNumber: function () {
    let template_numbers = ["1", "2", "3"];
    return template_numbers;
  },
});

Template.templatesettings.events({

 'click #resetcards':function(){
 $('.fullScreenSpin').css('display','block');
 let emid = Session.get('mySessionEmployeeLoggedID');

 objDetails = {
                  "type":"TTemplateSettings",
                  "delete":true,
                  "fields":{
                    "EmployeeID":emid,
                  }
                }
  
 sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
  $('.fullScreenSpin').css('display','none');
   swal({
    title: 'Success',
    text: 'Template Setting Reset Successfully',
    type: 'success',
    showCancelButton: false,
    confirmButtonText: 'Done'

   }).then((result) => {
    if (result.value) {
      $('.fullScreenSpin').css('display','none');
    } else if (result.dismiss === 'cancel') {
      $('.fullScreenSpin').css('display','none');
    }
    });;


 }).catch(function (err) {
          $('.fullScreenSpin').css('display','none');
          swal({
          title: 'Oooops...',
          text: err,
          type: 'error',
          showCancelButton: false,
          confirmButtonText: 'Try Again'
          }).then((result) => {
                if (result.value) {

                } else if (result.dismiss === 'cancel') {

                }
          });

  });

},

'click .btnTopGlobalSave':function(){
  playSaveAudio();
  setTimeout(function(){
    $('.fullScreenSpin').css('display', 'inline-block');
    var bill = $('input[name="Bills"]:checked').val();
    var credits = $('input[name="Credits"]:checked').val();
    var customer_payment = $('input[name="Customer Payments"]:checked').val();
    var customer_statement = $('input[name="Customer Statements"]:checked').val();
    var invoices = $('input[name="Invoices"]:checked').val();
    var invoices_back_order = $('input[name="Invoice Back Orders"]:checked').val();
    var purchase_order = $('input[name="Purchase Orders"]:checked').val();
    var quotes = $('input[name="Quotes"]:checked').val();
    var refunds = $('input[name="Refunds"]:checked').val();
    var sales_orders = $('input[name="Sales Orders"]:checked').val();
    var supplier_payments = $('input[name="Supplier Payments"]:checked').val();
    var statements = $('input[name="Statements"]:checked').val();
    var delivery_docket = $('input[name="Delivery Docket"]:checked').val();
    var journal_entry = $('input[name="Journal Entry"]:checked').val();
    var deposits = $('input[name="Deposits"]:checked').val();
    var cheques = $('input[name="Cheques"]:checked').val();
    $('.fullScreenSpin').css('display','inline-block');
    let emid = Session.get('mySessionEmployeeLoggedID');
    let count = 0; 
    sideBarService.getTemplateNameandEmployeId("bill",emid,1).then(function (data) {
                            templateid = data.ttemplatesettings;
                            var id = templateid[0].fields.ID;    
                            objDetails =  {
                            type:"TTemplateSettings",
                            fields:{        
                                        ID:parseInt(id),                      
                                        EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                                        SettingName:"bill",
                                        GlobalRef:"bill",
                                        Description:$('input[name="Bills_1"]').val(),
                                        Template:"1",
                                        Active:bill == 1 ? true:false,
                                    }            
                             }
                        
                            sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {                      
                    
                            sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                            addVS1Data('TTemplateSettings', JSON.stringify(data)); 
                            count++;
                            if(count >= 48)
                            {
                               $('.fullScreenSpin').css('display', 'none');
                               swal({
                                title: 'Success',
                                text: 'Template Setting Saved Successfully.',
                                type: 'success',
                                showCancelButton: false,
                                confirmButtonText: 'Done'
                            
                                }).then((result) => {
                                      if (result.value) {
                                        
                                    
                                      }else if (result.dismiss === 'cancel') {
                                  
                                      }
                                });
                            }
                            });
                                      
                          }).catch(function (err) {
                          });
                        
    }).catch(function (err) {
                              
                              objDetails =  {
                              type:"TTemplateSettings",
                              fields:{                                                                  
                                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                                          SettingName:"bill",
                                          Description:$('input[name="Bills_1"]').val(),
                                          Template:"1",
                                          Active:bill == 1 ? true:false,
                                      }            
                              }
                          
                              sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
                                                        
                                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                                  addVS1Data('TTemplateSettings', JSON.stringify(data));  
                                  count++;
                                  if(count >= 48)
                                  {
                                          $('.fullScreenSpin').css('display', 'none');
                                          swal({
                                                  title: 'Success',
                                                  text: 'Template Setting Saved Successfully.',
                                                  type: 'success',
                                                  showCancelButton: false,
                                                  confirmButtonText: 'Done'
                                                          
                                                }).then((result) => {
                                                        if (result.value) {

                                                        }else if (result.dismiss === 'cancel') {
                                                          
                                                        }
                                                });
                                  }          
                                  });
                                                    
                                                  
                                  }).catch(function (err) {
                                                  
                                  });  
    
    });
        
     sideBarService.getTemplateNameandEmployeId("bill",emid,2).then(function (data) {
                            templateid = data.ttemplatesettings;
                            var id = templateid[0].fields.ID;                        
                            objDetails =  {
                            type:"TTemplateSettings",
                            fields:{        
                                        ID:parseInt(id),                      
                                        EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                                        SettingName:"bill",
                                        GlobalRef:"bill",
                                        Description:$('input[name="Bills_2"]').val(),
                                        Template:"2",
                                        Active:bill == 2 ? true:false,
                                    }            
                             }
                        
     sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));   
            count++;
            if(count >= 48)
            {
               $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }         
          });                 
                           
                        
     }).catch(function (err) { });
                        
     }).catch(function (err) {
                              
                              objDetails =  {
                              type:"TTemplateSettings",
                              fields:{                                                                  
                                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                                          SettingName:"bill",
                                          Description:$('input[name="Bills_2"]').val(),
                                          Template:"2",
                                          Active:bill == 2 ? true:false,
                                      }            
                              }
                          
                              sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
                          
                              sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                              addVS1Data('TTemplateSettings', JSON.stringify(data));  
                              count++;
                              if(count >= 48)
                              {
                                    $('.fullScreenSpin').css('display', 'none');
                                     swal({
                                      title: 'Success',
                                      text: 'Template Setting Saved Successfully.',
                                      type: 'success',
                                      showCancelButton: false,
                                      confirmButtonText: 'Done'
                                  
                                      }).then((result) => {
                                      if (result.value) {
                                         
                                    
                                      }else if (result.dismiss === 'cancel') {
                                  
                                      }
                                      });
                              }          
                              });
                          
                              }).catch(function (err) {  });  
    
     });

     sideBarService.getTemplateNameandEmployeId("bill",emid,3).then(function (data) {
     templateid = data.ttemplatesettings;
     var id = templateid[0].fields.ID;
  
      objDetails =  {
      type:"TTemplateSettings",
      fields:{        
                  ID:parseInt(id),                      
                  EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                  SettingName:"bill",
                  GlobalRef:"bill",
                  Description:$('input[name="Bills_3"]').val(),
                  Template:"3",
                  Active:bill == 3 ? true:false,
              }            
       }
  
       sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
              sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
              addVS1Data('TTemplateSettings', JSON.stringify(data));     
              count++;
              if(count >= 48)
              {
                  $('.fullScreenSpin').css('display', 'none');
                   swal({
                    title: 'Success',
                    text: 'Template Setting Saved Successfully.',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Done'
                
                    }).then((result) => {
                    if (result.value) {
                       
                  
                    }else if (result.dismiss === 'cancel') {
                
                    }
                    });
              }       
              });
     
  
       }).catch(function (err) {   
       });
    
     }).catch(function (err) {
              
            objDetails =  {
              type:"TTemplateSettings",
              fields:{                                                                  
                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                          SettingName:"bill",
                          Description:$('input[name="Bills_3"]').val(),
                          Template:"3",
                          Active:bill == 3 ? true:false,
                      }            
              }
          
              sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
             
                sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                  addVS1Data('TTemplateSettings', JSON.stringify(data)); 
                  count++;
                  if(count >= 48)
                  {
                    $('.fullScreenSpin').css('display', 'none');
                     swal({
                      title: 'Success',
                      text: 'Template Setting Saved Successfully.',
                      type: 'success',
                      showCancelButton: false,
                      confirmButtonText: 'Done'
                  
                      }).then((result) => {
                      if (result.value) {
                         
                    
                      }else if (result.dismiss === 'cancel') {
                  
                      }
                      });
                  }           
                });        
          
              }).catch(function (err) {
                    
              });  

     });
   
      // Credit Template Section 

      sideBarService.getTemplateNameandEmployeId("Credits",emid,1).then(function (data) {
      templateid = data.ttemplatesettings;
      var id = templateid[0].fields.ID;
    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                    ID:parseInt(id),                      
                    EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                    SettingName:"Credits",
                    GlobalRef:"Credits",
                    Description:$('input[name="Credits_1"]').val(),
                    Template:"1",
                    Active:credits == 1 ? true:false,
                }            
         }
    
         sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
        
         sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
         addVS1Data('TTemplateSettings', JSON.stringify(data));    
         count++;
         if(count >= 48)
         {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
          }        
         });
        
         }).catch(function (err) {
    
          
         });
    
      }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Credits",
                            Description:$('input[name="Credits_1"]').val(),
                            Template:"1",
                            Active:credits == 1 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
                
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));     
                    count++;
                    if(count >= 48)
                    {
                       $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                            if (result.value) {
                                                     
                            }else if (result.dismiss === 'cancel') {
                        
                            }
                        });
                    }       
                  });
                
            
                }).catch(function (err) {
            
           
                });  
  
      });

      sideBarService.getTemplateNameandEmployeId("Credits",emid,2).then(function (data) {
      templateid = data.ttemplatesettings;
      var id = templateid[0].fields.ID;
      objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                    ID:parseInt(id),                      
                    EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                    SettingName:"Credits",
                    GlobalRef:"Credits",
                    Description:$('input[name="Credits_2"]').val(),
                    Template:"2",
                    Active:credits == 2 ? true:false,
                }            
         }
    
      sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                addVS1Data('TTemplateSettings', JSON.stringify(data)); 
                count++;
                if(count >= 48)
                {
                   $('.fullScreenSpin').css('display', 'none');
                   swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'             
                  }).then((result) => {
                        if (result.value) {              
                        }else if (result.dismiss === 'cancel') {            
                        }
                  });
              }           
              });
         
    
        }).catch(function (err) {
          
        });
    
      }).catch(function (err) {
                
              objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Credits",
                            Description:$('input[name="Credits_2"]').val(),
                            Template:"2",
                            Active:credits == 2 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));    
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }        
                  });
                  
                }).catch(function (err) {
            
                 
                });  
  
      });


    
      sideBarService.getTemplateNameandEmployeId("Credits",emid,3).then(function (data) {
      templateid = data.ttemplatesettings;
      var id = templateid[0].fields.ID;
    
      objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                    ID:parseInt(id),                      
                    EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                    SettingName:"Credits",
                    GlobalRef:"Credits",
                    Description:$('input[name="Credits_3"]').val(),
                    Template:"3",
                    Active:credits == 3 ? true:false,
                }            
         }
    
         sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));    
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
             }        
          });
        
    
        }).catch(function (err) {
    
         
       
        });
    
      }).catch(function (err) {
                
              objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Credits",
                            Description:$('input[name="Credits_3"]').val(),
                            Template:"3",
                            Active:credits == 3 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));      
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }      
                });
                 
            
                }).catch(function (err) {
            
                  
              
                });  
  
      });
      //Customer Payments Template Section 
      sideBarService.getTemplateNameandEmployeId("Customer Payments",emid,1).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                     ID:parseInt(id),                      
                      EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                      SettingName:"Customer Payments",
                      GlobalRef:"Customer Payments",
                      Description:$('input[name="Customer Payments_1"]').val(),
                      Template:"1",
                      Active:customer_payment == 1 ? true:false,
                }            
         }
    
         sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
        
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));          
            count++;
            if(count >= 48)
            {
               $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                    if (result.value) {            
                    }else if (result.dismiss === 'cancel') {            
                    }
                });
            }  
          });
         }).catch(function (err) {      
         });
    
      }).catch(function (err) {
                
              objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Customer Payments",
                            Description:$('input[name="Customer Payments_1"]').val(),
                            Template:"1",
                            Active:customer_payment == 1 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));   
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }         
                  });
                  
            
                }).catch(function (err) {
            
                  
              
                });  
  
      });

      sideBarService.getTemplateNameandEmployeId("Customer Payments",emid,2).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                        ID:parseInt(id),                      
                        EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                        SettingName:"Customer Payments",
                        GlobalRef:"Customer Payments",
                        Description:$('input[name="Customer Payments_2"]').val(),
                        Template:"2",
                        Active:customer_payment == 2 ? true:false,
                }            
         }
    
         sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));      
            count++;
            if(count >= 48)
            {
               $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {      
                }else if (result.dismiss === 'cancel') {            
                }
                });
            }      
          });
           
          }).catch(function (err) {
          
          });
    
      }).catch(function (err) {
                
              objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                          SettingName:"Customer Payments",
                          Description:$('input[name="Customer Payments_2"]').val(),
                          Template:"2",
                          Active:customer_payment == 2 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                 sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));    
                    count++;
                    if(count >= 48)
                    {
                       $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                     }        
                  });
            
                }).catch(function (err) {
                             
              
                });  
  
      });

      sideBarService.getTemplateNameandEmployeId("Customer Payments",emid,3).then(function (data) {
      templateid = data.ttemplatesettings;
      var id = templateid[0].fields.ID;    
      objDetails =  {
      type:"TTemplateSettings",
      fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Customer Payments",
                            GlobalRef:"Customer Payments",
                            Description:$('input[name="Customer Payments_3"]').val(),
                            Template:"3",
                            Active:customer_payment == 3 ? true:false,
                }            
         }
    
      sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));    
            count++;
            if(count >= 48)
            {
               $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }        
           });
         
    
        }).catch(function (err) {
        
        });
    
      }).catch(function (err) {
                
               objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Customer Payments",
                            Description:$('input[name="Customer Payments_3"]').val(),
                            Template:"3",
                            Active:customer_payment == 3 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));      
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }      
                });
                  
                }).catch(function (err) {
         
                });  
  
      });

          
      // Customer Statements Template Section 

      sideBarService.getTemplateNameandEmployeId("Customer Statements",emid,1).then(function (data) {
      templateid = data.ttemplatesettings;
      var id = templateid[0].fields.ID;    
      objDetails =  {
      type:"TTemplateSettings",
      fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Customer Statements",
                            GlobalRef:"Customer Statements",
                            Description:$('input[name="Customer Statements_1"]').val(),
                            Template:"1",
                            Active:customer_statement == 1 ? true:false,
                }            
      }
      sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));      
            count++;
            if(count >= 48)
            {
               $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
        
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }      
           });
    
           }).catch(function (err) {
          
           });
    
      }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Customer Statements",
                            Description:$('input[name="Customer Statements_1"]').val(),
                            Template:"1",
                            Active:customer_statement == 1 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));  
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }          
                  });
                  
            
                 }).catch(function (err) {
            
                 });  
  
      });


      sideBarService.getTemplateNameandEmployeId("Customer Statements",emid,2).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Customer Statements",
                            GlobalRef:"Customer Statements",
                            Description:$('input[name="Customer Statements_2"]').val(),
                            Template:"2",
                            Active:customer_statement == 2 ? true:false,
                }            
         }
    
         sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
           sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
             addVS1Data('TTemplateSettings', JSON.stringify(data));     
             count++;
             if(count >= 48)
             {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
             }       
          });
        
    
         }).catch(function (err) {
         });
    
      }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Customer Statements",
                            Description:$('input[name="Customer Statements_2"]').val(),
                            Template:"2",
                            Active:customer_statement == 2 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                    sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));    
                    count++;
                    if(count >= 48)
                    {
                         $('.fullScreenSpin').css('display', 'none');
                         swal({
                          title: 'Success',
                          text: 'Template Setting Saved Successfully.',
                          type: 'success',
                          showCancelButton: false,
                          confirmButtonText: 'Done'
                      
                          }).then((result) => {
                          if (result.value) {
                            
                        
                          }else if (result.dismiss === 'cancel') {
                      
                          }
                          });
                    }        
                    });
            
                }).catch(function (err) {
            
                });  
  
      });

      sideBarService.getTemplateNameandEmployeId("Customer Statements",emid,3).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Customer Statements",
                            GlobalRef:"Customer Statements",
                            Description:$('input[name="Customer Statements_3"]').val(),
                            Template:"3",
                            Active:customer_statement == 3 ? true:false,
                }            
         }
    
         sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));   
            count++;
            if(count >= 48)
            {
               $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }         
          });
    
          }).catch(function (err) {
       
          });
    
      }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Customer Statements",
                            Description:$('input[name="Customer Statements_3"]').val(),
                            Template:"3",
                            Active:customer_statement == 3 ? true:false,
                        }            
                }
            
                 sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            

                    sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                       addVS1Data('TTemplateSettings', JSON.stringify(data));     
                       count++;
                       if(count >= 48)
                       {
                          $('.fullScreenSpin').css('display', 'none');
                          swal({
                            title: 'Success',
                            text: 'Template Setting Saved Successfully.',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                       
                           }).then((result) => {
                           if (result.value) {
                       
                           }else if (result.dismiss === 'cancel') {
                       
                           }
                           });
                       }       
                     });
            
                  }).catch(function (err) {

                  });  
  
      });

      // Invoices Template Section 

       sideBarService.getTemplateNameandEmployeId("Invoices",emid,1).then(function (data) {
       templateid = data.ttemplatesettings;
       var id = templateid[0].fields.ID;    
  
       objDetails =  {
       type:"TTemplateSettings",
       fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Invoices",
                            GlobalRef:"Invoices",
                            Description:$('input[name="Invoices_1"]').val(),
                            Template:"1",
                            Active:invoices == 1 ? true:false
                }          
         }
    
         sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));   
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }         
           });
         
    
        }).catch(function (err) {
    
         
       
        });
    
       }).catch(function (err) {
                
                 objDetails =  {
                 type:"TTemplateSettings",
                 fields:{                                                                  
                              EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                              SettingName:"Invoices",
                              Description:$('input[name="Invoices_1"]').val(),
                              Template:"1",
                              Active:invoices == 1 ? true:false,
                        }            
                 }
            
                  sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                    sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                      addVS1Data('TTemplateSettings', JSON.stringify(data));    
                      count++;
                      if(count >= 48)
                      {
                        $('.fullScreenSpin').css('display', 'none');
                         swal({
                          title: 'Success',
                          text: 'Template Setting Saved Successfully.',
                          type: 'success',
                          showCancelButton: false,
                          confirmButtonText: 'Done'
                      
                          }).then((result) => {
                          if (result.value) {
                             
                        
                          }else if (result.dismiss === 'cancel') {
                      
                          }
                          });
                      }        
                     });
                  
            
                  }).catch(function (err) {
            
                   
              
                  });  
  
       });

       sideBarService.getTemplateNameandEmployeId("Invoices",emid,2).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Invoices",
                            GlobalRef:"Invoices",
                            Description:$('input[name="Invoices_2"]').val(),
                            Template:"2",
                            Active:invoices == 2 ? true:false,
                }            
         }
    
         sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));        
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }    
          });
         
    
        }).catch(function (err) {
    
        
       
        });
    
       }).catch(function (err) {
                
                 objDetails =  {
                 type:"TTemplateSettings",
                 fields:{                                                                  
                              EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                              SettingName:"Invoices",
                              Description:$('input[name="Invoices_2"]').val(),
                              Template:"2",
                              Active:invoices == 2 ? true:false,
                        }            
                 }
            
                  sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                    sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                      addVS1Data('TTemplateSettings', JSON.stringify(data));  
                      count++;
                      if(count >= 48)
                      {
                        $('.fullScreenSpin').css('display', 'none');
                         swal({
                          title: 'Success',
                          text: 'Template Setting Saved Successfully.',
                          type: 'success',
                          showCancelButton: false,
                          confirmButtonText: 'Done'
                      
                          }).then((result) => {
                          if (result.value) {
                             
                        
                          }else if (result.dismiss === 'cancel') {
                      
                          }
                          });
                      }          
                    });
                   
            
                  }).catch(function (err) {
            
                   
              
                  });  
  
       });


       sideBarService.getTemplateNameandEmployeId("Invoices",emid,3).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Invoices",
                            GlobalRef:"Invoices",
                            Description:$('input[name="Invoices_3"]').val(),
                            Template:"3",
                            Active:invoices == 3 ? true:false,
                }            
         }
    
         sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));   
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }         
          });
         
    
        }).catch(function (err) {
    
        
       
        });
    
       }).catch(function (err) {
                
                 objDetails =  {
                 type:"TTemplateSettings",
                 fields:{                                                                  
                              EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                              SettingName:"Invoices",
                              Description:$('input[name="Invoices_3"]').val(),
                              Template:"3",
                              Active:invoices == 3 ? true:false,
                        }            
                 }
            
                  sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                    sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                      addVS1Data('TTemplateSettings', JSON.stringify(data));   
                      count++;
                      if(count >= 48)
                      {
                        $('.fullScreenSpin').css('display', 'none');
                         swal({
                          title: 'Success',
                          text: 'Template Setting Saved Successfully.',
                          type: 'success',
                          showCancelButton: false,
                          confirmButtonText: 'Done'
                      
                          }).then((result) => {
                          if (result.value) {
                             
                        
                          }else if (result.dismiss === 'cancel') {
                      
                          }
                          });
                      }         
                    });
                  
            
                  }).catch(function (err) {
            
                  
              
                  });  
  
       });

       // Invoice Back Orders Template Section 

        sideBarService.getTemplateNameandEmployeId("Invoice Back Orders",emid,1).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
          type:"TTemplateSettings",
          fields:{        
                              ID:parseInt(id),                      
                              EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                              SettingName:"Invoice Back Orders",
                              GlobalRef:"Invoice Back Orders",
                              Description:$('input[name="Invoice Back Orders_1"]').val(),
                              Template:"1",
                              Active:invoices_back_order == 1 ? true:false,
                  }            
          }
      
          sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
      
            sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
              addVS1Data('TTemplateSettings', JSON.stringify(data));    
              count++;
              if(count >= 48)
              {
                $('.fullScreenSpin').css('display', 'none');
                 swal({
                  title: 'Success',
                  text: 'Template Setting Saved Successfully.',
                  type: 'success',
                  showCancelButton: false,
                  confirmButtonText: 'Done'
              
                  }).then((result) => {
                  if (result.value) {
                     
                
                  }else if (result.dismiss === 'cancel') {
              
                  }
                  });
              }        
            });
         
      
          }).catch(function (err) {
      
         
        
          });
      
        }).catch(function (err) {
                  
                  objDetails =  {
                  type:"TTemplateSettings",
                  fields:{                                                                  
                                EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                                SettingName:"Invoice Back Orders",
                                Description:$('input[name="Invoice Back Orders_1"]').val(),
                                Template:"1",
                                Active:invoices_back_order == 1 ? true:false,
                          }            
                  }
              
                    sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
              
                      sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                        addVS1Data('TTemplateSettings', JSON.stringify(data));   
                        count++;
                        if(count >= 48)
                        {
                          $('.fullScreenSpin').css('display', 'none');
                           swal({
                            title: 'Success',
                            text: 'Template Setting Saved Successfully.',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                        
                            }).then((result) => {
                            if (result.value) {
                               
                          
                            }else if (result.dismiss === 'cancel') {
                        
                            }
                            });
                        }         
                       });
              
                    }).catch(function (err) {
              
                      
                
                    });  

        });


        sideBarService.getTemplateNameandEmployeId("Invoice Back Orders",emid,2).then(function (data) {
          templateid = data.ttemplatesettings;
          var id = templateid[0].fields.ID;    
          objDetails =  {
          type:"TTemplateSettings",
          fields:{        
                              ID:parseInt(id),                      
                              EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                              SettingName:"Invoice Back Orders",
                              GlobalRef:"Invoice Back Orders",
                              Description:$('input[name="Invoice Back Orders_2"]').val(),
                              Template:"2",
                              Active:invoices_back_order == 2 ? true:false,
                  }            
          }
      
          sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
      
            sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
              addVS1Data('TTemplateSettings', JSON.stringify(data));    
              count++;
              if(count >= 48)
              {
                $('.fullScreenSpin').css('display', 'none');
                 swal({
                  title: 'Success',
                  text: 'Template Setting Saved Successfully.',
                  type: 'success',
                  showCancelButton: false,
                  confirmButtonText: 'Done'
              
                  }).then((result) => {
                  if (result.value) {
                     
                
                  }else if (result.dismiss === 'cancel') {
              
                  }
                  });
              }        
            });
      
          }).catch(function (err) {
      
          
        
          });
      
        }).catch(function (err) {
                  
                  objDetails =  {
                  type:"TTemplateSettings",
                  fields:{                                                                  
                              EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                              SettingName:"Invoice Back Orders",
                              Description:$('input[name="Invoice Back Orders_2"]').val(),
                              Template:"2",
                              Active:invoices_back_order == 2 ? true:false,
                          }            
                  }
              
                    sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
              
                      sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                        addVS1Data('TTemplateSettings', JSON.stringify(data));    
                        count++;
                        if(count >= 48)
                        {
                          $('.fullScreenSpin').css('display', 'none');
                           swal({
                            title: 'Success',
                            text: 'Template Setting Saved Successfully.',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                        
                            }).then((result) => {
                            if (result.value) {
                               
                          
                            }else if (result.dismiss === 'cancel') {
                        
                            }
                            });
                        }        
                       });
              
                    }).catch(function (err) {
              
                      
                
                    });  

        });

        sideBarService.getTemplateNameandEmployeId("Invoice Back Orders",emid,3).then(function (data) {
          templateid = data.ttemplatesettings;
          var id = templateid[0].fields.ID;    
          objDetails =  {
          type:"TTemplateSettings",
          fields:{        
                              ID:parseInt(id),                      
                              EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                              SettingName:"Invoice Back Orders",
                              GlobalRef:"Invoice Back Orders",
                              Description:$('input[name="Invoice Back Orders_3"]').val(),
                              Template:"3",
                              Active:invoices_back_order == 3 ? true:false,
                  }            
          }
      
          sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
      
            sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
              addVS1Data('TTemplateSettings', JSON.stringify(data));   
              count++;
              if(count >= 48)
              {
                $('.fullScreenSpin').css('display', 'none');
                 swal({
                  title: 'Success',
                  text: 'Template Setting Saved Successfully.',
                  type: 'success',
                  showCancelButton: false,
                  confirmButtonText: 'Done'
              
                  }).then((result) => {
                  if (result.value) {
                     
                
                  }else if (result.dismiss === 'cancel') {
              
                  }
                  });
              }         
            });
          
      
          }).catch(function (err) {
      
          
        
          });
      
        }).catch(function (err) {
                  
                  objDetails =  {
                  type:"TTemplateSettings",
                  fields:{                                                                  
                              EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                              SettingName:"Invoice Back Orders",
                              Description:$('input[name="Invoice Back Orders_3"]').val(),
                              Template:"3",
                              Active:invoices_back_order == 3 ? true:false,
                          }            
                  }
              
                    sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
              
                      sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                        addVS1Data('TTemplateSettings', JSON.stringify(data));   
                        count++;
                        if(count >= 48)
                        {
                          $('.fullScreenSpin').css('display', 'none');
                           swal({
                            title: 'Success',
                            text: 'Template Setting Saved Successfully.',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                        
                            }).then((result) => {
                            if (result.value) {
                               
                          
                            }else if (result.dismiss === 'cancel') {
                        
                            }
                            });
                        }         
                       });
                    
              
                    }).catch(function (err) {
              
                      
                    });  

        });

     // Purchase Orders Template Section 
        sideBarService.getTemplateNameandEmployeId("Purchase Orders",emid,1).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Purchase Orders",
                            GlobalRef:"Purchase Orders",
                            Description:$('input[name="Purchase Orders_1"]').val(),
                            Template:"1",
                            Active:purchase_order == 1 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));   
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }         
          });
         
    
        }).catch(function (err) {
    
          
      
        });
    
        }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Purchase Orders",
                            Description:$('input[name="Purchase Orders_1"]').val(),
                            Template:"1",
                            Active:purchase_order == 1 ? true:false,
                        }            
                }
            
                  sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                    sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                      addVS1Data('TTemplateSettings', JSON.stringify(data));   
                      count++;
                      if(count >= 48)
                      {
                        $('.fullScreenSpin').css('display', 'none');
                         swal({
                          title: 'Success',
                          text: 'Template Setting Saved Successfully.',
                          type: 'success',
                          showCancelButton: false,
                          confirmButtonText: 'Done'
                      
                          }).then((result) => {
                          if (result.value) {
                             
                        
                          }else if (result.dismiss === 'cancel') {
                      
                          }
                          });
                      }         
                    });
                  
                  }).catch(function (err) {
            
                    
              
                  });  

        });


      sideBarService.getTemplateNameandEmployeId("Purchase Orders",emid,2).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Purchase Orders",
                            GlobalRef:"Purchase Orders",
                            Description:$('input[name="Purchase Orders_2"]').val(),
                            Template:"2",
                            Active:purchase_order == 2 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));   
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }         
          });
          
    
        }).catch(function (err) {
    
          
      
        });
    
      }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                              EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                              SettingName:"Purchase Orders",
                              Description:$('input[name="Purchase Orders_2"]').val(),
                              Template:"2",
                              Active:purchase_order == 2 ? true:false,
                        }            
                }
            
                  sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                    sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                      addVS1Data('TTemplateSettings', JSON.stringify(data));    
                      count++;
                      if(count >= 48)
                      {
                        $('.fullScreenSpin').css('display', 'none');
                         swal({
                          title: 'Success',
                          text: 'Template Setting Saved Successfully.',
                          type: 'success',
                          showCancelButton: false,
                          confirmButtonText: 'Done'
                      
                          }).then((result) => {
                          if (result.value) {
                             
                        
                          }else if (result.dismiss === 'cancel') {
                      
                          }
                          });
                      }        
                    });
                  
            
                  }).catch(function (err) {
            
                    
              
                  });  

      });


      sideBarService.getTemplateNameandEmployeId("Purchase Orders",emid,3).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Purchase Orders",
                            GlobalRef:"Purchase Orders",
                            Description:$('input[name="Purchase Orders_3"]').val(),
                            Template:"3",
                            Active:purchase_order == 3 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));     
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }       
          });
    
        }).catch(function (err) {
    
          
      
        });
    
      }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                              EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                              SettingName:"Purchase Orders",
                              Description:$('input[name="Purchase Orders_3"]').val(),
                              Template:"3",
                              Active:purchase_order == 3 ? true:false,
                        }            
                }
            
                  sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                    sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                      addVS1Data('TTemplateSettings', JSON.stringify(data));   
                      count++;
                      if(count >= 48)
                      {
                        $('.fullScreenSpin').css('display', 'none');
                         swal({
                          title: 'Success',
                          text: 'Template Setting Saved Successfully.',
                          type: 'success',
                          showCancelButton: false,
                          confirmButtonText: 'Done'
                      
                          }).then((result) => {
                          if (result.value) {
                             
                        
                          }else if (result.dismiss === 'cancel') {
                      
                          }
                          });
                      }         
                    });
            
                  }).catch(function (err) {
            
                    
              
                  });  

      });

      // Quotes  Template Section 

      sideBarService.getTemplateNameandEmployeId("Quotes",emid,1).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Quotes",
                            GlobalRef:"Quotes",
                            Description:$('input[name="Quotes_1"]').val(),
                            Template:"1",
                            Active:quotes == 1 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));   
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }         
           });
    
        }).catch(function (err) {
    
         
      
        });
    
      }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Quotes",
                            Description:$('input[name="Quotes_1"]').val(),
                            Template:"1",
                            Active:quotes == 1 ? true:false,
                        }            
                }
            
                  sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                    sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                      addVS1Data('TTemplateSettings', JSON.stringify(data));  
                      count++;
                      if(count >= 48)
                      {
                        $('.fullScreenSpin').css('display', 'none');
                         swal({
                          title: 'Success',
                          text: 'Template Setting Saved Successfully.',
                          type: 'success',
                          showCancelButton: false,
                          confirmButtonText: 'Done'
                      
                          }).then((result) => {
                          if (result.value) {
                             
                        
                          }else if (result.dismiss === 'cancel') {
                      
                          }
                          });
                      }          
                    });
                 
            
                  }).catch(function (err) {
            
                  
              
                  });  

      });


      sideBarService.getTemplateNameandEmployeId("Quotes",emid,2).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Quotes",
                            GlobalRef:"Quotes",
                            Description:$('input[name="Quotes_2"]').val(),
                            Template:"2",
                            Active:quotes == 2 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));  
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }          
          });
          
    
        }).catch(function (err) {
    
         
      
        });
    
      }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                              EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                              SettingName:"Quotes",
                              Description:$('input[name="Quotes_2"]').val(),
                              Template:"2",
                              Active:quotes == 2 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));    
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }        
                  });
                    
            
                }).catch(function (err) {
            
                    
              
                });  

      });


      sideBarService.getTemplateNameandEmployeId("Quotes",emid,3).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Quotes",
                            GlobalRef:"Quotes",
                            Description:$('input[name="Quotes_3"]').val(),
                            Template:"3",
                            Active:quotes == 3 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));  
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }          
          });
          
    
        }).catch(function (err) {
    
          
      
        });
    
      }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Quotes",
                            Description:$('input[name="Quotes_3"]').val(),
                            Template:"3",
                            Active:quotes == 3 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data)); 
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }           
                  });
                    
            
                }).catch(function (err) {
            
                    
              
                });  

      });

     // Refunds  Template Section 

      sideBarService.getTemplateNameandEmployeId("Refunds",emid,1).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Refunds",
                            GlobalRef:"Refunds",
                            Description:$('input[name="Refunds_1"]').val(),
                            Template:"1",
                            Active:refunds == 1 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));  
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }          
           });
    
        }).catch(function (err) {
    
          
      
        });
    
      }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Refunds",
                            Description:$('input[name="Refunds_1"]').val(),
                            Template:"1",
                            Active:refunds == 1 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data)); 
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }           
                   });
                    
            
                }).catch(function (err) {
            
                    
              
                });  

      });


      sideBarService.getTemplateNameandEmployeId("Refunds",emid,2).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Refunds",
                            GlobalRef:"Refunds",
                            Description:$('input[name="Refunds_2"]').val(),
                            Template:"2",
                            Active:refunds == 2 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));    
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }        
          });
         
    
        }).catch(function (err) {
    
         
        });
    
      }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Refunds",
                            Description:$('input[name="Refunds_2"]').val(),
                            Template:"2",
                            Active:refunds == 2 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));   
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }         
                  });
                   
            
                }).catch(function (err) {
            
                    
              
                });  

      });


      sideBarService.getTemplateNameandEmployeId("Refunds",emid,3).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Refunds",
                            GlobalRef:"Refunds",
                            Description:$('input[name="Refunds_3"]').val(),
                            Template:"3",
                            Active:refunds == 3 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));   
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }         
          });
          
    
        }).catch(function (err) {
    
          
      
        });
    
      }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Refunds",
                            Description:$('input[name="Refunds_3"]').val(),
                            Template:"3",
                            Active:refunds == 3 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data)); 
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }           
                  });
            
                }).catch(function (err) {
            
                   
              
                });  

      });

     // Sales Orders  Template Section 

     sideBarService.getTemplateNameandEmployeId("Sales Orders",emid,1).then(function (data) {
      templateid = data.ttemplatesettings;
      var id = templateid[0].fields.ID;    
      objDetails =  {
      type:"TTemplateSettings",
      fields:{        
                          ID:parseInt(id),                      
                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                          SettingName:"Sales Orders",
                          GlobalRef:"Sales Orders",
                          Description:$('input[name="Sales Orders_1"]').val(),
                          Template:"1",
                          Active:sales_orders == 1 ? true:false,
              }            
      }
  
      sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
  
        sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
          addVS1Data('TTemplateSettings', JSON.stringify(data));   
          count++;
          if(count >= 48)
          {
            $('.fullScreenSpin').css('display', 'none');
             swal({
              title: 'Success',
              text: 'Template Setting Saved Successfully.',
              type: 'success',
              showCancelButton: false,
              confirmButtonText: 'Done'
          
              }).then((result) => {
              if (result.value) {
                 
            
              }else if (result.dismiss === 'cancel') {
          
              }
              });
          }         
        });
       
  
      }).catch(function (err) {
  
     
    
      });
  
     }).catch(function (err) {
              
              objDetails =  {
              type:"TTemplateSettings",
              fields:{                                                                  
                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                          SettingName:"Sales Orders",
                          Description:$('input[name="Sales Orders_1"]').val(),
                          Template:"1",
                          Active:sales_orders == 1 ? true:false,
                      }            
              }
          
              sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
          
                sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                  addVS1Data('TTemplateSettings', JSON.stringify(data));
                  count++;
                  if(count >= 48)
                  {
                    $('.fullScreenSpin').css('display', 'none');
                     swal({
                      title: 'Success',
                      text: 'Template Setting Saved Successfully.',
                      type: 'success',
                      showCancelButton: false,
                      confirmButtonText: 'Done'
                  
                      }).then((result) => {
                      if (result.value) {
                         
                    
                      }else if (result.dismiss === 'cancel') {
                  
                      }
                      });
                  }            
                });
          
              }).catch(function (err) {
          
                
            
              });  

     });
    
     sideBarService.getTemplateNameandEmployeId("Sales Orders",emid,2).then(function (data) {
      templateid = data.ttemplatesettings;
      var id = templateid[0].fields.ID;    
      objDetails =  {
      type:"TTemplateSettings",
      fields:{        
                          ID:parseInt(id),                      
                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                          SettingName:"Sales Orders",
                          GlobalRef:"Sales Orders",
                          Description:$('input[name="Sales Orders_2"]').val(),
                          Template:"2",
                          Active:sales_orders == 2 ? true:false,
              }            
      }
  
      sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
  
        sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
          addVS1Data('TTemplateSettings', JSON.stringify(data));   
          count++;
          if(count >= 48)
          {
            $('.fullScreenSpin').css('display', 'none');
             swal({
              title: 'Success',
              text: 'Template Setting Saved Successfully.',
              type: 'success',
              showCancelButton: false,
              confirmButtonText: 'Done'
          
              }).then((result) => {
              if (result.value) {
                 
            
              }else if (result.dismiss === 'cancel') {
          
              }
              });
          }         
        });
  
      }).catch(function (err) {
  
        
    
      });
  
     }).catch(function (err) {
              
              objDetails =  {
              type:"TTemplateSettings",
              fields:{                                                                  
                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                          SettingName:"Sales Orders",
                          Description:$('input[name="Sales Orders_2"]').val(),
                          Template:"2",
                          Active:sales_orders == 2 ? true:false,
                      }            
              }
          
              sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
          
                sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                  addVS1Data('TTemplateSettings', JSON.stringify(data)); 
                  count++;
                  if(count >= 48)
                  {
                    $('.fullScreenSpin').css('display', 'none');
                     swal({
                      title: 'Success',
                      text: 'Template Setting Saved Successfully.',
                      type: 'success',
                      showCancelButton: false,
                      confirmButtonText: 'Done'
                  
                      }).then((result) => {
                      if (result.value) {
                         
                    
                      }else if (result.dismiss === 'cancel') {
                  
                      }
                      });
                  }           
                });
          
              }).catch(function (err) {
          
               
            
              });  

     });


     sideBarService.getTemplateNameandEmployeId("Sales Orders",emid,3).then(function (data) {
      templateid = data.ttemplatesettings;
      var id = templateid[0].fields.ID;    
      objDetails =  {
      type:"TTemplateSettings",
      fields:{        
                          ID:parseInt(id),                      
                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                          SettingName:"Sales Orders",
                          GlobalRef:"Sales Orders",
                          Description:$('input[name="Sales Orders_3"]').val(),
                          Template:"3",
                          Active:sales_orders == 3 ? true:false,
              }            
      }
  
      sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
        sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
          addVS1Data('TTemplateSettings', JSON.stringify(data));   
          count++;
          if(count >= 48)
          {
            $('.fullScreenSpin').css('display', 'none');
             swal({
              title: 'Success',
              text: 'Template Setting Saved Successfully.',
              type: 'success',
              showCancelButton: false,
              confirmButtonText: 'Done'
          
              }).then((result) => {
              if (result.value) {
                 
            
              }else if (result.dismiss === 'cancel') {
          
              }
              });
          }         
        });
       
  
      }).catch(function (err) {
  
       
    
      });
  
     }).catch(function (err) {
              
              objDetails =  {
              type:"TTemplateSettings",
              fields:{                                                                  
                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                          SettingName:"Sales Orders",
                          Description:$('input[name="Sales Orders_3"]').val(),
                          Template:"3",
                          Active:sales_orders == 3 ? true:false,
                      }            
              }
          
              sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
                sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                  addVS1Data('TTemplateSettings', JSON.stringify(data));  
                  count++;
                  if(count >= 48)
                  {
                    $('.fullScreenSpin').css('display', 'none');
                     swal({
                      title: 'Success',
                      text: 'Template Setting Saved Successfully.',
                      type: 'success',
                      showCancelButton: false,
                      confirmButtonText: 'Done'
                  
                      }).then((result) => {
                      if (result.value) {
                         
                    
                      }else if (result.dismiss === 'cancel') {
                  
                      }
                      });
                  }          
                });
                 
          
              }).catch(function (err) {
          
                 
            
              });  

     });

     // Supplier Payments  Template Section  
     
     sideBarService.getTemplateNameandEmployeId("Supplier Payments",emid,1).then(function (data) {
      templateid = data.ttemplatesettings;
      var id = templateid[0].fields.ID;    
      objDetails =  {
      type:"TTemplateSettings",
      fields:{        
                          ID:parseInt(id),                      
                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                          SettingName:"Supplier Payments",
                          GlobalRef:"Supplier Payments",
                          Description:$('input[name="Supplier Payments_1"]').val(),
                          Template:"1",
                          Active:supplier_payments == 1 ? true:false,
              }            
      }
  
      sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
        sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
          addVS1Data('TTemplateSettings', JSON.stringify(data));   
          count++;
          if(count >= 48)
          {
            $('.fullScreenSpin').css('display', 'none');
             swal({
              title: 'Success',
              text: 'Template Setting Saved Successfully.',
              type: 'success',
              showCancelButton: false,
              confirmButtonText: 'Done'
          
              }).then((result) => {
              if (result.value) {
                 
            
              }else if (result.dismiss === 'cancel') {
          
              }
              });
          }         
        });
        
  
      }).catch(function (err) {
  
        
    
      });
  
     }).catch(function (err) {
              
              objDetails =  {
              type:"TTemplateSettings",
              fields:{                                                                  
                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                          SettingName:"Supplier Payments",
                          Description:$('input[name="Supplier Payments_1"]').val(),
                          Template:"1",
                          Active:supplier_payments == 1 ? true:false,
                      }            
              }
          
              sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
                sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                  addVS1Data('TTemplateSettings', JSON.stringify(data)); 
                  count++;
                  if(count >= 48)
                  {
                    $('.fullScreenSpin').css('display', 'none');
                     swal({
                      title: 'Success',
                      text: 'Template Setting Saved Successfully.',
                      type: 'success',
                      showCancelButton: false,
                      confirmButtonText: 'Done'
                  
                      }).then((result) => {
                      if (result.value) {
                         
                    
                      }else if (result.dismiss === 'cancel') {
                  
                      }
                      });
                  }           
                });
                 
          
              }).catch(function (err) {
          
                  
            
              });  

     });


     sideBarService.getTemplateNameandEmployeId("Supplier Payments",emid,2).then(function (data) {
      templateid = data.ttemplatesettings;
      var id = templateid[0].fields.ID;    
      objDetails =  {
      type:"TTemplateSettings",
      fields:{        
                          ID:parseInt(id),                      
                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                          SettingName:"Supplier Payments",
                          GlobalRef:"Supplier Payments",
                          Description:$('input[name="Supplier Payments_2"]').val(),
                          Template:"2",
                          Active:supplier_payments == 2 ? true:false,
              }            
      }
  
      sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
        sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
          addVS1Data('TTemplateSettings', JSON.stringify(data));      
          count++;
          if(count >= 48)
          {
            $('.fullScreenSpin').css('display', 'none');
             swal({
              title: 'Success',
              text: 'Template Setting Saved Successfully.',
              type: 'success',
              showCancelButton: false,
              confirmButtonText: 'Done'
          
              }).then((result) => {
              if (result.value) {
                 
            
              }else if (result.dismiss === 'cancel') {
          
              }
              });
          }      
        });
       
  
      }).catch(function (err) {
  
        
      });
  
     }).catch(function (err) {
              
              objDetails =  {
              type:"TTemplateSettings",
              fields:{                                                                  
                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                          SettingName:"Supplier Payments",
                          Description:$('input[name="Supplier Payments_2"]').val(),
                          Template:"2",
                          Active:supplier_payments == 2 ? true:false,
                      }            
              }
          
              sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
                sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                  addVS1Data('TTemplateSettings', JSON.stringify(data));   
                  count++;
                  if(count >= 48)
                  {
                    $('.fullScreenSpin').css('display', 'none');
                     swal({
                      title: 'Success',
                      text: 'Template Setting Saved Successfully.',
                      type: 'success',
                      showCancelButton: false,
                      confirmButtonText: 'Done'
                  
                      }).then((result) => {
                      if (result.value) {
                         
                    
                      }else if (result.dismiss === 'cancel') {
                  
                      }
                      });
                  }         
                });
          
              }).catch(function (err) {
          
                  
            
              });  

     });

     sideBarService.getTemplateNameandEmployeId("Supplier Payments",emid,3).then(function (data) {
      templateid = data.ttemplatesettings;
      var id = templateid[0].fields.ID;    
      objDetails =  {
      type:"TTemplateSettings",
      fields:{        
                          ID:parseInt(id),                      
                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                          SettingName:"Supplier Payments",
                          GlobalRef:"Supplier Payments",
                          Description:$('input[name="Supplier Payments_3"]').val(),
                          Template:"3",
                          Active:supplier_payments == 3 ? true:false,
              }            
      }
  
      sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
        
        sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
          addVS1Data('TTemplateSettings', JSON.stringify(data));   
          count++;
          if(count >= 48)
          {
            $('.fullScreenSpin').css('display', 'none');
             swal({
              title: 'Success',
              text: 'Template Setting Saved Successfully.',
              type: 'success',
              showCancelButton: false,
              confirmButtonText: 'Done'
          
              }).then((result) => {
              if (result.value) {
                 
            
              }else if (result.dismiss === 'cancel') {
          
              }
              });
          }  
          
          
        });
        
  
      }).catch(function (err) {
  
        
    
      });
  
     }).catch(function (err) {
              
              objDetails =  {
              type:"TTemplateSettings",
              fields:{                                                                  
                          EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                          SettingName:"Supplier Payments",
                          Description:$('input[name="Supplier Payments_3"]').val(),
                          Template:"3",
                          Active:supplier_payments == 3 ? true:false,
                      }            
              }
          
              sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
          
                sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                  addVS1Data('TTemplateSettings', JSON.stringify(data)); 
                  count++;
                  if(count >= 48)
                  {
                    $('.fullScreenSpin').css('display', 'none');
                     swal({
                      title: 'Success',
                      text: 'Template Setting Saved Successfully.',
                      type: 'success',
                      showCancelButton: false,
                      confirmButtonText: 'Done'
                  
                      }).then((result) => {
                      if (result.value) {
                         
                    
                      }else if (result.dismiss === 'cancel') {
                  
                      }
                      });
                  }     
                });
          
              }).catch(function (err) {
          
                  
            
              });  

     });
  
      // Statements  Template Section    


       sideBarService.getTemplateNameandEmployeId("Statements",emid,1).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Statements",
                            GlobalRef:"Statements",
                            Description:$('input[name="Statements_1"]').val(),
                            Template:"1",
                            Active:statements == 1 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));    
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }        
          });
          
    
        }).catch(function (err) {
    
          
      
        });
    
       }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Statements",
                            Description:$('input[name="Statements_1"]').val(),
                            Template:"1",
                            Active:statements == 1 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));   
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }         
                  });
                   
            
                }).catch(function (err) {
            
                    
              
                });  
  
       });


       sideBarService.getTemplateNameandEmployeId("Statements",emid,2).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Statements",
                            GlobalRef:"Statements",
                            Description:$('input[name="Statements_2"]').val(),
                            Template:"2",
                            Active:statements == 2 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));  
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }          
          });
         
        }).catch(function (err) {
    
          
      
        });
    
       }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Statements",
                            Description:$('input[name="Statements_2"]').val(),
                            Template:"2",
                            Active:statements == 2 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));  
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }          
                  });
                    
            
                }).catch(function (err) {
            
                    
              
                });  
  
       });


       sideBarService.getTemplateNameandEmployeId("Statements",emid,3).then(function (data) {
       templateid = data.ttemplatesettings;
       var id = templateid[0].fields.ID;    
       objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Statements",
                            GlobalRef:"Statements",
                            Description:$('input[name="Statements_3"]').val(),
                            Template:"3",
                            Active:statements == 3 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));   
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }         
          });
    
        }).catch(function (err) {
    
          
      
        });
    
       }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Statements",
                            Description:$('input[name="Statements_3"]').val(),
                            Template:"3",
                            Active:statements == 3 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));    
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }        
                  });
                    
            
                }).catch(function (err) {
            
                    
              
                });  
  
       });
      
       // Delivery Docket  Template Section 

       sideBarService.getTemplateNameandEmployeId("Delivery Docket",emid,1).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Delivery Docket",
                            GlobalRef:"Delivery Docket",
                            Description:$('input[name="Delivery Docket_1"]').val(),
                            Template:"1",
                            Active:delivery_docket == 1 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));     
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }       
          });
          
    
        }).catch(function (err) {
    
          
      
        });
    
       }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Delivery Docket",
                            Description:$('input[name="Delivery Docket_1"]').val(),
                            Template:"1",
                            Active:delivery_docket == 1 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));   
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }         
                  });
            
                }).catch(function (err) {
            
                    
              
                });  
  
       });

       sideBarService.getTemplateNameandEmployeId("Delivery Docket",emid,2).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Delivery Docket",
                            GlobalRef:"Delivery Docket",
                            Description:$('input[name="Delivery Docket_2"]').val(),
                            Template:"2",
                            Active:delivery_docket == 2 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data)); 
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }           
          });
    
        }).catch(function (err) {
    
          
      
        });
    
       }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Delivery Docket",
                            Description:$('input[name="Delivery Docket_2"]').val(),
                            Template:"2",
                            Active:delivery_docket == 2 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));   
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }         
                  });
            
                }).catch(function (err) {
            
                    
              
                });  
  
       });

       sideBarService.getTemplateNameandEmployeId("Delivery Docket",emid,3).then(function (data) {

        $('.fullScreenSpin').css('display','none');
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Delivery Docket",
                            GlobalRef:"Delivery Docket",
                            Description:$('input[name="Delivery Docket_3"]').val(),
                            Template:"3",
                            Active:delivery_docket == 3 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));   
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }         
          });
        
          
    
        }).catch(function (err) {
          $('.fullScreenSpin').css('display','none');

    
          
      
        });
    
       }).catch(function (err) {
               $('.fullScreenSpin').css('display','none');
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                              EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                              SettingName:"Delivery Docket",
                              Description:$('input[name="Delivery Docket_3"]').val(),
                              Template:"3",
                              Active:delivery_docket == 3 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));    
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }        
                  });

             
                    
                }).catch(function (err) {
            
                    
              
                });  
  
       });

       sideBarService.getTemplateNameandEmployeId("Journal Entry",emid,1).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Journal Entry",
                            GlobalRef:"Journal Entry",
                            Description:$('input[name="Journal Entry_1"]').val(),
                            Template:"1",
                            Active:journal_entry == 1 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));     
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }       
          });
          
    
        }).catch(function (err) {
    
          
      
        });
    
       }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Journal Entry",
                            Description:$('input[name="Journal Entry_1"]').val(),
                            Template:"1",
                            Active:journal_entry == 1 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));   
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }         
                  });
            
                }).catch(function (err) {
            
                    
              
                });  
  
       });

       sideBarService.getTemplateNameandEmployeId("Journal Entry",emid,2).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Journal Entry",
                            GlobalRef:"Journal Entry",
                            Description:$('input[name="Journal Entry_2"]').val(),
                            Template:"2",
                            Active:journal_entry == 2 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data)); 
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }           
          });
    
        }).catch(function (err) {
    
          
      
        });
    
       }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Journal Entry",
                            Description:$('input[name="Journal Entry_2"]').val(),
                            Template:"2",
                            Active:journal_entry == 2 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));   
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }         
                  });
            
                }).catch(function (err) {
            
                    
              
                });  
  
       });

       sideBarService.getTemplateNameandEmployeId("Journal Entry",emid,3).then(function (data) {

        $('.fullScreenSpin').css('display','none');
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Journal Entry",
                            GlobalRef:"Journal Entry",
                            Description:$('input[name="Journal Entry_3"]').val(),
                            Template:"3",
                            Active:journal_entry == 3 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));   
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }         
          });
        
          
    
        }).catch(function (err) {
          $('.fullScreenSpin').css('display','none');

    
          
      
        });
    
       }).catch(function (err) {
               $('.fullScreenSpin').css('display','none');
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                              EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                              SettingName:"Journal Entry",
                              Description:$('input[name="Journal Entry_3"]').val(),
                              Template:"3",
                              Active:journal_entry == 3 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));    
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }        
                  });

             
                    
                }).catch(function (err) {
            
                    
              
                });  
  
       });

       sideBarService.getTemplateNameandEmployeId("Deposits",emid,1).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Deposits",
                            GlobalRef:"Deposits",
                            Description:$('input[name="Deposits_1"]').val(),
                            Template:"1",
                            Active:deposits == 1 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));     
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }       
          });
          
    
        }).catch(function (err) {
    
          
      
        });
    
       }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Deposits",
                            Description:$('input[name="Deposits_1"]').val(),
                            Template:"1",
                            Active:deposits == 1 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));   
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }         
                  });
            
                }).catch(function (err) {
            
                    
              
                });  
  
       });

       sideBarService.getTemplateNameandEmployeId("Deposits",emid,2).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Deposits",
                            GlobalRef:"Deposits",
                            Description:$('input[name="Deposits_2"]').val(),
                            Template:"2",
                            Active:deposits == 2 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data)); 
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }           
          });
    
        }).catch(function (err) {
    
          
      
        });
    
       }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Deposits",
                            Description:$('input[name="Deposits_2"]').val(),
                            Template:"2",
                            Active:deposits == 2 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));   
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }         
                  });
            
                }).catch(function (err) {
            
                    
              
                });  
  
       });

       sideBarService.getTemplateNameandEmployeId("Deposits",emid,3).then(function (data) {

        $('.fullScreenSpin').css('display','none');
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Deposits",
                            GlobalRef:"Deposits",
                            Description:$('input[name="Deposits_3"]').val(),
                            Template:"3",
                            Active:deposits == 3 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));   
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }         
          });
        
          
    
        }).catch(function (err) {
          $('.fullScreenSpin').css('display','none');

    
          
      
        });
    
       }).catch(function (err) {
               $('.fullScreenSpin').css('display','none');
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                              EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                              SettingName:"Deposits",
                              Description:$('input[name="Deposits_3"]').val(),
                              Template:"3",
                              Active:deposits == 3 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));    
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }        
                  });

             
                    
                }).catch(function (err) {
            
                    
              
                });  
  
       });

       sideBarService.getTemplateNameandEmployeId("Cheques",emid,1).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Cheques",
                            GlobalRef:"Cheques",
                            Description:$('input[name="Cheques_1"]').val(),
                            Template:"1",
                            Active:cheques == 1 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));     
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }       
          });
          
    
        }).catch(function (err) {
    
          
      
        });
    
       }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Cheques",
                            Description:$('input[name="Cheques_1"]').val(),
                            Template:"1",
                            Active:cheques == 1 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));   
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }         
                  });
            
                }).catch(function (err) {
            
                    
              
                });  
  
       });

       sideBarService.getTemplateNameandEmployeId("Cheques",emid,2).then(function (data) {
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Cheques",
                            GlobalRef:"Cheques",
                            Description:$('input[name="Cheques_2"]').val(),
                            Template:"2",
                            Active:cheques == 2 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
    
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data)); 
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }           
          });
    
        }).catch(function (err) {
    
          
      
        });
    
       }).catch(function (err) {
                
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Cheques",
                            Description:$('input[name="Cheques_2"]').val(),
                            Template:"2",
                            Active:cheques == 2 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
            
                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));   
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }         
                  });
            
                }).catch(function (err) {
            
                    
              
                });  
  
       });

       sideBarService.getTemplateNameandEmployeId("Cheques",emid,3).then(function (data) {

        $('.fullScreenSpin').css('display','none');
        templateid = data.ttemplatesettings;
        var id = templateid[0].fields.ID;    
        objDetails =  {
        type:"TTemplateSettings",
        fields:{        
                            ID:parseInt(id),                      
                            EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                            SettingName:"Cheques",
                            GlobalRef:"Cheques",
                            Description:$('input[name="Cheques_3"]').val(),
                            Template:"3",
                            Active:cheques == 3 ? true:false,
                }            
        }
    
        sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {
          sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
            addVS1Data('TTemplateSettings', JSON.stringify(data));   
            count++;
            if(count >= 48)
            {
              $('.fullScreenSpin').css('display', 'none');
               swal({
                title: 'Success',
                text: 'Template Setting Saved Successfully.',
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'Done'
            
                }).then((result) => {
                if (result.value) {
                   
              
                }else if (result.dismiss === 'cancel') {
            
                }
                });
            }         
          });
        
          
    
        }).catch(function (err) {
          $('.fullScreenSpin').css('display','none');

    
          
      
        });
    
       }).catch(function (err) {
               $('.fullScreenSpin').css('display','none');
                objDetails =  {
                type:"TTemplateSettings",
                fields:{                                                                  
                              EmployeeID:Session.get('mySessionEmployeeLoggedID'),
                              SettingName:"Cheques",
                              Description:$('input[name="Cheques_3"]').val(),
                              Template:"3",
                              Active:cheques == 3 ? true:false,
                        }            
                }
            
                sideBarService.saveTemplateSetting(objDetails).then(function (objDetails) {

                  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
                    addVS1Data('TTemplateSettings', JSON.stringify(data));    
                    count++;
                    if(count >= 48)
                    {
                      $('.fullScreenSpin').css('display', 'none');
                       swal({
                        title: 'Success',
                        text: 'Template Setting Saved Successfully.',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'Done'
                    
                        }).then((result) => {
                        if (result.value) {
                           
                      
                        }else if (result.dismiss === 'cancel') {
                    
                        }
                        });
                    }        
                  });

             
                    
                }).catch(function (err) {
            
                    
              
                });  
  
       });

      }, delayTimeAfterSound);
      },

'click .btnRefresh':function(){
  $('.fullScreenSpin').css('display', 'inline-block');
  sideBarService.getTemplateInformation(initialBaseDataLoad, 0).then(function (data) {
    addVS1Data('TTemplateSettings', JSON.stringify(data));   
    $('.fullScreenSpin').css('display', 'none'); 
    swal({
      title: 'Success',
      text: 'Template Setting Refreshed Successfully.',
      type: 'success',
      showCancelButton: false,
      confirmButtonText: 'Done'

      }).then((result) => {
      if (result.value) {
         window.location.reload();
      
      }else if (result.dismiss === 'cancel') {

      }
      });
    
  });

},


});
Template.registerHelper('equals', function(a, b) {
  return a === b;
});
