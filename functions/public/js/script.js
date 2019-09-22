$(document).ready(function() {
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": true,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "2500",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    $('.lockAvailability').click(function() {
        var thisLock = $(this);
        var lockId = $(this).closest('.card').data('lockId');
        var lockName = $(this).closest('.card-header').find('.lockName').html();
        var lockToken = $(this).closest('.card').data('accessToken');
        if ($(this).hasClass('lockAvailable')) {
            $.ajax({
                url: 'http://sharelock-env.febqyyh3ip.us-east-2.elasticbeanstalk.com/locks/' + lockId,
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                processData: false,
                data: JSON.stringify({ 
                    "status": 'DISABLED',
                    "token": lockToken
                }),
                success: function(data) {
                    if (!data.hasOwnProperty('error')) {
                        thisLock.addClass('lockBricked').removeClass('lockAvailable');
                        thisLock.prop('title', 'Lock Secured');
                        thisLock.find('.fa-unlock-alt').removeClass('fa-unlock-alt').addClass('fa-lock');
                        toastr.warning(lockName + ' has been secured.');
                    } else {
                        toastr.error('Error securing ' + lockName);
                    }
                }
            });
        } else if ($(this).hasClass('lockBricked')) {
            $.ajax({
                url: 'http://sharelock-env.febqyyh3ip.us-east-2.elasticbeanstalk.com/locks/' + lockId,
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                processData: false,
                data: JSON.stringify({ 
                    "status": 'LOCKED',
                    "token": lockToken
                }),
                success: function(data) {
                    if (!data.hasOwnProperty('error')) {
                        thisLock.addClass('lockAvailable').removeClass('lockBricked');
                        thisLock.prop('title', 'Lock Available');
                        thisLock.find('.fa-lock').removeClass('fa-lock').addClass('fa-unlock-alt');
                        toastr.success(lockName + ' is now available.');
                    } else {
                        toastr.error('Error enabling ' + lockName);
                    }
                }
            });
        }
    });

    $('.datePicker').datetimepicker({
        minDate: moment()
    });

    $('.editKeyForLock').click(function() {
        var editForm = $('#editKeyModal').find('.editKeyForm');
        editForm.find('input[name="keyId"]').val($(this).closest('.lockKeyRow').data('keyId'));
        editForm.find('.editKeyNameInput').val($(this).closest('.lockKeyRow').find('.lockKeyName').html());
        editForm.find('.datePicker').data("DateTimePicker").date(moment($(this).closest('.lockKeyRow').find('.lockKeyExpiry').html().replace(/\//ig, '-'), "MM-DD-YYYY HH:mm"));
        $('#editKeyModal').modal('show');
    });

    $('#addKeyModal, #addLockModal').on('hidden.bs.modal', function (e) {
        $(this).find('input').each(function() {
            $(this).val('');
        });
    });

    $('#addKeyModal').on('hidden.bs.modal', function (e) {
        $('.addKeyForm').find('input[name="phoneNumber"]')[0].style.borderColor = null;
    });

    $('.addLockSubmit').click(function() {
        var newLockArray = $('.addDeviceForm').serializeArray();
        var newLock = {};
        var userId = null;
        for (var i = 0;  i < newLockArray.length; i++) {
            if (newLockArray[i].name === 'userId') {
                userId = newLockArray[i].value;
            } else {
                newLock[newLockArray[i].name] = newLockArray[i].value;
            }
        }
        modalLoading('#addLockModal', '.addLockSubmit', true);
        $.ajax({
            url: 'http://sharelock-env.febqyyh3ip.us-east-2.elasticbeanstalk.com/users/' + userId + '/locks',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            processData: false,
            data: JSON.stringify(newLock),
            success: function(data) {
                if (!data.hasOwnProperty('error')) {
                    location.reload();
                } else {
                    toastr.error('Error adding new lock ' + newLock.name);
                }
            }
        });
    });

    $('.addKeySubmit').click(function() {
        $('.addKeyForm').find('input[name="phoneNumber"]').css('border-color', null);
        var newKeyArray = $('.addKeyForm').serializeArray();
        var newKey = {};
        var phoneNumber = null;
        for (var i = 0;  i < newKeyArray.length; i++) {
            if (newKeyArray[i].name === 'phoneNumber') {
                phoneNumber = newKeyArray[i].value;
            } else {
                newKey[newKeyArray[i].name] = newKeyArray[i].value;
            }
        }
        if (newKey.expiryTime) {
            newKey.expiryTime = moment(newKey.expiryTime).valueOf();
        }
        modalLoading('#addLockModal', '.addLockSubmit', true);
        $.ajax({
            url: 'http://sharelock-env.febqyyh3ip.us-east-2.elasticbeanstalk.com/users/search/' + phoneNumber,
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            processData: false,
            success: function(data) {
                if (data) {
                    if (!data.hasOwnProperty('error')) {
                        newKey.userId = data.id;
                        $.ajax({
                            url: 'http://sharelock-env.febqyyh3ip.us-east-2.elasticbeanstalk.com/keys',
                            type: 'POST',
                            contentType: 'application/json; charset=utf-8',
                            dataType: 'json',
                            processData: false,
                            data: JSON.stringify(newKey),
                            success: function(data) {
                                if (!data.hasOwnProperty('error')) {
                                    location.reload();
                                } else {
                                    toastr.error('Error adding new key.');
                                }
                            }
                        });
                    } else {
                        toastr.error('Error add new lock ' + newKey.name);
                    }
                } else {
                    $('.addKeyForm').find('input[name="phoneNumber"]')[0].style.borderColor = 'red';
                }
            }
        });
    });

    $('.editKeySubmit').click(function() {
        var editKeyArray = $('.editKeyForm').serializeArray();
        var editKey = {};
        var keyId = null;
        for (var i = 0;  i < editKeyArray.length; i++) {
            if (editKeyArray[i].name === 'keyId') {
                keyId = editKeyArray[i].value;
            } else {
                editKey[editKeyArray[i].name] = editKeyArray[i].value;
            }
        }
        if (editKey.newExpiry) {
            editKey.newExpiry = moment(editKey.newExpiry).valueOf();
        }
        modalLoading('#addLockModal', '.addLockSubmit', true);
        $.ajax({
            url: 'http://sharelock-env.febqyyh3ip.us-east-2.elasticbeanstalk.com/keys/' + keyId,
            type: 'PUT',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            processData: false,
            data: JSON.stringify(editKey),
            success: function(data) {
                if (!data.hasOwnProperty('error')) {
                    location.reload();
                } else {
                    toastr.error('Error modifying key.');
                }
            }
        });
    });

    function modalLoading(modalId, submitButton, enableLoading) {
        var modalButtons = $(modalId).find('button');
        if (enableLoading) {
            modalButtons.addClass('disabled');
            $(submitButton).html('<span class="spinner-border" role="status"><span class="sr-only">Loading...</span></span>');
        } else {
            modalButtons.removeClass('disabled');
            $(submitButton).html('Submit');
        }
    }
});