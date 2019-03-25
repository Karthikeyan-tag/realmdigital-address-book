


var CALLFOR = {
    TABLE: 1, DISPLAY: 2, EDIT: 3
};

var DUPLICATETYPE = {
    MOBILE: 1, EMAIL: 2
};

//Message Types
var MESSAGETYPE = {
    WARNING: "warning", ERROR: "error", SUCCESS: "success", INFO: "info"
};

//Message Code
var MESSAGECODE = {
    OK: "OK", ERROR: "ERROR"
};

//Message Declaration
var _defaultErrorMsg = "There is some problem! Please try again.";
var _defaultErrorTitle = "Error";
var _defaultSuccessTitle = "Success";
var _defaultWarningTitle = "Warning";
var _defaultFirstNameRequiredMsg= "Please enter the firstname";
var _defaultEmailFormatMsg = 'Invalid email Id. Please correct and try again.';
var _defaultContactMobileAlreadyExistsMsg = 'Contact mobile already exists';
var _defaultContactEmailAlreadyExistsMsg = 'Contact email already exists';
var _defaultMobileOrEmailRequiredMsg = 'Please enter mobile or email address.';
var _defaultMobileDuplicateMsg = 'Mobile number is duplicate. Please check';
var _defaultEmailDuplicateMsg = 'Email Address is duplicate. Please check';
var _defaultValidationMsg = 'Please enter First name and Mobile/Email ID to save the contact';
var _defaultMobileNumberWithZero = 'Mobile number should starts with Zero';

//Show Message
function showMessage(title, message, messageType, shouldReload) {
    if (shouldReload) {
        swal({
            title: title,
            text: message,
            icon: messageType,
            type: messageType
        }).then(function () {
            window.location.reload();
        });

    }
    else {
        swal({
            title: title,
            text: message,
            icon: messageType,
            type: messageType
        });
    }

}

//Clear the data in the input field when add/edit
function clearInputFields() {
    $('input.clr').val('');
    $('div.clr').html('');
}

//Save Contact
function SaveContact() {
    var contactModelRequest = populateContactModal();
    if (checkMobileAndEmailDuplicate(contactModelRequest.contactMobileList, contactModelRequest.contactEmailList)) {
        if (checkEmail() && !checkMobile(contactModelRequest.contactMobileList)) {     
            if (contactModelRequest.FirstName == '' && contactModelRequest.contactMobileList.length == 0 && contactModelRequest.contactEmailList.length == 0) {
                showMessage(_defaultWarningTitle, _defaultValidationMsg, MESSAGETYPE.WARNING, false);
                return false;
            }
            else if(contactModelRequest.FirstName != '') {
                if (contactModelRequest.contactMobileList.length > 0 || contactModelRequest.contactEmailList.length > 0) {
                    $.ajax({
                        url: '/Contact/SaveContact',
                        dataType: "json",
                        type: "POST",
                        data: JSON.stringify(contactModelRequest),
                        contentType: 'application/json; charset=utf-8',
                        async: true,
                        success: function (response) {
                            if (response.messagecode == MESSAGECODE.OK) {
                                $('#addContactModal').hide();
                                showMessage(_defaultSuccessTitle, response.message, MESSAGETYPE.SUCCESS, true)
                            }
                            else {
                                showMessage(_defaultErrorTitle, response.message, MESSAGETYPE.ERROR, false);
                            }
                        },
                        error: function () {
                            showMessage(_defaultErrorTitle, _defaultErrorMsg, MESSAGETYPE.ERROR, false);
                        }
                    });
                } else {
                    showMessage(_defaultWarningTitle, _defaultMobileOrEmailRequiredMsg, MESSAGETYPE.WARNING, false)
                }
            }
            else {
                showMessage(_defaultWarningTitle, _defaultFirstNameRequiredMsg, MESSAGETYPE.WARNING, false)
            }
        }
        else
            showMessage(_defaultWarningTitle, _defaultMobileNumberWithZero, MESSAGETYPE.WARNING, false)
    }
}

//Delete Contact By ContactId
function DeleteContact(id, name) {
    swal({
        title: "Are you sure?",
        text: "You want to delete this Contact (" + name + ")?",
        icon: "warning",
        dangerMode: true,
        buttons: [
            "No","Yes"
        ],
    }).then((confirm) => {
        if (confirm) {
            $.ajax({
                url: '/Contact/DeleteContact/' + id,
                dataType: "json",
                type: "DELETE",
                async: true,
                success: function (response) {
                    if (response.messagecode == MESSAGECODE.OK) {                       
                        showMessage(_defaultSuccessTitle, response.message, MESSAGETYPE.SUCCESS, true)
                    }
                    else {
                        showMessage(_defaultErrorTitle, response.message, MESSAGETYPE.ERROR, false);
                    }
                },
                error: function (xhr) {
                    showMessage(_defaultErrorTitle, _defaultErrorMsg, MESSAGETYPE.ERROR, false);
                }
            });
        }
    });
    //
}

