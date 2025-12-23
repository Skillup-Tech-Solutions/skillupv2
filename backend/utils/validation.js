const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const MOBILE_REGEX = /^\d{10}$/;

const validateName = (name) => {
    if (!name || name.length < 3) {
        return "Name must be at least 3 characters long";
    }
    return null;
};

const validatePassword = (password) => {
    if (!password || password.length < 6) {
        return "Password must be at least 6 characters";
    }
    return null;
};

const validateEmail = (email) => {
    if (!email || !EMAIL_REGEX.test(email)) {
        return "Invalid Email Address";
    }
    return null;
};

const validateMobile = (mobile) => {
    if (!mobile || !MOBILE_REGEX.test(mobile)) {
        return "Mobile number must be exactly 10 digits";
    }
    return null;
};

module.exports = {
    EMAIL_REGEX,
    MOBILE_REGEX,
    validateName,
    validatePassword,
    validateEmail,
    validateMobile
};
