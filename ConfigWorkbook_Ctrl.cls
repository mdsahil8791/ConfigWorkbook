/*
Created By          : Girikon (Mohd Sahil)
Created On          : July 12, 2024
@description        : This is used to get all sObject and their field.
Test Class          : ConfigWorkbook_Ctrl_Test (Covarage: 100%)

Modification log --
Modified By         : 
Modified On         : 

*/
public with sharing class ConfigWorkbook_Ctrl {

    //This method is used to get the all object from the org.
    @AuraEnabled(cacheable=true)
    public static Map<String,String> getAllObjects() {
        //List<String> objectList = new List<String>();
        Map<String,String> labelVSApiName = new Map<String,String>();
        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        List<Schema.SObjectType> objectList = Schema.getGlobalDescribe().Values(); 
        for(Schema.SObjectType objType : objectList) 
        {
            if((objType.getDescribe().getName().split('__')).size() <= 2 && !(objType.getDescribe().getLabel().startswith('__'))) 
            {
                labelVSApiName.put(objType.getDescribe().getLabel(),objType.getDescribe().getName());
            }
           
        }   
        return labelVSApiName;
    }
    //This method is used to get the object's thier fields from the org.
    @AuraEnabled(cacheable=true)
    public static Map<String, List<FieldInfo>> getObjectFields(List<String> objectNames) {
        Map<String, List<FieldInfo>> objectFieldsMap = new Map<String, List<FieldInfo>>();
        
        for (String objectName : objectNames) 
        {
            List<FieldInfo> fieldInfoList = new List<FieldInfo>();
            Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectName);
            if (sObjectType != null)
            {
                Map<String, Schema.SObjectField> fieldMap = sObjectType.getDescribe().fields.getMap();
                for (String fieldName : fieldMap.keySet()) {
                    if((fieldName.split('__')).size() <= 2 && !(fieldName.startswith('__')))
                    {
                        Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldName).getDescribe();
                        FieldInfo fieldInfo = new FieldInfo();
                        fieldInfo.label = fieldDescribe.getLabel();
                        fieldInfo.apiName = fieldDescribe.getName();
                        fieldInfo.description = fieldDescribe.getInlineHelpText();
                        fieldInfo.helpText = fieldDescribe.getInlineHelpText();
                        fieldInfo.dataType = fieldDescribe.getType().name();
                        fieldInfo.calculatedFormula = fieldDescribe.getCalculatedFormula();
                        fieldInfo.defualtValue = fieldDescribe.getDefaultValue();
                        fieldInfo.digit = fieldDescribe.getDigits();
                        fieldInfo.length = fieldDescribe.getLength();
                        fieldInfo.precision = fieldDescribe.getPrecision();
                        // Get the picklist values.
                        if(fieldDescribe.getType().name() == 'PICKLIST' || fieldDescribe.getType().name() == 'MULTIPICKLIST')
                        {
                            // Create a list to store the picklist values
                            List<String> picklistValues = new List<String>();
                            List<Schema.PicklistEntry> picklistEntries = fieldDescribe.getPicklistValues();
                            //System.debug('picklist values=>'+picklistEntries);
                            // Loop through the picklist values and add them to the list
                            for (Schema.PicklistEntry entry : picklistEntries) 
                            {
                                picklistValues.add(entry.getLabel());
                            }
                            fieldInfo.pickistValues = string.join(picklistValues,';');
                        }
                        fieldInfoList.add(fieldInfo);
                    }
                   
                }
            }
            objectFieldsMap.put(sObjectType.getDescribe().getLabel(), fieldInfoList);
        }
        
        return objectFieldsMap;
    }

    // This is the wrapper class.
    public class FieldInfo {
        @AuraEnabled public String label;
        @AuraEnabled public String apiName;
        @AuraEnabled public String description;
        @AuraEnabled public String helpText;
        @AuraEnabled public String dataType;
        @AuraEnabled public String pickistValues;
        @AuraEnabled public String calculatedFormula;
        @AuraEnabled public Object defualtValue;
        @AuraEnabled public Integer digit;
        @AuraEnabled public Integer length;
        @AuraEnabled public Integer precision;
    }
}