function EditContact(id) {
    $("#addEditContact").html("Edit Contact");
    getContact(id, CALLFOR.EDIT);
}
//Get Contact By Id
//mode =1 - Edit Contact
function getContact(contactId, tableordisplayoredit) {
    clearInputFields();
    $.ajax({
        url: '/Contact/GetContact/' + contactId,
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        async: true,
        success: function (response) {
            console.log(response);
            switch (tableordisplayoredit) {
                case 1:
                    bindTable(response.data);
                    break;
                case 2:
                    createContactView(response.data[0]);
                    break;
                default:
                    bindFieldsOnEdit(response.data[0]);
            }
        },
        error: function () {
            showMessage(_defaultErrorTitle, _defaultErrorMsg, MESSAGETYPE.ERROR, false);
        }
    });
}

//Dynamic Mobile and Email Box Generation
function addRow(callFor, value, isCheck) {
    if (value != '' && !checkDuplicate(value, callFor, isCheck)) {
        var _newTextBox = $('<input />').attr("type", "text").attr("id", "textbox").attr("readonly", "readonly").attr("maxlength", (callFor == "mobile" ? "10" : "50")).attr("name", "textbox").attr("data-role", "tagsinput").attr("class", "form-control " + (callFor == 'mobile' ? "number" : "mail")).val(value);
        var _outerDiv = $('<div />').attr("class", "outer-container");
        var _groupDiv = $('<div />').attr("class", "input-group");
        _groupDiv.append(_newTextBox).append('<span class="input-group-btn" style="cursor:pointer" onclick="return removeReadOnly(this);"><i class="material-icons success" style="color:yellow">&#xE254;</i></span><span class="input-group-btn" style="cursor:pointer" onclick="return deleteRow(this)"><i class="material-icons success" style="color:red">&#xe15c;</i></span>');
        _outerDiv.append('<label>' + callFor.toPascalCase() + '</label>').append(_groupDiv);
        $('.' + callFor + 'Container').prepend(_outerDiv);
        $('.' + callFor).val('');
    }
}

function deleteRow(e) {
    $(e).closest('.outer-container').remove();
}

function removeReadOnly(e) {
    $(e).closest('.outer-container').find('input').removeAttr('readonly')
}

String.prototype.toPascalCase = function () {
    return this
        .replace(/(\w)(\w*)/g,
            function (g0, g1, g2) { return g1.toUpperCase() + g2.toLowerCase(); });
}

//Check Duplicate Entries
function checkDuplicate(value, checkfor, isCheck) {
    var _duplicate = false;
    if (isCheck) {        
        $('.' + checkfor + 'Container').find('input').each(function (i, e) {
            if ($(e).val() == value) {
                if (checkfor == 'mobile')
                    showMessage(_defaultWarningTitle, _defaultContactMobileAlreadyExistsMsg, MESSAGECODE.WARNING, false);
                else
                    showMessage(_defaultWarningTitle, _defaultContactEmailAlreadyExistsMsg, MESSAGECODE.WARNING, false);
                _duplicate = true;
            }
        });        
    }
    return _duplicate;
}

//Check Email Format
function checkEmail() {
    debugger;
    var _invalidEmail = false;
    if ($('.emailContainer').find('input').length > 0 || $('#firstEmailAddress').val() != '') {
        var _emailAddress = $('#firstEmailAddress').val() != '' ? $('#firstEmailAddress').val() + "," : "";
        if ($('#firstEmailAddress').val() != '') {
            if (validateEmail($('#firstEmailAddress'))) {
                _emailAddress += $('#firstEmailAddress').val() + ',';
            }
            else {
                _invalidEmail = true;
                return false;
            }
        }
        $('.emailContainer').find('input').each(function (e, index) {
            if (validateEmail(this)) {
                _emailAddress += $(this).val() + ','
            }
            else {
                _invalidEmail = true;
                return false;
            }
        });
    }
    return !_invalidEmail;
}

