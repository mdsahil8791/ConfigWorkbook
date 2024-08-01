import { LightningElement, wire, track } from 'lwc';
import getAllObjects from '@salesforce/apex/ConfigWorkbook_Ctrl.getAllObjects';
import getObjectFields from '@salesforce/apex/ConfigWorkbook_Ctrl.getObjectFields';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { loadScript } from 'lightning/platformResourceLoader';
import xlsx from '@salesforce/resourceUrl/xlsx';

export default class ConfigWorkbookComponent extends LightningElement {
    @track availableOptions = [];
    @track selectedOptions = [];
    @track fieldsData = [];
    @track isSpinner = false;
    @track isXlsxLoaded = false;
    workbook;

    columnHeader = ['Field Name', 'API Name', 'Data Type', 'Description', 'Help Text', 'Picklist Values', 'Calculated Formula' , 'Default Value', 'Digit', 'Length', 'Precision'];

    renderedCallback() {
        console.log('renderedCallback');
        if (this.isXlsxInitialized) {
            //console.log('renderedCallback');
            return;
        }

        this.isSpinner = true;

        loadScript(this, xlsx)
            .then(() => {
                this.isXlsxInitialized = true;
                this.isSpinner = false;
                console.log('XLSX library loaded successfully');
                this.workbook = XLSX.utils.book_new();
            })
            .catch(error => {
                this.isXlsxInitialized = false;
                this.isSpinner = false;
                console.error('Error loading XLSX library:', error);
                this.showErrorToast('Error loading XLSX library');
            });
    }

    @wire(getAllObjects)
    wiredObjects({ error, data }) {
        this.isSpinner = true;
        if (data) {
            this.isSpinner = false;
            //console.log('object without sort=>',JSON.stringify(data));
            let msg = 'All object retrieve successfully from the org!';
            this.showSuccessToast(msg);
            for(let key in data) 
                {
                  if (Object.hasOwn(data, key)) 
                  {
                    this.availableOptions.push({"label":key,"value":data[key]});                    
                   }
                }
            
            this.availableOptions.sort((a, b) => a.label.localeCompare(b.label));
            //console.log('object with sort=>',JSON.stringify(this.availableOptions));
            
        } else if (error) {
            this.isSpinner = false;
            console.error('Error fetching objects:', error);
            this.showErrorToast(error.body.message);
        }
    }

    handleSelectionChange(event) {
        this.selectedOptions = event.detail.value;
        //console.log('Selected oprtion=>',JSON.stringify(this.selectedOptions));
        //this.fetchFieldsData();
    }

    handleDocument()
    {
        if(this.selectedOptions.length >0)
        {
            this.fetchFieldsData();
        }
        else
        {
            //alert('Please select atleast one object from the available list');
            this.showErrorToast('Please select at least one object from the available list');
        }
    }
     

