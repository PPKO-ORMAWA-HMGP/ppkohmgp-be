exports.validatePhoneNumber = (phoneNumber) => {
    if(phoneNumber === undefined) return `Phone number is required`;
    if(phoneNumber.length < 10 || phoneNumber.length > 13) return `Phone number must be between 10 and 13 digits`;
    if(phoneNumber[0] !== '0') return `Phone number must start with 0`;
    if(phoneNumber.match(/[^0-9]/)) return `Phone number must only contain numbers`;
    return true;
}