//Populate Contact Modal
function populateContactModal() {
    var _contactModel = {
        ContactId: "",
        FirstName: "",
        LastName: "",
        contactMobileList: [],
        contactEmailList: []
    };
    //EmailAddress
    if ($('#firstEmailAddress').val() != '') {
        _contactModel.contactEmailList.push({ "EmailAddress": $('#firstEmailAddress').val() });
    }
    $('.emailContainer').find('input').each(function (e, index) {
        _contactModel.contactEmailList.push({ "EmailAddress": $(this).val() });
    });
    //MobileNumber
    if ($('#firstMobileNumber').val() != '') {        
        _contactModel.contactMobileList.push({ "MobileNumber": $('#firstMobileNumber').val() }); 
    }
    $('.mobileContainer').find('input').each(function (e, index) {
        _contactModel.contactMobileList.push({ "MobileNumber": $(this).val() });
    });
    _contactModel.ContactId = $('#hdnContactId').val();
    _contactModel.FirstName = $('#firstName').val();
    _contactModel.LastName = $('#lastName').val();
    return _contactModel;
}

//Create Contact View
function createContactView(data) {
    $('#viewType').html(data.FirstName + ' ' + ((data.LastName == null) ? "" : data.LastName));
    $('#viewemailmobilebody').html('');
    mobileAndEmailList = '<div>';
    mobileAndEmailList += '<div>Mobile</div></br>';
    if (data.contactMobileList.length > 0) {
        $.each(data.contactMobileList, function (index, item) {
            mobileAndEmailList += '<span class="badge" style="font-size:15px;margin-bottom:5px;">' + item.MobileNumber + '</span> &nbsp;';
        });
    }
    else {
        mobileAndEmailList += 'Nil</br>';
    }
    mobileAndEmailList += '</br> <div>Email</div></br > ';
    if (data.contactEmailList.length > 0) {
        $.each(data.contactEmailList, function (index, item) {
            mobileAndEmailList += '<span class="badge" style="font-size:15px;margin-bottom:5px;">' + item.EmailAddress + '</span> &nbsp;';
        });
    }
    else {
        mobileAndEmailList += 'Nil';
    }
    mobileAndEmailList += '</div>';
    $('#viewemailmobilebody').append(mobileAndEmailList);
}

//Bind the Contact List
function bindTable(data) {
    $('#tblContact').DataTable({
        "responsive": true,
        "searching": true,
        "pageLength": 5,
        "language": {
            "searchPlaceholder": "Search Contact",
            "emptyTable": "No contact(s) available"
        },
        data: data,
        columns: [
            { 'data': 'FirstName' },
            { 'data': 'LastName' },
            { 'data': 'ContactId', "sClass": "hide_column", "searchable": false },
            {
                "data": "contactMobileList",
                "sClass": "hide_column",
                "render": function (data) {
                    var _mobileList = '';
                    if (data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].MobileNumber != '')
                                _mobileList = _mobileList + data[i].MobileNumber + ',';
                        }
                        if (_mobileList != '' && _mobileList.length > 1)
                            _mobileList = _mobileList.substring(0, _mobileList.length - 1);
                    }
                    return _mobileList;
                }
            },
            {
                "data": "contactEmailList",
                "sClass": "hide_column",
                "render": function (data) {
                    var _emailList = '';
                    if (data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].EmailAddress != '')
                                _emailList = _emailList + data[i].EmailAddress + ',';
                        }
                        if (_emailList != '' && _emailList.length > 1)
                            _emailList = _emailList.substring(0, _emailList.length - 1);
                    }
                    return _emailList;
                }
            },
            {
                "data": "ContactId",
                "searchable": false,
                "render": function (data, type, row, meta) {
                    data = '<a href="#viewEmailMobileModal" class="view" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="View" onclick="return getContact(' + data + ',' + CALLFOR.DISPLAY + ')">&#xe417;</i></a>&nbsp;<a href="#addContactModal" class="edit" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Edit" onclick="return EditContact(' + data + ')">&#xE254;</i></a> &nbsp; <a href="#" class="delete" onclick="return DeleteContact(\'' + row.ContactId + '\',\'' + row.FirstName + " " + ((row.LastName == null) ? "" : row.LastName) + '\')"><i class="material-icons" data-toggle="tooltip" title="Delete">&#xE872;</i></a>';
                    return data;
                }
            }
        ],
        "order": [2, 'desc']
    });
}