    fetchFieldsData() {
        if (this.selectedOptions.length > 0) {
            this.isSpinner = true;
            getObjectFields({ objectNames: this.selectedOptions })
                .then(result => {
                    this.fieldsData = result;
                    //console.log('field data=>'+ JSON.stringify(this.fieldsData));
                    for(let key in this.fieldsData) 
                    {
                        if (Object.hasOwn(this.fieldsData, key)) 
                        {
                        let msg = 'Download started, please wait for a while.';
                        this.showSuccessToast(msg);
                        // console.log('Key=>',key);
                        // console.log('Key length=>',key.length);
                        //this.exportData(key,JSON.parse(JSON.stringify(this.fieldsData[key])));
                        //object name should be contains 31 charecter max.             
                        this.addSheetToWorkbook(key.length > 31 ? key.substring(0, 31):key , JSON.parse(JSON.stringify(this.fieldsData[key])));
                        }
                    }
                    this.isSpinner = false;
                    this.downloadWorkbook();
                })
                .catch(error => {
                    this.isSpinner = false;
                    console.error('Error fetching fields:', error);
                    if(error)
                    {
                        this.showErrorToast(error.message);
                    }
                    else{
                        this.showErrorToast(error);
                    }
                });
        } else {
            this.fieldsData = [];
        }
    }
    // This funciton used to create a excel sheet.
    // exportData(objectName, objectFields){
    //     var element;
    //     console.log('Object Name==>',objectName,'==And their fields==>',objectFields);
    //     // Prepare a html table
    //     let doc = '<table>';
    //     // Add styles for the table
    //     doc += '<style>';
    //     doc += 'table, td,th {';
    //     doc += '    border: 1px solid black;';
    //     doc += '    border-collapse: collapse;';
    //     doc += '}';          
    //     // doc += 'th {';
    //     // doc += '    background-color: plum;'; 
    //     // doc += '    color: white;';
    //     // doc += '}';
    //     doc += '</style>';
    //     // Add all the Table Headers
    //     doc += '<tr>';
    //     this.columnHeader.forEach(columnItem => {            
    //         doc += '<th bgcolor=#76a6f5>'+ columnItem +'</th>'           
    //     });
    //     doc += '</tr>';
    //     // Add the data rows
    //     objectFields.forEach(item => {
    //         doc += '<tr>';
    //         doc += '<th>'+item.label+'</th>'; 
    //         doc += '<th>'+item.apiName+'</th>'; 
    //         doc += '<th>'+item.dataType+'</th>';
    //         doc += item.description?'<th>'+item.description+'</th>':'<th></th>'; 
    //         doc += item.helpText?'<th>'+item.helpText+'</th>':'<th></th>';
    //         doc += item.pickistValues?'<th>'+item.pickistValues+'</th>':'<th></th>'; 
    //         doc += '</tr>';
    //     });
    //     doc += '</table>';
    //     element = 'data:application/vnd.ms-excel,' + encodeURIComponent(doc);
    //     let downloadElement = document.createElement('a');
    //     downloadElement.href = element;
    //     downloadElement.target = '_self';
    //     // use .csv as extension on below line if you want to export data as csv
    //     downloadElement.download = objectName+' Object.xls';
    //     document.body.appendChild(downloadElement);
    //     downloadElement.click();
    // }

    addSheetToWorkbook(objectName, objectFields) {
        //console.log('Object Name==>', objectName, '==And their fields==>', objectFields);

        const data = [this.columnHeader];
        objectFields.forEach(item => {
            data.push([
                item.label,
                item.apiName,
                item.dataType,
                item.description || '',
                item.helpText || '',
                item.pickistValues || '',
                item.calculatedFormula || '',
                item.defualtValue || '',
                item.digit || '',
                item.length || '',
                item.precision || ''

            ]);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(data);
        // console.log('worksheet=>',worksheet);
        // // Make the headers bold
        // const range = XLSX.utils.decode_range(worksheet['!ref']);
        // for (let col = range.s.c; col <= range.e.c; col++) {
        //     const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        //     if (!worksheet[cellAddress]) continue;
        //     if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
        //     worksheet[cellAddress].s.font = { bold: true };
        // }
         // Check if the sheet already exists and remove it if it does
        if (this.workbook.SheetNames.includes(objectName)) 
        {
            const index = this.workbook.SheetNames.indexOf(objectName);
            this.workbook.SheetNames.splice(index, 1);
            delete this.workbook.Sheets[objectName];
        }

        XLSX.utils.book_append_sheet(this.workbook, worksheet, objectName);
    }

    downloadWorkbook() {
        const wbout = XLSX.write(this.workbook, { bookType: 'xlsx', type: 'binary' });
        const blob = new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Objects_Workbook.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
    }

    showSuccessToast(msg) {
        const event = new ShowToastEvent({
            //title: 'Toast message',
            message: msg,
            variant: 'success',
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }
  
    showErrorToast(errorMsg) {
        const evt = new ShowToastEvent({
            //title: 'Toast Error',
            message: errorMsg,
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }
}