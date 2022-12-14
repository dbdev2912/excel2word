const submitData = {
    data: [],
    valueField: "",
    labelField: "",
    aspect: {
        x: 3,
        y: 4,
        inches: 2,
    },
    with_index: false,
    export_name: "",
    setData: function(newData){
        this.data = newData;
    },
    setValueField: function(field){
        this.valueField = field;
    },
    setLabelField: function(field){
        this.labelField = field;
    },
    setAspect: function(x, y, inches){
        this.aspect = { x, y, inches };
    },
    setIndex: function( is_indexed ){
        this.with_index = is_indexed;
    },
    setExportName: function(name){
        this.export_name = name;
    },
    getAll: function(){
        return {
            data: this.data,
            valueField: this.valueField,
            labelField: this.labelField,
            aspect: this.aspect,
            with_index: this.with_index,
            export_name: this.export_name
        }
    }
}


$('#submit').click(function(){

    $("#value-field").text(submitData.valueField);
    $("#label-field").text(submitData.labelField);
    $('.aspect')[0].click();
    $("#confirm-box").css({
        display: "flex",
    });
});

$('#submit-data').click( function(){
    let exportName = $('#export-file-name').val();
    if(exportName){
        if( exportName.slice( exportName.length - 5) !==".docx" ){
            exportName += ".docx";
        }
    }
    submitData.setExportName(exportName);
    const data = submitData.getAll();
    const csrf = $("#csrf").attr("csrf");
    console.log(data);
    $.ajax({
        url: "/api/generate",
        method: "POST",
        data: {
            "sheet": JSON.stringify(data) ,
            csrfmiddlewaretoken: csrf
        },
        success: function(res){
            console.log(res)
        }
    })
})

$('#fake-bg-content-box').click(function(){
    $("#confirm-box").hide()
})

const ExcelToJSON = function() {

    this.parseExcel = function(file) {
        var reader = new FileReader();

        reader.onload = function(e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, {
                type: 'binary'
            });

            let wb = [];

            const sheets = workbook.SheetNames;
            sheets.forEach(function(sheetName) {
                var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                var json_object = JSON.stringify(XL_row_object);

                wb.push({ sheet: sheetName, data: JSON.parse(json_object) })
            })
            choseFileHide()
            filExporter(wb)
            setSheet(wb[0])
        };

        reader.onerror = function(ex) {
            console.log(ex);
        };

        reader.readAsBinaryString(file);
    };
};

function choseFileHide(){
    $("#chosing-file").hide();
}

function showContextMenu(element, offsetX, offsetY){
    $('#ctx-menu').show();
    $('#ctx-menu .menu').css({
        top: `${offsetY}px`,
        left: `${offsetX}px`
    });

    $('#QRlabel').off('click');
    $('#QRlabel').click( function(){
        ctxClose()
        submitData.setLabelField($(element).text())
    });

    $('#QRvalue').off('click');
    $('#QRvalue').click( function(){
        ctxClose()
        submitData.setValueField($(element).text())
    });
}

$('.aspect').click(function(){
    $('.aspect .dot').hide();
    $(this).find('.dot').css({
        display: "block"
    });

    let x = parseInt($(this).attr("x"));
    let y = parseInt($(this).attr("y"));
    let inches = parseInt($(this).attr("inches"));
    submitData.setAspect(
        x, y, inches
    )
})

$('.index').click(function(){
    let state = $(this).attr('state');
    let newState;
    if(state === "true"){
        submitData.setIndex(false);
        newState = "false";
        $(this).find('.dot').hide();
    }else{
        submitData.setIndex(true);
        newState = "true";
        $(this).find('.dot').css({
            display: "block"
        });
    }

    $(this).attr("state", newState);
})

$('#ctx-menu-close').click(function(){
    $('.floating-context-menu').hide();
})

function ctxClose(){
    $('#ctx-menu-close').click();
}


function setSheet(dataObject){
    $('#table-head').html(``);
    $('#table-body').html(``);
    $("#drop-button").text(dataObject.sheet);
    submitData.setLabelField("");
    submitData.setValueField("");

    let keys = [];
    let data = dataObject["data"];
    submitData.setData(data);
    if( data.length > 0 ){
        keys = Object.keys(data[0])
    }

    for( let i = 0; i < keys.length; i++ ){
        $("#table-head").append(`
            <th>${keys[i]}</th>
        `);

    }
    $("#table-head th").contextmenu(function(e) {
        e.preventDefault();
        showContextMenu(e.target, e.pageX, e.pageY);
    })
    for( let i = 0; i < data.length ; i++){
        let rowData = data[i];
        let rowElement = document.createElement("tr");

        for( let j = 0; j < keys.length; j++){
            $(rowElement).append(`
                <td>${rowData[keys[j]]}</td>
            `);
        }
        $('#table-body').append(rowElement);
    }
}

function initiateTableView(){

    let height = $('#container').height() - ( $('#title-box').height() + $('#button-group').height() );

    $(".table-view").css({
        height: `${height - 36}px`
    })
}

function filExporter(data){
    $("#file-exporter").show();
    initiateTableView();
    let dropBoxState = 0;

    for( let i = 0; i < data.length; i++){
        $('#drop-items').append(
            `
                <div class="item" index="${i}">
                    <span>${data[i].sheet}</span>
                </div>
            `
        );
    }

    $('#drop-items .item').click(function(){
        let index = parseInt($(this).attr("index"));
        $('#drop-button').click();
        setSheet(data[index]);
    })

    $('#drop-button').click(function(){

        let height = 0;
        if( !dropBoxState ){
            height = 200;
        }
        $('#drop-box').css({
            height: `${height}px`
        });
        dropBoxState = ! dropBoxState;
    })
}

$('#file-input').change( function(e){
    const files = e.target.files;
    if( files ){
        const file = files[0];
        $('#file-name').text(`${file.name}`);
        const parser = new ExcelToJSON()
        parser.parseExcel(file);
    }
})

$("#fake-btn").click( function(){
    $('#file-input').click()
})