//Bind Fields on Edit
function bindFieldsOnEdit(data) {
    $('#firstName').val(data.FirstName);
    $('#lastName').val(data.LastName);
    $('#hdnContactId').val(data.ContactId);
    //Bind Mobile Details
    if (data.contactMobileList.length > 0) {
        $.each(data.contactMobileList, function (index, item) {
            addRow('mobile', item.MobileNumber,false)
        });
    }
    //Bind Email Details
    if (data.contactEmailList.length > 0) {
        $.each(data.contactEmailList, function (index, item) {
            addRow('email', item.EmailAddress, false)
        });
    }
}

//Validate Email Address
function checkEmailAddressinDataBase(e, isNewRow) {
    var _emailAddress = $(e).val();
    if (_emailAddress != '') {
        var _contactId = $('#hdnContactId').val() == '' ? 0 : $('#hdnContactId').val();
        if (validateEmail(e)) {
            $.ajax({
                url: '/Contact/ValidateEmailAddress',
                dataType: "json",
                type: "POST",
                data: '{"contactId":' + _contactId + ',"emailAddress":"' + _emailAddress + '"}',
                contentType: 'application/json; charset=utf-8',
                async: true,
                success: function (response) {
                    if (response.messagecode == MESSAGECODE.ERROR) {
                        showMessage(_defaultWarningTitle, response.message, MESSAGETYPE.ERROR, false);
                    }
                    else {
                        if (isNewRow)
                            return addRow('email', $('.email').val(), true);
                    }
                },
                error: function () {
                    showMessage(_defaultErrorTitle, _defaultEmailFormatMsg, MESSAGETYPE.ERROR, false);
                }
            });
        }
    }
}

//Validate Mobile
function validateMobile(mobileNumber,isNewRow) {
    if (mobileNumber != '') {
        if (validateMobileNumberWithLeadingZero(mobileNumber)) {
            var _contactId = $('#hdnContactId').val() == '' ? 0 : $('#hdnContactId').val();
            $.ajax({
                url: '/Contact/ValidateMobile',
                dataType: "json",
                type: "POST",
                data: '{"contactId":' + _contactId + ',"mobileNumber":"' + mobileNumber + '"}',
                contentType: 'application/json; charset=utf-8',
                async: true,
                success: function (response) {
                    if (response.messagecode == MESSAGECODE.ERROR) {
                        showMessage(_defaultWarningTitle, response.message, MESSAGETYPE.ERROR, false);
                    }
                    else {
                        if(isNewRow)
                            addRow('mobile', $('.mobile').val(), true);
                    }
                },
                error: function () {
                    showMessage(_defaultErrorTitle, _defaultErrorMsg, MESSAGETYPE.ERROR, false);
                }
            });
        }
        else {
            showMessage(_defaultWarningTitle, _defaultMobileNumberWithZero, MESSAGETYPE.WARNING, false);
        }
    }
}

//Check Duplicate Mobile and Email are entered
function checkMobileAndEmailDuplicate(mobileList, emailList) {
    var _duplicateMobileArray = [];
    var _duplicateEmailArray = [];
    var _mobileArray = [];
    var _emailArray = [];

    $.each(mobileList, function (index, value) {
        if ($.inArray(value.MobileNumber, _mobileArray) == -1) {
            _mobileArray.push(value.MobileNumber);
        }
        else
            _duplicateMobileArray.push(value.MobileNumber);
    });
    
    $.each(emailList, function (index, value) {
        if ($.inArray(value.EmailAddress, _emailArray) == -1) {
            _emailArray.push(value.EmailAddress);
        }
        else
            _duplicateEmailArray.push(value.MobileNumber);
    });

    if (_duplicateMobileArray.length == 0 && _duplicateEmailArray.length == 0) {
        return true;
    }
    else if (_duplicateMobileArray.length > 0) {
        showMessage(_defaultWarningTitle, _defaultMobileDuplicateMsg, MESSAGECODE.WARNING, false);
        return false;
    }
    else if (_defaultEmailDuplicateMsg.length > 0) {
        showMessage(_defaultWarningTitle, _defaultEmailDuplicateMsg, MESSAGECODE.WARNING, false);
        return false;
    }
}

//Validate Mobile Number are starts with Zero
function validateMobileNumberWithLeadingZero(mobileNumber) {
    var _result = false;
    if (mobileNumber.charAt(0) == '0') {
        _result = true;
    }
    return _result;
}

//Check Mobile are starts with zero
function checkMobile(mobileList) {
    var _isInValid = false;
    if (mobileList.length > 0) {
        $.each(mobileList, function (index, value) {
            if (!validateMobileNumberWithLeadingZero(value.MobileNumber)) {
                _isInValid = true;
                return;
            }
        });
    }
    return _isInValid;
}
